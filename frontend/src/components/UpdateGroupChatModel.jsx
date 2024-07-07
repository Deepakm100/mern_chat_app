import { ViewIcon } from '@chakra-ui/icons'
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../context/ChatProviderAll'
import UserBadgeItem from './UserBadgeItem'
import axios from 'axios'
import UserListItem from './UserListItem'

function UpdateGroupChatModel({fetchAgain,setFetchAgain,fetchMessage}) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {user,selectedChat,setSelectedChat} = ChatState()
    const [groupChatName,setGroupChatName] = useState('')
    const [search,setSearch] = useState('')
    const [searchResult,setSearchResult] = useState([])
    const [loading,setLoading] = useState(false)
    const [renameLoading,setRenameLoading] = useState(false)
  
    const toast = useToast()

    const handleRemove = async(user1) => {
        if(selectedChat.groupAdmin._id !== user._id && user1._id !==user._id){
            toast({
                title:"Only admin can remove the user",
                status:"error",
                isClosable:true,
                duration:5000,
                position:'bottom' 
             })
             return
        }

        try {
            setLoading(true)

           const config ={
            headers:{
                Authorization:`Bearer ${user.token}`
            }
        }

        const {data} = await axios.put('/api/chat/removeUser',{
            chatId:selectedChat._id,
            userId:user1._id
        },config)

        user._id === user1._id ? setSelectedChat() : setSelectedChat(data)
        setFetchAgain(!fetchAgain)
        fetchMessage()
        setLoading(false)
            
        } catch (error) {
            toast({
                title:"Error Occured!",
                description:error.response.data.message,
                status:"error",
                isClosable:true,
                duration:5000,
                position:'bottom' 
             })
            setLoading(false)
        }
    }
    const handleAddUser = async(user1) => {
        if(selectedChat.users.find((u) => u._id === user1._id)){
            toast({
               title:"User already in the group",
               status:"error",
               isClosable:true,
               duration:5000,
               position:'bottom' 
            })
            return
        }

        if(selectedChat.groupAdmin._id !== user._id){
            toast({
                title:"Only admin can add the user",
                status:"error",
                isClosable:true,
                duration:5000,
                position:'bottom' 
             })
             return
        }

        try {
           setLoading(true)

           const config ={
            headers:{
                Authorization:`Bearer ${user.token}`
            }
        }

        const {data} = await axios.put('/api/chat/addUser',{
            chatId:selectedChat._id,
            userId:user1._id
        },config)
        console.log('adding data',data);
        
        setSelectedChat(data)
        setFetchAgain(!fetchAgain)
        setLoading(false)
        } catch (error) {
            toast({
                title:"Error Occured!",
                description:error.response.data.message,
                status:"error",
                isClosable:true,
                duration:5000,
                position:'bottom' 
             })
            setLoading(false) 
            
        }
    }

    const handleRename = async() => {
        if(!groupChatName) return

        try {
            setRenameLoading(true)

            const config ={
                headers:{
                    Authorization:`Bearer ${user.token}`
                }
            }

            const {data} = await axios.put('/api/chat/rename',{
                chatId:selectedChat._id,
                chatName:groupChatName
            },config)
            
            setSelectedChat(data)
            setFetchAgain(!fetchAgain)
            setRenameLoading(false)


        } catch (error) {
            toast({
              title:'Error Occured !',
              description:error.response.data.message,
              status:'error',
              duration:5000,
              isClosable:true,
              position:"bottom"
            })
            setRenameLoading(false)
        }
        setGroupChatName('')
    }
    const handleSearch =async(query) => {
        if(!query){
          return
        }
        setSearch(query)
        try {
          setLoading(true)
          const config = {
              headers:{
                  Authorization:`Bearer ${user.token}`
              }
          }
         const {data} = await axios.get(`/api/user?search=${search}`,config)
         setLoading(false)
         setSearchResult(data)
        } catch (error) {
          toast({
              title:'Error Occured!',
              description:'Failed to load the users',
              duration:5000,
              isClosable:true,
              status:'error',
              position:'bottom-left'
          })
          setLoading(false)
        }
     }
  return (
    <>
      <IconButton display={'flex'} onClick={onOpen} icon={<ViewIcon />} />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize={'35px'} 
               fontFamily={'sans-serif'}
               display={'flex'}
               justifyContent={'center'}
               >{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <Box w={'100%'} display={'flex'} flexWrap={'wrap'} pb={3}>
          {selectedChat.users.map((u) => (
                            <UserBadgeItem key={u._id} 
                              user={u} handleUser = {() => handleRemove(u)} />
                        ))}
            </Box>            
            <FormControl display={'flex'}>
                <Input  
                  placeholder='Chat Name'
                  mb={3}
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}/>
                  <Button variant={'solid'}
                      colorScheme='teal'
                      ml={1}
                      isLoading={renameLoading}
                      onClick={handleRename}>
                    Update
                  </Button>
            </FormControl>
            <FormControl>
                <Input
                  placeholder='Add users to the group'
                  mb={1}
                  onChange={(e)=> handleSearch(e.target.value)}/>
            </FormControl>
            {loading ? <Spinner size={'lg'}/> :(
                        searchResult?.map((user) => (
                            <UserListItem key={user._id} user={user} 
                               handleUser={()=> handleAddUser(user)} />
                        ))
                    )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='red' mr={3} onClick={()=> handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateGroupChatModel