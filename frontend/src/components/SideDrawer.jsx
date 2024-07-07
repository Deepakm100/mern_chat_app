import { Box, Button, Tooltip, Text, Menu, MenuButton, Avatar, MenuList, MenuItem, MenuDivider, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast, Spinner } from '@chakra-ui/react'
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import React, { useState } from 'react'
import { ChatState } from '../context/ChatProviderAll'
import ProfileModel from './ProfileModel'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ChatLoading from './ChatLoading'
import UserListItem from './UserListItem'
import { getSender } from '../config/ChatLogic'
import Badge from 'react-bootstrap/Badge';

function SideDrawer() {
  const [search, setSearch] = useState("")
  const [searchResult, setSearchResult] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)

  const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure()

  const navigate = useNavigate()
  const toast = useToast()

  const logoutHandler = () => {
    localStorage.removeItem('userInfo')
    navigate('/')
  }
  const handleSearch = async () => {
    if (!search) {
      toast({
        title: 'Please enter something in search',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-left'
      })
      return
    }
    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }
      const { data } = await axios.get(`/api/user?search=${search}`, config)
      setLoading(false)
      setSearchResult(data)
    } catch (error) {
      toast({
        title: 'Error Occured!',
        description: 'Failed to load the search results',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left'
      })
    }
  }
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true)
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      }
      const { data } = await axios.post('/api/chat', { userId }, config)
      // if chat is aready present we gonna append it
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats])
      setSelectedChat(data)
      setLoading(false)
      onClose()

    } catch (error) {
      toast({
        title: 'Error Occured!',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left'
      })
    }
  }


  return (
    <>
      <Box display='flex'
        justifyContent='space-between'
        alignItems='center'
        bg='white'
        w='100%'
        p="5px 10px 5px 10px"
        borderWidth='5px'
      >
        <Tooltip label="search for user" hasArrow placement='bottom-end'>
          <Button variant='ghost' onClick={onOpen}>
            <i class="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: 'none', md: 'flex' }} px='4px'>
              search
            </Text>
          </Button>
        </Tooltip>
        <Text fontFamily='sans-serif' fontSize='2xl'> TAlk-A-Tive </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <Badge pill bg="primary">
                {notification.length}
              </Badge>
              <BellIcon fontSize='2xl' m={1} />
            </MenuButton>
            <MenuList>
              {!notification.length && 'No new Messages'}
              {notification.map((notif) => (
                <MenuItem key={notif._id} onClick={() => {
                  setSelectedChat(notif.chat)
                  setNotification(notification.filter((n) => n !== notif))
                }}>
                  {notif.chat.isGroupChat ? `Message in  ${notif.chat.chatName}` :
                    `New message from ${getSender(user, notif.chat.users)} `}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size='sm'
                cursor='pointer'
                name={user.name}
                src={user.pic} />
            </MenuButton>
            <MenuList>
              <ProfileModel user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModel>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth='1px'>Search Users</DrawerHeader>
          <DrawerBody>
            <Box display='flex' pb={2}>
              <Input
                placeholder='serach by name or email'
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)} />
              <Button onClick={handleSearch}>
                Go
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleUser={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml={'auto'} display={'flex'} />}
          </DrawerBody>
        </DrawerContent>

      </Drawer>

    </>
  )
}

export default SideDrawer