// Direct test without database
const TelegramBot = require('node-telegram-bot-api');

const token = '7438045393:AAGk-b8sBaE6AIWXt3BrmOHgI_ENjHJTpkM';
const chatId = '1076856226';

console.log('📱 Testing Telegram...');
console.log(`Token: ${token.substring(0, 20)}...`);
console.log(`Chat ID: ${chatId}`);

const bot = new TelegramBot(token, { polling: false });

bot.sendMessage(chatId, '🧪 <b>Telegram配置测试成功！</b>\n\n✅ FFT Solar CRM 已成功连接到您的Telegram', {
    parse_mode: 'HTML'
})
    .then(result => {
        console.log('✅ Message sent successfully!');
        console.log(`   Message ID: ${result.message_id}`);
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('   Response:', JSON.stringify(error.response.body, null, 2));
        }
        process.exit(1);
    });
