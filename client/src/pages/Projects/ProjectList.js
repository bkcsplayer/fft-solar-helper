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
  TablePagination
} from '@mui/material';
import DataManagementMenu from '../../components/common/DataManagementMenu';
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
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, projectId: null, projectAddress: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, yearFilter, monthFilter, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchProjects = async () => {
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };
      if (statusFilter) params.status = statusFilter;
      if (yearFilter) params.year = yearFilter;
      if (monthFilter) params.month = monthFilter;

      const response = await api.get('/projects', { params });

      if (response.data.pagination) {
        setProjects(response.data.data);
        setTotal(response.data.pagination.total);
      } else {
        // Fallback for old API response (array)
        setProjects(response.data);
        setTotal(response.data.length);
      }
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 100, ...modernInputStyle }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={yearFilter}
              label="Year"
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="2025">2025</MenuItem>
              <MenuItem value="2026">2026</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 100, ...modernInputStyle }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={monthFilter}
              label="Month"
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {[...Array(12)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>{i + 1}月</MenuItem>
              ))}
            </Select>
          </FormControl>
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
          <DataManagementMenu moduleName="projects" onSuccess={fetchProjects} />
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {project.project_type === 'insurance' && (
                        <Chip
                          label="保险"
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                      <Chip
                        label={statusNames[project.status]}
                        size="small"
                        sx={getModernChipStyle(statusVariants[project.status])}
                      />
                    </Box>
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
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
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
    </Box >
  );
};

export default ProjectList;
