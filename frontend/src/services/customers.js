import api from './api';

// تصدير مباشر للدوال المطلوبة
export const getAllCustomers = async () => {
  const response = await api.get('/customers');
  return response.data;
};

// تصدير مباشر للدالة getCustomerById
export const getCustomerById = async (id) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

// تصدير مباشر للدوال الأخرى
export const createCustomer = async (customerData) => {
  const response = await api.post('/customers', customerData);
  return response.data;
};

// تصدير مباشر للدالة updateCustomer
export const updateCustomer = async (id, customerData) => {
  const response = await api.put(`/customers/${id}`, customerData);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};

export const getCustomerBookings = async (id) => {
  const response = await api.get(`/customers/${id}/bookings`);
  return response.data;
};

export const searchCustomers = async (params) => {
  const response = await api.get('/customers/search', { params });
  return response.data;
};

// الاحتفاظ بالتصدير الافتراضي للتوافق مع الكود القديم
const customerService = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerBookings,
  searchCustomers
};

export default customerService;
