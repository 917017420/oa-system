const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Document = require('../models/Document');

// 获取所有文档
router.get('/', protect, async (req, res) => {
  try {
    // 根据用户角色决定可见范围
    let query = {};
    
    // 如果不是管理员，只能看到自己部门的或公开的文档
    if (!req.user.roles.includes('admin')) {
      query = {
        $or: [
          { createdBy: req.user.id },
          { department: req.user.department },
          { visibility: 'public' }
        ]
      };
    }
    
    const documents = await Document.find(query)
      .populate('createdBy', 'name username')
      .populate('department', 'name');
      
    res.json(documents);
  } catch (error) {
    console.error('获取文档列表错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取单个文档
router.get('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy', 'name username')
      .populate('department', 'name');
    
    if (!document) {
      return res.status(404).json({ message: '文档不存在' });
    }
    
    // 检查访问权限
    const canAccess = 
      req.user.roles.includes('admin') || 
      document.createdBy.equals(req.user._id) ||
      (document.department && document.department.equals(req.user.department)) ||
      document.visibility === 'public';
      
    if (!canAccess) {
      return res.status(403).json({ message: '没有权限访问此文档' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('获取文档详情错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 创建文档
router.post('/', protect, async (req, res) => {
  try {
    const newDocument = new Document({
      ...req.body,
      createdBy: req.user.id
    });
    
    await newDocument.save();
    
    res.status(201).json(newDocument);
  } catch (error) {
    console.error('创建文档错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新文档
router.put('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: '文档不存在' });
    }
    
    // 检查权限：只有管理员或文档创建者可以更新
    if (!req.user.roles.includes('admin') && !document.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: '没有权限修改此文档' });
    }
    
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json(updatedDocument);
  } catch (error) {
    console.error('更新文档错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除文档
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: '文档不存在' });
    }
    
    // 检查权限：只有管理员或文档创建者可以删除
    if (!req.user.roles.includes('admin') && !document.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: '没有权限删除此文档' });
    }
    
    await Document.findByIdAndDelete(req.params.id);
    
    res.json({ message: '文档已成功删除' });
  } catch (error) {
    console.error('删除文档错误:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;