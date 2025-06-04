import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Table, Button, 
  Badge, Spinner, Alert, Form, InputGroup 
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import { formatDate } from '../../utils/dateUtils';
import { API_BASE_URL } from '../../config';

const InstallmentList = () => {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchInstallments();
  }, []);

  const fetchInstallments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/installments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstallments(response.data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء جلب بيانات الأقساط');
      console.error('Error fetching installments:', err);
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
        fetchInstallments();
      } catch (err) {
        setError('حدث خطأ أثناء تسجيل دفع القسط');
        console.error('Error paying installment:', err);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge bg="success">مدفوع</Badge>;
      case 'pending':
        return <Badge bg="warning">قيد الانتظار</Badge>;
      case 'overdue':
        return <Badge bg="danger">متأخر</Badge>;
      default:
        return <Badge bg="light">غير معروف</Badge>;
    }
  };

  const filteredInstallments = installments.filter(installment => {
    const matchesSearch = 
      (installment.Customer && installment.Customer.name && installment.Customer.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (installment.Company && installment.Company.name && installment.Company.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || installment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">
                <FaMoneyBillWave className="me-2" /> إدارة الأقساط
              </h5>
            </Col>
            <Col xs="auto">
              <Link to="/installments/plan/new">
                <Button variant="light" size="sm">
                  <FaPlus className="me-1" /> إنشاء خطة أقساط جديدة
                </Button>
              </Link>
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
              <Form.Select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">جميع الحالات</option>
                <option value="paid">مدفوع</option>
                <option value="pending">قيد الانتظار</option>
                <option value="overdue">متأخر</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="me-2"
                onClick={() => fetchInstallments()}
              >
                جميع الأقساط
              </Button>
              <Link to="/installments/due">
                <Button variant="outline-warning" size="sm" className="me-2">
                  الأقساط المستحقة
                </Button>
              </Link>
              <Link to="/installments/overdue">
                <Button variant="outline-danger" size="sm" className="me-2">
                  الأقساط المتأخرة
                </Button>
              </Link>
              <Link to="/installments/summary/customer">
                <Button variant="outline-info" size="sm">
                  ملخص حسب العميل
                </Button>
              </Link>
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
              لا توجد أقساط متطابقة مع معايير البحث
            </Alert>
          ) : (
            <Table responsive hover striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>العميل</th>
                  <th>الشركة</th>
                  <th>المبلغ</th>
                  <th>تاريخ الاستحقاق</th>
                  <th>رقم القسط</th>
                  <th>الحالة</th>
                  <th>تاريخ الدفع</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstallments.map((installment, index) => (
                  <tr key={installment.id}>
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
                      {installment.installment_number} / {installment.total_installments}
                    </td>
                    <td>{getStatusBadge(installment.status)}</td>
                    <td>
                      {installment.payment_date ? formatDate(installment.payment_date) : '-'}
                    </td>
                    <td>
                      <Link to={`/installments/${installment.id}`}>
                        <Button variant="info" size="sm" className="me-1">
                          عرض
                        </Button>
                      </Link>
                      {installment.status === 'pending' && (
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={() => handlePayInstallment(installment.id)}
                        >
                          تسجيل دفع
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InstallmentList;
