var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  isUserLoggedIn: false
});

User.prototype.isLoggedIn = function(){
  return isUserLoggedIn;
};

User.prototype.logIn = function(){
  isUserLoggedIn = true;
};

User.prototype.logOut = function(){
  isUserLoggedIn = false;
}

module.exports = User;
