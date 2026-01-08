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
    Switch,
    FormControlLabel,
} from '@mui/material';
import { ArrowBack, Save, DirectionsCar } from '@mui/icons-material';
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

const VehicleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        plate_number: '',
        model: '',
        current_mileage: '',
        is_active: true,
        notes: '',
    });

    useEffect(() => {
        if (isEdit) {
            fetchVehicle();
        }
    }, [id]);

    const fetchVehicle = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/vehicles/${id}`);
            setFormData(response.data);
        } catch (err) {
            setError('获取车辆信息失败');
            console.error('Fetch vehicle error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            if (isEdit) {
                await api.put(`/vehicles/${id}`, formData);
                setSuccess('车辆信息更新成功！');
            } else {
                await api.post('/vehicles', formData);
                setSuccess('车辆创建成功！');
            }

            setTimeout(() => {
                navigate('/vehicles');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || '保存失败，请重试');
            console.error('Save vehicle error:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={pageContainerStyle}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress size={60} sx={{ color: '#06b6d4' }} />
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
                        onClick={() => navigate('/vehicles')}
                        sx={{
                            ...modernSecondaryButtonStyle,
                            mr: 2,
                        }}
                    >
                        返回
                    </Button>
                    <Box sx={{
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                        borderRadius: '14px',
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)',
                    }}>
                        <DirectionsCar sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Typography sx={pageTitleStyle} style={{ marginBottom: 0 }}>
                        {isEdit ? '编辑车辆' : '添加车辆'}
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
                                    label="车牌号"
                                    name="plate_number"
                                    value={formData.plate_number}
                                    onChange={handleChange}
                                    placeholder="例如: 京A12345"
                                    sx={modernInputStyle}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="车型/型号"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    placeholder="例如: Toyota Camry"
                                    sx={modernInputStyle}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="当前里程 (km)"
                                    name="current_mileage"
                                    type="number"
                                    inputProps={{ step: '1', min: '0' }}
                                    value={formData.current_mileage}
                                    onChange={handleChange}
                                    helperText="当前行驶里程数"
                                    sx={modernInputStyle}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            name="is_active"
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Typography>
                                            {formData.is_active ? '使用中' : '已停用'}
                                        </Typography>
                                    }
                                    sx={{ mt: 1 }}
                                />
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
                                        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                                        border: 'none',
                                        '& .MuiAlert-icon': { color: '#1e40af' }
                                    }}
                                >
                                    <Typography variant="body2" sx={{ color: '#1e40af' }}>
                                        <strong>提示：</strong>
                                        <br />
                                        • 车牌号为必填项
                                        <br />
                                        • 可以在车辆详情页添加维护记录和文档
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
                                        onClick={() => navigate('/vehicles')}
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

export default VehicleForm;
