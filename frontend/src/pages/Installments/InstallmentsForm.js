import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Form, Button, 
  Spinner, Alert, InputGroup 
} from 'react-bootstrap';
import { FaSave, FaMoneyBillWave, FaCalendarAlt, FaUser, FaBuilding } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';

const InstallmentPlanForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    payment_id: '',
    customer_id: '',
    company_id: '',
    total_amount: 0,
    number_of_installments: 3,
    first_payment_date: '',
    payment_interval_days: 30
  });
  
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    fetchCustomers();
    fetchCompanies();
    fetchPayments();
    
    // تعيين تاريخ اليوم كتاريخ افتراضي للدفعة الأولى
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      first_payment_date: formattedDate
    }));
  }, []);
  
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('حدث خطأ أثناء جلب بيانات العملاء');
    }
  };
  
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
  
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('حدث خطأ أثناء جلب بيانات المدفوعات');
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
      
      await axios.post(`${API_BASE_URL}/api/installments/plan`, formData, { headers });
      setSuccess('تم إنشاء خطة الأقساط بنجاح');
      
      // إعادة تعيين النموذج بعد الإنشاء الناجح
      setFormData({
        payment_id: '',
        customer_id: '',
        company_id: '',
        total_amount: 0,
        number_of_installments: 3,
        first_payment_date: formData.first_payment_date,
        payment_interval_days: 30
      });
      
      // الانتقال إلى صفحة قائمة الأقساط بعد ثانيتين
      setTimeout(() => {
        navigate('/installments');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('حدث خطأ أثناء إنشاء خطة الأقساط');
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
            <FaMoneyBillWave className="me-2" />
            إنشاء خطة أقساط جديدة
          </h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaUser className="me-1" /> العميل
                  </Form.Label>
                  <Form.Select
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">اختر العميل</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaBuilding className="me-1" /> الشركة
                  </Form.Label>
                  <Form.Select
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleChange}
                  >
                    <option value="">اختر الشركة (اختياري)</option>
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
                  <Form.Label>المدفوعة المرتبطة (اختياري)</Form.Label>
                  <Form.Select
                    name="payment_id"
                    value={formData.payment_id}
                    onChange={handleChange}
                  >
                    <option value="">بدون ربط بمدفوعة</option>
                    {payments.map(payment => (
                      <option key={payment.id} value={payment.id}>
                        {payment.id} - {payment.amount} ريال
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaMoneyBillWave className="me-1" /> المبلغ الإجمالي (ريال)
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      name="total_amount"
                      value={formData.total_amount}
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
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>عدد الأقساط</Form.Label>
                  <Form.Control
                    type="number"
                    name="number_of_installments"
                    value={formData.number_of_installments}
                    onChange={handleChange}
                    required
                    min="1"
                    max="36"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaCalendarAlt className="me-1" /> تاريخ الدفعة الأولى
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="first_payment_date"
                    value={formData.first_payment_date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>الفترة بين الأقساط (بالأيام)</Form.Label>
              <Form.Select
                name="payment_interval_days"
                value={formData.payment_interval_days}
                onChange={handleChange}
                required
              >
                <option value="30">شهرياً (30 يوم)</option>
                <option value="15">نصف شهري (15 يوم)</option>
                <option value="7">أسبوعياً (7 أيام)</option>
                <option value="90">ربع سنوي (90 يوم)</option>
                <option value="180">نصف سنوي (180 يوم)</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex justify-content-end mt-4">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={() => navigate('/installments')}
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
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <FaSave className="me-1" />
                    إنشاء خطة الأقساط
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

export default InstallmentPlanForm;
