import React, { useRef, useState } from 'react';
import {
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Alert,
    Snackbar
} from '@mui/material';
import {
    MoreVert,
    Download,
    Upload,
    CloudUpload
} from '@mui/icons-material';
import api from '../../services/api';

const DataManagementMenu = ({ moduleName, onSuccess }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success');
    const fileInputRef = useRef(null);

    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleExport = async () => {
        handleClose();
        try {
            setLoading(true);
            const response = await api.get(`/data/export/${moduleName}`);

            const dataStr = JSON.stringify(response.data.data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${moduleName}_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSeverity('success');
            setMessage('Export successful!');
        } catch (error) {
            console.error('Export failed:', error);
            setSeverity('error');
            setMessage('Export failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleImportClick = () => {
        handleClose();
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                setLoading(true);
                const jsonData = JSON.parse(e.target.result);

                // Validation: should be array
                if (!Array.isArray(jsonData)) {
                    throw new Error('Invalid format: Root must be an array');
                }

                const response = await api.post(`/data/import/${moduleName}`, { data: jsonData });

                setSeverity('success');
                setMessage(`Import successful! Created: ${response.data.stats.created}, Updated: ${response.data.stats.updated}`);
                if (onSuccess) onSuccess();
            } catch (error) {
                console.error('Import failed:', error);
                setSeverity('error');
                setMessage('Import failed: ' + (error.response?.data?.error || error.message));
            } finally {
                setLoading(false);
                // Reset file input
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <>
            <Button
                variant="outlined"
                color="secondary"
                onClick={handleClick}
                startIcon={<CloudUpload />}
                sx={{ ml: 1 }}
            >
                Actions
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={handleExport}>
                    <ListItemIcon>
                        <Download fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export Data (JSON)</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleImportClick}>
                    <ListItemIcon>
                        <Upload fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Import Data (JSON)</ListItemText>
                </MenuItem>
            </Menu>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleFileChange}
            />

            <Snackbar
                open={Boolean(message)}
                autoHideDuration={6000}
                onClose={() => setMessage('')}
            >
                <Alert onClose={() => setMessage('')} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default DataManagementMenu;
