'use strict';

const bcrypt = require('bcryptjs');
require('dotenv').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Team 1334 Admin';
    const adminTeamNumber = Number(process.env.ADMIN_TEAM_NUMBER || 1334);

    if (!adminEmail || !adminPassword) {
      console.log('Skipping admin seeder: ADMIN_EMAIL/ADMIN_PASSWORD not set');
      return;
    }

    const password = await bcrypt.hash(adminPassword, 10);

    await queryInterface.bulkInsert('users', [{
      name: adminName,
      email: adminEmail,
      password,
      teamNumber: Number.isNaN(adminTeamNumber) ? 1334 : adminTeamNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;
    await queryInterface.bulkDelete('users', { email: adminEmail });
  }
}; 
