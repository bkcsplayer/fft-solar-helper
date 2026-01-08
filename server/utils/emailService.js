const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send project assignment notification
const sendProjectAssignmentEmail = async (staffEmail, staffName, projectData, role, calculatedPay) => {
  const roleNames = {
    leader: '领队',
    installer: '安装人员',
    electrician: '电工'
  };

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: staffEmail,
    subject: `新项目分配通知 - ${projectData.address}`,
    html: `
      <h2>项目分配通知</h2>
      <p>您好 ${staffName}，</p>
      <p>您已被分配到以下项目：</p>
      <ul>
        <li><strong>项目地址：</strong>${projectData.address}</li>
        <li><strong>客户姓名：</strong>${projectData.customer_name || '未提供'}</li>
        <li><strong>您的角色：</strong>${roleNames[role]}</li>
        <li><strong>预计薪资：</strong>$${parseFloat(calculatedPay).toFixed(2)}</li>
      </ul>
      <p>请按时到达施工现场。</p>
      <p>谢谢！</p>
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

// Send staff timesheet email
const sendStaffTimesheetEmail = async (staffEmail, staffName, timesheetData) => {
  const { startDate, endDate, projects, totalPay } = timesheetData;

  const projectRows = projects.map(p => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${p.address}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${p.assigned_at}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${p.role}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">$${parseFloat(p.calculated_pay).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: staffEmail,
    subject: `工资单 - ${startDate} 至 ${endDate}`,
    html: `
      <h2>工资单</h2>
      <p>您好 ${staffName}，</p>
      <p>以下是您在 ${startDate} 至 ${endDate} 期间的工作记录：</p>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px;">项目地址</th>
            <th style="border: 1px solid #ddd; padding: 8px;">分配日期</th>
            <th style="border: 1px solid #ddd; padding: 8px;">角色</th>
            <th style="border: 1px solid #ddd; padding: 8px;">薪资</th>
          </tr>
        </thead>
        <tbody>
          ${projectRows}
        </tbody>
      </table>
      <p style="margin-top: 20px;"><strong>总计薪资：$${parseFloat(totalPay).toFixed(2)}</strong></p>
      <p>项目总数：${projects.length}</p>
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

// Send vehicle report email
const sendVehicleReportEmail = async (adminEmail, vehicleData, maintenanceLogs) => {
  const { plate_number, model, current_mileage } = vehicleData;

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
    from: process.env.EMAIL_FROM,
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
