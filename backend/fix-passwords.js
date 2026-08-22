const bcrypt = require('bcrypt');
const db = require('./src/config/db');

async function updatePasswords() {
  try {
    
    const realHash = await bcrypt.hash('demo123', 10); 

    
    await db.query('UPDATE users SET password_hash = $1', [realHash]);

    console.log('Success! All user passwords are now correctly hashed as: demo123');
    process.exit();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updatePasswords();
