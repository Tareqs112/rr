import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { FaExclamationTriangle, FaHome, FaSignInAlt } from 'react-icons/fa';

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState({
    title: 'حدث خطأ ما',
    message: 'نعتذر، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
    code: 500
  });

  useEffect(() => {
    // استخراج رمز الخطأ ورسالته من الحالة أو المعلمات
    const state = location.state || {};
    const params = new URLSearchParams(location.search);
    const errorCode = params.get('code') || state.code || 500;
    const errorType = params.get('type') || state.type;

    // تحديد رسالة الخطأ بناءً على النوع
    if (errorType === 'auth') {
      setError({
        title: 'خطأ في المصادقة',
        message: state.message || 'انتهت صلاحية الجلسة أو لم يتم توفير بيانات اعتماد صالحة.',
        code: 401
      });
    } else if (errorType === 'forbidden') {
      setError({
        title: 'غير مصرح بالوصول',
        message: state.message || 'ليس لديك صلاحية للوصول إلى هذا المورد.',
        code: 403
      });
    } else if (errorType === 'not_found') {
      setError({
        title: 'الصفحة غير موجودة',
        message: state.message || 'الصفحة التي تبحث عنها غير موجودة.',
        code: 404
      });
    } else if (params.get('error') === 'session_expired') {
      setError({
        title: 'انتهت صلاحية الجلسة',
        message: localStorage.getItem('auth_error') || 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى.',
        code: 401
      });
      // مسح رسالة الخطأ من التخزين المحلي بعد عرضها
      localStorage.removeItem('auth_error');
    } else {
      setError({
        title: state.title || 'حدث خطأ ما',
        message: state.message || 'نعتذر، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
        code: errorCode
      });
    }
  }, [location]);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="text-center shadow" style={{ maxWidth: '500px', width: '100%' }}>
        <Card.Header className="bg-danger text-white">
          <FaExclamationTriangle size={30} className="mb-2" />
          <h3>{error.title}</h3>
        </Card.Header>
        <Card.Body>
          <Alert variant="light">
            <h1 className="display-4">{error.code}</h1>
          </Alert>
          <Card.Text>{error.message}</Card.Text>
          <div className="d-flex justify-content-center mt-4">
            <Button 
              variant="primary" 
              className="me-2"
              onClick={() => navigate('/')}
            >
              <FaHome className="me-1" /> الصفحة الرئيسية
            </Button>
            {error.code === 401 && (
              <Button 
                variant="success"
                onClick={() => navigate('/login')}
              >
                <FaSignInAlt className="me-1" /> تسجيل الدخول
              </Button>
            )}
          </div>
        </Card.Body>
        <Card.Footer className="text-muted">
          نظام تأجير السيارات
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default ErrorPage;
