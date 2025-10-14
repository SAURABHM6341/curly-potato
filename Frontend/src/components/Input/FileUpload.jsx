/**
 * FileUpload Component
 * File upload with preview and drag-and-drop support
 */

import React, { useState, useRef } from 'react';
import './Input.css';

const FileUpload = ({ 
  label,
  name,
  onChange,
  accept = '*',
  required = false,
  error = '',
  maxSize = 5, // MB
  multiple = false,
  preview = true
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const handleFiles = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => {
      const sizeMB = file.size / (1024 * 1024);
      return sizeMB <= maxSize;
    });

    if (validFiles.length > 0) {
      setFiles(validFiles);
      onChange(multiple ? validFiles : validFiles[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange(multiple ? newFiles : null);
  };

  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      
      <div
        className={`file-upload ${dragActive ? 'file-upload-active' : ''} ${error ? 'file-upload-error' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          onChange={handleChange}
          accept={accept}
          required={required}
          multiple={multiple}
          className="file-upload-input"
        />
        
        <div className="file-upload-content">
          <svg className="file-upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="file-upload-text">
            <span className="file-upload-highlight">Click to upload</span> or drag and drop
          </p>
          <p className="file-upload-hint">Maximum file size: {maxSize}MB</p>
        </div>
      </div>
      
      {error && <span className="input-error-message">{error}</span>}
      
      {preview && files.length > 0 && (
        <div className="file-preview-list">
          {files.map((file, index) => (
            <div key={index} className="file-preview-item">
              <div className="file-preview-info">
                <svg className="file-preview-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="13 2 13 9 20 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="file-preview-name">{file.name}</span>
                <span className="file-preview-size">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="file-preview-remove"
                aria-label="Remove file"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
