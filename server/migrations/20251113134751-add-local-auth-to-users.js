'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'password_hash', {
      type: Sequelize.STRING,
      allowNull: true,         // null for Google/Facebook-only users
      after: 'email',
    });

    await queryInterface.addColumn('Users', 'auth_provider', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'local',   // 'local' | 'google' | 'facebook'
      after: 'password_hash',
    });

    await queryInterface.addColumn('Users', 'auth_provider_id', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'auth_provider',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'password_hash');
    await queryInterface.removeColumn('Users', 'auth_provider');
    await queryInterface.removeColumn('Users', 'auth_provider_id');
  }
};
