const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['notice', 'report', 'contract', 'form', 'other'],
    default: 'other'
  },
  tags: [{
    type: String
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  accessLevel: {
    type: String,
    enum: ['public', 'department', 'private'],
    default: 'department'
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'none'],
    default: 'none'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    content: String,
    fileUrl: String,
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 全文搜索索引
DocumentSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Document', DocumentSchema);