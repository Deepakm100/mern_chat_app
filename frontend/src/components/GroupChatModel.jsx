import { Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast,Box } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../context/ChatProviderAll'
import axios from 'axios'
import UserListItem from './UserListItem'
import UserBadgeItem from './UserBadgeItem'

function GroupChatModel({children}) {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast()
    const {user,chats,setChats} = ChatState()
    const [search,setSearch] = useState("")
    const [searchResult,setSearchResult] = useState([])
    const [loading,setLoading] = useState(false)
    const [groupChatName,setGroupChatName] = useState()
    const [selectedUsers,setSelectedUsers] = useState([])

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
       console.log(data);
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
   const handleGroup =(user) => {
    if(selectedUsers.includes(user)){
        toast({
            title:"User already selected",
            status:"warning",
            duration:5000,
            isClosable:true,
            position:'bottom-left'
        })
        return
    }
    setSelectedUsers([...selectedUsers,user])

   }
   const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) =>sel._id !== delUser._id))
   }

   const handleSubmit =async() => {
    console.log(groupChatName);
     if(!groupChatName || !selectedUsers){
      toast({
        title:'Please fill up all the fileds',
        status:'warning',
        duration:5000,
        isClosable:true,
        position:'top'
      })
      return
     }

     try {
      const config = {
        headers:{
            Authorization:`Bearer ${user.token}`
        }
    }

    const {data} = await axios.post('/api/chat/group',{
      name:groupChatName,
      users: selectedUsers.map((u) => u._id)
      },config)
     setChats([data,...chats])
      onClose()
      toast({
        title:'New Group Chat Created',
        status:'success',
        duration:5000,
        isClosable:true,
        position:'bottom'
      })      
     } catch (error) {
      toast({
        title:'Failed to create a group chat',
        description:error.response.data,
        status:'error',
        duration:5000,
        isClosable:true,
        position:'bottom'
      }) 
     }

   }
   

    return (
        <>
          <span onClick={onOpen}>{children}</span>
    
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader
               fontSize={'35px'}
               fontFamily={'serif'}
               display={'flex'}
               justifyContent={'center'}>Create Group Chat</ModalHeader>
              <ModalCloseButton />
              <ModalBody display={'flex'}
                flexDir={'column'} alignItems={'center'}>
                    <FormControl>
                        <Input placeholder='Chat Name' mb={3}  
                        onChange={(e) => setGroupChatName(e.target.value) }/>
                    </FormControl>
                    <FormControl>
                        <Input placeholder='Add users'
                          mb={1}
                          onChange={(e) => handleSearch(e.target.value)}/>
                    </FormControl>
                    {/* rendering selected user */}
                    <Box w={'100%'} display={'flex'} flexWrap={'wrap'}>
                        {selectedUsers.map((u) => (
                            <UserBadgeItem key={u._id} 
                              user={u} handleUser = {() => handleDelete(u)} />
                        ))}
                    </Box>
                    {/* search result */}
                    {loading ? <div>loading</div> :(
                        searchResult?.slice(0,4).map((user) => (
                            <UserListItem key={user._id} user={user} 
                               handleUser={()=> handleGroup(user)} />
                        ))
                    )}
              </ModalBody>
    
              <ModalFooter>
                <Button colorScheme='blue'  onClick={handleSubmit}>
                  Create Chat
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
}

export default GroupChatModel