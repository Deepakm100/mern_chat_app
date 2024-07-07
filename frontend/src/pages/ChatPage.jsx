import { Box, Flex } from "@chakra-ui/react"
import { ChatState } from "../context/ChatProviderAll"
import SideDrawer from "../components/SideDrawer"
import MyChats from "../components/MyChats"
import ChatBox from "../components/ChatBox"
import { useState } from "react"

function ChatPage() {
  const { user } = ChatState()
  const[fetchAgain,setFetchAgain] = useState(false)

  return (
    <div style={{ width: '100%' }}>
      {user && <SideDrawer />}
      <Box display="flex" justifyContent="space-between" width="100%" height="91.2vh" p="10px">
        {user && <MyChats fetchAgain= {fetchAgain} />}
        {user && <ChatBox fetchAgain= {fetchAgain} setFetchAgain={setFetchAgain} />}
      </Box>
    </div>
  )
}

export default ChatPage