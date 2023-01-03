'use strict';
const bcrypt = require('bcrypt');
const makePassword = (pw) => {
  return new Promise(async rs => {
    let salt, hash;
    salt = await bcrypt.genSalt(10);
    hash = await bcrypt.hash(pw, salt);
    return rs(hash);
  })
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let password = await makePassword("12345678");
    await queryInterface.bulkInsert('Users',
      [
        {
          name: "Super User 1",
          email: "superuser1@mail.com",
          roleId: 1,
          password: password,
          verified: true,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Admin 1",
          email: "admin1@mail.com",
          roleId: 2,
          password: password,
          verified: true,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "User 1",
          email: "user1@mail.com",
          roleId: 3,
          password: password,
          verified: true,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "User 2",
          email: "user2@mail.com",
          roleId: 3,
          password: password,
          verified: true,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ], {});
  },

  async down(queryInterface, Sequelize) {
     await queryInterface.bulkDelete('Users', null, {});
  }
};
