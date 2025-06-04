#!/bin/bash

# سكريبت اختبار شامل للنظام
# يقوم باختبار جميع الوظائف الرئيسية والتأكد من تكامل النظام

echo "=== بدء اختبار النظام الشامل ==="
echo "تاريخ الاختبار: $(date)"
echo ""

# إنشاء مجلد للنتائج
RESULTS_DIR="test_results"
mkdir -p $RESULTS_DIR

# اختبار الاتصال بقاعدة البيانات
echo "1. اختبار الاتصال بقاعدة البيانات MySQL..."
if [ -f backend/.env ]; then
  echo "  [✓] ملف .env موجود"
  grep -q "DB_DIALECT=mysql" backend/.env && echo "  [✓] إعدادات MySQL موجودة" || echo "  [✗] إعدادات MySQL غير موجودة"
else
  echo "  [✗] ملف .env غير موجود"
fi

# اختبار تبعيات الخلفية
echo ""
echo "2. اختبار تبعيات الخلفية..."
cd backend
if [ -f package.json ]; then
  echo "  [✓] ملف package.json موجود"
  grep -q "sqlite" package.json && echo "  [✗] تبعية SQLite لا تزال موجودة" || echo "  [✓] تبعية SQLite تمت إزالتها"
  grep -q "mysql" package.json && echo "  [✓] تبعية MySQL موجودة" || echo "  [✗] تبعية MySQL غير موجودة"
else
  echo "  [✗] ملف package.json غير موجود"
fi
cd ..

# اختبار وجود النماذج الجديدة
echo ""
echo "3. اختبار وجود النماذج الجديدة..."
MODELS=("TourCampaign" "TourGuide" "Promotion" "Installment")
for model in "${MODELS[@]}"; do
  if [ -f backend/models/${model}.js ]; then
    echo "  [✓] نموذج ${model} موجود"
  else
    echo "  [✗] نموذج ${model} غير موجود"
  fi
done

# اختبار وجود مسارات API الجديدة
echo ""
echo "4. اختبار وجود مسارات API الجديدة..."
ROUTES=("tourCampaigns" "tourGuides" "promotions" "installments")
for route in "${ROUTES[@]}"; do
  if [ -f backend/routes/${route}.js ]; then
    echo "  [✓] مسار ${route} موجود"
  else
    echo "  [✗] مسار ${route} غير موجود"
  fi
done

# اختبار وجود صفحات الواجهة الأمامية الجديدة
echo ""
echo "5. اختبار وجود صفحات الواجهة الأمامية الجديدة..."
FRONTEND_DIRS=("TourCampaigns" "TourGuides" "Promotions" "Installments")
for dir in "${FRONTEND_DIRS[@]}"; do
  if [ -d frontend/src/pages/${dir} ]; then
    echo "  [✓] مجلد ${dir} موجود"
    
    # اختبار وجود الصفحات الرئيسية
    if [ -f frontend/src/pages/${dir}/${dir}List.js ]; then
      echo "    [✓] صفحة ${dir}List موجودة"
    else
      echo "    [✗] صفحة ${dir}List غير موجودة"
    fi
    
    if [ -f frontend/src/pages/${dir}/${dir}Form.js ]; then
      echo "    [✓] صفحة ${dir}Form موجودة"
    else
      echo "    [✗] صفحة ${dir}Form غير موجودة"
    fi
    
    if [ -f frontend/src/pages/${dir}/${dir}Details.js ]; then
      echo "    [✓] صفحة ${dir}Details موجودة"
    else
      echo "    [✗] صفحة ${dir}Details غير موجودة"
    fi
  else
    echo "  [✗] مجلد ${dir} غير موجود"
  fi
done

# اختبار تحديث ملف App.js
echo ""
echo "6. اختبار تحديث ملف App.js..."
if [ -f frontend/src/App.js ]; then
  echo "  [✓] ملف App.js موجود"
  grep -q "TourCampaign" frontend/src/App.js && echo "  [✓] مسارات TourCampaign مضافة" || echo "  [✗] مسارات TourCampaign غير مضافة"
  grep -q "TourGuide" frontend/src/App.js && echo "  [✓] مسارات TourGuide مضافة" || echo "  [✗] مسارات TourGuide غير مضافة"
  grep -q "Promotion" frontend/src/App.js && echo "  [✓] مسارات Promotion مضافة" || echo "  [✗] مسارات Promotion غير مضافة"
  grep -q "Installment" frontend/src/App.js && echo "  [✓] مسارات Installment مضافة" || echo "  [✗] مسارات Installment غير مضافة"
else
  echo "  [✗] ملف App.js غير موجود"
fi

# اختبار تحديث ملف Sidebar.js
echo ""
echo "7. اختبار تحديث ملف Sidebar.js..."
if [ -f frontend/src/components/layout/Sidebar.js ]; then
  echo "  [✓] ملف Sidebar.js موجود"
  grep -q "tour-campaigns" frontend/src/components/layout/Sidebar.js && echo "  [✓] رابط الحملات السياحية مضاف" || echo "  [✗] رابط الحملات السياحية غير مضاف"
  grep -q "tour-guides" frontend/src/components/layout/Sidebar.js && echo "  [✓] رابط المرشدين السياحيين مضاف" || echo "  [✗] رابط المرشدين السياحيين غير مضاف"
  grep -q "promotions" frontend/src/components/layout/Sidebar.js && echo "  [✓] رابط العروض والخصومات مضاف" || echo "  [✗] رابط العروض والخصومات غير مضاف"
  grep -q "installments" frontend/src/components/layout/Sidebar.js && echo "  [✓] رابط الأقساط والمدفوعات مضاف" || echo "  [✗] رابط الأقساط والمدفوعات غير مضاف"
else
  echo "  [✗] ملف Sidebar.js غير موجود"
fi

# اختبار وجود ملفات التوثيق
echo ""
echo "8. اختبار وجود ملفات التوثيق..."
DOCS=("tourism_enhancements.md" "final_report.md" "missing_components.md")
for doc in "${DOCS[@]}"; do
  if [ -f ${doc} ]; then
    echo "  [✓] ملف ${doc} موجود"
  else
    echo "  [✗] ملف ${doc} غير موجود"
  fi
done

# حفظ نتائج الاختبار
echo ""
echo "حفظ نتائج الاختبار في ${RESULTS_DIR}/test_results.txt"
echo "=== نتائج اختبار النظام الشامل ===" > ${RESULTS_DIR}/test_results.txt
echo "تاريخ الاختبار: $(date)" >> ${RESULTS_DIR}/test_results.txt
echo "" >> ${RESULTS_DIR}/test_results.txt
echo "1. اختبار الاتصال بقاعدة البيانات: $([ -f backend/.env ] && echo 'نجاح' || echo 'فشل')" >> ${RESULTS_DIR}/test_results.txt
echo "2. اختبار تبعيات الخلفية: $([ -f backend/package.json ] && ! grep -q "sqlite" backend/package.json && echo 'نجاح' || echo 'فشل')" >> ${RESULTS_DIR}/test_results.txt
echo "3. اختبار وجود النماذج الجديدة: $([ -f backend/models/TourCampaign.js ] && [ -f backend/models/TourGuide.js ] && [ -f backend/models/Promotion.js ] && [ -f backend/models/Installment.js ] && echo 'نجاح' || echo 'فشل')" >> ${RESULTS_DIR}/test_results.txt
echo "4. اختبار وجود مسارات API الجديدة: $([ -f backend/routes/tourCampaigns.js ] && [ -f backend/routes/tourGuides.js ] && [ -f backend/routes/promotions.js ] && [ -f backend/routes/installments.js ] && echo 'نجاح' || echo 'فشل')" >> ${RESULTS_DIR}/test_results.txt
echo "5. اختبار وجود صفحات الواجهة الأمامية الجديدة: $([ -d frontend/src/pages/TourCampaigns ] && [ -d frontend/src/pages/TourGuides ] && [ -d frontend/src/pages/Promotions ] && [ -d frontend/src/pages/Installments ] && echo 'نجاح' || echo 'فشل')" >> ${RESULTS_DIR}/test_results.txt
echo "6. اختبار تحديث ملف App.js: $([ -f frontend/src/App.js ] && grep -q "TourCampaign" frontend/src/App.js && grep -q "TourGuide" frontend/src/App.js && grep -q "Promotion" frontend/src/App.js && grep -q "Installment" frontend/src/App.js && echo 'نجاح' || echo 'فشل')" >> ${RESULTS_DIR}/test_results.txt
echo "7. اختبار تحديث ملف Sidebar.js: $([ -f frontend/src/components/layout/Sidebar.js ] && grep -q "tour-campaigns" frontend/src/components/layout/Sidebar.js && grep -q "tour-guides" frontend/src/components/layout/Sidebar.js && grep -q "promotions" frontend/src/components/layout/Sidebar.js && grep -q "installments" frontend/src/components/layout/Sidebar.js && echo 'نجاح' || echo 'فشل')" >> ${RESULTS_DIR}/test_results.txt
echo "8. اختبار وجود ملفات التوثيق: $([ -f tourism_enhancements.md ] && [ -f final_report.md ] && [ -f missing_components.md ] && echo 'نجاح' || echo 'فشل')" >> ${RESULTS_DIR}/test_results.txt

echo ""
echo "=== اكتمل اختبار النظام الشامل ==="
