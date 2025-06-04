import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCustomers, searchCustomers } from '../../services/customers';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError('فشل في تحميل بيانات العملاء');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchCustomers();
      return;
    }

    try {
      setLoading(true);
      const data = await searchCustomers({ query: searchTerm });
      setCustomers(data);
      setCurrentPage(1);
    } catch (err) {
      setError('فشل في البحث عن العملاء');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // الحصول على العملاء الحاليين
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  // تغيير الصفحة
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>قائمة العملاء</h2>
        <div className="actions">
          <Link to="/customers/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> إضافة عميل جديد
          </Link>
        </div>
      </div>

      <div className="filter-section">
        <form onSubmit={handleSearch} className="form-row">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="بحث بالاسم، رقم الهاتف، أو البريد الإلكتروني"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary mr-2">
            بحث
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => {
            setSearchTerm('');
            fetchCustomers();
          }}>
            إعادة تعيين
          </button>
        </form>
      </div>

      {customers.length === 0 ? (
        <div className="not-found">لا يوجد عملاء للعرض</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم</th>
                  <th>رقم الهاتف</th>
                  <th>البريد الإلكتروني</th>
                  <th>عدد الحجوزات</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.map((customer, index) => (
                  <tr key={customer.id}>
                    <td>{indexOfFirstCustomer + index + 1}</td>
                    <td>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.email}</td>
                    <td>{customer.bookingsCount || 0}</td>
                    <td>
                      <Link to={`/customers/${customer.id}`} className="btn btn-sm btn-primary mr-2">
                        عرض
                      </Link>
                      <Link to={`/customers/${customer.id}/edit`} className="btn btn-sm btn-secondary mr-2">
                        تعديل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ترقيم الصفحات */}
          {customers.length > customersPerPage && (
            <div className="pagination">
              {Array.from({ length: Math.ceil(customers.length / customersPerPage) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-light'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerList;
