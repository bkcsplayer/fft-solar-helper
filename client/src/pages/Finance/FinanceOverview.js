import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
} from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance, AttachMoney } from '@mui/icons-material';
import api from '../../services/api';
import {
  pageContainerStyle,
  pageTitleStyle,
  modernCardStyle,
  modernInputStyle,
  headerBarStyle,
  filterContainerStyle,
} from '../../styles/modernStyles';

// Gradient backgrounds for stat cards
const gradientColors = {
  green: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  red: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
  blue: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
};

const FinanceOverview = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [period, setPeriod] = useState('month');
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  useEffect(() => {
    fetchSummary();
  }, [period, year, month]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const params = { period, year };
      if (period === 'month') {
        params.month = month;
      }

      const response = await api.get('/finance/summary', { params });
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch finance summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={pageContainerStyle}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} sx={{ color: '#3b82f6' }} />
        </Box>
      </Box>
    );
  }

  if (!summary) {
    return (
      <Box sx={pageContainerStyle}>
        <Typography>无法加载财务数据</Typography>
      </Box>
    );
  }

  return (
    <Box sx={pageContainerStyle}>
      <Box sx={headerBarStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '14px',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
          }}>
            <AttachMoney sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography sx={pageTitleStyle} style={{ marginBottom: 0 }}>
            财务管理
          </Typography>
        </Box>
        <Box sx={filterContainerStyle}>
          <FormControl sx={{ minWidth: 120, ...modernInputStyle }}>
            <InputLabel>统计周期</InputLabel>
            <Select
              value={period}
              label="统计周期"
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="month">月度</MenuItem>
              <MenuItem value="year">年度</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 100, ...modernInputStyle }}>
            <InputLabel>年份</InputLabel>
            <Select
              value={year}
              label="年份"
              onChange={(e) => setYear(e.target.value)}
            >
              {[...Array(5)].map((_, i) => (
                <MenuItem key={currentYear - i} value={currentYear - i}>
                  {currentYear - i}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {period === 'month' && (
            <FormControl sx={{ minWidth: 100, ...modernInputStyle }}>
              <InputLabel>月份</InputLabel>
              <Select
                value={month}
                label="月份"
                onChange={(e) => setMonth(e.target.value)}
              >
                {[...Array(12)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {i + 1}月
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={modernCardStyle}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 500, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px',
                      fontSize: '0.75rem',
                      mb: 1.5
                    }}
                  >
                    总收入
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      background: gradientColors.green,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 0.5
                    }}
                  >
                    ${summary.income.total.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                    项目: ${summary.income.project_income.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{
                  background: gradientColors.green,
                  borderRadius: '16px',
                  p: 2,
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                }}>
                  <TrendingUp sx={{ fontSize: 28, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={modernCardStyle}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 500, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px',
                      fontSize: '0.75rem',
                      mb: 1.5
                    }}
                  >
                    总支出
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      background: gradientColors.red,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 0.5
                    }}
                  >
                    ${summary.expense.total.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                    人工: ${summary.expense.labor_cost.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{
                  background: gradientColors.red,
                  borderRadius: '16px',
                  p: 2,
                  boxShadow: '0 8px 24px rgba(244, 63, 94, 0.3)',
                }}>
                  <TrendingDown sx={{ fontSize: 28, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={modernCardStyle}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography 
                    color="text.secondary" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 500, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px',
                      fontSize: '0.75rem',
                      mb: 1.5
                    }}
                  >
                    净利润
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      background: gradientColors.blue,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 0.5
                    }}
                  >
                    ${summary.profit.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                    利润率:{' '}
                    {summary.income.total > 0
                      ? ((summary.profit / summary.income.total) * 100).toFixed(1)
                      : 0}
                    %
                  </Typography>
                </Box>
                <Box sx={{
                  background: gradientColors.blue,
                  borderRadius: '16px',
                  p: 2,
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                }}>
                  <AccountBalance sx={{ fontSize: 28, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detail Breakdown */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={modernCardStyle}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  background: gradientColors.green,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                收入明细
              </Typography>
              <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />
              <Box display="flex" justifyContent="space-between" mb={2} sx={{ py: 1 }}>
                <Typography sx={{ color: '#64748b' }}>项目收入</Typography>
                <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                  ${summary.income.project_income.toLocaleString()}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2} sx={{ py: 1 }}>
                <Typography sx={{ color: '#64748b' }}>其他收入</Typography>
                <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                  ${summary.income.other_income.toLocaleString()}
                </Typography>
              </Box>
              <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />
              <Box display="flex" justifyContent="space-between" sx={{ 
                py: 1.5, 
                px: 2, 
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                borderRadius: '12px'
              }}>
                <Typography sx={{ fontWeight: 700, color: '#065f46' }}>总计</Typography>
                <Typography sx={{ fontWeight: 700, color: '#065f46' }}>
                  ${summary.income.total.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={modernCardStyle}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  background: gradientColors.red,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                支出明细
              </Typography>
              <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />
              <Box display="flex" justifyContent="space-between" mb={2} sx={{ py: 1 }}>
                <Typography sx={{ color: '#64748b' }}>人工成本</Typography>
                <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                  ${summary.expense.labor_cost.toLocaleString()}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2} sx={{ py: 1 }}>
                <Typography sx={{ color: '#64748b' }}>车辆维护</Typography>
                <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                  ${summary.expense.vehicle_cost.toLocaleString()}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2} sx={{ py: 1 }}>
                <Typography sx={{ color: '#64748b' }}>其他支出</Typography>
                <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                  ${summary.expense.other_expenses.toLocaleString()}
                </Typography>
              </Box>
              <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />
              <Box display="flex" justifyContent="space-between" sx={{ 
                py: 1.5, 
                px: 2, 
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                borderRadius: '12px'
              }}>
                <Typography sx={{ fontWeight: 700, color: '#991b1b' }}>总计</Typography>
                <Typography sx={{ fontWeight: 700, color: '#991b1b' }}>
                  ${summary.expense.total.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={modernCardStyle}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  color: '#1e293b',
                  mb: 2
                }}
              >
                项目统计
              </Typography>
              <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 3, 
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography sx={{ color: '#1e40af', fontWeight: 500 }}>已完成项目</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#1e40af' }}>
                      {summary.projects.completed}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 3, 
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography sx={{ color: '#92400e', fontWeight: 500 }}>总安装瓦数</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#92400e' }}>
                      {summary.projects.total_watt_installed.toLocaleString()} W
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinanceOverview;
