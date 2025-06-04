import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getCustomerById, updateCustomer } from '../../services/customers';

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
    licenseNumber: ''
  });
  
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const data = await getCustomerById(id);
        setCustomer(data);
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          idNumber: data.idNumber,
          licenseNumber: data.licenseNumber
        });
      } catch (err) {
        setError('فشل في تحميل بيانات العميل');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
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
      await updateCustomer(id, formData);
      setCustomer({ ...customer, ...formData });
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('فشل في تحديث بيانات العميل');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!customer) return <div className="not-found">لم يتم العثور على العميل</div>;

  return (
    <div className="customer-details">
      <div className="page-header">
        <h2>تفاصيل العميل</h2>
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
          <Link to="/customers" className="btn btn-secondary">
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
            <label>رقم الهوية</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
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
            <span className="value">{customer.name}</span>
          </div>
          <div className="detail-item">
            <span className="label">البريد الإلكتروني:</span>
            <span className="value">{customer.email}</span>
          </div>
          <div className="detail-item">
            <span className="label">رقم الهاتف:</span>
            <span className="value">{customer.phone}</span>
          </div>
          <div className="detail-item">
            <span className="label">العنوان:</span>
            <span className="value">{customer.address}</span>
          </div>
          <div className="detail-item">
            <span className="label">رقم الهوية:</span>
            <span className="value">{customer.idNumber}</span>
          </div>
          <div className="detail-item">
            <span className="label">رقم رخصة القيادة:</span>
            <span className="value">{customer.licenseNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
