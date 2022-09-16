var events = require('events')
var util = require('util')
var { EventEmitter } = events




util.inherits( SocketProxy , EventEmitter )


function SocketProxy ( socket , master ){

    socket.on('connection' , UserSocket=>{
        master.userId[UserSocket.id] = UserSocket
        UserSocket.emit('begin' , 'mofu')
        UserSocket.on( 'data' , msg =>{
            var data = msg
            var dataParams = data.split(' +*+*+ ')
            var action = dataParams[0]
            var data = JSON.parse(dataParams[1])
            data._userId = UserSocket.id
            master.actionScheme[action](data , master)

        })
        

    })

}

module.exports  = SocketProxy