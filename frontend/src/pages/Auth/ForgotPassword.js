import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '../../redux/slices/authSlice';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  const onChange = e => {
    setEmail(e.target.value);
  };

  const onSubmit = e => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    dispatch(forgotPassword({ email }))
      .unwrap()
      .then(() => {
        setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      })
      .catch(err => {
        setError(err.message || 'حدث خطأ أثناء إرسال طلب إعادة تعيين كلمة المرور');
      });
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>نسيت كلمة المرور</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">إرسال رابط إعادة التعيين</button>
        </form>
        <p>
          تذكرت كلمة المرور؟ <Link to="/login">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
