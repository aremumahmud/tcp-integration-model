'use strict'

// requiring modules

var events = require('events')
var util = require('util')
var Net = require('net')
var { EventEmitter } = events
var SocketProxy = require('./socket-proxy')
var http = require('http')
var combine = require('./combine')


util.inherits(controlSystem, EventEmitter)

/**the control system api contains systems and systemConfig stores

----------system schema ------------
@access
 [ system ] => { < availability > : [ Boolean ] , < client > : [ typeof new net.Socket] }

 --------- systemConfig schema -------

 [ systemConfig ] => {

    < port > => [ Number ],  // port = > 2002
    < host > => [ String ],  // localhost => 127.0.0.01
    < name > => [ String ],  // encryptionSystem
    < onConnect > => [ Function ],  // runs when the system is connected
    < onError > => [ Function ]  // runs when any type of error is emitted fron connection i.e ECONNRESET

 }



*/

function controlSystem(sysName, reconnetInterval) {

    this.systemsConfig = {}
    this.systems = {}
    this.systemName = sysName
    this.Socket = null
    this.Server = null
    this.userId = {}
    this.actionScheme = {}
    this.systemsConfigBackup = {}
    this.state = false

}

/** 

------ controlSystem._connect  --------

* @param api interface used to connect tcp systems
* @access ControlSystem class
* @desc attachSystems api

get < host >      ===>    [ options ]  
get < port >      ===>    [ options ]
get < name >      ===>    [ config ]
get < onConnect > ===>    [ config ]
get < onError >   ===>    [ config ]

*/
controlSystem.prototype._connect = function(config, options, isReload) {
    var { host, port } = options
    var client = new Net.Socket();

    client.connect({ port, host }, function() {

        if (isReload) {
            this.emit('reloadSucess', config.name)
            if (this.systems[config.name]) {
                this.systems[config.name] = { availability: true, client }
            }
            //  console.log()
            this.systems[config.name] = { availability: true, client }
                // console.log('amsgklm, dkmm,d', config)
            this.send(config.name, this.systemName, 'init')
            config.onConnect()
        } else {
            // console.log('config1', config)
            this.systems[config.name] = { availability: true, client }
            this.send(config.name, this.systemName, 'init')
            config.onConnect()
        }

    }.bind(this));

    client.on('data', function(chunk) {

        var data = chunk.toString().split('+*+')
            // console.log('recievig msg', data)
        console.log(data)
        var filter = data[0]
        var msg = JSON.parse(data[1])
        this.emit(filter, msg)

    }.bind(this));

    client.on('error', function(e) {
        console.log(config)
        config.onError(e)

        if (e.code == 'ECONNREFUSED' && config.resetOptions) {
            console.log('hey i am the problem')
            if (config.resetInterval) {
                setTimeout(() => {
                    this.reconnectSystem(config, options)
                }, config.resetInterval);

            } else {
                this.reconnectSystem(config, options)
            }

        } else if (e.code == 'ECONNRESET' && config.resetOptions) {
            // console.log(this.systems)
            if (this.systems[config.name])
                this.systems[config.name].availability = false
            if (config.resetInterval) {
                setTimeout(() => {
                    this.reconnectSystem(config, options)
                }, config.resetInterval);

            } else {
                this.reconnectSystem(config, options)
            }
        } else if (e.code == 'EADDRNOTAVAIL' && config.resetOptions) {
            if (config.resetInterval) {
                setTimeout(() => {
                    this.reconnectSystem(config, options)
                }, config.resetInterval);

            } else {
                this.reconnectSystem(config, options)
            }
        } else if (e.code == 'ENOENT' && config.resetOptions) {
            if (config.resetInterval) {
                setTimeout(() => {
                    this.reconnectSystem(config, options)
                }, config.resetInterval);

            } else {
                this.reconnectSystem(config, options)
            }
        }

        this.emit('sysError', { error: e, system: config.name })

    }.bind(this))




    return this

}

controlSystem.prototype.addSystem = function(name, config) {
    this.systemsConfig[name] = config
    return this
}

controlSystem.prototype.addSystems = function(configs) {
    console.log(configs)
    configs.map(config => {
        this.addSystem(config.name, config)
    })

    return this
}

controlSystem.prototype.attachSystems = function() {
    var configs = Object.keys(this.systemsConfig)
    configs.forEach(config => {
        var {

            port,
            host,
            name,
            onConnect,
            onError,
            resetOptions,
            resetInterval

        } = this.systemsConfig[config]

        this._connect({ onConnect, onError, name, resetOptions, resetInterval }, { port, host })
    })
    if (!this.state) {
        this.state = true
    }
    this.systemsConfigBackup = combine(this.systemsConfigBackup, {...this.systemsConfig })
    this.systemsConfig = {}
    this.emit('attachedAll', 'sucess')
    return this
}

controlSystem.prototype.send = function(sysName, data, filter) {
    let minisys = this.systems[sysName]
    if (minisys) {
        if (minisys.availability) {
            if (typeof data != 'string') {
                data = JSON.stringify(data)
            }
            if (filter) {
                minisys.client.write(filter + '+*+' + data)
            } else {
                minisys.client.write(data)
            }
        } else {
            console.log('could not send to server : ' + sysName)
        }
    } else {
        console.log('couldnt find requested server')
    }


    return this
}

controlSystem.prototype.reconnectSystem = function(conf, options) {
    console.log('reconnecting system ...')
    var config = conf
    var {
        name,
        onConnect,
        onError,
        resetOptions,
        resetInterval
    } = config

    var {
        host,
        port
    } = options

    this._connect({
        onConnect,
        onError,
        name,
        resetOptions,
        resetInterval
    }, { port, host }, true)
}


controlSystem.prototype.startServer = function(port, app) {
    this.Server = http.createServer(app)
    this.Server.listen(port, () => {

    })
    return this
}

controlSystem.prototype.integrateSocketCommunucation = function(socketFramework, origin) {
    if (!origin) {
        this.Socket = socketFramework(this.Server, {
            cors: {
                origin: '*'
            }
        })
    } else {
        this.Socket = socketFramework(this.Server, origin)
    }

    // this.Socket.origins('*:*')
    new SocketProxy(this.Socket, this)
    return this
}

controlSystem.prototype.setActionScheme = function(action, actionFunction) {
    this.actionScheme[action] = actionFunction
    return this
}

controlSystem.prototype.setActionSchemes = function(schemes) {
    schemes.forEach(scheme => {
        this.setActionScheme(scheme.action, scheme.exec)
    })
    return this
}

controlSystem.prototype.emitToClient = function(clientId, action, data) {
    if (typeof clientId == 'string' && clientId) {
        this.Socket.to(clientId).emit(action, data)
    }
    return this
}


//added new methods
controlSystem.prototype.broadcastToClients = function(action, data) {

    this.Socket.emit(action, data)

    return this
}
module.exports = controlSystem

//module.exports = controlSystem