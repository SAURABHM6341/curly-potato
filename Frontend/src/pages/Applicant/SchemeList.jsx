/**
 * SchemeList Page
 * Browse all available government schemes
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SCHEMES } from '../../data/schemes';
import PrimaryButton from '../../components/Button/PrimaryButton';
import TextInput from '../../components/Input/TextInput';
import SelectInput from '../../components/Input/SelectInput';
import { FaSearch, FaLightbulb } from 'react-icons/fa';
import './SchemeList.css';

const SchemeList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Extract unique categories
  const categories = ['all', ...new Set(SCHEMES.map(s => s.category))];

  // Filter schemes
  const filteredSchemes = SCHEMES.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="scheme-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Available Schemes</h1>
          <p className="page-subtitle">Browse and apply for government schemes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="scheme-filters">
        <div className="scheme-search">
          <TextInput
            placeholder="Search schemes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<FaSearch />}
          />
        </div>
        
        <SelectInput
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          options={categories.map(cat => ({
            value: cat,
            label: cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)
          }))}
        />
      </div>

      {/* Schemes Grid */}
      <div className="schemes-grid">
        {filteredSchemes.length === 0 ? (
          <div className="no-schemes">
            <div className="no-schemes-icon"><FaSearch /></div>
            <h3>No Schemes Found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredSchemes.map(scheme => (
            <div key={scheme.id} className="scheme-card">
              <div className="scheme-card-header">
                <div className="scheme-icon"><scheme.icon /></div>
                <span className="scheme-category">{scheme.category}</span>
              </div>

              <h3 className="scheme-name">{scheme.name}</h3>
              <p className="scheme-description">{scheme.description}</p>

              <div className="scheme-details">
                <div className="scheme-detail-item">
                  <span className="scheme-detail-label">Eligibility:</span>
                  <span className="scheme-detail-value">{scheme.eligibility}</span>
                </div>

                {scheme.benefits && (
                  <div className="scheme-detail-item">
                    <span className="scheme-detail-label">Benefits:</span>
                    <span className="scheme-detail-value">{scheme.benefits}</span>
                  </div>
                )}

                <div className="scheme-detail-item">
                  <span className="scheme-detail-label">Required Documents:</span>
                  <span className="scheme-detail-value">
                    {scheme.requiredDocs.length} documents
                  </span>
                </div>
              </div>

              <div className="scheme-card-actions">
                <PrimaryButton
                  fullWidth
                  onClick={() => navigate(`/applicant/schemes/${scheme.id}`)}
                >
                  Apply Now
                </PrimaryButton>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <div className="info-banner-icon"><FaLightbulb /></div>
        <div>
          <h4>Need Help?</h4>
          <p>Contact your local government office or call the helpline for assistance with applications</p>
        </div>
      </div>
    </div>
  );
};

export default SchemeList;
