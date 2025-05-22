const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['approval', 'process', 'notification'],
    default: 'approval'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  steps: [{
    name: String,
    description: String,
    approvers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    requiredApprovals: {
      type: Number,
      default: 1
    },
    deadline: {
      type: Number, // 小时数
      default: 24
    },
    order: Number
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  applicableDocuments: [{
    type: String,
    enum: ['notice', 'report', 'contract', 'form', 'other']
  }],
  autoStart: {
    type: Boolean,
    default: false
  },
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

// 工作流实例子模式
const WorkflowInstanceSchema = new mongoose.Schema({
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentStep: {
    type: Number,
    default: 0
  },
  steps: [{
    stepId: String,
    name: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'in_progress'],
      default: 'pending'
    },
    approvers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      comment: String,
      actionDate: Date
    }],
    startDate: Date,
    endDate: Date,
    deadline: Date
  }],
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed', 'rejected', 'canceled'],
    default: 'draft'
  },
  result: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'canceled'],
    default: 'pending'
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true
});

const Workflow = mongoose.model('Workflow', WorkflowSchema);
const WorkflowInstance = mongoose.model('WorkflowInstance', WorkflowInstanceSchema);

module.exports = { Workflow, WorkflowInstance };