import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Construction,
  AttachMoney,
  People,
  DirectionsCar,
  Build,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import FinancialDetailsModal from '../components/dashboard/FinancialDetailsModal';

// Modern Card Styles
const modernCardStyle = {
  borderRadius: '20px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
  },
};

// Gradient backgrounds for stat cards
const gradientColors = {
  green: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  red: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
  blue: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  orange: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  purple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
};

// Stat Card Component with Modern Design
const StatCard = ({ title, value, subtitle, icon, color, gradient, onClick }) => (
  <Card sx={{
    ...modernCardStyle,
    height: '100%',
    overflow: 'visible',
    cursor: 'pointer',
    position: 'relative'
  }}
    onClick={onClick}
  >
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ flex: 1 }}>
          <Typography
            color="text.secondary"
            gutterBottom
            variant="body2"
            sx={{
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem',
              mb: 1.5
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontWeight: 700,
              background: gradient || gradientColors.blue,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 0.5
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.8rem',
                mt: 0.5
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            background: gradient || gradientColors.blue,
            borderRadius: '16px',
            p: 2,
            color: 'white',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Chart Card Component with Modern Design
const ChartCard = ({ title, children, height = 300 }) => (
  <Card sx={{
    ...modernCardStyle,
    height: '100%',
  }}>
    <CardContent sx={{ p: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontWeight: 700,
          mb: 3,
          color: '#1e293b',
          fontSize: '1rem',
          letterSpacing: '-0.01em'
        }}
      >
        {title}
      </Typography>
      <Box sx={{ height, width: '100%' }}>
        {children}
      </Box>
    </CardContent>
  </Card>
);

// Color schemes
const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#795548', '#607d8b'];
const PIE_COLORS = ['#4caf50', '#2196f3', '#ff9800'];
const STATUS_COLORS = {
  pending: '#ff9800',
  in_progress: '#2196f3',
  completed: '#4caf50'
};

const Dashboard = () => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [financialDetailsOpen, setFinancialDetailsOpen] = useState(false);
  const [detailsType, setDetailsType] = useState(0); // 0 for income, 1 for expense

  const handleOpenDetails = (type) => {
    setDetailsType(type);
    setFinancialDetailsOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, chartRes, analyticsRes] = await Promise.all([
          api.get('/dashboard/overview'),
          api.get('/dashboard/charts?months=6'),
          api.get('/dashboard/analytics')
        ]);
        setData(overviewRes.data);
        setChartData(chartRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!data) {
    return <Typography>Failed to load dashboard data</Typography>;
  }

  // Custom tooltip for currency with modern design
  const CurrencyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          p: 2,
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>{label}</Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color, fontWeight: 500 }}>
              {entry.name}: ${entry.value?.toLocaleString()}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
      mx: -3,
      mt: -3,
      p: 3,
    }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 800,
          mb: 4,
          color: '#0f172a',
          letterSpacing: '-0.02em',
          fontSize: '2rem'
        }}
      >
        Operations Dashboard
      </Typography>

      {/* Modern Tabs */}
      <Box sx={{
        mb: 4,
        background: 'white',
        borderRadius: '16px',
        p: 0.75,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        display: 'inline-flex',
      }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{
            minHeight: '44px',
            '& .MuiTabs-indicator': {
              display: 'none',
            },
            '& .MuiTab-root': {
              minHeight: '44px',
              borderRadius: '12px',
              px: 3,
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              color: '#64748b',
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: 'white',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              },
              '&:hover:not(.Mui-selected)': {
                background: 'rgba(59, 130, 246, 0.08)',
                color: '#3b82f6',
              },
            },
          }}
        >
          <Tab label="Overview" />
          <Tab label="Revenue Analysis" />
          <Tab label="Operations" />
        </Tabs>
      </Box>

      {/* Tab 0: Overview */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Stat Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Monthly Revenue"
              value={`$${data.monthly_stats.income.total.toLocaleString()}`}
              subtitle={`Projects: $${data.monthly_stats.income.project_income.toLocaleString()}`}
              icon={<TrendingUp sx={{ fontSize: 28 }} />}
              gradient={gradientColors.green}
              onClick={() => handleOpenDetails(0)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Monthly Expenses"
              value={`$${data.monthly_stats.expense.total.toLocaleString()}`}
              subtitle={`Labor: $${data.monthly_stats.expense.labor_cost.toLocaleString()}`}
              icon={<TrendingDown sx={{ fontSize: 28 }} />}
              gradient={gradientColors.red}
              onClick={() => handleOpenDetails(1)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Monthly Profit"
              value={`$${data.monthly_stats.profit.toLocaleString()}`}
              icon={<AttachMoney sx={{ fontSize: 28 }} />}
              gradient={gradientColors.blue}
              onClick={() => handleOpenDetails(0)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Installed Watts"
              value={`${data.monthly_stats.total_watt.toLocaleString()} W`}
              icon={<Construction sx={{ fontSize: 28 }} />}
              gradient={gradientColors.orange}
            />
          </Grid>

          {/* Revenue Trend Chart */}
          <Grid item xs={12} md={8}>
            <ChartCard title="Revenue & Expense Trend (6 Months)" height={320}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f44336" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f44336" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="income" name="Revenue" stroke="#4caf50" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#f44336" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit" name="Profit" stroke="#2196f3" strokeWidth={3} dot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Project Status Pie */}
          <Grid item xs={12} md={4}>
            <ChartCard title="Project Status" height={320}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={analytics?.projectStatus || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {(analytics?.projectStatus || []).map((entry, index) => (
                      <Cell key={index} fill={STATUS_COLORS[entry.status] || COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Quick Stats Cards */}
          <Grid item xs={12} md={6}>
            <Card sx={modernCardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                    mb: 3,
                    fontSize: '1rem'
                  }}
                >
                  Project Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{
                      p: 2.5,
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      borderRadius: '16px',
                      transition: 'transform 0.2s ease',
                      '&:hover': { transform: 'scale(1.02)' }
                    }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#d97706' }}>
                        {data.projects.pending}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 500 }}>Pending</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{
                      p: 2.5,
                      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                      borderRadius: '16px',
                      transition: 'transform 0.2s ease',
                      '&:hover': { transform: 'scale(1.02)' }
                    }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#2563eb' }}>
                        {data.projects.in_progress}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1e40af', fontWeight: 500 }}>In Progress</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{
                      p: 2.5,
                      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                      borderRadius: '16px',
                      transition: 'transform 0.2s ease',
                      '&:hover': { transform: 'scale(1.02)' }
                    }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#059669' }}>
                        {data.projects.completed}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#065f46', fontWeight: 500 }}>Completed</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{
                      p: 2.5,
                      background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
                      borderRadius: '16px',
                      transition: 'transform 0.2s ease',
                      '&:hover': { transform: 'scale(1.02)' }
                    }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#7c3aed' }}>
                        {data.projects.completed_this_month}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#5b21b6', fontWeight: 500 }}>This Month</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Expense Categories */}
          <Grid item xs={12} md={6}>
            <ChartCard title="Expense Categories" height={250}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={analytics?.expenseCategories || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(analytics?.expenseCategories || []).map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Revenue Analysis */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* Client Revenue Ranking */}
          <Grid item xs={12} md={8}>
            <ChartCard title="Client Revenue Ranking" height={350}>
              <ResponsiveContainer>
                <BarChart data={analytics?.clientRevenue || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="revenue" name="Revenue" fill="#2196f3" radius={[0, 4, 4, 0]}>
                    {(analytics?.clientRevenue || []).map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Panel Brands */}
          <Grid item xs={12} md={4}>
            <ChartCard title="Panel Brands Distribution" height={350}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={analytics?.panelBrands || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {(analytics?.panelBrands || []).map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Watt Installation Trend */}
          <Grid item xs={12}>
            <ChartCard title="Installation Trend (Watts & Projects)" height={300}>
              <ResponsiveContainer>
                <LineChart data={analytics?.wattTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(0)}kW`} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) =>
                      name === 'Watts' ? `${value.toLocaleString()} W` : value
                    }
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="watt" name="Watts" fill="#ff9800" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="projects" name="Projects" stroke="#9c27b0" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Monthly Profit Comparison */}
          <Grid item xs={12}>
            <ChartCard title="Monthly Profit Analysis" height={280}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Legend />
                  <Bar dataKey="income" name="Revenue" fill="#4caf50" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#f44336" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#2196f3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Operations */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          {/* Staff Performance */}
          <Grid item xs={12} md={8}>
            <ChartCard title="Staff Performance (Panels Installed)" height={400}>
              <ResponsiveContainer>
                <BarChart data={analytics?.staffPerformance || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name) =>
                      name === 'Earnings' ? `$${value.toLocaleString()}` : value
                    }
                  />
                  <Legend />
                  <Bar dataKey="panels" name="Panels" fill="#4caf50" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="projects" name="Projects" fill="#2196f3" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Asset Status */}
          <Grid item xs={12} md={4}>
            <ChartCard title="Asset Status" height={400}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={analytics?.assetStatus || []}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {(analytics?.assetStatus || []).map((entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Vehicle Usage */}
          <Grid item xs={12}>
            <ChartCard title="Vehicle Usage Statistics" height={300}>
              <ResponsiveContainer>
                <BarChart data={analytics?.vehicleUsage || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="plate" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="distance" name="Distance (km)" fill="#2196f3" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="trips" name="Trips" fill="#ff9800" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Staff Earnings Table */}
          <Grid item xs={12}>
            <Card sx={modernCardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    color: '#1e293b',
                    mb: 3,
                    fontSize: '1rem'
                  }}
                >
                  <Box sx={{
                    background: gradientColors.purple,
                    borderRadius: '10px',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <People sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  Staff Earnings Summary
                </Typography>
                <Box sx={{
                  overflowX: 'auto',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                        <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Panels</th>
                        <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projects</th>
                        <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analytics?.staffPerformance || []).map((staff, index) => (
                        <tr
                          key={index}
                          style={{
                            backgroundColor: index % 2 === 0 ? 'transparent' : '#f8fafc',
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <td style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', fontWeight: 500, color: '#1e293b' }}>{staff.name}</td>
                          <td style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0' }}>
                            <Box sx={{
                              display: 'inline-block',
                              px: 2,
                              py: 0.75,
                              borderRadius: '8px',
                              background: staff.role === 'electrician'
                                ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                                : staff.role === 'leader'
                                  ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                                  : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                              color: staff.role === 'electrician' ? '#1e40af' : staff.role === 'leader' ? '#065f46' : '#92400e',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              letterSpacing: '0.3px'
                            }}>
                              {staff.role === 'electrician' ? 'Electrician' : staff.role === 'leader' ? 'Leader' : 'Installer'}
                            </Box>
                          </td>
                          <td style={{ padding: '14px 20px', textAlign: 'right', borderTop: '1px solid #e2e8f0', fontWeight: 700, color: '#1e293b' }}>{staff.panels}</td>
                          <td style={{ padding: '14px 20px', textAlign: 'right', borderTop: '1px solid #e2e8f0', color: '#64748b' }}>{staff.projects}</td>
                          <td style={{
                            padding: '14px 20px',
                            textAlign: 'right',
                            borderTop: '1px solid #e2e8f0',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}>
                            ${staff.earnings.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      <FinancialDetailsModal
        open={financialDetailsOpen}
        onClose={() => setFinancialDetailsOpen(false)}
        initialTab={detailsType}
      />
    </Box>
  );
};

export default Dashboard;
