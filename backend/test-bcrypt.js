const bcrypt = require('bcryptjs');

const hashedPassword = '$2b$10$B2KUmBdXw7a7pCqLktJDFe7zFSf6YBAhwEPYqf4iM57ShobmC59.a';
const plainPassword = '123456';

bcrypt.compare(plainPassword, hashedPassword)
  .then(result => console.log("✅ النتيجة:", result))
  .catch(err => console.error("❌ خطأ:", err));
