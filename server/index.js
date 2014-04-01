/**
 * Module dependencies.
 */
var express    = require('express');
var fs         = require('fs');
var http       = require('http');
var socketIo   = require('socket.io');

var AppServer = require('./server.js');

/**
 * Express server, http server and socket.io setup
 */
var app    = express();
var server = http.createServer(app);
var io     = socketIo.listen(server);


/**
 * Setup some express use values
 */
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.set('port', process.env.PORT || 3000);


/**
 * Define which static files to serve in dev mod
 */
app.configure('development', function() {
    app.get('/', function(req, res) {
        fs.readFile(__dirname + '../client/app/index.html', 'utf8', function(err, text){
            res.send(text);
        });
    });
});


/**
 * Listen to events on specified port
 */
server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


/**
* Initialize our server / listeners
*/
var appServer = new AppServer(io);
appServer.setup();
