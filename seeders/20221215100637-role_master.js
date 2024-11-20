"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "role_master",
      [
        {
          id: "c4be6a50-1bda-4237-bbf5-b607c37cd9b0",
          role_name: "Admin",
          is_active: true,
          created_by: "0a6495f7-7c0f-442c-aad0-a13d8c2d4ce5",
        },
        {
          id: "786a4a1a-5d6a-4f9c-8d31-692482dec27c",
          role_name: "Developer",
          is_active: true,
          created_by: "0a6495f7-7c0f-442c-aad0-a13d8c2d4ce5",
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("role_master", null, {});
  },
};
