import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Table, Button, 
  Badge, Spinner, Alert, Tabs, Tab 
} from 'react-bootstrap';
import { FaUser, FaBuilding, FaMoneyBillWave, FaCalendarAlt, FaFileInvoice } from 'react-icons/fa';
import { formatDate } from '../../utils/dateUtils';
import { API_BASE_URL } from '../../config';

const InstallmentDetails = () => {
  const { id } = useParams();
  const [installment, setInstallment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedInstallments, setRelatedInstallments] = useState([]);

  useEffect(() => {
    fetchInstallmentDetails();
  }, [id]);

  const fetchInstallmentDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/installments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setInstallment(response.data);
      
      // جلب الأقساط المرتبطة (من نفس خطة الأقساط)
      if (response.data.customer_id) {
        const relatedResponse = await axios.get(`${API_BASE_URL}/api/installments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const filtered = relatedResponse.data.filter(item => 
          item.customer_id === response.data.customer_id && 
          item.total_installments === response.data.total_installments
        );
        
        setRelatedInstallments(filtered);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching installment details:', err);
      setError('حدث خطأ أثناء جلب تفاصيل القسط');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInstallment = async () => {
    if (window.confirm('هل أنت متأكد من تسجيل دفع هذا القسط؟')) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_BASE_URL}/api/installments/${id}/pay`, {
          payment_method: 'cash',
          payment_reference: `MANUAL-${Date.now()}`
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchInstallmentDetails();
      } catch (err) {
        console.error('Error paying installment:', err);
        setError('حدث خطأ أثناء تسجيل دفع القسط');
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

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">جاري تحميل البيانات...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!installment) {
    return (
      <Container className="py-5">
        <Alert variant="info">لم يتم العثور على بيانات القسط</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaMoneyBillWave className="me-2" /> تفاصيل القسط
          </h5>
        </Card.Header>
        <Card.Body>
          <Tabs defaultActiveKey="details" className="mb-4">
            <Tab eventKey="details" title="تفاصيل القسط">
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">
                        <FaFileInvoice className="me-2" /> معلومات القسط
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <Table borderless>
                        <tbody>
                          <tr>
                            <th>رقم القسط:</th>
                            <td>{installment.installment_number} من {installment.total_installments}</td>
                          </tr>
                          <tr>
                            <th>المبلغ:</th>
                            <td>{installment.amount} ريال</td>
                          </tr>
                          <tr>
                            <th>تاريخ الاستحقاق:</th>
                            <td>{formatDate(installment.due_date)}</td>
                          </tr>
                          <tr>
                            <th>الحالة:</th>
                            <td>{getStatusBadge(installment.status)}</td>
                          </tr>
                          <tr>
                            <th>تاريخ الدفع:</th>
                            <td>{installment.payment_date ? formatDate(installment.payment_date) : 'لم يتم الدفع بعد'}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">
                        <FaUser className="me-2" /> معلومات العميل
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      {installment.Customer ? (
                        <Table borderless>
                          <tbody>
                            <tr>
                              <th>اسم العميل:</th>
                              <td>{installment.Customer.name}</td>
                            </tr>
                            <tr>
                              <th>رقم الهاتف:</th>
                              <td>{installment.Customer.phone}</td>
                            </tr>
                            <tr>
                              <th>البريد الإلكتروني:</th>
                              <td>{installment.Customer.email}</td>
                            </tr>
                            <tr>
                              <th>العنوان:</th>
                              <td>{installment.Customer.address || 'غير متوفر'}</td>
                            </tr>
                          </tbody>
                        </Table>
                      ) : (
                        <Alert variant="info">لا توجد معلومات عن العميل</Alert>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {installment.Company && (
                <Card className="mb-4">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">
                      <FaBuilding className="me-2" /> معلومات الشركة
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Table borderless>
                      <tbody>
                        <tr>
                          <th>اسم الشركة:</th>
                          <td>{installment.Company.name}</td>
                        </tr>
                        <tr>
                          <th>رقم الهاتف:</th>
                          <td>{installment.Company.phone}</td>
                        </tr>
                        <tr>
                          <th>البريد الإلكتروني:</th>
                          <td>{installment.Company.email}</td>
                        </tr>
                        <tr>
                          <th>العنوان:</th>
                          <td>{installment.Company.address || 'غير متوفر'}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}

              {installment.status === 'pending' && (
                <div className="text-center mt-4">
                  <Button 
                    variant="success" 
                    size="lg"
                    onClick={handlePayInstallment}
                  >
                    <FaMoneyBillWave className="me-2" /> تسجيل دفع القسط
                  </Button>
                </div>
              )}
            </Tab>
            <Tab eventKey="related" title="الأقساط المرتبطة">
              {relatedInstallments.length > 0 ? (
                <Table responsive hover striped>
                  <thead>
                    <tr>
                      <th>رقم القسط</th>
                      <th>المبلغ</th>
                      <th>تاريخ الاستحقاق</th>
                      <th>الحالة</th>
                      <th>تاريخ الدفع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatedInstallments.map((item) => (
                      <tr key={item.id} className={item.id === parseInt(id) ? 'table-primary' : ''}>
                        <td>{item.installment_number} من {item.total_installments}</td>
                        <td>{item.amount} ريال</td>
                        <td>{formatDate(item.due_date)}</td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td>{item.payment_date ? formatDate(item.payment_date) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">لا توجد أقساط مرتبطة</Alert>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InstallmentDetails;
