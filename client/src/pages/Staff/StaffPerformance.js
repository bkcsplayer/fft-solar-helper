import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
  Alert,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Build as BuildIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const StaffPerformance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState(null);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  useEffect(() => {
    loadPerformance();
  }, [id, selectedYear, selectedMonth]);

  const loadPerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/staff/${id}/performance`, {
        params: {
          year: selectedYear,
          month: selectedMonth,
        },
      });
      setPerformance(response.data);
    } catch (error) {
      console.error('Failed to load performance:', error);
      setError('Failed to load staff performance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'leader':
        return 'primary';
      case 'electrician':
        return 'secondary';
      case 'installer':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/staff')} sx={{ mt: 2 }}>
          Back to Staff List
        </Button>
      </Container>
    );
  }

  if (!performance) {
    return null;
  }

  const { summary, projects } = performance;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/staff')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <PersonIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            {summary.staff_name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Performance Report
          </Typography>
        </Box>
      </Box>

      {/* Date Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <MenuItem value="">All Year</MenuItem>
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Role: ${summary.staff_role}`}
                  color={getRoleColor(summary.staff_role)}
                  size="small"
                />
                <Chip
                  label={`Pay: ${summary.pay_type === 'per_panel' ? `$${summary.pay_rate}/panel` : `$${summary.pay_rate}/project`}`}
                  color="default"
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BuildIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  {summary.total_projects}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Projects Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  {summary.total_panels_installed}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Panels Installed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  ${summary.total_income.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Income
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  ${summary.average_income_per_project.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Avg per Project
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Project Details
          </Typography>
          {projects.length === 0 ? (
            <Alert severity="info">No projects found for the selected period</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell align="center">Panels</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="right">Staff Income</TableCell>
                    <TableCell align="right">Project Revenue</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {project.address}
                        </Typography>
                      </TableCell>
                      <TableCell>{project.customer_name || '-'}</TableCell>
                      <TableCell>{project.client_name || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip label={project.panel_count} size="small" color="primary" />
                      </TableCell>
                      <TableCell>{project.panel_brand || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={project.role}
                          size="small"
                          color={getRoleColor(project.role)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                          ${project.staff_income.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        ${project.project_revenue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.status}
                          size="small"
                          color={getStatusColor(project.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell colSpan={6}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Total
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'success.main' }}>
                        ${summary.total_income.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default StaffPerformance;
