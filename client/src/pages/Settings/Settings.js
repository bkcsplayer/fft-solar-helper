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

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fft-solar-export-${Date.now()}.json`);
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
