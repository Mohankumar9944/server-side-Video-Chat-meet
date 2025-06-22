

import { sequelize } from '../lib/db.js';
import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';

User.belongsToMany(User, {
  as: 'Friends',
  through: 'UserFriends',
  foreignKey: 'userId',
  otherKey: 'friendId'
});

User.belongsToMany(User, {
  as: 'FriendOf',
  through: 'UserFriends',
  foreignKey: 'friendId',
  otherKey: 'userId'
});

// ✅ FriendRequest associations
User.hasMany(FriendRequest, { as: 'SentRequests', foreignKey: 'senderId' });
User.hasMany(FriendRequest, { as: 'ReceivedRequests', foreignKey: 'recipientId' });

FriendRequest.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
FriendRequest.belongsTo(User, { as: 'Recipient', foreignKey: 'recipientId' });

export {
  sequelize,
  User,
  FriendRequest
};
