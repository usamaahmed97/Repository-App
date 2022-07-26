"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("timelog", "signinTime");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("timelog", "signinTime", {
      type: Sequelize.TIME,
      allowNull: true,
    });
  },
};
