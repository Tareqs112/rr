import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getBookingReport } from '../../services/reports';

const BookingReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  const dispatch = useDispatch();

  useEffect(() => {
    fetchBookingReport();
  }, []);

  const fetchBookingReport = async (start = null, end = null) => {
    try {
      setLoading(true);
      const data = await getBookingReport(start, end);
      setReport(data);
    } catch (err) {
      setError('فشل في تحميل تقرير الحجوزات');
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
    fetchBookingReport(dateRange.startDate, dateRange.endDate);
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="booking-report">
      <div className="page-header">
        <h2>تقرير الحجوزات</h2>
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
              <div className="card-header">إجمالي الحجوزات</div>
              <div className="card-body">
                <h3>{report.totalBookings}</h3>
              </div>
            </div>
            <div className="card">
              <div className="card-header">الحجوزات النشطة</div>
              <div className="card-body">
                <h3>{report.activeBookings}</h3>
              </div>
            </div>
            <div className="card">
              <div className="card-header">متوسط مدة الحجز</div>
              <div className="card-body">
                <h3>{report.averageDuration} يوم</h3>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <h3>توزيع الحجوزات حسب الحالة</h3>
            <div className="chart">
              {/* هنا يمكن إضافة مكتبة رسوم بيانية مثل Chart.js أو Recharts */}
              <div className="chart-placeholder">
                الرسم البياني لتوزيع الحجوزات حسب الحالة
              </div>
            </div>
          </div>

          <div className="table-container">
            <h3>تفاصيل الحجوزات</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم الحجز</th>
                  <th>العميل</th>
                  <th>المركبة</th>
                  <th>تاريخ البداية</th>
                  <th>تاريخ النهاية</th>
                  <th>المدة</th>
                  <th>المبلغ</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {report.bookings && report.bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.customerName}</td>
                    <td>{booking.vehicleName}</td>
                    <td>{booking.startDate}</td>
                    <td>{booking.endDate}</td>
                    <td>{booking.duration} يوم</td>
                    <td>{booking.amount}</td>
                    <td>
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status === 'pending' && 'قيد الانتظار'}
                        {booking.status === 'confirmed' && 'مؤكد'}
                        {booking.status === 'active' && 'نشط'}
                        {booking.status === 'completed' && 'مكتمل'}
                        {booking.status === 'cancelled' && 'ملغي'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/bookings/${booking.id}`} className="btn btn-sm btn-primary">
                        عرض
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="chart-container">
            <h3>توزيع الحجوزات الشهرية</h3>
            <div className="chart">
              {/* هنا يمكن إضافة مكتبة رسوم بيانية مثل Chart.js أو Recharts */}
              <div className="chart-placeholder">
                الرسم البياني للحجوزات الشهرية
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingReport;
