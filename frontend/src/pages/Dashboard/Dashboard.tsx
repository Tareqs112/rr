import React, { useState, useEffect } from 'react';
import './Dashboard.css';

interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  bookedVehicles: number;
  maintenanceVehicles: number;
  activeBookings: number;
  todayPickups: number;
  todayReturns: number;
  pendingPayments: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    availableVehicles: 0,
    bookedVehicles: 0,
    maintenanceVehicles: 0,
    activeBookings: 0,
    todayPickups: 0,
    todayReturns: 0,
    pendingPayments: 0
  });
  
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // في الإصدار النهائي، سيتم استبدال هذا بطلب API حقيقي
    const fetchDashboardData = async () => {
      try {
        // محاكاة طلب API
        setTimeout(() => {
          setStats({
            totalVehicles: 45,
            availableVehicles: 28,
            bookedVehicles: 12,
            maintenanceVehicles: 5,
            activeBookings: 18,
            todayPickups: 4,
            todayReturns: 3,
            pendingPayments: 7
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('خطأ في جلب بيانات لوحة التحكم:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">لوحة التحكم</h1>
      
      <div className="stats-container">
        <div className="stats-row">
          <div className="stat-card">
            <h3>إجمالي السيارات</h3>
            <div className="stat-value">{stats.totalVehicles}</div>
          </div>
          
          <div className="stat-card available">
            <h3>السيارات المتاحة</h3>
            <div className="stat-value">{stats.availableVehicles}</div>
          </div>
          
          <div className="stat-card booked">
            <h3>السيارات المحجوزة</h3>
            <div className="stat-value">{stats.bookedVehicles}</div>
          </div>
          
          <div className="stat-card maintenance">
            <h3>سيارات في الصيانة</h3>
            <div className="stat-value">{stats.maintenanceVehicles}</div>
          </div>
        </div>
        
        <div className="stats-row">
          <div className="stat-card active">
            <h3>الحجوزات النشطة</h3>
            <div className="stat-value">{stats.activeBookings}</div>
          </div>
          
          <div className="stat-card pickup">
            <h3>استلامات اليوم</h3>
            <div className="stat-value">{stats.todayPickups}</div>
          </div>
          
          <div className="stat-card return">
            <h3>إرجاعات اليوم</h3>
            <div className="stat-value">{stats.todayReturns}</div>
          </div>
          
          <div className="stat-card payment">
            <h3>مدفوعات معلقة</h3>
            <div className="stat-value">{stats.pendingPayments}</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>الحجوزات القادمة</h2>
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>رقم الحجز</th>
                  <th>العميل</th>
                  <th>السيارة</th>
                  <th>تاريخ الاستلام</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>BK-123456</td>
                  <td>أحمد محمد</td>
                  <td>تويوتا كامري 2023</td>
                  <td>05/06/2025</td>
                  <td><span className="status confirmed">مؤكد</span></td>
                </tr>
                <tr>
                  <td>BK-123457</td>
                  <td>سارة أحمد</td>
                  <td>هوندا أكورد 2024</td>
                  <td>06/06/2025</td>
                  <td><span className="status confirmed">مؤكد</span></td>
                </tr>
                <tr>
                  <td>BK-123458</td>
                  <td>محمد علي</td>
                  <td>نيسان التيما 2023</td>
                  <td>07/06/2025</td>
                  <td><span className="status pending">معلق</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="dashboard-section">
          <h2>المدفوعات الأخيرة</h2>
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>رقم العملية</th>
                  <th>العميل</th>
                  <th>المبلغ</th>
                  <th>التاريخ</th>
                  <th>طريقة الدفع</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>PAY-987654</td>
                  <td>خالد عبدالله</td>
                  <td>1,200 ريال</td>
                  <td>03/06/2025</td>
                  <td>بطاقة ائتمان</td>
                </tr>
                <tr>
                  <td>PAY-987655</td>
                  <td>فاطمة محمد</td>
                  <td>850 ريال</td>
                  <td>02/06/2025</td>
                  <td>نقداً</td>
                </tr>
                <tr>
                  <td>PAY-987656</td>
                  <td>عمر أحمد</td>
                  <td>1,500 ريال</td>
                  <td>01/06/2025</td>
                  <td>تحويل بنكي</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
