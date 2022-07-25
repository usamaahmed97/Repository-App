"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn(
        "user",
        "userType",
        {
          type: Sequelize.STRING,
     
        },
     
      );
    } catch (err) {
      console.log(err);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("user", "userType");
  },
};
