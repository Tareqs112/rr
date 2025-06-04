import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookings';
import vehicleService from '../../services/vehicles';
import driverService from '../../services/drivers';
import moment from 'moment';

const BookingCalendar = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsResponse, vehiclesResponse, driversResponse] = await Promise.all([
          bookingService.getBookingsForCalendar(),
          vehicleService.getAllVehicles(),
          driverService.getAllDrivers()
        ]);
        
        setBookings(bookingsResponse.bookings);
        setVehicles(vehiclesResponse.vehicles);
        setDrivers(driversResponse.drivers);
        
        // Format bookings for calendar
        const events = bookingsResponse.bookings.map(booking => ({
          id: booking.id,
          title: `${booking.customer?.full_name || 'Unknown'} - ${booking.vehicle?.license_plate || 'No Vehicle'}`,
          start: `${booking.pickup_date}T${booking.pickup_time}`,
          end: `${booking.return_date}T${booking.return_time}`,
          backgroundColor: getStatusColor(booking.payment_status),
          borderColor: getStatusColor(booking.payment_status),
          extendedProps: {
            booking_id: booking.booking_id,
            customer: booking.customer?.full_name,
            vehicle: booking.vehicle?.license_plate,
            driver: booking.driver?.name,
            payment_status: booking.payment_status
          }
        }));
        
        setCalendarEvents(events);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#4caf50'; // green
      case 'pending':
        return '#ff9800'; // orange
      case 'hold':
        return '#f44336'; // red
      default:
        return '#2196f3'; // blue
    }
  };

  const handleVehicleChange = async (event) => {
    const vehicleId = event.target.value;
    setSelectedVehicle(vehicleId);
    
    try {
      setLoading(true);
      
      let filteredEvents;
      if (vehicleId) {
        // Filter bookings by vehicle
        filteredEvents = bookings
          .filter(booking => booking.vehicle_id === parseInt(vehicleId))
          .map(booking => ({
            id: booking.id,
            title: `${booking.customer?.full_name || 'Unknown'} - ${booking.vehicle?.license_plate || 'No Vehicle'}`,
            start: `${booking.pickup_date}T${booking.pickup_time}`,
            end: `${booking.return_date}T${booking.return_time}`,
            backgroundColor: getStatusColor(booking.payment_status),
            borderColor: getStatusColor(booking.payment_status),
            extendedProps: {
              booking_id: booking.booking_id,
              customer: booking.customer?.full_name,
              vehicle: booking.vehicle?.license_plate,
              driver: booking.driver?.name,
              payment_status: booking.payment_status
            }
          }));
      } else {
        // Show all bookings
        filteredEvents = bookings.map(booking => ({
          id: booking.id,
          title: `${booking.customer?.full_name || 'Unknown'} - ${booking.vehicle?.license_plate || 'No Vehicle'}`,
          start: `${booking.pickup_date}T${booking.pickup_time}`,
          end: `${booking.return_date}T${booking.return_time}`,
          backgroundColor: getStatusColor(booking.payment_status),
          borderColor: getStatusColor(booking.payment_status),
          extendedProps: {
            booking_id: booking.booking_id,
            customer: booking.customer?.full_name,
            vehicle: booking.vehicle?.license_plate,
            driver: booking.driver?.name,
            payment_status: booking.payment_status
          }
        }));
      }
      
      setCalendarEvents(filteredEvents);
      setLoading(false);
    } catch (err) {
      setError('Failed to filter bookings');
      console.error(err);
      setLoading(false);
    }
  };

  const handleDriverChange = async (event) => {
    const driverId = event.target.value;
    setSelectedDriver(driverId);
    
    try {
      setLoading(true);
      
      let filteredEvents;
      if (driverId) {
        // Filter bookings by driver
        filteredEvents = bookings
          .filter(booking => booking.driver_id === parseInt(driverId))
          .map(booking => ({
            id: booking.id,
            title: `${booking.customer?.full_name || 'Unknown'} - ${booking.vehicle?.license_plate || 'No Vehicle'}`,
            start: `${booking.pickup_date}T${booking.pickup_time}`,
            end: `${booking.return_date}T${booking.return_time}`,
            backgroundColor: getStatusColor(booking.payment_status),
            borderColor: getStatusColor(booking.payment_status),
            extendedProps: {
              booking_id: booking.booking_id,
              customer: booking.customer?.full_name,
              vehicle: booking.vehicle?.license_plate,
              driver: booking.driver?.name,
              payment_status: booking.payment_status
            }
          }));
      } else {
        // Show all bookings
        filteredEvents = bookings.map(booking => ({
          id: booking.id,
          title: `${booking.customer?.full_name || 'Unknown'} - ${booking.vehicle?.license_plate || 'No Vehicle'}`,
          start: `${booking.pickup_date}T${booking.pickup_time}`,
          end: `${booking.return_date}T${booking.return_time}`,
          backgroundColor: getStatusColor(booking.payment_status),
          borderColor: getStatusColor(booking.payment_status),
          extendedProps: {
            booking_id: booking.booking_id,
            customer: booking.customer?.full_name,
            vehicle: booking.vehicle?.license_plate,
            driver: booking.driver?.name,
            payment_status: booking.payment_status
          }
        }));
      }
      
      setCalendarEvents(filteredEvents);
      setLoading(false);
    } catch (err) {
      setError('Failed to filter bookings');
      console.error(err);
      setLoading(false);
    }
  };

  const handleEventClick = (info) => {
    const bookingId = info.event.id;
    const booking = bookings.find(b => b.id === parseInt(bookingId));
    
    if (booking) {
      setSelectedBooking(booking);
      setDetailsDialogOpen(true);
    }
  };

  const handleDateClick = (info) => {
    navigate('/bookings/new', { 
      state: { 
        initialDate: info.dateStr 
      } 
    });
  };

  const closeDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleViewBooking = () => {
    if (selectedBooking) {
      navigate(`/bookings/${selectedBooking.id}`);
    }
    closeDetailsDialog();
  };

  const handleEditBooking = () => {
    if (selectedBooking) {
      navigate(`/bookings/${selectedBooking.id}/edit`);
    }
    closeDetailsDialog();
  };

  if (loading && bookings.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Booking Calendar
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="vehicle-filter-label">Filter by Vehicle</InputLabel>
              <Select
                labelId="vehicle-filter-label"
                value={selectedVehicle}
                onChange={handleVehicleChange}
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
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="driver-filter-label">Filter by Driver</InputLabel>
              <Select
                labelId="driver-filter-label"
                value={selectedDriver}
                onChange={handleDriverChange}
                label="Filter by Driver"
              >
                <MenuItem value="">All Drivers</MenuItem>
                {drivers.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/bookings/new')}
            >
              New Booking
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ height: 700 }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="100%"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: true
            }}
          />
        </Box>
      </Paper>

      {/* Booking Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={closeDetailsDialog}>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ minWidth: 300 }}>
              <Typography variant="subtitle1" gutterBottom>
                Booking ID: {selectedBooking.booking_id}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Customer:</strong> {selectedBooking.customer?.full_name || 'Unknown Customer'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Vehicle:</strong> {selectedBooking.vehicle?.license_plate || 'No Vehicle'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Driver:</strong> {selectedBooking.driver?.name || 'No Driver'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Pickup:</strong> {moment(`${selectedBooking.pickup_date} ${selectedBooking.pickup_time}`).format('MMM D, YYYY h:mm A')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Return:</strong> {moment(`${selectedBooking.return_date} ${selectedBooking.return_time}`).format('MMM D, YYYY h:mm A')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> {selectedBooking.payment_status.toUpperCase()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Amount:</strong> ${selectedBooking.total_amount}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetailsDialog}>Close</Button>
          <Button onClick={handleViewBooking} color="primary">
            View Details
          </Button>
          <Button onClick={handleEditBooking} color="primary">
            Edit Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingCalendar;
