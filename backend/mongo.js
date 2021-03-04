var mongoose = require('mongoose');
var config = require('./config')
mongoose.connect(config.db_address);
mongoose.set('debug', config.db_debug);