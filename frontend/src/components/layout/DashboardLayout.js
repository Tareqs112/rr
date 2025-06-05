import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Container } from 'react-bootstrap';
import Dashboard from '../../pages/Dashboard/Dashboard';

const DashboardLayout = () => {
  return (
    <>
      <Navbar />
      <div className="content-container">
        <Sidebar />
        <Container fluid className="main-content">
          <Dashboard />
        </Container>
      </div>
    </>
  );
};

export default DashboardLayout;
