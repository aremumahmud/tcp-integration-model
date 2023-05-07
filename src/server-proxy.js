var events = require('events')
var util = require('util')
var { EventEmitter } = events

util.inherits(serverProxy, EventEmitter)

function serverProxy(server) {
    //    this.sockets = {};
    server.on('connection', function(socket) {
        //  this.sockets['master'] = socket
        //  this.emit('master',socket)
        socket
            .on('error', () => console.log('sth disconn'))
            .on('data', function(chunk) {

                var chnk = chunk.toString()
                var data = chunk.toString().split('+*+')
                var filter = data[0]
                var msg
                try {
                    msg = JSON.parse(data[1])
                } catch (e) {
                    msg = data[1]
                }


                this.emit(filter, { socket, msg })

            }.bind(this))

    }.bind(this))

}
module.exports = serverProxy