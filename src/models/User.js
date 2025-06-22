import { DataTypes } from 'sequelize';
import { sequelize } from '../lib/db.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fullname: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    minlength: 6,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  profilePic: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  nativeLanguage: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '',
  },
  learningLanguage: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '',
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: '',
  },
  isOnboarded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }, 
}, {
  tableName: 'users',
  timestamps: true,
});



User.beforeCreate(async (user, options) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user, options) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

export async function matchPassword (enteredPassword, hashedPassword){
    return await bcrypt.compare(enteredPassword, hashedPassword);
}

export default User;
