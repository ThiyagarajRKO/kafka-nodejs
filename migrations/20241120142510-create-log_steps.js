"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("log_steps", {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      request_id: {
        type: Sequelize.UUID,
        allowNull: false,
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        references: {
          model: { tableName: "log_requests" },
          key: "id",
        },
      },
      log_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      step_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      input: {
        type: Sequelize.JSONB,
      },
      output: {
        type: Sequelize.JSONB,
      },
      error_message: {
        type: Sequelize.TEXT,
      },
      is_active: {
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      created_at: {
        defaultValue: Sequelize.fn("now"),
        type: Sequelize.DATE,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("log_steps");
  },
};
