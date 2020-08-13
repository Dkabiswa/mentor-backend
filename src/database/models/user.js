/* eslint-disable no-unused-vars */
export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    accountType: DataTypes.STRING,
    verified: DataTypes.BOOLEAN,
  }, {});
  User.associate = (models) => {
    // associations can be defined here
  };
  return User;
};
