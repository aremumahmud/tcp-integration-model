var events = require('events')
var { EventEmitter } = events
var util = require('util')
var Net = require('net')
var serverProxy = require('./server-proxy')
var ControlSystem = require('./controlSystemModel')


util.inherits(miniSystem, EventEmitter)

function miniSystem(config) {

    this.systemQueue = {}
    this.controlSystem = sysName => new ControlSystem(sysName)

}


miniSystem.prototype.startOperation = function(port, onstart) {

    var server = new Net.createServer();
    server.listen(port, onstart);
    var servProx = new serverProxy(server)
    return servProx

}

miniSystem.prototype.bindToQueue = function(systemName, socket) {
    console.log(systemName)
    this.systemQueue[systemName] = {
        availability: true,
        socket: socket,
        queue: []
    }
    this.systemQueue[systemName].socket.on('error', () => {
        this.systemQueue[systemName].availability = false
        this.emit('disconnect', systemName)
    })
}

miniSystem.prototype.send = function(system, data, filter) {
    var systemData = this.systemQueue[system]
    if (systemData && systemData.availability) {
        if (typeof data == 'object') {
            var jsonData = JSON.stringify(data)
            systemData.socket.write(filter + '+*+' + jsonData)
        } else if (typeof data == 'string' || typeof data == 'number') {
            var dataObj = {}
            dataObj.msg = data
            var jsonData = JSON.stringify(dataObj)
            systemData.socket.write(filter + '+*+' + jsonData)

        }
    } else {
        if (!systemData) {
            return console.log('cannot find requested system')
        }
        systemData.queue.push({ data, filter })
        console.log('unable to connect to ' + system)
    }

}
miniSystem.prototype.sendFromServer = function(system, data, filter) {
    this.controlSystem.send(system, data, filter)
    return this.controlSystem
}
module.exports = miniSystem