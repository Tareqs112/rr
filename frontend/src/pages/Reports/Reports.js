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
  TextField,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import moment from 'moment';
import reportService from '../../services/reports';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Reports = () => {
  const [tabValue, setTabValue] = useState(0);
  const [reportType, setReportType] = useState('bookings');
  const [startDate, setStartDate] = useState(moment().subtract(30, 'days'));
  const [endDate, setEndDate] = useState(moment());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    bookings: [],
    vehicles: [],
    customers: [],
    summary: {
      total_bookings: 0,
      total_revenue: 0,
      average_booking_value: 0,
      bookings_by_status: [],
      bookings_by_month: [],
      top_vehicles: [],
      top_customers: []
    }
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      const params = {
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD')
      };
      
      switch (reportType) {
        case 'bookings':
          response = await reportService.generateBookingReport(params);
          setReportData(prevData => ({ ...prevData, bookings: response.bookings }));
          break;
        case 'vehicles':
          response = await reportService.generateVehicleReport(params);
          setReportData(prevData => ({ ...prevData, vehicles: response.vehicles }));
          break;
        case 'customers':
          response = await reportService.generateCustomerReport(params);
          setReportData(prevData => ({ ...prevData, customers: response.customers }));
          break;
        case 'summary':
          response = await reportService.generateDashboardSummary();
          setReportData(prevData => ({ ...prevData, summary: response.summary }));
          break;
        default:
          break;
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch report data');
      console.error(err);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    switch (newValue) {
      case 0:
        setReportType('bookings');
        break;
      case 1:
        setReportType('vehicles');
        break;
      case 2:
        setReportType('customers');
        break;
      case 3:
        setReportType('summary');
        break;
      default:
        break;
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateChange = () => {
    fetchReportData();
  };

  const handleExport = async (format) => {
    try {
      setExportLoading(true);
      
      const params = {
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
        format
      };
      
      const blob = await reportService.exportReport(reportType, params);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${reportType}_report_${moment().format('YYYY-MM-DD')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setExportLoading(false);
    } catch (err) {
      setError('Failed to export report');
      console.error(err);
      setExportLoading(false);
    }
  };

  // Prepare chart data for summary tab
  const bookingsByStatusData = {
    labels: reportData.summary.bookings_by_status.map(item => item.status),
    datasets: [
      {
        data: reportData.summary.bookings_by_status.map(item => item.count),
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
    labels: reportData.summary.bookings_by_month.map(item => item.month),
    datasets: [
      {
        label: 'Bookings',
        data: reportData.summary.bookings_by_month.map(item => item.count),
        backgroundColor: '#1976d2',
      }
    ]
  };

  // Get paginated data based on current report type
  const getPaginatedData = () => {
    let data = [];
    
    switch (reportType) {
      case 'bookings':
        data = reportData.bookings;
        break;
      case 'vehicles':
        data = reportData.vehicles;
        break;
      case 'customers':
        data = reportData.customers;
        break;
      default:
        break;
    }
    
    return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
          <Tab label="Bookings" />
          <Tab label="Vehicles" />
          <Tab label="Customers" />
          <Tab label="Summary" />
        </Tabs>
      </Paper>

      {reportType !== 'summary' && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="contained" 
                onClick={handleDateChange}
                disabled={loading}
              >
                Generate Report
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<PdfIcon />}
                onClick={() => handleExport('pdf')}
                disabled={exportLoading}
              >
                PDF
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<CsvIcon />}
                onClick={() => handleExport('csv')}
                disabled={exportLoading}
              >
                CSV
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Bookings Report */}
          {reportType === 'bookings' && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Booking Report ({startDate.format('MMM D, YYYY')} - {endDate.format('MMM D, YYYY')})
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Booking ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Vehicle</TableCell>
                      <TableCell>Pickup Date</TableCell>
                      <TableCell>Return Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getPaginatedData().map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.booking_id}</TableCell>
                        <TableCell>{booking.customer_name}</TableCell>
                        <TableCell>{booking.vehicle_plate}</TableCell>
                        <TableCell>{moment(booking.pickup_date).format('MMM D, YYYY')}</TableCell>
                        <TableCell>{moment(booking.return_date).format('MMM D, YYYY')}</TableCell>
                        <TableCell>{booking.payment_status.toUpperCase()}</TableCell>
                        <TableCell align="right">${booking.total_amount}</TableCell>
                      </TableRow>
                    ))}
                    {reportData.bookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No booking data available for the selected period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={reportData.bookings.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
              
              {reportData.bookings.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle1">
                    Total Bookings: {reportData.bookings.length}
                  </Typography>
                  <Typography variant="subtitle1">
                    Total Revenue: ${reportData.bookings.reduce((sum, booking) => sum + booking.total_amount, 0).toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* Vehicles Report */}
          {reportType === 'vehicles' && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Vehicle Report ({startDate.format('MMM D, YYYY')} - {endDate.format('MMM D, YYYY')})
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>License Plate</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>Total Bookings</TableCell>
                      <TableCell>Days Booked</TableCell>
                      <TableCell>Availability Rate</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getPaginatedData().map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>{vehicle.license_plate}</TableCell>
                        <TableCell>{vehicle.model_name}</TableCell>
                        <TableCell>{vehicle.total_bookings}</TableCell>
                        <TableCell>{vehicle.days_booked}</TableCell>
                        <TableCell>{vehicle.availability_rate}%</TableCell>
                        <TableCell align="right">${vehicle.total_revenue}</TableCell>
                      </TableRow>
                    ))}
                    {reportData.vehicles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No vehicle data available for the selected period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={reportData.vehicles.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
              
              {reportData.vehicles.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle1">
                    Total Vehicles: {reportData.vehicles.length}
                  </Typography>
                  <Typography variant="subtitle1">
                    Average Availability Rate: {(reportData.vehicles.reduce((sum, vehicle) => sum + vehicle.availability_rate, 0) / reportData.vehicles.length).toFixed(2)}%
                  </Typography>
                  <Typography variant="subtitle1">
                    Total Revenue: ${reportData.vehicles.reduce((sum, vehicle) => sum + vehicle.total_revenue, 0).toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* Customers Report */}
          {reportType === 'customers' && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Customer Report ({startDate.format('MMM D, YYYY')} - {endDate.format('MMM D, YYYY')})
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer Name</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Total Bookings</TableCell>
                      <TableCell>Last Booking</TableCell>
                      <TableCell>VIP Status</TableCell>
                      <TableCell align="right">Total Spent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getPaginatedData().map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.full_name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.total_bookings}</TableCell>
                        <TableCell>{customer.last_booking ? moment(customer.last_booking).format('MMM D, YYYY') : 'N/A'}</TableCell>
                        <TableCell>{customer.is_vip ? 'Yes' : 'No'}</TableCell>
                        <TableCell align="right">${customer.total_spent}</TableCell>
                      </TableRow>
                    ))}
                    {reportData.customers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No customer data available for the selected period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={reportData.customers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
              
              {reportData.customers.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle1">
                    Total Customers: {reportData.customers.length}
                  </Typography>
                  <Typography variant="subtitle1">
                    VIP Customers: {reportData.customers.filter(c => c.is_vip).length}
                  </Typography>
                  <Typography variant="subtitle1">
                    Total Revenue: ${reportData.customers.reduce((sum, customer) => sum + customer.total_spent, 0).toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* Summary Report */}
          {reportType === 'summary' && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Business Summary
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Key Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Total Bookings:
                        </Typography>
                        <Typography variant="h6">
                          {reportData.summary.total_bookings}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Total Revenue:
                        </Typography>
                        <Typography variant="h6">
                          ${reportData.summary.total_revenue}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Average Booking Value:
                        </Typography>
                        <Typography variant="h6">
                          ${reportData.summary.average_booking_value}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                  
                  <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Bookings by Status
                    </Typography>
                    <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
                      <Pie data={bookingsByStatusData} options={{ maintainAspectRatio: false }} />
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Monthly Bookings
                    </Typography>
                    <Box sx={{ height: 250 }}>
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
                
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Top Performing Vehicles
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>License Plate</TableCell>
                            <TableCell>Model</TableCell>
                            <TableCell>Bookings</TableCell>
                            <TableCell align="right">Revenue</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.summary.top_vehicles.map((vehicle, index) => (
                            <TableRow key={index}>
                              <TableCell>{vehicle.license_plate}</TableCell>
                              <TableCell>{vehicle.model_name}</TableCell>
                              <TableCell>{vehicle.bookings}</TableCell>
                              <TableCell align="right">${vehicle.revenue}</TableCell>
                            </TableRow>
                          ))}
                          {reportData.summary.top_vehicles.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                No vehicle data available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Top Customers
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Customer</TableCell>
                            <TableCell>Bookings</TableCell>
                            <TableCell>VIP</TableCell>
                            <TableCell align="right">Spent</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.summary.top_customers.map((customer, index) => (
                            <TableRow key={index}>
                              <TableCell>{customer.full_name}</TableCell>
                              <TableCell>{customer.bookings}</TableCell>
                              <TableCell>{customer.is_vip ? 'Yes' : 'No'}</TableCell>
                              <TableCell align="right">${customer.spent}</TableCell>
                            </TableRow>
                          ))}
                          {reportData.summary.top_customers.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                No customer data available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="contained" 
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('pdf')}
                  disabled={exportLoading}
                >
                  Export Full Report
                </Button>
              </Box>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default Reports;
