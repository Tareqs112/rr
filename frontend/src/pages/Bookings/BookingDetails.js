import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getBookingById, updateBooking } from '../../services/bookings';

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    driverId: '',
    startDate: '',
    endDate: '',
    totalAmount: '',
    status: '',
    paymentStatus: '',
    notes: ''
  });
  
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const data = await getBookingById(id);
        setBooking(data);
        setFormData({
          customerId: data.customerId,
          vehicleId: data.vehicleId,
          driverId: data.driverId,
          startDate: data.startDate,
          endDate: data.endDate,
          totalAmount: data.totalAmount,
          status: data.status,
          paymentStatus: data.paymentStatus,
          notes: data.notes
        });
      } catch (err) {
        setError('فشل في تحميل بيانات الحجز');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateBooking(id, formData);
      setBooking({ ...booking, ...formData });
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('فشل في تحديث بيانات الحجز');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!booking) return <div className="not-found">لم يتم العثور على الحجز</div>;

  return (
    <div className="booking-details">
      <div className="page-header">
        <h2>تفاصيل الحجز</h2>
        <div className="actions">
          {!isEditing ? (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              تعديل
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
              إلغاء
            </button>
          )}
          <Link to="/bookings" className="btn btn-secondary">
            العودة للقائمة
          </Link>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>العميل</label>
            <input
              type="text"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              required
              disabled
            />
          </div>
          <div className="form-group">
            <label>المركبة</label>
            <input
              type="text"
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              required
              disabled
            />
          </div>
          <div className="form-group">
            <label>السائق</label>
            <input
              type="text"
              name="driverId"
              value={formData.driverId}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>تاريخ البداية</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>تاريخ النهاية</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>المبلغ الإجمالي</label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>حالة الحجز</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="pending">قيد الانتظار</option>
              <option value="confirmed">مؤكد</option>
              <option value="active">نشط</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          <div className="form-group">
            <label>حالة الدفع</label>
            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              required
            >
              <option value="pending">قيد الانتظار</option>
              <option value="partial">مدفوع جزئياً</option>
              <option value="paid">مدفوع بالكامل</option>
              <option value="refunded">مسترد</option>
            </select>
          </div>
          <div className="form-group">
            <label>ملاحظات</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            حفظ التغييرات
          </button>
        </form>
      ) : (
        <div className="details-container">
          <div className="detail-item">
            <span className="label">رقم الحجز:</span>
            <span className="value">{booking.id}</span>
          </div>
          <div className="detail-item">
            <span className="label">العميل:</span>
            <span className="value">{booking.customerName}</span>
          </div>
          <div className="detail-item">
            <span className="label">المركبة:</span>
            <span className="value">{booking.vehicleName}</span>
          </div>
          <div className="detail-item">
            <span className="label">السائق:</span>
            <span className="value">{booking.driverName || 'لا يوجد'}</span>
          </div>
          <div className="detail-item">
            <span className="label">تاريخ البداية:</span>
            <span className="value">{booking.startDate}</span>
          </div>
          <div className="detail-item">
            <span className="label">تاريخ النهاية:</span>
            <span className="value">{booking.endDate}</span>
          </div>
          <div className="detail-item">
            <span className="label">المدة:</span>
            <span className="value">{booking.duration} يوم</span>
          </div>
          <div className="detail-item">
            <span className="label">المبلغ الإجمالي:</span>
            <span className="value">{booking.totalAmount}</span>
          </div>
          <div className="detail-item">
            <span className="label">حالة الحجز:</span>
            <span className="value">
              {booking.status === 'pending' && 'قيد الانتظار'}
              {booking.status === 'confirmed' && 'مؤكد'}
              {booking.status === 'active' && 'نشط'}
              {booking.status === 'completed' && 'مكتمل'}
              {booking.status === 'cancelled' && 'ملغي'}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">حالة الدفع:</span>
            <span className="value">
              {booking.paymentStatus === 'pending' && 'قيد الانتظار'}
              {booking.paymentStatus === 'partial' && 'مدفوع جزئياً'}
              {booking.paymentStatus === 'paid' && 'مدفوع بالكامل'}
              {booking.paymentStatus === 'refunded' && 'مسترد'}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">ملاحظات:</span>
            <span className="value">{booking.notes}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
