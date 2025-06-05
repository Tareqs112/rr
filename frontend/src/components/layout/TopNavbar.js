import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar, Container, Nav, NavDropdown, Button } from 'react-bootstrap';
import { FaSignOutAlt, FaUser, FaBell, FaCog } from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice';
import authService from '../../services/auth';

const TopNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    authService.logout();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="top-navbar">
      <Container fluid>
        <Navbar.Brand href="/">نظام تأجير السيارات</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-end">
          <Nav>
            <NavDropdown 
              title={
                <span>
                  <FaBell className="me-1" />
                  <span className="notification-badge">0</span>
                </span>
              } 
              id="notification-dropdown"
            >
              <NavDropdown.Item>لا توجد إشعارات جديدة</NavDropdown.Item>
            </NavDropdown>
            
            <NavDropdown 
              title={
                <span>
                  <FaUser className="me-1" />
                  {user ? user.username : 'المستخدم'}
                </span>
              } 
              id="user-dropdown"
            >
              <NavDropdown.Item onClick={() => navigate('/profile')}>
                <FaUser className="me-2" />
                الملف الشخصي
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => navigate('/settings')}>
                <FaCog className="me-2" />
                الإعدادات
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <FaSignOutAlt className="me-2" />
                تسجيل الخروج
              </NavDropdown.Item>
            </NavDropdown>
            
            <Button 
              variant="outline-light" 
              className="ms-2 logout-btn" 
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-1" />
              تسجيل الخروج
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
