const express = require('express');
const router = express.Router();
const GameRequest = require('../models/GameRequest');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/game-requests
// @desc    Create a game request
// @access  Private
router.post('/', authMiddleware.protect, async (req, res) => {
  try {
    const { receivers, gameName, message } = req.body;

    if (!receivers || receivers.length === 0) {
      return res.status(400).json({ msg: '请至少选择一个接收人' });
    }
    if (!gameName) {
      return res.status(400).json({ msg: '请输入游戏名称' });
    }

    // Verify receivers exist
    const existingReceivers = await User.find({ '_id': { $in: receivers } });
    if (existingReceivers.length !== receivers.length) {
        return res.status(404).json({ msg: '一个或多个接收人不存在' });
    }

    const newGameRequest = new GameRequest({
      sender: req.user.id,
      receivers,
      gameName,
      message
    });

    const gameRequest = await newGameRequest.save();
    res.json(gameRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/game-requests/sent
// @desc    Get game requests sent by the user
// @access  Private
router.get('/sent', authMiddleware.protect, async (req, res) => {
  try {
    // 检查用户是否为管理员，管理员可以查看所有发送的邀请
    const isAdmin = req.user.roles.includes('admin');
    
    // 构建查询条件
    const query = isAdmin ? {} : { sender: req.user.id };
    
    const gameRequests = await GameRequest.find(query)
      .populate('receivers', ['username', 'name', 'avatar'])
      .populate('sender', ['username', 'name', 'avatar'])
      .sort({ createdAt: -1 });
    res.json(gameRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/game-requests/received
// @desc    Get game requests received by the user
// @access  Private
router.get('/received', authMiddleware.protect, async (req, res) => {
  try {
    // 检查用户是否为管理员，管理员可以查看所有接收的邀请
    const isAdmin = req.user.roles.includes('admin');
    
    // 构建查询条件
    const query = isAdmin ? {} : { receivers: req.user.id };
    
    const gameRequests = await GameRequest.find(query)
      .populate('sender', ['username', 'name', 'avatar'])
      .populate('receivers', ['username', 'name', 'avatar'])
      .sort({ createdAt: -1 });
    res.json(gameRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/game-requests/:id/respond
// @desc    Respond to a game request (accept/reject)
// @access  Private
router.put('/:id/respond', authMiddleware.protect, async (req, res) => {
  try {
    const { status, proposedTime } = req.body; // status can be 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ msg: '无效的状态' });
    }

    let gameRequest = await GameRequest.findById(req.params.id);

    if (!gameRequest) {
      return res.status(404).json({ msg: '游戏邀约未找到' });
    }

    // Check if the current user is one of the receivers
    if (!gameRequest.receivers.map(r => r.toString()).includes(req.user.id)) {
      return res.status(401).json({ msg: '用户未被授权响应此邀约' });
    }

    // Update or add the response for the current user
    const userResponseIndex = gameRequest.responses.findIndex(r => r.user.toString() === req.user.id);

    if (userResponseIndex > -1) {
      // User has already responded, update the response
      gameRequest.responses[userResponseIndex].status = status;
      if (status === 'accepted' && proposedTime) {
        gameRequest.responses[userResponseIndex].proposedTime = proposedTime;
      } else {
        gameRequest.responses[userResponseIndex].proposedTime = undefined; // Clear if not accepted or no new time
      }
    } else {
      // New response
      const response = { user: req.user.id, status };
      if (status === 'accepted' && proposedTime) {
        response.proposedTime = proposedTime;
      }
      gameRequest.responses.push(response);
    }
    
    // Optional: Update overall status if all users accepted or one rejected etc.
    // For simplicity, we'll just record individual responses for now.
    // If all receivers have accepted, and a scheduledTime is agreed upon, update it.
    // This logic can be more complex depending on requirements.

    if (status === 'accepted' && proposedTime && gameRequest.status === 'pending') {
        // Basic logic: if one user accepts with a time, set it as scheduledTime
        // More complex logic would involve checking all responses
        gameRequest.scheduledTime = proposedTime;
        // gameRequest.status = 'accepted'; // Or some other logic to determine overall status
    }

    // If any receiver rejects, the overall status might become 'rejected' or stay 'pending'
    // For now, we'll let individual responses dictate the flow.
    // The sender can see all responses and decide.

    await gameRequest.save();
    res.json(gameRequest);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: '游戏邀约未找到' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/game-requests/:id/cancel
// @desc    Cancel a game request (by sender)
// @access  Private
router.put('/:id/cancel', authMiddleware.protect, async (req, res) => {
  try {
    let gameRequest = await GameRequest.findById(req.params.id);

    if (!gameRequest) {
      return res.status(404).json({ msg: '游戏邀约未找到' });
    }

    // Check if the current user is the sender
    if (gameRequest.sender.toString() !== req.user.id) {
      return res.status(401).json({ msg: '用户未被授权取消此邀约' });
    }

    if (gameRequest.status === 'cancelled') {
        return res.status(400).json({ msg: '邀约已被取消' });
    }

    gameRequest.status = 'cancelled';
    await gameRequest.save();
    res.json({ msg: '游戏邀约已取消', gameRequest });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: '游戏邀约未找到' });
    }
    res.status(500).send('服务器错误');
  }
});


// @route   GET api/game-requests/:id
// @desc    Get a specific game request by ID
// @access  Private
router.get('/:id', authMiddleware.protect, async (req, res) => {
    try {
      const gameRequest = await GameRequest.findById(req.params.id)
        .populate('sender', ['username', 'name', 'avatar'])
        .populate('receivers', ['username', 'name', 'avatar'])
        .populate('responses.user', ['username', 'name', 'avatar']);
  
      if (!gameRequest) {
        return res.status(404).json({ msg: '游戏邀约未找到' });
      }
  
      // 检查用户是否为管理员
      const isAdmin = req.user.roles.includes('admin');
      
      // 如果不是管理员，则检查是否为发送者或接收者
      if (!isAdmin) {
        const isSender = gameRequest.sender._id.toString() === req.user.id;
        const isReceiver = gameRequest.receivers.some(receiver => receiver._id.toString() === req.user.id);
        
        if (!isSender && !isReceiver) {
          return res.status(401).json({ msg: '用户未被授权查看此邀约' });
        }
      }
  
      res.json(gameRequest);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: '游戏邀约未找到' });
      }
      res.status(500).send('服务器错误');
    }
  });

// @route   GET api/game-requests/all
// @desc    Get all game requests (admin only)
// @access  Private/Admin
router.get('/all', [authMiddleware.protect, authMiddleware.authorize('admin')], async (req, res) => {
  try {
    const gameRequests = await GameRequest.find({})
      .populate('sender', ['username', 'name', 'avatar'])
      .populate('receivers', ['username', 'name', 'avatar'])
      .populate('responses.user', ['username', 'name', 'avatar'])
      .sort({ createdAt: -1 });
    res.json(gameRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/game-requests/statistics
// @desc    Get statistics about game requests
// @access  Private
router.get('/statistics', authMiddleware.protect, async (req, res) => {
  try {
    // 检查用户是否为管理员
    const isAdmin = req.user.roles.includes('admin');
    
    // 构建查询条件
    const sentQuery = isAdmin ? {} : { sender: req.user.id };
    const receivedQuery = isAdmin ? {} : { receivers: req.user.id };
    
    // 获取统计数据
    const totalSent = await GameRequest.countDocuments(sentQuery);
    const totalReceived = await GameRequest.countDocuments(receivedQuery);
    const pendingSent = await GameRequest.countDocuments({ ...sentQuery, status: 'pending' });
    const pendingReceived = await GameRequest.countDocuments({ ...receivedQuery, status: 'pending' });
    const acceptedSent = await GameRequest.countDocuments({ ...sentQuery, status: 'accepted' });
    const acceptedReceived = await GameRequest.countDocuments({ ...receivedQuery, status: 'accepted' });
    
    res.json({
      sent: {
        total: totalSent,
        pending: pendingSent,
        accepted: acceptedSent,
        rejected: await GameRequest.countDocuments({ ...sentQuery, status: 'rejected' }),
        cancelled: await GameRequest.countDocuments({ ...sentQuery, status: 'cancelled' })
      },
      received: {
        total: totalReceived,
        pending: pendingReceived,
        accepted: acceptedReceived,
        rejected: await GameRequest.countDocuments({ ...receivedQuery, status: 'rejected' })
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

module.exports = router;