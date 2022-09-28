const bcrypt = require('bcryptjs');

bcrypt.compare(
  'admintuan1',
  '$2a$08$kJp/6Le2X/zWfTsN0YHj7OLVxbQwvn3aefWnYjMMBh5Dzon9mR33m'
).then(res => console.log(res))

