import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Table, Button, 
  Badge, Spinner, Alert, Form, InputGroup 
} from 'react-bootstrap';
import { FaSearch, FaMoneyBillWave, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { formatDate } from '../../utils/dateUtils';
import { API_BASE_URL } from '../../config';

const DueInstallments = () => {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [daysAhead, setDaysAhead] = useState(7);

  useEffect(() => {
    fetchDueInstallments();
  }, [daysAhead]);

  const fetchDueInstallments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/installments/due?days_ahead=${daysAhead}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstallments(response.data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء جلب بيانات الأقساط المستحقة');
      console.error('Error fetching due installments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayInstallment = async (id) => {
    if (window.confirm('هل أنت متأكد من تسجيل دفع هذا القسط؟')) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_BASE_URL}/api/installments/${id}/pay`, {
          payment_method: 'cash',
          payment_reference: `MANUAL-${Date.now()}`
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchDueInstallments();
      } catch (err) {
        setError('حدث خطأ أثناء تسجيل دفع القسط');
        console.error('Error paying installment:', err);
      }
    }
  };

  const filteredInstallments = installments.filter(installment => {
    return (
      (installment.Customer && installment.Customer.name && installment.Customer.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (installment.Company && installment.Company.name && installment.Company.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // حساب عدد الأيام المتبقية حتى تاريخ الاستحقاق
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // الحصول على لون الخلفية بناءً على عدد الأيام المتبقية
  const getRowClass = (dueDate) => {
    const daysRemaining = getDaysRemaining(dueDate);
    if (daysRemaining <= 0) return 'table-danger';
    if (daysRemaining <= 2) return 'table-warning';
    return '';
  };

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-warning text-white">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">
                <FaExclamationTriangle className="me-2" /> الأقساط المستحقة
              </h5>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="بحث عن عميل أو شركة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>عرض الأقساط المستحقة خلال</InputGroup.Text>
                <Form.Control
                  as="select"
                  value={daysAhead}
                  onChange={(e) => setDaysAhead(e.target.value)}
                >
                  <option value="3">3 أيام</option>
                  <option value="7">7 أيام</option>
                  <option value="14">14 يوم</option>
                  <option value="30">30 يوم</option>
                </Form.Control>
                <InputGroup.Text>القادمة</InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">جاري تحميل البيانات...</p>
            </div>
          ) : filteredInstallments.length === 0 ? (
            <Alert variant="info">
              لا توجد أقساط مستحقة خلال الفترة المحددة
            </Alert>
          ) : (
            <>
              <Alert variant="warning">
                <FaExclamationTriangle className="me-2" />
                يوجد {filteredInstallments.length} قسط مستحق خلال الـ {daysAhead} يوم القادمة
              </Alert>
              <Table responsive hover striped>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>العميل</th>
                    <th>الشركة</th>
                    <th>المبلغ</th>
                    <th>تاريخ الاستحقاق</th>
                    <th>الأيام المتبقية</th>
                    <th>رقم القسط</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstallments.map((installment, index) => (
                    <tr key={installment.id} className={getRowClass(installment.due_date)}>
                      <td>{index + 1}</td>
                      <td>
                        {installment.Customer ? installment.Customer.name : 'غير محدد'}
                      </td>
                      <td>
                        {installment.Company ? installment.Company.name : 'غير محدد'}
                      </td>
                      <td>{installment.amount} ريال</td>
                      <td>{formatDate(installment.due_date)}</td>
                      <td>
                        <Badge bg={getDaysRemaining(installment.due_date) <= 0 ? 'danger' : 
                              getDaysRemaining(installment.due_date) <= 2 ? 'warning' : 'info'}>
                          {getDaysRemaining(installment.due_date) <= 0 ? 'متأخر' : `${getDaysRemaining(installment.due_date)} يوم`}
                        </Badge>
                      </td>
                      <td>
                        {installment.installment_number} / {installment.total_installments}
                      </td>
                      <td>
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={() => handlePayInstallment(installment.id)}
                        >
                          تسجيل دفع
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DueInstallments;
