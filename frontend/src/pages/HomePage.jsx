import React from 'react'
import {Container,Box,Text} from '@chakra-ui/react' 
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import Login from '../components/Authentication/Login'
import SignUp from '../components/Authentication/SignUp'

function HomePage() {
  return (
    <Container maxW='xl' centerContent>
      <Box  display='flex' justifyContent='center' p={3} bg={'white'} w='100%'
            margin="40px 0 15px 0" borderRadius='lg' borderWidth='1px'>
        <Text fontSize='4xl' fontFamily='Work sans'>Chat-Web</Text>
      </Box>
      <Box bg='white' p={4} w='100%' borderRadius='lg' borderWidth='1px' >
      <Tabs variant='enclosed'>
  <TabList mb='1em'>
    <Tab width='50%'>Login</Tab>
    <Tab width='50%'>SignUp</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>
      <Login></Login>
    </TabPanel>
    <TabPanel>
      <SignUp></SignUp>
    </TabPanel>
  </TabPanels>
</Tabs>
      </Box>
    </Container>
  )
}

export default HomePage