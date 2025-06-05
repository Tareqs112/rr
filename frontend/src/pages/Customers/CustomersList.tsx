import React, { useState, useEffect } from 'react';
import { customersAPI } from '../../services/api';
import './CustomersList.css';

interface Customer {
  id: number;
  full_name: string;
  phone: string;
  whatsapp: string;
  nationality: string;
  is_vip: boolean;
  is_repeat_customer: boolean;
  company_name: string;
  balance: number;
}

const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        // في بيئة الاختبار، نستخدم البيانات الوهمية بدلاً من الاتصال بالخادم
        // في الإصدار النهائي، سيتم استبدال هذا بـ:
        // const response = await customersAPI.getAll({ filter });
        // setCustomers(response.data);
        
        // محاكاة طلب API
        setTimeout(() => {
          const mockCustomers: Customer[] = [
            { 
              id: 1, 
              full_name: 'أحمد محمد', 
              phone: '0501234567', 
              whatsapp: '0501234567',
              nationality: 'سعودي',
              is_vip: true,
              is_repeat_customer: true,
              company_name: 'شركة الرياض للسياحة',
              balance: 0
            },
            { 
              id: 2, 
              full_name: 'سارة أحمد', 
              phone: '0567891234', 
              whatsapp: '0567891234',
              nationality: 'سعودية',
              is_vip: false,
              is_repeat_customer: false,
              company_name: '',
              balance: 500
            },
            { 
              id: 3, 
              full_name: 'محمد علي', 
              phone: '0512345678', 
              whatsapp: '0512345678',
              nationality: 'مصري',
              is_vip: false,
              is_repeat_customer: true,
              company_name: '',
              balance: 0
            },
            { 
              id: 4, 
              full_name: 'فاطمة خالد', 
              phone: '0523456789', 
              whatsapp: '0523456789',
              nationality: 'سعودية',
              is_vip: true,
              is_repeat_customer: false,
              company_name: 'شركة جدة للسفر',
              balance: 200
            },
            { 
              id: 5, 
              full_name: 'عمر أحمد', 
              phone: '0534567890', 
              whatsapp: '0534567890',
              nationality: 'سعودي',
              is_vip: false,
              is_repeat_customer: false,
              company_name: '',
              balance: 0
            },
          ];
          setCustomers(mockCustomers);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('خطأ في جلب بيانات العملاء:', err);
        setError('حدث خطأ أثناء جلب بيانات العملاء. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [filter]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'vip') return matchesSearch && customer.is_vip;
    if (filter === 'repeat') return matchesSearch && customer.is_repeat_customer;
    if (filter === 'with_balance') return matchesSearch && customer.balance > 0;
    
    return matchesSearch;
  });

  const handleAddCustomer = () => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    alert('سيتم فتح نموذج إضافة عميل جديد');
  };

  const handleEditCustomer = (id: number) => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    alert(`سيتم فتح نموذج تعديل العميل رقم ${id}`);
  };

  const handleViewCustomer = (id: number) => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    alert(`سيتم عرض تفاصيل العميل رقم ${id}`);
  };

  const handleDeleteCustomer = (id: number) => {
    // سيتم تنفيذ هذه الوظيفة في الإصدار النهائي
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا العميل؟')) {
      alert(`سيتم حذف العميل رقم ${id}`);
    }
  };

  if (loading) {
    return <div className="loading">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="customers-list">
      <div className="page-header">
        <h1 className="page-title">إدارة العملاء</h1>
        <button className="add-button" onClick={handleAddCustomer}>إضافة عميل جديد</button>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="بحث عن عميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <label>تصفية:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">جميع العملاء</option>
            <option value="vip">عملاء VIP</option>
            <option value="repeat">عملاء متكررين</option>
            <option value="with_balance">عملاء لديهم رصيد</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>رقم الهاتف</th>
              <th>واتساب</th>
              <th>الجنسية</th>
              <th>الشركة</th>
              <th>الحالة</th>
              <th>الرصيد</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.full_name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.whatsapp}</td>
                  <td>{customer.nationality}</td>
                  <td>{customer.company_name || '-'}</td>
                  <td>
                    <div className="customer-status">
                      {customer.is_vip && <span className="badge vip">VIP</span>}
                      {customer.is_repeat_customer && <span className="badge repeat">متكرر</span>}
                    </div>
                  </td>
                  <td className={customer.balance > 0 ? 'balance-positive' : ''}>
                    {customer.balance > 0 ? `${customer.balance} ريال` : '-'}
                  </td>
                  <td className="actions">
                    <button className="action-button edit" onClick={() => handleEditCustomer(customer.id)}>تعديل</button>
                    <button className="action-button view" onClick={() => handleViewCustomer(customer.id)}>عرض</button>
                    <button className="action-button delete" onClick={() => handleDeleteCustomer(customer.id)}>حذف</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="no-data">لا يوجد عملاء مطابقين للبحث</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersList;
