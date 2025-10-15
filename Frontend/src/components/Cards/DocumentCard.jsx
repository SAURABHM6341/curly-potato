/**
 * DocumentCard Component
 * Display uploaded documents with preview and actions
 */

import React from 'react';
import { FaFilePdf, FaImage, FaPaperclip } from 'react-icons/fa';
import './Cards.css';

const DocumentCard = ({ document, onDownload, onDelete, showActions = true }) => {
  const getFileIcon = (type) => {
    const icons = {
      'application/pdf': <FaFilePdf />,
      'image/jpeg': <FaImage />,
      'image/png': <FaImage />,
      'image/jpg': <FaImage />,
      'default': <FaPaperclip />
    };
    return icons[type] || icons.default;
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: '#0056D2',
      verified: '#0F9D58',
      rejected: '#D93025',
      pending: '#F4B400'
    };
    return colors[status] || colors.pending;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="document-card">
      <div className="document-card-icon">
        {getFileIcon(document.type || document.mimeType)}
      </div>

      <div className="document-card-info">
        <h4 className="document-card-name">{document.name || document.fileName}</h4>
        <p className="document-card-meta">
          {document.size && formatFileSize(document.size)}
          {document.uploadedAt && ` • ${new Date(document.uploadedAt).toLocaleDateString()}`}
        </p>
        
        {document.status && (
          <span
            className="document-card-status"
            style={{ color: getStatusColor(document.status) }}
          >
            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </span>
        )}

        {document.verifiedBy && (
          <p className="document-card-verified">
            Verified by: {document.verifiedBy}
          </p>
        )}

        {document.comments && (
          <p className="document-card-comments">
            {document.comments}
          </p>
        )}
      </div>

      {showActions && (
        <div className="document-card-actions">
          {onDownload && (
            <button
              className="document-card-action"
              onClick={() => onDownload(document)}
              title="Download"
            >
              ⬇️
            </button>
          )}
          {onDelete && (
            <button
              className="document-card-action document-card-delete"
              onClick={() => onDelete(document)}
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
