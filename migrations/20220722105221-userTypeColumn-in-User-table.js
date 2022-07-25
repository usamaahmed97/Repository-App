'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "user",
      "userType",
      {
        type: Sequelize.STRING,
   
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("user", "userType");
  }
};
