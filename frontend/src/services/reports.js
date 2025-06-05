import api from './api';
// Export report functions
export const generateBookingReport = async (params) => {
  const response = await api.get('/reports/bookings', { params });
  return response.data;
};

export const getBookingReport = async (params) => {
  const response = await api.get('/reports/bookings', { params });
  return response.data;
};

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

export const getReportSummary = async (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const response = await api.get('/reports/dashboard-summary', { params });
  return response.data;
};

export const generateDashboardSummary = async (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const response = await api.get('/reports/dashboard-summary', { params });
  return response.data;
};

export const exportReport = async (reportType, params) => {
  const response = await api.get(`/reports/${reportType}/export`, { 
    params,
    responseType: 'blob'
  });
  return response.data;
};

// Default export for backward compatibility
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
