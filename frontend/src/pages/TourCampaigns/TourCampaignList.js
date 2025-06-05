import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Table, Button, 
  Badge, Spinner, Alert, Form, InputGroup 
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCalendarAlt } from 'react-icons/fa';
import { formatDate } from '../../utils/dateUtils';
import { API_BASE_URL } from '../../config';

const TourCampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/tour-campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(response.data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء جلب بيانات الحملات السياحية');
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الحملة السياحية؟')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/tour-campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCampaigns();
      } catch (err) {
        setError('حدث خطأ أثناء حذف الحملة السياحية');
        console.error('Error deleting campaign:', err);
      }
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

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">
                <FaCalendarAlt className="me-2" /> إدارة الحملات السياحية
              </h5>
            </Col>
            <Col xs="auto">
              <Link to="/tour-campaigns/new">
                <Button variant="light" size="sm">
                  <FaPlus className="me-1" /> إضافة حملة جديدة
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
                  placeholder="بحث عن حملة سياحية..."
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
                <option value="planned">مخطط لها</option>
                <option value="active">نشطة</option>
                <option value="completed">مكتملة</option>
                <option value="cancelled">ملغاة</option>
              </Form.Select>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">جاري تحميل البيانات...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <Alert variant="info">
              لا توجد حملات سياحية متطابقة مع معايير البحث
            </Alert>
          ) : (
            <Table responsive hover striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>اسم الحملة</th>
                  <th>تاريخ البداية</th>
                  <th>تاريخ النهاية</th>
                  <th>الحالة</th>
                  <th>عدد المشاركين</th>
                  <th>السعر للفرد</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign, index) => (
                  <tr key={campaign.id}>
                    <td>{index + 1}</td>
                    <td>{campaign.name}</td>
                    <td>{formatDate(campaign.start_date)}</td>
                    <td>{formatDate(campaign.end_date)}</td>
                    <td>{getStatusBadge(campaign.status)}</td>
                    <td>
                      {campaign.current_participants} / {campaign.max_participants}
                    </td>
                    <td>{campaign.price_per_person} ريال</td>
                    <td>
                      <Link to={`/tour-campaigns/${campaign.id}`}>
                        <Button variant="info" size="sm" className="me-1">
                          عرض
                        </Button>
                      </Link>
                      <Link to={`/tour-campaigns/edit/${campaign.id}`}>
                        <Button variant="warning" size="sm" className="me-1">
                          <FaEdit />
                        </Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(campaign.id)}
                      >
                        <FaTrash />
                      </Button>
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

export default TourCampaignList;
