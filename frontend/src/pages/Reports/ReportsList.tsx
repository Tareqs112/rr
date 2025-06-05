import React, { useState, useEffect } from 'react';
import './ReportsList.css';

interface ReportOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const ReportsList: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  
  const reportOptions: ReportOption[] = [
    {
      id: 'bookings',
      name: 'تقرير الحجوزات',
      description: 'عرض تفاصيل جميع الحجوزات خلال فترة زمنية محددة',
      icon: '📊'
    },
    {
      id: 'revenue',
      name: 'تقرير الإيرادات',
      description: 'تحليل الإيرادات والمصروفات والأرباح',
      icon: '💰'
    },
    {
      id: 'vehicles',
      name: 'تقرير السيارات',
      description: 'معلومات عن استخدام السيارات ومعدلات الإشغال',
      icon: '🚗'
    },
    {
      id: 'customers',
      name: 'تقرير العملاء',
      description: 'تحليل بيانات العملاء والعملاء المتكررين',
      icon: '👥'
    },
    {
      id: 'drivers',
      name: 'تقرير السائقين',
      description: 'أداء السائقين وتقييمات العملاء',
      icon: '👨‍✈️'
    },
    {
      id: 'maintenance',
      name: 'تقرير الصيانة',
      description: 'سجل صيانة السيارات والتكاليف',
      icon: '🔧'
    }
  ];

  const handleReportSelect = (reportId: string) => {
    setSelectedReport(reportId);
    setReportGenerated(false);
  };

  const handleGenerateReport = () => {
    if (!selectedReport) return;
    
    setLoading(true);
    
    // محاكاة توليد التقرير
    setTimeout(() => {
      setLoading(false);
      setReportGenerated(true);
    }, 1500);
  };

  return (
    <div className="reports-list">
      <div className="page-header">
        <h1 className="page-title">التقارير</h1>
      </div>

      <div className="reports-container">
        <div className="reports-sidebar">
          <h2>أنواع التقارير</h2>
          <ul className="report-options">
            {reportOptions.map((report) => (
              <li 
                key={report.id}
                className={`report-option ${selectedReport === report.id ? 'selected' : ''}`}
                onClick={() => handleReportSelect(report.id)}
              >
                <span className="report-icon">{report.icon}</span>
                <div className="report-info">
                  <h3>{report.name}</h3>
                  <p>{report.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="report-content">
          {selectedReport ? (
            <>
              <div className="report-header">
                <h2>{reportOptions.find(r => r.id === selectedReport)?.name}</h2>
                <p>{reportOptions.find(r => r.id === selectedReport)?.description}</p>
              </div>
              
              <div className="report-filters">
                <div className="filter-group">
                  <label>من تاريخ:</label>
                  <input type="date" defaultValue="2025-05-01" />
                </div>
                
                <div className="filter-group">
                  <label>إلى تاريخ:</label>
                  <input type="date" defaultValue="2025-06-01" />
                </div>
                
                {selectedReport === 'bookings' && (
                  <div className="filter-group">
                    <label>حالة الحجز:</label>
                    <select>
                      <option value="all">الكل</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="completed">مكتمل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </div>
                )}
                
                {selectedReport === 'vehicles' && (
                  <div className="filter-group">
                    <label>نوع السيارة:</label>
                    <select>
                      <option value="all">الكل</option>
                      <option value="sedan">سيدان</option>
                      <option value="suv">دفع رباعي</option>
                      <option value="luxury">فاخرة</option>
                    </select>
                  </div>
                )}
                
                <button 
                  className="generate-button"
                  onClick={handleGenerateReport}
                  disabled={loading}
                >
                  {loading ? 'جاري توليد التقرير...' : 'توليد التقرير'}
                </button>
              </div>
              
              {reportGenerated && (
                <div className="report-result">
                  <div className="report-actions">
                    <button className="action-button print">طباعة</button>
                    <button className="action-button export-pdf">تصدير PDF</button>
                    <button className="action-button export-excel">تصدير Excel</button>
                  </div>
                  
                  <div className="report-preview">
                    {selectedReport === 'bookings' && (
                      <div className="bookings-report">
                        <h3>ملخص الحجوزات</h3>
                        <div className="report-summary">
                          <div className="summary-item">
                            <span className="summary-value">45</span>
                            <span className="summary-label">إجمالي الحجوزات</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-value">32</span>
                            <span className="summary-label">حجوزات مكتملة</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-value">10</span>
                            <span className="summary-label">حجوزات نشطة</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-value">3</span>
                            <span className="summary-label">حجوزات ملغاة</span>
                          </div>
                        </div>
                        
                        <div className="report-chart">
                          <div className="chart-placeholder">
                            [رسم بياني للحجوزات حسب التاريخ]
                          </div>
                        </div>
                        
                        <table className="report-table">
                          <thead>
                            <tr>
                              <th>رقم الحجز</th>
                              <th>العميل</th>
                              <th>السيارة</th>
                              <th>تاريخ الاستلام</th>
                              <th>تاريخ الإرجاع</th>
                              <th>المبلغ</th>
                              <th>الحالة</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>BK-123456</td>
                              <td>أحمد محمد</td>
                              <td>تويوتا كامري 2023</td>
                              <td>2025-05-05</td>
                              <td>2025-05-10</td>
                              <td>1,000 ريال</td>
                              <td><span className="status completed">مكتمل</span></td>
                            </tr>
                            <tr>
                              <td>BK-123457</td>
                              <td>سارة أحمد</td>
                              <td>هوندا أكورد 2024</td>
                              <td>2025-05-12</td>
                              <td>2025-05-18</td>
                              <td>1,200 ريال</td>
                              <td><span className="status completed">مكتمل</span></td>
                            </tr>
                            <tr>
                              <td>BK-123458</td>
                              <td>محمد علي</td>
                              <td>نيسان التيما 2023</td>
                              <td>2025-05-20</td>
                              <td>2025-05-27</td>
                              <td>1,400 ريال</td>
                              <td><span className="status active">نشط</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {selectedReport === 'revenue' && (
                      <div className="revenue-report">
                        <h3>ملخص الإيرادات</h3>
                        <div className="report-summary">
                          <div className="summary-item">
                            <span className="summary-value">45,600 ريال</span>
                            <span className="summary-label">إجمالي الإيرادات</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-value">12,300 ريال</span>
                            <span className="summary-label">إجمالي المصروفات</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-value">33,300 ريال</span>
                            <span className="summary-label">صافي الأرباح</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-value">73%</span>
                            <span className="summary-label">هامش الربح</span>
                          </div>
                        </div>
                        
                        <div className="report-chart">
                          <div className="chart-placeholder">
                            [رسم بياني للإيرادات والمصروفات]
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-report-selected">
              <div className="placeholder-message">
                <div className="placeholder-icon">📊</div>
                <h3>اختر نوع التقرير</h3>
                <p>يرجى اختيار نوع التقرير من القائمة لعرض خيارات التقرير وتوليده</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsList;
