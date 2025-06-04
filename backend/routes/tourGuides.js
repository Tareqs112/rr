const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// استيراد وحدة التحكم بالمرشدين السياحيين
const TourGuideController = {
  // الحصول على جميع المرشدين السياحيين
  async getAllGuides(req, res) {
    try {
      const { tenant_id } = req.user;
      const { TourGuide } = req.app.get('db');
      
      const guides = await TourGuide.findAll({
        where: { tenant_id }
      });
      
      return res.status(200).json(guides);
    } catch (error) {
      console.error('Error fetching guides:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب المرشدين السياحيين' });
    }
  },
  
  // الحصول على مرشد سياحي محدد
  async getGuideById(req, res) {
    try {
      const { tenant_id } = req.user;
      const { id } = req.params;
      const { TourGuide, TourCampaign } = req.app.get('db');
      
      const guide = await TourGuide.findOne({
        where: { id, tenant_id },
        include: [{ model: TourCampaign }]
      });
      
      if (!guide) {
        return res.status(404).json({ message: 'المرشد السياحي غير موجود' });
      }
      
      return res.status(200).json(guide);
    } catch (error) {
      console.error('Error fetching guide:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب المرشد السياحي' });
    }
  },
  
  // إنشاء مرشد سياحي جديد
  async createGuide(req, res) {
    try {
      const { tenant_id } = req.user;
      const { 
        name, 
        phone, 
        email, 
        languages, 
        specialties, 
        years_experience,
        certification,
        photo_url
      } = req.body;
      
      const { TourGuide } = req.app.get('db');
      
      const guide = await TourGuide.create({
        name,
        phone,
        email,
        languages,
        specialties,
        years_experience,
        certification,
        photo_url,
        status: 'available',
        tenant_id
      });
      
      return res.status(201).json(guide);
    } catch (error) {
      console.error('Error creating guide:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء المرشد السياحي' });
    }
  },
  
  // تحديث مرشد سياحي
  async updateGuide(req, res) {
    try {
      const { tenant_id } = req.user;
      const { id } = req.params;
      const { 
        name, 
        phone, 
        email, 
        languages, 
        specialties, 
        status,
        years_experience,
        certification,
        photo_url,
        rating
      } = req.body;
      
      const { TourGuide } = req.app.get('db');
      
      const guide = await TourGuide.findOne({
        where: { id, tenant_id }
      });
      
      if (!guide) {
        return res.status(404).json({ message: 'المرشد السياحي غير موجود' });
      }
      
      await guide.update({
        name,
        phone,
        email,
        languages,
        specialties,
        status,
        years_experience,
        certification,
        photo_url,
        rating
      });
      
      return res.status(200).json(guide);
    } catch (error) {
      console.error('Error updating guide:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء تحديث المرشد السياحي' });
    }
  },
  
  // حذف مرشد سياحي
  async deleteGuide(req, res) {
    try {
      const { tenant_id } = req.user;
      const { id } = req.params;
      
      const { TourGuide } = req.app.get('db');
      
      const guide = await TourGuide.findOne({
        where: { id, tenant_id }
      });
      
      if (!guide) {
        return res.status(404).json({ message: 'المرشد السياحي غير موجود' });
      }
      
      await guide.destroy();
      
      return res.status(200).json({ message: 'تم حذف المرشد السياحي بنجاح' });
    } catch (error) {
      console.error('Error deleting guide:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء حذف المرشد السياحي' });
    }
  },
  
  // الحصول على المرشدين المتاحين
  async getAvailableGuides(req, res) {
    try {
      const { tenant_id } = req.user;
      const { date } = req.query;
      
      const { TourGuide, TourCampaign } = req.app.get('db');
      
      // البحث عن المرشدين المتاحين (غير مرتبطين بحملات في التاريخ المحدد)
      const guides = await TourGuide.findAll({
        where: { 
          tenant_id,
          status: 'available'
        },
        include: [{
          model: TourCampaign,
          where: {
            start_date: { [Op.lte]: date },
            end_date: { [Op.gte]: date }
          },
          required: false
        }]
      });
      
      // تصفية المرشدين الذين ليس لديهم حملات في التاريخ المحدد
      const availableGuides = guides.filter(guide => guide.TourCampaigns.length === 0);
      
      return res.status(200).json(availableGuides);
    } catch (error) {
      console.error('Error fetching available guides:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب المرشدين المتاحين' });
    }
  }
};

// تطبيق وسيط المصادقة على جميع مسارات المرشدين السياحيين
router.use(authMiddleware);

// تعريف مسارات API للمرشدين السياحيين
router.get('/', TourGuideController.getAllGuides);
router.get('/available', TourGuideController.getAvailableGuides);
router.get('/:id', TourGuideController.getGuideById);
router.post('/', TourGuideController.createGuide);
router.put('/:id', TourGuideController.updateGuide);
router.delete('/:id', TourGuideController.deleteGuide);

module.exports = router;
