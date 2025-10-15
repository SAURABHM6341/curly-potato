/**
 * Footer Component
 * Simple page footer
 */

import React from 'react';
import { FaEnvelope, FaPhone, FaClock } from 'react-icons/fa';
import './Layout.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">PCR PoA DBT Portal</h3>
            <p className="footer-text">
              Government of India - Direct Benefit Transfer System
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">About Us</a></li>
              <li><a href="#" className="footer-link">Contact</a></li>
              <li><a href="#" className="footer-link">FAQ</a></li>
              <li><a href="#" className="footer-link">Helpdesk</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Policies</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Privacy Policy</a></li>
              <li><a href="#" className="footer-link">Terms of Service</a></li>
              <li><a href="#" className="footer-link">Disclaimer</a></li>
              <li><a href="#" className="footer-link">Accessibility</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Contact</h4>
            <ul className="footer-links">
              <li className="footer-contact"><FaEnvelope /> support@gov.in</li>
              <li className="footer-contact"><FaPhone /> 1800-XXX-XXXX</li>
              <li className="footer-contact"><FaClock /> Mon-Fri: 9AM-6PM</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Government of India. All rights reserved.
          </p>
          <p className="footer-version">Version 1.0.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
