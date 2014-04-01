/* globals AppServer */

/**
* Module exports
*/
module.exports = AppServer;


/**
* Constructor
*/
function AppServer(io) {
    this.io = io;
}

AppServer.prototype.setup = function() {
    var appServer = this;

    appServer.io.sockets.on('connection', function (socket) {

        appServer.initializeListeners(socket);

    });
};


/**
* This function is called to initialize all listeners for every new socket connection
*/
AppServer.prototype.initializeListeners = function (socket) {
    /////////////////////////////////////////////////////////////////////
    /// newLeapAction
    /// Fired if a leap action was detected and sent to the server
    /////////////////////////////////////////////////////////////////////
    socket.on('newLeapAction', function(data) {
        console.log('New action triggered:' + data);

        socket.emit('actionResponse', { action: 'Nice move!' });
    });


    /////////////////////////////////////////////////////////////////////
    /// Disconnect event
    /// Fired on socket disconnect
    /////////////////////////////////////////////////////////////////////
    socket.on('disconnect', function() {
        var socket = this;
        console.log("Socket: " + socket.id + " disconnected");
    });
};
