const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { Workflow, WorkflowInstance } = require('../models/Workflow');

// 获取所有工作流
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // 如果不是管理员，只能看到自己部门的或公开的工作流
    if (!req.user.roles.includes('admin')) {
      query = {
        $or: [
          { creator: req.user._id },
          { department: req.user.department }
        ]
      };
    }
    
    const workflows = await Workflow.find(query)
      .populate('creator', 'name username')
      .populate('department', 'name');
    
    res.json(workflows);
  } catch (error) {
    console.error('获取工作流列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取单个工作流
router.get('/:id', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
      .populate('creator', 'name username')
      .populate('department', 'name');
    
    if (!workflow) {
      return res.status(404).json({ message: '工作流不存在' });
    }
    
    // 检查访问权限
    const canAccess = 
      req.user.roles.includes('admin') || 
      workflow.creator.equals(req.user._id) ||
      (workflow.department && workflow.department.equals(req.user.department));
      
    if (!canAccess) {
      return res.status(403).json({ message: '没有权限访问此工作流' });
    }
    
    res.json(workflow);
  } catch (error) {
    console.error('获取工作流详情错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 创建工作流
router.post('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const workflow = new Workflow({
      ...req.body,
      creator: req.user._id
    });
    
    await workflow.save();
    
    res.status(201).json(workflow);
  } catch (error) {
    console.error('创建工作流错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新工作流
router.put('/:id', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: '工作流不存在' });
    }
    
    // 检查权限：只有管理员或创建者可以更新
    if (!req.user.roles.includes('admin') && !workflow.creator.equals(req.user._id)) {
      return res.status(403).json({ message: '没有权限修改此工作流' });
    }
    
    const updatedWorkflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json(updatedWorkflow);
  } catch (error) {
    console.error('更新工作流错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除工作流
router.delete('/:id', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: '工作流不存在' });
    }
    
    // 检查权限：只有管理员或创建者可以删除
    if (!req.user.roles.includes('admin') && !workflow.creator.equals(req.user._id)) {
      return res.status(403).json({ message: '没有权限删除此工作流' });
    }
    
    await Workflow.findByIdAndDelete(req.params.id);
    
    res.json({ message: '工作流已成功删除' });
  } catch (error) {
    console.error('删除工作流错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 启动工作流实例
router.post('/:id/start', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: '工作流不存在' });
    }
    
    // 创建工作流实例
    const workflowInstance = new WorkflowInstance({
      workflow: workflow._id,
      document: req.body.documentId,
      initiator: req.user._id,
      steps: workflow.steps.map(step => ({
        stepId: step._id,
        name: step.name,
        approvers: step.approvers,
        deadline: new Date(Date.now() + step.deadline * 3600000) // 转换小时为毫秒
      }))
    });
    
    await workflowInstance.save();
    
    res.status(201).json(workflowInstance);
  } catch (error) {
    console.error('启动工作流实例错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 处理工作流步骤
router.post('/instance/:id/step/:stepIndex', protect, async (req, res) => {
  try {
    const { action, comment } = req.body;
    const instance = await WorkflowInstance.findById(req.params.id);
    
    if (!instance) {
      return res.status(404).json({ message: '工作流实例不存在' });
    }
    
    const stepIndex = parseInt(req.params.stepIndex);
    const currentStep = instance.steps[stepIndex];
    
    if (!currentStep) {
      return res.status(400).json({ message: '无效的步骤索引' });
    }
    
    // 检查用户是否是当前步骤的审批人
    const isApprover = currentStep.approvers.some(approver => 
      approver.user && approver.user.equals(req.user._id)
    );
    
    if (!isApprover) {
      return res.status(403).json({ message: '您不是该步骤的审批人' });
    }
    
    // 更新审批人的决定
    const approverIndex = currentStep.approvers.findIndex(approver => 
      approver.user && approver.user.equals(req.user._id)
    );
    
    currentStep.approvers[approverIndex].status = action;
    currentStep.approvers[approverIndex].comment = comment;
    currentStep.approvers[approverIndex].actionDate = new Date();
    
    // 检查是否达到所需的审批数量
    const approvedCount = currentStep.approvers.filter(approver => 
      approver.status === 'approved'
    ).length;
    
    if (approvedCount >= instance.workflow.steps[stepIndex].requiredApprovals) {
      currentStep.status = 'approved';
      instance.currentStep += 1;
      
      // 如果是最后一步，完成工作流
      if (instance.currentStep >= instance.steps.length) {
        instance.status = 'completed';
        instance.result = 'approved';
        instance.completedAt = new Date();
      }
    } else if (action === 'rejected') {
      currentStep.status = 'rejected';
      instance.status = 'rejected';
      instance.result = 'rejected';
      instance.completedAt = new Date();
    }
    
    await instance.save();
    
    res.json(instance);
  } catch (error) {
    console.error('处理工作流步骤错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取工作流实例列表
router.get('/instances', protect, async (req, res) => {
  try {
    let query = {};
    
    // 如果不是管理员，只能看到相关的工作流实例
    if (!req.user.roles.includes('admin')) {
      query = {
        $or: [
          { initiator: req.user._id },
          { 'steps.approvers.user': req.user._id }
        ]
      };
    }
    
    const instances = await WorkflowInstance.find(query)
      .populate('workflow', 'name')
      .populate('initiator', 'name username')
      .populate('document', 'title');
    
    res.json(instances);
  } catch (error) {
    console.error('获取工作流实例列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;