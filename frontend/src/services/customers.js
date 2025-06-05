import api from './api';

// ✅ Get All Customers
export const getAllCustomers = async () => {
  const response = await api.get('/customers');
  const data = response.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.customers)) return data.customers;
  return [];
};

// ✅ Get Customer by ID
export const getCustomerById = async (id) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

// ✅ Create Customer
export const createCustomer = async (customerData) => {
  const response = await api.post('/customers', customerData);
  return response.data;
};

// ✅ Update Customer
export const updateCustomer = async (id, customerData) => {
  const response = await api.put(`/customers/${id}`, customerData);
  return response.data;
};

// ✅ Delete Customer
export const deleteCustomer = async (id) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};

// ✅ Get Customer Bookings
export const getCustomerBookings = async (id) => {
  const response = await api.get(`/customers/${id}/bookings`);
  return response.data;
};

// ✅ Search Customers
export const searchCustomers = async (params) => {
  const response = await api.get('/customers/search', { params });
  const data = response.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.customers)) return data.customers;
  return [];
};

// ✅ Default export for compatibility
const customerService = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerBookings,
  searchCustomers,
};

export default customerService;
