const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// variables
const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname,'../public')

app.use(express.static(publicPath));

let count = 0;

io.on('connection', (socket) => {

    socket.on('join', ({ username, room}, callback) => {
        const {error, user } = addUser({ id: socket.id, username, room })

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('newMessage', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('newMessage', generateMessage(`${user.username} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    
        callback()
    }) 

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if(filter.isProfane(message)){
            return callback('Profanity not allowed.')
        }

        io.to(user.room).emit('newMessage', generateMessage(user.username, message));
        callback()
    })

    socket.on('shareLocation', (position, callback) =>{
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${position.lat},${position.long}`));
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('newMessage', generateMessage(`${user.username} has left`));
            
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
           
        }

    })

})

server.listen(port, () => {
    console.log('Server running on port ' + port)
})