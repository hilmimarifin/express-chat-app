'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoleMenuAccess extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RoleMenuAccess.init({
    roleId: DataTypes.BIGINT,
    submenuId: DataTypes.BIGINT,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'RoleMenuAccess',
  });
  return RoleMenuAccess;
};