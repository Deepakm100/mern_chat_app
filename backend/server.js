const express = require('express')
const app = express()
const chats = require('./data/data')
const dotenv = require('dotenv');
const connectDb = require('./config/db');
const colors = require('colors');
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')
const {notFound,errorHandler} = require('./middleware/errorMiddleware')
const path = require('path')
dotenv.config();
connectDb()
const port = process.env.PORT || 5000
app.use(express.json());

// chats route

app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/message',messageRoutes)

// Deployment --------
const _dirname1 = path.resolve()
if(process.env.NODE_ENV = 'production'){
  app.use(express.static(path.join(_dirname1,'/frontend/dist')))
  console.log('apka path 1',path.join(_dirname1,'/frontend/dist'))
  console.log('apka path 2',path.resolve(_dirname1,'frontend','dist','index.html'))
  app.get('*',(req,res)=>{
    res.sendFile(path.resolve(_dirname1,'frontend','dist','index.html'))
  })
} else {
    app.get('/',(req,res)=> {
        res.send('api is running ')
    })
}
// Deployment --------

app.use(notFound)
app.use(errorHandler)

const server = app.listen(port,console.log(`server running on port ${port}`.yellow.bold) )

const io = require('socket.io')(server,{
    pingTimeout:50000,
    cors:{
        origin:"http://localhost:5173"
    }
})

//
io.on('connection',(socket)=>{

    socket.on('setup',(user)=>{
        socket.join(user._id)
        socket.emit('connected')

    })

    socket.on('join chat',(room)=>{
        socket.join(room)
        console.log(`user in the room ${room}`);
    })
    socket.on('typing',(room) => socket.in(room).emit('typing'))
    socket.on('stop typing',(room) => socket.in(room).emit('stop typing'))
    // message functionality

    socket.on('new message',(newMessage)=>{
        console.log('new message',newMessage);
        const chat = newMessage.chat
        if(!chat.users) return
        chat.users.forEach(user => {
            if(user._id === newMessage.sender._id) return 
            socket.in(user._id).emit('message received',newMessage)
            
        });
    })

})
