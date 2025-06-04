/**
 * وحدة المساعدة للتعامل مع التواريخ
 */

/**
 * تنسيق التاريخ بالصيغة المحلية العربية
 * @param {Date|string} date - كائن التاريخ أو سلسلة نصية تمثل التاريخ
 * @param {boolean} includeTime - تضمين الوقت في التنسيق
 * @returns {string} التاريخ المنسق
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('ar-SA', options);
};

/**
 * حساب الفرق بين تاريخين بالأيام
 * @param {Date|string} startDate - تاريخ البداية
 * @param {Date|string} endDate - تاريخ النهاية
 * @returns {number} عدد الأيام بين التاريخين
 */
export const calculateDaysDifference = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  // تحويل التواريخ إلى منتصف الليل لتجنب مشاكل فروق التوقيت
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  
  // حساب الفرق بالمللي ثانية وتحويله إلى أيام
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.round((endUtc - startUtc) / millisecondsPerDay);
};

/**
 * إضافة أيام إلى تاريخ
 * @param {Date|string} date - التاريخ الأصلي
 * @param {number} days - عدد الأيام للإضافة
 * @returns {Date} التاريخ الجديد بعد إضافة الأيام
 */
export const addDays = (date, days) => {
  if (!date) return new Date();
  
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

/**
 * الحصول على تاريخ اليوم بتنسيق YYYY-MM-DD
 * @returns {string} تاريخ اليوم بتنسيق YYYY-MM-DD
 */
export const getTodayFormatted = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * تحويل تاريخ إلى تنسيق YYYY-MM-DD
 * @param {Date|string} date - التاريخ المراد تنسيقه
 * @returns {string} التاريخ بتنسيق YYYY-MM-DD
 */
export const formatDateToYYYYMMDD = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * التحقق مما إذا كان التاريخ قد انتهى (أقدم من اليوم)
 * @param {Date|string} date - التاريخ المراد التحقق منه
 * @returns {boolean} true إذا كان التاريخ قد انتهى، false خلاف ذلك
 */
export const isDateExpired = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  // تعيين الوقت إلى منتصف الليل للمقارنة العادلة
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  return dateObj < today;
};

/**
 * الحصول على تاريخ بداية ونهاية الشهر الحالي
 * @returns {Object} كائن يحتوي على تاريخ بداية ونهاية الشهر الحالي
 */
export const getCurrentMonthRange = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return {
    startDate: formatDateToYYYYMMDD(startOfMonth),
    endDate: formatDateToYYYYMMDD(endOfMonth)
  };
};

/**
 * الحصول على تاريخ بداية ونهاية الأشهر الثلاثة الماضية
 * @returns {Object} كائن يحتوي على تاريخ بداية ونهاية الأشهر الثلاثة الماضية
 */
export const getLastThreeMonthsRange = () => {
  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
  
  return {
    startDate: formatDateToYYYYMMDD(startDate),
    endDate: formatDateToYYYYMMDD(endDate)
  };
};

/**
 * تحويل تاريخ إلى سلسلة نصية بتنسيق مقروء
 * @param {Date|string} date - التاريخ المراد تنسيقه
 * @returns {string} التاريخ بتنسيق مقروء
 */
export const formatDateToReadable = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  
  return dateObj.toLocaleDateString('ar-SA', options);
};
