const nodemailer = require('nodemailer');
const { SystemSettings } = require('../models');

// Get SMTP configuration from database
const getSMTPConfig = async () => {
  try {
    const settings = await SystemSettings.findAll({
      where: {
        setting_key: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from_email', 'smtp_from_name', 'smtp_secure']
      }
    });

    const config = {};
    settings.forEach(s => {
      config[s.setting_key] = s.setting_value;
    });

    const port = parseInt(config.smtp_port || process.env.EMAIL_PORT || '587');

    // Auto-detect SSL/TLS based on port
    const secure = config.smtp_secure === 'true' || port === 465;

    // Use environment variables as fallback
    return {
      host: config.smtp_host || process.env.EMAIL_HOST,
      port: port,
      secure: secure, // true for port 465, false for other ports like 587
      auth: {
        user: config.smtp_user || process.env.EMAIL_USER,
        pass: config.smtp_password || process.env.EMAIL_PASSWORD
      },
      from: config.smtp_from_email || process.env.EMAIL_FROM,
      fromName: config.smtp_from_name || 'FFT Solar CRM',
      // Add additional options for better compatibility
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      }
    };
  } catch (error) {
    console.error('Failed to load SMTP config from database:', error);
    // Fallback to environment variables
    return {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      from: process.env.EMAIL_FROM
    };
  }
};

// Send project assignment notification
const sendProjectAssignmentEmail = async (staffEmail, staffName, projectData, role, calculatedPay) => {
  const roleNames = {
    leader: '领队',
    installer: '安装人员',
    electrician: '电工'
  };

  try {
    // Get SMTP config from database
    const smtpConfig = await getSMTPConfig();

    // Check if SMTP is configured
    if (!smtpConfig.host || !smtpConfig.auth.user) {
      return {
        success: false,
        error: 'SMTP not configured. Please configure email settings in Settings page.'
      };
    }

    // Create transporter with current config
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: smtpConfig.auth,
      tls: {
        rejectUnauthorized: false
      }
    });

    // Format from address correctly: "Name <email>"
    const fromAddress = smtpConfig.fromName
      ? `"${smtpConfig.fromName}" <${smtpConfig.auth.user}>`
      : smtpConfig.auth.user;

    const mailOptions = {
      from: fromAddress,
      to: staffEmail,
      subject: `新项目分配通知 - ${projectData.address}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; font-family: 'Microsoft YaHei', Arial, sans-serif; background: #f5f7fa; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
    .header h1 { margin: 0; color: #fff; font-size: 24px; }
    .body { padding: 30px; }
    .greeting { font-size: 16px; margin-bottom: 20px; }
    .info-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-item { padding: 8px 0; border-bottom: 1px solid rgba(245,158,11,0.2); }
    .info-item:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #92400e; display: inline-block; width: 100px; }
    .value { color: #451a03; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌞 项目分配通知</h1>
    </div>
    <div class="body">
      <div class="greeting">您好 ${staffName}，</div>
      <p>您已被分配到以下项目，请查看详细信息：</p>
      <div class="info-box">
        <div class="info-item">
          <span class="label">📍 项目地址</span>
          <span class="value">${projectData.address}</span>
        </div>
        <div class="info-item">
          <span class="label">👤 客户姓名</span>
          <span class="value">${projectData.customer_name || '未提供'}</span>
        </div>
        <div class="info-item">
          <span class="label">👷 您的角色</span>
          <span class="value">${roleNames[role]}</span>
        </div>
        ${projectData.installation_date ? `
        <div class="info-item">
          <span class="label">📅 安装日期</span>
          <span class="value">${new Date(projectData.installation_date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        ` : ''}
        <div class="info-item">
          <span class="label">⚡ 总瓦数</span>
          <span class="value">${(projectData.panel_watt * projectData.panel_quantity).toLocaleString()} W</span>
        </div>
        <div class="info-item">
          <span class="label">📦 面板数量</span>
          <span class="value">${projectData.panel_quantity} 张</span>
        </div>
      </div>
      <p>请提前做好准备，按时到达施工现场。祝工作顺利！</p>
    </div>
    <div class="footer">
      此邮件由 <strong style="color:#667eea;">FFT Solar CRM</strong> 系统自动发送
    </div>
  </div>
</body>
</html>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send staff timesheet email
const sendStaffTimesheetEmail = async (staffEmail, staffName, timesheetData) => {
  const { startDate, endDate, projects, totalExpected, totalPaid, totalUnpaid, projectCount } = timesheetData;

  // Get SMTP config
  const smtpConfig = await getSMTPConfig();

  if (!smtpConfig.host || !smtpConfig.auth.user) {
    return { success: false, error: 'SMTP not configured' };
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: smtpConfig.auth,
    tls: { rejectUnauthorized: false }
  });

  const fromAddress = smtpConfig.fromName
    ? `"${smtpConfig.fromName}" <${smtpConfig.auth.user}>`
    : smtpConfig.auth.user;

  // Generate Project Cards HTML
  const projectCards = projects.map(p => `
    <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px; overflow: hidden;">
      <div style="padding: 16px; border-bottom: 1px solid #f3f4f6;">
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">📍 ${p.address}</div>
        <div style="display: flex; gap: 16px; font-size: 13px; color: #6b7280; margin-bottom: 8px;">
           <span style="display: inline-block;">📦 ${p.panel_quantity} panels</span>
           <span style="display: inline-block;">📅 ${p.assigned_at}</span>
        </div>
        <div style="font-size: 13px; color: #6b7280;">
          ⚡ Total: ${p.total_watt.toLocaleString()} W
        </div>
      </div>
      <div style="padding: 12px 16px; background: #f9fafb; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-weight: 600; color: #059669; font-size: 14px;">
           💰 Staff Pay: $${parseFloat(p.calculated_pay).toFixed(2)}
        </div>
        ${p.paid_amount > 0 ? `
          <div style="font-size: 12px; color: #059669; background: #d1fae5; padding: 2px 8px; border-radius: 9999px;">
             已付: $${parseFloat(p.paid_amount).toFixed(2)}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');

  const mailOptions = {
    from: fromAddress,
    to: staffEmail,
    subject: `工资单 - ${startDate} 至 ${endDate}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; }
    .content { padding: 30px 20px; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">工资单明细</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">${startDate} 至 ${endDate}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p style="margin-bottom: 24px; color: #374151;">您好 <strong>${staffName}</strong>，</p>
      
      <!-- Summary Cards -->
      <div style="margin-bottom: 30px;">
         <h3 style="color: #667eea; margin-top:0; border-bottom: 2px dashed #e5e7eb; padding-bottom: 10px;">💰 薪资汇总</h3>
         
         <!-- Total Expected -->
         <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #ec4899;">
             <div style="font-size: 12px; color: #be185d; text-transform: uppercase; letter-spacing: 1px;">应支付 (Total Expected)</div>
             <div style="font-size: 24px; font-weight: bold; color: #be185d; margin-top: 4px;">$${totalExpected.toFixed(2)}</div>
         </div>

         <div style="display: flex; gap: 12px;">
             <!-- Paid -->
             <div style="flex: 1; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 16px; border-radius: 8px; border-left: 4px solid #059669;">
                 <div style="font-size: 11px; color: #047857; text-transform: uppercase;">已支付 (Paid)</div>
                 <div style="font-size: 20px; font-weight: bold; color: #047857; margin-top: 4px;">$${totalPaid.toFixed(2)}</div>
             </div>
             
             <!-- Unpaid -->
             <div style="flex: 1; background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%); padding: 16px; border-radius: 8px; border-left: 4px solid #f97316;">
                 <div style="font-size: 11px; color: #c2410c; text-transform: uppercase;">待支付 (Unpaid)</div>
                 <div style="font-size: 20px; font-weight: bold; color: #c2410c; margin-top: 4px;">$${totalUnpaid.toFixed(2)}</div>
             </div>
         </div>
      </div>

      <!-- Project List -->
      <div>
         <h3 style="color: #667eea; margin-bottom: 16px; border-bottom: 2px dashed #e5e7eb; padding-bottom: 10px;">📋 项目明细 (${projects.length})</h3>
         ${projectCards}
      </div>

      <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        此邮件由 FFT Solar CRM 系统自动发送
      </div>
    </div>
  </div>
</body>
</html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send vehicle report email
const sendVehicleReportEmail = async (adminEmail, vehicleData, maintenanceLogs) => {
  const { plate_number, model, current_mileage } = vehicleData;

  // Get SMTP config
  const smtpConfig = await getSMTPConfig();

  if (!smtpConfig.host || !smtpConfig.auth.user) {
    return { success: false, error: 'SMTP not configured' };
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: smtpConfig.auth,
    tls: { rejectUnauthorized: false }
  });

  const fromAddress = smtpConfig.fromName
    ? `"${smtpConfig.fromName}" <${smtpConfig.auth.user}>`
    : smtpConfig.auth.user;

  const logRows = maintenanceLogs.map(log => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${log.maintenance_date}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${log.maintenance_type}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${log.description || '-'}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">$${parseFloat(log.cost || 0).toFixed(2)}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${log.performed_by || '-'}</td>
    </tr>
  `).join('');

  const totalCost = maintenanceLogs.reduce((sum, log) => sum + parseFloat(log.cost || 0), 0);

  const mailOptions = {
    from: fromAddress,
    to: adminEmail,
    subject: `车辆维护报告 - ${plate_number}`,
    html: `
      <h2>车辆维护报告</h2>
      <h3>车辆信息</h3>
      <ul>
        <li><strong>车牌号：</strong>${plate_number}</li>
        <li><strong>型号：</strong>${model || '-'}</li>
        <li><strong>当前里程：</strong>${current_mileage} km</li>
      </ul>
      <h3>维护记录</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px;">日期</th>
            <th style="border: 1px solid #ddd; padding: 8px;">类型</th>
            <th style="border: 1px solid #ddd; padding: 8px;">描述</th>
            <th style="border: 1px solid #ddd; padding: 8px;">费用</th>
            <th style="border: 1px solid #ddd; padding: 8px;">执行人</th>
          </tr>
        </thead>
        <tbody>
          ${logRows}
        </tbody>
      </table>
      <p style="margin-top: 20px;"><strong>总维护费用：$${totalCost.toFixed(2)}</strong></p>
      <p>维护记录数：${maintenanceLogs.length}</p>
      <hr>
      <small>此邮件由 FFT Solar CRM 系统自动发送</small>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendProjectAssignmentEmail,
  sendStaffTimesheetEmail,
  sendVehicleReportEmail
};
