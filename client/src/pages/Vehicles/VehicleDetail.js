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
    IconButton,
    CircularProgress,
    Alert,
    Snackbar,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    CloudUpload as UploadIcon,
    Email as EmailIcon,
    Description as DocumentIcon,
    Build as BuildIcon
} from '@mui/icons-material';
import api from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';

const VehicleDetail = ({ open, onClose, vehicleId, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const [vehicle, setVehicle] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [uploadFiles, setUploadFiles] = useState([]);
    const [logFormOpen, setLogFormOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [logForm, setLogForm] = useState({
        maintenance_date: '',
        maintenance_type: '',
        description: '',
        cost: '',
        mileage: '',
        performed_by: '',
        notes: ''
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState(false);

    useEffect(() => {
        if (open && vehicleId) {
            loadVehicleDetail();
        }
    }, [open, vehicleId]);

    const loadVehicleDetail = async () => {
        try {
            setLoading(true);
            const [vehicleRes, logsRes] = await Promise.all([
                api.get(`/vehicles/${vehicleId}`),
                api.get(`/vehicles/${vehicleId}/maintenance-logs`)
            ]);

            setVehicle(vehicleRes.data);
            setDocuments(vehicleRes.data.vehicle_documents || []);
            setMaintenanceLogs(logsRes.data.logs || []);
        } catch (error) {
            console.error('Failed to load vehicle detail:', error);
            showSnackbar('Failed to load vehicle detail', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setUploadFiles(Array.from(e.target.files));
    };

    const handleUploadDocuments = async () => {
        if (uploadFiles.length === 0) {
            showSnackbar('Please select files to upload', 'warning');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            uploadFiles.forEach(file => {
                formData.append('documents', file);
            });

            const response = await api.post(`/vehicles/${vehicleId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showSnackbar(`Uploaded ${response.data.documents.length} document(s)`, 'success');
            setUploadFiles([]);
            loadVehicleDetail();
        } catch (error) {
            console.error('Failed to upload documents:', error);
            showSnackbar('Failed to upload documents', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await api.delete(`/vehicles/${vehicleId}/documents/${docId}`);
            showSnackbar('Document deleted', 'success');
            loadVehicleDetail();
        } catch (error) {
            console.error('Failed to delete document:', error);
            showSnackbar('Failed to delete document', 'error');
        }
    };

    const handleSaveLog = async () => {
        try {
            setLoading(true);
            if (editingLog) {
                await api.put(`/vehicles/${vehicleId}/maintenance-logs/${editingLog.id}`, logForm);
                showSnackbar('Log updated', 'success');
            } else {
                await api.post(`/vehicles/${vehicleId}/maintenance-logs`, logForm);
                showSnackbar('Log created', 'success');
            }

            setLogFormOpen(false);
            setEditingLog(null);
            setLogForm({
                maintenance_date: '',
                maintenance_type: '',
                description: '',
                cost: '',
                mileage: '',
                performed_by: '',
                notes: ''
            });
            loadVehicleDetail();
        } catch (error) {
            console.error('Failed to save log:', error);
            showSnackbar('Failed to save log', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLog = async (logId) => {
        if (!window.confirm('Are you sure you want to delete this log?')) return;

        try {
            await api.delete(`/vehicles/${vehicleId}/maintenance-logs/${logId}`);
            showSnackbar('Log deleted', 'success');
            loadVehicleDetail();
        } catch (error) {
            console.error('Failed to delete log:', error);
            showSnackbar('Failed to delete log', 'error');
        }
    };

    const handleEditLog = (log) => {
        setEditingLog(log);
        setLogForm({
            maintenance_date: log.maintenance_date,
            maintenance_type: log.maintenance_type,
            description: log.description || '',
            cost: log.cost || '',
            mileage: log.mileage || '',
            performed_by: log.performed_by || '',
            notes: log.notes || ''
        });
        setLogFormOpen(true);
    };

    const handleSendEmailReport = async () => {
        try {
            setLoading(true);
            await api.post(`/vehicles/${vehicleId}/email-report`);
            showSnackbar('Vehicle report sent via email', 'success');
        } catch (error) {
            console.error('Failed to send email:', error);
            showSnackbar(error.response?.data?.error || 'Failed to send email', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVehicle = async () => {
        setConfirmDialog(true);
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/vehicles/${vehicleId}`);
            showSnackbar('车辆已删除', 'success');
            setTimeout(() => {
                onClose();
                if (onDelete) onDelete();
            }, 1000);
        } catch (error) {
            console.error('Failed to delete vehicle:', error);
            showSnackbar(error.response?.data?.error || '删除车辆失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    if (!vehicle) {
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
                                {vehicle.plate_number}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Vehicle Detail
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<EmailIcon />}
                            onClick={handleSendEmailReport}
                            disabled={loading}
                            sx={{
                                color: 'white',
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                '&:hover': {
                                    borderColor: 'white',
                                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            Email Report
                        </Button>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ bgcolor: '#f8f9fa', pt: 3 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {/* Vehicle Info */}
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
                                            🚗
                                        </Box>
                                        Vehicle Information
                                    </Typography>
                                    <Grid container spacing={2.5}>
                                        <Grid item xs={6} sm={3}>
                                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>Plate Number</Typography>
                                            <Typography variant="body1" fontWeight={500}>{vehicle.plate_number}</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>Model</Typography>
                                            <Typography variant="body1" fontWeight={500}>{vehicle.model || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>Mileage</Typography>
                                            <Typography variant="body1" fontWeight={500} color="primary.main">{vehicle.current_mileage || 0} km</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>Status</Typography>
                                            <Chip
                                                label={vehicle.is_active ? 'Active' : 'Inactive'}
                                                color={vehicle.is_active ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            {/* Documents Section */}
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
                                            <DocumentIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                                            Documents
                                        </Typography>
                                    </Box>
                                    <Box sx={{ p: 2.5 }}>
                                        <Box sx={{ mb: 2 }}>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                                id="document-upload"
                                            />
                                            <label htmlFor="document-upload">
                                                <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
                                                    Select Files
                                                </Button>
                                            </label>
                                            {uploadFiles.length > 0 && (
                                                <Box sx={{ mt: 1.5 }}>
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        {uploadFiles.length} file(s) selected
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={handleUploadDocuments}
                                                        disabled={loading}
                                                        sx={{ mt: 0.5 }}
                                                    >
                                                        Upload
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>

                                        <List dense>
                                            {documents.length === 0 ? (
                                                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                                    No documents uploaded
                                                </Typography>
                                            ) : (
                                                documents.map((doc) => (
                                                    <ListItem
                                                        key={doc.id}
                                                        sx={{
                                                            borderRadius: 1,
                                                            mb: 0.5,
                                                            '&:hover': {
                                                                bgcolor: 'action.hover'
                                                            }
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={doc.originalname}
                                                            secondary={`${(doc.size / 1024).toFixed(2)} KB`}
                                                        />
                                                        <ListItemSecondaryAction>
                                                            <IconButton edge="end" onClick={() => handleDeleteDocument(doc.id)} color="error">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </ListItemSecondaryAction>
                                                    </ListItem>
                                                ))
                                            )}
                                        </List>
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Maintenance Logs Section */}
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
                                    <Box sx={{ p: 2.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                            <BuildIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                                            Maintenance Logs
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<AddIcon />}
                                            onClick={() => {
                                                setEditingLog(null);
                                                setLogForm({
                                                    maintenance_date: '',
                                                    maintenance_type: '',
                                                    description: '',
                                                    cost: '',
                                                    mileage: '',
                                                    performed_by: '',
                                                    notes: ''
                                                });
                                                setLogFormOpen(true);
                                            }}
                                        >
                                            Add Log
                                        </Button>
                                    </Box>

                                    {logFormOpen && (
                                        <Box sx={{ p: 2.5, borderBottom: '2px solid', borderColor: 'primary.light', bgcolor: 'primary.50' }}>
                                            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                                                {editingLog ? 'Edit' : 'New'} Maintenance Log
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Date"
                                                        type="date"
                                                        value={logForm.maintenance_date}
                                                        onChange={(e) => setLogForm({ ...logForm, maintenance_date: e.target.value })}
                                                        InputLabelProps={{ shrink: true }}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Type"
                                                        value={logForm.maintenance_type}
                                                        onChange={(e) => setLogForm({ ...logForm, maintenance_type: e.target.value })}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Description"
                                                        multiline
                                                        rows={2}
                                                        value={logForm.description}
                                                        onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <TextField
                                                        fullWidth
                                                        label="Cost ($)"
                                                        type="number"
                                                        value={logForm.cost}
                                                        onChange={(e) => setLogForm({ ...logForm, cost: e.target.value })}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <TextField
                                                        fullWidth
                                                        label="Mileage (km)"
                                                        type="number"
                                                        value={logForm.mileage}
                                                        onChange={(e) => setLogForm({ ...logForm, mileage: e.target.value })}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <TextField
                                                        fullWidth
                                                        label="Performed By"
                                                        value={logForm.performed_by}
                                                        onChange={(e) => setLogForm({ ...logForm, performed_by: e.target.value })}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Notes"
                                                        multiline
                                                        rows={2}
                                                        value={logForm.notes}
                                                        onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Button variant="contained" onClick={handleSaveLog} disabled={loading}>
                                                            Save
                                                        </Button>
                                                        <Button variant="outlined" onClick={() => setLogFormOpen(false)}>
                                                            Cancel
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}

                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Cost</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Performed By</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {maintenanceLogs.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                            <Typography color="text.secondary">No maintenance logs yet</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    maintenanceLogs.map((log) => (
                                                        <TableRow
                                                            key={log.id}
                                                            sx={{
                                                                '&:hover': {
                                                                    bgcolor: 'action.hover'
                                                                }
                                                            }}
                                                        >
                                                            <TableCell>{log.maintenance_date}</TableCell>
                                                            <TableCell>{log.maintenance_type}</TableCell>
                                                            <TableCell>{log.description || '-'}</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 500 }}>${parseFloat(log.cost || 0).toFixed(2)}</TableCell>
                                                            <TableCell>{log.performed_by || '-'}</TableCell>
                                                            <TableCell align="center">
                                                                <IconButton size="small" onClick={() => handleEditLog(log)} color="primary">
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton size="small" onClick={() => handleDeleteLog(log.id)} color="error">
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                        onClick={handleDeleteVehicle}
                        color="error"
                        variant="outlined"
                        disabled={loading}
                        sx={{ mr: 'auto' }}
                    >
                        删除车辆
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
                title="删除车辆"
                message={`确定要删除车辆 "${vehicle?.plate_number}" 吗？此操作将永久删除车辆及其所有相关记录。`}
                confirmText="删除"
                cancelText="取消"
            />
        </>
    );
};

export default VehicleDetail;
