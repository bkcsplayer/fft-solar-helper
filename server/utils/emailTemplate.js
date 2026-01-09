/**
 * Generate a professional HTML email template
 * @param {Object} options - Email template options
 * @param {string} options.title - Email title
 * @param {string} options.greeting - Greeting message (e.g., "您好 张三")
 * @param {string} options.content - Main content (HTML)
 * @param {string} options.footer - Optional footer text
 */
const generateEmailTemplate = ({ title, greeting, content, footer }) => {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif, 'Microsoft YaHei', '微软雅黑';
      background-color: #f5f7fa;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px 40px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .email-body {
      padding: 40px;
    }
    .greeting {
      font-size: 16px;
      color: #333;
      margin-bottom: 20px;
    }
    .info-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-left: 4px solid #f59e0b;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .info-item {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid rgba(245, 158, 11, 0.2);
    }
    .info-item:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #92400e;
      min-width: 100px;
      flex-shrink: 0;
    }
    .info-value {
      color: #451a03;
      flex: 1;
    }
    .message-text {
      line-height: 1.8;
      color: #555;
      margin: 20px 0;
    }
    .email-footer {
      background-color: #f9fafb;
      padding: 20px 40px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      font-size: 12px;
      color: #9ca3af;
      margin: 5px 0;
    }
    .brand {
      color: #667eea;
      font-weight: 600;
    }
    @media only screen and (max-width: 600px) {
      .email-body {
        padding: 30px 20px;
      }
      .email-header {
        padding: 25px 20px;
      }
      .info-label {
        min-width: 80px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>🌞 ${title}</h1>
    </div>
    <div class="email-body">
      <div class="greeting">${greeting}</div>
      ${content}
      ${footer ? `<div class="message-text">${footer}</div>` : ''}
    </div>
    <div class="email-footer">
      <p class="footer-text">此邮件由 <span class="brand">FFT Solar CRM</span> 系统自动发送</p>
      <p class="footer-text">请勿直接回复此邮件</p>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = { generateEmailTemplate };
