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
import { Build, Add } from '@mui/icons-material';
import api from '../../services/api';
import AssetDetail from './AssetDetail';
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

const statusVariants = {
  available: 'success',
  in_use: 'info',
  maintenance: 'warning',
};

const statusNames = {
  available: '可用',
  in_use: '使用中',
  maintenance: '维修中',
};

const AssetList = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={pageContainerStyle}>
      <Box sx={headerBarStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            borderRadius: '14px',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)',
          }}>
            <Build sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography sx={pageTitleStyle} style={{ marginBottom: 0 }}>
            资产设备管理
          </Typography>
        </Box>


        <Box sx={filterContainerStyle}>
          <DataManagementMenu moduleName="assets" onSuccess={fetchAssets} />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/assets/new')}
            sx={modernButtonStyle}
          >
            添加资产
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={modernTableContainerStyle}>
        <Table>
          <TableHead sx={modernTableHeadStyle}>
            <TableRow>
              <TableCell>设备名称</TableCell>
              <TableCell>类型</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>当前持有人</TableCell>
              <TableCell>采购日期</TableCell>
              <TableCell>采购成本</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">加载中...</Typography>
                </TableCell>
              </TableRow>
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">暂无资产数据</Typography>
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow
                  key={asset.id}
                  sx={{
                    ...modernTableRowStyle,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                    }
                  }}
                  onClick={() => {
                    setSelectedAssetId(asset.id);
                    setDetailDialogOpen(true);
                  }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {asset.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{
                      color: '#64748b',
                      fontWeight: 500
                    }}>
                      {asset.asset_type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusNames[asset.status]}
                      size="small"
                      sx={getModernChipStyle(statusVariants[asset.status])}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}>
                      {asset.current_holder?.name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {asset.purchase_date
                        ? new Date(asset.purchase_date).toLocaleDateString()
                        : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      {asset.purchase_cost ? `$${parseFloat(asset.purchase_cost).toFixed(2)}` : '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AssetDetail
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedAssetId(null);
        }}
        assetId={selectedAssetId}
        onDelete={fetchAssets}
      />
    </Box>
  );
};

export default AssetList;
