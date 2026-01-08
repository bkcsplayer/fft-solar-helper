import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { Edit, Add, People } from '@mui/icons-material';
import api from '../../services/api';
import StaffDetail from './StaffDetail';
import {
  pageContainerStyle,
  pageTitleStyle,
  modernTableContainerStyle,
  modernTableHeadStyle,
  modernTableRowStyle,
  modernButtonStyle,
  modernIconButtonStyle,
  modernInputStyle,
  headerBarStyle,
  filterContainerStyle,
  getModernChipStyle,
} from '../../styles/modernStyles';

const roleNames = {
  leader: 'Leader',
  installer: 'Installer',
  electrician: 'Electrician',
};

const roleVariants = {
  leader: 'success',
  installer: 'warning',
  electrician: 'info',
};

const payTypeNames = {
  per_panel: 'Per Panel',
  per_project: 'Per Project',
};

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaff();
  }, [roleFilter]);

  const fetchStaff = async () => {
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;

      const response = await api.get('/staff', { params });
      // Filter out inactive staff (soft deleted)
      setStaff(response.data.filter(s => s.is_active !== false));
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={pageContainerStyle}>
      <Box sx={headerBarStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            Staff Management
          </Typography>
        </Box>
        <Box sx={filterContainerStyle}>
          <FormControl sx={{ minWidth: 150, ...modernInputStyle }}>
            <InputLabel>Filter by Role</InputLabel>
            <Select
              value={roleFilter}
              label="Filter by Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="leader">Leader</MenuItem>
              <MenuItem value="installer">Installer</MenuItem>
              <MenuItem value="electrician">Electrician</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/staff/new')}
            sx={modernButtonStyle}
          >
            Add Staff
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={modernTableContainerStyle}>
        <Table>
          <TableHead sx={modernTableHeadStyle}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Pay Type</TableCell>
              <TableCell>Pay Rate</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No staff members found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              staff.map((person) => (
                <TableRow
                  key={person.id}
                  sx={{
                    ...modernTableRowStyle,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                    }
                  }}
                  onClick={() => {
                    setSelectedStaffId(person.id);
                    setDetailDialogOpen(true);
                  }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {person.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={roleNames[person.role]}
                      size="small"
                      sx={getModernChipStyle(roleVariants[person.role])}
                    />
                  </TableCell>
                  <TableCell>{person.phone}</TableCell>
                  <TableCell>
                    <Typography sx={{ color: '#3b82f6' }}>
                      {person.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {payTypeNames[person.pay_type]}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      ${parseFloat(person.pay_rate).toFixed(2)}
                      <Typography component="span" variant="body2" sx={{ color: '#64748b', ml: 0.5 }}>
                        {person.pay_type === 'per_panel' ? '/panel' : '/project'}
                      </Typography>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={person.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={getModernChipStyle(person.is_active ? 'success' : 'default')}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/staff/${person.id}/edit`);
                      }}
                      sx={modernIconButtonStyle}
                    >
                      <Edit fontSize="small" sx={{ color: '#3b82f6' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <StaffDetail
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedStaffId(null);
        }}
        staffId={selectedStaffId}
        onDelete={fetchStaff}
      />
    </Box>
  );
};

export default StaffList;
