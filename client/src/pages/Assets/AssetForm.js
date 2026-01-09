import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
} from '@mui/material';
import { ArrowBack, Save, Category } from '@mui/icons-material';
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

const AssetForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        asset_type: 'Equipment',
        purchase_date: '',
        purchase_cost: '',
        status: 'available',
        current_holder_id: null,
        notes: '',
    });

    useEffect(() => {
        if (isEdit) {
            fetchAsset();
        }
    }, [id]);

    const fetchAsset = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/assets/${id}`);
            setFormData(response.data);
        } catch (err) {
            setError('获取资产信息失败');
            console.error('Fetch asset error:', err);
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
                await api.put(`/assets/${id}`, formData);
                setSuccess('资产信息更新成功！');
            } else {
                await api.post('/assets', formData);
                setSuccess('资产创建成功！');
            }

            setTimeout(() => {
                navigate('/assets');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || '保存失败，请重试');
            console.error('Save asset error:', err);
        } finally {
            setSaving(false);
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

    return (
        <Box sx={pageContainerStyle}>
            <Box sx={headerBarStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/assets')}
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
                        <Category sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Typography sx={pageTitleStyle} style={{ marginBottom: 0 }}>
                        {isEdit ? '编辑资产' : '添加资产'}
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
                                    label="资产名称"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="例如: 太阳能板安装工具"
                                    sx={modernInputStyle}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl required fullWidth sx={modernInputStyle}>
                                    <InputLabel>资产类型</InputLabel>
                                    <Select
                                        name="asset_type"
                                        value={formData.asset_type}
                                        label="资产类型"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="Tools">工具</MenuItem>
                                        <MenuItem value="Equipment">设备</MenuItem>
                                        <MenuItem value="Vehicle">车辆</MenuItem>
                                        <MenuItem value="Office">办公设备</MenuItem>
                                        <MenuItem value="Other">其他</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="购买日期"
                                    name="purchase_date"
                                    type="date"
                                    value={formData.purchase_date}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    sx={modernInputStyle}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="购买成本 (¥)"
                                    name="purchase_cost"
                                    type="number"
                                    inputProps={{ step: '0.01', min: '0' }}
                                    value={formData.purchase_cost}
                                    onChange={handleChange}
                                    helperText="购买时的成本"
                                    sx={modernInputStyle}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl required fullWidth sx={modernInputStyle}>
                                    <InputLabel>状态</InputLabel>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        label="状态"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="available">可用</MenuItem>
                                        <MenuItem value="in_use">使用中</MenuItem>
                                        <MenuItem value="maintenance">维护中</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="备注"
                                    name="notes"
                                    multiline
                                    rows={3}
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="其他相关信息..."
                                    sx={modernInputStyle}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Alert
                                    severity="info"
                                    sx={{
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                        border: 'none',
                                        '& .MuiAlert-icon': { color: '#92400e' }
                                    }}
                                >
                                    <Typography variant="body2" sx={{ color: '#92400e' }}>
                                        <strong>提示：</strong>
                                        <br />
                                        • 资产名称和类型为必填项
                                        <br />
                                        • 购买价格和当前价值用于资产价值跟踪
                                    </Typography>
                                </Alert>
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
                                        {saving ? '保存中...' : '保存'}
                                    </Button>
                                    <Button
                                        size="large"
                                        onClick={() => navigate('/assets')}
                                        disabled={saving}
                                        sx={modernSecondaryButtonStyle}
                                    >
                                        取消
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

export default AssetForm;
