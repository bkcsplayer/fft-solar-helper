import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
} from '@mui/material';
import DataManagementMenu from '../../components/common/DataManagementMenu';
import {
  Add,
  Edit,
  Delete,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Repeat,
  CalendarToday,
  DirectionsCar,
  Description,
  Save,
  Cancel,
} from '@mui/icons-material';
import api from '../../services/api';
import {
  pageContainerStyle,
  pageTitleStyle,
  modernCardStyle,
  modernButtonStyle,
  modernSecondaryButtonStyle,
  modernInputStyle,
  headerBarStyle,
} from '../../styles/modernStyles';

const FinanceManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Tab 1: Summary
  const [summary, setSummary] = useState(null);
  const [period, setPeriod] = useState('month');
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  // Tab 2: Manual Records
  const [records, setRecords] = useState([]);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordForm, setRecordForm] = useState({
    record_date: new Date().toISOString().split('T')[0],
    record_type: 'expense',
    category: '',
    amount: '',
    vehicle_id: '',
    notes: ''
  });
  const [vehicles, setVehicles] = useState([]);

  // Tab 3: Recurring Expenses
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [recurringForm, setRecurringForm] = useState({
    name: '',
    category: '',
    amount: '',
    frequency: 'monthly',
    is_active: true,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: ''
  });

  // Category options
  const expenseCategories = [
    'fuel',
    'vehicle_maintenance',
    'car_loan',
    'software_subscription',
    'insurance',
    'equipment',
    'online_shopping',
    'utilities',
    'rent',
    'other'
  ];

  const incomeCategories = [
    'project_revenue',
    'other_income',
    'refund',
    'investment'
  ];

  const categoryLabels = {
    fuel: '加油费',
    vehicle_maintenance: '汽车维护',
    car_loan: '汽车贷款',
    software_subscription: '软件订阅',
    insurance: '保险',
    equipment: '设备',
    online_shopping: '网购',
    utilities: '水电费',
    rent: '房租',
    other: '其他',
    project_revenue: '项目收入',
    other_income: '其他收入',
    refund: '退款',
    investment: '投资收益'
  };

  useEffect(() => {
    if (activeTab === 0) {
      fetchSummary();
    } else if (activeTab === 1) {
      fetchRecords();
      fetchVehicles();
    } else if (activeTab === 2) {
      fetchRecurringExpenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, period, year, month]);

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
      console.error('Failed to fetch summary:', error);
      showSnackbar('Failed to load summary', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get('/finance/records');
      setRecords(response.data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
      showSnackbar('Failed to load records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const fetchRecurringExpenses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/finance/recurring');
      setRecurringExpenses(response.data);
    } catch (error) {
      console.error('Failed to fetch recurring expenses:', error);
      showSnackbar('Failed to load recurring expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRecordDialog = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setRecordForm({
        record_date: record.record_date,
        record_type: record.record_type,
        category: record.category,
        amount: record.amount,
        vehicle_id: record.vehicle_id || '',
        notes: record.notes || ''
      });
    } else {
      setEditingRecord(null);
      setRecordForm({
        record_date: new Date().toISOString().split('T')[0],
        record_type: 'expense',
        category: '',
        amount: '',
        vehicle_id: '',
        notes: ''
      });
    }
    setRecordDialogOpen(true);
  };

  const handleSaveRecord = async () => {
    try {
      // Filter out empty strings for foreign key fields
      const dataToSend = {
        ...recordForm,
        vehicle_id: recordForm.vehicle_id || undefined, // Convert empty string to undefined
      };

      if (editingRecord) {
        await api.put(`/finance/records/${editingRecord.id}`, dataToSend);
        showSnackbar('Record updated successfully', 'success');
      } else {
        await api.post('/finance/records', dataToSend);
        showSnackbar('Record created successfully', 'success');
      }
      setRecordDialogOpen(false);
      fetchRecords();
    } catch (error) {
      console.error('Failed to save record:', error);
      showSnackbar('Failed to save record', 'error');
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('确定要删除这条记录吗？')) return;
    try {
      await api.delete(`/finance/records/${id}`);
      showSnackbar('Record deleted successfully', 'success');
      fetchRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
      showSnackbar(error.response?.data?.error || 'Failed to delete record', 'error');
    }
  };

  const handleOpenRecurringDialog = (expense = null) => {
    if (expense) {
      setEditingRecurring(expense);
      setRecurringForm({
        name: expense.name,
        category: expense.category,
        amount: expense.amount,
        frequency: expense.frequency,
        is_active: expense.is_active,
        start_date: expense.start_date,
        end_date: expense.end_date || '',
        notes: expense.notes || ''
      });
    } else {
      setEditingRecurring(null);
      setRecurringForm({
        name: '',
        category: '',
        amount: '',
        frequency: 'monthly',
        is_active: true,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: ''
      });
    }
    setRecurringDialogOpen(true);
  };

  const handleSaveRecurring = async () => {
    try {
      if (editingRecurring) {
        await api.put(`/finance/recurring/${editingRecurring.id}`, recurringForm);
        showSnackbar('Recurring expense updated successfully', 'success');
      } else {
        await api.post('/finance/recurring', recurringForm);
        showSnackbar('Recurring expense created successfully', 'success');
      }
      setRecurringDialogOpen(false);
      fetchRecurringExpenses();
    } catch (error) {
      console.error('Failed to save recurring expense:', error);
      showSnackbar('Failed to save recurring expense', 'error');
    }
  };

  const handleDeleteRecurring = async (id) => {
    if (!window.confirm('确定要删除这个月度固定支出吗？')) return;
    try {
      await api.delete(`/finance/recurring/${id}`);
      showSnackbar('Recurring expense deleted successfully', 'success');
      fetchRecurringExpenses();
    } catch (error) {
      console.error('Failed to delete recurring expense:', error);
      showSnackbar('Failed to delete recurring expense', 'error');
    }
  };

  const handleProcessRecurring = async () => {
    if (!window.confirm('确定要处理所有月度固定支出吗？这将为所有活跃的订阅创建对应的支出记录。')) return;
    try {
      const response = await api.post('/finance/recurring/process');
      showSnackbar(response.data.message, 'success');
      fetchRecords();
      fetchRecurringExpenses();
    } catch (error) {
      console.error('Failed to process recurring expenses:', error);
      showSnackbar('Failed to process recurring expenses', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={pageContainerStyle}>
      {/* Header */}
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
        <DataManagementMenu
          moduleName="finance"
          onSuccess={() => {
            // Refresh depends on active tab, but we can't easily access those functions here if they are defined inside.
            // Actually they are defined inside component.
            // We can just trigger a reload or use a context. 
            // For now, let's just let it be, user can manually refresh or switch tabs.
            // Or better, we can reload window.
            window.location.reload();
          }}
        />
      </Box>

      {/* Tabs */}
      <Card sx={{ ...modernCardStyle, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              minHeight: '64px',
            },
            '& .Mui-selected': {
              color: '#3b82f6',
            },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              height: '3px',
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab icon={<TrendingUp />} label="统计概览" iconPosition="start" />
          <Tab icon={<Description />} label="手动记录" iconPosition="start" />
          <Tab icon={<Repeat />} label="月度固定支出" iconPosition="start" />
        </Tabs>
      </Card>

      {/* Tab 1: Summary */}
      {activeTab === 0 && (
        <Box>
          {/* Period Selector */}
          <Card sx={{ ...modernCardStyle, mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth sx={modernInputStyle}>
                    <InputLabel>时间周期</InputLabel>
                    <Select
                      value={period}
                      label="时间周期"
                      onChange={(e) => setPeriod(e.target.value)}
                    >
                      <MenuItem value="month">按月</MenuItem>
                      <MenuItem value="year">按年</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="年份"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    sx={modernInputStyle}
                  />
                </Grid>
                {period === 'month' && (
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="月份"
                      type="number"
                      value={month}
                      onChange={(e) => setMonth(parseInt(e.target.value))}
                      inputProps={{ min: 1, max: 12 }}
                      sx={modernInputStyle}
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          ) : summary ? (
            <Grid container spacing={3}>
              {/* Income Card */}
              <Grid item xs={12} md={4}>
                <Card sx={{
                  ...modernCardStyle,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingUp sx={{ fontSize: 32, mr: 1.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        总收入
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                      ${parseFloat(summary.income?.total || 0).toLocaleString()}
                    </Typography>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)', mb: 2 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      项目收入: ${parseFloat(summary.income?.project_income || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      其他收入: ${parseFloat(summary.income?.other_income || 0).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Expense Card */}
              <Grid item xs={12} md={4}>
                <Card sx={{
                  ...modernCardStyle,
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingDown sx={{ fontSize: 32, mr: 1.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        总支出
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                      ${parseFloat(summary.expense?.total || 0).toLocaleString()}
                    </Typography>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)', mb: 2 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      人工成本: ${parseFloat(summary.expense?.labor_cost || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      汽车费用: ${parseFloat(summary.expense?.vehicle_cost || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      其他支出: ${parseFloat(summary.expense?.other_expenses || 0).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Profit Card */}
              <Grid item xs={12} md={4}>
                <Card sx={{
                  ...modernCardStyle,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AttachMoney sx={{ fontSize: 32, mr: 1.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        净利润
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                      ${parseFloat(summary.profit || 0).toLocaleString()}
                    </Typography>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)', mb: 2 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      完成项目: {summary.projects?.completed || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      安装瓦数: {summary.projects?.total_watt_installed?.toLocaleString() || 0} W
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">无法加载财务数据</Alert>
          )}
        </Box>
      )}

      {/* Tab 2: Manual Records */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              手动收支记录
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenRecordDialog()}
              sx={modernButtonStyle}
            >
              添加记录
            </Button>
          </Box>

          <Card sx={modernCardStyle}>
            <CardContent>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>日期</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>类型</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>分类</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>金额</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>车辆</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>备注</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {records.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography color="text.secondary" py={3}>
                              暂无记录
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        records.map((record) => (
                          <TableRow key={record.id} hover>
                            <TableCell>{record.record_date}</TableCell>
                            <TableCell>
                              <Chip
                                label={record.record_type === 'income' ? '收入' : '支出'}
                                color={record.record_type === 'income' ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{categoryLabels[record.category] || record.category}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              ${parseFloat(record.amount).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {record.vehicle ? `${record.vehicle.plate_number} (${record.vehicle.model})` : '-'}
                            </TableCell>
                            <TableCell>{record.notes || '-'}</TableCell>
                            <TableCell align="right">
                              {!record.is_recurring && (
                                <>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenRecordDialog(record)}
                                  >
                                    <Edit />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteRecord(record.id)}
                                  >
                                    <Delete />
                                  </IconButton>
                                </>
                              )}
                              {record.is_recurring && (
                                <Chip label="自动生成" size="small" color="default" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tab 3: Recurring Expenses */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              月度固定支出管理
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CalendarToday />}
                onClick={handleProcessRecurring}
                sx={modernSecondaryButtonStyle}
              >
                处理本月支出
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenRecurringDialog()}
                sx={modernButtonStyle}
              >
                添加固定支出
              </Button>
            </Box>
          </Box>

          <Card sx={modernCardStyle}>
            <CardContent>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>名称</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>分类</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>金额</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>频率</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>开始日期</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>最后处理</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recurringExpenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <Typography color="text.secondary" py={3}>
                              暂无固定支出
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        recurringExpenses.map((expense) => (
                          <TableRow key={expense.id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{expense.name}</TableCell>
                            <TableCell>{categoryLabels[expense.category] || expense.category}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              ${parseFloat(expense.amount).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  expense.frequency === 'monthly' ? '每月' :
                                    expense.frequency === 'weekly' ? '每周' : '每年'
                                }
                                size="small"
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>{expense.start_date}</TableCell>
                            <TableCell>{expense.last_processed_date || '未处理'}</TableCell>
                            <TableCell>
                              <Chip
                                label={expense.is_active ? '活跃' : '停用'}
                                color={expense.is_active ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenRecurringDialog(expense)}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteRecurring(expense.id)}
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              💡 提示：
            </Typography>
            <Typography variant="body2">
              • 月度固定支出会自动生成对应的支出记录<br />
              • 点击"处理本月支出"按钮可手动触发处理<br />
              • 自动生成的记录无法手动编辑或删除<br />
              • 停用的固定支出将不会自动生成新记录
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Record Dialog */}
      <Dialog
        open={recordDialogOpen}
        onClose={() => setRecordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>
          {editingRecord ? '编辑记录' : '添加记录'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="日期"
                type="date"
                value={recordForm.record_date}
                onChange={(e) => setRecordForm({ ...recordForm, record_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={modernInputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={modernInputStyle}>
                <InputLabel>类型</InputLabel>
                <Select
                  value={recordForm.record_type}
                  label="类型"
                  onChange={(e) => setRecordForm({ ...recordForm, record_type: e.target.value, category: '' })}
                >
                  <MenuItem value="income">收入</MenuItem>
                  <MenuItem value="expense">支出</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth sx={modernInputStyle}>
                <InputLabel>分类</InputLabel>
                <Select
                  value={recordForm.category}
                  label="分类"
                  onChange={(e) => setRecordForm({ ...recordForm, category: e.target.value })}
                >
                  {(recordForm.record_type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="金额 ($)"
                type="number"
                value={recordForm.amount}
                onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
                sx={modernInputStyle}
              />
            </Grid>
            {recordForm.category === 'fuel' || recordForm.category === 'vehicle_maintenance' ? (
              <Grid item xs={12}>
                <FormControl fullWidth sx={modernInputStyle}>
                  <InputLabel>车辆（可选）</InputLabel>
                  <Select
                    value={recordForm.vehicle_id}
                    label="车辆（可选）"
                    onChange={(e) => setRecordForm({ ...recordForm, vehicle_id: e.target.value })}
                  >
                    <MenuItem value="">无</MenuItem>
                    {vehicles.map((v) => (
                      <MenuItem key={v.id} value={v.id}>
                        {v.plate_number} - {v.model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ) : null}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="备注"
                multiline
                rows={3}
                value={recordForm.notes}
                onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                sx={modernInputStyle}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={() => setRecordDialogOpen(false)}
            startIcon={<Cancel />}
            sx={modernSecondaryButtonStyle}
          >
            取消
          </Button>
          <Button
            onClick={handleSaveRecord}
            variant="contained"
            startIcon={<Save />}
            disabled={!recordForm.category || !recordForm.amount}
            sx={modernButtonStyle}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recurring Dialog */}
      <Dialog
        open={recurringDialogOpen}
        onClose={() => setRecurringDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>
          {editingRecurring ? '编辑固定支出' : '添加固定支出'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="名称"
                value={recurringForm.name}
                onChange={(e) => setRecurringForm({ ...recurringForm, name: e.target.value })}
                placeholder="例如: Netflix订阅, 汽车月供"
                sx={modernInputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={modernInputStyle}>
                <InputLabel>分类</InputLabel>
                <Select
                  value={recurringForm.category}
                  label="分类"
                  onChange={(e) => setRecurringForm({ ...recurringForm, category: e.target.value })}
                >
                  {expenseCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="金额 ($)"
                type="number"
                value={recurringForm.amount}
                onChange={(e) => setRecurringForm({ ...recurringForm, amount: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
                sx={modernInputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={modernInputStyle}>
                <InputLabel>频率</InputLabel>
                <Select
                  value={recurringForm.frequency}
                  label="频率"
                  onChange={(e) => setRecurringForm({ ...recurringForm, frequency: e.target.value })}
                >
                  <MenuItem value="weekly">每周</MenuItem>
                  <MenuItem value="monthly">每月</MenuItem>
                  <MenuItem value="yearly">每年</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="开始日期"
                type="date"
                value={recurringForm.start_date}
                onChange={(e) => setRecurringForm({ ...recurringForm, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={modernInputStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="结束日期（可选）"
                type="date"
                value={recurringForm.end_date}
                onChange={(e) => setRecurringForm({ ...recurringForm, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="留空表示无限期"
                sx={modernInputStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={recurringForm.is_active}
                    onChange={(e) => setRecurringForm({ ...recurringForm, is_active: e.target.checked })}
                    color="primary"
                  />
                }
                label="激活状态（活跃时会自动生成支出记录）"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="备注"
                multiline
                rows={2}
                value={recurringForm.notes}
                onChange={(e) => setRecurringForm({ ...recurringForm, notes: e.target.value })}
                sx={modernInputStyle}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={() => setRecurringDialogOpen(false)}
            startIcon={<Cancel />}
            sx={modernSecondaryButtonStyle}
          >
            取消
          </Button>
          <Button
            onClick={handleSaveRecurring}
            variant="contained"
            startIcon={<Save />}
            disabled={!recurringForm.name || !recurringForm.category || !recurringForm.amount}
            sx={modernButtonStyle}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FinanceManagement;
