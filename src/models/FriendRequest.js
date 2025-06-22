
import { DataTypes } from 'sequelize';
import { sequelize } from '../lib/db.js';

const FriendRequest = sequelize.define('FriendRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'friend_requests',
  timestamps: true,

  indexes: [
    { fields: ['senderId'] },
    { fields: ['recipientId'] }
  ]
});

export default FriendRequest;
