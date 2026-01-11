import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Paper,
  Button,
} from '@mui/material';
import DataManagementMenu from '../../components/common/DataManagementMenu';
import { DirectionsCar, Add } from '@mui/icons-material';
import api from '../../services/api';
import VehicleDetail from './VehicleDetail';
import {
  pageContainerStyle,
  pageTitleStyle,
  modernTableContainerStyle,
  modernTableHeadStyle,
  modernTableRowStyle,
  headerBarStyle,
  getModernChipStyle,
  filterContainerStyle,
  modernButtonStyle,
} from '../../styles/modernStyles';

const VehicleList = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={pageContainerStyle}>
      <Box sx={headerBarStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            车辆管理
          </Typography>
        </Box>


        <Box sx={filterContainerStyle}>
          <DataManagementMenu moduleName="vehicles" onSuccess={fetchVehicles} />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/vehicles/new')}
            sx={modernButtonStyle}
          >
            添加车辆
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={modernTableContainerStyle}>
        <Table>
          <TableHead sx={modernTableHeadStyle}>
            <TableRow>
              <TableCell>车牌号</TableCell>
              <TableCell>车型</TableCell>
              <TableCell>当前里程 (km)</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>备注</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">加载中...</Typography>
                </TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">暂无车辆数据</Typography>
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  sx={{
                    ...modernTableRowStyle,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                    }
                  }}
                  onClick={() => {
                    setSelectedVehicleId(vehicle.id);
                    setDetailDialogOpen(true);
                  }}
                >
                  <TableCell>
                    <Typography sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      {vehicle.plate_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>
                      {vehicle.model || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {vehicle.current_mileage?.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={vehicle.is_active ? '使用中' : '停用'}
                      size="small"
                      sx={getModernChipStyle(vehicle.is_active ? 'success' : 'default')}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {vehicle.notes || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <VehicleDetail
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedVehicleId(null);
        }}
        vehicleId={selectedVehicleId}
        onDelete={fetchVehicles}
      />
    </Box>
  );
};

export default VehicleList;
