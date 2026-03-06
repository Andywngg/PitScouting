'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('teams');

    if (!tableInfo.scouterName) {
      await queryInterface.addColumn('teams', 'scouterName', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('teams');

    if (tableInfo.scouterName) {
      await queryInterface.removeColumn('teams', 'scouterName');
    }
  },
};
