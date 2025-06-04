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
  Visibility as ViewIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookings';
import customerService from '../../services/customers';
import vehicleService from '../../services/vehicles';
import moment from 'moment';

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsResponse, customersResponse, vehiclesResponse] = await Promise.all([
          bookingService.getAllBookings(),
          customerService.getAllCustomers(),
          vehicleService.getAllVehicles()
        ]);
        setBookings(bookingsResponse.bookings);
        setCustomers(customersResponse.customers);
        setVehicles(vehiclesResponse.vehicles);
      } catch (err) {
        setError('Failed to fetch bookings');
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

  const openDeleteDialog = (booking) => {
    setBookingToDelete(booking);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setBookingToDelete(null);
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    try {
      await bookingService.deleteBooking(bookingToDelete.id);
      setBookings(bookings.filter(b => b.id !== bookingToDelete.id));
      closeDeleteDialog();
    } catch (err) {
      setError('Failed to delete booking');
      console.error(err);
    }
  };

  // Get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.full_name : 'Unknown Customer';
  };

  // Get vehicle info by ID
  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.license_plate}` : 'Unknown Vehicle';
  };

  // Filter bookings based on search query and filters
  const filteredBookings = bookings.filter(booking => {
    const bookingId = booking.booking_id || '';
    const customerName = booking.customer ? booking.customer.full_name : '';
    const vehiclePlate = booking.vehicle ? booking.vehicle.license_plate : '';
    
    const matchesSearch = 
      bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCustomer = customerFilter ? booking.customer_id === parseInt(customerFilter) : true;
    const matchesVehicle = vehicleFilter ? booking.vehicle_id === parseInt(vehicleFilter) : true;
    const matchesStatus = statusFilter ? booking.payment_status === statusFilter : true;
    
    return matchesSearch && matchesCustomer && matchesVehicle && matchesStatus;
  });

  // Paginate bookings
  const paginatedBookings = filteredBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Status chip color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'hold':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h4">Bookings</Typography>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CalendarIcon />}
            onClick={() => navigate('/calendar')}
            sx={{ mr: 2 }}
          >
            Calendar View
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/bookings/new')}
          >
            New Booking
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              placeholder="Search bookings..."
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
              <InputLabel>Filter by Customer</InputLabel>
              <Select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                label="Filter by Customer"
              >
                <MenuItem value="">All Customers</MenuItem>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.full_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filter by Vehicle</InputLabel>
              <Select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                label="Filter by Vehicle"
              >
                <MenuItem value="">All Vehicles</MenuItem>
                {vehicles.map((vehicle) => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.license_plate}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Payment Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="hold">Hold</MenuItem>
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
              <TableCell>Booking ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Pickup</TableCell>
              <TableCell>Return</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>Loading bookings...</Typography>
                </TableCell>
              </TableRow>
            ) : paginatedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>No bookings found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.booking_id}</TableCell>
                  <TableCell>
                    {booking.customer ? booking.customer.full_name : 'Unknown Customer'}
                  </TableCell>
                  <TableCell>
                    {booking.vehicle ? booking.vehicle.license_plate : 'Unknown Vehicle'}
                  </TableCell>
                  <TableCell>
                    {moment(`${booking.pickup_date} ${booking.pickup_time}`).format('MMM D, YYYY h:mm A')}
                  </TableCell>
                  <TableCell>
                    {moment(`${booking.return_date} ${booking.return_time}`).format('MMM D, YYYY h:mm A')}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={booking.payment_status.toUpperCase()} 
                      color={getStatusColor(booking.payment_status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="info" 
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      color="primary" 
                      onClick={() => navigate(`/bookings/${booking.id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => openDeleteDialog(booking)}
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
          count={filteredBookings.length}
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
            Are you sure you want to delete booking "{bookingToDelete?.booking_id}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteBooking} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bookings;
