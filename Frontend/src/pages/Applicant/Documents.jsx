/**
 * Documents Management Page
 * Upload and manage application documents based on submitted applications
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaIdCard, FaHome, FaDollarSign, FaFileAlt, FaUpload, FaTimes, FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import { applicationAPI, documentAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import PrimaryButton from '../../components/Button/PrimaryButton';
import SecondaryButton from '../../components/Button/SecondaryButton';
import FileUpload from '../../components/Input/FileUpload';
import Spinner from '../../components/Loader/Spinner';
import NoData from '../../components/EmptyState/NoData';
import './Documents.css';

function Documents() {
  const { setToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render trigger
  
  // Debug render counter
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(`🔄 Documents component render #${renderCount.current}`);
  
  // Prevent duplicate operations
  const operationInProgress = useRef(false);

  // Document requirements based on application purpose
  const documentRequirements = {
    'income_certificate': [
      { type: 'aadhaar', name: 'Aadhaar Card', required: true },
      { type: 'address_proof', name: 'Address Proof (Domicile/Residence Certificate)', required: true },
      { type: 'income_proof', name: 'Income Documents (Salary Slips/Bank Statements)', required: true },
      { type: 'other', name: 'Employment Certificate/Business Proof', required: false }
    ],
    'residence_certificate': [
      { type: 'aadhaar', name: 'Aadhaar Card', required: true },
      { type: 'address_proof', name: 'Electricity Bill/Water Bill/Rent Agreement', required: true },
      { type: 'other', name: 'Voter ID/Driving License', required: false }
    ],
    'caste_certificate': [
      { type: 'aadhaar', name: 'Aadhaar Card', required: true },
      { type: 'address_proof', name: 'Domicile Certificate', required: true },
      { type: 'other', name: 'Family Caste Certificate (if available)', required: false },
      { type: 'other', name: 'School/College Certificate', required: false }
    ],
    'character_certificate': [
      { type: 'aadhaar', name: 'Aadhaar Card', required: true },
      { type: 'address_proof', name: 'Address Proof', required: true },
      { type: 'other', name: 'Educational Certificate', required: false }
    ],
    'other': [
      { type: 'aadhaar', name: 'Aadhaar Card', required: true },
      { type: 'address_proof', name: 'Address Proof', required: true },
      { type: 'other', name: 'Supporting Documents', required: false }
    ]
  };

  useEffect(() => {
    fetchApplicationsAndDocuments();
  }, []);

  const fetchApplicationsAndDocuments = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getMyApplications();
      
      if (response.data.success) {
        const apps = response.data.applications || [];
        setApplications(apps);
        
        // Calculate required documents based on submitted applications
        const requiredDocs = calculateRequiredDocuments(apps);
        setRequiredDocuments(requiredDocs);
        
        // Fetch documents for each application using new document API
        const docsData = {};
        for (const app of apps) {
          try {
            const docResponse = await documentAPI.getApplicationDocuments(app.applicationId);
            if (docResponse.data.success) {
              docsData[app.applicationId] = docResponse.data.documents || [];
            }
          } catch (error) {
            console.error(`Error fetching documents for ${app.applicationId}:`, error);
          }
        }
        setUploadedDocuments(docsData);
      }
    } catch (error) {
      setToast({
        message: error.response?.data?.error || 'Failed to fetch applications',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateRequiredDocuments = (applications) => {
    const docMap = new Map();
    
    applications.forEach(app => {
      const purpose = app.purpose || 'other';
      const requirements = documentRequirements[purpose] || documentRequirements['other'];
      
      requirements.forEach(doc => {
        const key = `${doc.type}-${doc.name}`;
        if (!docMap.has(key)) {
          docMap.set(key, {
            ...doc,
            applications: [app.applicationId],
            applicationsCount: 1
          });
        } else {
          const existing = docMap.get(key);
          existing.applications.push(app.applicationId);
          existing.applicationsCount++;
          existing.required = existing.required || doc.required;
        }
      });
    });

    // Group by document type for better organization
    const grouped = {
      identity: [],
      address: [],
      purpose_specific: [],
      supporting: []
    };

    Array.from(docMap.values()).forEach(doc => {
      if (doc.type === 'aadhaar') {
        grouped.identity.push(doc);
      } else if (doc.type === 'address_proof') {
        grouped.address.push(doc);
      } else if (doc.type === 'income_proof') {
        grouped.purpose_specific.push(doc);
      } else {
        grouped.supporting.push(doc);
      }
    });

    return grouped;
  };

  const handleFileSelect = (documentType, files) => {
    const fileArray = Array.isArray(files) ? files : [files];
    setSelectedFiles(prev => ({
      ...prev,
      [documentType]: fileArray
    }));
  };

  const handleUpload = useCallback(async (documentType) => {
    const files = selectedFiles[documentType];
    if (!files || files.length === 0) return;

    // Strict duplicate prevention
    if (operationInProgress.current || uploading) {
      console.log('⚠️ Upload operation already in progress, blocking duplicate');
      return;
    }

    try {
      console.log(`📤 Starting upload for: ${documentType}`);
      operationInProgress.current = true;
      setUploading(true);
      
      // Get applications that need this document type
      const targetApplications = applications.filter(app => {
        const purpose = app.purpose || 'other';
        const requirements = documentRequirements[purpose] || documentRequirements['other'];
        return requirements.some(req => req.type === documentType);
      });
      
      if (targetApplications.length === 0) {
        setToast({ message: 'No applications found that require this document type', type: 'error' });
        return;
      }

      // Upload each file
      let uploadedDocs = []; // Track uploaded documents for immediate UI update
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('documentType', documentType);
        formData.append('applicationIds', JSON.stringify(targetApplications.map(app => app.applicationId)));
        formData.append('comments', `Uploaded: ${file.name} for ${documentType.replace('_', ' ')}`);

        console.log(`📤 Uploading file: ${file.name}`);
        const response = await documentAPI.upload(formData);
        
        if (!response.data.success) {
          throw new Error(response.data.error || 'Upload failed');
        }
        
        console.log(`✅ Upload successful for: ${file.name}`);
        
        // Store the uploaded document info for immediate UI update
        if (response.data.document) {
          uploadedDocs.push({
            documentId: response.data.document.documentId,
            type: response.data.document.type,
            originalName: response.data.document.originalName,
            url: response.data.document.url,
            fileSize: response.data.document.fileSizeBytes || 0,
            fileFormat: 'pdf',
            uploadedAt: response.data.document.uploadedAt || new Date().toISOString(),
            status: 'submitted',
            verificationComments: '',
            verifiedBy: null,
            verifiedAt: null,
            linkedAt: new Date().toISOString()
          });
        }
      }

      // Immediately update UI state with uploaded documents
      if (uploadedDocs.length > 0) {
        setUploadedDocuments(prevDocs => {
          const newDocs = { ...prevDocs };
          
          // Add the uploaded documents to each target application
          targetApplications.forEach(app => {
            if (!newDocs[app.applicationId]) {
              newDocs[app.applicationId] = [];
            }
            // Add all uploaded documents to this application
            newDocs[app.applicationId] = [...newDocs[app.applicationId], ...uploadedDocs];
          });
          
          console.log(`📤 Added ${uploadedDocs.length} documents to ${targetApplications.length} applications in UI`);
          return newDocs;
        });
      }

      setToast({ 
        message: `${files.length} document(s) uploaded successfully!`, 
        type: 'success' 
      });
      
      // Clear selected files immediately
      setSelectedFiles(prev => ({
        ...prev,
        [documentType]: []
      }));
      
      // Force component re-render to update UI conditions
      setForceUpdate(prev => prev + 1);
      
      // Background refresh to ensure server sync (but UI already updated)
      console.log('🔄 Background sync with server');
      setTimeout(() => {
        fetchApplicationsAndDocuments();
      }, 1000);

    } catch (error) {
      console.error('❌ Upload error:', error);
      setToast({
        message: error.response?.data?.error || error.message || 'Failed to upload documents',
        type: 'error'
      });
    } finally {
      operationInProgress.current = false;
      setUploading(false);
      console.log('🔓 Upload operation completed');
    }
  }, [selectedFiles, uploading, applications, documentRequirements, setToast]);

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'aadhaar': return <FaIdCard />;
      case 'address_proof': return <FaHome />;
      case 'income_proof': return <FaDollarSign />;
      default: return <FaFileAlt />;
    }
  };

  const getUploadedDocumentsForType = (docType) => {
    let allDocs = [];
    const seenDocuments = new Set(); // Track unique documents by documentId
    
    Object.values(uploadedDocuments).forEach(docs => {
      docs.forEach(doc => {
        if (doc.type === docType && !seenDocuments.has(doc.documentId)) {
          seenDocuments.add(doc.documentId);
          allDocs.push(doc);
        }
      });
    });
    
    return allDocs;
  };

  const handleDeleteDocument = useCallback(async (documentId, docType) => {
    // Strict duplicate prevention
    if (operationInProgress.current || uploading) {
      console.log('⚠️ Delete operation already in progress, blocking duplicate');
      return;
    }

    if (!documentId) {
      console.error('❌ No documentId provided');
      setToast({ message: 'Invalid document ID', type: 'error' });
      return;
    }

    try {
      console.log(`🗑️ Starting delete for document: ${documentId}`);
      operationInProgress.current = true;
      setUploading(true);
      
      const response = await documentAPI.deleteDocument(documentId);
      console.log('🗑️ Delete API response:', response.data);
      
      if (response.data.success) {
        console.log('✅ Delete successful, updating UI');
        
        // Immediately remove from UI state - remove from ALL applications
        setUploadedDocuments(prevDocs => {
          const newDocs = { ...prevDocs };
          let totalRemoved = 0;
          
          Object.keys(newDocs).forEach(appId => {
            const originalLength = newDocs[appId].length;
            newDocs[appId] = newDocs[appId].filter(doc => doc.documentId !== documentId);
            const removed = originalLength - newDocs[appId].length;
            totalRemoved += removed;
            if (removed > 0) {
              console.log(`📤 Removed ${removed} instance(s) from app ${appId}`);
            }
          });
          
          console.log(`📤 Total instances removed: ${totalRemoved}`);
          return newDocs;
        });
        
        setToast({ 
          message: 'Document deleted successfully', 
          type: 'success' 
        });
        
      } else {
        throw new Error(response.data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      setToast({
        message: error.response?.data?.error || error.message || 'Failed to delete document',
        type: 'error'
      });
    } finally {
      operationInProgress.current = false;
      setUploading(false);
      console.log('🔓 Delete operation completed');
    }
  }, [uploading, setToast]);

  const renderDocumentSection = (sectionKey, sectionTitle, documents) => {
    if (documents.length === 0) return null;

    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="document-section">
        <div 
          className="document-section-header"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="section-title">
            <h3>{sectionTitle}</h3>
            <span className="document-count">{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
          </div>
          <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
        </div>

        {isExpanded && (
          <div className="document-section-content">
            {documents.map((doc, index) => {
              const uploadedDocs = getUploadedDocumentsForType(doc.type);
              const hasUploadedDocs = uploadedDocs.length > 0;
              const hasSelectedFiles = selectedFiles[doc.type]?.length > 0;
              const uniqueKey = `${doc.type}-${index}-${forceUpdate}`; // Include forceUpdate in key
              
              console.log(`🔍 Document ${doc.type}: uploaded=${uploadedDocs.length}, hasSelected=${hasSelectedFiles}, shouldShowUpload=${!hasUploadedDocs || !doc.required}`);
              
              return (
                <div key={uniqueKey} className="document-item">
                  <div className="document-item-header">
                    <div className="document-info">
                      <span className="document-icon">{getDocumentIcon(doc.type)}</span>
                      <div className="document-details">
                        <h4>
                          {doc.name}
                          {doc.required && <span className="required-badge">Required</span>}
                        </h4>
                        <p className="document-description">
                          Needed for {doc.applicationsCount} application{doc.applicationsCount !== 1 ? 's' : ''}
                          {hasUploadedDocs && (
                            <span className="upload-status"> • {uploadedDocs.length} uploaded</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="upload-status-indicator">
                      {hasUploadedDocs ? (
                        <span className="status-uploaded">✓ Fulfilled</span>
                      ) : doc.required ? (
                        <span className="status-required">Required</span>
                      ) : (
                        <span className="status-optional">Optional</span>
                      )}
                    </div>
                  </div>

                  {/* Show uploaded documents if any */}
                  {hasUploadedDocs && (
                    <div className="uploaded-documents">
                      {uploadedDocs.map((uploadedDoc, docIndex) => {
                        // Count how many applications this document is linked to
                        let linkedAppsCount = 0;
                        Object.values(uploadedDocuments).forEach(docs => {
                          if (docs.some(d => d.documentId === uploadedDoc.documentId)) {
                            linkedAppsCount++;
                          }
                        });
                        
                        return (
                          <div key={`uploaded-${uploadedDoc.documentId || docIndex}`} className="uploaded-document-item">
                            <div className="uploaded-doc-info">
                              <FaCheckCircle className="uploaded-icon" />
                              <div className="doc-details">
                                <span className="uploaded-filename">{uploadedDoc.originalName}</span>
                                <div className="doc-meta">
                                  <span className="uploaded-date">
                                    {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                                  </span>
                                  {linkedAppsCount > 1 && (
                                    <span className="linked-apps-count">
                                      • Used in {linkedAppsCount} applications
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="uploaded-doc-actions">
                              <SecondaryButton
                                size="small"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (uploadedDoc.url) {
                                    window.open(uploadedDoc.url, '_blank');
                                  } else {
                                    setToast({ message: 'Document URL not available', type: 'warning' });
                                  }
                                }}
                                disabled={uploading}
                              >
                                View
                              </SecondaryButton>
                              <SecondaryButton
                                size="small"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteDocument(uploadedDoc.documentId, doc.type);
                                }}
                                disabled={uploading}
                                style={{ color: '#dc2626' }}
                              >
                                Delete
                              </SecondaryButton>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Show upload area only if no documents are uploaded OR if it's optional */}
                  {(!hasUploadedDocs || !doc.required) && (
                    <div className="document-upload-area">
                      <FileUpload
                        name={`upload-${uniqueKey}`}
                        onChange={(files) => handleFileSelect(doc.type, files)}
                        accept=".pdf"
                        multiple={true}
                        maxSize={5}
                        preview={true}
                      />
                      
                      {hasSelectedFiles && (
                        <div className="upload-actions">
                          <PrimaryButton
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleUpload(doc.type);
                            }}
                            loading={uploading}
                            disabled={uploading}
                            size="small"
                          >
                            <FaUpload style={{ marginRight: '4px' }} />
                            Upload {selectedFiles[doc.type].length} File{selectedFiles[doc.type].length !== 1 ? 's' : ''}
                          </PrimaryButton>
                          <SecondaryButton
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedFiles(prev => ({ ...prev, [doc.type]: [] }));
                            }}
                            disabled={uploading}
                            size="small"
                          >
                            <FaTimes style={{ marginRight: '4px' }} />
                            Clear
                          </SecondaryButton>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="documents-loading">
        <Spinner />
        <p>Loading document requirements...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="documents-container">
        <div className="documents-header">
          <h1>Documents</h1>
          <p>Upload required documents for your applications</p>
        </div>
        <NoData 
          message="No applications found"
          description="Submit an application first to see document requirements"
        />
      </div>
    );
  }

  return (
    <div className="documents-container">
      <div className="documents-header">
        <h1>Document Requirements</h1>
        <p>Upload the required documents for your {applications.length} application{applications.length !== 1 ? 's' : ''}</p>
        
        {/* Debug info - remove this after testing */}
        <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', fontSize: '12px' }}>
          <strong>Debug Info:</strong><br/>
          Applications: {applications.length}<br/>
          Uploaded Documents Keys: {Object.keys(uploadedDocuments).join(', ')}<br/>
          Total Uploaded: {Object.values(uploadedDocuments).flat().length}
        </div>
      </div>

      <div className="documents-content">
        <div className="documents-summary">
          <div className="summary-card">
            <h3><FaClipboardList /> Your Applications</h3>
            <div className="applications-list">
              {applications.map(app => (
                <div key={app.applicationId} className="app-summary-item">
                  <span className="app-id">{app.applicationId}</span>
                  <span className="app-purpose">{app.purpose?.replace('_', ' ') || 'Other'}</span>
                  <span className={`app-status status-${app.status}`}>{app.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="documents-requirements">
          {renderDocumentSection('identity', 'Identity Documents', requiredDocuments.identity)}
          {renderDocumentSection('address', 'Address Proof Documents', requiredDocuments.address)}
          {renderDocumentSection('purpose_specific', 'Purpose-Specific Documents', requiredDocuments.purpose_specific)}
          {renderDocumentSection('supporting', 'Supporting Documents', requiredDocuments.supporting)}
        </div>
      </div>
    </div>
  );
}

export default Documents;