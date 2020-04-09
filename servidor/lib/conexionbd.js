var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : "localhost",
  port     : "3306",
  user     : "root",
  password : "1234567890",
  database : "competencias"
});

module.exports = connection;