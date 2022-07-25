'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn("timelog", "signoutTime");
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn("timelog", "signoutTime");
  }
};
