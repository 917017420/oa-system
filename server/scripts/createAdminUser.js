require('dotenv').config({ path: '../.env' }); // 确保.env文件在server目录的上一级
const mongoose = require('mongoose');
const User = require('../models/User'); // 假设User模型路径正确

const MONGODB_URI = process.env.MONGO_URI;

async function createAdminUser() {
  if (!MONGODB_URI) {
    console.error('错误：未设置 MONGODB_URI 环境变量。请在 .env 文件中添加它。');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('已成功连接到 MongoDB。');

    const adminUsername = 'admin';
    const adminEmail = 'admin@example.com';
    const adminPassword = 'adminpassword'; // 强烈建议在实际部署中使用更强的密码

    // 检查管理员用户是否已存在
    const existingAdmin = await User.findOne({ 
      $or: [{ username: adminUsername }, { email: adminEmail }]
    });

    if (existingAdmin) {
      console.log(`用户名为 '${adminUsername}' 或邮箱为 '${adminEmail}' 的管理员用户已存在。`);
      if (existingAdmin.roles.includes('admin')) {
        console.log('该用户已经是管理员。无需操作。');
      } else {
        existingAdmin.roles.push('admin');
        await existingAdmin.save();
        console.log(`用户 '${existingAdmin.username}' 已被更新为管理员角色。`);
      }
      return;
    }

    // 创建新的管理员用户
    const adminUser = new User({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword, // 密码将在保存前通过 User模型的 pre-save 钩子进行哈希处理
      name: '系统管理员',
      roles: ['admin', 'employee'], // 分配 'admin' 和 'employee' 角色
      status: 'active', // 设置为活动状态
      // 可以根据需要添加其他字段，如 department, position 等
      // department: mongoose.Types.ObjectId(), // 示例：如果需要关联部门
      // position: 'Administrator',
    });

    await adminUser.save();
    console.log(`管理员用户 '${adminUser.username}' 已成功创建。`);
    console.log('默认凭据:');
    console.log(`  用户名: ${adminUsername}`);
    console.log(`  密码: ${adminPassword}`);
    console.log('请在首次登录后立即更改密码！');

  } catch (error) {
    console.error('创建管理员用户时出错:', error);
    if (error.name === 'MongoNetworkError') {
      console.error('数据库连接失败。请检查您的MongoDB服务是否正在运行以及MONGODB_URI是否正确。');
    }
  } finally {
    await mongoose.disconnect();
    console.log('已断开与 MongoDB 的连接。');
  }
}

createAdminUser();