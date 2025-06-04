import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { 
  FaHome, FaUsers, FaCar, FaUserTie, FaCalendarAlt, 
  FaChartBar, FaMoneyBillWave, FaCalendarDay, FaGift, FaUserFriends
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { pathname } = location;

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>نظام تأجير السيارات</h3>
      </div>
      <Nav className="flex-column">
        <Nav.Item>
          <Link to="/" className={`nav-link ${isActive('/') && pathname === '/' ? 'active' : ''}`}>
            <FaHome className="me-2" /> الرئيسية
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/customers" className={`nav-link ${isActive('/customers') ? 'active' : ''}`}>
            <FaUsers className="me-2" /> العملاء
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/vehicles" className={`nav-link ${isActive('/vehicles') ? 'active' : ''}`}>
            <FaCar className="me-2" /> المركبات
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/drivers" className={`nav-link ${isActive('/drivers') ? 'active' : ''}`}>
            <FaUserTie className="me-2" /> السائقين
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>
            <FaCalendarAlt className="me-2" /> الحجوزات
          </Link>
        </Nav.Item>
        
        {/* إضافة روابط للميزات الجديدة */}
        <Nav.Item>
          <Link to="/tour-campaigns" className={`nav-link ${isActive('/tour-campaigns') ? 'active' : ''}`}>
            <FaCalendarDay className="me-2" /> الحملات السياحية
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/tour-guides" className={`nav-link ${isActive('/tour-guides') ? 'active' : ''}`}>
            <FaUserFriends className="me-2" /> المرشدين السياحيين
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/promotions" className={`nav-link ${isActive('/promotions') ? 'active' : ''}`}>
            <FaGift className="me-2" /> العروض والخصومات
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/installments" className={`nav-link ${isActive('/installments') ? 'active' : ''}`}>
            <FaMoneyBillWave className="me-2" /> الأقساط والمدفوعات
          </Link>
        </Nav.Item>
        
        <Nav.Item>
          <Link to="/reports" className={`nav-link ${isActive('/reports') ? 'active' : ''}`}>
            <FaChartBar className="me-2" /> التقارير
          </Link>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default Sidebar;
