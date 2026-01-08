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
            setTimesheetResult({
                projectCount: response.data.length,
                totalPay: totalPay.toFixed(2)
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
                                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                                    <TableCell sx={{ fontWeight: 600 }}>Project Address</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Assigned Date</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Pay</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
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
                                                    assignments.map((assignment) => (
                                                        <TableRow
                                                            key={assignment.id}
                                                            sx={{
                                                                '&:hover': {
                                                                    bgcolor: 'action.hover'
                                                                }
                                                            }}
                                                        >
                                                            <TableCell>{assignment.project?.address || 'N/A'}</TableCell>
                                                            <TableCell>{assignment.project?.client?.company_name || 'N/A'}</TableCell>
                                                            <TableCell>
                                                                <Chip label={assignment.role_in_project} size="small" color={getRoleBadgeColor(assignment.role_in_project)} />
                                                            </TableCell>
                                                            <TableCell>{new Date(assignment.assigned_at).toLocaleDateString()}</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 500 }}>${parseFloat(assignment.calculated_pay || 0).toFixed(2)}</TableCell>
                                                            <TableCell>
                                                                <Chip label={assignment.project?.status || 'N/A'} size="small" color={getStatusColor(assignment.project?.status)} />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
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
                                                            <Typography variant="body1" sx={{ mb: 1 }}>
                                                                <strong>Projects:</strong> {timesheetResult.projectCount}
                                                            </Typography>
                                                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                                Total Pay: ${timesheetResult.totalPay}
                                                            </Typography>
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
