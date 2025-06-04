import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Table, Button, 
  Badge, Spinner, Alert, Tabs, Tab 
} from 'react-bootstrap';
import { FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaMoneyBillWave, FaUserTie } from 'react-icons/fa';
import { formatDate } from '../../utils/dateUtils';
import { API_BASE_URL } from '../../config';

const TourCampaignDetails = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/tour-campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCampaign(response.data);
      
      // جلب المشاركين في الحملة (يمكن تنفيذ هذا في الخلفية لاحقاً)
      try {
        const participantsResponse = await axios.get(`${API_BASE_URL}/api/tour-campaigns/${id}/participants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setParticipants(participantsResponse.data);
      } catch (participantsErr) {
        console.error('Error fetching participants:', participantsErr);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching campaign details:', err);
      setError('حدث خطأ أثناء جلب تفاصيل الحملة السياحية');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'planned':
        return <Badge bg="info">مخطط لها</Badge>;
      case 'active':
        return <Badge bg="success">نشطة</Badge>;
      case 'completed':
        return <Badge bg="secondary">مكتملة</Badge>;
      case 'cancelled':
        return <Badge bg="danger">ملغاة</Badge>;
      default:
        return <Badge bg="light">غير معروف</Badge>;
    }
  };

  // تنسيق جدول الرحلة
  const formatItinerary = (itinerary) => {
    if (!itinerary) return <p>لا يوجد جدول رحلة متاح</p>;
    
    // تقسيم النص إلى أيام
    const days = itinerary.split(/يوم \d+:/i).filter(day => day.trim());
    const dayTitles = itinerary.match(/يوم \d+:/gi) || [];
    
    return (
      <div>
        {days.map((day, index) => (
          <div key={index} className="mb-3">
            <h6 className="text-primary">{dayTitles[index] || `اليوم ${index + 1}:`}</h6>
            <p>{day.trim()}</p>
          </div>
        ))}
      </div>
    );
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

  if (!campaign) {
    return (
      <Container className="py-5">
        <Alert variant="info">لم يتم العثور على بيانات الحملة السياحية</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaCalendarAlt className="me-2" /> تفاصيل الحملة السياحية
          </h5>
        </Card.Header>
        <Card.Body>
          <Tabs defaultActiveKey="details" className="mb-4">
            <Tab eventKey="details" title="تفاصيل الحملة">
              <Row className="mb-4">
                <Col md={8}>
                  <Card className="h-100">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">معلومات الحملة</h6>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <Table borderless>
                            <tbody>
                              <tr>
                                <th width="40%">اسم الحملة:</th>
                                <td>{campaign.name}</td>
                              </tr>
                              <tr>
                                <th>تاريخ البداية:</th>
                                <td>{formatDate(campaign.start_date)}</td>
                              </tr>
                              <tr>
                                <th>تاريخ النهاية:</th>
                                <td>{formatDate(campaign.end_date)}</td>
                              </tr>
                              <tr>
                                <th>الحالة:</th>
                                <td>{getStatusBadge(campaign.status)}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </Col>
                        <Col md={6}>
                          <Table borderless>
                            <tbody>
                              <tr>
                                <th width="40%">الشركة المنظمة:</th>
                                <td>{campaign.Company ? campaign.Company.name : 'غير محدد'}</td>
                              </tr>
                              <tr>
                                <th>
                                  <FaUsers className="me-1" /> المشاركين:
                                </th>
                                <td>
                                  {campaign.current_participants} / {campaign.max_participants}
                                </td>
                              </tr>
                              <tr>
                                <th>
                                  <FaMoneyBillWave className="me-1" /> السعر للفرد:
                                </th>
                                <td>{campaign.price_per_person} ريال</td>
                              </tr>
                              <tr>
                                <th>المرشد السياحي:</th>
                                <td>{campaign.TourGuide ? campaign.TourGuide.name : 'غير محدد'}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </Col>
                      </Row>
                      <hr />
                      <h6>وصف الحملة:</h6>
                      <p>{campaign.description}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">ملخص الحملة</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="text-center mb-4">
                        <div className="display-4 text-primary">
                          {campaign.current_participants} / {campaign.max_participants}
                        </div>
                        <p className="text-muted">المشاركين</p>
                        <div className="progress mb-3">
                          <div 
                            className="progress-bar bg-success" 
                            role="progressbar" 
                            style={{ width: `${(campaign.current_participants / campaign.max_participants) * 100}%` }}
                            aria-valuenow={campaign.current_participants}
                            aria-valuemin="0"
                            aria-valuemax={campaign.max_participants}
                          ></div>
                        </div>
                      </div>
                      <div className="d-grid gap-2">
                        <Button variant="outline-primary">
                          <FaUsers className="me-1" /> إدارة المشاركين
                        </Button>
                        <Button variant="outline-success">
                          <FaMoneyBillWave className="me-1" /> تسجيل دفعة
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
            <Tab eventKey="itinerary" title="جدول الرحلة">
              <Card>
                <Card.Body>
                  <h5 className="mb-3">
                    <FaMapMarkerAlt className="me-2" /> جدول الرحلة التفصيلي
                  </h5>
                  {formatItinerary(campaign.itinerary)}
                </Card.Body>
              </Card>
            </Tab>
            <Tab eventKey="participants" title="المشاركين">
              {participants.length > 0 ? (
                <Table responsive hover striped>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>اسم المشارك</th>
                      <th>رقم الهاتف</th>
                      <th>البريد الإلكتروني</th>
                      <th>تاريخ التسجيل</th>
                      <th>حالة الدفع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <tr key={participant.id}>
                        <td>{index + 1}</td>
                        <td>{participant.name}</td>
                        <td>{participant.phone}</td>
                        <td>{participant.email}</td>
                        <td>{formatDate(participant.registration_date)}</td>
                        <td>
                          <Badge bg={participant.payment_status === 'paid' ? 'success' : 'warning'}>
                            {participant.payment_status === 'paid' ? 'مدفوع' : 'قيد الانتظار'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">لا يوجد مشاركين مسجلين في هذه الحملة</Alert>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TourCampaignDetails;
