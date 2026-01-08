# FFT Solar CRM Management System

A comprehensive internal management system for solar installation companies to manage projects, staff, clients, assets, and financial statistics.

## 🎉 Latest Updates (v1.1.0)

### New Features
- ⚙️ **Settings Management** - Configure system settings via web interface
- 📊 **Staff Performance Reports** - Track employee income and performance by month/year
- 🔍 **Inspection Status Tracking** - Monitor inspection results for each project stage
- 📁 **Project File Management** - Upload photos and documents to projects
- 🌐 **English Interface** - New pages and sidebar menu in English

[View Complete Feature Guide →](./NEW_FEATURES_GUIDE.md)

---

## Project Overview

### Core Business Logic
- **Address-Based Projects**: Each construction project is based on an installation address
- **Revenue Source**: Payment from client companies based on total wattage (W) installed
- **Expenses**: Salaries for team leaders, installers, electricians, and other operational costs

### Organization Structure
```
Manager → Team Leaders → Installers (multiple), Electricians
```

## Tech Stack

### Backend
- **Database**: PostgreSQL 14
- **Backend Framework**: Node.js + Express
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Email Service**: Nodemailer
- **Password Hashing**: bcryptjs

### Frontend
- **Frontend Framework**: React 18
- **UI Component Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts

### Deployment
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (for frontend)
- **Ports**:
  - Frontend: 3201
  - Backend API: 3200
  - Database: 3202

## Features

### 1. Dashboard
- Project statistics (pending, in-progress, completed)
- Monthly financial overview (income, expenses, profit)
- Total wattage installed this month
- Interactive charts and analytics

### 2. Client Management
- Client company information
- Rate per watt configuration
- Active/inactive status tracking
- Contact information

### 3. Staff Management
- Team members (leaders, installers, electricians)
- Pay structure (per-panel or per-project)
- Pay rates
- **NEW: Performance reports** with monthly income tracking

### 4. Project Management
- Project details (address, customer, panels)
- Client assignment
- Panel specifications (brand, wattage, quantity)
- Project status tracking
- Team assignments
- Progress tracking (4 stages)
- **NEW: Inspection status** (pass/fail/waiting)
- **NEW: Photo and document uploads**
- Automatic revenue calculation

### 5. Vehicle Management
- Company vehicle tracking
- Mileage recording
- Usage history by project
- Maintenance records

### 6. Asset Management
- Equipment and tools inventory
- Assignment to staff members
- Status tracking (available, in-use, maintenance)

### 7. Finance Management
- Income and expense records
- Financial summaries (monthly/yearly)
- Project financial reports
- Staff payment tracking
- Automated profit calculations

### 8. Settings (NEW)
- **Profile Management**: Update admin account details
- **Email Configuration**: SMTP settings for notifications
- **Telegram Integration**: Bot token configuration
- **Company Information**: Customize company details

## Database Schema

### Tables (14 total)

1. **users** - Admin accounts
2. **clients** - Client companies
3. **staff** - Team members
4. **projects** - Installation projects
5. **project_inverters** - Inverter configurations
6. **project_assignments** - Staff-project assignments
7. **project_progress** - Construction progress (with inspection status)
8. **project_files** (NEW) - Photos and documents
9. **vehicles** - Company vehicles
10. **vehicle_usage** - Vehicle usage records
11. **vehicle_maintenance** - Maintenance history
12. **assets** - Equipment and tools
13. **finance_records** - Financial transactions
14. **system_settings** (NEW) - System configuration

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Windows 10/11 or compatible OS

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd f:\claude-vs-projects\fft-solar-help
   ```

2. **Deploy with Docker**
   ```bash
   # One-click deployment
   docker-deploy.bat

   # Or manually
   docker-compose build
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3201
   - Backend API: http://localhost:3200

4. **Login**
   - Username: `admin`
   - Password: `admin123`

### Docker Commands

```bash
# Start all services
docker-compose start
# or: docker-start.bat

# Stop all services
docker-compose stop
# or: docker-stop.bat

# View logs
docker-compose logs -f
# or: docker-logs.bat

# Rebuild services
docker-compose build
docker-compose up -d

# Check status
docker-compose ps
```

## API Endpoints

### Authentication
```
POST /api/auth/login
GET  /api/auth/me
```

### Clients
```
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id
DELETE /api/clients/:id
```

### Staff
```
GET  /api/staff
POST /api/staff
GET  /api/staff/:id
PUT  /api/staff/:id
DELETE /api/staff/:id
GET  /api/staff/:id/performance?year=2024&month=12  (NEW)
```

### Projects
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/projects/:id/progress
POST   /api/projects/:id/progress
POST   /api/projects/:id/files/upload  (NEW)
GET    /api/projects/:id/files  (NEW)
```

### Settings (NEW)
```
GET  /api/settings/system
PUT  /api/settings/system
GET  /api/settings/profile
PUT  /api/settings/profile
```

### Dashboard
```
GET /api/dashboard/overview
GET /api/dashboard/charts?months=6
GET /api/dashboard/analytics
```

### Finance
```
GET  /api/finance/records
POST /api/finance/records
GET  /api/finance/summary?period=month&year=2024&month=12
GET  /api/finance/project-report
GET  /api/finance/staff-payments
```

## Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fft_solar_crm
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=3200
NODE_ENV=development
```

### Docker Environment
Configuration is handled via `docker-compose.yml` and Settings page (for SMTP/Telegram).

## Project Structure

```
fft-solar-help/
├── server/                 # Backend code
│   ├── config/            # Configuration
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Authentication, etc.
│   ├── models/           # Sequelize models
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions
│   └── index.js          # Entry point
├── client/               # Frontend code
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── services/    # API services
│       ├── context/     # React context
│       └── App.js       # Main app
├── database/            # Database scripts
│   ├── schema.sql       # Database schema
│   └── complete-mock-data.sql  # Sample data
├── docker-compose.yml   # Docker orchestration
├── Dockerfile (backend)
└── Documentation files
```

## Development

### Local Development (without Docker)

1. **Install Dependencies**
   ```bash
   npm install
   cd client && npm install
   ```

2. **Setup Database**
   - Install PostgreSQL
   - Create database `fft_solar_crm`
   - Run `database/schema.sql`

3. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update database credentials

4. **Start Services**
   ```bash
   # Terminal 1: Backend
   npm run server

   # Terminal 2: Frontend
   npm run client
   ```

### Production Deployment

Use Docker deployment as described in Quick Start section.

## Business Logic

### Revenue Calculation
```javascript
revenue = total_watt × client.rate_per_watt
where total_watt = panel_watt × panel_quantity
```

### Staff Payment Calculation
```javascript
// Per-panel payment
payment = panel_quantity × pay_rate

// Per-project payment
payment = pay_rate (fixed amount)
```

### Profit Calculation
```javascript
profit = total_income - total_expenses
where:
  total_income = project_revenue + other_income
  total_expenses = labor_cost + vehicle_cost + other_expenses
```

## Security

- **Authentication**: JWT-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **API Protection**: All routes require valid JWT token
- **Input Validation**: Server-side validation for all inputs
- **File Upload**: Type and size validation

## Documentation

- [NEW_FEATURES_GUIDE.md](./NEW_FEATURES_GUIDE.md) - Detailed guide for new features
- [DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md) - Deployment completion report
- [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Docker deployment guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide

## Sample Data

The system includes comprehensive mock data:
- 2 admin users
- 8 client companies
- 15 staff members
- 12 projects (various statuses)
- Financial records, vehicle usage, assets, etc.

Total: **197 mock records** across all tables

## Troubleshooting

### Container Issues
```bash
# View logs
docker-compose logs [service]

# Restart service
docker-compose restart [service]

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection
```bash
# Access database
docker exec -it fft-solar-db psql -U postgres -d fft_solar_crm

# Check tables
\dt

# Check data
SELECT * FROM users;
```

### Frontend Not Loading
1. Clear browser cache
2. Check container logs: `docker-compose logs frontend`
3. Rebuild: `docker-compose build frontend`

## License

MIT

## Support

For issues or questions, please check:
1. [NEW_FEATURES_GUIDE.md](./NEW_FEATURES_GUIDE.md)
2. [DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md)
3. Docker container logs

---

**Version**: 1.1.0
**Last Updated**: January 6, 2026
**Status**: ✅ Production Ready
