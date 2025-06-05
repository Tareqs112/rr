import api from './api';

// تصدير مباشر للدوال المطلوبة
export const getAllVehicles = async () => {
  const response = await api.get('/vehicles');
  return response.data;
};
// تصدير مباشر للدالة getVehicleById
export const getVehicleById = async (id) => {
  const response = await api.get(`vehicles/${id}`);
  return response.data;
};
// تصدير مباشر للدوال الأخرى
export const createVehicle = async (vehicleData) => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data;
};
// تصدير مباشر للدالة updateVehicle
export const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`/vehicles/${id}`, vehicleData);
  return response.data;
};
export const deleteVehicle = async (id) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};
export const getVehicleAvailability = async (params) => {
  const response = await api.get('/vehicles/availability', { params });
  return response.data;
};
export const getAllVehicleModels = async () => {
  const response = await api.get('/vehicles/models');
  return response.data;
};
export const getVehicleModelById = async (id) => {
  const response = await api.get(`/vehicles/models/${id}`);
  return response.data;
};
export const createVehicleModel = async (modelData) => {
  const response = await api.post('/vehicles/models', modelData);
  return response.data;
};
export const updateVehicleModel = async (id, modelData) => {
  const response = await api.put(`/vehicles/models/${id}`, modelData);
  return response.data;
};
export const deleteVehicleModel = async (id) => {
  const response = await api.delete(`/vehicles/models/${id}`);
  return response.data;
};
export const getVehiclesByModel = async (modelId) => {
  const response = await api.get(`/vehicles/models/${modelId}/vehicles`);
  return response.data;
};
export const getVehicleCalendar = async (params) => {
  const response = await api.get('/vehicles/calendar', { params });
  return response.data;
};
export const getAvailabilitySummary = async () => {
  const response = await api.get('/vehicles/availability-summary');
  return response.data;
};
// الاحتفاظ بالتصدير الافتراضي للتوافق مع الكود القديم
const vehicleService = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleAvailability,
  getAllVehicleModels,
  getVehicleModelById,
  createVehicleModel,
  updateVehicleModel,
  deleteVehicleModel,
  getVehiclesByModel,
  getVehicleCalendar,
  getAvailabilitySummary
};
export default vehicleService;
