/**
 * 数据库种子脚本 - 直接运行插入初始数据
 * 用法: node src/scripts/seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../models');

async function seed() {
  try {
    await db.sequelize.authenticate();
    console.log('[Seed] 数据库连接成功');

    // 同步表结构
    await db.sequelize.sync({ alter: true });
    console.log('[Seed] 表结构同步完成');

    // ===== 管理员 =====
    const adminHash = bcrypt.hashSync('admin123', 10);
    console.log(`[Seed] 管理员密码哈希: ${adminHash}`);
    console.log(`[Seed] 验证哈希: ${bcrypt.compareSync('admin123', adminHash)}`);

    const [admin] = await db.Admin.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        password_hash: adminHash,
        email: 'admin@ai-interview.com',
        role: 'admin',
        status: 1
      }
    });
    // 确保密码是最新的
    await admin.update({ password_hash: adminHash });
    console.log('[Seed] 管理员 admin/admin123 已创建/更新');

    const [superadmin] = await db.Admin.findOrCreate({
      where: { username: 'superadmin' },
      defaults: {
        username: 'superadmin',
        password_hash: adminHash,
        email: 'super@ai-interview.com',
        role: 'superadmin',
        status: 1
      }
    });
    await superadmin.update({ password_hash: adminHash });
    console.log('[Seed] 超级管理员 superadmin/admin123 已创建/更新');

    // ===== 测试用户 =====
    const userHash = bcrypt.hashSync('123456', 10);
    const testUsers = [
      { phone: '13800138001', email: 'test1@example.com', nickname: '张三', school: '清华大学', major: '计算机科学与技术', grade: '大四', job_direction: '开发' },
      { phone: '13800138002', email: 'test2@example.com', nickname: '李四', school: '北京大学', major: '软件工程', grade: '大三', job_direction: '测试' },
      { phone: '13800138003', email: 'test3@example.com', nickname: '王五', school: '浙江大学', major: '数据科学', grade: '研二', job_direction: '数据' }
    ];

    for (const u of testUsers) {
      const [user] = await db.User.findOrCreate({
        where: { phone: u.phone },
        defaults: { ...u, password_hash: userHash }
      });
      await user.update({ password_hash: userHash });
    }
    console.log('[Seed] 测试用户 (123456) 已创建/更新');

    // ===== 岗位 =====
    const positions = [
      { name: 'Java开发工程师', category: 'dev', description: '负责Java后端服务的设计、开发和维护', salary_range: '15K-30K', sort_order: 1 },
      { name: 'Python开发工程师', category: 'dev', description: '负责Python后端开发和数据处理', salary_range: '15K-28K', sort_order: 2 },
      { name: '前端开发工程师', category: 'dev', description: '负责Web前端页面开发', salary_range: '12K-25K', sort_order: 3 },
      { name: 'Android开发工程师', category: 'dev', description: '负责Android客户端开发', salary_range: '15K-30K', sort_order: 4 },
      { name: '软件测试工程师', category: 'test', description: '负责软件功能测试和质量保证', salary_range: '10K-20K', sort_order: 5 },
      { name: '自动化测试工程师', category: 'test', description: '负责自动化测试框架搭建和执行', salary_range: '12K-22K', sort_order: 6 },
      { name: 'Linux运维工程师', category: 'ops', description: '负责Linux服务器运维管理', salary_range: '12K-25K', sort_order: 7 },
      { name: '云计算工程师', category: 'ops', description: '负责云平台架构和运维', salary_range: '18K-35K', sort_order: 8 },
      { name: '产品经理', category: 'product', description: '负责产品规划和需求分析', salary_range: '15K-30K', sort_order: 9 },
      { name: '数据分析师', category: 'data', description: '负责数据分析和可视化', salary_range: '12K-25K', sort_order: 10 }
    ];

    for (const p of positions) {
      await db.Position.findOrCreate({ where: { name: p.name, category: p.category }, defaults: p });
    }
    console.log('[Seed] 岗位数据已创建');

    // ===== 题目分类 =====
    const categories = [
      { name: 'Java', description: 'Java相关面试题', sort_order: 1 },
      { name: 'Python', description: 'Python相关面试题', sort_order: 2 },
      { name: 'MySQL', description: 'MySQL数据库面试题', sort_order: 3 },
      { name: 'Redis', description: 'Redis缓存面试题', sort_order: 4 },
      { name: 'Vue', description: 'Vue前端面试题', sort_order: 5 },
      { name: 'React', description: 'React前端面试题', sort_order: 6 },
      { name: 'Linux', description: 'Linux运维面试题', sort_order: 7 },
      { name: '测试', description: '软件测试面试题', sort_order: 8 },
      { name: '产品', description: '产品经理面试题', sort_order: 9 },
      { name: '数据分析', description: '数据分析面试题', sort_order: 10 }
    ];

    for (const c of categories) {
      await db.QuestionCategory.findOrCreate({ where: { name: c.name }, defaults: c });
    }
    console.log('[Seed] 题目分类已创建');

    console.log('\n========================================');
    console.log('  种子数据导入完成!');
    console.log('  管理员: admin / admin123');
    console.log('  学生: 13800138001 / 123456');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] 错误:', error);
    process.exit(1);
  }
}

seed();
