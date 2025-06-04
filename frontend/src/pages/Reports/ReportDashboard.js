import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getReportSummary } from '../../services/reports';

const ReportDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  const dispatch = useDispatch();

  useEffect(() => {
    fetchReportSummary();
  }, []);

  const fetchReportSummary = async (start = null, end = null) => {
    try {
      setLoading(true);
      const data = await getReportSummary(start, end);
      setSummary(data);
    } catch (err) {
      setError('فشل في تحميل بيانات التقارير');
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
    fetchReportSummary(dateRange.startDate, dateRange.endDate);
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="report-dashboard">
      <div className="page-header">
        <h2>لوحة التقارير</h2>
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

      {summary && (
        <div className="dashboard-cards">
          <div className="card">
            <div className="card-header">إجمالي الإيرادات</div>
            <div className="card-body">
              <h3>{summary.totalRevenue}</h3>
            </div>
            <div className="card-footer">
              <Link to="/reports/revenue" className="btn btn-link">
                عرض التفاصيل
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-header">إجمالي الحجوزات</div>
            <div className="card-body">
              <h3>{summary.totalBookings}</h3>
            </div>
            <div className="card-footer">
              <Link to="/reports/bookings" className="btn btn-link">
                عرض التفاصيل
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-header">المركبات المؤجرة حالياً</div>
            <div className="card-body">
              <h3>{summary.activeRentals}</h3>
            </div>
            <div className="card-footer">
              <Link to="/vehicles" className="btn btn-link">
                عرض التفاصيل
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-header">المركبات المتاحة</div>
            <div className="card-body">
              <h3>{summary.availableVehicles}</h3>
            </div>
            <div className="card-footer">
              <Link to="/vehicles" className="btn btn-link">
                عرض التفاصيل
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="report-links">
        <h3>التقارير المتاحة</h3>
        <div className="links-container">
          <Link to="/reports/revenue" className="report-link">
            <div className="report-icon">📊</div>
            <div className="report-title">تقرير الإيرادات</div>
          </Link>
          <Link to="/reports/bookings" className="report-link">
            <div className="report-icon">📅</div>
            <div className="report-title">تقرير الحجوزات</div>
          </Link>
          <Link to="/reports/vehicles" className="report-link">
            <div className="report-icon">🚗</div>
            <div className="report-title">تقرير المركبات</div>
          </Link>
          <Link to="/reports/customers" className="report-link">
            <div className="report-icon">👥</div>
            <div className="report-title">تقرير العملاء</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;
