# Release Notes - v2.0

## 🎉 FFT Solar CRM v2.0

**Release Date:** 2026-01-08

---

## ✨ Major Features

### 📧 Email Notification System
- ✅ Professional HTML email templates with gradient headers and modern design
- ✅ Automatic email notifications for staff assignments
- ✅ SMTP configuration via Settings page
- ✅ Email testing functionality in Settings
- ✅ Responsive email design for mobile devices

### 📱 Telegram Integration
- ✅ Real-time Telegram notifications for system events
- ✅ Project creation notifications
- ✅ Staff assignment notifications
- ✅ Progress update notifications
- ✅ Configurable via Settings page

### 🏗️ Project Management Enhancements
- ✅ Installation date field added to projects
- ✅ Allow resending notifications to already-notified staff
- ✅ Enhanced project form with installation date picker
- ✅ Email notifications include project details (address, customer, role, watts, panels, installation date)

---

## 📋 Detailed Changes

### Backend

#### New Features
1. **Email Service (`server/utils/emailService.js`)**
   - Dynamic SMTP configuration from database
   - Auto-detection of SSL/TLS based on port
   - Professional HTML email templates
   - From address formatting with sender name

2. **Telegram Service (`server/services/telegramService.js`)**
   - `initTelegram()` - Initialize bot with database config
   - `sendMessage()` - Send formatted messages
   - `notifyProjectCreated()` - Project creation notifications
   - `notifyStaffAssigned()` - Staff assignment notifications
   - `notifyProgressUpdate()` - Progress update notifications
   - `notifyFinanceRecord()` - Finance record notifications
   - `notifyError()` - System error notifications

3. **Settings Controller** (`server/controllers/settingsController.js`)
   - `testSMTP` API endpoint - Test SMTP configuration
   - Email config validation

4. **Project Controller** (`server/controllers/projectController.js`)
   - Telegram notifications on project creation
   - Telegram notifications on staff assignment
   - Telegram notifications on progress updates
   - Removed `is_notified` check to allow resending

#### Database
- Added `installation_date` column to `projects` table
- SMTP settings stored in `system_settings` table:
  - `smtp_host`, `smtp_port`, `smtp_user`, `smtp_password`
  - `smtp_from_email`, `smtp_from_name`, `smtp_secure`
- Telegram settings in `system_settings`:
  - `telegram_token`, `telegram_chat_id`

### Frontend

#### New Features
1. **Settings Page Enhancement**
   - SMTP test functionality with test email input
   - Real-time test results display
   - Better error handling and user feedback

2. **Project Form** (`client/src/pages/Projects/ProjectForm.js`)
   - Installation date picker (date input)
   - Automatically included in project creation/edit

3. **Project Detail** (`client/src/pages/Projects/ProjectDetail.js`)
   - Improved notification feedback (6-second display)
   - Distinct success messages for email sending
   - Better error handling with inline alerts

### Email Templates

**Project Assignment Email:**
```
🌞 项目分配通知

📍 项目地址: [address]
👤 客户姓名: [name]
👷 您的角色: [role]
📅 安装日期: [date]
⚡ 总瓦数: [watts] W
📦 面板数量: [quantity] 张
```

**Features:**
- Purple gradient header
- Golden information card
- Mobile responsive
- Modern glassmorphism design

### Telegram Notifications

**Message Format Example:**
```
🏗️ 新项目创建

📍 地址：138 Sage Hill Grove NW
👤 客户：Kuo Bao
📅 安装日期：2026年1月15日
⚡ 总瓦数：12,000 W
📦 面板数量：30 张

✅ 项目已成功创建
```

---

## 🔧 Dependencies Added

- `node-telegram-bot-api@^0.65.1` - Telegram Bot integration

---

## 🐛 Bug Fixes

- Fixed email service to read SMTP config from database instead of env variables
- Fixed "Sender is not same as SMTP authenticate username" error
- Fixed from address formatting to use proper "Name <email>" format
- Fixed ProjectDetail email notification error handling

---

## 📝 Configuration

### SMTP Settings (via Settings Page)
- SMTP Host
- SMTP Port (587 for STARTTLS, 465 for SSL)
- SMTP Username/Email
- SMTP Password (use App Password for Gmail)
- From Name
- From Email

### Telegram Settings (via Settings Page)
- Telegram Bot Token
- Telegram Chat ID

---

## 🚀 Upgrade Instructions

1. Pull latest code from repository
2. Rebuild Docker containers:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```
3. Configure SMTP settings in Settings page
4. (Optional) Configure Telegram in Settings page
5. Test email sending using "Test SMTP" button
6. Create a test project to verify notifications

---

## 📊 Statistics

- **Files Changed:** 15+
- **Lines Added:** 800+
- **New Features:** 3 major features
- **Bug Fixes:** 4 critical fixes

---

## 🙏 Acknowledgments

Special thanks for the continuous feedback and testing that made this release possible!

---

## 📌 Next Steps (Future Releases)

- [ ] Telegram Bot commands (/status, /projects, /today, /help)
- [ ] SMS notifications integration
- [ ] Advanced notification filtering
- [ ] Notification history/logs
- [ ] Email templates customization UI

---

**For issues or questions, please open an issue on GitHub.**
