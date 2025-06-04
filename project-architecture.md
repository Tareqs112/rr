# Car Rental Management System - Project Architecture

## Technology Stack

### Backend
- **Framework**: Node.js with Express.js
- **Database ORM**: Sequelize (for MySQL)
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Joi/Express-validator
- **Notification Service**: Twilio API (for SMS/WhatsApp integration)

### Frontend
- **Framework**: React.js
- **State Management**: Redux with Redux Toolkit
- **UI Library**: Material-UI or Ant Design
- **Calendar**: FullCalendar.js
- **Forms**: Formik with Yup validation
- **HTTP Client**: Axios
- **Charts/Reports**: Chart.js and React-PDF

### Database
- **RDBMS**: MySQL
- **Migrations**: Sequelize migrations
- **Seeders**: Sequelize seeders

## Project Structure

```
car-rental-system/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   ├── auth.js
│   │   └── notification.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── vehicleController.js
│   │   ├── driverController.js
│   │   ├── bookingController.js
│   │   └── reportController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Vehicle.js
│   │   ├── VehicleModel.js
│   │   ├── Driver.js
│   │   ├── Booking.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── vehicles.js
│   │   ├── drivers.js
│   │   ├── bookings.js
│   │   └── reports.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── notificationService.js
│   │   ├── bookingService.js
│   │   └── reportService.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── dateUtils.js
│   │   └── responseFormatter.js
│   ├── migrations/
│   ├── seeders/
│   ├── app.js
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── auth/
│   │   │   ├── customers/
│   │   │   ├── vehicles/
│   │   │   ├── drivers/
│   │   │   ├── bookings/
│   │   │   ├── dashboard/
│   │   │   └── reports/
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Customers/
│   │   │   ├── Vehicles/
│   │   │   ├── Drivers/
│   │   │   ├── Bookings/
│   │   │   └── Reports/
│   │   ├── redux/
│   │   │   ├── slices/
│   │   │   ├── store.js
│   │   │   └── hooks.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   ├── customers.js
│   │   │   ├── vehicles.js
│   │   │   ├── drivers.js
│   │   │   ├── bookings.js
│   │   │   └── reports.js
│   │   ├── utils/
│   │   │   ├── dateUtils.js
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── routes.js
│   ├── package.json
│   └── README.md
│
├── database/
│   └── car_rental_db.sql
│
├── .gitignore
├── README.md
└── package.json
```

## Database Schema

### Tables

1. **users**
   - id (PK)
   - username
   - email
   - password
   - role
   - created_at
   - updated_at

2. **customers**
   - id (PK)
   - full_name
   - nationality
   - phone
   - whatsapp
   - company_name
   - is_vip
   - is_repeat_customer
   - created_at
   - updated_at

3. **vehicle_models**
   - id (PK)
   - name
   - description
   - created_at
   - updated_at

4. **vehicles**
   - id (PK)
   - model_id (FK to vehicle_models)
   - license_plate
   - insurance_expiry
   - license_expiry
   - status (available/booked/maintenance)
   - created_at
   - updated_at

5. **drivers**
   - id (PK)
   - name
   - phone
   - license_number
   - languages
   - status (available/off)
   - created_at
   - updated_at

6. **bookings**
   - id (PK)
   - booking_id (unique identifier)
   - customer_id (FK to customers)
   - vehicle_id (FK to vehicles)
   - driver_id (FK to drivers, nullable)
   - pickup_date
   - pickup_time
   - return_date
   - return_time
   - pickup_location
   - drop_location
   - notes
   - payment_status (paid/pending/hold)
   - created_at
   - updated_at

7. **notifications**
   - id (PK)
   - booking_id (FK to bookings)
   - type (sms/whatsapp)
   - recipient
   - message
   - status (sent/failed)
   - sent_at
   - created_at
   - updated_at

## API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/profile

### Customers
- GET /api/customers
- GET /api/customers/:id
- POST /api/customers
- PUT /api/customers/:id
- DELETE /api/customers/:id
- GET /api/customers/:id/bookings

### Vehicles
- GET /api/vehicles
- GET /api/vehicles/:id
- POST /api/vehicles
- PUT /api/vehicles/:id
- DELETE /api/vehicles/:id
- GET /api/vehicles/availability
- GET /api/vehicles/models
- POST /api/vehicles/models
- PUT /api/vehicles/models/:id

### Drivers
- GET /api/drivers
- GET /api/drivers/:id
- POST /api/drivers
- PUT /api/drivers/:id
- DELETE /api/drivers/:id
- GET /api/drivers/available

### Bookings
- GET /api/bookings
- GET /api/bookings/:id
- POST /api/bookings
- PUT /api/bookings/:id
- DELETE /api/bookings/:id
- GET /api/bookings/calendar
- POST /api/bookings/check-availability

### Notifications
- POST /api/notifications/send
- GET /api/notifications/logs

### Reports
- GET /api/reports/bookings
- GET /api/reports/vehicles
- GET /api/reports/customers
- POST /api/reports/export

## Implementation Plan

1. **Setup Project Structure**
   - Initialize backend with Express
   - Initialize frontend with React
   - Configure database connection

2. **Database Implementation**
   - Create database schema
   - Implement migrations
   - Create seeders for initial data

3. **Backend Implementation**
   - Implement models
   - Implement controllers
   - Implement routes
   - Implement services
   - Implement middleware

4. **Frontend Implementation**
   - Setup Redux store
   - Implement authentication
   - Implement dashboard
   - Implement customer management
   - Implement vehicle management
   - Implement driver management
   - Implement booking management with calendar
   - Implement reporting

5. **Integration**
   - Connect frontend with backend APIs
   - Implement notification service
   - Implement reporting service

6. **Testing**
   - Test all modules
   - Test integration
   - Test booking conflict detection
   - Test notification system

7. **Documentation**
   - Create README with setup instructions
   - Document API endpoints
   - Create user guide

8. **Deployment Package**
   - Package the entire application
   - Include SQL dump
   - Include setup instructions
