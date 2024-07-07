const asyncHandler = require("express-async-handler");
const Chat = require('../models/chatModel')
const User = require('../models/userModel')


const accessChats = asyncHandler(async (req, res) => {
    const { userId } = req.body

    if (!userId) {
        console.log('user id params not send');
        return res.sendStatus(400)
    }
    // findind any existing chat
    let isChat = await Chat.find({
        isGroup: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } }
        ]
    }).populate("users", "-password")
        .populate('latestMessage')

    //    here also it populates chat with the details with latest.sender details
    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: 'name pic email'
    })

    if (isChat.length > 0) {
        res.send(isChat[0])
    } else {
        let chatData = {
            chatName: 'sender',
            isGroup: false,
            users: [req.user._id, userId]
        }
        try {
            const createChat = await Chat.create(chatData);

            const fullChat = await Chat.findOne({ _id: createChat._id }).populate("users", "-password")

            res.status(200).send(fullChat)
        } catch (error) {
            res.status(400)
            throw new Error(error.message)
        }
    }
})

const fetchChats = asyncHandler(async (req, res) => {
    try {
        let chat = await Chat.find({
            users: {
                $elemMatch: { $eq: req.user._id }
            }
        }).populate('users', '-password')
            .populate('latestMessage')
            .populate('groupAdmin', '-password')

        chat = await User.populate(chat, {
            path: 'latestMessage.sender',
            select: 'name pic email'
        })
        res.status(200).send(chat)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }

})

const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send('please fill all the fields')
    }
    console.log('before parsing',req.body.name);
    //  let users = JSON.parse(req.body.users)
    //   console.log('after parsing',users);
    let users = req.body.users
    if (users.length < 2) {
        return res.status(400).send('group should have atleast 2 users')
    }
    users.push(req.user)

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            isGroup: true,
            users: users,
            groupAdmin: req.user
        })

        const fullGropuChat = await Chat.findOne({
            _id: groupChat._id
        }).populate('users', '-password')
            .populate('groupAdmin', '-password')

        res.status(200).json(fullGropuChat)

    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }

})

const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName
        },
        {
            new: true
        }
    ).populate('users', '-password')
        .populate('groupAdmin', '-password')

    if (!updatedChat) {
        res.status(400)
        throw new Error('Chat not found')
    } else {
        res.status(200).json(updatedChat)
    }
})

const addUserToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId }
        },
        {
            new: true
        }
    ).populate("users", "-password")
     .populate("groupAdmin", "-password")
    if (!added) {
        res.status(400)
        throw new Error('Chat not found')
    } else {
        res.status(200).json(added)
    }
})

const removeUserFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    const remove = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId }
        },
        {
            new: true
        }
    ).populate('users','-password')
     .populate('groupAdmin','-password')
    if (!remove) {
        res.status(400)
        throw new Error('Chat not found')
    } else {
        res.status(200).json(remove)
    }
})

module.exports = {
    accessChats, fetchChats,
    createGroupChat, renameGroup, addUserToGroup, removeUserFromGroup
}