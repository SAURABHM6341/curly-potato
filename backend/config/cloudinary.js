/**
 * Cloudinary Configuration
 * Cloud storage for document uploads
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'government-documents', // Cloudinary folder
    allowed_formats: ['pdf'],
    resource_type: 'raw' // Use 'raw' for PDFs, not 'auto' or 'image'
    // No transformations for PDFs
  }
});

// Configure Multer with Cloudinary storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow specific document types
    const allowedTypes = [
      'application/pdf',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF are allowed.'), false);
    }
  }
});

// Helper function to delete file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get file details
const getFileDetails = (cloudinaryResponse) => {
  console.log('🔍 Cloudinary Response:', JSON.stringify(cloudinaryResponse, null, 2));
  
  return {
    url: cloudinaryResponse.secure_url || cloudinaryResponse.url,
    publicId: cloudinaryResponse.public_id,
    format: cloudinaryResponse.format,
    bytes: cloudinaryResponse.bytes,
    width: cloudinaryResponse.width,
    height: cloudinaryResponse.height,
    uploadedAt: new Date(cloudinaryResponse.created_at || Date.now())
  };
};

module.exports = {
  cloudinary,
  upload,
  deleteFile,
  getFileDetails
};