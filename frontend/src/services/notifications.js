import api from './api';

// Send notification
const sendNotification = async (notificationData) => {
  const response = await api.post('/notifications/send', notificationData);
  return response.data;
};

// Get notification logs
const getNotificationLogs = async (params) => {
  const response = await api.get('/notifications/logs', { params });
  return response.data;
};

// Send reminder notifications for upcoming bookings
const sendReminderNotifications = async () => {
  const response = await api.post('/notifications/send-reminders');
  return response.data;
};

const notificationService = {
  sendNotification,
  getNotificationLogs,
  sendReminderNotifications
};

export default notificationService;
