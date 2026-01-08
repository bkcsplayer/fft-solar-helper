import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Typography,
    Box,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
    Paper
} from '@mui/material';
import {
    Edit as EditIcon,
    Build as BuildIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';

const AssetDetail = ({ open, onClose, assetId, onDelete }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [asset, setAsset] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState(false);

    useEffect(() => {
        if (open && assetId) {
            loadAssetDetail();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, assetId]);

    const loadAssetDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/assets/${assetId}`);
            setAsset(response.data);
        } catch (error) {
            console.error('Failed to load asset detail:', error);
            showSnackbar('加载资产详情失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAsset = async () => {
        setConfirmDialog(true);
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/assets/${assetId}`);
            showSnackbar('资产已删除', 'success');
            setTimeout(() => {
                onClose();
                if (onDelete) onDelete();
            }, 1000);
        } catch (error) {
            console.error('Failed to delete asset:', error);
            showSnackbar(error.response?.data?.error || '删除资产失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditAsset = () => {
        navigate(`/assets/edit/${assetId}`);
        onClose();
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'success';
            case 'in_use': return 'info';
            case 'maintenance': return 'warning';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'available': return '可用';
            case 'in_use': return '使用中';
            case 'maintenance': return '维修中';
            default: return status;
        }
    };

    if (!asset) {
        return null;
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
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
                        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                        color: 'white',
                        pb: 2.5,
                        pt: 2.5
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {asset.name}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                资产详情
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={handleEditAsset}
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
                            编辑
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
                            {/* Asset Info */}
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
                                            <BuildIcon fontSize="small" />
                                        </Box>
                                        资产信息
                                    </Typography>
                                    <Grid container spacing={2.5}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>资产名称</Typography>
                                            <Typography variant="body1" fontWeight={600}>{asset.name}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>资产类型</Typography>
                                            <Typography variant="body1" fontWeight={500}>{asset.asset_type || '-'}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>状态</Typography>
                                            <Chip
                                                label={getStatusLabel(asset.status)}
                                                color={getStatusColor(asset.status)}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>当前持有人</Typography>
                                            <Typography variant="body1" fontWeight={500}>{asset.current_holder?.name || '-'}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>采购日期</Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '-'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>采购成本</Typography>
                                            <Typography variant="body1" fontWeight={600} color="primary.main">
                                                {asset.purchase_cost ? `$${parseFloat(asset.purchase_cost).toFixed(2)}` : '-'}
                                            </Typography>
                                        </Grid>
                                        {asset.serial_number && (
                                            <Grid item xs={12} sm={6}>
                                                <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>序列号</Typography>
                                                <Typography variant="body1" fontWeight={500}>{asset.serial_number}</Typography>
                                            </Grid>
                                        )}
                                        {asset.location && (
                                            <Grid item xs={12} sm={6}>
                                                <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>位置</Typography>
                                                <Typography variant="body1" fontWeight={500}>{asset.location}</Typography>
                                            </Grid>
                                        )}
                                        {asset.warranty_expiry && (
                                            <Grid item xs={12} sm={6}>
                                                <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>保修到期日</Typography>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {new Date(asset.warranty_expiry).toLocaleDateString()}
                                                </Typography>
                                            </Grid>
                                        )}
                                        {asset.notes && (
                                            <Grid item xs={12}>
                                                <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>备注</Typography>
                                                <Typography variant="body1">{asset.notes}</Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                        onClick={handleDeleteAsset}
                        color="error"
                        variant="outlined"
                        disabled={loading}
                        sx={{ mr: 'auto' }}
                    >
                        删除资产
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
                title="删除资产"
                message={`确定要删除资产 "${asset?.name}" 吗？此操作将永久删除资产记录。`}
                confirmText="删除"
                cancelText="取消"
            />
        </>
    );
};

export default AssetDetail;
