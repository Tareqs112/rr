import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // في بيئة الاختبار، نستخدم محاكاة لعملية تسجيل الدخول
      // في الإصدار النهائي، سيتم استبدال هذا بـ:
      // const response = await authAPI.login({ email, password });
      // localStorage.setItem('token', response.data.token);
      // localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // محاكاة طلب API
      setTimeout(() => {
        if (email === 'admin@example.com' && password === 'password') {
          // تخزين بيانات المستخدم في localStorage
          localStorage.setItem('token', 'mock-jwt-token-for-testing');
          localStorage.setItem('user', JSON.stringify({
            id: 1,
            name: 'المدير',
            email: 'admin@example.com',
            role: 'admin'
          }));
          
          // الانتقال إلى الصفحة الرئيسية
          navigate('/');
        } else {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          setLoading(false);
        }
      }, 1000);
    } catch (err) {
      console.error('خطأ في تسجيل الدخول:', err);
      setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>نظام تأجير السيارات</h1>
          <p>تسجيل الدخول إلى لوحة التحكم</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">كلمة المرور</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="أدخل كلمة المرور"
            />
          </div>
          
          <div className="form-group">
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </div>
          
          <div className="form-footer">
            <a href="#" className="forgot-password">نسيت كلمة المرور؟</a>
          </div>
        </form>
      </div>
      
      <div className="login-footer">
        <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} - نظام تأجير السيارات</p>
      </div>
    </div>
  );
};

export default LoginPage;
