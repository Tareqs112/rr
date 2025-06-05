import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { Bar, Pie, Line } from 'react-chartjs-2';
import 'chart.js/auto';

import api from '../../services/api';

const ReportDashboard = () => {
  // حالات لتخزين بيانات التقارير
  const [revenueData, setRevenueData] = useState(null);
  const [bookingsData, setBookingsData] = useState(null);
  const [vehiclesData, setVehiclesData] = useState(null);
  const [customersData, setCustomersData] = useState(null);
  
  // حالات لتتبع حالة التحميل والأخطاء
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        
        // جلب بيانات الإيرادات
        try {
          const revenueResponse = await api.get('/reports/revenue');
          setRevenueData(revenueResponse.data.data);
        } catch (error) {
          console.error('خطأ في تحميل بيانات الإيرادات:', error);
          setErrors(prev => ({ ...prev, revenue: 'فشل في تحميل بيانات الإيرادات. سيتم عرض بيانات افتراضية.' }));
          
          // بيانات افتراضية في حالة الخطأ
          setRevenueData({
            totalRevenue: 200000,
            averageMonthlyRevenue: 16667,
            revenueByQuarter: [
              { quarter: 'الربع الأول', amount: 40000 },
              { quarter: 'الربع الثاني', amount: 50000 },
              { quarter: 'الربع الثالث', amount: 60000 },
              { quarter: 'الربع الرابع', amount: 70000 }
            ],
            revenueByVehicleType: [
              { type: 'سيدان', amount: 80000 },
              { type: 'دفع رباعي', amount: 60000 },
              { type: 'فاخرة', amount: 40000 },
              { type: 'حافلة صغيرة', amount: 20000 }
            ]
          });
        }
        
        // جلب بيانات الحجوزات
        try {
          const bookingsResponse = await api.get('/reports/bookings');
          setBookingsData(bookingsResponse.data.data);
        } catch (error) {
          console.error('خطأ في تحميل بيانات الحجوزات:', error);
          setErrors(prev => ({ ...prev, bookings: 'فشل في تحميل بيانات الحجوزات. سيتم عرض بيانات افتراضية.' }));
          
          // بيانات افتراضية في حالة الخطأ
          setBookingsData({
            totalBookings: 40,
            completedBookings: 30,
            cancelledBookings: 5,
            pendingBookings: 5,
            bookingsByMonth: [
              { month: 'يناير', count: 3 },
              { month: 'فبراير', count: 4 },
              { month: 'مارس', count: 5 },
              { month: 'أبريل', count: 3 },
              { month: 'مايو', count: 6 },
              { month: 'يونيو', count: 7 }
            ]
          });
        }
        
        // جلب بيانات المركبات
        try {
          const vehiclesResponse = await api.get('/reports/vehicles');
          setVehiclesData(vehiclesResponse.data.data);
        } catch (error) {
          console.error('خطأ في تحميل بيانات المركبات:', error);
          setErrors(prev => ({ ...prev, vehicles: 'فشل في تحميل بيانات المركبات. سيتم عرض بيانات افتراضية.' }));
          
          // بيانات افتراضية في حالة الخطأ
          setVehiclesData({
            totalVehicles: 20,
            activeVehicles: 15,
            maintenanceVehicles: 3,
            inactiveVehicles: 2,
            vehiclesByType: [
              { type: 'سيدان', count: 8 },
              { type: 'دفع رباعي', count: 6 },
              { type: 'فاخرة', count: 3 },
              { type: 'حافلة صغيرة', count: 3 }
            ]
          });
        }
        
        // جلب بيانات العملاء
        try {
          const customersResponse = await api.get('/reports/customers');
          setCustomersData(customersResponse.data.data);
        } catch (error) {
          console.error('خطأ في تحميل بيانات العملاء:', error);
          setErrors(prev => ({ ...prev, customers: 'فشل في تحميل بيانات العملاء. سيتم عرض بيانات افتراضية.' }));
          
          // بيانات افتراضية في حالة الخطأ
          setCustomersData({
            totalCustomers: 20,
            newCustomers: 5,
            returningCustomers: 15,
            customersByMonth: [
              { month: 'يناير', count: 2 },
              { month: 'فبراير', count: 3 },
              { month: 'مارس', count: 1 },
              { month: 'أبريل', count: 4 },
              { month: 'مايو', count: 2 },
              { month: 'يونيو', count: 3 }
            ]
          });
        }
        
      } catch (error) {
        console.error('خطأ في تحميل بيانات التقارير:', error);
        setErrors(prev => ({ ...prev, general: 'فشل في تحميل بيانات التقارير. يرجى المحاولة مرة أخرى لاحقاً.' }));
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  // إعداد بيانات الرسوم البيانية
  const prepareChartData = () => {
    // بيانات الإيرادات حسب الربع
    const revenueByQuarterData = {
      labels: revenueData?.revenueByQuarter.map(item => item.quarter) || [],
      datasets: [
        {
          label: 'الإيرادات حسب الربع',
          data: revenueData?.revenueByQuarter.map(item => item.amount) || [],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    // بيانات الإيرادات حسب نوع المركبة
    const revenueByVehicleTypeData = {
      labels: revenueData?.revenueByVehicleType.map(item => item.type) || [],
      datasets: [
        {
          label: 'الإيرادات حسب نوع المركبة',
          data: revenueData?.revenueByVehicleType.map(item => item.amount) || [],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    // بيانات الحجوزات حسب الشهر
    const bookingsByMonthData = {
      labels: bookingsData?.bookingsByMonth.map(item => item.month) || [],
      datasets: [
        {
          label: 'الحجوزات الشهرية',
          data: bookingsData?.bookingsByMonth.map(item => item.count) || [],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
    
    // بيانات حالة الحجوزات
    const bookingsStatusData = {
      labels: ['مكتملة', 'ملغاة', 'معلقة'],
      datasets: [
        {
          label: 'حالة الحجوزات',
          data: [
            bookingsData?.completedBookings || 0,
            bookingsData?.cancelledBookings || 0,
            bookingsData?.pendingBookings || 0
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 206, 86, 0.2)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    // بيانات المركبات حسب النوع
    const vehiclesByTypeData = {
      labels: vehiclesData?.vehiclesByType.map(item => item.type) || [],
      datasets: [
        {
          label: 'المركبات حسب النوع',
          data: vehiclesData?.vehiclesByType.map(item => item.count) || [],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    // بيانات حالة المركبات
    const vehiclesStatusData = {
      labels: ['نشطة', 'في الصيانة', 'غير نشطة'],
      datasets: [
        {
          label: 'حالة المركبات',
          data: [
            vehiclesData?.activeVehicles || 0,
            vehiclesData?.maintenanceVehicles || 0,
            vehiclesData?.inactiveVehicles || 0
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(255, 99, 132, 0.2)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    // بيانات العملاء حسب الشهر
    const customersByMonthData = {
      labels: customersData?.customersByMonth.map(item => item.month) || [],
      datasets: [
        {
          label: 'العملاء الجدد',
          data: customersData?.customersByMonth.map(item => item.count) || [],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
    
    return {
      revenueByQuarterData,
      revenueByVehicleTypeData,
      bookingsByMonthData,
      bookingsStatusData,
      vehiclesByTypeData,
      vehiclesStatusData,
      customersByMonthData
    };
  };

  // عرض مؤشر التحميل أثناء جلب البيانات
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const chartData = prepareChartData();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        لوحة التقارير
      </Typography>
      
      {/* عرض رسالة الخطأ العامة إذا وجدت */}
      {errors.general && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1">{errors.general}</Typography>
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* قسم الإيرادات */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              تقرير الإيرادات
            </Typography>
            
            {/* عرض رسالة الخطأ الخاصة بالإيرادات إذا وجدت */}
            {errors.revenue && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">{errors.revenue}</Typography>
              </Alert>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card elevation={2} sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      إجمالي الإيرادات
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {revenueData?.totalRevenue?.toLocaleString() || 0} ريال
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card elevation={2} sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      متوسط الإيرادات الشهرية
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {revenueData?.averageMonthlyRevenue?.toLocaleString() || 0} ريال
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card elevation={2} sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      عدد المركبات المؤجرة
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {vehiclesData?.activeVehicles || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  الإيرادات حسب الربع
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar 
                    data={chartData.revenueByQuarterData} 
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  الإيرادات حسب نوع المركبة
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Pie 
                    data={chartData.revenueByVehicleTypeData} 
                    options={{
                      maintainAspectRatio: false
                    }} 
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* قسم الحجوزات */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              تقرير الحجوزات
            </Typography>
            
            {/* عرض رسالة الخطأ الخاصة بالحجوزات إذا وجدت */}
            {errors.bookings && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">{errors.bookings}</Typography>
              </Alert>
            )}
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Card elevation={0} sx={{ textAlign: 'center' }}>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      إجمالي الحجوزات
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {bookingsData?.totalBookings || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card elevation={0} sx={{ textAlign: 'center' }}>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      الحجوزات المكتملة
                    </Typography>
                    <Typography variant="h4" sx={{ color: 'success.main' }}>
                      {bookingsData?.completedBookings || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card elevation={0} sx={{ textAlign: 'center' }}>
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      الحجوزات المعلقة
                    </Typography>
                    <Typography variant="h4" sx={{ color: 'warning.main' }}>
                      {bookingsData?.pendingBookings || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              الحجوزات الشهرية
            </Typography>
            <Box sx={{ height: 250 }}>
              <Bar 
                data={chartData.bookingsByMonthData} 
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
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              حالة الحجوزات
            </Typography>
            <Box sx={{ height: 250 }}>
              <Pie 
                data={chartData.bookingsStatusData} 
                options={{
                  maintainAspectRatio: false
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* قسم المركبات والعملاء */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            {/* قسم المركبات */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  تقرير المركبات
                </Typography>
                
                {/* عرض رسالة الخطأ الخاصة بالمركبات إذا وجدت */}
                {errors.vehicles && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">{errors.vehicles}</Typography>
                  </Alert>
                )}
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Card elevation={0} sx={{ textAlign: 'center' }}>
                      <CardContent>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                          إجمالي المركبات
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {vehiclesData?.totalVehicles || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card elevation={0} sx={{ textAlign: 'center' }}>
                      <CardContent>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                          المركبات النشطة
                        </Typography>
                        <Typography variant="h4" sx={{ color: 'success.main' }}>
                          {vehiclesData?.activeVehicles || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card elevation={0} sx={{ textAlign: 'center' }}>
                      <CardContent>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                          في الصيانة
                        </Typography>
                        <Typography variant="h4" sx={{ color: 'warning.main' }}>
                          {vehiclesData?.maintenanceVehicles || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      المركبات حسب النوع
                    </Typography>
                    <Box sx={{ height: 200 }}>
                      <Pie 
                        data={chartData.vehiclesByTypeData} 
                        options={{
                          maintainAspectRatio: false
                        }} 
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      حالة المركبات
                    </Typography>
                    <Box sx={{ height: 200 }}>
                      <Pie 
                        data={chartData.vehiclesStatusData} 
                        options={{
                          maintainAspectRatio: false
                        }} 
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            {/* قسم العملاء */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  تقرير العملاء
                </Typography>
                
                {/* عرض رسالة الخطأ الخاصة بالعملاء إذا وجدت */}
                {errors.customers && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">{errors.customers}</Typography>
                  </Alert>
                )}
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Card elevation={0} sx={{ textAlign: 'center' }}>
                      <CardContent>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                          إجمالي العملاء
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {customersData?.totalCustomers || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card elevation={0} sx={{ textAlign: 'center' }}>
                      <CardContent>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                          العملاء الجدد
                        </Typography>
                        <Typography variant="h4" sx={{ color: 'info.main' }}>
                          {customersData?.newCustomers || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card elevation={0} sx={{ textAlign: 'center' }}>
                      <CardContent>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                          العملاء العائدين
                        </Typography>
                        <Typography variant="h4" sx={{ color: 'success.main' }}>
                          {customersData?.returningCustomers || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  العملاء الجدد حسب الشهر
                </Typography>
                <Box sx={{ height: 250 }}>
                  <Line 
                    data={chartData.customersByMonthData} 
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
      </Grid>
    </Box>
  );
};

export default ReportDashboard;
