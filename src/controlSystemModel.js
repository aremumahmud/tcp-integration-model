'use strict'

// requiring modules

var events = require('events')
var util = require('util')
var Net = require('net')
var { EventEmitter } = events
var SocketProxy =  require('./socket-proxy')
var http = require('http')


util.inherits( controlSystem , EventEmitter )

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

function controlSystem ( sysName ) {

    this.systemsConfig = {}
    this.systems = {}
    this.systemName = sysName
    this.Socket = null
    this.Server = null
    this.userId = {}
    this.actionScheme = {}

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
controlSystem.prototype._connect = function ( config , options , isReload) {
    var { host , port } = options
    var client = new Net.Socket();

    client.connect({ port , host }, function() {

        if(isReload){
            this.emit('reloadSucess', config.name)
            if(this.systems[config.name] ){
                this.systems[config.name] = {availability : true ,client}
            }
            
            this.send(config.name , this.systemName , 'init')
            config.onConnect()
        }else{
            
            this.systems[config.name] = {availability : true ,client}
            this.send(config.name ,this.systemName , 'init')
            config.onConnect()
        }
      
    }.bind(this));

    client.on('data', function(chunk) {

        var data = chunk.toString().split('+*+')
        console.log('recievig msg',data)
        var filter = data[0]
        var msg = JSON.parse(data[1])
        this.emit(filter , msg)
        
    }.bind(this));

    client.on('error' , function (e){
        
        config.onError(e)
        if(e.code == 'ECONNREFUSED'){
             this.reconnectSystem(config,options)
        }else if(e.code == 'ECONNRESET'){
            console.log(this.systems)
             this.systems[config.name].availability = false
             this.reconnectSystem(config,options)
        }else if(e.code == 'EADDRNOTAVAIL'){
             this.reconnectSystem(config,options)
        }else if(e.code == 'ENOENT'){
             this.reconnectSystem(config,options)
        }
        
        this.emit('sysError' , {error : e,system : config.name})

    }.bind(this))
   

    
  
    return this

}

controlSystem.prototype.addSystem = function (name , config ) {
    this.systemsConfig[name] = config
    return this
}

controlSystem.prototype.addSystems = function ( configs ) {
    console.log(configs)
    configs.map( config=>{
        this.addSystem(config.name,config)
    })
    
    return this
}

controlSystem.prototype.attachSystems = function () {
    var configs = Object.keys(this.systemsConfig)
    configs.forEach( config =>{
        var { 

               port ,
               host ,
               name ,
               onConnect ,
               onError

            } = this.systemsConfig[config]

        this._connect({onConnect, onError ,name},{port,host})
    })
    this.emit('attachedAll' , 'sucess' )
    return this
}

controlSystem.prototype.send = function (sysName , data , filter){
    var minisys = this.systems[sysName]
    if (minisys) {
        if(minisys.availability){
            if (filter){
                minisys.client.write(filter +'+*+'+data)
           }else{
               minisys.client.write(data)
           }
        }else{
            console.log('could not send to server : ' + sysName)
        }
    }else{
        console.log('couldnt find requested server')
    }
    
  
    return this
}

controlSystem.prototype.reconnectSystem = function ( conf , options){
    console.log('reconnecting system ...')
    var config = conf
    var { 
        name ,
        onConnect ,
        onError

    } = config

    var {
        host,
        port
    } = options

    this._connect({onConnect, onError ,name},{port,host} , true)
}


controlSystem.prototype.startServer = function(port , app){
    this.Server =  http.createServer(app)
    this.Server.listen(port ,()=>{
  
    })
    return this
}
 
controlSystem.prototype.integrateSocketCommunucation = function( socketFramework ){
   this.Socket = socketFramework(this.Server)
   //this.Socket.origins('*:*')
   new SocketProxy( this.Socket , this )
   return this
}

controlSystem.prototype.setActionScheme = function(action , actionFunction){
   this.actionScheme[action] = actionFunction
   return this
}

controlSystem.prototype.setActionSchemes = function( schemes ){
    schemes.forEach( scheme =>{
        this.setActionScheme( scheme.action , scheme.exec )
    })
    return this
 }

 controlSystem.prototype.emitToClient = function( clientId , action , data ){
    if( typeof clientId == 'string' && clientId){
        this.Socket.to( clientId ).emit( action , data)
    }
    return this
 }
 module.exports = controlSystem
