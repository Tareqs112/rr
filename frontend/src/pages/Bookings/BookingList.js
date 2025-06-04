import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBookings, searchBookings } from '../../services/bookings';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(10);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      setBookings(data);
      setError(null);
    } catch (err) {
      setError('فشل في تحميل بيانات الحجوزات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const params = {};
      if (searchTerm) params.query = searchTerm;
      if (filterStatus) params.status = filterStatus;
      
      if (Object.keys(params).length > 0) {
        const data = await searchBookings(params);
        setBookings(data);
      } else {
        fetchBookings();
      }
      
      setCurrentPage(1);
    } catch (err) {
      setError('فشل في البحث عن الحجوزات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    fetchBookings();
  };

  // الحصول على الحجوزات الحالية
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);

  // تغيير الصفحة
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>قائمة الحجوزات</h2>
        <div className="actions">
          <Link to="/bookings/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> إضافة حجز جديد
          </Link>
        </div>
      </div>

      <div className="filter-section">
        <form onSubmit={handleSearch} className="form-row">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="بحث برقم الحجز، اسم العميل، أو رقم السيارة"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <select
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="confirmed">مؤكد</option>
              <option value="active">نشط</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary mr-2">
            بحث
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetFilters}>
            إعادة تعيين
          </button>
        </form>
      </div>

      {bookings.length === 0 ? (
        <div className="not-found">لا يوجد حجوزات للعرض</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>رقم الحجز</th>
                  <th>العميل</th>
                  <th>المركبة</th>
                  <th>تاريخ البداية</th>
                  <th>تاريخ النهاية</th>
                  <th>الحالة</th>
                  <th>المبلغ الإجمالي</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.map((booking, index) => (
                  <tr key={booking.id}>
                    <td>{indexOfFirstBooking + index + 1}</td>
                    <td>{booking.bookingNumber}</td>
                    <td>{booking.customerName}</td>
                    <td>{booking.vehicleInfo}</td>
                    <td>{formatDate(booking.startDate)}</td>
                    <td>{formatDate(booking.endDate)}</td>
                    <td>
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status === 'pending' && 'قيد الانتظار'}
                        {booking.status === 'confirmed' && 'مؤكد'}
                        {booking.status === 'active' && 'نشط'}
                        {booking.status === 'completed' && 'مكتمل'}
                        {booking.status === 'cancelled' && 'ملغي'}
                      </span>
                    </td>
                    <td>{booking.totalAmount} ريال</td>
                    <td>
                      <Link to={`/bookings/${booking.id}`} className="btn btn-sm btn-primary mr-2">
                        عرض
                      </Link>
                      <Link to={`/bookings/${booking.id}/edit`} className="btn btn-sm btn-secondary mr-2">
                        تعديل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ترقيم الصفحات */}
          {bookings.length > bookingsPerPage && (
            <div className="pagination">
              {Array.from({ length: Math.ceil(bookings.length / bookingsPerPage) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-light'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookingList;
