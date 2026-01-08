import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import {
  Box,
  Button,
  Typography,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Checkbox,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  TableHead,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  CheckCircle,
  Construction,
  Add,
  Delete,
  Email,
  Check,
  Cancel,
  CloudUpload,
  AttachFile,
  Photo,
  Description,
  Download,
  Visibility
} from '@mui/icons-material';
import api from '../../services/api';
import {
  pageContainerStyle,
  pageTitleStyle,
  modernCardStyle,
  modernSecondaryButtonStyle,
  modernButtonStyle,
  headerBarStyle,
  getModernChipStyle,
  modernInputStyle,
} from '../../styles/modernStyles';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState([]);

  // Staff assignment dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Notification
  const [notifying, setNotifying] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState('');

  // Progress confirmation dialog
  const [progressDialog, setProgressDialog] = useState({ open: false, stage: null, currentStatus: false });

  // Inverter dialog
  const [inverterDialogOpen, setInverterDialogOpen] = useState(false);
  const [editingInverter, setEditingInverter] = useState(null);
  const [inverterForm, setInverterForm] = useState({
    inverter_type: '',
    brand: '',
    model: '',
    watt_per_unit: '',
    quantity: 1
  });
  const [savingInverter, setSavingInverter] = useState(false);

  // File management
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null); // For carousel

  useEffect(() => {
    fetchProjectDetail();
    fetchProgress();
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProjectDetail = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await api.get(`/projects/${id}/progress`);
      setProgress(response.data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await api.get(`/projects/${id}/files`);
      setFiles(response.data);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const handleFileUpload = async (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);

    try {
      await api.post(`/projects/${id}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadSuccess(`${fileType === 'photo' ? 'Photo' : 'Document'} uploaded successfully!`);
      fetchFiles();
      event.target.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await api.delete(`/projects/${id}/files/${fileId}`);
      setUploadSuccess('File deleted successfully');
      fetchFiles();
    } catch (error) {
      console.error('Delete failed:', error);
      setUploadError(error.response?.data?.error || 'Failed to delete file');
    }
  };

  const handleFileDownload = (filePath, fileName) => {
    const url = `/uploads/${filePath}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const fetchStaffList = async () => {
    try {
      const response = await api.get('/staff', { params: { is_active: 'true' } });
      setStaffList(response.data);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const handleOpenAssignDialog = () => {
    fetchStaffList();
    setAssignDialogOpen(true);
    setSelectedStaff('');
    setSelectedRole('');
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedStaff('');
    setSelectedRole('');
  };

  const handleAssignStaff = async () => {
    if (!selectedStaff || !selectedRole) return;

    setAssigning(true);
    try {
      await api.post(`/projects/${id}/assignments`, {
        staff_id: selectedStaff,
        role_in_project: selectedRole
      });
      await fetchProjectDetail();
      handleCloseAssignDialog();
    } catch (error) {
      alert('分配人员失败：' + (error.response?.data?.error || error.message));
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm('确定要移除此人员分配吗？')) return;

    try {
      await api.delete(`/projects/${id}/assignments/${assignmentId}`);
      await fetchProjectDetail();
    } catch (error) {
      alert('移除分配失败：' + (error.response?.data?.error || error.message));
    }
  };

  const handleNotifyStaff = async () => {
    if (!window.confirm('确定要发送邮件通知所有未通知的人员吗？')) return;

    setNotifying(true);
    setNotifySuccess('');
    try {
      const response = await api.post(`/projects/${id}/notify`);
      setNotifySuccess(`成功发送 ${response.data.results.filter(r => r.success).length} 封通知邮件`);
      await fetchProjectDetail();
      setTimeout(() => setNotifySuccess(''), 3000);
    } catch (error) {
      alert('发送通知失败：' + (error.response?.data?.error || error.message));
    } finally {
      setNotifying(false);
    }
  };

  const handleOpenProgressDialog = (stage, currentStatus) => {
    setProgressDialog({ open: true, stage, currentStatus });
  };

  const handleCloseProgressDialog = () => {
    setProgressDialog({ open: false, stage: null, currentStatus: false });
  };

  const handleConfirmProgress = async () => {
    const { stage, currentStatus } = progressDialog;
    try {
      await api.put(`/projects/${id}/progress/${stage}`, { is_completed: !currentStatus });
      fetchProgress();
      fetchProjectDetail();
      handleCloseProgressDialog();
    } catch (error) {
      console.error('Failed to update progress:', error);
      alert('更新进度失败');
    }
  };

  // Inverter CRUD functions
  const handleOpenInverterDialog = (inverter = null) => {
    if (inverter) {
      setEditingInverter(inverter);
      setInverterForm({
        inverter_type: inverter.inverter_type,
        brand: inverter.brand,
        model: inverter.model,
        watt_per_unit: inverter.watt_per_unit,
        quantity: inverter.quantity
      });
    } else {
      setEditingInverter(null);
      setInverterForm({
        inverter_type: '',
        brand: '',
        model: '',
        watt_per_unit: '',
        quantity: 1
      });
    }
    setInverterDialogOpen(true);
  };

  const handleCloseInverterDialog = () => {
    setInverterDialogOpen(false);
    setEditingInverter(null);
    setInverterForm({
      inverter_type: '',
      brand: '',
      model: '',
      watt_per_unit: '',
      quantity: 1
    });
  };

  const handleInverterFormChange = (e) => {
    const { name, value } = e.target;
    setInverterForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveInverter = async () => {
    setSavingInverter(true);
    try {
      if (editingInverter) {
        // Update
        await api.put(`/projects/${id}/inverters/${editingInverter.id}`, inverterForm);
      } else {
        // Create
        await api.post(`/projects/${id}/inverters`, inverterForm);
      }
      await fetchProjectDetail();
      handleCloseInverterDialog();
    } catch (error) {
      alert('保存逆变器失败：' + (error.response?.data?.error || error.message));
    } finally {
      setSavingInverter(false);
    }
  };

  const handleDeleteInverter = async (inverterId) => {
    if (!window.confirm('确定要删除此逆变器吗？')) return;

    try {
      await api.delete(`/projects/${id}/inverters/${inverterId}`);
      await fetchProjectDetail();
    } catch (error) {
      alert('删除逆变器失败：' + (error.response?.data?.error || error.message));
    }
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

  if (!project) {
    return (
      <Box sx={pageContainerStyle}>
        <Typography>项目不存在</Typography>
      </Box>
    );
  }

  const stageNames = {
    roof_base: '屋顶底座',
    electrical: '电力部分',
    roof_install: '屋顶安装',
    bird_net: '鸟网'
  };

  const statusNames = {
    pending: '待分配',
    in_progress: '进行中',
    completed: '已完成',
  };

  const statusVariants = {
    pending: 'warning',
    in_progress: 'info',
    completed: 'success',
  };

  return (
    <Box sx={pageContainerStyle}>
      {/* Header */}
      <Box sx={{ ...headerBarStyle, mb: 4 }}>
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
          <Box>
            <Typography sx={pageTitleStyle} style={{ marginBottom: 0 }}>
              项目详情
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              {project.address}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Chip
            label={statusNames[project.status]}
            sx={getModernChipStyle(statusVariants[project.status])}
          />
          <Button
            startIcon={<Edit />}
            onClick={() => navigate(`/projects/${id}/edit`)}
            sx={modernButtonStyle}
          >
            编辑
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ ...modernCardStyle, mb: 3, p: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
              py: 2,
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
          <Tab label="基本信息" />
          <Tab label="逆变器" />
          <Tab label="人员分配" />
          <Tab label="施工进度" />
          <Tab label="财务明细" />
          <Tab label="文档和照片" />
        </Tabs>
      </Card>

      {/* Tab 1: 基本信息 */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={modernCardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: 700, color: '#1e293b' }}
                >
                  项目信息
                </Typography>
                <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />
                <Table size="small">
                  <TableBody>
                    <TableRow sx={{ '& td': { borderBottom: '1px solid #e2e8f0', py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>项目地址</TableCell>
                      <TableCell sx={{ color: '#1e293b' }}>{project.address}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '& td': { borderBottom: '1px solid #e2e8f0', py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>甲方公司</TableCell>
                      <TableCell sx={{ color: '#1e293b', fontWeight: 600 }}>{project.client?.company_name || '-'}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '& td': { borderBottom: '1px solid #e2e8f0', py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>客户姓名</TableCell>
                      <TableCell sx={{ color: '#1e293b' }}>{project.customer_name || '-'}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '& td': { borderBottom: '1px solid #e2e8f0', py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>客户电话</TableCell>
                      <TableCell sx={{ color: '#3b82f6' }}>{project.customer_phone || '-'}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '& td': { borderBottom: 'none', py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>创建时间</TableCell>
                      <TableCell sx={{ color: '#1e293b' }}>
                        {new Date(project.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={modernCardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: 700, color: '#1e293b' }}
                >
                  板子信息
                </Typography>
                <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />
                <Table size="small">
                  <TableBody>
                    <TableRow sx={{ '& td': { borderBottom: '1px solid #e2e8f0', py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>板子品牌</TableCell>
                      <TableCell sx={{ color: '#1e293b' }}>{project.panel_brand || '-'}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '& td': { borderBottom: '1px solid #e2e8f0', py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>单板瓦数</TableCell>
                      <TableCell sx={{ color: '#1e293b' }}>{project.panel_watt} W</TableCell>
                    </TableRow>
                    <TableRow sx={{ '& td': { borderBottom: '1px solid #e2e8f0', py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>板子数量</TableCell>
                      <TableCell sx={{ color: '#1e293b', fontWeight: 600 }}>{project.panel_quantity}</TableCell>
                    </TableRow>
                    <TableRow sx={{ '& td': { borderBottom: 'none', py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>总瓦数</TableCell>
                      <TableCell>
                        <Typography sx={{
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontSize: '1.1rem'
                        }}>
                          {project.total_watt?.toLocaleString()} W
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          {project.notes && (
            <Grid item xs={12}>
              <Card sx={modernCardStyle}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 700, color: '#1e293b' }}
                  >
                    备注
                  </Typography>
                  <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />
                  <Typography variant="body2" sx={{ color: '#64748b' }}>{project.notes}</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Tab 2: 逆变器 */}
      {activeTab === 1 && (
        <Card sx={modernCardStyle}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: '#1e293b' }}
              >
                逆变器列表
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenInverterDialog()}
                sx={modernButtonStyle}
              >
                添加逆变器
              </Button>
            </Box>
            <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />
            {project.inverters && project.inverters.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0' } }}>
                    <TableCell>类型</TableCell>
                    <TableCell>品牌</TableCell>
                    <TableCell>型号</TableCell>
                    <TableCell>单机瓦数</TableCell>
                    <TableCell>数量</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {project.inverters.map((inv, index) => (
                    <TableRow key={inv.id} sx={{ '& td': { borderBottom: '1px solid #e2e8f0', py: 2 } }}>
                      <TableCell>
                        <Chip
                          label={inv.inverter_type === 'hybrid' ? '混合型' : '微型'}
                          size="small"
                          sx={getModernChipStyle(inv.inverter_type === 'hybrid' ? 'primary' : 'info')}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>{inv.brand}</TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{inv.model}</TableCell>
                      <TableCell>
                        <Typography sx={{
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          {inv.watt_per_unit} W
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${inv.quantity} 台`}
                          size="small"
                          sx={getModernChipStyle('default')}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenInverterDialog(inv)}
                          sx={{
                            color: '#3b82f6',
                            '&:hover': {
                              background: 'rgba(59, 130, 246, 0.1)',
                            }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteInverter(inv.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': {
                              background: 'rgba(239, 68, 68, 0.1)',
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Alert
                severity="info"
                sx={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  border: 'none',
                  '& .MuiAlert-icon': { color: '#1e40af' }
                }}
              >
                暂无逆变器信息
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: 人员分配 */}
      {activeTab === 2 && (
        <Card sx={modernCardStyle}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: '#1e293b' }}
              >
                已分配人员
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {project.assignments && project.assignments.length > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<Email />}
                    onClick={handleNotifyStaff}
                    disabled={notifying}
                    sx={{
                      borderRadius: '12px',
                      borderColor: '#8b5cf6',
                      color: '#8b5cf6',
                      '&:hover': {
                        borderColor: '#7c3aed',
                        background: 'rgba(139, 92, 246, 0.04)',
                      }
                    }}
                  >
                    {notifying ? '发送中...' : '通知人员'}
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleOpenAssignDialog}
                  sx={modernButtonStyle}
                >
                  添加人员
                </Button>
              </Box>
            </Box>
            {notifySuccess && (
              <Alert
                severity="success"
                sx={{ mb: 2, borderRadius: '12px' }}
                onClose={() => setNotifySuccess('')}
              >
                {notifySuccess}
              </Alert>
            )}
            <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />
            {project.assignments && project.assignments.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0' } }}>
                    <TableCell>姓名</TableCell>
                    <TableCell>角色</TableCell>
                    <TableCell>电话</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>预计薪资</TableCell>
                    <TableCell>通知状态</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {project.assignments.map((assignment) => (
                    <TableRow key={assignment.id} sx={{ '& td': { borderBottom: '1px solid #e2e8f0', py: 2 } }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {assignment.staff?.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            assignment.role_in_project === 'leader' ? '领队' :
                              assignment.role_in_project === 'installer' ? '安装人员' : '电工'
                          }
                          size="small"
                          sx={getModernChipStyle(assignment.role_in_project === 'leader' ? 'primary' : 'default')}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#3b82f6' }}>{assignment.staff?.phone}</TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{assignment.staff?.email || '-'}</TableCell>
                      <TableCell>
                        <Typography sx={{
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          ${parseFloat(assignment.calculated_pay || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {assignment.is_notified ? (
                          <Chip label="已通知" size="small" sx={getModernChipStyle('success')} />
                        ) : (
                          <Chip label="未通知" size="small" sx={getModernChipStyle('default')} />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': {
                              background: 'rgba(239, 68, 68, 0.1)',
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Alert
                severity="warning"
                sx={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: 'none',
                  '& .MuiAlert-icon': { color: '#92400e' }
                }}
              >
                尚未分配人员
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 4: 施工进度 */}
      {activeTab === 3 && (
        <Card sx={modernCardStyle}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 700, color: '#1e293b' }}
            >
              施工进度跟踪
            </Typography>
            <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />
            <Grid container spacing={2}>
              {progress.map((stage) => (
                <Grid item xs={12} md={6} key={stage.id}>
                  <Card sx={{
                    borderRadius: '16px',
                    border: stage.is_completed ? '2px solid #10b981' : '1px solid #e2e8f0',
                    background: stage.is_completed
                      ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                      : 'white',
                    transition: 'all 0.3s ease',
                  }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <CheckCircle sx={{
                            color: stage.is_completed ? '#10b981' : '#cbd5e1',
                            fontSize: 28
                          }} />
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: stage.is_completed ? '#065f46' : '#1e293b' }}>
                              {stageNames[stage.stage]}
                            </Typography>
                            {stage.is_completed && stage.completed_at && (
                              <Typography variant="caption" sx={{ color: '#059669' }}>
                                完成于: {new Date(stage.completed_at).toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          variant={stage.is_completed ? "outlined" : "contained"}
                          startIcon={stage.is_completed ? <Cancel /> : <Check />}
                          onClick={() => handleOpenProgressDialog(stage.stage, stage.is_completed)}
                          sx={{
                            borderRadius: '10px',
                            px: 2,
                            ...(stage.is_completed ? {
                              borderColor: '#64748b',
                              color: '#64748b',
                              '&:hover': {
                                borderColor: '#475569',
                                background: 'rgba(100, 116, 139, 0.04)',
                              }
                            } : {
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                              }
                            })
                          }}
                        >
                          {stage.is_completed ? '取消完成' : '标记完成'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: 财务明细 */}
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={modernCardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  收入
                </Typography>
                <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />
                <Table size="small">
                  <TableBody>
                    <TableRow sx={{ '& td': { borderBottom: '1px solid #e2e8f0', py: 1.5 } }}>
                      <TableCell sx={{ color: '#64748b' }}>总瓦数</TableCell>
                      <TableCell sx={{ color: '#1e293b', fontWeight: 500 }}>{project.total_watt?.toLocaleString()} W</TableCell>
                    </TableRow>
                    <TableRow sx={{ '& td': { borderBottom: '1px solid #e2e8f0', py: 1.5 } }}>
                      <TableCell sx={{ color: '#64748b' }}>单价</TableCell>
                      <TableCell sx={{ color: '#1e293b', fontWeight: 500 }}>${project.client?.rate_per_watt}/W</TableCell>
                    </TableRow>
                    <TableRow sx={{ '& td': { borderBottom: 'none', py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>项目收入</TableCell>
                      <TableCell>
                        <Typography sx={{
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontSize: '1.1rem'
                        }}>
                          ${parseFloat(project.project_revenue || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={modernCardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  支出
                </Typography>
                <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />
                <Table size="small">
                  <TableBody>
                    {project.assignments && project.assignments.map((assignment) => (
                      <TableRow key={assignment.id} sx={{ '& td': { borderBottom: '1px solid #e2e8f0', py: 1.5 } }}>
                        <TableCell sx={{ color: '#64748b' }}>
                          {assignment.staff?.name}
                          <Typography component="span" variant="caption" sx={{ ml: 0.5, color: '#94a3b8' }}>
                            ({assignment.role_in_project === 'leader' ? '领队' :
                              assignment.role_in_project === 'installer' ? '安装' : '电工'})
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#1e293b', fontWeight: 500 }}>
                          ${parseFloat(assignment.calculated_pay || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ '& td': { borderBottom: 'none', py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>总支出</TableCell>
                      <TableCell>
                        <Typography sx={{
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontSize: '1.1rem'
                        }}>
                          ${parseFloat(project.project_expense || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{
              ...modernCardStyle,
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: 700, color: '#1e40af' }}
                >
                  利润
                </Typography>
                <Divider sx={{ mb: 2, borderColor: '#93c5fd' }} />
                <Typography sx={{
                  fontWeight: 800,
                  fontSize: '2rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  ${parseFloat(project.project_profit || 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 6: 文档和照片 */}
      {activeTab === 5 && (
        <Grid container spacing={3}>
          {/* Upload Success/Error Messages */}
          {uploadSuccess && (
            <Grid item xs={12}>
              <Alert
                severity="success"
                onClose={() => setUploadSuccess('')}
                sx={{ borderRadius: '12px' }}
              >
                {uploadSuccess}
              </Alert>
            </Grid>
          )}
          {uploadError && (
            <Grid item xs={12}>
              <Alert
                severity="error"
                onClose={() => setUploadError('')}
                sx={{ borderRadius: '12px' }}
              >
                {uploadError}
              </Alert>
            </Grid>
          )}

          {/* Upload Section */}
          <Grid item xs={12} md={6}>
            <Card sx={modernCardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Photo sx={{ fontSize: 28, mr: 1.5, color: '#3b82f6' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    上传照片
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  disabled={uploading}
                  fullWidth
                  sx={{
                    borderRadius: '12px',
                    borderWidth: '2px',
                    borderStyle: 'dashed',
                    py: 2,
                    '&:hover': {
                      borderWidth: '2px',
                      background: 'rgba(59, 130, 246, 0.04)'
                    }
                  }}
                >
                  {uploading ? '上传中...' : '选择照片'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'photo')}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  支持 JPG, PNG, GIF 等图片格式
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={modernCardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Description sx={{ fontSize: 28, mr: 1.5, color: '#10b981' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    上传文档
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  disabled={uploading}
                  fullWidth
                  sx={{
                    borderRadius: '12px',
                    borderWidth: '2px',
                    borderStyle: 'dashed',
                    py: 2,
                    '&:hover': {
                      borderWidth: '2px',
                      background: 'rgba(16, 185, 129, 0.04)'
                    }
                  }}
                >
                  {uploading ? '上传中...' : '选择文档'}
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={(e) => handleFileUpload(e, 'document')}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  支持 PDF, Word, Excel, TXT 等文档格式
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Photos List */}
          <Grid item xs={12}>
            <Card sx={modernCardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Photo sx={{ fontSize: 28, mr: 1.5, color: '#3b82f6' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    照片列表
                  </Typography>
                  <Chip
                    label={files.filter(f => f.file_type === 'photo').length}
                    size="small"
                    sx={{ ml: 2 }}
                    color="primary"
                  />
                </Box>
                <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />
                {files.filter(f => f.file_type === 'photo').length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    暂无照片
                  </Typography>
                ) : (
                  <Box sx={{
                    '& .carousel-root': {
                      maxWidth: '100%',
                    },
                    '& .carousel .slide': {
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '400px',
                    },
                    '& .carousel .slide img': {
                      maxHeight: '500px',
                      width: 'auto',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                    '& .carousel .thumbs-wrapper': {
                      margin: '20px 0',
                    },
                    '& .carousel .thumb': {
                      width: '60px !important',
                      height: '60px !important',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '2px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      marginRight: '8px',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        transform: 'scale(1.05)',
                      },
                    },
                    '& .carousel .thumb.selected': {
                      border: '3px solid #3b82f6 !important',
                      transform: 'scale(1.05)',
                    },
                    '& .carousel .thumb img': {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '6px',
                    },
                    '& .carousel .control-arrow': {
                      width: '48px',
                      height: '48px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '50%',
                      border: '2px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.9,
                      transition: 'all 0.3s ease',
                      margin: '0 20px',
                      '&:hover': {
                        background: '#3b82f6',
                        borderColor: '#3b82f6',
                        opacity: 1,
                        '&:before': {
                          borderColor: 'white !important',
                        },
                      },
                      '&:before': {
                        borderWidth: '0 3px 3px 0',
                        padding: '6px',
                      },
                    },
                    '& .carousel .control-prev.control-arrow:before': {
                      borderWidth: '0 0 3px 3px',
                    },
                    '& .carousel .control-dots': {
                      bottom: '-40px',
                      '& .dot': {
                        background: '#cbd5e1',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        margin: '0 6px',
                        transition: 'all 0.3s ease',
                        boxShadow: 'none',
                        '&.selected': {
                          background: '#3b82f6',
                          width: '24px',
                          borderRadius: '5px',
                        },
                      },
                    },
                  }}>
                    <Carousel
                      showThumbs={true}
                      infiniteLoop={true}
                      useKeyboardArrows={true}
                      autoPlay={false}
                      showStatus={true}
                      dynamicHeight={false}
                      thumbWidth={60}
                      renderArrowPrev={(onClickHandler, hasPrev, label) =>
                        hasPrev && (
                          <button
                            type="button"
                            onClick={onClickHandler}
                            title={label}
                            className="control-arrow control-prev"
                            style={{
                              position: 'absolute',
                              zIndex: 2,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              left: 0,
                              cursor: 'pointer',
                            }}
                          />
                        )
                      }
                      renderArrowNext={(onClickHandler, hasNext, label) =>
                        hasNext && (
                          <button
                            type="button"
                            onClick={onClickHandler}
                            title={label}
                            className="control-arrow control-next"
                            style={{
                              position: 'absolute',
                              zIndex: 2,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              right: 0,
                              cursor: 'pointer',
                            }}
                          />
                        )
                      }
                    >
                      {files.filter(f => f.file_type === 'photo').map((file) => (
                        <div key={file.id}>
                          <img
                            src={`/uploads/${file.file_path}`}
                            alt={file.file_name}
                            onError={(e) => {
                              console.error('Image load failed:', e.target.src);
                            }}
                          />
                          <Box sx={{
                            p: 3,
                            bgcolor: 'white',
                            borderRadius: '16px',
                            mt: 2,
                            mx: 2,
                            textAlign: 'left',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #e2e8f0',
                          }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1.5, color: '#1e293b' }}>
                              {file.file_name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                  上传时间:
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(file.uploaded_at).toLocaleString()}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                  大小:
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {(file.file_size / 1024).toFixed(1)} KB
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileDownload(file.file_path, file.file_name);
                                }}
                                sx={{
                                  borderRadius: '10px',
                                  px: 2,
                                  borderColor: '#3b82f6',
                                  color: '#3b82f6',
                                  '&:hover': {
                                    borderColor: '#2563eb',
                                    background: 'rgba(59, 130, 246, 0.04)',
                                  }
                                }}
                              >
                                下载
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Delete />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileDelete(file.id);
                                }}
                                sx={{
                                  borderRadius: '10px',
                                  px: 2,
                                }}
                              >
                                删除
                              </Button>
                            </Box>
                          </Box>
                        </div>
                      ))}
                    </Carousel>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Documents List */}
          <Grid item xs={12}>
            <Card sx={modernCardStyle}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Description sx={{ fontSize: 28, mr: 1.5, color: '#10b981' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    文档列表
                  </Typography>
                  <Chip
                    label={files.filter(f => f.file_type === 'document').length}
                    size="small"
                    sx={{ ml: 2 }}
                    color="success"
                  />
                </Box>
                <Divider sx={{ mb: 2, borderColor: '#e2e8f0' }} />
                {files.filter(f => f.file_type === 'document').length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    暂无文档
                  </Typography>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>文件名</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>大小</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>上传时间</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {files.filter(f => f.file_type === 'document').map((file) => (
                        <TableRow key={file.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AttachFile sx={{ mr: 1, color: '#64748b' }} />
                              <Typography variant="body2">{file.file_name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {(file.file_size / 1024).toFixed(2)} KB
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(file.uploaded_at).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleFileDownload(file.file_path, file.file_name)}
                            >
                              <Download />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleFileDelete(file.id)}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 添加人员对话框 */}
      <Dialog
        open={assignDialogOpen}
        onClose={handleCloseAssignDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          color: '#1e293b',
          borderBottom: '1px solid #e2e8f0',
          pb: 2
        }}>
          添加项目人员
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={modernInputStyle}>
                <InputLabel>选择员工</InputLabel>
                <Select
                  value={selectedStaff}
                  label="选择员工"
                  onChange={(e) => setSelectedStaff(e.target.value)}
                >
                  <MenuItem value="">
                    <em>请选择员工</em>
                  </MenuItem>
                  {staffList.map((staff) => (
                    <MenuItem key={staff.id} value={staff.id}>
                      {staff.name} - {staff.phone}
                      ({staff.pay_type === 'per_panel' ? `$${staff.pay_rate}/板` : `$${staff.pay_rate}/项目`})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth sx={modernInputStyle}>
                <InputLabel>项目角色</InputLabel>
                <Select
                  value={selectedRole}
                  label="项目角色"
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <MenuItem value="">
                    <em>请选择角色</em>
                  </MenuItem>
                  <MenuItem value="leader">领队</MenuItem>
                  <MenuItem value="installer">安装人员</MenuItem>
                  <MenuItem value="electrician">电工</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {selectedStaff && selectedRole && (
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
                  {(() => {
                    const staff = staffList.find(s => s.id === selectedStaff);
                    if (!staff) return '';
                    let pay;
                    if (staff.pay_type === 'per_panel') {
                      pay = (project.panel_quantity * parseFloat(staff.pay_rate)).toFixed(2);
                    } else {
                      pay = parseFloat(staff.pay_rate).toFixed(2);
                    }
                    return `预计薪资：$${pay}`;
                  })()}
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={handleCloseAssignDialog}
            sx={{
              borderRadius: '12px',
              color: '#64748b',
              '&:hover': { background: 'rgba(100, 116, 139, 0.04)' }
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleAssignStaff}
            variant="contained"
            disabled={!selectedStaff || !selectedRole || assigning}
            sx={modernButtonStyle}
          >
            {assigning ? '添加中...' : '确认添加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 进度确认对话框 */}
      <Dialog
        open={progressDialog.open}
        onClose={handleCloseProgressDialog}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          color: '#1e293b',
          borderBottom: '1px solid #e2e8f0',
          pb: 2
        }}>
          确认进度变更
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: '#64748b' }}>
            {progressDialog.stage && progressDialog.currentStatus
              ? `确定要取消完成「${stageNames[progressDialog.stage]}」吗？`
              : progressDialog.stage
                ? `确定要标记「${stageNames[progressDialog.stage]}」为完成吗？`
                : ''
            }
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={handleCloseProgressDialog}
            sx={{
              borderRadius: '12px',
              color: '#64748b',
              '&:hover': { background: 'rgba(100, 116, 139, 0.04)' }
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleConfirmProgress}
            variant="contained"
            sx={modernButtonStyle}
          >
            确认
          </Button>
        </DialogActions>
      </Dialog>

      {/* 逆变器对话框 */}
      <Dialog
        open={inverterDialogOpen}
        onClose={handleCloseInverterDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          color: '#1e293b',
          borderBottom: '1px solid #e2e8f0',
          pb: 2
        }}>
          {editingInverter ? '编辑逆变器' : '添加逆变器'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={modernInputStyle}>
                <InputLabel>逆变器类型</InputLabel>
                <Select
                  name="inverter_type"
                  value={inverterForm.inverter_type}
                  label="逆变器类型"
                  onChange={handleInverterFormChange}
                >
                  <MenuItem value="">
                    <em>请选择类型</em>
                  </MenuItem>
                  <MenuItem value="hybrid">混合型 (Hybrid)</MenuItem>
                  <MenuItem value="micro">微型 (Micro)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="品牌"
                name="brand"
                value={inverterForm.brand}
                onChange={handleInverterFormChange}
                placeholder="例如: Enphase"
                sx={modernInputStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="型号"
                name="model"
                value={inverterForm.model}
                onChange={handleInverterFormChange}
                placeholder="例如: IQ8+"
                sx={modernInputStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="单机瓦数 (W)"
                name="watt_per_unit"
                type="number"
                inputProps={{ min: '0' }}
                value={inverterForm.watt_per_unit}
                onChange={handleInverterFormChange}
                sx={modernInputStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="数量"
                name="quantity"
                type="number"
                inputProps={{ min: '1' }}
                value={inverterForm.quantity}
                onChange={handleInverterFormChange}
                sx={modernInputStyle}
              />
            </Grid>
            {inverterForm.watt_per_unit && inverterForm.quantity && (
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
                  总功率：{(parseInt(inverterForm.watt_per_unit) * parseInt(inverterForm.quantity)).toLocaleString()} W
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={handleCloseInverterDialog}
            sx={{
              borderRadius: '12px',
              color: '#64748b',
              '&:hover': { background: 'rgba(100, 116, 139, 0.04)' }
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleSaveInverter}
            variant="contained"
            disabled={!inverterForm.inverter_type || !inverterForm.watt_per_unit || !inverterForm.quantity || savingInverter}
            sx={modernButtonStyle}
          >
            {savingInverter ? '保存中...' : editingInverter ? '更新' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetail;
