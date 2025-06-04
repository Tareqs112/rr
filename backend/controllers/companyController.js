const { Company, Customer, Booking, Payment, HotelBooking, FlightBooking, TourPackage } = require('../models');
const { Op } = require('sequelize');

/**
 * وحدة التحكم بالشركات
 */

// الحصول على جميع الشركات
const getAllCompanies = async (req, res) => {
  try {
    // تطبيق عزل المستأجرين
    const tenantId = req.tenantId;
    
    const companies = await Company.findAll({
      where: { tenant_id: tenantId },
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error('خطأ في الحصول على الشركات:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات الشركات'
    });
  }
};

// الحصول على شركة محددة بواسطة المعرف
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    const company = await Company.findOne({
      where: { 
        id,
        tenant_id: tenantId
      }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('خطأ في الحصول على الشركة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات الشركة'
    });
  }
};

// إنشاء شركة جديدة
const createCompany = async (req, res) => {
  try {
    const { name, contact_person, phone, email, address, tax_number, notes } = req.body;
    const tenantId = req.tenantId;
    
    // التحقق من البيانات المطلوبة
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'اسم الشركة مطلوب'
      });
    }
    
    // إنشاء الشركة
    const company = await Company.create({
      name,
      contact_person,
      phone,
      email,
      address,
      tax_number,
      notes,
      tenant_id: tenantId
    });
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء الشركة بنجاح',
      data: company
    });
  } catch (error) {
    console.error('خطأ في إنشاء الشركة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء الشركة'
    });
  }
};

// تحديث بيانات شركة
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_person, phone, email, address, tax_number, notes } = req.body;
    const tenantId = req.tenantId;
    
    const company = await Company.findOne({
      where: { 
        id,
        tenant_id: tenantId
      }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }
    
    // تحديث بيانات الشركة
    await company.update({
      name: name || company.name,
      contact_person: contact_person !== undefined ? contact_person : company.contact_person,
      phone: phone !== undefined ? phone : company.phone,
      email: email !== undefined ? email : company.email,
      address: address !== undefined ? address : company.address,
      tax_number: tax_number !== undefined ? tax_number : company.tax_number,
      notes: notes !== undefined ? notes : company.notes
    });
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات الشركة بنجاح',
      data: company
    });
  } catch (error) {
    console.error('خطأ في تحديث الشركة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث بيانات الشركة'
    });
  }
};

// حذف شركة
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    const company = await Company.findOne({
      where: { 
        id,
        tenant_id: tenantId
      }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }
    
    // التحقق من وجود عملاء مرتبطين بالشركة
    const customersCount = await Customer.count({
      where: { company_id: id }
    });
    
    if (customersCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف الشركة لأنها مرتبطة بعملاء'
      });
    }
    
    // حذف الشركة
    await company.destroy();
    
    res.status(200).json({
      success: true,
      message: 'تم حذف الشركة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف الشركة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الشركة'
    });
  }
};

// الحصول على عملاء شركة محددة
const getCompanyCustomers = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    // التحقق من وجود الشركة
    const company = await Company.findOne({
      where: { 
        id,
        tenant_id: tenantId
      }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }
    
    // الحصول على عملاء الشركة
    const customers = await Customer.findAll({
      where: { 
        company_id: id,
        tenant_id: tenantId
      },
      order: [['full_name', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('خطأ في الحصول على عملاء الشركة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات عملاء الشركة'
    });
  }
};

// الحصول على حجوزات شركة محددة
const getCompanyBookings = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    // التحقق من وجود الشركة
    const company = await Company.findOne({
      where: { 
        id,
        tenant_id: tenantId
      }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }
    
    // الحصول على معرفات عملاء الشركة
    const customers = await Customer.findAll({
      where: { 
        company_id: id,
        tenant_id: tenantId
      },
      attributes: ['id']
    });
    
    const customerIds = customers.map(customer => customer.id);
    
    // الحصول على حجوزات السيارات
    const carBookings = await Booking.findAll({
      where: { 
        customer_id: { [Op.in]: customerIds },
        tenant_id: tenantId
      },
      include: [
        { model: Customer, as: 'customer' }
      ],
      order: [['pickup_date', 'DESC']]
    });
    
    // الحصول على حجوزات الفنادق
    const hotelBookings = await HotelBooking.findAll({
      where: { 
        [Op.or]: [
          { customer_id: { [Op.in]: customerIds } },
          { company_id: id }
        ],
        tenant_id: tenantId
      },
      include: [
        { model: Customer, as: 'customer' }
      ],
      order: [['check_in_date', 'DESC']]
    });
    
    // الحصول على حجوزات الطيران
    const flightBookings = await FlightBooking.findAll({
      where: { 
        [Op.or]: [
          { customer_id: { [Op.in]: customerIds } },
          { company_id: id }
        ],
        tenant_id: tenantId
      },
      include: [
        { model: Customer, as: 'customer' }
      ],
      order: [['departure_date', 'DESC']]
    });
    
    // الحصول على الباقات السياحية
    const tourPackages = await TourPackage.findAll({
      where: { 
        [Op.or]: [
          { customer_id: { [Op.in]: customerIds } },
          { company_id: id }
        ],
        tenant_id: tenantId
      },
      include: [
        { model: Customer, as: 'customer' }
      ],
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
    console.error('خطأ في الحصول على حجوزات الشركة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات حجوزات الشركة'
    });
  }
};

// الحصول على تقرير مالي للشركة
const getCompanyFinancialReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;
    const tenantId = req.tenantId;
    
    // التحقق من وجود الشركة
    const company = await Company.findOne({
      where: { 
        id,
        tenant_id: tenantId
      }
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }
    
    // إنشاء شرط التاريخ
    const dateCondition = {};
    if (start_date && end_date) {
      dateCondition.createdAt = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    } else if (start_date) {
      dateCondition.createdAt = {
        [Op.gte]: new Date(start_date)
      };
    } else if (end_date) {
      dateCondition.createdAt = {
        [Op.lte]: new Date(end_date)
      };
    }
    
    // الحصول على معرفات عملاء الشركة
    const customers = await Customer.findAll({
      where: { 
        company_id: id,
        tenant_id: tenantId
      },
      attributes: ['id']
    });
    
    const customerIds = customers.map(customer => customer.id);
    
    // الحصول على المدفوعات
    const payments = await Payment.findAll({
      where: { 
        customer_id: { [Op.in]: customerIds },
        tenant_id: tenantId,
        ...dateCondition
      },
      include: [
        { model: Customer, as: 'customer' }
      ],
      order: [['payment_date', 'DESC']]
    });
    
    // حساب إجمالي المدفوعات
    const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
    // حساب إجمالي الرصيد المستحق لجميع العملاء
    const customers_with_balance = await Customer.findAll({
      where: { 
        company_id: id,
        tenant_id: tenantId
      },
      attributes: ['id', 'full_name', 'balance']
    });
    
    const totalBalance = customers_with_balance.reduce((sum, customer) => sum + parseFloat(customer.balance), 0);
    
    res.status(200).json({
      success: true,
      data: {
        company: {
          id: company.id,
          name: company.name
        },
        report_period: {
          start_date: start_date || 'غير محدد',
          end_date: end_date || 'غير محدد'
        },
        total_payments: totalAmount,
        total_balance: totalBalance,
        payments,
        customers_with_balance
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على التقرير المالي للشركة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التقرير المالي للشركة'
    });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyCustomers,
  getCompanyBookings,
  getCompanyFinancialReport
};
