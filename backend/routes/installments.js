const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

// استيراد وحدة التحكم بالأقساط
const InstallmentController = {
  // الحصول على جميع الأقساط
  async getAllInstallments(req, res) {
    try {
      const { tenant_id } = req.user;
      const { Installment, Payment, Customer, Company } = req.app.get('db');
      
      const installments = await Installment.findAll({
        where: { tenant_id },
        include: [
          { model: Payment },
          { model: Customer },
          { model: Company }
        ]
      });
      
      return res.status(200).json(installments);
    } catch (error) {
      console.error('Error fetching installments:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب الأقساط' });
    }
  },
  
  // الحصول على قسط محدد
  async getInstallmentById(req, res) {
    try {
      const { tenant_id } = req.user;
      const { id } = req.params;
      const { Installment, Payment, Customer, Company } = req.app.get('db');
      
      const installment = await Installment.findOne({
        where: { id, tenant_id },
        include: [
          { model: Payment },
          { model: Customer },
          { model: Company }
        ]
      });
      
      if (!installment) {
        return res.status(404).json({ message: 'القسط غير موجود' });
      }
      
      return res.status(200).json(installment);
    } catch (error) {
      console.error('Error fetching installment:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب القسط' });
    }
  },
  
  // إنشاء خطة أقساط جديدة
  async createInstallmentPlan(req, res) {
    try {
      const { tenant_id } = req.user;
      const { 
        payment_id,
        customer_id,
        company_id,
        total_amount,
        number_of_installments,
        first_payment_date,
        payment_interval_days
      } = req.body;
      
      const { Installment, Payment } = req.app.get('db');
      
      // التحقق من وجود الدفعة
      if (payment_id) {
        const payment = await Payment.findOne({
          where: { id: payment_id, tenant_id }
        });
        
        if (!payment) {
          return res.status(404).json({ message: 'الدفعة غير موجودة' });
        }
      }
      
      // حساب قيمة القسط الواحد
      const installmentAmount = total_amount / number_of_installments;
      
      // إنشاء الأقساط
      const installments = [];
      let currentDate = new Date(first_payment_date);
      
      for (let i = 0; i < number_of_installments; i++) {
        const installment = await Installment.create({
          payment_id,
          customer_id,
          company_id,
          amount: installmentAmount,
          due_date: new Date(currentDate),
          status: i === 0 ? 'paid' : 'pending',
          installment_number: i + 1,
          total_installments: number_of_installments,
          tenant_id
        });
        
        installments.push(installment);
        
        // إضافة فترة الدفع للتاريخ التالي
        currentDate.setDate(currentDate.getDate() + payment_interval_days);
      }
      
      return res.status(201).json({
        message: 'تم إنشاء خطة الأقساط بنجاح',
        installments
      });
    } catch (error) {
      console.error('Error creating installment plan:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء خطة الأقساط' });
    }
  },
  
  // تسجيل دفع قسط
  async payInstallment(req, res) {
    try {
      const { tenant_id } = req.user;
      const { id } = req.params;
      const { payment_method, payment_reference } = req.body;
      
      const { Installment, Payment } = req.app.get('db');
      
      const installment = await Installment.findOne({
        where: { id, tenant_id }
      });
      
      if (!installment) {
        return res.status(404).json({ message: 'القسط غير موجود' });
      }
      
      if (installment.status === 'paid') {
        return res.status(400).json({ message: 'تم دفع هذا القسط بالفعل' });
      }
      
      // إنشاء سجل دفع جديد إذا لم يكن مرتبطاً بدفعة موجودة
      if (!installment.payment_id) {
        const payment = await Payment.create({
          customer_id: installment.customer_id,
          company_id: installment.company_id,
          amount: installment.amount,
          payment_method,
          payment_reference,
          payment_date: new Date(),
          status: 'completed',
          tenant_id
        });
        
        installment.payment_id = payment.id;
      }
      
      // تحديث حالة القسط
      await installment.update({
        status: 'paid',
        payment_date: new Date()
      });
      
      return res.status(200).json({
        message: 'تم تسجيل دفع القسط بنجاح',
        installment
      });
    } catch (error) {
      console.error('Error paying installment:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء تسجيل دفع القسط' });
    }
  },
  
  // الحصول على الأقساط المستحقة
  async getDueInstallments(req, res) {
    try {
      const { tenant_id } = req.user;
      const { days_ahead = 7 } = req.query;
      
      const { Installment, Customer, Company } = req.app.get('db');
      
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + parseInt(days_ahead));
      
      const installments = await Installment.findAll({
        where: {
          tenant_id,
          status: 'pending',
          due_date: {
            [Op.between]: [today, futureDate]
          }
        },
        include: [
          { model: Customer },
          { model: Company }
        ],
        order: [['due_date', 'ASC']]
      });
      
      return res.status(200).json(installments);
    } catch (error) {
      console.error('Error fetching due installments:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب الأقساط المستحقة' });
    }
  },
  
  // الحصول على الأقساط المتأخرة
  async getOverdueInstallments(req, res) {
    try {
      const { tenant_id } = req.user;
      
      const { Installment, Customer, Company } = req.app.get('db');
      
      const today = new Date();
      
      const installments = await Installment.findAll({
        where: {
          tenant_id,
          status: 'pending',
          due_date: {
            [Op.lt]: today
          }
        },
        include: [
          { model: Customer },
          { model: Company }
        ],
        order: [['due_date', 'ASC']]
      });
      
      return res.status(200).json(installments);
    } catch (error) {
      console.error('Error fetching overdue installments:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب الأقساط المتأخرة' });
    }
  },
  
  // الحصول على ملخص الأقساط حسب العميل
  async getInstallmentSummaryByCustomer(req, res) {
    try {
      const { tenant_id } = req.user;
      
      const { Installment, Customer } = req.app.get('db');
      const { sequelize } = req.app.get('db');
      
      const summary = await Installment.findAll({
        attributes: [
          'customer_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_installments'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
          [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'paid' THEN amount ELSE 0 END")), 'paid_amount'],
          [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'pending' THEN amount ELSE 0 END")), 'pending_amount']
        ],
        where: { tenant_id },
        include: [{ model: Customer }],
        group: ['customer_id']
      });
      
      return res.status(200).json(summary);
    } catch (error) {
      console.error('Error fetching installment summary by customer:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب ملخص الأقساط حسب العميل' });
    }
  }
};

// تطبيق وسيط المصادقة على جميع مسارات الأقساط
router.use(authMiddleware);

// تعريف مسارات API للأقساط
router.get('/', InstallmentController.getAllInstallments);
router.get('/due', InstallmentController.getDueInstallments);
router.get('/overdue', InstallmentController.getOverdueInstallments);
router.get('/summary/customer', InstallmentController.getInstallmentSummaryByCustomer);
router.get('/:id', InstallmentController.getInstallmentById);
router.post('/plan', InstallmentController.createInstallmentPlan);
router.post('/:id/pay', InstallmentController.payInstallment);

module.exports = router;
