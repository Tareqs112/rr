import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Table, Button, 
  Spinner, Alert, Form, InputGroup, Badge
} from 'react-bootstrap';
import { FaSearch, FaMoneyBillWave, FaUsers, FaChartBar } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';

const InstallmentSummary = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInstallmentSummary();
  }, []);

  const fetchInstallmentSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/installments/summary/customer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummaries(response.data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء جلب ملخص الأقساط');
      console.error('Error fetching installment summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSummaries = summaries.filter(summary => {
    return (
      summary.Customer && 
      summary.Customer.name && 
      summary.Customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // حساب نسبة السداد
  const calculatePaymentPercentage = (paidAmount, totalAmount) => {
    if (totalAmount === 0) return 0;
    return Math.round((paidAmount / totalAmount) * 100);
  };

  // الحصول على لون الشريط بناءً على نسبة السداد
  const getProgressBarVariant = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'info';
    if (percentage >= 30) return 'warning';
    return 'danger';
  };

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-info text-white">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">
                <FaChartBar className="me-2" /> ملخص الأقساط حسب العميل
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
                  placeholder="بحث عن عميل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">جاري تحميل البيانات...</p>
            </div>
          ) : filteredSummaries.length === 0 ? (
            <Alert variant="info">
              لا توجد بيانات متطابقة مع معايير البحث
            </Alert>
          ) : (
            <Table responsive hover striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>العميل</th>
                  <th>عدد الأقساط</th>
                  <th>المبلغ الإجمالي</th>
                  <th>المبلغ المدفوع</th>
                  <th>المبلغ المتبقي</th>
                  <th>نسبة السداد</th>
                </tr>
              </thead>
              <tbody>
                {filteredSummaries.map((summary, index) => {
                  const paymentPercentage = calculatePaymentPercentage(
                    parseFloat(summary.paid_amount || 0), 
                    parseFloat(summary.total_amount || 0)
                  );
                  
                  return (
                    <tr key={summary.customer_id}>
                      <td>{index + 1}</td>
                      <td>
                        {summary.Customer ? summary.Customer.name : 'غير محدد'}
                      </td>
                      <td>{summary.total_installments}</td>
                      <td>{parseFloat(summary.total_amount || 0).toFixed(2)} ريال</td>
                      <td>{parseFloat(summary.paid_amount || 0).toFixed(2)} ريال</td>
                      <td>{parseFloat(summary.pending_amount || 0).toFixed(2)} ريال</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1 me-2" style={{ height: '10px' }}>
                            <div 
                              className={`progress-bar bg-${getProgressBarVariant(paymentPercentage)}`}
                              role="progressbar"
                              style={{ width: `${paymentPercentage}%` }}
                              aria-valuenow={paymentPercentage}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <span>{paymentPercentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InstallmentSummary;
