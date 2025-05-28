const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

const app = express();

// 中间件
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static('public/uploads'));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/users', require('./routes/users'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    code: 200,
    message: '游戏OA系统服务器运行正常', 
    timestamp: new Date().toISOString() 
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    code: 500,
    message: '服务器内部错误', 
    error: process.env.NODE_ENV === 'development' ? err.message : '服务器错误' 
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 游戏OA系统服务器运行在端口 ${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
});