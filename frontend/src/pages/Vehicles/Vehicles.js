import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  TextField, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import vehicleService from '../../services/vehicles';
import moment from 'moment';

const Vehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vehiclesResponse, modelsResponse] = await Promise.all([
          vehicleService.getAllVehicles(),
          vehicleService.getAllVehicleModels()
        ]);
        setVehicles(vehiclesResponse.vehicles);
        setVehicleModels(modelsResponse.models);
      } catch (err) {
        setError('Failed to fetch vehicles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    // Client-side filtering is implemented here
    // In a real application, this would typically be a server-side search
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openDeleteDialog = (vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    try {
      await vehicleService.deleteVehicle(vehicleToDelete.id);
      setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));
      closeDeleteDialog();
    } catch (err) {
      setError('Failed to delete vehicle. It may have existing bookings.');
      console.error(err);
    }
  };

  // Get model name by ID
  const getModelName = (modelId) => {
    const model = vehicleModels.find(m => m.id === modelId);
    return model ? model.name : 'Unknown Model';
  };

  // Filter vehicles based on search query and filters
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getModelName(vehicle.model_id).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModel = modelFilter ? vehicle.model_id === parseInt(modelFilter) : true;
    const matchesStatus = statusFilter ? vehicle.status === statusFilter : true;
    
    return matchesSearch && matchesModel && matchesStatus;
  });

  // Paginate vehicles
  const paginatedVehicles = filteredVehicles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Status chip color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'booked':
        return 'primary';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h4">Vehicles</Typography>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/vehicles/new')}
            sx={{ mr: 2 }}
          >
            Add Vehicle
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/vehicle-models')}
          >
            Manage Models
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search vehicles..."
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filter by Model</InputLabel>
              <Select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                label="Filter by Model"
              >
                <MenuItem value="">All Models</MenuItem>
                {vehicleModels.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="booked">Booked</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleSearch}>
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>License Plate</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Insurance Expiry</TableCell>
              <TableCell>License Expiry</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography>Loading vehicles...</Typography>
                </TableCell>
              </TableRow>
            ) : paginatedVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography>No vehicles found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.license_plate}</TableCell>
                  <TableCell>{getModelName(vehicle.model_id)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)} 
                      color={getStatusColor(vehicle.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {moment(vehicle.insurance_expiry).format('MMM D, YYYY')}
                    {moment(vehicle.insurance_expiry).isBefore(moment()) && (
                      <Chip 
                        label="Expired" 
                        color="error" 
                        size="small" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {moment(vehicle.license_expiry).format('MMM D, YYYY')}
                    {moment(vehicle.license_expiry).isBefore(moment()) && (
                      <Chip 
                        label="Expired" 
                        color="error" 
                        size="small" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="info" 
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      color="primary" 
                      onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => openDeleteDialog(vehicle)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredVehicles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete vehicle "{vehicleToDelete?.license_plate}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteVehicle} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Vehicles;
