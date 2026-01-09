import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableFooter,
    Paper,
    TextField,
    Box,
    Chip,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Email as EmailIcon,
    Work as WorkIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import api from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';

const StaffDetail = ({ open, onClose, staffId, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [timesheetResult, setTimesheetResult] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState(false);

    useEffect(() => {
        if (open && staffId) {
            loadStaffDetail();
        }
    }, [open, staffId]);

    const loadStaffDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/staff/${staffId}/detail`);
            setStaff(response.data.staff);
            setAssignments(response.data.assignments);
        } catch (error) {
            console.error('Failed to load staff detail:', error);
            showSnackbar('Failed to load staff detail', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateTimesheet = async () => {
        if (!startDate || !endDate) {
            showSnackbar('Please select start and end dates', 'warning');
            return;
        }

        try {
            const response = await api.get(`/staff/${staffId}/projects`, {
                params: { startDate, endDate }
            });

            const totalPay = response.data.reduce((sum, a) => sum + parseFloat(a.calculated_pay || 0), 0);

            // 保留项目的板数量和单板瓦数信息，并计算收入
            const projectsWithDetails = response.data.map(assignment => {
                const project = assignment.project || {};
                const panelQuantity = project.panel_quantity || 0;
                const panelWatt = project.panel_watt || 0;
                const totalWatt = panelWatt * panelQuantity;

                // 收入 = 总瓦数 × 单价/瓦
                const ratePerWatt = project.client?.rate_per_watt || 0;
                const revenue = totalWatt * ratePerWatt;

                return {
                    ...assignment,
                    project: {
                        ...project,
                        panelQuantity,
                        panelWatt,
                        totalWatt,
                        ratePerWatt,
                        revenue: revenue.toFixed(2)
                    }
                };
            });

            const totalRevenue = projectsWithDetails.reduce((sum, a) =>
                sum + parseFloat(a.project.revenue || 0), 0
            );

            setTimesheetResult({
                projectCount: response.data.length,
                totalPay: totalPay.toFixed(2),
                totalRevenue: totalRevenue.toFixed(2),
                projects: projectsWithDetails
            });
        } catch (error) {
            console.error('Failed to calculate timesheet:', error);
            showSnackbar('Failed to calculate timesheet', 'error');
        }
    };

    const handleSendTimesheet = async () => {
        if (!startDate || !endDate) {
            showSnackbar('Please select start and end dates', 'warning');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post(`/staff/${staffId}/timesheet`, {
                startDate,
                endDate
            });
            showSnackbar(`Timesheet sent successfully! Total: $${response.data.totalPay}`, 'success');
            setTimesheetResult(null);
        } catch (error) {
            console.error('Failed to send timesheet:', error);
            showSnackbar(error.response?.data?.error || 'Failed to send timesheet', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStaff = async () => {
        setConfirmDialog(true);
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/staff/${staffId}`);
            showSnackbar('员工已删除', 'success');
            setTimeout(() => {
                onClose();
                if (onDelete) onDelete();
            }, 1000);
        } catch (error) {
            console.error('Failed to delete staff:', error);
            showSnackbar(error.response?.data?.error || '删除员工失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'leader': return 'primary';
            case 'installer': return 'info';
            case 'electrician': return 'warning';
            default: return 'default';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'info';
            case 'pending': return 'default';
            default: return 'default';
        }
    };

    if (!staff) {
        return null;
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        pb: 2.5,
                        pt: 2.5
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {staff.name}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Employee Detail
                            </Typography>
                        </Box>
                        <Chip
                            label={staff.role}
                            color={getRoleBadgeColor(staff.role)}
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.25)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ bgcolor: '#f8f9fa', pt: 3 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {/* Basic Info */}
                            <Grid item xs={12}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                            borderColor: 'primary.light'
                                        }
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Box component="span" sx={{
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: 32,
                                            height: 32,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 1.5
                                        }}>
                                            👤
                                        </Box>
                                        Basic Information
                                    </Typography>
                                    <Grid container spacing={2.5}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>Phone</Typography>
                                            <Typography variant="body1" fontWeight={500}>{staff.phone || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>Email</Typography>
                                            <Typography variant="body1" fontWeight={500}>{staff.email || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>Pay Type</Typography>
                                            <Typography variant="body1" fontWeight={500}>{staff.pay_type === 'per_panel' ? 'Per Panel' : 'Per Project'}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>Pay Rate</Typography>
                                            <Typography variant="body1" fontWeight={500} color="primary.main">${parseFloat(staff.pay_rate).toFixed(2)}</Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            {/* Statistics Cards */}
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    {/* Total Projects */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box>
                                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                                        总项目数
                                                    </Typography>
                                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                        {assignments.length}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{
                                                    bgcolor: 'rgba(255,255,255,0.2)',
                                                    borderRadius: '50%',
                                                    width: 48,
                                                    height: 48,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 24
                                                }}>
                                                    📊
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    {/* Total Expected Pay */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                color: 'white',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 8px 24px rgba(240, 147, 251, 0.4)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box>
                                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                                        总应付
                                                    </Typography>
                                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                        ${assignments.reduce((sum, a) => sum + parseFloat(a.calculated_pay || 0), 0).toFixed(2)}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{
                                                    bgcolor: 'rgba(255,255,255,0.2)',
                                                    borderRadius: '50%',
                                                    width: 48,
                                                    height: 48,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 24
                                                }}>
                                                    💰
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    {/* Total Paid */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                                color: 'white',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 8px 24px rgba(79, 172, 254, 0.4)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box>
                                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                                        已支付
                                                    </Typography>
                                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                        ${assignments.reduce((sum, a) => sum + parseFloat(a.paid_amount || 0), 0).toFixed(2)}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{
                                                    bgcolor: 'rgba(255,255,255,0.2)',
                                                    borderRadius: '50%',
                                                    width: 48,
                                                    height: 48,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 24
                                                }}>
                                                    ✅
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    {/* Total Unpaid */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                                color: 'white',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 8px 24px rgba(250, 112, 154, 0.4)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box>
                                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                                        待支付
                                                    </Typography>
                                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                        ${(assignments.reduce((sum, a) => sum + parseFloat(a.calculated_pay || 0), 0) -
                                                            assignments.reduce((sum, a) => sum + parseFloat(a.paid_amount || 0), 0)).toFixed(2)}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{
                                                    bgcolor: 'rgba(255,255,255,0.2)',
                                                    borderRadius: '50%',
                                                    width: 48,
                                                    height: 48,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 24
                                                }}>
                                                    ⏳
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Project History */}
                            <Grid item xs={12}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                            borderColor: 'primary.light'
                                        }
                                    }}
                                >
                                    <Box sx={{ p: 2.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                            <WorkIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                                            Project History
                                        </Typography>
                                    </Box>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    '& th': {
                                                        color: 'white',
                                                        fontWeight: 700,
                                                        borderBottom: 'none',
                                                        fontSize: '0.85rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }
                                                }}>
                                                    <TableCell>Project Address</TableCell>
                                                    <TableCell>Client</TableCell>
                                                    <TableCell>Role</TableCell>
                                                    <TableCell>Assigned Date</TableCell>
                                                    <TableCell align="right">Pay</TableCell>
                                                    <TableCell>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {assignments.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                            <Typography color="text.secondary">No projects assigned yet</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    assignments.map((assignment, index) => (
                                                        <TableRow
                                                            key={assignment.id}
                                                            sx={{
                                                                bgcolor: index % 2 === 0 ? 'grey.50' : 'white',
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                    bgcolor: 'primary.light',
                                                                    transform: 'scale(1.01)',
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                                    '& td': {
                                                                        color: 'primary.contrastText'
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <TableCell sx={{ fontWeight: 500 }}>{assignment.project?.address || 'N/A'}</TableCell>
                                                            <TableCell>{assignment.project?.client?.company_name || 'N/A'}</TableCell>
                                                            <TableCell>
                                                                <Chip label={assignment.role_in_project} size="small" color={getRoleBadgeColor(assignment.role_in_project)} />
                                                            </TableCell>
                                                            <TableCell>{new Date(assignment.assigned_at).toLocaleDateString()}</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>${parseFloat(assignment.calculated_pay || 0).toFixed(2)}</TableCell>
                                                            <TableCell>
                                                                <Chip label={assignment.project?.status || 'N/A'} size="small" color={getStatusColor(assignment.project?.status)} />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                            {assignments.length > 0 && (() => {
                                                const totalExpected = assignments.reduce((sum, a) => sum + parseFloat(a.calculated_pay || 0), 0);
                                                const totalPaid = assignments.reduce((sum, a) => sum + parseFloat(a.paid_amount || 0), 0);
                                                const totalUnpaid = totalExpected - totalPaid;

                                                return (
                                                    <TableFooter>
                                                        <TableRow sx={{ bgcolor: 'primary.dark' }}>
                                                            <TableCell colSpan={4} align="right" sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                                                                汇总统计：
                                                            </TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>
                                                                ${totalExpected.toFixed(2)}
                                                            </TableCell>
                                                            <TableCell sx={{ fontWeight: 600, color: 'white' }}>
                                                                要支付
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow sx={{ bgcolor: 'success.dark' }}>
                                                            <TableCell colSpan={4} align="right" sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                                                            </TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>
                                                                ${totalPaid.toFixed(2)}
                                                            </TableCell>
                                                            <TableCell sx={{ fontWeight: 600, color: 'white' }}>
                                                                已支付
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow sx={{ bgcolor: totalUnpaid > 0 ? 'error.dark' : 'success.main' }}>
                                                            <TableCell colSpan={4} align="right" sx={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>
                                                            </TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>
                                                                ${totalUnpaid.toFixed(2)}
                                                            </TableCell>
                                                            <TableCell sx={{ fontWeight: 600, color: 'white' }}>
                                                                未支付
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableFooter>
                                                );
                                            })()}
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>

                            {/* Timesheet Calculator */}
                            <Grid item xs={12}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                            borderColor: 'primary.light'
                                        }
                                    }}
                                >
                                    <Box sx={{ p: 2.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CalendarIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                                            Timesheet Calculator
                                        </Typography>
                                    </Box>
                                    <Box sx={{ p: 2.5 }}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} sm={4}>
                                                <TextField
                                                    fullWidth
                                                    label="Start Date"
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                    size="small"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <TextField
                                                    fullWidth
                                                    label="End Date"
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                    size="small"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={handleCalculateTimesheet}
                                                    sx={{ height: 40 }}
                                                >
                                                    Calculate
                                                </Button>
                                            </Grid>

                                            {timesheetResult && (
                                                <>
                                                    <Grid item xs={12}>
                                                        <Paper
                                                            sx={{
                                                                p: 2.5,
                                                                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                                                                border: '2px solid',
                                                                borderColor: 'primary.light',
                                                                borderRadius: 2
                                                            }}
                                                        >
                                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                <strong>Period:</strong> {startDate} to {endDate}
                                                            </Typography>
                                                            <Typography variant="body1" sx={{ mb: 2 }}>
                                                                <strong>Projects:</strong> {timesheetResult.projectCount}
                                                            </Typography>

                                                            {/* 项目详细列表 */}
                                                            {timesheetResult.projects && timesheetResult.projects.length > 0 && (
                                                                <Box sx={{ mb: 2 }}>
                                                                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1.5 }}>
                                                                        Project Details:
                                                                    </Typography>
                                                                    {timesheetResult.projects.map((assignment, index) => (
                                                                        <Box
                                                                            key={index}
                                                                            sx={{
                                                                                mb: 1.5,
                                                                                p: 1.5,
                                                                                bgcolor: 'white',
                                                                                borderRadius: 1,
                                                                                border: '1px solid',
                                                                                borderColor: 'divider'
                                                                            }}
                                                                        >
                                                                            <Grid container spacing={1}>
                                                                                <Grid item xs={12}>
                                                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                                        📍 {assignment.project?.address || 'N/A'}
                                                                                    </Typography>
                                                                                </Grid>
                                                                                {assignment.project?.installation_date && (
                                                                                    <Grid item xs={12}>
                                                                                        <Typography variant="caption" color="text.secondary">
                                                                                            📅 {new Date(assignment.project.installation_date).toLocaleDateString()}
                                                                                        </Typography>
                                                                                    </Grid>
                                                                                )}
                                                                                <Grid item xs={6}>
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        📦 {assignment.project?.panelQuantity || 0} panels
                                                                                    </Typography>
                                                                                </Grid>
                                                                                <Grid item xs={6}>
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        🔋 {assignment.project?.panelWatt || 0} W/panel
                                                                                    </Typography>
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    <Typography variant="caption" sx={{ fontWeight: 500, color: 'primary.main' }}>
                                                                                        ⚡ Total: {assignment.project?.totalWatt?.toLocaleString() || 0} W
                                                                                    </Typography>
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                                                        💰 Staff Pay: ${parseFloat(assignment.calculated_pay || 0).toFixed(2)}
                                                                                    </Typography>
                                                                                </Grid>
                                                                            </Grid>
                                                                        </Box>
                                                                    ))}
                                                                </Box>
                                                            )}

                                                            {/* 总计 */}
                                                            <Box sx={{ pt: 2, borderTop: '2px dashed', borderColor: 'divider' }}>
                                                                {(() => {
                                                                    const totalExpected = parseFloat(timesheetResult.totalPay || 0);
                                                                    const totalPaid = timesheetResult.projects?.reduce((sum, a) =>
                                                                        sum + parseFloat(a.paid_amount || 0), 0) || 0;
                                                                    const totalUnpaid = totalExpected - totalPaid;

                                                                    return (
                                                                        <>
                                                                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1.5 }}>
                                                                                💰 应支付: ${totalExpected.toFixed(2)}
                                                                            </Typography>
                                                                            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                                                                <Box sx={{ flex: 1, minWidth: 150 }}>
                                                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                                                        已支付
                                                                                    </Typography>
                                                                                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                                                        ${totalPaid.toFixed(2)}
                                                                                    </Typography>

                                                                                    {/* 已支付明细 */}
                                                                                    {(() => {
                                                                                        const paidProjects = timesheetResult.projects?.filter(a =>
                                                                                            parseFloat(a.paid_amount || 0) > 0
                                                                                        ) || [];

                                                                                        if (paidProjects.length === 0) return null;

                                                                                        return (
                                                                                            <Box sx={{ mt: 1.5, pl: 1, borderLeft: '3px solid', borderColor: 'success.light' }}>
                                                                                                {paidProjects.map((project, idx) => (
                                                                                                    <Box key={idx} sx={{ mb: 1, pb: 1, borderBottom: idx < paidProjects.length - 1 ? '1px dashed' : 'none', borderColor: 'divider' }}>
                                                                                                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: 'text.primary' }}>
                                                                                                            📍 {project.project?.address || 'N/A'}
                                                                                                        </Typography>
                                                                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                                                                            💵 ${parseFloat(project.paid_amount || 0).toFixed(2)}
                                                                                                        </Typography>
                                                                                                        {project.last_payment_date && (
                                                                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                                                                                🕒 {new Date(project.last_payment_date).toLocaleString('zh-CN')}
                                                                                                            </Typography>
                                                                                                        )}
                                                                                                    </Box>
                                                                                                ))}
                                                                                            </Box>
                                                                                        );
                                                                                    })()}
                                                                                </Box>
                                                                                <Box sx={{ flex: 1, minWidth: 150 }}>
                                                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                                                        待支付
                                                                                    </Typography>
                                                                                    <Typography
                                                                                        variant="h6"
                                                                                        sx={{
                                                                                            fontWeight: 600,
                                                                                            color: totalUnpaid > 0 ? 'error.main' : 'success.main'
                                                                                        }}
                                                                                    >
                                                                                        ${totalUnpaid.toFixed(2)}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </Box>
                                                        </Paper>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            color="primary"
                                                            startIcon={<EmailIcon />}
                                                            onClick={handleSendTimesheet}
                                                            disabled={loading || !staff.email}
                                                            sx={{
                                                                py: 1.5,
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            Send Timesheet via Email
                                                        </Button>
                                                        {!staff.email && (
                                                            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                                                                Employee email not configured
                                                            </Typography>
                                                        )}
                                                    </Grid>
                                                </>
                                            )}
                                        </Grid>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                        onClick={handleDeleteStaff}
                        color="error"
                        variant="outlined"
                        disabled={loading}
                        sx={{ mr: 'auto' }}
                    >
                        删除员工
                    </Button>
                    <Button onClick={onClose} variant="contained">关闭</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <ConfirmDialog
                open={confirmDialog}
                onClose={() => setConfirmDialog(false)}
                onConfirm={confirmDelete}
                title="删除员工"
                message={`确定要删除员工 "${staff?.name}" 吗？此操作将隐藏员工但保留所有工作记录。`}
                confirmText="删除"
                cancelText="取消"
            />
        </>
    );
};

export default StaffDetail;
