import React from 'react'
import "../styles/RegisterStyles.css"
import { Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../redux/features/alertSlice';
import axios from 'axios';
const Login = () => {
    const navigate=useNavigate()
    const dispatch=useDispatch()
    const onfinishHandler =async(values)=>{
        try {
            dispatch(showLoading())
            const res=await axios.post("/api/v1/user/login",values)
            dispatch(hideLoading())
            if(res.data.success){
                localStorage.setItem("token",res.data.token)
                message.success("Login Successfully")
                navigate("/")
            }
            else{
                message.error(res.data.message)
            }
        } catch (error) {
            dispatch(hideLoading())
            console.log(error)
            message.error("Something went wrong")
        }
    }
  return (
    <div className='form-container'>
        <Form
            layout='vertical'
            onFinish={onfinishHandler}
            className='register-form'
        >
            <h1 className='text-center'>Login Form</h1>
            <Form.Item label="Email" name="email" >
                <Input type='email' required/>
            </Form.Item>
            <Form.Item label="Password" name="password" >
                <Input type='password' required/>
            </Form.Item>
            <div className='d-flex justify-content-between'>
                <Link to="/register">Not have an account? Register</Link>
                <button className='btn btn-primary'>Login</button>
            </div>
        </Form>
    </div>

  )
}

export default Login