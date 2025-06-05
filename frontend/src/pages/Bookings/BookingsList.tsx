import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import './BookingsList.css';

interface Booking {
  id: number;
  booking_id: string;
  customer_name: string;
  vehicle: string;
  pickup_date: string;
  return_date: string;
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  payment_status: 'paid' | 'pending' | 'hold';
  total_amount: number;
}

const BookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        // في بيئة الاختبار، نستخدم البيانات الوهمية بدلاً من الاتصال بالخادم
        // في الإصدار النهائي، سيتم استبدال هذا بـ:
        // const response = await bookingsAPI.getAll({ status: statusFilter !== 'all' ? statusFilter : undefined });
        // setBookings(response.data);
        
        // محاكاة طلب API
        setTimeout(() => {
          const mockBookings: Booking[] = [
            { 
              id: 1, 
              booking_id: 'BK-123456', 
              customer_name: 'أحمد محمد', 
              vehicle: 'تويوتا كامري 2023', 
              pickup_date: '2025-06-05', 
              return_date: '2025-06-10', 
              status: 'confirmed', 
              payment_status: 'pending',
              total_amount: 1000
            },
            { 
              id: 2, 
              booking_id: 'BK-123457', 
              customer_name: 'سارة أحمد', 
              vehicle: 'هوندا أكورد 2024', 
              pickup_date: '2025-06-06', 
              return_date: '2025-06-12', 
              status: 'confirmed', 
              payment_status: 'paid',
              total_amount: 1200
            },
            { 
              id: 3, 
              booking_id: 'BK-123458', 
              customer_name: 'محمد علي', 
              vehicle: 'نيسان التيما 2023', 
              pickup_date: '2025-06-07', 
              return_date: '2025-06-14', 
              status: 'in_progress', 
              payment_status: 'paid',
              total_amount: 1400
            },
            { 
              id: 4, 
              booking_id: 'BK-123459', 
              customer_name: 'فاطمة خالد', 
              vehicle: 'هيونداي سوناتا 2022', 
              pickup_date: '2025-06-01', 
              return_date: '2025-06-03', 
              status: 'completed', 
              payment_status: 'paid',
              total_amount: 600
            },
            { 
              id: 5, 
              booking_id: 'BK-123460', 
              customer_name: 'عمر أحمد', 
              vehicle: 'شيفروليه تاهو 2024', 
              pickup_date: '2025-06-10', 
              return_date: '2025-06-15', 
              status: 'confirmed', 
              payment_status: 'hold',
              total_amount: 1750
            },
          ];
          setBookings(mockBookings);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('خطأ في جلب بيانات الحجوزات:', err);
        setError('حدث خطأ أثناء جلب بيانات الحجوزات. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
    };

    fetchBookings();
  }, [statusFilter]);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'مؤكد';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'in_progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'مدفوع';
      case 'pending':
        return 'معلق';
      case 'hold':
        return 'محجوز';
      default:
        return status;
    }
  };

  const getPaymentStatusClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'payment-paid';
      case 'pending':
        return 'payment-pending';
      case 'hold':
        return 'payment-hold';
      default:
        return '';
    }
  };

  const handleAddBooking = () => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    alert('سيتم فتح نموذج إضافة حجز جديد');
  };

  const handleEditBooking = (id: number) => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    alert(`سيتم فتح نموذج تعديل الحجز رقم ${id}`);
  };

  const handleViewBooking = (id: number) => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    alert(`سيتم عرض تفاصيل الحجز رقم ${id}`);
  };

  const handleDeleteBooking = (id: number) => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الحجز؟')) {
      alert(`سيتم حذف الحجز رقم ${id}`);
    }
  };

  if (loading) {
    return <div className="loading">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="bookings-list">
      <div className="page-header">
        <h1 className="page-title">إدارة الحجوزات</h1>
        <button className="add-button" onClick={handleAddBooking}>إضافة حجز جديد</button>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="بحث عن حجز..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <label>تصفية حسب الحالة:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">الكل</option>
            <option value="confirmed">مؤكد</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>رقم الحجز</th>
              <th>العميل</th>
              <th>السيارة</th>
              <th>تاريخ الاستلام</th>
              <th>تاريخ الإرجاع</th>
              <th>حالة الحجز</th>
              <th>حالة الدفع</th>
              <th>المبلغ الإجمالي</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.booking_id}</td>
                  <td>{booking.customer_name}</td>
                  <td>{booking.vehicle}</td>
                  <td>{booking.pickup_date}</td>
                  <td>{booking.return_date}</td>
                  <td>
                    <span className={`status ${getStatusClass(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-status ${getPaymentStatusClass(booking.payment_status)}`}>
                      {getPaymentStatusText(booking.payment_status)}
                    </span>
                  </td>
                  <td>{booking.total_amount} ريال</td>
                  <td className="actions">
                    <button className="action-button edit" onClick={() => handleEditBooking(booking.id)}>تعديل</button>
                    <button className="action-button view" onClick={() => handleViewBooking(booking.id)}>عرض</button>
                    <button className="action-button delete" onClick={() => handleDeleteBooking(booking.id)}>حذف</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="no-data">لا توجد حجوزات مطابقة للبحث</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsList;
