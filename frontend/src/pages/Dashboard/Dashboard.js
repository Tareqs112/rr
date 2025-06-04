import React from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, CardHeader, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  DirectionsCar, 
  Person, 
  EventNote, 
  Payment, 
  Notifications, 
  ArrowUpward, 
  ArrowDownward 
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import moment from 'moment';

// Import services
import bookingService from '../../services/bookings';
import vehicleService from '../../services/vehicles';
import reportService from '../../services/reports';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [summary, setSummary] = useState({
    total_bookings: 0,
    bookings_this_month: 0,
    upcoming_pickups: 0,
    pending_payments: 0,
    vehicles: {
      total: 0,
      available: 0,
      booked: 0,
      maintenance: 0,
      availability_rate: '0%'
    },
    bookings_by_payment_status: [],
    bookings_by_month: []
  });
  
  const [upcomingPickups, setUpcomingPickups] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch dashboard summary
        const summaryData = await reportService.generateDashboardSummary();
        setSummary(summaryData.summary);
        
        // Fetch upcoming pickups
        const pickupsData = await bookingService.getUpcomingPickups();
        setUpcomingPickups(pickupsData.pickups);
        
        // Fetch pending payments
        const paymentsData = await bookingService.getPendingPayments();
        setPendingPayments(paymentsData.payments);
        
        // Fetch calendar events
        const today = moment().format('YYYY-MM-DD');
        const oneMonthLater = moment().add(1, 'month').format('YYYY-MM-DD');
        
        const calendarData = await bookingService.getBookingsForCalendar({
          start_date: today,
          end_date: oneMonthLater
        });
        
        setCalendarEvents(calendarData.events);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Prepare chart data
  const paymentStatusData = {
    labels: summary.bookings_by_payment_status.map(item => item.status),
    datasets: [
      {
        data: summary.bookings_by_payment_status.map(item => item.count),
        backgroundColor: [
          '#4caf50', // paid - green
          '#ff9800', // pending - orange
          '#f44336'  // hold - red
        ],
        borderWidth: 1
      }
    ]
  };
  
  const bookingsByMonthData = {
    labels: summary.bookings_by_month.map(item => item.month),
    datasets: [
      {
        label: 'Bookings',
        data: summary.bookings_by_month.map(item => item.count),
        backgroundColor: theme.palette.primary.main,
      }
    ]
  };
  
  const vehicleStatusData = {
    labels: ['Available', 'Booked', 'Maintenance'],
    datasets: [
      {
        data: [
          summary.vehicles.available,
          summary.vehicles.booked,
          summary.vehicles.maintenance
        ],
        backgroundColor: [
          '#4caf50', // available - green
          '#2196f3', // booked - blue
          '#ff9800'  // maintenance - orange
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Handle calendar event click
  const handleEventClick = (info) => {
    navigate(`/bookings/${info.event.id}`);
  };
  
  // Handle date click
  const handleDateClick = (info) => {
    navigate('/bookings/new', { 
      state: { 
        initialDate: info.dateStr 
      } 
    });
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: theme.palette.primary.main,
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="div">
                Total Bookings
              </Typography>
              <EventNote fontSize="large" />
            </Box>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              {summary.total_bookings}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {summary.bookings_this_month} this month
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#4caf50',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="div">
                Available Vehicles
              </Typography>
              <DirectionsCar fontSize="large" />
            </Box>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              {summary.vehicles.available}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              of {summary.vehicles.total} total ({summary.vehicles.availability_rate})
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#ff9800',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="div">
                Upcoming Pickups
              </Typography>
              <ArrowUpward fontSize="large" />
            </Box>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              {summary.upcoming_pickups}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              scheduled for today
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: '#f44336',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" component="div">
                Pending Payments
              </Typography>
              <Payment fontSize="large" />
            </Box>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              {summary.pending_payments}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              requiring attention
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Calendar */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Booking Calendar
            </Typography>
            <Box sx={{ height: 600 }}>
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
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Charts and Lists */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* Vehicle Status Chart */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Vehicle Status
                </Typography>
                <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                  <Pie data={vehicleStatusData} options={{ maintainAspectRatio: false }} />
                </Box>
              </Paper>
            </Grid>
            
            {/* Payment Status Chart */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Bookings by Payment Status
                </Typography>
                <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                  <Pie data={paymentStatusData} options={{ maintainAspectRatio: false }} />
                </Box>
              </Paper>
            </Grid>
            
            {/* Monthly Bookings Chart */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Monthly Bookings
                </Typography>
                <Box sx={{ height: 200 }}>
                  <Bar 
                    data={bookingsByMonthData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0
                          }
                        }
                      }
                    }} 
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Upcoming Pickups */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title="Today's Pickups" 
              action={
                <Button 
                  color="primary" 
                  startIcon={<ArrowUpward />}
                  onClick={() => navigate('/bookings', { state: { filter: 'upcoming' } })}
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              {upcomingPickups.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No pickups scheduled for today
                </Typography>
              ) : (
                upcomingPickups.slice(0, 5).map((pickup) => (
                  <Paper 
                    key={pickup.id} 
                    elevation={1} 
                    sx={{ p: 2, mb: 1, cursor: 'pointer' }}
                    onClick={() => navigate(`/bookings/${pickup.id}`)}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={8}>
                        <Typography variant="subtitle1">
                          {pickup.customer?.full_name || 'Unknown Customer'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {pickup.vehicle?.license_plate || 'No Vehicle'} - {pickup.pickup_time}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            color: pickup.driver ? 'success.main' : 'error.main',
                            fontWeight: 'bold'
                          }}
                        >
                          {pickup.driver ? 'Driver Assigned' : 'No Driver'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Pending Payments */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title="Pending Payments" 
              action={
                <Button 
                  color="primary" 
                  startIcon={<Payment />}
                  onClick={() => navigate('/bookings', { state: { filter: 'pending' } })}
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              {pendingPayments.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No pending payments
                </Typography>
              ) : (
                pendingPayments.slice(0, 5).map((payment) => (
                  <Paper 
                    key={payment.id} 
                    elevation={1} 
                    sx={{ p: 2, mb: 1, cursor: 'pointer' }}
                    onClick={() => navigate(`/bookings/${payment.id}`)}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={8}>
                        <Typography variant="subtitle1">
                          {payment.customer?.full_name || 'Unknown Customer'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {payment.vehicle?.license_plate || 'No Vehicle'} - {moment(payment.pickup_date).format('MMM D, YYYY')}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            color: payment.payment_status === 'pending' ? 'warning.main' : 'error.main',
                            fontWeight: 'bold'
                          }}
                        >
                          {payment.payment_status.toUpperCase()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
