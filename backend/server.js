const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ تفعيل CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ الاتصال بقاعدة البيانات
const db = require('./models');

// ✅ استدعاء جميع المسارات من ملف routes/index.js
const routes = require('./routes');
routes(app); // 👈 هذا مهم

// ✅ Route اختبار
app.get('/', (req, res) => {
  res.send('🚗 Car Rental System backend is running!');
});

// ✅ تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`✅ Server running on: http://localhost:${PORT}`);
});
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});
