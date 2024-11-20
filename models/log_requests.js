"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LogRequests extends Model {
    static associate(models) {
      LogRequests.belongsTo(models.UserProfiles, {
        as: "creator",
        foreignKey: "created_by",
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });
      LogRequests.belongsTo(models.UserProfiles, {
        as: "deleter",
        foreignKey: "deleted_by",
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });
    }
  }
  LogRequests.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      action_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
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
