const mysql = require('mysql2/promise');

async function createDb() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      port: 3306
    });
    await connection.query('CREATE DATABASE IF NOT EXISTS `dental_booking_sys_new`;');
    console.log('Database created or already exists.');
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error.message);
    process.exit(1);
  }
}
createDb();
