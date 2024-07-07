import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
function SignUp() {
    const [show,setShow] = useState(false)
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pic, setPic] = useState();
    const [loading,setLoading] = useState(false)
    const toast = useToast()
    const navigate = useNavigate();
    const handleClick = () => {
      setShow(!show)
    }
    const postDetails =(pic) => {
       
        setLoading(true)
        if(pic === undefined){
         toast({
            title:"please select an image",
            duration:5000,
            status:"warning",
            isClosable:true,
            position:"top"
         })
         return;
        }
        if(pic.type === "image/jpeg" || pic.type === "image/png"){
            const data = new FormData();
            data.append('file',pic)
            data.append('upload_preset','chat-web')
            data.append('cloud_name','dgoov1ay9')
            fetch('https://api.cloudinary.com/v1_1/dgoov1ay9/image/upload',{
                method:'post',
                body:data
            }).then((res) => res.json())
              .then((data) => {
                setPic(data.url.toString())
                console.log(data.url.toString());
                setLoading(false)
              })
              .catch((err) => {
                console.log(err);
                setLoading(false)
              })
        }else {
            toast({
                title:"please select an image",
                duration:5000,
                status:"warning",
                isClosable:true,
                position:"top"
             })
             setLoading(false)
             return;
        }
    }
    const handleSubmit = async() => {
        setLoading(true)
        if(!name || !password || !email || !confirmPassword) {
          toast({
            title:"please enter all the given fields",
            duration:5000,
            status:"warning",
            isClosable:true,
            position:"top"
          })
          setLoading(false)
          return
        }

        if(password!==confirmPassword) {
            toast({
              title:"password do not match",
              duration:5000,
              status:"warning",
              isClosable:true,
              position:"top"
            })
            setLoading(false)
            return
          }

          try {
            const config = {
                headers:{
                    "Content-type":"application/json"
                }
            }
            const {data} = await axios.post('/api/user',{name,email,password,pic},config);
            toast({
                title:"Registration successful",
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
                description:error.response.data.message || "Retry after sometime"
            })
            setLoading(false)
          }

    }
    return (
        <VStack spacing='5px'>
            <FormControl id='first-name' isRequired>
                <FormLabel>Name</FormLabel>
                <Input type='text' placeholder='Enter your name'
                    onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input placeholder='Enter your email'
                    onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>password</FormLabel>
                <InputGroup> 
                <Input type={show ? 'text' : 'password'} placeholder='Enter your password'
                    onChange={(e) => setPassword(e.target.value)} />
                <InputRightElement width='4.5rem'>
                    <Button height='1.75rem' size='sm' onClick={handleClick} >
                       {show ? 'Hide' : 'Show'}
                        </Button> 
                </InputRightElement>
                </InputGroup>
                
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>confirm Password</FormLabel>
                <InputGroup> 
                <Input type={show ? 'text' : 'password'} placeholder='Confirm Your Password'
                    onChange={(e) => setConfirmPassword(e.target.value)} />
                <InputRightElement width='4.5rem'>
                    <Button height='1.75rem' size='sm' onClick={handleClick} >
                       {show ? 'Hide' : 'Show'}
                        </Button> 
                </InputRightElement>
                </InputGroup>
                
            </FormControl>
            <FormControl id='pic'>
                <FormLabel>upload your picture</FormLabel>
                <Input 
                  type='file'
                  p={1.5}
                  accept='image/*'
                  onChange={(e) => postDetails(e.target.files[0])} />
            </FormControl>
            <Button
             colorScheme='blue'
             width='100%'
             style={{marginTop:15}}
             onClick={handleSubmit}
             isLoading = {loading}
            >Sign up</Button>
        </VStack>
    )
}

export default SignUp