import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getDriverById, updateDriver } from '../../services/drivers';

const DriverDetails = () => {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    licenseExpiry: '',
    status: '',
    notes: ''
  });
  
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        setLoading(true);
        const data = await getDriverById(id);
        setDriver(data);
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          licenseNumber: data.licenseNumber,
          licenseExpiry: data.licenseExpiry,
          status: data.status,
          notes: data.notes
        });
      } catch (err) {
        setError('فشل في تحميل بيانات السائق');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverDetails();
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
      await updateDriver(id, formData);
      setDriver({ ...driver, ...formData });
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('فشل في تحديث بيانات السائق');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!driver) return <div className="not-found">لم يتم العثور على السائق</div>;

  return (
    <div className="driver-details">
      <div className="page-header">
        <h2>تفاصيل السائق</h2>
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
          <Link to="/drivers" className="btn btn-secondary">
            العودة للقائمة
          </Link>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>الاسم</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>رقم الهاتف</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>العنوان</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>رقم رخصة القيادة</label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>تاريخ انتهاء الرخصة</label>
            <input
              type="date"
              name="licenseExpiry"
              value={formData.licenseExpiry}
              onChange={handleChange}
              required
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
              <option value="available">متاح</option>
              <option value="busy">مشغول</option>
              <option value="onLeave">في إجازة</option>
              <option value="inactive">غير نشط</option>
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
            <span className="label">الاسم:</span>
            <span className="value">{driver.name}</span>
          </div>
          <div className="detail-item">
            <span className="label">البريد الإلكتروني:</span>
            <span className="value">{driver.email}</span>
          </div>
          <div className="detail-item">
            <span className="label">رقم الهاتف:</span>
            <span className="value">{driver.phone}</span>
          </div>
          <div className="detail-item">
            <span className="label">العنوان:</span>
            <span className="value">{driver.address}</span>
          </div>
          <div className="detail-item">
            <span className="label">رقم رخصة القيادة:</span>
            <span className="value">{driver.licenseNumber}</span>
          </div>
          <div className="detail-item">
            <span className="label">تاريخ انتهاء الرخصة:</span>
            <span className="value">{driver.licenseExpiry}</span>
          </div>
          <div className="detail-item">
            <span className="label">الحالة:</span>
            <span className="value">
              {driver.status === 'available' && 'متاح'}
              {driver.status === 'busy' && 'مشغول'}
              {driver.status === 'onLeave' && 'في إجازة'}
              {driver.status === 'inactive' && 'غير نشط'}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">ملاحظات:</span>
            <span className="value">{driver.notes}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDetails;
