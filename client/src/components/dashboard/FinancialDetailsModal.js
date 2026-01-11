import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Chip,
    IconButton,
    Divider,
    useTheme
} from '@mui/material';
import {
    Close,
    TrendingUp,
    TrendingDown,
    AttachMoney,
    DateRange,
    Receipt
} from '@mui/icons-material';
import api from '../../services/api';

const FinancialDetailsModal = ({ open, onClose, month, year, initialTab = 0 }) => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Reset tab when modal opens or initialTab changes
    useEffect(() => {
        if (open) {
            setActiveTab(initialTab);
        }
    }, [open, initialTab]);

    useEffect(() => {
        if (open) {
            fetchDetails();
        }
    }, [open, month, year]);

    const fetchDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (month) params.month = month;
            if (year) params.year = year;

            const response = await api.get('/dashboard/details', { params });
            setData(response.data);
        } catch (err) {
            console.error('Failed to fetch financial details:', err);
            setError('无法加载财务明细详情');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return `$${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'project': return 'success';
            case 'labor': return 'warning';
            case 'vehicle': return 'info';
            default: return 'default';
        }
    };

    const renderTable = (items, type) => {
        if (!items || items.length === 0) {
            return (
                <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography>本月无记录</Typography>
                </Box>
            );
        }

        return (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}>日期</TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}>类别</TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}>描述</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}>金额</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell>{formatDate(row.date)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.type}
                                        size="small"
                                        color={getCategoryColor(row.category)}
                                        variant="outlined"
                                        sx={{ borderRadius: '6px', fontSize: '0.75rem', height: '24px' }}
                                    />
                                </TableCell>
                                <TableCell>{row.description}</TableCell>
                                <TableCell align="right" sx={{
                                    fontWeight: 600,
                                    color: type === 'income' ? '#10b981' : '#f43f5e'
                                }}>
                                    {type === 'income' ? '+' : '-'}{formatCurrency(row.amount)}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                            <TableCell colSpan={3} sx={{ fontWeight: 700, textAlign: 'right' }}>总计:</TableCell>
                            <TableCell align="right" sx={{
                                fontWeight: 700,
                                color: type === 'income' ? '#10b981' : '#f43f5e',
                                fontSize: '1rem'
                            }}>
                                {formatCurrency(items.reduce((sum, item) => sum + item.amount, 0))}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    backgroundImage: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        display: 'flex'
                    }}>
                        <Receipt />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            月度财务明细
                        </Typography>
                        {data?.period && (
                            <Typography variant="caption" color="text.secondary">
                                {data.period.year}年{data.period.month}月
                            </Typography>
                        )}
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
                        <Typography>{error}</Typography>
                        <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={fetchDetails}>
                            重试
                        </Button>
                    </Box>
                ) : data ? (
                    <>
                        {/* Summary Cards */}
                        <Box sx={{ p: 3, bgcolor: '#f8fafc', display: 'flex', gap: 2 }}>
                            <Paper elevation={0} sx={{
                                flex: 1, p: 2, borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                            }}>
                                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TrendingUp fontSize="small" /> 总收入
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#15803d', mt: 0.5 }}>
                                    {formatCurrency(data.summary.totalIncome)}
                                </Typography>
                            </Paper>

                            <Paper elevation={0} sx={{
                                flex: 1, p: 2, borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                            }}>
                                <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TrendingDown fontSize="small" /> 总支出
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#b91c1c', mt: 0.5 }}>
                                    {formatCurrency(data.summary.totalExpense)}
                                </Typography>
                            </Paper>

                            <Paper elevation={0} sx={{
                                flex: 1, p: 2, borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
                            }}>
                                <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AttachMoney fontSize="small" /> 净利润
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1d4ed8', mt: 0.5 }}>
                                    {formatCurrency(data.summary.netProfit)}
                                </Typography>
                            </Paper>
                        </Box>

                        <Box sx={{ px: 3 }}>
                            <Tabs
                                value={activeTab}
                                onChange={(e, v) => setActiveTab(v)}
                                sx={{
                                    mb: 3,
                                    borderBottom: '1px solid #e2e8f0',
                                    '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                                }}
                            >
                                <Tab label={`收入明细 (${data.details.income.length})`} />
                                <Tab label={`支出明细 (${data.details.expense.length})`} />
                            </Tabs>

                            <Box sx={{ pb: 3, minHeight: '300px' }}>
                                {activeTab === 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                                            包含所有已完成项目的工程款和其他收入
                                        </Typography>
                                        {renderTable(data.details.income, 'income')}
                                    </Box>
                                )}

                                {activeTab === 1 && (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f43f5e' }} />
                                            包含人工成本、车辆维护和其他运营支出
                                        </Typography>
                                        {renderTable(data.details.expense, 'expense')}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </>
                ) : null}
            </DialogContent>
            <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '10px' }}>
                    关闭
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FinancialDetailsModal;
