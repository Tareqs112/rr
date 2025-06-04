import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllVehicles, getVehicleAvailability } from '../../services/vehicles';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [vehiclesPerPage] = useState(10);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await getAllVehicles();
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError('فشل في تحميل بيانات المركبات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterVehicles();
  };

  const filterVehicles = () => {
    let filteredVehicles = [...vehicles];
    
    // تطبيق فلتر البحث
    if (searchTerm) {
      filteredVehicles = filteredVehicles.filter(vehicle => 
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // تطبيق فلتر الحالة
    if (filterStatus) {
      filteredVehicles = filteredVehicles.filter(vehicle => 
        vehicle.status === filterStatus
      );
    }
    
    setVehicles(filteredVehicles);
    setCurrentPage(1);
  };

  const resetFilters = async () => {
    setSearchTerm('');
    setFilterStatus('');
    fetchVehicles();
  };

  // الحصول على المركبات الحالية
  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = vehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);

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
        <h2>قائمة المركبات</h2>
        <div className="actions">
          <Link to="/vehicles/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> إضافة مركبة جديدة
          </Link>
        </div>
      </div>

      <div className="filter-section">
        <form onSubmit={handleSearch} className="form-row">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="بحث بالماركة، الموديل، أو رقم اللوحة"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <select
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">جميع الحالات</option>
              <option value="available">متاح</option>
              <option value="rented">مؤجر</option>
              <option value="maintenance">صيانة</option>
              <option value="unavailable">غير متاح</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary mr-2">
            بحث
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetFilters}>
            إعادة تعيين
          </button>
        </form>
      </div>

      {vehicles.length === 0 ? (
        <div className="not-found">لا يوجد مركبات للعرض</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الماركة</th>
                  <th>الموديل</th>
                  <th>السنة</th>
                  <th>رقم اللوحة</th>
                  <th>الحالة</th>
                  <th>السعر اليومي</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currentVehicles.map((vehicle, index) => (
                  <tr key={vehicle.id}>
                    <td>{indexOfFirstVehicle + index + 1}</td>
                    <td>{vehicle.make}</td>
                    <td>{vehicle.model}</td>
                    <td>{vehicle.year}</td>
                    <td>{vehicle.plateNumber}</td>
                    <td>
                      <span className={`status-badge ${vehicle.status}`}>
                        {vehicle.status === 'available' && 'متاح'}
                        {vehicle.status === 'rented' && 'مؤجر'}
                        {vehicle.status === 'maintenance' && 'صيانة'}
                        {vehicle.status === 'unavailable' && 'غير متاح'}
                      </span>
                    </td>
                    <td>{vehicle.dailyRate} ريال</td>
                    <td>
                      <Link to={`/vehicles/${vehicle.id}`} className="btn btn-sm btn-primary mr-2">
                        عرض
                      </Link>
                      <Link to={`/vehicles/${vehicle.id}/edit`} className="btn btn-sm btn-secondary mr-2">
                        تعديل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ترقيم الصفحات */}
          {vehicles.length > vehiclesPerPage && (
            <div className="pagination">
              {Array.from({ length: Math.ceil(vehicles.length / vehiclesPerPage) }).map((_, index) => (
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

export default VehicleList;
