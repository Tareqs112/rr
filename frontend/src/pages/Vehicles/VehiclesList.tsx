import React, { useState, useEffect } from 'react';
import { vehiclesAPI } from '../../services/api';
import './VehiclesList.css';

interface Vehicle {
  id: number;
  license_plate: string;
  model: string;
  make: string;
  year: number;
  color: string;
  status: 'available' | 'booked' | 'maintenance';
  daily_rate: number;
}

const VehiclesList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        // في بيئة الاختبار، نستخدم البيانات الوهمية بدلاً من الاتصال بالخادم
        // في الإصدار النهائي، سيتم استبدال هذا بـ:
        // const response = await vehiclesAPI.getAll({ status: statusFilter !== 'all' ? statusFilter : undefined });
        // setVehicles(response.data);
        
        // محاكاة طلب API
        setTimeout(() => {
          const mockVehicles: Vehicle[] = [
            { id: 1, license_plate: 'أ ب ج 1234', model: 'كامري', make: 'تويوتا', year: 2023, color: 'أبيض', status: 'available', daily_rate: 200 },
            { id: 2, license_plate: 'د هـ و 5678', model: 'أكورد', make: 'هوندا', year: 2024, color: 'أسود', status: 'booked', daily_rate: 250 },
            { id: 3, license_plate: 'ز ح ط 9012', model: 'التيما', make: 'نيسان', year: 2023, color: 'فضي', status: 'available', daily_rate: 220 },
            { id: 4, license_plate: 'ي ك ل 3456', model: 'سوناتا', make: 'هيونداي', year: 2022, color: 'أزرق', status: 'maintenance', daily_rate: 180 },
            { id: 5, license_plate: 'م ن س 7890', model: 'تاهو', make: 'شيفروليه', year: 2024, color: 'أسود', status: 'available', daily_rate: 350 },
          ];
          setVehicles(mockVehicles);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('خطأ في جلب بيانات السيارات:', err);
        setError('حدث خطأ أثناء جلب بيانات السيارات. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [statusFilter]);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'متاحة';
      case 'booked':
        return 'محجوزة';
      case 'maintenance':
        return 'صيانة';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'booked':
        return 'status-booked';
      case 'maintenance':
        return 'status-maintenance';
      default:
        return '';
    }
  };

  const handleAddVehicle = () => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    alert('سيتم فتح نموذج إضافة سيارة جديدة');
  };

  const handleEditVehicle = (id: number) => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    alert(`سيتم فتح نموذج تعديل السيارة رقم ${id}`);
  };

  const handleViewVehicle = (id: number) => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    alert(`سيتم عرض تفاصيل السيارة رقم ${id}`);
  };

  const handleDeleteVehicle = (id: number) => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه السيارة؟')) {
      alert(`سيتم حذف السيارة رقم ${id}`);
    }
  };

  if (loading) {
    return <div className="loading">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="vehicles-list">
      <div className="page-header">
        <h1 className="page-title">إدارة السيارات</h1>
        <button className="add-button" onClick={handleAddVehicle}>إضافة سيارة جديدة</button>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="بحث عن سيارة..."
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
            <option value="available">متاحة</option>
            <option value="booked">محجوزة</option>
            <option value="maintenance">صيانة</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>رقم اللوحة</th>
              <th>الطراز</th>
              <th>الشركة المصنعة</th>
              <th>السنة</th>
              <th>اللون</th>
              <th>الحالة</th>
              <th>السعر اليومي</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.license_plate}</td>
                  <td>{vehicle.model}</td>
                  <td>{vehicle.make}</td>
                  <td>{vehicle.year}</td>
                  <td>{vehicle.color}</td>
                  <td>
                    <span className={`status ${getStatusClass(vehicle.status)}`}>
                      {getStatusText(vehicle.status)}
                    </span>
                  </td>
                  <td>{vehicle.daily_rate} ريال</td>
                  <td className="actions">
                    <button className="action-button edit" onClick={() => handleEditVehicle(vehicle.id)}>تعديل</button>
                    <button className="action-button view" onClick={() => handleViewVehicle(vehicle.id)}>عرض</button>
                    <button className="action-button delete" onClick={() => handleDeleteVehicle(vehicle.id)}>حذف</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="no-data">لا توجد سيارات مطابقة للبحث</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehiclesList;
