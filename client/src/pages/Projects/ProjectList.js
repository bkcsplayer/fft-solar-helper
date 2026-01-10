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
import { Edit, Visibility, Add, Construction, Delete } from '@mui/icons-material';
import api from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
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

const statusNames = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const statusVariants = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
};

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, projectId: null, projectAddress: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/projects', { params });
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId, projectAddress) => {
    setConfirmDialog({ open: true, projectId, projectAddress });
  };

  const confirmDelete = async () => {
    const { projectId } = confirmDialog;
    try {
      await api.delete(`/projects/${projectId}`);
      // Refresh the list
      fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('删除项目失败');
    }
  };

  return (
    <Box sx={pageContainerStyle}>
      <Box sx={headerBarStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            Project Management
          </Typography>
        </Box>
        <Box sx={filterContainerStyle}>
          <FormControl sx={{ minWidth: 150, ...modernInputStyle }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/projects/new')}
            sx={modernButtonStyle}
          >
            Create Project
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={modernTableContainerStyle}>
        <Table>
          <TableHead sx={modernTableHeadStyle}>
            <TableRow>
              <TableCell>Address</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Client Company</TableCell>
              <TableCell>Panel Qty</TableCell>
              <TableCell>Total Watt</TableCell>
              <TableCell>Est. Revenue</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Install Date</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No projects found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id} sx={modernTableRowStyle}>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, fontWeight: 500 }}>
                      {project.address}
                    </Typography>
                  </TableCell>
                  <TableCell>{project.customer_name || '-'}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {project.client?.company_name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>
                      {project.panel_quantity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      {project.total_watt?.toLocaleString()} W
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      ${parseFloat(project.project_revenue || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusNames[project.status]}
                      size="small"
                      sx={getModernChipStyle(statusVariants[project.status])}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {project.installation_date ? new Date(project.installation_date + 'T00:00:00').toLocaleDateString() : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(project.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}`);
                      }}
                      title="View Details"
                      sx={modernIconButtonStyle}
                    >
                      <Visibility fontSize="small" sx={{ color: '#8b5cf6' }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}/edit`);
                      }}
                      title="Edit"
                      sx={modernIconButtonStyle}
                    >
                      <Edit fontSize="small" sx={{ color: '#3b82f6' }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id, project.address);
                      }}
                      title="Delete"
                      sx={{ ...modernIconButtonStyle, ml: 1 }}
                    >
                      <Delete fontSize="small" sx={{ color: '#ef4444' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, projectId: null, projectAddress: '' })}
        onConfirm={confirmDelete}
        title="删除项目"
        message={`确定要删除项目 "${confirmDialog.projectAddress}" 吗？此操作将永久删除项目及其所有相关数据。`}
        confirmText="删除"
        cancelText="取消"
      />
    </Box>
  );
};

export default ProjectList;
