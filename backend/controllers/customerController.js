const { Customer, Company, Booking, Payment, HotelBooking, FlightBooking, TourPackage } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

/**
 * وحدة التحكم بالعملاء
 */

// الحصول على جميع العملاء
const getAllCustomers = async (req, res) => {
  try {
    // تطبيق عزل المستأجرين
    const tenantId = req.tenantId;
    
    const customers = await Customer.findAll({
      where: { tenant_id: tenantId },
      include: [
        { model: Company, as: 'company' }
      ],
      order: [['full_name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('خطأ في الحصول على العملاء:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات العملاء'
    });
  }
};

// الحصول على عميل محدد بواسطة المعرف
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    const customer = await Customer.findOne({
      where: { 
        id,
        tenant_id: tenantId
      },
      include: [
        { model: Company, as: 'company' }
      ]
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('خطأ في الحصول على العميل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات العميل'
    });
  }
};

// إنشاء عميل جديد
const createCustomer = async (req, res) => {
  try {
    const { full_name, nationality, phone, whatsapp, company_id, is_vip, is_repeat_customer, notes } = req.body;
    const tenantId = req.tenantId;
    
    // التحقق من البيانات المطلوبة
    if (!full_name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'الاسم الكامل ورقم الهاتف مطلوبان'
      });
    }
    
    // التحقق من وجود الشركة إذا تم توفير معرفها
    if (company_id) {
      const company = await Company.findOne({
        where: { 
          id: company_id,
          tenant_id: tenantId
        }
      });
      
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'الشركة غير موجودة'
        });
      }
    }
    
    // إنشاء العميل
    const customer = await Customer.create({
      full_name,
      nationality,
      phone,
      whatsapp: whatsapp || phone,
      company_id,
      is_vip: is_vip || false,
      is_repeat_customer: is_repeat_customer || false,
      balance: 0.00,
      notes,
      tenant_id: tenantId
    });
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء العميل بنجاح',
      data: customer
    });
  } catch (error) {
    console.error('خطأ في إنشاء العميل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء العميل'
    });
  }
};

// تحديث بيانات عميل
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, nationality, phone, whatsapp, company_id, is_vip, is_repeat_customer, notes } = req.body;
    const tenantId = req.tenantId;
    
    const customer = await Customer.findOne({
      where: { 
        id,
        tenant_id: tenantId
      }
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }
    
    // التحقق من وجود الشركة إذا تم توفير معرفها
    if (company_id) {
      const company = await Company.findOne({
        where: { 
          id: company_id,
          tenant_id: tenantId
        }
      });
      
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'الشركة غير موجودة'
        });
      }
    }
    
    // تحديث بيانات العميل
    await customer.update({
      full_name: full_name || customer.full_name,
      nationality: nationality !== undefined ? nationality : customer.nationality,
      phone: phone || customer.phone,
      whatsapp: whatsapp !== undefined ? whatsapp : customer.whatsapp,
      company_id: company_id !== undefined ? company_id : customer.company_id,
      is_vip: is_vip !== undefined ? is_vip : customer.is_vip,
      is_repeat_customer: is_repeat_customer !== undefined ? is_repeat_customer : customer.is_repeat_customer,
      notes: notes !== undefined ? notes : customer.notes
    });
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات العميل بنجاح',
      data: customer
    });
  } catch (error) {
    console.error('خطأ في تحديث العميل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث بيانات العميل'
    });
  }
};

// حذف عميل
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    const customer = await Customer.findOne({
      where: { 
        id,
        tenant_id: tenantId
      }
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }
    
    // التحقق من وجود حجوزات مرتبطة بالعميل
    const bookingsCount = await Booking.count({
      where: { customer_id: id }
    });
    
    if (bookingsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف العميل لأنه مرتبط بحجوزات'
      });
    }
    
    // حذف العميل
    await customer.destroy();
    
    res.status(200).json({
      success: true,
      message: 'تم حذف العميل بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف العميل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف العميل'
    });
  }
};

// الحصول على حجوزات عميل محدد
const getCustomerBookings = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    // التحقق من وجود العميل
    const customer = await Customer.findOne({
      where: { 
        id,
        tenant_id: tenantId
      }
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }
    
    // الحصول على حجوزات السيارات
    const carBookings = await Booking.findAll({
      where: { 
        customer_id: id,
        tenant_id: tenantId
      },
      order: [['pickup_date', 'DESC']]
    });
    
    // الحصول على حجوزات الفنادق
    const hotelBookings = await HotelBooking.findAll({
      where: { 
        customer_id: id,
        tenant_id: tenantId
      },
      order: [['check_in_date', 'DESC']]
    });
    
    // الحصول على حجوزات الطيران
    const flightBookings = await FlightBooking.findAll({
      where: { 
        customer_id: id,
        tenant_id: tenantId
      },
      order: [['departure_date', 'DESC']]
    });
    
    // الحصول على الباقات السياحية
    const tourPackages = await TourPackage.findAll({
      where: { 
        customer_id: id,
        tenant_id: tenantId
      },
      order: [['start_date', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: {
        carBookings,
        hotelBookings,
        flightBookings,
        tourPackages
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على حجوزات العميل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات حجوزات العميل'
    });
  }
};

// الحصول على المعاملات المالية للعميل
const getCustomerFinancials = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    // التحقق من وجود العميل
    const customer = await Customer.findOne({
      where: { 
        id,
        tenant_id: tenantId
      }
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }
    
    // الحصول على المدفوعات
    const payments = await Payment.findAll({
      where: { 
        customer_id: id,
        tenant_id: tenantId
      },
      order: [['payment_date', 'DESC']]
    });
    
    // حساب إجمالي المدفوعات
    const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
    // الحصول على إجمالي المبالغ المستحقة من جميع الحجوزات
    const carBookingsTotal = await Booking.sum('total_amount', {
      where: { 
        customer_id: id,
        tenant_id: tenantId,
        payment_status: { [Op.ne]: 'paid' }
      }
    }) || 0;
    
    const hotelBookingsTotal = await HotelBooking.sum('total_amount', {
      where: { 
        customer_id: id,
        tenant_id: tenantId,
        payment_status: { [Op.ne]: 'paid' }
      }
    }) || 0;
    
    const flightBookingsTotal = await FlightBooking.sum('total_amount', {
      where: { 
        customer_id: id,
        tenant_id: tenantId,
        payment_status: { [Op.ne]: 'paid' }
      }
    }) || 0;
    
    const tourPackagesTotal = await TourPackage.sum('total_amount', {
      where: { 
        customer_id: id,
        tenant_id: tenantId,
        payment_status: { [Op.ne]: 'paid' }
      }
    }) || 0;
    
    // إجمالي المبالغ المستحقة
    const totalDue = parseFloat(carBookingsTotal) + parseFloat(hotelBookingsTotal) + 
                    parseFloat(flightBookingsTotal) + parseFloat(tourPackagesTotal);
    
    // تحديث رصيد العميل
    const balance = totalDue - totalPaid;
    await customer.update({ balance });
    
    res.status(200).json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          full_name: customer.full_name,
          balance
        },
        financial_summary: {
          total_due: totalDue,
          total_paid: totalPaid,
          balance
        },
        payments,
        pending_bookings: {
          car_bookings_total: carBookingsTotal,
          hotel_bookings_total: hotelBookingsTotal,
          flight_bookings_total: flightBookingsTotal,
          tour_packages_total: tourPackagesTotal
        }
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على المعاملات المالية للعميل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات المالية للعميل'
    });
  }
};

// البحث عن العملاء
const searchCustomers = async (req, res) => {
  try {
    const { query, company_id, is_vip, is_repeat_customer } = req.query;
    const tenantId = req.tenantId;
    
    const whereClause = { tenant_id: tenantId };
    
    if (query) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${query}%` } },
        { phone: { [Op.like]: `%${query}%` } },
        { whatsapp: { [Op.like]: `%${query}%` } }
      ];
    }
    
    if (company_id) {
      whereClause.company_id = company_id;
    }
    
    if (is_vip !== undefined) {
      whereClause.is_vip = is_vip === 'true';
    }
    
    if (is_repeat_customer !== undefined) {
      whereClause.is_repeat_customer = is_repeat_customer === 'true';
    }
    
    const customers = await Customer.findAll({
      where: whereClause,
      include: [
        { model: Company, as: 'company' }
      ],
      order: [['full_name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('خطأ في البحث عن العملاء:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء البحث عن العملاء'
    });
  }
};

// إنشاء فاتورة (دفعة) جديدة للعميل
const createCustomerPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_method, reference_number, notes, booking_id } = req.body;
    const tenantId = req.tenantId;
    
    // التحقق من وجود العميل
    const customer = await Customer.findOne({
      where: { 
        id,
        tenant_id: tenantId
      }
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }
    
    // التحقق من البيانات المطلوبة
    if (!amount || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'المبلغ وطريقة الدفع مطلوبان'
      });
    }
    
    // التحقق من وجود الحجز إذا تم توفير معرفه
    if (booking_id) {
      const booking = await Booking.findOne({
        where: { 
          id: booking_id,
          tenant_id: tenantId
        }
      });
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'الحجز غير موجود'
        });
      }
    }
    
    // إنشاء الدفعة
    const payment = await Payment.create({
      customer_id: id,
      booking_id,
      amount,
      payment_date: new Date(),
      payment_method,
      reference_number,
      notes,
      status: 'completed',
      tenant_id: tenantId,
      company_id: customer.company_id
    });
    
    // تحديث رصيد العميل
    const newBalance = parseFloat(customer.balance) - parseFloat(amount);
    await customer.update({ balance: newBalance });
    
    // تحديث حالة الدفع للحجز إذا تم توفير معرفه
    if (booking_id) {
      const booking = await Booking.findByPk(booking_id);
      if (booking) {
        await booking.update({ payment_status: 'paid' });
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء الدفعة بنجاح',
      data: {
        payment,
        customer: {
          id: customer.id,
          full_name: customer.full_name,
          new_balance: newBalance
        }
      }
    });
  } catch (error) {
    console.error('خطأ في إنشاء دفعة للعميل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء الدفعة'
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerBookings,
  getCustomerFinancials,
  searchCustomers,
  createCustomerPayment
};
