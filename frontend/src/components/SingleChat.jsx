import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/ChatProviderAll'
import { Box ,FormControl,IconButton,Input,Spinner,Text, useToast} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { getSender, getSenderDetails } from '../config/ChatLogic'
import ProfileModel from './ProfileModel'
import UpdateGroupChatModel from './UpdateGroupChatModel'
import axios from 'axios'
// import './style.css'
import ScrollableChat from './ScrollableChat'
import Lottie from 'react-lottie'
import animationData from '../animation/typing.json'
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000'
let selectedChatCompare,socket;
function SingleChat({fetchAgain,setFetchAgain}) {
  const {user,selectedChat,setSelectedChat,notification,setNotification} = ChatState()
 
  const [messages,setMessages] = useState([])
  const [loading,setLoading] = useState(false)
  const [newMessage,setNewMessage] = useState('')
  const [socketConnected,setSocketConnected] = useState(false)
  const [typing,setTyping] = useState(false)
  const [isTyping,setIsTyping] = useState(false)
  const toast = useToast()
  const defaultOption = {
    loop:true,
    autoplay:true,
    animationData:animationData,
    renderSettings:{
      preserveAspectRation:'xMidYMid slice'
    }
  }

  useEffect(()=>{
    socket = io(ENDPOINT)
   socket.emit('setup',user)
   socket.on('connected',()=>{
    setSocketConnected(true)
   })
   socket.on('typing',() => setIsTyping(true))
   socket.on('stop typing',() => setIsTyping(false))

  },[])

  const sendMessage = async(event) => {
    if(event.key === 'Enter' &&  newMessage){
      socket.emit('stop typing',selectedChat._id)
      try {
        const config = {
          headers:{
            'Content-Type':'application/json',
            Authorization:`Bearer ${user.token}`
          }
        }
          setNewMessage("")
        const {data} = await axios.post('/api/message',{
          content:newMessage,
          chatId:selectedChat._id
        },config)
        socket.emit('new message',data)
        setMessages([...messages,data])
      } catch (error) {
        toast({
          title:'Error Occured',
          description:'Failed to send the messages',
          status:"error",
          position:'bottom',
          isClosable:true
        })
      }
    }

  }
  const typingHandler = (e) => {
    setNewMessage(e.target.value)
    if(!socketConnected) return

    if(!typing){
      setTyping(true)
      socket.emit('typing',selectedChat._id)
    }
    let lastTypingTime = new Date().getTime()
    let timeLength = 3000
    setTimeout(() => {
      let newTypingTime = new Date().getTime()
      let diff = newTypingTime - lastTypingTime
      if(diff >= timeLength && typing){
        socket.emit('stop typing',selectedChat._id)
        setTyping(false)
      }
      
    }, timeLength);
  }
  // Fetching all the messages 
  const fetchMessage = async() => {
      if(!selectedChat) return
       try {
         setLoading(true)
        const config = {
          headers:{
            Authorization:`Bearer ${user.token}`
          }
        }
        const {data} = await axios.get(`/api/message/${selectedChat._id}`,config)
        setMessages(data)
        setLoading(false)
        socket.emit('join chat',selectedChat._id)
        
       } catch (error) {
        toast({
          title:'Error Occured',
          description:'Failed to send the messages',
          status:"error",
          position:'bottom',
          isClosable:true
        })
        
       }
  }

  useEffect(() => {
    fetchMessage()
    selectedChatCompare = selectedChat
  },[selectedChat])

  useEffect(()=>{
    socket.on('message received',(newMessage)=>{
      if(!selectedChatCompare || selectedChatCompare._id !== newMessage.chat._id){
        if(!notification.includes(newMessage)){
          setNotification([newMessage,...notification])
          setFetchAgain(!fetchAgain)
        }
      }else {
        console.log('frontend message',newMessage);
        setMessages([...messages,newMessage])
      }
    })
  })

  return (
    <>
     {selectedChat ? (
        <>
        <Text fontSize={{base:'28px',md:'30px'}}
              pb={3}
              px={2}
              w={'100%'}
              fontFamily={'sans-serif'}
              display={'flex'}
              justifyContent={{base:'space-between'}}
              alignItems={'center'}>
            <IconButton
              display={{base:'flex',md:'none'}} 
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
              />
              {
                !selectedChat.isGroup ? (
                  <>
                  {getSender(user,selectedChat.users)}
                  <ProfileModel user={getSenderDetails(user,selectedChat.users)} />
                  </>
                ) : (
                    <>
                    {selectedChat.chatName.toUpperCase()}
                    <UpdateGroupChatModel
                      fetchAgain={fetchAgain}
                      setFetchAgain={setFetchAgain}
                      fetchMessage={fetchMessage}/>
                    </>
                )
              }
              
        </Text>
        <Box display={'flex'}
             flexDir={'column'}
             justifyContent={'flex-end'}
             p={3}
             bg={'#E8E8E8'}
             w={'100%'}
             h={'100%'}
             borderRadius={'lg'}
             overflowY={'hidden'}>
            {loading ?(
              <Spinner alignItems={'center'} m={'auto'} size={'xl'} w={20} h={20}/>
            ) : (
              <div className='message'>
                <ScrollableChat messages={messages}/>
              </div>
            )}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? <div>
                <Lottie options={defaultOption}
                  width={70}
                  style={{marginBottom:15,marginLeft:0}}/>
              </div> : <></>}
              <Input 
                onChange={typingHandler}
                value={newMessage}
                variant={'filled'}
                bg={'#E0E0E0'}
                placeholder='Enter a Message'/>
            </FormControl>
        </Box>
        </>
     ): (
        <Box display={'flex'} justifyContent={'center'} alignItems={'center'} h={'100%'}>
            <Text fontSize={'3xl'} pb={3} fontFamily={'sans-serif'}>
                Click on a user to start the Chat
            </Text>
        </Box>
     )}
    </>
  )
}

export default SingleChat