import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack, Save, Construction } from '@mui/icons-material';
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

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clients, setClients] = useState([]);

  const [formData, setFormData] = useState({
    address: '',
    client_id: '',
    customer_name: '',
    customer_phone: '',
    panel_brand: '',
    panel_watt: '',
    panel_quantity: '',
    installation_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchClients();
    if (isEdit) {
      fetchProject();
    }
  }, [id]);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients', { params: { is_active: 'true' } });
      setClients(response.data);
    } catch (err) {
      console.error('Fetch clients error:', err);
    }
  };

  const fetchProject = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/projects/${id}`);
      setFormData({
        address: response.data.address,
        client_id: response.data.client_id || '',
        customer_name: response.data.customer_name || '',
        customer_phone: response.data.customer_phone || '',
        panel_brand: response.data.panel_brand || '',
        panel_watt: response.data.panel_watt || '',
        panel_quantity: response.data.panel_quantity || '',
        installation_date: response.data.installation_date || '',
        notes: response.data.notes || '',
      });
    } catch (err) {
      setError('获取项目信息失败');
      console.error('Fetch project error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (isEdit) {
        await api.put(`/projects/${id}`, formData);
        setSuccess('项目更新成功！');
      } else {
        const response = await api.post('/projects', formData);
        setSuccess('项目创建成功！');

        setTimeout(() => {
          navigate(`/projects/${response.data.id}`);
        }, 1500);
        return;
      }

      setTimeout(() => {
        navigate(`/projects/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || '保存失败，请重试');
      console.error('Save project error:', err);
    } finally {
      setSaving(false);
    }
  };

  const calculateTotalWatt = () => {
    const watt = parseFloat(formData.panel_watt) || 0;
    const quantity = parseInt(formData.panel_quantity) || 0;
    return watt * quantity;
  };

  const calculateRevenue = () => {
    const totalWatt = calculateTotalWatt();
    const client = clients.find(c => c.id === formData.client_id);
    if (client && totalWatt > 0) {
      return (totalWatt * parseFloat(client.rate_per_watt)).toFixed(2);
    }
    return '0.00';
  };

  if (loading) {
    return (
      <Box sx={pageContainerStyle}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} sx={{ color: '#f59e0b' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={pageContainerStyle}>
      <Box sx={headerBarStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/projects')}
            sx={{
              ...modernSecondaryButtonStyle,
              mr: 2,
            }}
          >
            返回
          </Button>
          <Box sx={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '14px',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
          }}>
            <Construction sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography sx={pageTitleStyle} style={{ marginBottom: 0 }}>
            {isEdit ? '编辑项目' : '创建项目'}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: '12px' }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
          {success}
        </Alert>
      )}

      <Card sx={modernCardStyle}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: '#1e293b',
                mb: 2
              }}
            >
              基本信息
            </Typography>
            <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="项目地址"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  helperText="项目安装地址"
                  sx={modernInputStyle}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl required fullWidth sx={modernInputStyle}>
                  <InputLabel>甲方公司</InputLabel>
                  <Select
                    name="client_id"
                    value={formData.client_id}
                    label="甲方公司"
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>请选择</em>
                    </MenuItem>
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.company_name} (${client.rate_per_watt}/W)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="客户姓名"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  helperText="房主姓名"
                  sx={modernInputStyle}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="客户电话"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  sx={modernInputStyle}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="安装日期"
                  name="installation_date"
                  type="date"
                  value={formData.installation_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  helperText="预计安装日期"
                  sx={modernInputStyle}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ borderColor: '#e2e8f0' }} />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                  }}
                >
                  板子信息
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="板子品牌"
                  name="panel_brand"
                  value={formData.panel_brand}
                  onChange={handleChange}
                  helperText="例如: Canadian Solar"
                  sx={modernInputStyle}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="单板瓦数 (W)"
                  name="panel_watt"
                  type="number"
                  inputProps={{ min: '0' }}
                  value={formData.panel_watt}
                  onChange={handleChange}
                  helperText="每块板子的瓦数"
                  sx={modernInputStyle}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="板子数量"
                  name="panel_quantity"
                  type="number"
                  inputProps={{ min: '1' }}
                  value={formData.panel_quantity}
                  onChange={handleChange}
                  sx={modernInputStyle}
                />
              </Grid>

              {formData.panel_watt && formData.panel_quantity && (
                <Grid item xs={12}>
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                      border: 'none',
                      '& .MuiAlert-icon': { color: '#1e40af' }
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#1e40af' }}>
                      <strong>总瓦数：</strong>{calculateTotalWatt().toLocaleString()} W
                      <br />
                      <strong>预计收入：</strong>${parseFloat(calculateRevenue()).toLocaleString()}
                    </Typography>
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ borderColor: '#e2e8f0' }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="备注"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  sx={modernInputStyle}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    disabled={saving}
                    sx={modernButtonStyle}
                  >
                    {saving ? '保存中...' : isEdit ? '更新项目' : '创建项目'}
                  </Button>
                  <Button
                    size="large"
                    onClick={() => navigate('/projects')}
                    disabled={saving}
                    sx={modernSecondaryButtonStyle}
                  >
                    取消
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {!isEdit && (
        <Alert
          severity="info"
          sx={{
            mt: 3,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: 'none',
            '& .MuiAlert-icon': { color: '#92400e' }
          }}
        >
          <Typography sx={{ color: '#92400e' }}>
            创建项目后，您可以在项目详情页面添加逆变器、分配人员和跟踪施工进度。
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ProjectForm;
