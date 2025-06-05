import api from './api';
// تصدير مباشر للدوال المطلوبة
export const getAllDrivers = async () => {
  const response = await api.get('/drivers');
  return response.data;
};
// تصدير مباشر للدالة getDriverById
export const getDriverById = async (id) => {
  const response = await api.get(`/drivers/${id}`);
  return response.data;
};
// تصدير مباشر للدوال الأخرى
export const createDriver = async (driverData) => {
  const response = await api.post('/drivers', driverData);
  return response.data;
};
// تصدير مباشر للدالة updateDriver
export const updateDriver = async (id, driverData) => {
  const response = await api.put(`/drivers/${id}`, driverData);
  return response.data;
};
export const deleteDriver = async (id) => {
  const response = await api.delete(`/drivers/${id}`);
  return response.data;
};
export const getAvailableDrivers = async (params) => {
  const response = await api.get('/drivers/available', { params });
  return response.data;
};
export const getDriverBookings = async (id, params) => {
  const response = await api.get(`/drivers/${id}/bookings`, { params });
  return response.data;
};
// الاحتفاظ بالتصدير الافتراضي للتوافق مع الكود القديم
const driverService = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getAvailableDrivers,
  getDriverBookings
};
export default driverService;
