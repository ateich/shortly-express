var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookieSession = require('express-session');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser('secret'));
app.use(cookieSession({secret:'secret'}));

var checkUser = function restrict(req, res, next) {
  console.log('restricting... ', req.session)
  if (req.session.user) {
    console.log('access granted');
    next();
  } else {
    console.log('access denied');
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}


app.get('/',checkUser,
function(req, res) {
  //if user logged in
  res.render('index');
});

app.get('/login',
function(req, res) {
  res.render('login');
});

app.get('/create', checkUser,
function(req, res) {
  res.render('index');
});

app.get('/links',checkUser,
function(req, res) {
  console.log('get links');
  Links.reset().fetch().then(function(links) {
    console.log('link models: ', links.models);
    res.send(200, links.models);
  });
});

app.post('/login',
function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  new User({username: username, password: password}).fetch()
  .then(function(model){
    console.log('Found User: ', model);
    if(model){
      model.logIn();
      req.session.regenerate(function(){
        req.session.user = username;
        res.redirect(301, '/');
        // res.send(200);
      });
    } else {
      res.redirect(301, '/login');
      // res.send(403);
    }
  });
});

app.post('/signup', function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  new User({username: username, password:password}).save()
  .then(function(model){
    console.log('signed up a new user');
    model.logIn();
    req.session.regenerate(function(){
      req.session.user = username;
      res.redirect(301, '/');
      // res.send(200);
    });
  });
});

app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
