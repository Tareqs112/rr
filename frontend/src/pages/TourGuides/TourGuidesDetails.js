import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Table, Button, 
  Badge, Spinner, Alert, Tabs, Tab 
} from 'react-bootstrap';
import { FaUserTie, FaStar, FaLanguage, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { formatDate } from '../../utils/dateUtils';
import { API_BASE_URL } from '../../config';

const TourGuideDetails = () => {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGuideDetails();
  }, [id]);

  const fetchGuideDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/tour-guides/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setGuide(response.data);
      
      // جلب الحملات السياحية المرتبطة بالمرشد
      try {
        const campaignsResponse = await axios.get(`${API_BASE_URL}/api/tour-campaigns?guide_id=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCampaigns(campaignsResponse.data);
      } catch (campaignErr) {
        console.error('Error fetching related campaigns:', campaignErr);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching guide details:', err);
      setError('حدث خطأ أثناء جلب تفاصيل المرشد السياحي');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge bg="success">متاح</Badge>;
      case 'busy':
        return <Badge bg="warning">مشغول</Badge>;
      case 'on_leave':
        return <Badge bg="danger">في إجازة</Badge>;
      default:
        return <Badge bg="light">غير معروف</Badge>;
    }
  };

  // عرض تقييم المرشد بالنجوم
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-warning" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="text-warning opacity-50" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-secondary" />);
    }
    
    return (
      <div className="d-flex align-items-center">
        {stars} <span className="ms-2">({rating}/5)</span>
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

  if (!guide) {
    return (
      <Container className="py-5">
        <Alert variant="info">لم يتم العثور على بيانات المرشد السياحي</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaUserTie className="me-2" /> تفاصيل المرشد السياحي
          </h5>
        </Card.Header>
        <Card.Body>
          <Tabs defaultActiveKey="details" className="mb-4">
            <Tab eventKey="details" title="المعلومات الشخصية">
              <Row>
                <Col md={4} className="mb-4">
                  <Card className="h-100">
                    <Card.Body className="text-center">
                      {guide.photo_url ? (
                        <img 
                          src={guide.photo_url} 
                          alt={guide.name} 
                          className="img-fluid rounded-circle mb-3"
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                          style={{ width: '150px', height: '150px' }}
                        >
                          <FaUserTie size={60} className="text-secondary" />
                        </div>
                      )}
                      <h4>{guide.name}</h4>
                      <p className="text-muted">مرشد سياحي</p>
                      <div className="mb-3">
                        {getStatusBadge(guide.status)}
                      </div>
                      <div className="mb-3">
                        {renderRating(guide.rating || 0)}
                      </div>
                      <div className="d-flex justify-content-center">
                        <Badge bg="info" className="me-2">
                          <FaCalendarAlt className="me-1" /> {guide.years_experience} سنوات خبرة
                        </Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={8}>
                  <Card className="h-100">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">معلومات الاتصال والتفاصيل</h6>
                    </Card.Header>
                    <Card.Body>
                      <Table borderless>
                        <tbody>
                          <tr>
                            <th width="30%">رقم الهاتف:</th>
                            <td>{guide.phone}</td>
                          </tr>
                          <tr>
                            <th>البريد الإلكتروني:</th>
                            <td>{guide.email}</td>
                          </tr>
                          <tr>
                            <th>
                              <FaLanguage className="me-1" /> اللغات:
                            </th>
                            <td>
                              {guide.languages.split(',').map((language, index) => (
                                <Badge key={index} bg="info" className="me-1">
                                  {language.trim()}
                                </Badge>
                              ))}
                            </td>
                          </tr>
                          <tr>
                            <th>التخصصات:</th>
                            <td>
                              {guide.specialties.split(',').map((specialty, index) => (
                                <Badge key={index} bg="secondary" className="me-1">
                                  {specialty.trim()}
                                </Badge>
                              ))}
                            </td>
                          </tr>
                          <tr>
                            <th>الشهادات والمؤهلات:</th>
                            <td>{guide.certification || 'غير متوفر'}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
            <Tab eventKey="campaigns" title="الحملات السياحية">
              {campaigns.length > 0 ? (
                <Table responsive hover striped>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>اسم الحملة</th>
                      <th>تاريخ البداية</th>
                      <th>تاريخ النهاية</th>
                      <th>الحالة</th>
                      <th>عدد المشاركين</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign, index) => (
                      <tr key={campaign.id}>
                        <td>{index + 1}</td>
                        <td>{campaign.name}</td>
                        <td>{formatDate(campaign.start_date)}</td>
                        <td>{formatDate(campaign.end_date)}</td>
                        <td>
                          <Badge bg={
                            campaign.status === 'active' ? 'success' :
                            campaign.status === 'planned' ? 'info' :
                            campaign.status === 'completed' ? 'secondary' : 'danger'
                          }>
                            {campaign.status === 'active' ? 'نشطة' :
                             campaign.status === 'planned' ? 'مخطط لها' :
                             campaign.status === 'completed' ? 'مكتملة' : 'ملغاة'}
                          </Badge>
                        </td>
                        <td>
                          {campaign.current_participants} / {campaign.max_participants}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">لا توجد حملات سياحية مرتبطة بهذا المرشد</Alert>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TourGuideDetails;
