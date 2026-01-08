import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack, Save, Business } from '@mui/icons-material';
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

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    rate_per_watt: '',
    address: '',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    if (isEdit) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/clients/${id}`);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to fetch client information');
      console.error('Fetch client error:', err);
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
        await api.put(`/clients/${id}`, formData);
        setSuccess('Client information updated successfully!');
      } else {
        await api.post('/clients', formData);
        setSuccess('Client created successfully!');
      }

      setTimeout(() => {
        navigate('/clients');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed, please try again');
      console.error('Save client error:', err);
    } finally {
      setSaving(false);
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

  return (
    <Box sx={pageContainerStyle}>
      <Box sx={headerBarStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/clients')}
            sx={{
              ...modernSecondaryButtonStyle,
              mr: 2,
            }}
          >
            Back
          </Button>
          <Box sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '14px',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
          }}>
            <Business sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography sx={pageTitleStyle} style={{ marginBottom: 0 }}>
            {isEdit ? 'Edit Client' : 'Add Client'}
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
                  label="Company Name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  sx={modernInputStyle}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  sx={modernInputStyle}
                />
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
                  sx={modernInputStyle}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Rate ($/W)"
                  name="rate_per_watt"
                  type="number"
                  inputProps={{ step: '0.0001', min: '0' }}
                  value={formData.rate_per_watt}
                  onChange={handleChange}
                  helperText="Price per watt, e.g., 0.50"
                  sx={modernInputStyle}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  sx={modernInputStyle}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
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
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="large"
                    onClick={() => navigate('/clients')}
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

export default ClientForm;
