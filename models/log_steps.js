"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LogSteps extends Model {
    static associate(models) {
      LogSteps.belongsTo(models.UserProfiles, {
        as: "creator",
        foreignKey: "created_by",
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });
      LogSteps.belongsTo(models.UserProfiles, {
        as: "deleter",
        foreignKey: "deleted_by",
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });
      LogSteps.belongsTo(models.LogRequests, {
        foreignKey: "request_id",
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });
    }
  }
  LogSteps.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      request_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      log_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      step_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      input: {
        type: DataTypes.JSONB,
      },
      output: {
        type: DataTypes.JSONB,
      },
      error_message: {
        type: DataTypes.TEXT,
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
      modelName: "LogSteps",
      tableName: "log_steps",
      underscored: true,
      createdAt: false,
      updatedAt: false,
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  return LogSteps;
};
