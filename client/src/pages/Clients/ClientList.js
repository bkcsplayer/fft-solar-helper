import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Paper,
} from '@mui/material';
import { Edit, Add, Business, Delete } from '@mui/icons-material';
import api from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  pageContainerStyle,
  pageTitleStyle,
  modernTableContainerStyle,
  modernTableHeadStyle,
  modernTableRowStyle,
  modernButtonStyle,
  modernIconButtonStyle,
  headerBarStyle,
  getModernChipStyle,
} from '../../styles/modernStyles';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, clientId: null, clientName: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients');
      // Filter out inactive clients (soft deleted)
      setClients(response.data.filter(c => c.is_active !== false));
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId, clientName) => {
    setConfirmDialog({ open: true, clientId, clientName });
  };

  const confirmDelete = async () => {
    const { clientId } = confirmDialog;
    try {
      await api.delete(`/clients/${clientId}`);
      // Refresh the list
      fetchClients();
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert('删除客户失败');
    }
  };

  return (
    <Box sx={pageContainerStyle}>
      <Box sx={headerBarStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '14px',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
          }}>
            <Business sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography sx={pageTitleStyle} style={{ marginBottom: 0 }}>
            Client Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/clients/new')}
          sx={modernButtonStyle}
        >
          Add Client
        </Button>
      </Box>

      <TableContainer component={Paper} sx={modernTableContainerStyle}>
        <Table>
          <TableHead sx={modernTableHeadStyle}>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rate ($/W)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No clients found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} sx={modernTableRowStyle}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {client.company_name}
                    </Typography>
                  </TableCell>
                  <TableCell>{client.contact_person}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>
                    <Typography sx={{ color: '#3b82f6' }}>
                      {client.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      ${client.rate_per_watt}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={client.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={getModernChipStyle(client.is_active ? 'success' : 'default')}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/clients/${client.id}/edit`);
                      }}
                      sx={modernIconButtonStyle}
                    >
                      <Edit fontSize="small" sx={{ color: '#3b82f6' }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client.id, client.company_name);
                      }}
                      sx={{ ...modernIconButtonStyle, ml: 1 }}
                    >
                      <Delete fontSize="small" sx={{ color: '#ef4444' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, clientId: null, clientName: '' })}
        onConfirm={confirmDelete}
        title="删除客户"
        message={`确定要删除客户 "${confirmDialog.clientName}" 吗？此操作将隐藏客户但保留项目历史。`}
        confirmText="删除"
        cancelText="取消"
      />
    </Box>
  );
};

export default ClientList;
