const bcrypt = require('bcryptjs');

// Generate password hash for admin user
const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }

  console.log('Admin Password Hash:');
  console.log('===================');
  console.log(hash);
  console.log('');
  console.log('Update the schema.sql file with this hash:');
  console.log(`INSERT INTO users (username, password_hash, name, email)`);
  console.log(`VALUES ('admin', '${hash}', 'Administrator', 'admin@fftsolar.com');`);
});
