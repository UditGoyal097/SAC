const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dataDir = path.join(__dirname, '../../data');
const usersFile = path.join(dataDir, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize users file if it doesn't exist
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
}

const getUsers = () => {
  const data = fs.readFileSync(usersFile, 'utf8');
  return JSON.parse(data);
};

const saveUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

const findUserByEmail = (email) => {
  const users = getUsers();
  return users.find(u => u.email === email);
};

const findUserById = (id) => {
  const users = getUsers();
  return users.find(u => u.id === id);
};

const createUser = (email, password) => {
  const users = getUsers();
  const id = Date.now().toString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  const newUser = {
    id,
    email,
    password: hashedPassword,
    favorites: [],
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

const updateUserFavorites = (id, favorites) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex].favorites = favorites;
  saveUsers(users);
  return users[userIndex];
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  getUsers,
  saveUsers,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserFavorites,
  generateToken,
};
