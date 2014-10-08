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
};

User.prototype.comparePassword = function(password, callback){
  this.fetch().then(function(model) {
    console.log('comparePassword of ', model);
    var hash = model.get('password');
    console.log('password hash: ', hash);
    console.log('raw password: ', password);

    bcrypt.compare(password, hash, callback);
  });

};

User.prototype.hashPassword = function(callback){
  // bcrypt.genSalt(1, function(err, salt){
    bcrypt.hash(this.password, null, null, function(err, hash) {
      // Store hash in your password DB.
      console.log('hash the password! ', typeof hash);
      this.set('password', hash);
      callback();
    }.bind(this));
  // }.bind(this));
};

module.exports = User;
