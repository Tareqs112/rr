import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Row, Col, Card, Table, Button, 
  Badge, Spinner, Alert, Form, InputGroup 
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaPercentage, FaGift } from 'react-icons/fa';
import { formatDate } from '../../utils/dateUtils';
import { API_BASE_URL } from '../../config';

const PromotionList = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/promotions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromotions(response.data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ أثناء جلب بيانات العروض والخصومات');
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا العرض؟')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/promotions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchPromotions();
      } catch (err) {
        setError('حدث خطأ أثناء حذف العرض');
        console.error('Error deleting promotion:', err);
      }
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

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         promotion.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && promotion.is_active) || 
                         (filterActive === 'inactive' && !promotion.is_active);
    
    return matchesSearch && matchesActive;
  });

  return (
    <Container fluid className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">
                <FaGift className="me-2" /> إدارة العروض والخصومات
              </h5>
            </Col>
            <Col xs="auto">
              <Link to="/promotions/new">
                <Button variant="light" size="sm">
                  <FaPlus className="me-1" /> إضافة عرض جديد
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
                  placeholder="بحث عن عرض..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Select 
                value={filterActive} 
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <option value="all">جميع العروض</option>
                <option value="active">العروض النشطة</option>
                <option value="inactive">العروض غير النشطة</option>
              </Form.Select>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">جاري تحميل البيانات...</p>
            </div>
          ) : filteredPromotions.length === 0 ? (
            <Alert variant="info">
              لا توجد عروض متطابقة مع معايير البحث
            </Alert>
          ) : (
            <Table responsive hover striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>اسم العرض</th>
                  <th>تاريخ البداية</th>
                  <th>تاريخ النهاية</th>
                  <th>نوع الخصم</th>
                  <th>قيمة الخصم</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromotions.map((promotion, index) => (
                  <tr key={promotion.id}>
                    <td>{index + 1}</td>
                    <td>{promotion.name}</td>
                    <td>{formatDate(promotion.start_date)}</td>
                    <td>{formatDate(promotion.end_date)}</td>
                    <td>{getDiscountTypeLabel(promotion.discount_type)}</td>
                    <td>
                      {promotion.discount_type === 'percentage' ? 
                        `${promotion.discount_value}%` : 
                        promotion.discount_type === 'fixed' ? 
                        `${promotion.discount_value} ريال` : 
                        promotion.discount_value}
                    </td>
                    <td>
                      {promotion.is_active ? 
                        <Badge bg="success">نشط</Badge> : 
                        <Badge bg="danger">غير نشط</Badge>}
                    </td>
                    <td>
                      <Link to={`/promotions/${promotion.id}`}>
                        <Button variant="info" size="sm" className="me-1">
                          عرض
                        </Button>
                      </Link>
                      <Link to={`/promotions/edit/${promotion.id}`}>
                        <Button variant="warning" size="sm" className="me-1">
                          <FaEdit />
                        </Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(promotion.id)}
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

export default PromotionList;
