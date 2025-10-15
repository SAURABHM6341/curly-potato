/**
 * SchemeForm Page
 * Dynamic form renderer for scheme applications
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SCHEMES } from '../../data/schemes';
import { applicationAPI } from '../../utils/api';
import TextInput from '../../components/Input/TextInput';
import SelectInput from '../../components/Input/SelectInput';
import PrimaryButton from '../../components/Button/PrimaryButton';
import SecondaryButton from '../../components/Button/SecondaryButton';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Loader/Spinner';
import { FaFileAlt } from 'react-icons/fa';
import './SchemeForm.css';

const SchemeForm = () => {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [scheme, setScheme] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Find scheme
    const foundScheme = SCHEMES.find(s => s.id === schemeId);
    if (!foundScheme) {
      showToast('Scheme not found', 'error');
      navigate('/applicant/schemes');
      return;
    }
    setScheme(foundScheme);

    // Initialize form data
    const initialData = {};
    foundScheme.fields.forEach(field => {
      initialData[field.name] = '';
    });
    setFormData(initialData);
  }, [schemeId, navigate, showToast]);

  const validateForm = () => {
    const newErrors = {};
    
    scheme.fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      // Email validation
      if (field.type === 'email' && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Invalid email address';
        }
      }
      
      // Number validation
      if (field.type === 'number' && formData[field.name]) {
        if (isNaN(formData[field.name])) {
          newErrors[field.name] = 'Must be a number';
        }
        if (field.min && Number(formData[field.name]) < field.min) {
          newErrors[field.name] = `Minimum value is ${field.min}`;
        }
        if (field.max && Number(formData[field.name]) > field.max) {
          newErrors[field.name] = `Maximum value is ${field.max}`;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await applicationAPI.createApplication({
        schemeName: scheme.name,
        applicationData: formData
      });

      showToast('Application submitted successfully!', 'success');
      navigate(`/applicant/applications/${response.data.applicationId}`);
    } catch (error) {
      console.error('Submit error:', error);
      showToast(error.response?.data?.message || 'Failed to submit application', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'select':
        return (
          <SelectInput
            key={field.name}
            label={field.label}
            value={formData[field.name]}
            onChange={(e) => handleChange(field.name, e.target.value)}
            options={field.options.map(opt => ({
              value: opt,
              label: opt
            }))}
            error={errors[field.name]}
            required={field.required}
          />
        );
      
      case 'textarea':
        return (
          <div key={field.name} className="form-group">
            <label className="form-label">
              {field.label}
              {field.required && <span className="required-mark">*</span>}
            </label>
            <textarea
              className={`form-textarea ${errors[field.name] ? 'textarea-error' : ''}`}
              value={formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
            />
            {errors[field.name] && (
              <span className="form-error">{errors[field.name]}</span>
            )}
          </div>
        );
      
      default:
        return (
          <TextInput
            key={field.name}
            type={field.type}
            label={field.label}
            placeholder={field.placeholder}
            value={formData[field.name]}
            onChange={(e) => handleChange(field.name, e.target.value)}
            error={errors[field.name]}
            required={field.required}
          />
        );
    }
  };

  if (!scheme) {
    return (
      <div className="scheme-form-loading">
        <Spinner />
        <p>Loading scheme...</p>
      </div>
    );
  }

  return (
    <div className="scheme-form-page">
      <div className="scheme-form-header">
        <button className="back-button" onClick={() => navigate('/applicant/schemes')}>
          ← Back to Schemes
        </button>
        
        <div className="scheme-form-title-section">
          <div className="scheme-form-icon">{scheme.icon}</div>
          <div>
            <h1 className="page-title">{scheme.name}</h1>
            <p className="page-subtitle">{scheme.description}</p>
          </div>
        </div>

        {/* Scheme Info */}
        <div className="scheme-info-box">
          <div className="scheme-info-item">
            <span className="info-label">Category:</span>
            <span className="info-value">{scheme.category}</span>
          </div>
          <div className="scheme-info-item">
            <span className="info-label">Eligibility:</span>
            <span className="info-value">{scheme.eligibility}</span>
          </div>
          {scheme.benefits && (
            <div className="scheme-info-item">
              <span className="info-label">Benefits:</span>
              <span className="info-value">{scheme.benefits}</span>
            </div>
          )}
        </div>
      </div>

      {/* Application Form */}
      <form onSubmit={handleSubmit} className="scheme-form">
        <div className="form-section">
          <h2 className="form-section-title">Application Details</h2>
          <p className="form-section-subtitle">
            Please fill in all the required information accurately
          </p>
          
          <div className="form-fields">
            {scheme.fields.map(field => renderField(field))}
          </div>
        </div>

        {/* Required Documents List */}
        <div className="form-section">
          <h2 className="form-section-title">Required Documents</h2>
          <p className="form-section-subtitle">
            You will need to upload these documents in the next step
          </p>
          
          <ul className="required-docs-list">
            {scheme.requiredDocs.map((doc, index) => (
              <li key={index} className="required-doc-item">
                <span className="doc-icon"><FaFileAlt /></span>
                {doc}
              </li>
            ))}
          </ul>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <SecondaryButton
            type="button"
            onClick={() => navigate('/applicant/schemes')}
          >
            Cancel
          </SecondaryButton>
          
          <PrimaryButton
            type="submit"
            loading={loading}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
};

export default SchemeForm;
