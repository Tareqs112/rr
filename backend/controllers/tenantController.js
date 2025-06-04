const { Tenant, User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/auth');

/**
 * وحدة التحكم بالمستأجرين للنظام متعدد المستأجرين (SaaS)
 */

// الحصول على جميع المستأجرين (للمشرف الرئيسي فقط)
const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.findAll({
      attributes: { exclude: ['settings'] }
    });
    
    res.status(200).json({
      success: true,
      data: tenants
    });
  } catch (error) {
    console.error('خطأ في الحصول على المستأجرين:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات المستأجرين'
    });
  }
};

// الحصول على مستأجر محدد بواسطة المعرف
const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tenant = await Tenant.findByPk(id);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'المستأجر غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    console.error('خطأ في الحصول على المستأجر:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات المستأجر'
    });
  }
};

// إنشاء مستأجر جديد
const createTenant = async (req, res) => {
  try {
    const {
      name,
      domain,
      subscription_plan,
      contact_email,
      contact_phone,
      address,
      admin_username,
      admin_email,
      admin_password
    } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !contact_email || !admin_username || !admin_email || !admin_password) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول المطلوبة يجب توفيرها'
      });
    }
    
    // التحقق من عدم وجود مستأجر بنفس النطاق
    if (domain) {
      const existingTenant = await Tenant.findOne({ where: { domain } });
      if (existingTenant) {
        return res.status(400).json({
          success: false,
          message: 'النطاق مستخدم بالفعل'
        });
      }
    }
    
    // إنشاء المستأجر
    const tenant = await Tenant.create({
      name,
      domain,
      subscription_plan: subscription_plan || 'standard',
      subscription_status: 'trial',
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
      contact_email,
      contact_phone,
      address,
      is_active: true
    });
    
    // إنشاء حساب المشرف للمستأجر
    const hashedPassword = await bcrypt.hash(admin_password, 10);
    
    const adminUser = await User.create({
      username: admin_username,
      email: admin_email,
      password: hashedPassword,
      role: 'admin',
      is_active: true,
      tenant_id: tenant.id
    });
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء المستأجر بنجاح',
      data: {
        tenant,
        admin: {
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email
        }
      }
    });
  } catch (error) {
    console.error('خطأ في إنشاء المستأجر:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء المستأجر'
    });
  }
};

// تحديث بيانات المستأجر
const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      domain,
      subscription_plan,
      subscription_status,
      contact_email,
      contact_phone,
      address,
      is_active
    } = req.body;
    
    const tenant = await Tenant.findByPk(id);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'المستأجر غير موجود'
      });
    }
    
    // التحقق من عدم وجود مستأجر آخر بنفس النطاق
    if (domain && domain !== tenant.domain) {
      const existingTenant = await Tenant.findOne({ where: { domain } });
      if (existingTenant) {
        return res.status(400).json({
          success: false,
          message: 'النطاق مستخدم بالفعل'
        });
      }
    }
    
    // تحديث بيانات المستأجر
    await tenant.update({
      name: name || tenant.name,
      domain: domain || tenant.domain,
      subscription_plan: subscription_plan || tenant.subscription_plan,
      subscription_status: subscription_status || tenant.subscription_status,
      contact_email: contact_email || tenant.contact_email,
      contact_phone: contact_phone || tenant.contact_phone,
      address: address || tenant.address,
      is_active: is_active !== undefined ? is_active : tenant.is_active
    });
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات المستأجر بنجاح',
      data: tenant
    });
  } catch (error) {
    console.error('خطأ في تحديث المستأجر:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث بيانات المستأجر'
    });
  }
};

// حذف مستأجر
const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tenant = await Tenant.findByPk(id);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'المستأجر غير موجود'
      });
    }
    
    // حذف المستأجر (يمكن استبدال هذا بتعطيل المستأجر بدلاً من الحذف الفعلي)
    await tenant.update({ is_active: false });
    
    res.status(200).json({
      success: true,
      message: 'تم تعطيل المستأجر بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف المستأجر:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف المستأجر'
    });
  }
};

module.exports = {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant
};
