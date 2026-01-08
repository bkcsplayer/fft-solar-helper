# 🎉 FFT Solar CRM - New Features Guide

## Overview
This document describes all the new features that have been added to the FFT Solar CRM system.

---

## ✨ New Features Summary

### 1. **Settings Management**
Admin can now configure system settings without modifying `.env` files.

### 2. **Staff Performance Tracking**
Detailed performance reports for each staff member with monthly/yearly filtering.

### 3. **Project Inspection Status**
Track inspection results for each project progress stage with fail reason notes.

### 4. **English Language Support**
New pages created in English (Settings, Staff Performance) with sidebar menu in English.

---

## 📱 Feature Details

### 1. Settings Page

**Access:** Click "Settings" in the sidebar

**Features:**
- **Profile Tab:**
  - Update admin name, email, phone
  - Change password (requires current password)
  - View username (read-only)

- **Email & Notifications Tab:**
  - Telegram Bot Token configuration
  - SMTP Email settings:
    - Host, Port, Username, Password
    - From Name and From Email
  - Helpful guide for Gmail App Passwords

- **Company Info Tab:**
  - Company Name
  - Company Address
  - Company Phone
  - Company Email

**API Endpoints:**
```
GET  /api/settings/system         - Get all system settings
PUT  /api/settings/system         - Update system settings
GET  /api/settings/profile        - Get admin profile
PUT  /api/settings/profile        - Update admin profile (including password)
```

**Database Table:**
- `system_settings` - Stores all configuration values
- Settings are stored as key-value pairs
- Supported by the user via web interface (no need to edit files)

---

### 2. Staff Performance Page

**Access:** From Staff List → Click on a staff member → "Performance" button

**URL:** `/staff/:id/performance`

**Features:**
- **Period Selector:**
  - Year dropdown (last 5 years)
  - Month dropdown (or select "All Year")

- **Summary Cards:**
  - Total Projects Completed
  - Total Panels Installed
  - Total Income ($)
  - Average Income per Project ($)

- **Project Details Table:**
  | Column | Description |
  |--------|-------------|
  | Address | Project location |
  | Customer | Customer name |
  | Client | Client company name |
  | Panels | Number of panels installed |
  | Brand | Panel brand |
  | Role | Staff role in project (leader/installer/electrician) |
  | Staff Income | How much the staff member earned |
  | Project Revenue | Total project revenue based on rate_per_watt |
  | Status | Project status |

- **Calculations:**
  - Income calculated based on `pay_type`:
    - `per_panel`: `panel_quantity × pay_rate`
    - `per_project`: Fixed `pay_rate`
  - Revenue calculated as: `total_watt × client.rate_per_watt`

**API Endpoint:**
```
GET /api/staff/:id/performance?year=2024&month=12
```

**Response Example:**
```json
{
  "summary": {
    "staff_id": 1,
    "staff_name": "Tom Zhang",
    "staff_role": "electrician",
    "pay_type": "per_project",
    "pay_rate": 150.00,
    "period": {
      "start": "2024-12-01T00:00:00.000Z",
      "end": "2024-12-31T23:59:59.000Z",
      "year": 2024,
      "month": 12
    },
    "total_projects": 3,
    "total_panels_installed": 120,
    "total_income": 450.00,
    "average_income_per_project": 150.00
  },
  "projects": [
    {
      "project_id": 1,
      "address": "123 Main St",
      "customer_name": "John Doe",
      "client_name": "SunPower Corp",
      "panel_count": 40,
      "panel_brand": "Canadian Solar",
      "staff_income": 150.00,
      "project_revenue": 8000.00,
      "status": "completed",
      "assigned_at": "2024-12-01T10:00:00.000Z",
      "role": "electrician"
    }
  ]
}
```

---

### 3. Project Inspection Status

**Database Changes:**
- Added to `project_progress` table:
  - `inspection_status` VARCHAR(20) - Values: 'pass', 'fail', 'waiting'
  - `inspection_fail_reason` TEXT - Notes when inspection fails

**Usage:**
- Track inspection results for each construction stage
- Record why an inspection failed
- Default status is 'waiting'

**Stages with Inspection:**
1. `roof_base` - Roof base installation
2. `electrical` - Electrical work
3. `roof_install` - Roof panel installation
4. `bird_net` - Bird netting installation

---

### 4. Project Files (Photos & Documents)

**Database Table:** `project_files`

**Features:**
- Upload photos for projects
- Upload documents (PDFs, etc.)
- Track who uploaded each file
- Store file metadata (size, type, path)

**Table Structure:**
```sql
CREATE TABLE project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    file_type VARCHAR(20) CHECK (file_type IN ('photo', 'document')),
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Storage:**
- Files stored in Docker volume: `backend_uploads`
- Persistent across container restarts

---

## 🗄️ Database Schema Updates

### New Tables

1. **system_settings**
   ```sql
   CREATE TABLE system_settings (
       id SERIAL PRIMARY KEY,
       setting_key VARCHAR(100) UNIQUE NOT NULL,
       setting_value TEXT,
       setting_type VARCHAR(20) DEFAULT 'text',
       updated_by INTEGER REFERENCES users(id),
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **project_files**
   ```sql
   CREATE TABLE project_files (
       id SERIAL PRIMARY KEY,
       project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
       file_type VARCHAR(20) CHECK (file_type IN ('photo', 'document')),
       file_name VARCHAR(255) NOT NULL,
       file_path VARCHAR(500) NOT NULL,
       file_size INTEGER,
       uploaded_by INTEGER REFERENCES users(id),
       uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### Modified Tables

1. **project_progress**
   - Added: `inspection_status VARCHAR(20) DEFAULT 'waiting'`
   - Added: `inspection_fail_reason TEXT`

2. **users**
   - Added: `phone VARCHAR(50)`

---

## 🔌 API Endpoints

### Settings APIs

```
GET  /api/settings/system
PUT  /api/settings/system
GET  /api/settings/profile
PUT  /api/settings/profile
```

### Staff Performance API

```
GET  /api/staff/:id/performance?year=2024&month=12
```

### Project Files APIs (Already Implemented)

```
GET    /api/projects/:id/files
POST   /api/projects/:id/files/upload
DELETE /api/projects/:projectId/files/:fileId
```

---

## 🚀 How to Use New Features

### 1. Access Settings

1. Login as admin (`admin` / `admin123`)
2. Click "Settings" in the sidebar
3. Configure:
   - Your profile information
   - Telegram bot token
   - SMTP email settings
   - Company information
4. Click "Save" buttons to persist changes

### 2. View Staff Performance

1. Navigate to "Staff" page
2. Click on any staff member
3. Click "Performance" button
4. Select Year and Month
5. View summary cards and detailed project list

### 3. Track Inspection Status

1. Go to Project Details page
2. View construction progress
3. Each stage shows inspection status:
   - ✅ Pass - Inspection passed
   - ❌ Fail - Inspection failed (with reason)
   - ⏳ Waiting - Pending inspection

### 4. Upload Project Files

1. Open Project Details
2. Navigate to "Files" tab
3. Upload photos or documents
4. View/download uploaded files

---

## 📝 Configuration Settings

### Default System Settings

| Key | Value | Description |
|-----|-------|-------------|
| `telegram_token` | (empty) | Telegram Bot Token for notifications |
| `smtp_host` | (empty) | SMTP server hostname |
| `smtp_port` | 587 | SMTP server port |
| `smtp_user` | (empty) | SMTP username/email |
| `smtp_password` | (empty) | SMTP password |
| `smtp_from_name` | FFT Solar CRM | Email sender name |
| `smtp_from_email` | noreply@fftsolar.com | Email sender address |
| `company_name` | FFT Solar Installation Company | Your company name |
| `company_address` | (empty) | Company address |
| `company_phone` | (empty) | Company phone |
| `company_email` | (empty) | Company email |

---

## 🎨 UI Improvements

### Sidebar Menu (Now in English)

- Dashboard
- Clients
- Staff
- Projects
- Vehicles
- Assets
- Finance
- **Settings** ← New
- Logout

### New Pages (Full English)

1. **Settings Page**
   - Professional 3-tab interface
   - Password visibility toggles
   - Helpful tooltips and guides

2. **Staff Performance Page**
   - Modern card-based summary
   - Responsive date pickers
   - Color-coded status chips
   - Detailed data table

---

## 🔒 Security Notes

1. **Password Changes:**
   - Requires current password verification
   - New password must match confirmation
   - Uses bcrypt hashing

2. **Settings Access:**
   - Only authenticated admin can access
   - All API endpoints require JWT token

3. **File Uploads:**
   - Files stored securely in Docker volumes
   - Upload tracked with user ID
   - File type validation

---

## 🐛 Known Issues & Next Steps

### Remaining Work

1. **Translation to English:**
   - Staff List page (still in Chinese)
   - Client pages (still in Chinese)
   - Project pages (still in Chinese)
   - Dashboard (still in Chinese)
   - Finance pages (still in Chinese)

2. **Future Enhancements:**
   - Email notification implementation using SMTP settings
   - Telegram notification using bot token
   - File preview functionality
   - Inspection photo upload integration

---

## 📊 Testing Checklist

- [ ] Login to system
- [ ] Navigate to Settings page
- [ ] Update profile information
- [ ] Change password
- [ ] Configure SMTP settings
- [ ] Configure Telegram token
- [ ] Update company information
- [ ] Navigate to Staff page
- [ ] Click on a staff member
- [ ] View performance report
- [ ] Change year/month filters
- [ ] Verify calculations are correct
- [ ] Check that Settings appears in sidebar
- [ ] Verify all new API endpoints work

---

## 🎯 Current System Status

**✅ Deployed and Running**
- Backend: http://localhost:3200
- Frontend: http://localhost:3201
- Database: localhost:3202

**✅ All Containers Healthy**
- fft-solar-backend: Running
- fft-solar-frontend: Running
- fft-solar-db: Running

**✅ Features Ready to Use**
- Settings Management
- Staff Performance Tracking
- Project Inspection Status
- Project File Uploads

**⏳ Pending Translation**
- Multiple frontend pages still contain Chinese text
- Will be translated in next update

---

## 📞 Support

If you encounter any issues:
1. Check Docker container logs: `docker-compose logs [service]`
2. Verify database connection
3. Check API responses in browser DevTools
4. Review error messages

---

**Last Updated:** 2026-01-06
**Version:** 1.1.0
**Status:** ✅ Deployed and Operational
