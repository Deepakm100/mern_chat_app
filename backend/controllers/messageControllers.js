const expressAsyncHandler = require("express-async-handler");
const Message = require('../models/messageModel');
const User = require("../models/userModel");
const Chat = require('../models/chatModel')

const sendMessage = expressAsyncHandler(async(req,res) => {

    const {content,chatId} = req.body

    if(!content || !chatId){
       console.log('Invalid data passed in request');
        return res.sendStatus(400)
    }

    let newMessage = {
        sender:req.user._id,
        content,
        chat:chatId
    }

    try {
        let message = await Message.create(newMessage)
        //  now we populate the data 
        message = await message.populate('sender','name pic')
        message = await message.populate('chat')
        message = await User.populate(message,{
            path:'chat.users',
            select:'name pic email'
        })
        // updating the latest message 
        await Chat.findByIdAndUpdate(chatId,{
            latestMessage:message
        })
        res.json(message)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }

})

const allMessages = expressAsyncHandler(async(req,res) => {

    try {
        const messages = await Message.find({chat:req.params.chatId}).
        populate('sender','name email pic')
        .populate('chat')

     res.json(messages) 
        
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
                   
})

module.exports = {sendMessage,allMessages}
