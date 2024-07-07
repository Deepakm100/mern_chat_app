import { CloseIcon } from '@chakra-ui/icons'
import { Box } from '@chakra-ui/react'
import React from 'react'

function UserBadgeItem({user,handleUser}) {

  return (
   <Box px={2} py={1}
        borderRadius={'lg'}
        m={1}
        mb={2}
        variant="solid"
        fontSize={12}
        color="white"
        background={'purple'}
        cursor={'pointer'}
        onClick={handleUser}>
            {user.name}
            <CloseIcon pl={1}/>
        </Box>
  )
}

export default UserBadgeItem