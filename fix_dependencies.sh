#!/bin/bash

# سكريبت لإعادة تثبيت التبعيات وإصلاح مشكلة SQLite3

echo "بدء عملية إصلاح تبعيات المشروع..."

# التأكد من وجود المجلدات الضرورية
if [ ! -d "backend" ]; then
  echo "خطأ: مجلد backend غير موجود!"
  exit 1
fi

# الانتقال إلى مجلد backend
cd backend

# حذف مجلد node_modules الحالي
echo "حذف مجلد node_modules الحالي..."
rm -rf node_modules

# حذف ملف package-lock.json إن وجد
if [ -f "package-lock.json" ]; then
  echo "حذف ملف package-lock.json..."
  rm package-lock.json
fi

# إعادة تثبيت التبعيات
echo "إعادة تثبيت التبعيات..."
npm install

# التحقق من نجاح التثبيت
if [ $? -eq 0 ]; then
  echo "تم تثبيت التبعيات بنجاح!"
else
  echo "حدث خطأ أثناء تثبيت التبعيات!"
  exit 1
fi

echo "تم إصلاح تبعيات المشروع بنجاح!"
echo "يمكنك الآن تشغيل الخلفية باستخدام الأمر: npm start"
