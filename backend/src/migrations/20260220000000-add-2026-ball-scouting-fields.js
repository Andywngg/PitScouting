'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('teams');

    if (!tableInfo.autoCanScoreBalls) {
      await queryInterface.addColumn('teams', 'autoCanScoreBalls', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    }

    if (!tableInfo.estimatedTotalPoints) {
      await queryInterface.addColumn('teams', 'estimatedTotalPoints', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    if (!tableInfo.pointContributionPercent) {
      await queryInterface.addColumn('teams', 'pointContributionPercent', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    if (!tableInfo.ballsPerCycle) {
      await queryInterface.addColumn('teams', 'ballsPerCycle', {
        type: Sequelize.FLOAT,
        allowNull: true,
      });
    }

    if (!tableInfo.cyclesPerMatch) {
      await queryInterface.addColumn('teams', 'cyclesPerMatch', {
        type: Sequelize.FLOAT,
        allowNull: true,
      });
    }

    if (!tableInfo.maxBallCapacity) {
      await queryInterface.addColumn('teams', 'maxBallCapacity', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    if (!tableInfo.shootingTypes) {
      await queryInterface.addColumn('teams', 'shootingTypes', {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: [],
      });
    }

    if (!tableInfo.shootingLocationType) {
      await queryInterface.addColumn('teams', 'shootingLocationType', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'single',
      });
    }

    if (!tableInfo.shootingLocationNotes) {
      await queryInterface.addColumn('teams', 'shootingLocationNotes', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('teams');

    if (tableInfo.shootingLocationNotes) {
      await queryInterface.removeColumn('teams', 'shootingLocationNotes');
    }

    if (tableInfo.shootingLocationType) {
      await queryInterface.removeColumn('teams', 'shootingLocationType');
    }

    if (tableInfo.shootingTypes) {
      await queryInterface.removeColumn('teams', 'shootingTypes');
    }

    if (tableInfo.maxBallCapacity) {
      await queryInterface.removeColumn('teams', 'maxBallCapacity');
    }

    if (tableInfo.cyclesPerMatch) {
      await queryInterface.removeColumn('teams', 'cyclesPerMatch');
    }

    if (tableInfo.ballsPerCycle) {
      await queryInterface.removeColumn('teams', 'ballsPerCycle');
    }

    if (tableInfo.pointContributionPercent) {
      await queryInterface.removeColumn('teams', 'pointContributionPercent');
    }

    if (tableInfo.estimatedTotalPoints) {
      await queryInterface.removeColumn('teams', 'estimatedTotalPoints');
    }

    if (tableInfo.autoCanScoreBalls) {
      await queryInterface.removeColumn('teams', 'autoCanScoreBalls');
    }
  },
};
