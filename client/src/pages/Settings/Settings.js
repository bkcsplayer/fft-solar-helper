import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Telegram as TelegramIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Language as LanguageIcon,
  CheckCircle as CheckCircleIcon,
  Storage as StorageIcon,
  DeleteForever as DeleteForeverIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import api from '../../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [importing, setImporting] = useState(false);
  const [dbStats, setDbStats] = useState(null);

  // Profile state
  const [profile, setProfile] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    openrouter_api_key: '',
    openrouter_api_url: 'https://openrouter.ai/api/v1',
    telegram_token: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_password: '',
    smtp_from_name: 'FFT Solar CRM',
    smtp_from_email: 'noreply@fftsolar.com',
    company_name: 'FFT Solar Installation Company',
    company_address: '',
    company_phone: '',
    company_email: '',
    custom_domain: '',
    server_ip: '',
  });

  // SMTP test state
  const [smtpTest, setSmtpTest] = useState({
    testEmail: '',
    testing: false,
    result: null,
  });

  useEffect(() => {
    loadProfile();
    loadSystemSettings();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/settings/profile');
      setProfile({
        ...profile,
        username: response.data.username,
        name: response.data.name,
        email: response.data.email || '',
        phone: response.data.phone || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      showSnackbar('Failed to load profile', 'error');
    }
  };

  const loadSystemSettings = async () => {
    try {
      const response = await api.get('/settings/system');
      const settings = {};
      Object.keys(response.data).forEach(key => {
        settings[key] = response.data[key].value || '';
      });
      setSystemSettings({ ...systemSettings, ...settings });
    } catch (error) {
      console.error('Failed to load settings:', error);
      showSnackbar('Failed to load system settings', 'error');
    }
  };

  const handleProfileChange = (field) => (event) => {
    setProfile({ ...profile, [field]: event.target.value });
  };

  const handleSettingChange = (field) => (event) => {
    setSystemSettings({ ...systemSettings, [field]: event.target.value });
  };

  const handleSaveProfile = async () => {
    // Validate password match if changing password
    if (profile.new_password) {
      if (profile.new_password !== profile.confirm_password) {
        showSnackbar('New passwords do not match', 'error');
        return;
      }
      if (!profile.current_password) {
        showSnackbar('Please enter your current password', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const updateData = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      };

      if (profile.new_password) {
        updateData.current_password = profile.current_password;
        updateData.new_password = profile.new_password;
      }

      await api.put('/settings/profile', updateData);
      showSnackbar('Profile updated successfully', 'success');

      // Clear password fields
      setProfile({
        ...profile,
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      showSnackbar(error.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    setLoading(true);
    try {
      await api.put('/settings/system', systemSettings);
      showSnackbar('System settings updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update settings:', error);
      showSnackbar('Failed to update system settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test SMTP configuration
  const handleTestSMTP = async () => {
    if (!smtpTest.testEmail) {
      setSnackbar({ open: true, message: '请输入测试邮箱地址', severity: 'warning' });
      return;
    }

    setSmtpTest({ ...smtpTest, testing: true, result: null });
    try {
      const response = await api.post('/settings/smtp/test', {
        smtp_host: systemSettings.smtp_host,
        smtp_port: systemSettings.smtp_port,
        smtp_user: systemSettings.smtp_user,
        smtp_password: systemSettings.smtp_password,
        smtp_from: systemSettings.smtp_from_email,
        test_email: smtpTest.testEmail,
      });
      setSmtpTest({ ...smtpTest, testing: false, result: { success: true, message: response.data.message } });
      setSnackbar({ open: true, message: '✅ ' + response.data.message, severity: 'success' });
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setSmtpTest({ ...smtpTest, testing: false, result: { success: false, message: errorMsg } });
      setSnackbar({ open: true, message: '❌ ' + errorMsg, severity: 'error' });
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/export/all', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `fft-solar-backup-${date}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showSnackbar('数据导出成功！', 'success');
    } catch (error) {
      console.error('Failed to export data:', error);
      showSnackbar('导出数据失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDatabase = async () => {
    if (resetConfirmText !== 'RESET') {
      showSnackbar('请输入 RESET 确认操作', 'warning');
      return;
    }
    try {
      setLoading(true);
      const response = await api.post('/export/reset');
      showSnackbar(response.data.message, 'success');
      setResetConfirmText('');
      // Reload page since user data has changed
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Failed to reset database:', error);
      showSnackbar(error.response?.data?.error || '重置数据库失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!window.confirm('⚠️ 导入数据将会覆盖当前所有数据！\n\n确定要继续吗？')) {
      event.target.value = '';
      return;
    }

    try {
      setImporting(true);
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.data) {
        showSnackbar('无效的备份文件格式', 'error');
        return;
      }

      const response = await api.post('/export/import', importData);
      const results = response.data.results;
      const totalRecords = Object.values(results).reduce((a, b) => a + b, 0);
      showSnackbar(`数据导入成功！共导入 ${totalRecords} 条记录`, 'success');

      // Reload page since data has changed
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Failed to import data:', error);
      showSnackbar(error.response?.data?.error || '导入数据失败: ' + error.message, 'error');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Settings
        </Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab icon={<PersonIcon />} label="Profile" iconPosition="start" />
            <Tab icon={<EmailIcon />} label="Email & Notifications" iconPosition="start" />
            <Tab icon={<SettingsIcon />} label="Company Info" iconPosition="start" />
            <Tab icon={<TelegramIcon />} label="API Settings" iconPosition="start" />
            <Tab icon={<LanguageIcon />} label="域名设置" iconPosition="start" />
            <Tab icon={<StorageIcon />} label="数据管理" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                value={profile.username}
                disabled
                helperText="Username cannot be changed"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={profile.name}
                onChange={handleProfileChange('name')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange('email')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={profile.phone}
                onChange={handleProfileChange('phone')}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Change Password
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPassword ? 'text' : 'password'}
                value={profile.current_password}
                onChange={handleProfileChange('current_password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={profile.new_password}
                onChange={handleProfileChange('new_password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={profile.confirm_password}
                onChange={handleProfileChange('confirm_password')}
                error={profile.new_password !== profile.confirm_password && profile.confirm_password !== ''}
                helperText={
                  profile.new_password !== profile.confirm_password && profile.confirm_password !== ''
                    ? 'Passwords do not match'
                    : ''
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  Save Profile
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Email & Notifications Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Telegram Notifications
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Telegram Bot Token"
                value={systemSettings.telegram_token}
                onChange={handleSettingChange('telegram_token')}
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                helperText="Enter your Telegram bot token for sending notifications"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                SMTP Email Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="SMTP Host"
                value={systemSettings.smtp_host}
                onChange={handleSettingChange('smtp_host')}
                placeholder="smtp.gmail.com"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="SMTP Port"
                value={systemSettings.smtp_port}
                onChange={handleSettingChange('smtp_port')}
                placeholder="587"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SMTP Username/Email"
                value={systemSettings.smtp_user}
                onChange={handleSettingChange('smtp_user')}
                placeholder="your-email@gmail.com"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SMTP Password"
                type="password"
                value={systemSettings.smtp_password}
                onChange={handleSettingChange('smtp_password')}
                placeholder="App Password"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="From Name"
                value={systemSettings.smtp_from_name}
                onChange={handleSettingChange('smtp_from_name')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="From Email"
                value={systemSettings.smtp_from_email}
                onChange={handleSettingChange('smtp_from_email')}
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                <strong>Gmail Users:</strong> Use an App Password instead of your regular password.
                Go to Google Account → Security → 2-Step Verification → App passwords to generate one.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                测试 SMTP 配置
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  label="测试邮箱地址"
                  value={smtpTest.testEmail}
                  onChange={(e) => setSmtpTest({ ...smtpTest, testEmail: e.target.value })}
                  placeholder="输入您的邮箱地址接收测试邮件"
                  helperText="发送一封测试邮件以验证 SMTP 配置是否正确"
                />
                <Button
                  variant="outlined"
                  onClick={handleTestSMTP}
                  disabled={smtpTest.testing || !systemSettings.smtp_host || !systemSettings.smtp_user}
                  sx={{ mt: 0.5, minWidth: 120, height: 56 }}
                >
                  {smtpTest.testing ? '测试中...' : '测试发送'}
                </Button>
              </Box>
              {smtpTest.result && (
                <Alert severity={smtpTest.result.success ? 'success' : 'error'} sx={{ mt: 2 }}>
                  {smtpTest.result.message}
                </Alert>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSystemSettings}
                  disabled={loading}
                >
                  Save Settings
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Company Info Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Company Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                value={systemSettings.company_name}
                onChange={handleSettingChange('company_name')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Address"
                value={systemSettings.company_address}
                onChange={handleSettingChange('company_address')}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Phone"
                value={systemSettings.company_phone}
                onChange={handleSettingChange('company_phone')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Email"
                type="email"
                value={systemSettings.company_email}
                onChange={handleSettingChange('company_email')}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                数据导出
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Alert severity="info" sx={{ mb: 2 }}>
                导出所有系统数据为JSON格式，包括客户、员工、项目、车辆、资产、财务记录等全部数据。
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportData}
                  disabled={loading}
                  color="primary"
                >
                  导出所有数据 (JSON)
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSystemSettings}
                  disabled={loading}
                >
                  Save Company Info
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Domain Settings Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                自定义域名绑定
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>当前服务器IP:</strong> {systemSettings.server_ip || '74.48.192.171'}
                </Typography>
                <Typography variant="body2">
                  请先在 GoDaddy DNS 管理中配置 A 记录，然后在下方输入您的域名。
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="自定义域名"
                value={systemSettings.custom_domain}
                onChange={handleSettingChange('custom_domain')}
                placeholder="fftsolaradmin.yourdomain.com"
                helperText="输入您在 GoDaddy 配置的完整域名"
                InputProps={{
                  endAdornment: systemSettings.custom_domain && (
                    <InputAdornment position="end">
                      <CheckCircleIcon color="success" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                GoDaddy DNS 配置步骤
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" component="div">
                  <ol style={{ margin: 0, paddingLeft: 20 }}>
                    <li>登录 GoDaddy 账户，进入 DNS 管理</li>
                    <li>添加 A 记录：
                      <ul>
                        <li><strong>类型:</strong> A</li>
                        <li><strong>主机:</strong> @ (主域名) 或 fftsolaradmin (子域名)</li>
                        <li><strong>指向:</strong> {systemSettings.server_ip || '74.48.192.171'}</li>
                        <li><strong>TTL:</strong> 600 秒（默认）</li>
                      </ul>
                    </li>
                    <li>保存 DNS 配置</li>
                    <li>等待 DNS 生效（通常 5-30 分钟）</li>
                    <li>在上方输入框中输入配置好的域名并保存</li>
                  </ol>
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                示例配置：
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>主域名:</strong> example.com → @ → 74.48.192.171
                </Typography>
                <Typography variant="body2">
                  <strong>子域名:</strong> fftsolaradmin.example.com → fftsolaradmin → 74.48.192.171
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSystemSettings}
                  disabled={loading || !systemSettings.custom_domain}
                >
                  保存域名设置
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* API Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                API Configuration
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                OpenRouter API
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure OpenRouter for AI-powered features
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="OpenRouter API Key"
                type="password"
                value={systemSettings.openrouter_api_key}
                onChange={handleSettingChange('openrouter_api_key')}
                placeholder="sk-or-v1-..."
                helperText="Your OpenRouter API key for AI services"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="OpenRouter API URL"
                value={systemSettings.openrouter_api_url}
                onChange={handleSettingChange('openrouter_api_url')}
                placeholder="https://openrouter.ai/api/v1"
                helperText="Base URL for OpenRouter API (usually default)"
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                <strong>OpenRouter:</strong> Visit{' '}
                <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">
                  openrouter.ai
                </a>{' '}
                to get your API key. OpenRouter provides access to multiple AI models through a single API.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSystemSettings}
                  disabled={loading}
                >
                  Save API Settings
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Data Management Tab */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                数据管理
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            {/* Export */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, height: '100%', border: '2px solid #e2e8f0', borderRadius: '16px' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '16px',
                    p: 2,
                    display: 'inline-flex',
                    mb: 2,
                  }}>
                    <CloudDownloadIcon sx={{ color: 'white', fontSize: 40 }} />
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    导出数据
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    将所有数据库数据导出为 JSON 备份文件。建议在升级程序或迁移服务器之前执行。
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<DownloadIcon />}
                    onClick={handleExportData}
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '12px',
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      }
                    }}
                  >
                    {loading ? '导出中...' : '导出全部数据'}
                  </Button>
                </Box>
              </Card>
            </Grid>

            {/* Import */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, height: '100%', border: '2px solid #e2e8f0', borderRadius: '16px' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '16px',
                    p: 2,
                    display: 'inline-flex',
                    mb: 2,
                  }}>
                    <CloudUploadIcon sx={{ color: 'white', fontSize: 40 }} />
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    导入数据
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    从 JSON 备份文件恢复数据。⚠️ 此操作将覆盖当前所有数据。
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    component="label"
                    startIcon={<UploadIcon />}
                    disabled={importing}
                    sx={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      borderRadius: '12px',
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      }
                    }}
                  >
                    {importing ? '导入中...' : '选择备份文件导入'}
                    <input
                      type="file"
                      accept=".json"
                      hidden
                      onChange={handleImportData}
                    />
                  </Button>
                </Box>
              </Card>
            </Grid>

            {/* Reset */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, height: '100%', border: '2px solid #fee2e2', borderRadius: '16px', background: '#fff5f5' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    borderRadius: '16px',
                    p: 2,
                    display: 'inline-flex',
                    mb: 2,
                  }}>
                    <DeleteForeverIcon sx={{ color: 'white', fontSize: 40 }} />
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#dc2626' }}>
                    清除所有数据
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    删除数据库中所有数据并恢复到初始状态。仅保留默认管理员账户 (admin/admin123)。
                  </Typography>
                  <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>
                    <strong>⚠️ 此操作不可撤销！</strong>请先导出备份。
                  </Alert>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder='输入 RESET 确认'
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<DeleteForeverIcon />}
                    onClick={handleResetDatabase}
                    disabled={loading || resetConfirmText !== 'RESET'}
                    sx={{
                      background: resetConfirmText === 'RESET'
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : '#e5e7eb',
                      borderRadius: '12px',
                      py: 1.5,
                      fontWeight: 600,
                      color: resetConfirmText === 'RESET' ? 'white' : '#9ca3af',
                      '&:hover': {
                        background: resetConfirmText === 'RESET'
                          ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                          : '#d1d5db',
                      }
                    }}
                  >
                    {loading ? '重置中...' : '清除所有数据'}
                  </Button>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ borderRadius: '12px' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  💡 数据管理提示：
                </Typography>
                <Typography variant="body2">
                  • <strong>定期备份</strong>：建议每周至少导出一次完整备份<br />
                  • <strong>升级前备份</strong>：在程序升级或服务器迁移之前，务必先导出数据<br />
                  • <strong>导入覆盖</strong>：导入操作会完全替换当前数据库中的所有数据<br />
                  • <strong>备份文件</strong>：导出文件为 JSON 格式，可用文本编辑器查看内容
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

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
    </Container>
  );
};

export default Settings;
