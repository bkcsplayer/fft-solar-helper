const TelegramBot = require('node-telegram-bot-api');
const { SystemSettings } = require('../models');

let bot = null;
let chatId = null;

/**
 * Initialize Telegram Bot
 */
const initTelegram = async () => {
    try {
        const settings = await SystemSettings.findAll({
            where: {
                setting_key: ['telegram_token', 'telegram_chat_id']
            }
        });

        const config = {};
        settings.forEach(s => {
            config[s.setting_key] = s.setting_value;
        });

        const token = config.telegram_token || process.env.TELEGRAM_TOKEN;
        chatId = config.telegram_chat_id || process.env.TELEGRAM_CHAT_ID;

        if (!token) {
            console.log('⚠️  Telegram bot token not configured');
            return false;
        }

        if (!chatId) {
            console.log('⚠️  Telegram chat ID not configured');
            return false;
        }

        bot = new TelegramBot(token, { polling: false });
        console.log('✅ Telegram bot initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Telegram:', error.message);
        return false;
    }
};

/**
 * Send message to Telegram
 * @param {string} message - Message text
 * @param {Object} options - Optional formatting options
 */
const sendMessage = async (message, options = {}) => {
    try {
        if (!bot || !chatId) {
            await initTelegram();
        }

        if (!bot || !chatId) {
            console.log('⚠️  Telegram not configured, skipping message');
            return false;
        }

        await bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            ...options
        });

        return true;
    } catch (error) {
        console.error('❌ Failed to send Telegram message:', error.message);
        return false;
    }
};

/**
 * Send project creation notification
 */
const notifyProjectCreated = async (project) => {
    const installDate = project.installation_date
        ? `\n📅 安装日期：${new Date(project.installation_date).toLocaleDateString('zh-CN')}`
        : '';

    const message = `
🏗️ <b>新项目创建</b>

📍 地址：${project.address}
👤 客户：${project.customer_name || '未提供'}${installDate}
⚡ 总瓦数：${(project.panel_watt * project.panel_quantity).toLocaleString()} W
📦 面板数量：${project.panel_quantity} 张

✅ 项目已成功创建
  `.trim();

    return await sendMessage(message);
};

/**
 * Send staff assignment notification
 */
const notifyStaffAssigned = async (project, staff, role) => {
    const roleNames = {
        leader: '领队',
        installer: '安装人员',
        electrician: '电工'
    };

    const message = `
👷 <b>人员分配</b>

📍 项目：${project.address}
👤 人员：${staff.name}
🔧 角色：${roleNames[role] || role}

✅ 分配成功
  `.trim();

    return await sendMessage(message);
};

/**
 * Send progress update notification
 */
const notifyProgressUpdate = async (project, stage, isCompleted) => {
    const stageNames = {
        roof_base: '屋顶基础安装',
        electrical: '电气安装',
        roof_install: '屋顶最终安装',
        bird_net: '防鸟网安装'
    };

    const stageName = stageNames[stage] || stage;
    const status = isCompleted ? '✅ 已完成' : '🔄 进行中';

    const message = `
📊 <b>进度更新</b>

📍 项目：${project.address}
${status}：${stageName}

⏭️ 继续加油！
  `.trim();

    return await sendMessage(message);
};

/**
 * Send finance record notification
 */
const notifyFinanceRecord = async (record, type) => {
    const typeEmoji = type === 'income' ? '💰' : '💸';
    const typeName = type === 'income' ? '收入' : '支出';

    const message = `
${typeEmoji} <b>${typeName}记录</b>

📝 描述：${record.description || '无'}
💵 金额：$${parseFloat(record.amount).toLocaleString()}
📅 日期：${new Date(record.transaction_date).toLocaleDateString('zh-CN')}

✅ 记录已创建
  `.trim();

    return await sendMessage(message);
};

/**
 * Send error notification
 */
const notifyError = async (error, context) => {
    const message = `
⚠️ <b>系统错误</b>

📝 上下文：${context}
❌ 错误：${error.message}

请及时处理
  `.trim();

    return await sendMessage(message);
};

module.exports = {
    initTelegram,
    sendMessage,
    notifyProjectCreated,
    notifyStaffAssigned,
    notifyProgressUpdate,
    notifyFinanceRecord,
    notifyError
};
