# Car Rental Management System

A comprehensive car rental management solution for tourism companies with vehicle, customer, driver, and booking management capabilities.

## Features

- **Customer Management**: Track customer information, history, and preferences
- **Vehicle Management**: Manage fleet with availability calendar and maintenance tracking
- **Driver Management**: Assign and track driver availability and schedules
- **Booking Management**: Create and manage bookings with conflict detection
- **Interactive Calendar**: Visual booking calendar with availability view
- **Notifications**: SMS and WhatsApp integration for booking confirmations and reminders
- **Reporting**: Comprehensive reports with export options (PDF/CSV)
- **Dashboard**: Visual analytics and key performance indicators

## Technology Stack

- **Backend**: Node.js with Express
- **Frontend**: React with Material-UI and Redux
- **Database**: MySQL
- **Authentication**: JWT-based authentication
- **Notifications**: Twilio integration for SMS/WhatsApp
- **Calendar**: FullCalendar integration
- **Reporting**: PDF and CSV export capabilities

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Database Setup

1. Create a MySQL database:

```sql
CREATE DATABASE car_rental_db;
CREATE USER 'car_rental_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON car_rental_db.* TO 'car_rental_user'@'localhost';
FLUSH PRIVILEGES;
```

### Backend Setup

1. Navigate to the backend directory:

```bash
cd car-rental-system/backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update database credentials and other settings

4. Run database migrations:

```bash
node initDb.js
```

5. Start the backend server:

```bash
npm start
```

The backend will be available at http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd car-rental-system/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure API endpoint:
   - Update the API base URL in `src/services/api.js` if needed

4. Start the frontend development server:

```bash
npm start
```

The frontend will be available at http://localhost:3000

## Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=car_rental_db
DB_USER=car_rental_user
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Twilio Configuration (for SMS/WhatsApp notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
WHATSAPP_ENABLED=true
SMS_ENABLED=true
```

## System Architecture

### Backend Structure

- **config/**: Configuration files for database, authentication, etc.
- **controllers/**: Request handlers for each module
- **models/**: Database models and relationships
- **routes/**: API route definitions
- **services/**: Business logic and third-party integrations
- **middleware/**: Custom middleware functions
- **utils/**: Utility functions and helpers
- **migrations/**: Database migration scripts

### Frontend Structure

- **src/assets/**: Static assets like images and icons
- **src/components/**: Reusable UI components
- **src/pages/**: Page components for each module
- **src/redux/**: State management with Redux
- **src/services/**: API service integrations
- **src/utils/**: Utility functions and helpers

## API Documentation

### Authentication

- `POST /api/auth/login`: User login
- `POST /api/auth/register`: Register new user
- `GET /api/auth/profile`: Get current user profile

### Customers

- `GET /api/customers`: Get all customers
- `GET /api/customers/:id`: Get customer by ID
- `POST /api/customers`: Create new customer
- `PUT /api/customers/:id`: Update customer
- `DELETE /api/customers/:id`: Delete customer

### Vehicles

- `GET /api/vehicles`: Get all vehicles
- `GET /api/vehicles/:id`: Get vehicle by ID
- `POST /api/vehicles`: Create new vehicle
- `PUT /api/vehicles/:id`: Update vehicle
- `DELETE /api/vehicles/:id`: Delete vehicle
- `GET /api/vehicles/availability`: Check vehicle availability

### Drivers

- `GET /api/drivers`: Get all drivers
- `GET /api/drivers/:id`: Get driver by ID
- `POST /api/drivers`: Create new driver
- `PUT /api/drivers/:id`: Update driver
- `DELETE /api/drivers/:id`: Delete driver
- `GET /api/drivers/availability`: Check driver availability

### Bookings

- `GET /api/bookings`: Get all bookings
- `GET /api/bookings/:id`: Get booking by ID
- `POST /api/bookings`: Create new booking
- `PUT /api/bookings/:id`: Update booking
- `DELETE /api/bookings/:id`: Delete booking
- `GET /api/bookings/calendar`: Get bookings for calendar view
- `POST /api/bookings/:id/confirm`: Confirm booking
- `POST /api/bookings/:id/cancel`: Cancel booking

### Notifications

- `GET /api/notifications`: Get all notifications
- `POST /api/notifications/send`: Send manual notification
- `GET /api/notifications/status`: Check notification service status

### Reports

- `GET /api/reports/bookings`: Generate bookings report
- `GET /api/reports/vehicles`: Generate vehicles report
- `GET /api/reports/customers`: Generate customers report
- `GET /api/reports/summary`: Generate dashboard summary
- `POST /api/reports/export`: Export report to PDF/CSV

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or inquiries, please contact support@carrentalsystem.com
#   r r  
 #   1 1 2  
 #   1 1 2  
 #   t t  
 