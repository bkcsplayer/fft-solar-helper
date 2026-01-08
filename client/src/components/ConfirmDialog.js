import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
} from '@mui/material';
import { Warning } from '@mui/icons-material';

const ConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    title = '确认操作',
    message,
    confirmText = '确定',
    cancelText = '取消',
    confirmColor = 'error',
}) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                }
            }}
        >
            <DialogTitle sx={{
                pb: 1,
                pt: 3,
                px: 3,
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}>
                    <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: confirmColor === 'error'
                            ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
                            : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Warning sx={{
                            fontSize: 28,
                            color: confirmColor === 'error' ? '#ef4444' : '#3b82f6'
                        }} />
                    </Box>
                    <Typography variant="h6" sx={{
                        fontWeight: 600,
                        color: '#1e293b',
                    }}>
                        {title}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 2 }}>
                <Typography sx={{
                    color: '#64748b',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                }}>
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions sx={{
                px: 3,
                pb: 3,
                pt: 2,
                gap: 1.5,
            }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 3,
                        py: 1,
                        borderColor: '#e2e8f0',
                        color: '#64748b',
                        '&:hover': {
                            borderColor: '#cbd5e1',
                            backgroundColor: '#f8fafc',
                        }
                    }}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color={confirmColor}
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        boxShadow: confirmColor === 'error'
                            ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                            : '0 4px 12px rgba(59, 130, 246, 0.3)',
                        '&:hover': {
                            boxShadow: confirmColor === 'error'
                                ? '0 6px 16px rgba(239, 68, 68, 0.4)'
                                : '0 6px 16px rgba(59, 130, 246, 0.4)',
                        }
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
