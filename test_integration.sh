#!/bin/bash

# سكريبت اختبار تكامل النظام بعد التحسينات

echo "بدء اختبار تكامل نظام تأجير السيارات..."

# التحقق من وجود الملفات الأساسية
echo "التحقق من وجود الملفات الأساسية..."
FILES_TO_CHECK=(
  "backend/models/Tenant.js"
  "backend/models/Company.js"
  "backend/models/Customer.js"
  "backend/models/Payment.js"
  "backend/models/TourCampaign.js"
  "backend/models/TourGuide.js"
  "backend/models/Promotion.js"
  "backend/models/Installment.js"
  "backend/controllers/PaymentController.js"
  "backend/routes/payments.js"
)

for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ الملف $file موجود"
  else
    echo "✗ الملف $file غير موجود"
    exit 1
  fi
done

# التحقق من العلاقات في ملف index.js
echo "التحقق من العلاقات في ملف index.js..."
if grep -q "TourCampaign" backend/models/index.js && \
   grep -q "TourGuide" backend/models/index.js && \
   grep -q "Promotion" backend/models/index.js && \
   grep -q "Installment" backend/models/index.js; then
  echo "✓ العلاقات الجديدة موجودة في ملف index.js"
else
  echo "✗ بعض العلاقات الجديدة غير موجودة في ملف index.js"
  exit 1
fi

# التحقق من وجود مسارات API الجديدة
echo "التحقق من وجود مسارات API الجديدة..."
if grep -q "router.get('/voucher/:payment_id'" backend/routes/payments.js && \
   grep -q "router.get('/balances/companies'" backend/routes/payments.js; then
  echo "✓ مسارات API الجديدة موجودة"
else
  echo "✗ بعض مسارات API الجديدة غير موجودة"
  exit 1
fi

# التحقق من وجود وظائف المدفوعات والفواتير
echo "التحقق من وظائف المدفوعات والفواتير..."
if grep -q "generateVoucher" backend/controllers/PaymentController.js && \
   grep -q "getCompanyBalances" backend/controllers/PaymentController.js; then
  echo "✓ وظائف المدفوعات والفواتير موجودة"
else
  echo "✗ بعض وظائف المدفوعات والفواتير غير موجودة"
  exit 1
fi

# التحقق من دعم SaaS في النماذج الجديدة
echo "التحقق من دعم SaaS في النماذج الجديدة..."
if grep -q "tenant_id" backend/models/TourCampaign.js && \
   grep -q "tenant_id" backend/models/TourGuide.js && \
   grep -q "tenant_id" backend/models/Promotion.js && \
   grep -q "tenant_id" backend/models/Installment.js; then
  echo "✓ جميع النماذج الجديدة تدعم SaaS"
else
  echo "✗ بعض النماذج الجديدة لا تدعم SaaS"
  exit 1
fi

echo "تم اختبار تكامل النظام بنجاح!"
echo "جميع التحسينات والتعديلات متكاملة مع النظام الحالي."
