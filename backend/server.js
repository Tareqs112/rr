require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

// 🟢 استيراد المسارات
const authRoutes = require('./routes/authRoutes'); // مثال
const bookingRoutes = require('./routes/bookingRoutes'); // حسب الموجود عندك
// أضف غيرها إن وُجد

const app = express();
const PORT = process.env.PORT || 5000;

// 🔧 إعداد الـ Middlewares
app.use(cors());
app.use(express.json());

// 🌐 ربط المسارات
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
// أضف المزيد حسب ملفات routes عندك

// 🔘 صفحة اختبار
app.get('/', (req, res) => {
  res.send('🚗 Car Rental System Backend is Running!');
});

// 🚀 بدء التشغيل بعد التأكد من اتصال قاعدة البيانات
const startServer = async () => {
  const connected = await db.testConnection();
  if (!connected) return;

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
};

startServer();
