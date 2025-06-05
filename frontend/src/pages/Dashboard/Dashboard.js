import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  ArrowUpward, 
  Payment,
  ErrorOutline
} from '@mui/icons-material';
import { Bar, Line } from 'react-chartjs-2';
import moment from 'moment';
import 'moment/locale/ar';
import 'chart.js/auto';

import { getReportSummary } from '../../services/reports';
import api from '../../services/api';

moment.locale('ar');

const Dashboard = () => {
  const navigate = useNavigate();
  
  // حالات لتخزين بيانات لوحة التحكم
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [bookingsByMonth, setBookingsByMonth] = useState(null);
  const [upcomingPickups, setUpcomingPickups] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  
  // حالات لتتبع حالة التحميل والأخطاء
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueError, setRevenueError] = useState(null);
  const [bookingsError, setBookingsError] = useState(null);

  useEffect(() => {
    // جلب بيانات لوحة التحكم
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // جلب ملخص التقارير
        const summaryResponse = await getReportSummary();
        if (summaryResponse.success) {
          setDashboardData(summaryResponse.data);
        }
        
        // جلب بيانات الإيرادات الشهرية
        try {
          const revenueResponse = await api.get('/reports/revenue/monthly');
          setMonthlyRevenue(revenueResponse.data.data);
        } catch (revenueErr) {
          console.error('خطأ في تحميل بيانات الإيرادات الشهرية:', revenueErr);
          setRevenueError('فشل في تحميل بيانات الإيرادات الشهرية. سيتم عرض بيانات افتراضية.');
          
          // بيانات افتراضية في حالة الخطأ
          setMonthlyRevenue({
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [
              {
                label: 'الإيرادات الشهرية',
                data: [10000, 12000, 15000, 13000, 16000, 18000],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
              }
            ]
          });
        }
        
        // جلب بيانات الحجوزات الشهرية
        try {
          const bookingsResponse = await api.get('/reports/bookings');
          setBookingsByMonth({
            labels: bookingsResponse.data.data.bookingsByMonth.map(item => item.month),
            datasets: [
              {
                label: 'الحجوزات الشهرية',
                data: bookingsResponse.data.data.bookingsByMonth.map(item => item.count),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }
            ]
          });
          
          // استخراج الاستلامات القادمة والمدفوعات المعلقة من بيانات الحجوزات
          setUpcomingPickups(bookingsResponse.data.data.recentBookings.filter(booking => 
            booking.status === 'active' || booking.status === 'pending'
          ));
          
          setPendingPayments(bookingsResponse.data.data.recentBookings.filter(booking => 
            booking.status === 'completed' || booking.status === 'active'
          ).slice(0, 3));
          
        } catch (bookingsErr) {
          console.error('خطأ في تحميل بيانات الحجوزات:', bookingsErr);
          setBookingsError('فشل في تحميل بيانات الحجوزات. سيتم عرض بيانات افتراضية.');
          
          // بيانات افتراضية في حالة الخطأ
          setBookingsByMonth({
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [
              {
                label: 'الحجوزات الشهرية',
                data: [3, 5, 4, 6, 7, 8],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }
            ]
          });
          
          // بيانات افتراضية للاستلامات والمدفوعات
          setUpcomingPickups([
            { 
              id: 1, 
              customer: { full_name: 'أحمد محمد' }, 
              vehicle: { license_plate: 'أ ب ج 123' },
              pickup_time: '10:00 صباحاً',
              driver: true
            },
            { 
              id: 2, 
              customer: { full_name: 'سارة علي' }, 
              vehicle: { license_plate: 'د هـ و 456' },
              pickup_time: '2:30 مساءً',
              driver: false
            }
          ]);
          
          setPendingPayments([
            { 
              id: 3, 
              customer: { full_name: 'محمد خالد' }, 
              vehicle: { license_plate: 'س ش ص 789' },
              pickup_date: new Date(),
              payment_status: 'pending'
            },
            { 
              id: 4, 
              customer: { full_name: 'فاطمة أحمد' }, 
              vehicle: { license_plate: 'ط ظ ع 012' },
              pickup_date: new Date(),
              payment_status: 'overdue'
            }
          ]);
        }
        
      } catch (err) {
        console.error('خطأ في تحميل بيانات لوحة التحكم:', err);
        setError('فشل في تحميل بيانات لوحة التحكم. يرجى المحاولة مرة أخرى لاحقاً.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // عرض مؤشر التحميل أثناء جلب البيانات
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        لوحة التحكم
      </Typography>
      
      {/* عرض رسالة الخطأ الرئيسية إذا وجدت */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1">{error}</Typography>
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* أرقام إحصائية */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" color="textSecondary">
                  إجمالي العملاء
                </Typography>
                <Typography variant="h3" color="primary" sx={{ mt: 2 }}>
                  {dashboardData?.totalCustomers || 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" color="textSecondary">
                  إجمالي السائقين
                </Typography>
                <Typography variant="h3" color="primary" sx={{ mt: 2 }}>
                  {dashboardData?.totalDrivers || 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" color="textSecondary">
                  إجمالي الحجوزات
                </Typography>
                <Typography variant="h3" color="primary" sx={{ mt: 2 }}>
                  {dashboardData?.totalBookings || 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" color="textSecondary">
                  المركبات النشطة
                </Typography>
                <Typography variant="h3" color="primary" sx={{ mt: 2 }}>
                  {dashboardData?.activeVehicles || 0}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        
        {/* الرسوم البيانية */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  الإيرادات الشهرية
                </Typography>
                
                {/* عرض رسالة الخطأ الخاصة بالإيرادات إذا وجدت */}
                {revenueError && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">{revenueError}</Typography>
                  </Alert>
                )}
                
                <Box sx={{ height: 300 }}>
                  {monthlyRevenue ? (
                    <Line 
                      data={monthlyRevenue} 
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }} 
                    />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="textSecondary">
                        <ErrorOutline sx={{ mr: 1, verticalAlign: 'middle' }} />
                        لا توجد بيانات متاحة
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  الحجوزات الشهرية
                </Typography>
                
                {/* عرض رسالة الخطأ الخاصة بالحجوزات إذا وجدت */}
                {bookingsError && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">{bookingsError}</Typography>
                  </Alert>
                )}
                
                <Box sx={{ height: 300 }}>
                  {bookingsByMonth ? (
                    <Bar 
                      data={bookingsByMonth} 
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
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="textSecondary">
                        <ErrorOutline sx={{ mr: 1, verticalAlign: 'middle' }} />
                        لا توجد بيانات متاحة
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Upcoming Pickups */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader 
              title="الاستلامات اليوم" 
              action={
                <Button 
                  color="primary" 
                  startIcon={<ArrowUpward />}
                  onClick={() => navigate('/bookings', { state: { filter: 'upcoming' } })}
                >
                  عرض الكل
                </Button>
              }
            />
            <CardContent>
              {upcomingPickups.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  لا توجد استلامات مجدولة لليوم
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
                          {pickup.customer?.full_name || 'عميل غير معروف'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {pickup.vehicle?.license_plate || 'لا توجد مركبة'} - {pickup.pickup_time}
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
                          {pickup.driver ? 'تم تعيين سائق' : 'لا يوجد سائق'}
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
              title="المدفوعات المعلقة" 
              action={
                <Button 
                  color="primary" 
                  startIcon={<Payment />}
                  onClick={() => navigate('/bookings', { state: { filter: 'pending' } })}
                >
                  عرض الكل
                </Button>
              }
            />
            <CardContent>
              {pendingPayments.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  لا توجد مدفوعات معلقة
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
                          {payment.customer?.full_name || 'عميل غير معروف'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {payment.vehicle?.license_plate || 'لا توجد مركبة'} - {moment(payment.pickup_date).format('MMM D, YYYY')}
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
                          {payment.payment_status === 'pending' ? 'معلق' : (payment.payment_status ? payment.payment_status.toUpperCase() : 'غير معروف')}
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
