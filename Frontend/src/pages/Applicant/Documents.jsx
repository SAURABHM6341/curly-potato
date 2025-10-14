/**
 * Documents Management Page
 * Upload and manage application documents based on submitted applications
 */

import React, { useState, useEffect } from 'react';
import { applicationAPI } from '../../utils/api';
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
        
        // Fetch existing documents for all applications
        const docsData = {};
        for (const app of apps) {
          try {
            const docResponse = await applicationAPI.getDocuments(app.applicationId);
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

  const handleUpload = async (documentType) => {
    const files = selectedFiles[documentType];
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      
      // For now, we'll upload to the first application that requires this document type
      // In a real implementation, you'd let user choose which application to attach to
      const targetAppId = applications[0]?.applicationId;
      
      if (!targetAppId) {
        setToast({ message: 'No application found to attach document', type: 'error' });
        return;
      }

      // Simulate file upload (in real app, would upload to Cloudinary/S3)
      const documentData = files.map(file => ({
        type: documentType,
        name: file.name,
        size: file.size,
        comments: `Uploaded: ${file.name} for ${documentType.replace('_', ' ')}`
      }));

      const response = await applicationAPI.uploadDocuments(targetAppId, {
        documents: documentData
      });

      if (response.data.success) {
        setToast({ message: 'Documents uploaded successfully!', type: 'success' });
        setSelectedFiles(prev => ({
          ...prev,
          [documentType]: []
        }));
        
        // Refresh documents
        fetchApplicationsAndDocuments();
      }
    } catch (error) {
      setToast({
        message: error.response?.data?.error || 'Failed to upload documents',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'aadhaar': return '🆔';
      case 'address_proof': return '🏠';
      case 'income_proof': return '💰';
      default: return '📄';
    }
  };

  const getUploadedDocumentStatus = (docType) => {
    let totalUploaded = 0;
    Object.values(uploadedDocuments).forEach(docs => {
      totalUploaded += docs.filter(doc => doc.type === docType).length;
    });
    return totalUploaded;
  };

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
              const uploadedCount = getUploadedDocumentStatus(doc.type);
              const hasFiles = selectedFiles[doc.type]?.length > 0;
              
              return (
                <div key={index} className="document-item">
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
                          {uploadedCount > 0 && (
                            <span className="upload-status"> • {uploadedCount} uploaded</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="upload-status-indicator">
                      {uploadedCount > 0 ? (
                        <span className="status-uploaded">✓ Uploaded</span>
                      ) : doc.required ? (
                        <span className="status-required">Required</span>
                      ) : (
                        <span className="status-optional">Optional</span>
                      )}
                    </div>
                  </div>

                  <div className="document-upload-area">
                    <FileUpload
                      name={`upload-${doc.type}`}
                      onChange={(files) => handleFileSelect(doc.type, files)}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      multiple={true}
                      maxSize={5}
                      preview={true}
                    />
                    
                    {hasFiles && (
                      <div className="upload-actions">
                        <PrimaryButton
                          onClick={() => handleUpload(doc.type)}
                          loading={uploading}
                          size="small"
                        >
                          Upload {selectedFiles[doc.type].length} File{selectedFiles[doc.type].length !== 1 ? 's' : ''}
                        </PrimaryButton>
                        <SecondaryButton
                          onClick={() => setSelectedFiles(prev => ({ ...prev, [doc.type]: [] }))}
                          disabled={uploading}
                          size="small"
                        >
                          Clear
                        </SecondaryButton>
                      </div>
                    )}
                  </div>
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
      </div>

      <div className="documents-content">
        <div className="documents-summary">
          <div className="summary-card">
            <h3>📋 Your Applications</h3>
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
          {renderDocumentSection('identity', '🆔 Identity Documents', requiredDocuments.identity)}
          {renderDocumentSection('address', '🏠 Address Proof Documents', requiredDocuments.address)}
          {renderDocumentSection('purpose_specific', '💰 Purpose-Specific Documents', requiredDocuments.purpose_specific)}
          {renderDocumentSection('supporting', '📄 Supporting Documents', requiredDocuments.supporting)}
        </div>
      </div>
    </div>
  );
}

export default Documents;