const { Payment, Customer, Company, Booking, Installment } = require('../models');
const { Op } = require('sequelize');

// وحدة التحكم بالمدفوعات والفواتير
const PaymentController = {
  // الحصول على جميع المدفوعات
  async getAllPayments(req, res) {
    try {
      const { tenant_id } = req.user;
      
      const payments = await Payment.findAll({
        where: { tenant_id },
        include: [
          { model: Customer },
          { model: Company },
          { model: Booking },
          { model: Installment }
        ]
      });
      
      return res.status(200).json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب المدفوعات' });
    }
  },
  
  // الحصول على مدفوعات عميل معين
  async getCustomerPayments(req, res) {
    try {
      const { tenant_id } = req.user;
      const { customerId } = req.params;
      
      const payments = await Payment.findAll({
        where: { 
          tenant_id,
          customer_id: customerId 
        },
        include: [
          { model: Booking },
          { model: Installment }
        ]
      });
      
      return res.status(200).json(payments);
    } catch (error) {
      console.error('Error fetching customer payments:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب مدفوعات العميل' });
    }
  },
  
  // الحصول على مدفوعات شركة معينة
  async getCompanyPayments(req, res) {
    try {
      const { tenant_id } = req.user;
      const { companyId } = req.params;
      
      const payments = await Payment.findAll({
        where: { 
          tenant_id,
          company_id: companyId 
        },
        include: [
          { model: Customer },
          { model: Booking },
          { model: Installment }
        ]
      });
      
      return res.status(200).json(payments);
    } catch (error) {
      console.error('Error fetching company payments:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب مدفوعات الشركة' });
    }
  },
  
  // إنشاء دفعة جديدة
  async createPayment(req, res) {
    try {
      const { tenant_id } = req.user;
      const {
        booking_id,
        customer_id,
        amount,
        payment_method,
        reference_number,
        notes,
        company_id
      } = req.body;
      
      // التحقق من وجود العميل
      const customer = await Customer.findOne({
        where: { id: customer_id, tenant_id }
      });
      
      if (!customer) {
        return res.status(404).json({ message: 'العميل غير موجود' });
      }
      
      // التحقق من وجود الحجز
      const booking = await Booking.findOne({
        where: { id: booking_id, tenant_id }
      });
      
      if (!booking) {
        return res.status(404).json({ message: 'الحجز غير موجود' });
      }
      
      // إنشاء الدفعة
      const payment = await Payment.create({
        booking_id,
        customer_id,
        amount,
        payment_date: new Date(),
        payment_method,
        reference_number,
        notes,
        company_id,
        tenant_id,
        status: 'completed'
      });
      
      // تحديث رصيد العميل
      await customer.update({
        balance: customer.balance - parseFloat(amount)
      });
      
      // إذا كانت هناك أقساط مرتبطة بالحجز، قم بتحديثها
      if (req.body.installment_id) {
        const installment = await Installment.findOne({
          where: { id: req.body.installment_id, tenant_id }
        });
        
        if (installment) {
          await installment.update({
            status: 'paid',
            payment_id: payment.id
          });
        }
      }
      
      return res.status(201).json(payment);
    } catch (error) {
      console.error('Error creating payment:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الدفعة' });
    }
  },
  
  // إنشاء أقساط للحجز
  async createInstallments(req, res) {
    try {
      const { tenant_id } = req.user;
      const { booking_id, installments } = req.body;
      
      // التحقق من وجود الحجز
      const booking = await Booking.findOne({
        where: { id: booking_id, tenant_id }
      });
      
      if (!booking) {
        return res.status(404).json({ message: 'الحجز غير موجود' });
      }
      
      // إنشاء الأقساط
      const createdInstallments = await Promise.all(
        installments.map(async (installment) => {
          return await Installment.create({
            booking_id,
            amount: installment.amount,
            due_date: installment.due_date,
            status: 'pending',
            notes: installment.notes,
            tenant_id
          });
        })
      );
      
      return res.status(201).json(createdInstallments);
    } catch (error) {
      console.error('Error creating installments:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الأقساط' });
    }
  },
  
  // الحصول على الأقساط المستحقة
  async getDueInstallments(req, res) {
    try {
      const { tenant_id } = req.user;
      const today = new Date();
      
      const dueInstallments = await Installment.findAll({
        where: {
          tenant_id,
          status: 'pending',
          due_date: {
            [Op.lte]: today
          }
        },
        include: [
          { 
            model: Booking,
            include: [{ model: Customer }]
          }
        ]
      });
      
      return res.status(200).json(dueInstallments);
    } catch (error) {
      console.error('Error fetching due installments:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب الأقساط المستحقة' });
    }
  },
  
  // إنشاء فاتورة (إيصال) للعميل
  async generateVoucher(req, res) {
    try {
      const { tenant_id } = req.user;
      const { payment_id } = req.params;
      
      const payment = await Payment.findOne({
        where: { id: payment_id, tenant_id },
        include: [
          { model: Customer },
          { model: Company },
          { 
            model: Booking,
            include: [
              { model: Vehicle },
              { model: Driver }
            ]
          }
        ]
      });
      
      if (!payment) {
        return res.status(404).json({ message: 'الدفعة غير موجودة' });
      }
      
      // إنشاء بيانات الفاتورة
      const voucher = {
        voucher_number: payment.voucher_number,
        payment_date: payment.payment_date,
        customer_name: payment.Customer.full_name,
        company_name: payment.Company ? payment.Company.name : null,
        booking_details: {
          id: payment.Booking.id,
          pickup_date: payment.Booking.pickup_date,
          return_date: payment.Booking.return_date,
          vehicle: payment.Booking.Vehicle ? payment.Booking.Vehicle.license_plate : null,
          driver: payment.Booking.Driver ? payment.Booking.Driver.name : null
        },
        amount: payment.amount,
        payment_method: payment.payment_method,
        reference_number: payment.reference_number,
        notes: payment.notes
      };
      
      return res.status(200).json(voucher);
    } catch (error) {
      console.error('Error generating voucher:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الفاتورة' });
    }
  },
  
  // الحصول على إجمالي المبالغ المستحقة لكل عميل
  async getCustomerBalances(req, res) {
    try {
      const { tenant_id } = req.user;
      
      const customers = await Customer.findAll({
        where: { tenant_id },
        attributes: ['id', 'full_name', 'balance', 'company_id'],
        include: [
          { 
            model: Company,
            attributes: ['id', 'name']
          }
        ]
      });
      
      return res.status(200).json(customers);
    } catch (error) {
      console.error('Error fetching customer balances:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب أرصدة العملاء' });
    }
  },
  
  // الحصول على إجمالي المبالغ المستحقة لكل شركة
  async getCompanyBalances(req, res) {
    try {
      const { tenant_id } = req.user;
      
      // الحصول على الشركات مع مجموع أرصدة عملائها
      const companies = await Company.findAll({
        where: { tenant_id },
        attributes: ['id', 'name'],
        include: [
          {
            model: Customer,
            attributes: ['id', 'full_name', 'balance']
          }
        ]
      });
      
      // حساب إجمالي الرصيد لكل شركة
      const companyBalances = companies.map(company => {
        const totalBalance = company.Customers.reduce((sum, customer) => {
          return sum + parseFloat(customer.balance || 0);
        }, 0);
        
        return {
          id: company.id,
          name: company.name,
          total_balance: totalBalance,
          customer_count: company.Customers.length
        };
      });
      
      return res.status(200).json(companyBalances);
    } catch (error) {
      console.error('Error fetching company balances:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب أرصدة الشركات' });
    }
  }
};

module.exports = PaymentController;
