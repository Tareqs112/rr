import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Table, Button, 
  Badge, Spinner, Alert, Tabs, Tab 
} from 'react-bootstrap';
import { FaGift, FaPercentage, FaMoneyBillWave, FaCalendarAlt, FaBuilding } from 'react-icons/fa';
import { formatDate } from '../../utils/dateUtils';
import { API_BASE_URL } from '../../config';

const PromotionDetails = () => {
  const { id } = useParams();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usageStats, setUsageStats] = useState({
    total_uses: 0,
    total_discount_amount: 0,
    average_discount: 0
  });

  useEffect(() => {
    fetchPromotionDetails();
  }, [id]);

  const fetchPromotionDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/promotions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPromotion(response.data);
      
      // جلب إحصائيات استخدام العرض (يمكن تنفيذ هذا في الخلفية لاحقاً)
      try {
        const statsResponse = await axios.get(`${API_BASE_URL}/api/promotions/${id}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsageStats(statsResponse.data);
      } catch (statsErr) {
        console.error('Error fetching promotion stats:', statsErr);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching promotion details:', err);
      setError('حدث خطأ أثناء جلب تفاصيل العرض');
    } finally {
      setLoading(false);
    }
  };

  const getDiscountTypeLabel = (type) => {
    switch (type) {
      case 'percentage':
        return <Badge bg="info">نسبة مئوية</Badge>;
      case 'fixed':
        return <Badge bg="primary">مبلغ ثابت</Badge>;
      case 'free_service':
        return <Badge bg="success">خدمة مجانية</Badge>;
      default:
        return <Badge bg="light">غير معروف</Badge>;
    }
  };

  // حساب عدد الأيام المتبقية للعرض
  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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

  if (!promotion) {
    return (
      <Container className="py-5">
        <Alert variant="info">لم يتم العثور على بيانات العرض</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaGift className="me-2" /> تفاصيل العرض
          </h5>
        </Card.Header>
        <Card.Body>
          <Tabs defaultActiveKey="details" className="mb-4">
            <Tab eventKey="details" title="تفاصيل العرض">
              <Row className="mb-4">
                <Col md={8}>
                  <Card className="h-100">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">معلومات العرض</h6>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <Table borderless>
                            <tbody>
                              <tr>
                                <th width="40%">اسم العرض:</th>
                                <td>{promotion.name}</td>
                              </tr>
                              <tr>
                                <th>تاريخ البداية:</th>
                                <td>{formatDate(promotion.start_date)}</td>
                              </tr>
                              <tr>
                                <th>تاريخ النهاية:</th>
                                <td>{formatDate(promotion.end_date)}</td>
                              </tr>
                              <tr>
                                <th>الحالة:</th>
                                <td>
                                  {promotion.is_active ? 
                                    <Badge bg="success">نشط</Badge> : 
                                    <Badge bg="danger">غير نشط</Badge>}
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </Col>
                        <Col md={6}>
                          <Table borderless>
                            <tbody>
                              <tr>
                                <th width="40%">نوع الخصم:</th>
                                <td>{getDiscountTypeLabel(promotion.discount_type)}</td>
                              </tr>
                              <tr>
                                <th>قيمة الخصم:</th>
                                <td>
                                  {promotion.discount_type === 'percentage' ? 
                                    `${promotion.discount_value}%` : 
                                    promotion.discount_type === 'fixed' ? 
                                    `${promotion.discount_value} ريال` : 
                                    promotion.discount_value}
                                </td>
                              </tr>
                              {promotion.discount_type === 'percentage' && (
                                <>
                                  <tr>
                                    <th>الحد الأدنى للحجز:</th>
                                    <td>{promotion.min_booking_value} ريال</td>
                                  </tr>
                                  <tr>
                                    <th>الحد الأقصى للخصم:</th>
                                    <td>{promotion.max_discount_amount} ريال</td>
                                  </tr>
                                </>
                              )}
                            </tbody>
                          </Table>
                        </Col>
                      </Row>
                      <hr />
                      <h6>وصف العرض:</h6>
                      <p>{promotion.description}</p>
                      
                      {promotion.applicable_services && (
                        <>
                          <h6>الخدمات المشمولة في العرض:</h6>
                          <p>{promotion.applicable_services}</p>
                        </>
                      )}
                      
                      {promotion.Company && (
                        <div className="mt-3">
                          <h6>
                            <FaBuilding className="me-1" /> الشركة المقدمة للعرض:
                          </h6>
                          <p>{promotion.Company.name}</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">ملخص العرض</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="text-center mb-4">
                        {promotion.is_active && new Date(promotion.end_date) > new Date() ? (
                          <>
                            <div className="display-4 text-primary">
                              {getDaysRemaining(promotion.end_date)}
                            </div>
                            <p className="text-muted">يوم متبقي</p>
                            <div className="progress mb-3">
                              <div 
                                className="progress-bar bg-success" 
                                role="progressbar" 
                                style={{ 
                                  width: `${100 - (getDaysRemaining(promotion.end_date) / 
                                    ((new Date(promotion.end_date) - new Date(promotion.start_date)) / 
                                    (1000 * 60 * 60 * 24)) * 100)}%` 
                                }}
                              ></div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="display-4 text-danger">
                              منتهي
                            </div>
                            <p className="text-muted">العرض غير نشط أو منتهي</p>
                          </>
                        )}
                      </div>
                      <div className="d-grid gap-2">
                        <Button variant={promotion.is_active ? "outline-danger" : "outline-success"}>
                          {promotion.is_active ? "إيقاف العرض" : "تنشيط العرض"}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
            <Tab eventKey="stats" title="إحصائيات الاستخدام">
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Card className="text-center mb-3">
                        <Card.Body>
                          <h3 className="display-4 text-primary">{usageStats.total_uses}</h3>
                          <p className="text-muted">إجمالي مرات الاستخدام</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="text-center mb-3">
                        <Card.Body>
                          <h3 className="display-4 text-success">{usageStats.total_discount_amount} ريال</h3>
                          <p className="text-muted">إجمالي قيمة الخصومات</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="text-center mb-3">
                        <Card.Body>
                          <h3 className="display-4 text-info">{usageStats.average_discount} ريال</h3>
                          <p className="text-muted">متوسط قيمة الخصم</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  
                  <Alert variant="info" className="mt-3">
                    <FaMoneyBillWave className="me-2" />
                    لا توجد بيانات كافية لعرض الرسوم البيانية التفصيلية. يرجى تنفيذ هذه الميزة في الإصدارات القادمة.
                  </Alert>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PromotionDetails;
