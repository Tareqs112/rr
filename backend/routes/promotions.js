const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

// استيراد وحدة التحكم بالعروض والخصومات
const PromotionController = {
  // الحصول على جميع العروض
  async getAllPromotions(req, res) {
    try {
      const { tenant_id } = req.user;
      const { Promotion, Company } = req.app.get('db');
      
      const promotions = await Promotion.findAll({
        where: { tenant_id },
        include: [{ model: Company }]
      });
      
      return res.status(200).json(promotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب العروض' });
    }
  },
  
  // الحصول على عرض محدد
  async getPromotionById(req, res) {
    try {
      const { tenant_id } = req.user;
      const { id } = req.params;
      const { Promotion, Company, Customer } = req.app.get('db');
      
      const promotion = await Promotion.findOne({
        where: { id, tenant_id },
        include: [
          { model: Company },
          { model: Customer }
        ]
      });
      
      if (!promotion) {
        return res.status(404).json({ message: 'العرض غير موجود' });
      }
      
      return res.status(200).json(promotion);
    } catch (error) {
      console.error('Error fetching promotion:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب العرض' });
    }
  },
  
  // إنشاء عرض جديد
  async createPromotion(req, res) {
    try {
      const { tenant_id } = req.user;
      const { 
        name, 
        description, 
        start_date, 
        end_date, 
        discount_type, 
        discount_value,
        min_booking_value,
        max_discount_amount,
        company_id,
        applicable_services
      } = req.body;
      
      const { Promotion } = req.app.get('db');
      
      const promotion = await Promotion.create({
        name,
        description,
        start_date,
        end_date,
        discount_type,
        discount_value,
        min_booking_value,
        max_discount_amount,
        company_id,
        applicable_services,
        is_active: true,
        tenant_id
      });
      
      return res.status(201).json(promotion);
    } catch (error) {
      console.error('Error creating promotion:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء العرض' });
    }
  },
  
  // تحديث عرض
  async updatePromotion(req, res) {
    try {
      const { tenant_id } = req.user;
      const { id } = req.params;
      const { 
        name, 
        description, 
        start_date, 
        end_date, 
        discount_type, 
        discount_value,
        min_booking_value,
        max_discount_amount,
        company_id,
        applicable_services,
        is_active
      } = req.body;
      
      const { Promotion } = req.app.get('db');
      
      const promotion = await Promotion.findOne({
        where: { id, tenant_id }
      });
      
      if (!promotion) {
        return res.status(404).json({ message: 'العرض غير موجود' });
      }
      
      await promotion.update({
        name,
        description,
        start_date,
        end_date,
        discount_type,
        discount_value,
        min_booking_value,
        max_discount_amount,
        company_id,
        applicable_services,
        is_active
      });
      
      return res.status(200).json(promotion);
    } catch (error) {
      console.error('Error updating promotion:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء تحديث العرض' });
    }
  },
  
  // حذف عرض
  async deletePromotion(req, res) {
    try {
      const { tenant_id } = req.user;
      const { id } = req.params;
      
      const { Promotion } = req.app.get('db');
      
      const promotion = await Promotion.findOne({
        where: { id, tenant_id }
      });
      
      if (!promotion) {
        return res.status(404).json({ message: 'العرض غير موجود' });
      }
      
      await promotion.destroy();
      
      return res.status(200).json({ message: 'تم حذف العرض بنجاح' });
    } catch (error) {
      console.error('Error deleting promotion:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء حذف العرض' });
    }
  },
  
  // تطبيق عرض على حجز
  async applyPromotionToBooking(req, res) {
    try {
      const { tenant_id } = req.user;
      const { promotion_id, booking_id } = req.body;
      
      const { Promotion, Booking } = req.app.get('db');
      
      const promotion = await Promotion.findOne({
        where: { 
          id: promotion_id, 
          tenant_id,
          is_active: true,
          start_date: { [Op.lte]: new Date() },
          end_date: { [Op.gte]: new Date() }
        }
      });
      
      if (!promotion) {
        return res.status(404).json({ message: 'العرض غير موجود أو غير نشط' });
      }
      
      const booking = await Booking.findOne({
        where: { id: booking_id, tenant_id }
      });
      
      if (!booking) {
        return res.status(404).json({ message: 'الحجز غير موجود' });
      }
      
      // حساب قيمة الخصم
      let discountAmount = 0;
      if (promotion.discount_type === 'percentage') {
        discountAmount = (booking.total_amount * promotion.discount_value) / 100;
        if (promotion.max_discount_amount && discountAmount > promotion.max_discount_amount) {
          discountAmount = promotion.max_discount_amount;
        }
      } else if (promotion.discount_type === 'fixed') {
        discountAmount = promotion.discount_value;
      }
      
      // تحديث الحجز بالخصم
      await booking.update({
        promotion_id,
        discount_amount: discountAmount,
        final_amount: booking.total_amount - discountAmount
      });
      
      return res.status(200).json({
        message: 'تم تطبيق العرض بنجاح',
        booking,
        discount_amount: discountAmount
      });
    } catch (error) {
      console.error('Error applying promotion to booking:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء تطبيق العرض على الحجز' });
    }
  },
  
  // الحصول على العروض النشطة
  async getActivePromotions(req, res) {
    try {
      const { tenant_id } = req.user;
      const { company_id } = req.query;
      
      const { Promotion } = req.app.get('db');
      
      const whereClause = { 
        tenant_id,
        is_active: true,
        start_date: { [Op.lte]: new Date() },
        end_date: { [Op.gte]: new Date() }
      };
      
      if (company_id) {
        whereClause.company_id = company_id;
      }
      
      const promotions = await Promotion.findAll({
        where: whereClause
      });
      
      return res.status(200).json(promotions);
    } catch (error) {
      console.error('Error fetching active promotions:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب العروض النشطة' });
    }
  }
};

// تطبيق وسيط المصادقة على جميع مسارات العروض
router.use(authMiddleware);

// تعريف مسارات API للعروض
router.get('/', PromotionController.getAllPromotions);
router.get('/active', PromotionController.getActivePromotions);
router.get('/:id', PromotionController.getPromotionById);
router.post('/', PromotionController.createPromotion);
router.put('/:id', PromotionController.updatePromotion);
router.delete('/:id', PromotionController.deletePromotion);
router.post('/apply', PromotionController.applyPromotionToBooking);

module.exports = router;
