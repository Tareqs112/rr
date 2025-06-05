import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Table, Button, 
  Badge, Spinner, Alert, Form, InputGroup 
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserTie } from 'react-icons/fa';
import { API_BASE_URL } from '../../config';

const TourGuideList = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/tour-guides`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuides(response.data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء جلب بيانات المرشدين السياحيين');
      console.error('Error fetching guides:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المرشد السياحي؟')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/tour-guides/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchGuides();
      } catch (err) {
        setError('حدث خطأ أثناء حذف المرشد السياحي');
        console.error('Error deleting guide:', err);
      }
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

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (guide.specialties && guide.specialties.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (guide.languages && guide.languages.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || guide.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">
                <FaUserTie className="me-2" /> إدارة المرشدين السياحيين
              </h5>
            </Col>
            <Col xs="auto">
              <Link to="/tour-guides/new">
                <Button variant="light" size="sm">
                  <FaPlus className="me-1" /> إضافة مرشد جديد
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
                  placeholder="بحث عن مرشد سياحي..."
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
                <option value="available">متاح</option>
                <option value="busy">مشغول</option>
                <option value="on_leave">في إجازة</option>
              </Form.Select>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">جاري تحميل البيانات...</p>
            </div>
          ) : filteredGuides.length === 0 ? (
            <Alert variant="info">
              لا يوجد مرشدين سياحيين متطابقين مع معايير البحث
            </Alert>
          ) : (
            <Table responsive hover striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم</th>
                  <th>رقم الهاتف</th>
                  <th>البريد الإلكتروني</th>
                  <th>اللغات</th>
                  <th>التخصصات</th>
                  <th>الحالة</th>
                  <th>التقييم</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuides.map((guide, index) => (
                  <tr key={guide.id}>
                    <td>{index + 1}</td>
                    <td>{guide.name}</td>
                    <td>{guide.phone}</td>
                    <td>{guide.email}</td>
                    <td>{guide.languages}</td>
                    <td>{guide.specialties}</td>
                    <td>{getStatusBadge(guide.status)}</td>
                    <td>
                      {guide.rating ? `${guide.rating}/5` : 'غير مقيم'}
                    </td>
                    <td>
                      <Link to={`/tour-guides/${guide.id}`}>
                        <Button variant="info" size="sm" className="me-1">
                          عرض
                        </Button>
                      </Link>
                      <Link to={`/tour-guides/edit/${guide.id}`}>
                        <Button variant="warning" size="sm" className="me-1">
                          <FaEdit />
                        </Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(guide.id)}
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

export default TourGuideList;
