import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Form, Button, 
  Spinner, Alert, InputGroup 
} from 'react-bootstrap';
import { FaSave, FaUserTie, FaLanguage, FaStar } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';

const TourGuideForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    languages: '',
    specialties: '',
    years_experience: 0,
    certification: '',
    photo_url: '',
    status: 'available',
    rating: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    if (isEditMode) {
      fetchGuideData();
    }
  }, [id]);
  
  const fetchGuideData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/tour-guides/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        email: response.data.email || '',
        languages: response.data.languages || '',
        specialties: response.data.specialties || '',
        years_experience: response.data.years_experience || 0,
        certification: response.data.certification || '',
        photo_url: response.data.photo_url || '',
        status: response.data.status || 'available',
        rating: response.data.rating || 0
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching guide data:', err);
      setError('حدث خطأ أثناء جلب بيانات المرشد السياحي');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/api/tour-guides/${id}`, formData, { headers });
        setSuccess('تم تحديث بيانات المرشد السياحي بنجاح');
      } else {
        await axios.post(`${API_BASE_URL}/api/tour-guides`, formData, { headers });
        setSuccess('تم إضافة المرشد السياحي بنجاح');
        // إعادة تعيين النموذج بعد الإنشاء الناجح
        if (!isEditMode) {
          setFormData({
            name: '',
            phone: '',
            email: '',
            languages: '',
            specialties: '',
            years_experience: 0,
            certification: '',
            photo_url: '',
            status: 'available',
            rating: 0
          });
        }
      }
      
      // الانتقال إلى صفحة قائمة المرشدين بعد ثانيتين
      setTimeout(() => {
        navigate('/tour-guides');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('حدث خطأ أثناء حفظ بيانات المرشد السياحي');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">جاري تحميل البيانات...</p>
      </Container>
    );
  }
  
  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaUserTie className="me-2" />
            {isEditMode ? 'تعديل بيانات المرشد السياحي' : 'إضافة مرشد سياحي جديد'}
          </h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>الاسم الكامل</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="أدخل اسم المرشد السياحي"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>رقم الهاتف</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="أدخل رقم الهاتف"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>البريد الإلكتروني</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>سنوات الخبرة</Form.Label>
                  <Form.Control
                    type="number"
                    name="years_experience"
                    value={formData.years_experience}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaLanguage className="me-1" /> اللغات
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    required
                    placeholder="أدخل اللغات التي يتقنها المرشد (مثال: العربية، الإنجليزية، الفرنسية)"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>التخصصات</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="specialties"
                value={formData.specialties}
                onChange={handleChange}
                required
                placeholder="أدخل تخصصات المرشد السياحي (مثال: الآثار التاريخية، الطبيعة، الثقافة المحلية)"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>الشهادات والمؤهلات</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="certification"
                value={formData.certification}
                onChange={handleChange}
                placeholder="أدخل الشهادات والمؤهلات التي يحملها المرشد"
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>رابط الصورة الشخصية</Form.Label>
                  <Form.Control
                    type="text"
                    name="photo_url"
                    value={formData.photo_url}
                    onChange={handleChange}
                    placeholder="أدخل رابط الصورة الشخصية (اختياري)"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>الحالة</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="available">متاح</option>
                    <option value="busy">مشغول</option>
                    <option value="on_leave">في إجازة</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            {isEditMode && (
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaStar className="me-1" /> التقييم (من 5)
                </Form.Label>
                <Form.Control
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </Form.Group>
            )}
            
            <div className="d-flex justify-content-end mt-4">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={() => navigate('/tour-guides')}
                disabled={submitting}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-1"
                    />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <FaSave className="me-1" />
                    {isEditMode ? 'حفظ التغييرات' : 'إضافة المرشد'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TourGuideForm;
