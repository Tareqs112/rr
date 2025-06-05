import api from './api';
// تصدير مباشر للدوال المطلوبة
export const getAllBookings = async () => {
  const response = await api.get('/bookings');
  return response.data;
};
// تصدير مباشر للدالة getBookingById
export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};
// تصدير مباشر للدوال الأخرى
export const checkVehicleAvailability = async (data) => {
  const response = await api.post('/bookings/check-availability', data);
  return response.data;
};
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};
// تصدير مباشر للدالة updateBooking
export const updateBooking = async (id, bookingData) => {
  const response = await api.put(`/bookings/${id}`, bookingData);
  return response.data;
};
export const deleteBooking = async (id) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};
export const getBookingsForCalendar = async (params) => {
  const response = await api.get('/bookings/calendar', { params });
  return response.data;
};
export const getUpcomingPickups = async () => {
  const response = await api.get('/bookings/upcoming-pickups');
  return response.data;
};
export const getPendingPayments = async () => {
  const response = await api.get('/bookings/pending-payments');
  return response.data;
};
export const searchBookings = async (params) => {
  const response = await api.get('/bookings/search', { params });
  return response.data;
};
// الاحتفاظ بالتصدير الافتراضي للتوافق مع الكود القديم
const bookingService = {
  getAllBookings,
  getBookingById,
  checkVehicleAvailability,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingsForCalendar,
  getUpcomingPickups,
  getPendingPayments,
  searchBookings
};
export default bookingService;
