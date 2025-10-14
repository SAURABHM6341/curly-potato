/**
 * ConfirmModal Component
 * Confirmation dialog for important actions
 */

import React from 'react';
import PrimaryButton from '../Button/PrimaryButton';
import SecondaryButton from '../Button/SecondaryButton';
import './Modal.css';

const ConfirmModal = ({ 
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info' // success, warning, error, info
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className={`modal-header modal-header-${type}`}>
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          <SecondaryButton onClick={onClose}>
            {cancelText}
          </SecondaryButton>
          <PrimaryButton onClick={onConfirm}>
            {confirmText}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
