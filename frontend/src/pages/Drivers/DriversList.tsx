import React, { useState, useEffect } from 'react';
import { driversAPI } from '../../services/api';
import './DriversList.css';

interface Driver {
  id: number;
  name: string;
  phone: string;
  license_number: string;
  license_expiry: string;
  status: 'available' | 'on_duty' | 'on_leave';
  rating: number;
  nationality: string;
}

const DriversList: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        // في بيئة الاختبار، نستخدم البيانات الوهمية بدلاً من الاتصال بالخادم
        // في الإصدار النهائي، سيتم استبدال هذا بـ:
        // const response = await driversAPI.getAll({ status: statusFilter !== 'all' ? statusFilter : undefined });
        // setDrivers(response.data);
        
        // محاكاة طلب API
        setTimeout(() => {
          const mockDrivers: Driver[] = [
            { 
              id: 1, 
              name: 'محمد أحمد', 
              phone: '0501234567', 
              license_number: 'DL-123456',
              license_expiry: '2026-05-15',
              status: 'available',
              rating: 4.8,
              nationality: 'سعودي'
            },
            { 
              id: 2, 
              name: 'خالد عبدالله', 
              phone: '0567891234', 
              license_number: 'DL-789012',
              license_expiry: '2025-12-10',
              status: 'on_duty',
              rating: 4.5,
              nationality: 'مصري'
            },
            { 
              id: 3, 
              name: 'عمر سعيد', 
              phone: '0512345678', 
              license_number: 'DL-345678',
              license_expiry: '2026-03-22',
              status: 'available',
              rating: 4.9,
              nationality: 'سعودي'
            },
            { 
              id: 4, 
              name: 'سالم محمد', 
              phone: '0523456789', 
              license_number: 'DL-901234',
              license_expiry: '2025-08-05',
              status: 'on_leave',
              rating: 4.2,
              nationality: 'يمني'
            },
            { 
              id: 5, 
              name: 'فهد عبدالرحمن', 
              phone: '0534567890', 
              license_number: 'DL-567890',
              license_expiry: '2026-01-30',
              status: 'available',
              rating: 4.7,
              nationality: 'سعودي'
            },
          ];
          setDrivers(mockDrivers);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('خطأ في جلب بيانات السائقين:', err);
        setError('حدث خطأ أثناء جلب بيانات السائقين. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [statusFilter]);

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.license_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'متاح';
      case 'on_duty':
        return 'في مهمة';
      case 'on_leave':
        return 'في إجازة';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'on_duty':
        return 'status-on-duty';
      case 'on_leave':
        return 'status-on-leave';
      default:
        return '';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star full">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
    
    return <div className="rating">{stars} <span className="rating-value">({rating})</span></div>;
  };

  const handleAddDriver = () => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    alert('سيتم فتح نموذج إضافة سائق جديد');
  };

  const handleEditDriver = (id: number) => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    alert(`سيتم فتح نموذج تعديل السائق رقم ${id}`);
  };

  const handleViewDriver = (id: number) => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    alert(`سيتم عرض تفاصيل السائق رقم ${id}`);
  };

  const handleDeleteDriver = (id: number) => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا السائق؟')) {
      alert(`سيتم حذف السائق رقم ${id}`);
    }
  };

  if (loading) {
    return <div className="loading">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="drivers-list">
      <div className="page-header">
        <h1 className="page-title">إدارة السائقين</h1>
        <button className="add-button" onClick={handleAddDriver}>إضافة سائق جديد</button>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="بحث عن سائق..."
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
            <option value="available">متاح</option>
            <option value="on_duty">في مهمة</option>
            <option value="on_leave">في إجازة</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="drivers-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>رقم الهاتف</th>
              <th>رقم الرخصة</th>
              <th>تاريخ انتهاء الرخصة</th>
              <th>الجنسية</th>
              <th>الحالة</th>
              <th>التقييم</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td>{driver.name}</td>
                  <td>{driver.phone}</td>
                  <td>{driver.license_number}</td>
                  <td>{driver.license_expiry}</td>
                  <td>{driver.nationality}</td>
                  <td>
                    <span className={`status ${getStatusClass(driver.status)}`}>
                      {getStatusText(driver.status)}
                    </span>
                  </td>
                  <td>{renderStars(driver.rating)}</td>
                  <td className="actions">
                    <button className="action-button edit" onClick={() => handleEditDriver(driver.id)}>تعديل</button>
                    <button className="action-button view" onClick={() => handleViewDriver(driver.id)}>عرض</button>
                    <button className="action-button delete" onClick={() => handleDeleteDriver(driver.id)}>حذف</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="no-data">لا يوجد سائقين مطابقين للبحث</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriversList;
