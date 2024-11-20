"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      { tableName: "users", schema: "auth" },
      [
        {
          id: "0a6495f7-7c0f-442c-aad0-a13d8c2d4ce5",
          username: "GroupM",
          email: "hello@groupm.com",
          phone: "6379248545",
          country_code: "+91",
          password:
            "$2a$10$IVqz2Q0SRPerH4RV5PMvM.Puw5tiXqht3mQLJupC2MBhSQ9QcJ3sq",
          is_active: true,
          user_status: "1",
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", null, {});
  },
};
