const path = require('path');

// Import migration executor
const { executeMigrations } = require('./utils/migrationExecutor');

// Import database connection
const db = require('./models/index');

// Execute migrations and initialize database
const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Execute migrations
    console.log('Executing migrations...');
    const migrationsResult = await executeMigrations();
    
    if (!migrationsResult) {
      console.error('Failed to execute migrations. Aborting initialization.');
      process.exit(1);
    }
    
    // Test database connection
    console.log('Testing database connection...');
    const connectionResult = await db.testConnection();
    
    if (!connectionResult) {
      console.error('Failed to connect to database. Aborting initialization.');
      process.exit(1);
    }
    
    // Initialize models and associations
    console.log('Initializing models and associations...');
    const initResult = await db.initMigrations();
    
    if (!initResult) {
      console.error('Failed to initialize models. Aborting initialization.');
      process.exit(1);
    }
    
    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }
};

// Run initialization
initializeDatabase();
