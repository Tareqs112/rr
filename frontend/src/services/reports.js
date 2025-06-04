import api from './api';

// تصدير مباشر للدوال المطلوبة
export const generateBookingReport = async (params) => {
  const response = await api.get('/reports/bookings', { params });
  return response.data;
};

// تصدير مباشر للدالة getBookingReport المطلوبة
export const getBookingReport = async (params) => {
  const response = await api.get('/reports/bookings', { params });
  return response.data;
};

// تصدير مباشر للدالة getRevenueReport المطلوبة
export const getRevenueReport = async (params) => {
  const response = await api.get('/reports/revenue', { params });
  return response.data;
};

export const generateVehicleReport = async (params) => {
  const response = await api.get('/reports/vehicles', { params });
  return response.data;
};

export const generateCustomerReport = async (params) => {
  const response = await api.get('/reports/customers', { params });
  return response.data;
};

// تصدير مباشر للدالة getReportSummary المطلوبة
export const getReportSummary = async () => {
  const response = await api.get('/reports/dashboard-summary');
  return response.data;
};

export const generateDashboardSummary = async () => {
  const response = await api.get('/reports/dashboard-summary');
  return response.data;
};

export const exportReport = async (reportType, params) => {
  const response = await api.get(`/reports/${reportType}/export`, { 
    params,
    responseType: 'blob'
  });
  return response.data;
};

// الاحتفاظ بالتصدير الافتراضي للتوافق مع الكود القديم
const reportService = {
  generateBookingReport,
  getBookingReport,
  generateVehicleReport,
  generateCustomerReport,
  generateDashboardSummary,
  getReportSummary,
  getRevenueReport,
  exportReport
};

export default reportService;
