import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack ,useToast} from '@chakra-ui/react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {
    const [show,setShow] = useState(false)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading,setLoading] = useState(false)
    const toast = useToast();
    const navigate = useNavigate()

    const handleClick = () => {
      setShow(!show)
    }
   
    const handleSubmit = async () => {
        setLoading(true)
      if(!email || !password){
        toast({
         title:"Please fill the fields",
         duration:5000,
         isClosable:true,
         status:"warning",
         position:"top"
        })
        setLoading(false)
        return
      }
      try {
        const config ={
            headers:{
                "Content-type":"application/json"
            }
        }
        const {data} = await axios.post('/api/user/login',{email,password},config);
        toast({
            title:"login successful",
            duration:5000,
            status:"success",
            isClosable:true,
            position:"top"
          })
          localStorage.setItem('userInfo',JSON.stringify(data))
          setLoading(false)
          navigate('/chats')
      } catch (error) {
        toast({
            position:"top",
            duration:5000,
            isClosable:true,
            title:"Error Occured!",
            description:error.response.data.message
        })
        setLoading(false)
      }
    }
    return (
        <VStack spacing='5px'>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input placeholder='Enter your email' value={email}
                    onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>password</FormLabel>
                <InputGroup> 
                <Input type={show ? 'text' : 'password'} placeholder='Enter your password' value={password}
                    onChange={(e) => setPassword(e.target.value)} />
                <InputRightElement width='4.5rem'>
                    <Button height='1.75rem' size='sm' onClick={handleClick} >
                       {show ? 'Hide' : 'Show'}
                        </Button> 
                </InputRightElement>
                </InputGroup>
                
            </FormControl>
            
            <Button
             colorScheme='blue'
             width='100%'
             style={{marginTop:15}}
             isLoading={loading}
             onClick={handleSubmit}
            >Login</Button>
        </VStack>
    )
}

export default Login