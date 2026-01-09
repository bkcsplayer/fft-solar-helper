const nodemailer = require('nodemailer');

/**
 * Test SMTP configuration by sending a test email
 * @param {Object} smtpConfig - SMTP configuration object
 * @param {string} testEmail - Email address to send test to
 */
const testSMTPConnection = async (smtpConfig, testEmail) => {
    try {
        const port = parseInt(smtpConfig.port || '587');
        const secure = smtpConfig.secure === 'true' || smtpConfig.secure === true || port === 465;

        const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: port,
            secure: secure,
            auth: {
                user: smtpConfig.user,
                pass: smtpConfig.password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify connection configuration
        await transporter.verify();

        // Send test email
        const info = await transporter.sendMail({
            from: smtpConfig.from || smtpConfig.user,
            to: testEmail,
            subject: 'FFT Solar CRM - SMTP测试邮件',
            html: `
        <h2>✅ SMTP配置测试成功！</h2>
        <p>这是一封来自 FFT Solar CRM 的测试邮件。</p>
        <p>如果您收到这封邮件，说明您的SMTP配置正确。</p>
        <hr>
        <p><small>配置信息：</small></p>
        <ul>
          <li>服务器: ${smtpConfig.host}</li>
          <li>端口: ${port}</li>
          <li>加密: ${secure ? 'SSL/TLS' : 'STARTTLS'}</li>
          <li>用户: ${smtpConfig.user}</li>
        </ul>
        <hr>
        <small>此邮件由 FFT Solar CRM 系统自动发送 - ${new Date().toLocaleString('zh-CN')}</small>
      `
        });

        return {
            success: true,
            message: '测试邮件发送成功！请检查收件箱（可能在垃圾邮件中）',
            messageId: info.messageId
        };
    } catch (error) {
        console.error('SMTP test error:', error);

        // Parse error message for better user feedback
        let errorMessage = error.message;
        if (error.code === 'EAUTH') {
            errorMessage = '认证失败：用户名或密码错误。如果使用Gmail/QQ邮箱，需要使用"应用专用密码"';
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = '连接超时：请检查服务器地址和端口是否正确';
        } else if (error.code === 'ENOTFOUND') {
            errorMessage = '无法找到邮件服务器：请检查服务器地址是否正确';
        }

        return {
            success: false,
            error: errorMessage,
            code: error.code
        };
    }
};

module.exports = { testSMTPConnection };
