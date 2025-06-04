import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getRevenueReport } from '../../services/reports';

const RevenueReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  const dispatch = useDispatch();

  useEffect(() => {
    fetchRevenueReport();
  }, []);

  const fetchRevenueReport = async (start = null, end = null) => {
    try {
      setLoading(true);
      const data = await getRevenueReport(start, end);
      setReport(data);
    } catch (err) {
      setError('فشل في تحميل تقرير الإيرادات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchRevenueReport(dateRange.startDate, dateRange.endDate);
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="revenue-report">
      <div className="page-header">
        <h2>تقرير الإيرادات</h2>
        <div className="actions">
          <Link to="/reports" className="btn btn-secondary">
            العودة للوحة التقارير
          </Link>
        </div>
      </div>

      <div className="filter-section">
        <form onSubmit={handleFilter}>
          <div className="form-row">
            <div className="form-group">
              <label>من تاريخ</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </div>
            <div className="form-group">
              <label>إلى تاريخ</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              تطبيق الفلتر
            </button>
          </div>
        </form>
      </div>

      {report && (
        <div className="report-content">
          <div className="summary-cards">
            <div className="card">
              <div className="card-header">إجمالي الإيرادات</div>
              <div className="card-body">
                <h3>{report.totalRevenue}</h3>
              </div>
            </div>
            <div className="card">
              <div className="card-header">إجمالي الحجوزات</div>
              <div className="card-body">
                <h3>{report.totalBookings}</h3>
              </div>
            </div>
            <div className="card">
              <div className="card-header">متوسط الإيراد لكل حجز</div>
              <div className="card-body">
                <h3>{report.averageBookingValue}</h3>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <h3>الإيرادات الشهرية</h3>
            <div className="chart">
              {/* هنا يمكن إضافة مكتبة رسوم بيانية مثل Chart.js أو Recharts */}
              <div className="chart-placeholder">
                الرسم البياني للإيرادات الشهرية
              </div>
            </div>
          </div>

          <div className="table-container">
            <h3>تفاصيل الإيرادات</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>الشهر</th>
                  <th>عدد الحجوزات</th>
                  <th>إجمالي الإيرادات</th>
                  <th>نسبة النمو</th>
                </tr>
              </thead>
              <tbody>
                {report.monthlyData && report.monthlyData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.month}</td>
                    <td>{item.bookings}</td>
                    <td>{item.revenue}</td>
                    <td className={item.growth >= 0 ? 'positive' : 'negative'}>
                      {item.growth}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-container">
            <h3>أعلى المركبات إيراداً</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>المركبة</th>
                  <th>عدد الحجوزات</th>
                  <th>إجمالي الإيرادات</th>
                  <th>نسبة الإشغال</th>
                </tr>
              </thead>
              <tbody>
                {report.topVehicles && report.topVehicles.map((item, index) => (
                  <tr key={index}>
                    <td>{item.vehicleName}</td>
                    <td>{item.bookings}</td>
                    <td>{item.revenue}</td>
                    <td>{item.occupancyRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueReport;
