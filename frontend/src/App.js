import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// المكونات المشتركة
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import PrivateRoute from './components/layout/PrivateRoute';

// صفحات المصادقة
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

// صفحات لوحة التحكم
import Dashboard from './pages/Dashboard/Dashboard';

// صفحات العملاء
import CustomerList from './pages/Customers/CustomerList';
import CustomerForm from './pages/Customers/CustomerForm';
import CustomerDetails from './pages/Customers/CustomerDetails';

// صفحات المركبات
import VehicleList from './pages/Vehicles/VehicleList';
import VehicleForm from './pages/Vehicles/VehicleForm';
import VehicleDetails from './pages/Vehicles/VehicleDetails';

// صفحات السائقين
import DriverList from './pages/Drivers/DriverList';
import DriverForm from './pages/Drivers/DriverForm';
import DriverDetails from './pages/Drivers/DriverDetails';

// صفحات الحجوزات
import BookingList from './pages/Bookings/BookingList';
import BookingForm from './pages/Bookings/BookingForm';
import BookingDetails from './pages/Bookings/BookingDetails';

// صفحات التقارير
import ReportDashboard from './pages/Reports/ReportDashboard';
import RevenueReport from './pages/Reports/RevenueReport';
import BookingReport from './pages/Reports/BookingReport';

// صفحات الحملات السياحية
import TourCampaignList from './pages/TourCampaigns/TourCampaignList';
import TourCampaignForm from './pages/TourCampaigns/TourCampaignForm';
import TourCampaignDetails from './pages/TourCampaigns/TourCampaignDetails';

// صفحات المرشدين السياحيين
import TourGuideList from './pages/TourGuides/TourGuideList';
import TourGuideForm from './pages/TourGuides/TourGuideForm';
import TourGuideDetails from './pages/TourGuides/TourGuideDetails';

// صفحات العروض والخصومات
import PromotionList from './pages/Promotions/PromotionList';
import PromotionForm from './pages/Promotions/PromotionForm';
import PromotionDetails from './pages/Promotions/PromotionDetails';

// صفحات الأقساط والمدفوعات
import InstallmentList from './pages/Installments/InstallmentList';
import InstallmentPlanForm from './pages/Installments/InstallmentPlanForm';
import InstallmentDetails from './pages/Installments/InstallmentDetails';
import DueInstallments from './pages/Installments/DueInstallments';
import InstallmentSummary from './pages/Installments/InstallmentSummary';

// نمط التطبيق
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <Dashboard />
              </Container>
            </div>
          </PrivateRoute>
        } />
        
        {/* مسارات العملاء */}
        <Route path="/customers" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <CustomerList />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/customers/new" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <CustomerForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/customers/edit/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <CustomerForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/customers/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <CustomerDetails />
              </Container>
            </div>
          </PrivateRoute>
        } />
        
        {/* مسارات المركبات */}
        <Route path="/vehicles" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <VehicleList />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/vehicles/new" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <VehicleForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/vehicles/edit/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <VehicleForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/vehicles/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <VehicleDetails />
              </Container>
            </div>
          </PrivateRoute>
        } />
        
        {/* مسارات السائقين */}
        <Route path="/drivers" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <DriverList />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/drivers/new" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <DriverForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/drivers/edit/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <DriverForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/drivers/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <DriverDetails />
              </Container>
            </div>
          </PrivateRoute>
        } />
        
        {/* مسارات الحجوزات */}
        <Route path="/bookings" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <BookingList />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/bookings/new" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <BookingForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/bookings/edit/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <BookingForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/bookings/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <BookingDetails />
              </Container>
            </div>
          </PrivateRoute>
        } />
        
        {/* مسارات التقارير */}
        <Route path="/reports" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <ReportDashboard />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/reports/revenue" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <RevenueReport />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/reports/bookings" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <BookingReport />
              </Container>
            </div>
          </PrivateRoute>
        } />
        
        {/* مسارات الحملات السياحية */}
        <Route path="/tour-campaigns" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <TourCampaignList />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/tour-campaigns/new" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <TourCampaignForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/tour-campaigns/edit/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <TourCampaignForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/tour-campaigns/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <TourCampaignDetails />
              </Container>
            </div>
          </PrivateRoute>
        } />
        
        {/* مسارات المرشدين السياحيين */}
        <Route path="/tour-guides" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <TourGuideList />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/tour-guides/new" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <TourGuideForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/tour-guides/edit/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <TourGuideForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/tour-guides/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <TourGuideDetails />
              </Container>
            </div>
          </PrivateRoute>
        } />
        
        {/* مسارات العروض والخصومات */}
        <Route path="/promotions" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <PromotionList />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/promotions/new" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <PromotionForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/promotions/edit/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <PromotionForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/promotions/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <PromotionDetails />
              </Container>
            </div>
          </PrivateRoute>
        } />
        
        {/* مسارات الأقساط والمدفوعات */}
        <Route path="/installments" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <InstallmentList />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/installments/plan/new" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <InstallmentPlanForm />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/installments/:id" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <InstallmentDetails />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/installments/due" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <DueInstallments />
              </Container>
            </div>
          </PrivateRoute>
        } />
        <Route path="/installments/summary" element={
          <PrivateRoute>
            <Navbar />
            <div className="content-container">
              <Sidebar />
              <Container fluid className="main-content">
                <InstallmentSummary />
              </Container>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
