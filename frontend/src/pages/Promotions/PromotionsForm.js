import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Form, Button, 
  Spinner, Alert, InputGroup 
} from 'react-bootstrap';
import { FaSave, FaGift, FaPercentage, FaMoneyBillWave } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';

const PromotionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_booking_value: 0,
    max_discount_amount: 0,
    company_id: '',
    applicable_services: '',
    is_active: true
  });
  
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    fetchCompanies();
    if (isEditMode) {
      fetchPromotionData();
    }
  }, [id]);
  
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(response.data);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('حدث خطأ أثناء جلب بيانات الشركات');
    }
  };
  
  const fetchPromotionData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/promotions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // تنسيق التواريخ للاستخدام في حقول التاريخ
      const promotion = response.data;
      const formattedStartDate = promotion.start_date ? promotion.start_date.split('T')[0] : '';
      const formattedEndDate = promotion.end_date ? promotion.end_date.split('T')[0] : '';
      
      setFormData({
        name: promotion.name || '',
        description: promotion.description || '',
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        discount_type: promotion.discount_type || 'percentage',
        discount_value: promotion.discount_value || 0,
        min_booking_value: promotion.min_booking_value || 0,
        max_discount_amount: promotion.max_discount_amount || 0,
        company_id: promotion.company_id || '',
        applicable_services: promotion.applicable_services || '',
        is_active: promotion.is_active !== undefined ? promotion.is_active : true
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching promotion data:', err);
      setError('حدث خطأ أثناء جلب بيانات العرض');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
        await axios.put(`${API_BASE_URL}/api/promotions/${id}`, formData, { headers });
        setSuccess('تم تحديث العرض بنجاح');
      } else {
        await axios.post(`${API_BASE_URL}/api/promotions`, formData, { headers });
        setSuccess('تم إنشاء العرض بنجاح');
        // إعادة تعيين النموذج بعد الإنشاء الناجح
        if (!isEditMode) {
          setFormData({
            name: '',
            description: '',
            start_date: '',
            end_date: '',
            discount_type: 'percentage',
            discount_value: 0,
            min_booking_value: 0,
            max_discount_amount: 0,
            company_id: '',
            applicable_services: '',
            is_active: true
          });
        }
      }
      
      // الانتقال إلى صفحة قائمة العروض بعد ثانيتين
      setTimeout(() => {
        navigate('/promotions');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('حدث خطأ أثناء حفظ بيانات العرض');
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
            <FaGift className="me-2" />
            {isEditMode ? 'تعديل عرض' : 'إنشاء عرض جديد'}
          </h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>اسم العرض</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="أدخل اسم العرض"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>الشركة</Form.Label>
                  <Form.Select
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleChange}
                  >
                    <option value="">جميع الشركات</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>تاريخ البداية</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>تاريخ النهاية</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>نوع الخصم</Form.Label>
                  <Form.Select
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="percentage">نسبة مئوية</option>
                    <option value="fixed">مبلغ ثابت</option>
                    <option value="free_service">خدمة مجانية</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {formData.discount_type === 'percentage' ? (
                      <><FaPercentage className="me-1" /> قيمة الخصم (%)</>
                    ) : formData.discount_type === 'fixed' ? (
                      <><FaMoneyBillWave className="me-1" /> قيمة الخصم (ريال)</>
                    ) : (
                      'وصف الخدمة المجانية'
                    )}
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={formData.discount_type === 'free_service' ? 'text' : 'number'}
                      name="discount_value"
                      value={formData.discount_value}
                      onChange={handleChange}
                      required
                      min="0"
                      step={formData.discount_type === 'percentage' ? '0.01' : '1'}
                    />
                    {formData.discount_type === 'percentage' && (
                      <InputGroup.Text>%</InputGroup.Text>
                    )}
                    {formData.discount_type === 'fixed' && (
                      <InputGroup.Text>ريال</InputGroup.Text>
                    )}
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            {formData.discount_type === 'percentage' && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>الحد الأدنى لقيمة الحجز (ريال)</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        name="min_booking_value"
                        value={formData.min_booking_value}
                        onChange={handleChange}
                        min="0"
                        step="1"
                      />
                      <InputGroup.Text>ريال</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>الحد الأقصى لقيمة الخصم (ريال)</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        name="max_discount_amount"
                        value={formData.max_discount_amount}
                        onChange={handleChange}
                        min="0"
                        step="1"
                      />
                      <InputGroup.Text>ريال</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>وصف العرض</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="أدخل وصفاً تفصيلياً للعرض"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>الخدمات المشمولة في العرض</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="applicable_services"
                value={formData.applicable_services}
                onChange={handleChange}
                placeholder="أدخل الخدمات التي يشملها العرض (مثال: تأجير السيارات، الحجوزات الفندقية)"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="is_active"
                name="is_active"
                label="العرض نشط"
                checked={formData.is_active}
                onChange={handleChange}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end mt-4">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={() => navigate('/promotions')}
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
                    {isEditMode ? 'حفظ التغييرات' : 'إنشاء العرض'}
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

export default PromotionForm;
