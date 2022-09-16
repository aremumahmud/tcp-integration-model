# tcp-integration-model
An integration software to ease  and hasten up development process in nodejs . It is a low level software due to the usage of tcp protocol and can integrate from the frontend through the backend


## setup

```
var controlSystem = require('./TcimModel/controlSystemModel')
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
