'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.createTable("timelog", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: true,
        autoIncrement: true,
      },
    
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          model: 'User',
          key: 'id'
    }
      },
    
      signinTime: {
        type: Sequelize.TIME,
        allowNull: true,
      },
    
      signoutTime: {
        type: Sequelize.TIME,
        allowNull: true,
      },
    
      timeElapsed: {
        type: Sequelize.STRING,
        allowNull: true,
      },

     });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("timelog");
  }
};
