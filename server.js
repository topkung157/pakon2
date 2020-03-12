'use strict';

//mongoose file must be loaded before all other files in order to provide
// models to other modules
var express = require('express'),  //เรียกใช้package
  router = express.Router(),
  bodyParser = require('body-parser'),
  swaggerUi = require('swagger-ui-express'),
  swaggerDocument = require('./swagger.json');

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/food'); //url server

var UserSchema = new Schema({   //เป็นschema ข้อมูล email นั้นแหละ
  email: {
    type: String, required: true,
    trim: true, unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/  //ใช้อักษรได้ email
  },
  firstName: {type: String},
  lastName: {type: String}
});

mongoose.model('User', UserSchema);             //เป็นการเรียกใช้
var User = require('mongoose').model('User');    //เรียกใช้ collection

var app = express();

//rest API requirements
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//middleware for create
var createUser = function (req, res, next) {
  var user = new User(req.body);

  user.save(function (err) {
    if (err) {
      next(err);
    } else {
      res.json(user);
    }
  });
};

var updateUser = function (req, res, next) {
  User.findByIdAndUpdate(req.body._id, req.body, {new: true}, function (err, user) {
    if (err) {
      next(err);
    } else {
      res.json(user);
    }
  });
};

var deleteUser = function (req, res, next) {
  req.user.remove(function (err) {
    if (err) {
      next(err);
    } else {
      res.json(req.user);
    }
  });
};

var getAllUsers = function (req, res, next) {
  User.find(function (err, users) {
    if (err) {
      next(err);
    } else {
      res.json(users);
    }
  });
};

var getOneUser = function (req, res) {
  res.json(req.user);
};

var getByIdUser = function (req, res, next, id) {
  User.findOne({_id: id}, function (err, user) {
    if (err) {
      next(err);
    } else {
      req.user = user;
      next();
    }
  });
};

router.route('/users')    //กำหนดroot
  .post(createUser)
  .get(getAllUsers);

router.route('/users/:userId')    //เจาะจงid
  .get(getOneUser)
  .put(updateUser)
  .delete(deleteUser);

router.param('userId', getByIdUser);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));    //หน้า api
app.use('/api/v1', router);      //รับข้อมูล

app.listen(3000);
module.exports = app;

