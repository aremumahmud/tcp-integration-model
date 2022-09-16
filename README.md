# tcp-integration-model
An integration software to ease  and hasten up development process in nodejs . It is a low level software due to the usage of tcp protocol and can integrate from the frontend through the backend


## setup

```
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

```
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

```
var miniSystem = require('tcp-integration-model')
var mini = new miniSystem()

mini 
   .startOperation(3000 , onstart)
   .on('sysError' , err=>{
       console.log(err)
   }) 

```
