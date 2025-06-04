import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllDrivers, getAvailableDrivers } from '../../services/drivers';

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [driversPerPage] = useState(10);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await getAllDrivers();
      setDrivers(data);
      setError(null);
    } catch (err) {
      setError('فشل في تحميل بيانات السائقين');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterDrivers();
  };

  const filterDrivers = async () => {
    try {
      setLoading(true);
      
      if (filterAvailable) {
        const data = await getAvailableDrivers();
        setDrivers(data);
      } else {
        const data = await getAllDrivers();
        
        if (searchTerm) {
          const filtered = data.filter(driver => 
            driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.phone.includes(searchTerm)
          );
          setDrivers(filtered);
        } else {
          setDrivers(data);
        }
      }
      
      setCurrentPage(1);
      setError(null);
    } catch (err) {
      setError('فشل في تصفية بيانات السائقين');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterAvailable(false);
    fetchDrivers();
  };

  // الحصول على السائقين الحاليين
  const indexOfLastDriver = currentPage * driversPerPage;
  const indexOfFirstDriver = indexOfLastDriver - driversPerPage;
  const currentDrivers = drivers.slice(indexOfFirstDriver, indexOfLastDriver);

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
        <h2>قائمة السائقين</h2>
        <div className="actions">
          <Link to="/drivers/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> إضافة سائق جديد
          </Link>
        </div>
      </div>

      <div className="filter-section">
        <form onSubmit={handleSearch} className="form-row">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="بحث بالاسم، رقم الرخصة، أو رقم الهاتف"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="availableOnly"
              checked={filterAvailable}
              onChange={(e) => setFilterAvailable(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="availableOnly">
              السائقين المتاحين فقط
            </label>
          </div>
          <button type="submit" className="btn btn-primary mr-2">
            بحث
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetFilters}>
            إعادة تعيين
          </button>
        </form>
      </div>

      {drivers.length === 0 ? (
        <div className="not-found">لا يوجد سائقين للعرض</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم</th>
                  <th>رقم الرخصة</th>
                  <th>رقم الهاتف</th>
                  <th>الحالة</th>
                  <th>تاريخ التوظيف</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currentDrivers.map((driver, index) => (
                  <tr key={driver.id}>
                    <td>{indexOfFirstDriver + index + 1}</td>
                    <td>{driver.name}</td>
                    <td>{driver.licenseNumber}</td>
                    <td>{driver.phone}</td>
                    <td>
                      <span className={`status-badge ${driver.isAvailable ? 'available' : 'unavailable'}`}>
                        {driver.isAvailable ? 'متاح' : 'غير متاح'}
                      </span>
                    </td>
                    <td>{new Date(driver.hireDate).toLocaleDateString('ar-SA')}</td>
                    <td>
                      <Link to={`/drivers/${driver.id}`} className="btn btn-sm btn-primary mr-2">
                        عرض
                      </Link>
                      <Link to={`/drivers/${driver.id}/edit`} className="btn btn-sm btn-secondary mr-2">
                        تعديل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ترقيم الصفحات */}
          {drivers.length > driversPerPage && (
            <div className="pagination">
              {Array.from({ length: Math.ceil(drivers.length / driversPerPage) }).map((_, index) => (
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

export default DriverList;
