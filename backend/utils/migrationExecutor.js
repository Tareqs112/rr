const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Create migration executor with proper dependency order
const executeMigrations = async () => {
  const sequelize = new Sequelize('car_rental_db', 'car_rental_user', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log
  });

  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Get all migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const allMigrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'));

    // Define migration order based on dependencies
    const migrationOrder = [
      // First level - no dependencies
      'create-users.js',
      'create-customers.js',
      'create-vehicle-models.js',
      'create-drivers.js',
      // Second level - depends on first level
      'create-vehicles.js',
      // Third level - depends on second level
      'create-bookings.js',
      // Fourth level - depends on third level
      'create-notifications.js'
    ];

    // Sort migration files according to dependency order
    const sortedMigrationFiles = [];
    
    for (const orderFile of migrationOrder) {
      const matchingFile = allMigrationFiles.find(file => file.includes(orderFile));
      if (matchingFile) {
        sortedMigrationFiles.push(matchingFile);
      }
    }

    // Add any remaining files not explicitly ordered
    const remainingFiles = allMigrationFiles.filter(file => !sortedMigrationFiles.includes(file));
    sortedMigrationFiles.push(...remainingFiles);

    console.log(`Found ${sortedMigrationFiles.length} migration files to execute in dependency order.`);

    // Execute migrations in order
    const queryInterface = sequelize.getQueryInterface();
    
    for (const file of sortedMigrationFiles) {
      console.log(`Executing migration: ${file}`);
      const migration = require(path.join(migrationsDir, file));
      
      try {
        await migration.up(queryInterface, Sequelize);
        console.log(`Migration ${file} executed successfully.`);
      } catch (error) {
        console.error(`Error executing migration ${file}:`, error);
        throw error;
      }
    }

    console.log('All migrations executed successfully.');
    return true;
  } catch (error) {
    console.error('Error executing migrations:', error);
    return false;
  } finally {
    await sequelize.close();
  }
};

module.exports = {
  executeMigrations
};
