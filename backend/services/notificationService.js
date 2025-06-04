const twilio = require('twilio');
const notificationConfig = require('../config/notification');
const Notification = require('../models/Notification');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');

// Initialize Twilio client with validation
let twilioClient = null;
try {
  // Only initialize if credentials are valid (starting with AC)
  if (notificationConfig.TWILIO_ACCOUNT_SID.startsWith('AC') && 
      notificationConfig.TWILIO_AUTH_TOKEN && 
      notificationConfig.TWILIO_PHONE_NUMBER) {
    twilioClient = twilio(
      notificationConfig.TWILIO_ACCOUNT_SID,
      notificationConfig.TWILIO_AUTH_TOKEN
    );
  }
} catch (error) {
  console.warn('Twilio client initialization skipped or failed:', error.message);
}

// Send SMS notification
const sendSMS = async (to, message) => {
  try {
    // Check if SMS is enabled and Twilio client is initialized
    if (!notificationConfig.SMS_ENABLED || !twilioClient) {
      console.log('SMS sending skipped: SMS disabled or Twilio not configured');
      return {
        success: false,
        error: 'SMS service not available'
      };
    }
    
    const result = await twilioClient.messages.create({
      body: message,
      from: notificationConfig.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    return {
      success: true,
      sid: result.sid,
      status: result.status
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send WhatsApp notification
const sendWhatsApp = async (to, message) => {
  try {
    // Check if WhatsApp is enabled and Twilio client is initialized
    if (!notificationConfig.WHATSAPP_ENABLED || !twilioClient) {
      console.log('WhatsApp sending skipped: WhatsApp disabled or Twilio not configured');
      return {
        success: false,
        error: 'WhatsApp service not available'
      };
    }
    
    // Format WhatsApp number with whatsapp: prefix
    const formattedTo = `whatsapp:${to}`;
    const formattedFrom = `whatsapp:${notificationConfig.TWILIO_PHONE_NUMBER}`;
    
    const result = await twilioClient.messages.create({
      body: message,
      from: formattedFrom,
      to: formattedTo
    });
    
    return {
      success: true,
      sid: result.sid,
      status: result.status
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create notification record
const createNotification = async (data) => {
  try {
    const notification = await Notification.create({
      booking_id: data.booking_id,
      recipient: data.to,
      type: data.type,
      message: data.message,
      status: 'pending'
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating notification record:', error);
    throw error;
  }
};

// Update notification status
const updateNotificationStatus = async (id, status, error = null) => {
  try {
    const updateData = {
      status: status,
      sent_at: status === 'sent' ? new Date() : null
    };
    
    if (error) {
      updateData.error_message = error;
    }
    
    await Notification.update(updateData, {
      where: { id }
    });
  } catch (error) {
    console.error('Error updating notification status:', error);
    throw error;
  }
};

// Send notification (SMS or WhatsApp)
const sendNotification = async (data) => {
  try {
    // Create notification record
    const notification = await createNotification(data);
    
    let result = { success: false, error: 'Invalid notification type or service not available' };
    
    // Send notification based on type
    if (data.type === 'sms') {
      result = await sendSMS(data.to, data.message);
    } else if (data.type === 'whatsapp') {
      result = await sendWhatsApp(data.to, data.message);
    } else {
      throw new Error('Invalid notification type');
    }
    
    // Update notification status
    if (result.success) {
      await updateNotificationStatus(notification.id, 'sent');
    } else {
      await updateNotificationStatus(notification.id, 'failed', result.error);
    }
    
    return {
      success: result.success,
      notification_id: notification.id,
      message: result.success ? 'Notification sent successfully' : 'Failed to send notification',
      error: result.error
    };
  } catch (error) {
    console.error('Error in sendNotification:', error);
    return {
      success: false,
      message: 'Error processing notification',
      error: error.message
    };
  }
};

// Send booking confirmation notification
const sendBookingConfirmation = async (bookingId) => {
  try {
    // Get booking details with customer
    const booking = await Booking.findOne({
      where: { id: bookingId },
      include: [
        { model: Customer }
      ]
    });
    
    if (!booking || !booking.Customer) {
      throw new Error('Booking or customer not found');
    }
    
    const customer = booking.Customer;
    
    // Check if customer has phone number
    if (!customer.phone) {
      throw new Error('Customer has no phone number');
    }
    
    // Prepare message
    const message = `Your booking (${booking.booking_id}) has been confirmed. Pickup: ${booking.pickup_date} at ${booking.pickup_time}. Thank you for choosing our service!`;
    
    // Determine notification type (prefer WhatsApp if available)
    const notificationType = customer.whatsapp && notificationConfig.WHATSAPP_ENABLED ? 'whatsapp' : 'sms';
    const recipient = customer.whatsapp || customer.phone;
    
    // Send notification
    return await sendNotification({
      booking_id: booking.id,
      to: recipient,
      type: notificationType,
      message: message
    });
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return {
      success: false,
      message: 'Failed to send booking confirmation',
      error: error.message
    };
  }
};

// Send booking reminder notification
const sendBookingReminder = async (bookingId) => {
  try {
    // Get booking details with customer
    const booking = await Booking.findOne({
      where: { id: bookingId },
      include: [
        { model: Customer }
      ]
    });
    
    if (!booking || !booking.Customer) {
      throw new Error('Booking or customer not found');
    }
    
    const customer = booking.Customer;
    
    // Check if customer has phone number
    if (!customer.phone) {
      throw new Error('Customer has no phone number');
    }
    
    // Prepare message
    const message = `Reminder: Your booking (${booking.booking_id}) is scheduled for tomorrow at ${booking.pickup_time}. Pickup location: ${booking.pickup_location}. Thank you!`;
    
    // Determine notification type (prefer WhatsApp if available)
    const notificationType = customer.whatsapp && notificationConfig.WHATSAPP_ENABLED ? 'whatsapp' : 'sms';
    const recipient = customer.whatsapp || customer.phone;
    
    // Send notification
    return await sendNotification({
      booking_id: booking.id,
      to: recipient,
      type: notificationType,
      message: message
    });
  } catch (error) {
    console.error('Error sending booking reminder:', error);
    return {
      success: false,
      message: 'Failed to send booking reminder',
      error: error.message
    };
  }
};

// Get all notifications
const getAllNotifications = async (filters = {}) => {
  try {
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.booking_id) {
      where.booking_id = filters.booking_id;
    }
    
    const notifications = await Notification.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        { model: Booking }
      ]
    });
    
    return {
      success: true,
      notifications
    };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return {
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    };
  }
};

// Check if notification service is available
const checkNotificationService = () => {
  const smsAvailable = notificationConfig.SMS_ENABLED;
  const whatsappAvailable = notificationConfig.WHATSAPP_ENABLED;
  const twilioConfigured = notificationConfig.TWILIO_ACCOUNT_SID.startsWith('AC') && 
                          notificationConfig.TWILIO_AUTH_TOKEN && 
                          notificationConfig.TWILIO_PHONE_NUMBER;
  
  return {
    success: true,
    sms_available: smsAvailable && twilioConfigured,
    whatsapp_available: whatsappAvailable && twilioConfigured,
    twilio_configured: twilioConfigured
  };
};

module.exports = {
  sendNotification,
  sendBookingConfirmation,
  sendBookingReminder,
  getAllNotifications,
  checkNotificationService
};
