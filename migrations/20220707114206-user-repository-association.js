'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.changeColumn('repository', 'userId', {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      reference: {
        model: 'User',
        key: 'id'
  }
    })

  },

  async down (queryInterface, Sequelize) {

    await queryInterface.changeColumn("repository","userId", {

      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',

    });
    
  }
};
