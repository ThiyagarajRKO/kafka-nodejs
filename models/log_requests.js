"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LogRequests extends Model {
    static associate(models) {}
  }
  LogRequests.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      method: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status_code: {
        type: DataTypes.INTEGER,
      },
      source_ip: {
        type: DataTypes.STRING(15),
      },
      user_agent: {
        type: DataTypes.TEXT,
      },
      platform: {
        type: DataTypes.STRING,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
      },
      created_at: {
        type: DataTypes.DATE,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "LogRequests",
      tableName: "log_requests",
      underscored: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  return LogRequests;
};
