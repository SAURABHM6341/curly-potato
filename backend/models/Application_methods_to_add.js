// Add these methods to Application.js before module.exports

// Data Entry Operator: Verify application completeness
applicationSchema.methods.verifyDataCompleteness = async function(verifierDesignation, verificationData) {
  const { isComplete, missingFields, comments, escalateTo } = verificationData;
  
  // Update data verification
  this.dataVerification = {
    isComplete,
    verifiedBy: verifierDesignation,
    verifiedAt: new Date(),
    missingFields: missingFields || [],
    comments: comments || '',
    action: isComplete ? 'verified_complete' : 'incomplete'
  };
  
  // Add to processing chain
  this.processingChain.push({
    designation: verifierDesignation,
    department: 'IT',
    action: isComplete ? 'approved' : 'requested_docs',
    comments: comments || (isComplete ? 'Data verification complete' : 'Incomplete data - requires correction'),
    timestamp: new Date()
  });
  
  // Update status and current authority based on verification
  if (isComplete && escalateTo) {
    // Escalate to reviewer
    this.status = 'under_review';
    this.currentAuthority = {
      designation: escalateTo,
      department: 'Revenue',
      assignedAt: new Date()
    };
    this.dataVerification.action = 'escalated';
    this.authorityChanges += 1;
    
    // Add escalation to processing chain
    this.processingChain.push({
      designation: verifierDesignation,
      department: 'IT',
      action: 'forwarded',
      comments: `Escalated to ${escalateTo} for review`,
      timestamp: new Date(),
      forwardedTo: escalateTo
    });
  } else if (!isComplete) {
    // Send back to applicant for corrections
    this.status = 'pending_documents';
  }
  
  this.lastUpdated = new Date();
  return await this.save();
};

// Get applications pending data verification
applicationSchema.statics.getPendingDataVerification = async function(designation = 'Data_Entry_Operator') {
  return await this.find({
    'currentAuthority.designation': designation,
    status: 'data_verification',
    'dataVerification.action': { $in: ['pending', null] }
  })
    .sort({ submittedAt: 1 })
    .populate('userId', 'name mobile email');
};
