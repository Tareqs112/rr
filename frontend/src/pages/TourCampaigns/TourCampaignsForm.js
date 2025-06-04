import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Form, Button, 
  Spinner, Alert, InputGroup 
} from 'react-bootstrap';
import { FaSave, FaCalendarAlt, FaMoneyBillWave, FaUsers } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';

const TourCampaignForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    description: '',
    max_participants: 20,
    price_per_person: 0,
    itinerary: '',
    company_id: '',
    status: 'planned'
  });
  
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    fetchCompanies();
    if (isEditMode) {
      fetchCampaignData();
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
  
  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/tour-campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // تنسيق التواريخ للاستخدام في حقول التاريخ
      const campaign = response.data;
      const formattedStartDate = campaign.start_date ? campaign.start_date.split('T')[0] : '';
      const formattedEndDate = campaign.end_date ? campaign.end_date.split('T')[0] : '';
      
      setFormData({
        name: campaign.name || '',
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        description: campaign.description || '',
        max_participants: campaign.max_participants || 20,
        price_per_person: campaign.price_per_person || 0,
        itinerary: campaign.itinerary || '',
        company_id: campaign.company_id || '',
        status: campaign.status || 'planned'
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching campaign data:', err);
      setError('حدث خطأ أثناء جلب بيانات الحملة السياحية');
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
        await axios.put(`${API_BASE_URL}/api/tour-campaigns/${id}`, formData, { headers });
        setSuccess('تم تحديث الحملة السياحية بنجاح');
      } else {
        await axios.post(`${API_BASE_URL}/api/tour-campaigns`, formData, { headers });
        setSuccess('تم إنشاء الحملة السياحية بنجاح');
        // إعادة تعيين النموذج بعد الإنشاء الناجح
        if (!isEditMode) {
          setFormData({
            name: '',
            start_date: '',
            end_date: '',
            description: '',
            max_participants: 20,
            price_per_person: 0,
            itinerary: '',
            company_id: '',
            status: 'planned'
          });
        }
      }
      
      // الانتقال إلى صفحة قائمة الحملات بعد ثانيتين
      setTimeout(() => {
        navigate('/tour-campaigns');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('حدث خطأ أثناء حفظ بيانات الحملة السياحية');
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
            <FaCalendarAlt className="me-2" />
            {isEditMode ? 'تعديل حملة سياحية' : 'إنشاء حملة سياحية جديدة'}
          </h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>اسم الحملة السياحية</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="أدخل اسم الحملة السياحية"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>الشركة المنظمة</Form.Label>
                  <Form.Select
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">اختر الشركة</option>
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
                  <Form.Label>
                    <FaUsers className="me-1" /> الحد الأقصى للمشاركين
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaMoneyBillWave className="me-1" /> السعر للفرد (ريال)
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      name="price_per_person"
                      value={formData.price_per_person}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                    />
                    <InputGroup.Text>ريال</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>وصف الحملة السياحية</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="أدخل وصفاً تفصيلياً للحملة السياحية"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>جدول الرحلة</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="itinerary"
                value={formData.itinerary}
                onChange={handleChange}
                placeholder="أدخل جدول الرحلة التفصيلي (يوم بيوم)"
              />
            </Form.Group>
            
            {isEditMode && (
              <Form.Group className="mb-3">
                <Form.Label>حالة الحملة</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="planned">مخطط لها</option>
                  <option value="active">نشطة</option>
                  <option value="completed">مكتملة</option>
                  <option value="cancelled">ملغاة</option>
                </Form.Select>
              </Form.Group>
            )}
            
            <div className="d-flex justify-content-end mt-4">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={() => navigate('/tour-campaigns')}
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
                    {isEditMode ? 'حفظ التغييرات' : 'إنشاء الحملة'}
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

export default TourCampaignForm;
