const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// استيراد وحدة التحكم بالحملات السياحية
const TourCampaignController = {
  // الحصول على جميع الحملات السياحية
  async getAllCampaigns(req, res) {
    try {
      const { tenant_id } = req.user;
      const { TourCampaign, Company } = req.app.get('db');
      
      const campaigns = await TourCampaign.findAll({
        where: { tenant_id },
        include: [{ model: Company }]
      });
      
      return res.status(200).json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب الحملات السياحية' });
    }
  },
  
  // الحصول على حملة سياحية محددة
  async getCampaignById(req, res) {
    try {
      const { tenant_id } = req.user;
      const { id } = req.params;
      const { TourCampaign, Company, TourGuide, Booking, HotelBooking, FlightBooking } = req.app.get('db');
      
      const campaign = await TourCampaign.findOne({
        where: { id, tenant_id },
        include: [
          { model: Company },
          { model: TourGuide },
          { model: Booking },
          { model: HotelBooking },
          { model: FlightBooking }
        ]
      });
      
      if (!campaign) {
        return res.status(404).json({ message: 'الحملة السياحية غير موجودة' });
      }
      
      return res.status(200).json(campaign);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء جلب الحملة السياحية' });
    }
  },
  
  // إنشاء حملة سياحية جديدة
  async createCampaign(req, res) {
    try {
      const { tenant_id } = req.user;
      const { 
        name, 
        start_date, 
        end_date, 
        description, 
        max_participants, 
        price_per_person, 
        itinerary,
        company_id 
      } = req.body;
      
      const { TourCampaign } = req.app.get('db');
      
      const campaign = await TourCampaign.create({
        name,
        start_date,
        end_date,
        description,
        max_participants,
        price_per_person,
        itinerary,
        company_id,
        status: 'planned',
        current_participants: 0,
        tenant_id
      });
      
      return res.status(201).json(campaign);
    } catch (error) {
      console.error('Error creating campaign:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الحملة السياحية' });
    }
  },
  
  // تحديث حملة سياحية
  async updateCampaign(req, res) {
    try {
      const { tenant_id } = req.user;
      const { id } = req.params;
      const { 
        name, 
        start_date, 
        end_date, 
        description, 
        status,
        max_participants, 
        price_per_person, 
        itinerary,
        company_id 
      } = req.body;
      
      const { TourCampaign } = req.app.get('db');
      
      const campaign = await TourCampaign.findOne({
        where: { id, tenant_id }
      });
      
      if (!campaign) {
        return res.status(404).json({ message: 'الحملة السياحية غير موجودة' });
      }
      
      await campaign.update({
        name,
        start_date,
        end_date,
        description,
        status,
        max_participants,
        price_per_person,
        itinerary,
        company_id
      });
      
      return res.status(200).json(campaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء تحديث الحملة السياحية' });
    }
  },
  
  // حذف حملة سياحية
  async deleteCampaign(req, res) {
    try {
      const { tenant_id } = req.user;
      const { id } = req.params;
      
      const { TourCampaign } = req.app.get('db');
      
      const campaign = await TourCampaign.findOne({
        where: { id, tenant_id }
      });
      
      if (!campaign) {
        return res.status(404).json({ message: 'الحملة السياحية غير موجودة' });
      }
      
      await campaign.destroy();
      
      return res.status(200).json({ message: 'تم حذف الحملة السياحية بنجاح' });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء حذف الحملة السياحية' });
    }
  },
  
  // إضافة مرشد سياحي إلى الحملة
  async addGuide(req, res) {
    try {
      const { tenant_id } = req.user;
      const { campaign_id, guide_id } = req.body;
      
      const { TourCampaign, TourGuide } = req.app.get('db');
      
      const campaign = await TourCampaign.findOne({
        where: { id: campaign_id, tenant_id }
      });
      
      if (!campaign) {
        return res.status(404).json({ message: 'الحملة السياحية غير موجودة' });
      }
      
      const guide = await TourGuide.findOne({
        where: { id: guide_id, tenant_id }
      });
      
      if (!guide) {
        return res.status(404).json({ message: 'المرشد السياحي غير موجود' });
      }
      
      await campaign.addTourGuide(guide);
      
      return res.status(200).json({ message: 'تم إضافة المرشد السياحي إلى الحملة بنجاح' });
    } catch (error) {
      console.error('Error adding guide to campaign:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء إضافة المرشد السياحي إلى الحملة' });
    }
  },
  
  // إزالة مرشد سياحي من الحملة
  async removeGuide(req, res) {
    try {
      const { tenant_id } = req.user;
      const { campaign_id, guide_id } = req.params;
      
      const { TourCampaign, TourGuide } = req.app.get('db');
      
      const campaign = await TourCampaign.findOne({
        where: { id: campaign_id, tenant_id }
      });
      
      if (!campaign) {
        return res.status(404).json({ message: 'الحملة السياحية غير موجودة' });
      }
      
      const guide = await TourGuide.findOne({
        where: { id: guide_id, tenant_id }
      });
      
      if (!guide) {
        return res.status(404).json({ message: 'المرشد السياحي غير موجود' });
      }
      
      await campaign.removeTourGuide(guide);
      
      return res.status(200).json({ message: 'تم إزالة المرشد السياحي من الحملة بنجاح' });
    } catch (error) {
      console.error('Error removing guide from campaign:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء إزالة المرشد السياحي من الحملة' });
    }
  }
};

// تطبيق وسيط المصادقة على جميع مسارات الحملات السياحية
router.use(authMiddleware);

// تعريف مسارات API للحملات السياحية
router.get('/', TourCampaignController.getAllCampaigns);
router.get('/:id', TourCampaignController.getCampaignById);
router.post('/', TourCampaignController.createCampaign);
router.put('/:id', TourCampaignController.updateCampaign);
router.delete('/:id', TourCampaignController.deleteCampaign);
router.post('/add-guide', TourCampaignController.addGuide);
router.delete('/:campaign_id/guides/:guide_id', TourCampaignController.removeGuide);

module.exports = router;
