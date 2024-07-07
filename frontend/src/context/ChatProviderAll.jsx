import {createContext,useContext,useEffect,useState} from 'react'
import { BrowserRouter as Router, useNavigate } from 'react-router-dom'; // Import the Router component

const ChatContext = createContext();

const ChatProviderAll = ({children}) => {
  const [user,setUser] = useState()
  const [selectedChat,setSelectedChat] = useState()
  const [chats,setChats] = useState([])
  const [notification,setNotification] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    setUser(userInfo)
    if(!userInfo){
        navigate('/')
    }
  },[navigate])
  return (
    <ChatContext.Provider value={{user,setUser,selectedChat,setSelectedChat,chats,setChats,notification,setNotification}}>
        {children}
    </ChatContext.Provider>
  )
}

export const ChatState = () => {
    return useContext(ChatContext)
}

export default ChatProviderAll