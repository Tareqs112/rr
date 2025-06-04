import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getVehicleById, updateVehicle } from '../../services/vehicles';

const VehicleDetails = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    color: '',
    status: '',
    dailyRate: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    features: ''
  });
  
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const data = await getVehicleById(id);
        setVehicle(data);
        setFormData({
          make: data.make,
          model: data.model,
          year: data.year,
          licensePlate: data.licensePlate,
          color: data.color,
          status: data.status,
          dailyRate: data.dailyRate,
          mileage: data.mileage,
          fuelType: data.fuelType,
          transmission: data.transmission,
          features: data.features
        });
      } catch (err) {
        setError('فشل في تحميل بيانات المركبة');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
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
      await updateVehicle(id, formData);
      setVehicle({ ...vehicle, ...formData });
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('فشل في تحديث بيانات المركبة');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!vehicle) return <div className="not-found">لم يتم العثور على المركبة</div>;

  return (
    <div className="vehicle-details">
      <div className="page-header">
        <h2>تفاصيل المركبة</h2>
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
          <Link to="/vehicles" className="btn btn-secondary">
            العودة للقائمة
          </Link>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>الشركة المصنعة</label>
            <input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>الموديل</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>سنة الصنع</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>رقم اللوحة</label>
            <input
              type="text"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>اللون</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>الحالة</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="available">متاحة</option>
              <option value="rented">مؤجرة</option>
              <option value="maintenance">في الصيانة</option>
              <option value="unavailable">غير متاحة</option>
            </select>
          </div>
          <div className="form-group">
            <label>السعر اليومي</label>
            <input
              type="number"
              name="dailyRate"
              value={formData.dailyRate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>عداد المسافة (كم)</label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>نوع الوقود</label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
            >
              <option value="petrol">بنزين</option>
              <option value="diesel">ديزل</option>
              <option value="electric">كهربائي</option>
              <option value="hybrid">هجين</option>
            </select>
          </div>
          <div className="form-group">
            <label>ناقل الحركة</label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
            >
              <option value="automatic">أوتوماتيك</option>
              <option value="manual">يدوي</option>
            </select>
          </div>
          <div className="form-group">
            <label>المميزات</label>
            <textarea
              name="features"
              value={formData.features}
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
            <span className="label">الشركة المصنعة:</span>
            <span className="value">{vehicle.make}</span>
          </div>
          <div className="detail-item">
            <span className="label">الموديل:</span>
            <span className="value">{vehicle.model}</span>
          </div>
          <div className="detail-item">
            <span className="label">سنة الصنع:</span>
            <span className="value">{vehicle.year}</span>
          </div>
          <div className="detail-item">
            <span className="label">رقم اللوحة:</span>
            <span className="value">{vehicle.licensePlate}</span>
          </div>
          <div className="detail-item">
            <span className="label">اللون:</span>
            <span className="value">{vehicle.color}</span>
          </div>
          <div className="detail-item">
            <span className="label">الحالة:</span>
            <span className="value">
              {vehicle.status === 'available' && 'متاحة'}
              {vehicle.status === 'rented' && 'مؤجرة'}
              {vehicle.status === 'maintenance' && 'في الصيانة'}
              {vehicle.status === 'unavailable' && 'غير متاحة'}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">السعر اليومي:</span>
            <span className="value">{vehicle.dailyRate}</span>
          </div>
          <div className="detail-item">
            <span className="label">عداد المسافة (كم):</span>
            <span className="value">{vehicle.mileage}</span>
          </div>
          <div className="detail-item">
            <span className="label">نوع الوقود:</span>
            <span className="value">
              {vehicle.fuelType === 'petrol' && 'بنزين'}
              {vehicle.fuelType === 'diesel' && 'ديزل'}
              {vehicle.fuelType === 'electric' && 'كهربائي'}
              {vehicle.fuelType === 'hybrid' && 'هجين'}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">ناقل الحركة:</span>
            <span className="value">
              {vehicle.transmission === 'automatic' && 'أوتوماتيك'}
              {vehicle.transmission === 'manual' && 'يدوي'}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">المميزات:</span>
            <span className="value">{vehicle.features}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetails;
