const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authConfig = require('../config/auth');
const User = db.User;

// ✅ تسجيل الدخول
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 محاولة تسجيل الدخول');
    console.log('📧 الإيميل المرسل:', email);
    console.log('🔑 كلمة المرور المرسلة:', password);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('❌ لا يوجد مستخدم بهذا الإيميل');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ تم العثور على المستخدم:', user.email);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔍 نتيجة فحص كلمة المرور:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ كلمة المرور غير صحيحة');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      authConfig.JWT_SECRET,
      { expiresIn: authConfig.JWT_EXPIRES_IN }
    );

    console.log('🎉 تسجيل الدخول ناجح');
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id // ✅ مهم للواجهة
      },
      token
    });
  } catch (error) {
    console.error('💥 خطأ في تسجيل الدخول:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ استرجاع البروفايل
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ إنشاء مستخدم جديد (يسمح لأول مستخدم بدون توكن)
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const userCount = await User.count();
    if (userCount > 0) {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to register new users' });
      }
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'staff'
    });

    res.status(201).json({
      message: userCount === 0 ? 'First admin created successfully' : 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ تحديث التوكن
const refreshToken = async (req, res) => {
  try {
    // استخدام معلومات المستخدم من الطلب (تم إضافتها بواسطة middleware المصادقة)
    const user = req.user;
    
    // إنشاء توكن جديد
    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      authConfig.JWT_SECRET,
      { expiresIn: authConfig.JWT_EXPIRES_IN }
    );
    
    // إرجاع التوكن الجديد
    res.status(200).json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  login,
  getProfile,
  register,
  refreshToken
};
