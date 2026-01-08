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
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack, Save, People } from '@mui/icons-material';
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

const StaffForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    role: 'installer',
    phone: '',
    email: '',
    pay_type: 'per_panel',
    pay_rate: '',
    is_active: true,
  });

  useEffect(() => {
    if (isEdit) {
      fetchStaff();
    }
  }, [id]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/staff/${id}`);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to fetch staff information');
      console.error('Fetch staff error:', err);
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

  const handleRoleChange = (e) => {
    const role = e.target.value;
    const defaultPayType = role === 'electrician' ? 'per_project' : 'per_panel';

    setFormData((prev) => ({
      ...prev,
      role,
      pay_type: defaultPayType,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (isEdit) {
        await api.put(`/staff/${id}`, formData);
        setSuccess('Staff information updated successfully!');
      } else {
        await api.post('/staff', formData);
        setSuccess('Staff member created successfully!');
      }

      setTimeout(() => {
        navigate('/staff');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed, please try again');
      console.error('Save staff error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={pageContainerStyle}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} sx={{ color: '#8b5cf6' }} />
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
            onClick={() => navigate('/staff')}
            sx={{
              ...modernSecondaryButtonStyle,
              mr: 2,
            }}
          >
            Back
          </Button>
          <Box sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            borderRadius: '14px',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
          }}>
            <People sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography sx={pageTitleStyle} style={{ marginBottom: 0 }}>
            {isEdit ? 'Edit Staff Member' : 'Add Staff Member'}
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
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  sx={modernInputStyle}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl required fullWidth sx={modernInputStyle}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    label="Role"
                    onChange={handleRoleChange}
                  >
                    <MenuItem value="leader">Leader</MenuItem>
                    <MenuItem value="installer">Installer</MenuItem>
                    <MenuItem value="electrician">Electrician</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  sx={modernInputStyle}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  helperText="For receiving project assignment notifications"
                  sx={modernInputStyle}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl required fullWidth sx={modernInputStyle}>
                  <InputLabel>Pay Type</InputLabel>
                  <Select
                    name="pay_type"
                    value={formData.pay_type}
                    label="Pay Type"
                    onChange={handleChange}
                  >
                    <MenuItem value="per_panel">Per Panel</MenuItem>
                    <MenuItem value="per_project">Per Project</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label={formData.pay_type === 'per_panel' ? 'Pay Rate ($/panel)' : 'Pay Rate ($/project)'}
                  name="pay_rate"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={formData.pay_rate}
                  onChange={handleChange}
                  helperText={
                    formData.pay_type === 'per_panel'
                      ? 'Price per panel, e.g., 15.00'
                      : 'Fixed price per project, e.g., 150.00'
                  }
                  sx={modernInputStyle}
                />
              </Grid>

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
                    <strong>Pay Calculation:</strong>
                    <br />
                    • Leader/Installer: Usually paid per panel - Pay = Panel Quantity × Pay Rate
                    <br />
                    • Electrician: Usually paid per project - Pay = Fixed Pay Rate
                  </Typography>
                </Alert>
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
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="large"
                    onClick={() => navigate('/staff')}
                    disabled={saving}
                    sx={modernSecondaryButtonStyle}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StaffForm;
