# tcp-integration-model
An integration software to ease  and hasten up development process in nodejs . It is a low level software due to the usage of tcp protocol and can integrate from the frontend through the backend


### Defining core methods and functions of the controlSystem

#### control.addSystem() / control.addSystems()
This is the more inportant part as it allows you to add in mini server systems.
the difference between the two is that the  `control.addSystem()` accepts an object
while the ` control.addSystems()` accepts an array of systems

an example of a system is shown

```javascript
let  SYSTEM = { 

               PORT ,
               HOST ,
               NAME ,
               onConnect ,
               onError
            }
          
control.addSystem( NAME , SYSTEM)
```
and an amazing feature is that if a server shuts down and is turn back on , the model will automatically connect to it and 
also log its connection and disconnection 


##### control.startServer
This method starts an http connection to a browser for easy communication with the browser.
It arguments are a port number and a web app i.e express app
```javascript
controlSystem.startServer( PORT , EXPRESSAPP or simple HTTP APP)
```


##### control.integrateSocketCommunucation(sock)
This method allows the easy integration of websocket Frameworks such as socket.io
for easy communication

```javascript
var sock = require('socket.io')
controlSystem.integrateSocketCommunucation(sock)

```
#### control.on()

This is a listener that listens for incomming data/msg coming from server systems such as the minisystem model

```javascript
controlSystem.on( EVENT , EVENT_HANDLER)
```

#### control.setActionScheme() / control.setActionScheme()

This is where the automative idea of the control system comes from.
It sets down operation for incoming events from the client side
i.e the io.emit() events from the browser. the difference between the two is that the  `control.setActionScheme()` accepts an object
while the ` control.setActionSchemes()` accepts an array of schemas

an example of a scheme would be

```javascript
 {
        action : 'login' , 
        exec : (data, master)=>{
          var userId = data._userId
          console.log(data)

          db.loginUser( data.email , data.password ).then(res=>{
            // do something
            master.emitToClient( userId, "loginSucess", { data : res })
          }).catch(err=>{
            // do something
            master.emitToClient( userId , "loginFailed" , { data : err})
          })
        }
    }
```
where the action specifies the event and exec passes the data recieved and the controlsystem instance

#### control.emitToClient()
This method emits message or data to the frontend using a socket.io id of the browser which we dont have to
worry about as the model takes care of it. An example is seen as shown

```javascript
control.emitToClient(SOCKET.IO ID , EVENT , DATA)
```
#### control.send()
This method allow the model to be able to send data seamlessly to other mini servers, therfore communicating as the mini servers 
send an event depending of which msg was sent as shown at control.on() method . example

```javascript
control.send( SYSTEMNAME , DATA , EVENT)
```
#### control.addSystem() / control.addSystems()
This is the more inportant part as it allows you to add in mini server systems.
the difference between the two is that the  `control.addSystem()` accepts an object
while the ` control.addSystems()` accepts an array of systems

an example of a system is shown

```javascript
let  SYSTEM = { 

               PORT ,
               HOST ,
               NAME ,
               onConnect ,
               onError
            }
          
control.addSystem( NAME , SYSTEM)
```


## setup

```javascript
var controlSystem = require('./src/controlSystemModel')
var control = new controlSystem('master')
var sock = require('socket.io')
var schemes = require('./Schemas/schema')
var app = require('./expressApp')
control 
   .startServer(3000 , app)
   .integrateSocketCommunucation(sock)
   .setActionSchemes(schemes)
   .on('sysError' , err=>{
       console.log(err)
   }) 

```
### or we setup up control through the minisystem

```javascript
var miniSystem = require('tcp-integration-model')
var mini = new miniSystem()
var control = mini.controlSystem('master')
var sock = require('socket.io')
var schemes = require('./Schemas/schema')
var app = require('./expressApp')
control 
   .startServer(3000 , app)
   .integrateSocketCommunucation(sock)
   .setActionSchemes(schemes)
   .on('sysError' , err=>{
       console.log(err)
   }) 
```

and that is for the setup of a controller which can connect to multiple tcp server mini models

## to setup a tcp server mini model

```javascript
var miniSystem = require('tcp-integration-model')
var mini = new miniSystem()

mini 
   .startOperation(3000 , onstart)
   .on('init' , (data)=>{
       mini.bindToQueue(data.msg , data.socket)
       mini.send(msg.data , 'connection sucessful' , 'onconnect')
   })
   .on('sysError' , err=>{
       console.log(err)
   }) 

```


### Defining core methods and functions of the  miniSystem

### mini.startOperation(port  , callback)

this method starts the tcp server at the 'port' and calls the 'callback' if connected.
Another event handler handles the errors which is the 'sysError event'

```javascript
var miniSystem = require('tcp-integration-model')
var mini = new miniSystem()

mini 
   .startOperation(3000 , onstart)
   .on('sysError' , err=>{
       console.log(err)
   }) 

```

### The 'init' event

This event is fired if a system trys to connect to 'it', having along the servers information for connection
or rejection which is done by either 'toggling' the bindToQueue method

### mini.bindToQueue(nameOfSys , socket)

This method binds a system or server to the miniSystem queue enabling it for internal operations and 
legitimately making it active, 

