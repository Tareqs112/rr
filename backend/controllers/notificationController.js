const Notification = require('../models/Notification');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const notificationConfig = require('../config/notification');
const { Op } = require('sequelize');
const moment = require('moment');

// Mock Twilio client for development
const mockTwilioClient = {
  messages: {
    create: async (messageData) => {
      console.log('Mock SMS sent:', messageData);
      return { sid: 'mock-sid-' + Date.now() };
    }
  }
};

// Initialize Twilio client
let twilioClient;

try {
  // In production, use actual Twilio client
  if (process.env.NODE_ENV === 'production' && 
      notificationConfig.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid' && 
      notificationConfig.TWILIO_AUTH_TOKEN !== 'your_twilio_auth_token') {
    const twilio = require('twilio');
    twilioClient = twilio(notificationConfig.TWILIO_ACCOUNT_SID, notificationConfig.TWILIO_AUTH_TOKEN);
  } else {
    // Use mock client for development
    twilioClient = mockTwilioClient;
  }
} catch (error) {
  console.error('Twilio initialization error:', error);
  twilioClient = mockTwilioClient;
}

// Send notification
const sendNotification = async (req, res) => {
  try {
    const { booking_id, type, recipient, message } = req.body;
    
    // Validate booking exists
    const booking = await Booking.findByPk(booking_id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Create notification record
    const notification = await Notification.create({
      booking_id,
      type: type || 'sms',
      recipient,
      message,
      status: 'sent',
      sent_at: new Date()
    });
    
    // Send actual notification via Twilio
    try {
      if (type === 'whatsapp' && notificationConfig.WHATSAPP_ENABLED) {
        // Send WhatsApp message
        await twilioClient.messages.create({
          body: message,
          from: `whatsapp:${notificationConfig.TWILIO_PHONE_NUMBER}`,
          to: `whatsapp:${recipient}`
        });
      } else {
        // Send SMS
        await twilioClient.messages.create({
          body: message,
          from: notificationConfig.TWILIO_PHONE_NUMBER,
          to: recipient
        });
      }
    } catch (twilioError) {
      console.error('Twilio send error:', twilioError);
      
      // Update notification status to failed
      await notification.update({
        status: 'failed'
      });
      
      return res.status(500).json({ 
        message: 'Failed to send notification',
        error: twilioError.message
      });
    }
    
    res.status(200).json({
      message: 'Notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get notification logs
const getNotificationLogs = async (req, res) => {
  try {
    const { booking_id, status, start_date, end_date } = req.query;
    
    const whereClause = {};
    
    if (booking_id) {
      whereClause.booking_id = booking_id;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (start_date && end_date) {
      whereClause.sent_at = {
        [Op.between]: [start_date, end_date]
      };
    }
    
    const notifications = await Notification.findAll({
      where: whereClause,
      include: [
        { 
          model: Booking, 
          as: 'booking',
          include: [
            { model: Customer, as: 'customer' },
            { model: Vehicle, as: 'vehicle' }
          ]
        }
      ],
      order: [['sent_at', 'DESC']]
    });
    
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Get notification logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send reminder notifications for upcoming bookings
const sendReminderNotifications = async (req, res) => {
  try {
    // Get bookings with pickup in the next 24 hours
    const tomorrow = moment().add(24, 'hours').format('YYYY-MM-DD HH:mm:ss');
    const today = moment().format('YYYY-MM-DD HH:mm:ss');
    
    const upcomingBookings = await Booking.findAll({
      where: sequelize.literal(`CONCAT(pickup_date, ' ', pickup_time) BETWEEN '${today}' AND '${tomorrow}'`),
      include: [
        { model: Customer, as: 'customer' },
        { model: Vehicle, as: 'vehicle' },
        { model: Driver, as: 'driver' }
      ]
    });
    
    const results = [];
    
    // Send notifications for each booking
    for (const booking of upcomingBookings) {
      // Check if notification already sent
      const existingNotification = await Notification.findOne({
        where: { booking_id: booking.id }
      });
      
      if (existingNotification) {
        results.push({
          booking_id: booking.id,
          status: 'skipped',
          message: 'Notification already sent'
        });
        continue;
      }
      
      const customer = booking.customer;
      const vehicle = booking.vehicle;
      const driver = booking.driver;
      
      if (!customer || !vehicle) {
        results.push({
          booking_id: booking.id,
          status: 'failed',
          message: 'Missing customer or vehicle information'
        });
        continue;
      }
      
      // Create message
      const message = `Hello ${customer.full_name}, your rental car ${vehicle.license_plate} will be delivered on ${booking.pickup_date} at ${booking.pickup_time}. ${driver ? `Driver: ${driver.name}, Phone: ${driver.phone}` : 'No driver assigned.'}`;
      
      // Determine notification type and recipient
      const type = customer.whatsapp && notificationConfig.WHATSAPP_ENABLED ? 'whatsapp' : 'sms';
      const recipient = type === 'whatsapp' ? customer.whatsapp : customer.phone;
      
      try {
        // Create notification record
        const notification = await Notification.create({
          booking_id: booking.id,
          type,
          recipient,
          message,
          status: 'sent',
          sent_at: new Date()
        });
        
        // Send actual notification via Twilio
        if (type === 'whatsapp') {
          await twilioClient.messages.create({
            body: message,
            from: `whatsapp:${notificationConfig.TWILIO_PHONE_NUMBER}`,
            to: `whatsapp:${recipient}`
          });
        } else {
          await twilioClient.messages.create({
            body: message,
            from: notificationConfig.TWILIO_PHONE_NUMBER,
            to: recipient
          });
        }
        
        results.push({
          booking_id: booking.id,
          notification_id: notification.id,
          status: 'sent',
          message: 'Notification sent successfully'
        });
      } catch (error) {
        console.error(`Error sending notification for booking ${booking.id}:`, error);
        
        results.push({
          booking_id: booking.id,
          status: 'failed',
          message: error.message
        });
      }
    }
    
    res.status(200).json({
      message: `Processed ${upcomingBookings.length} upcoming bookings`,
      results
    });
  } catch (error) {
    console.error('Send reminder notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendNotification,
  getNotificationLogs,
  sendReminderNotifications
};
