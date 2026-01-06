import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Form, Col, Row, Input, TimePicker, Button } from "antd";
import { message } from "antd";
import { showLoading, hideLoading } from "../../redux/features/alertSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import axios from "axios";
import moment from 'moment';
const Profile = () => {
  const {user}=useSelector((state)=>state.user)
  const [doctor,setDoctor]=useState(null)
  const params=useParams()
  const navigate=useNavigate();
  const dispatch=useDispatch();
  const handleFinish = async(values) => {
          try {
              dispatch(showLoading())
              const res=await axios.post('/api/v1/doctor/updateProfile',{...values,userId:user._id,
                timings:[
                  moment(values.timings[0]).format("HH:mm"),
                  moment(values.timings[1]).format("HH:mm")
                ]
              },{
                  headers:{
                      Authorization:`Bearer ${localStorage.getItem('token')}`
                  }
              })
              dispatch(hideLoading())
              if(res.data.success){
                  message.success(res.data.message)
                  navigate('/')
              }
              else{
                  message.error(res.data.message)
              }
          } catch (error) {
              dispatch(hideLoading())
              console.log(error)
              message.error("Something went wrong")
          }
    };
  

  useEffect(()=>{
    // Define the function inside useEffect
    const getDoctorInfo=async()=>{
      try {
        const res=await axios.post('/api/v1/doctor/getDoctorInfo',{userId:params.id},
          {
            headers:{
              Authorization:`Bearer ${localStorage.getItem('token')}`
            }
          }
        )
        if(res.data.success){
          setDoctor(res.data.data)
        }
      } catch (error) {
        console.log(error)
      }
    }
    
    getDoctorInfo()
    //eslint-disable-next-line
  },[])

  return (
    <Layout>
      <h1>Doctor Profile Page</h1>
      {doctor && (
        <Form layout="vertical" 
        onFinish={handleFinish}
        initialValues={{
          ...doctor,
          timings:[moment(doctor.timings[0],"HH:mm"),moment(doctor.timings[1],"HH:mm")]
        }} 
        >
        <h2>Personal Details</h2>

        <Row gutter={[20, 20]}>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter Your First Name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter Your Last Name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Phone No"
              name="phone"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter Your Phone Number" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter Your Email" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Website" name="website">
              <Input placeholder="Enter Your Website" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter Your Address" />
            </Form.Item>
          </Col>
        </Row>

        <h2>Professional Details</h2>

        <Row gutter={[20, 20]}>
          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Specialization"
              name="specialization"
              rules={[{ required: true }]}
            >
              <Input placeholder="Your Specialization" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Experience"
              name="experience"
              rules={[{ required: true }]}
            >
              <Input placeholder="Your Experience" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Fee Per Consultation"
              name="feesPerConsultation"
              rules={[{ required: true }]}
            >
              <Input placeholder="Your Consultation Fee" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item
              label="Timings"
              name="timings"
              rules={[{ required: true }]}
            >
              <TimePicker.RangePicker
                format="HH:mm"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="center" style={{ marginTop: 20 }}>
          <Col>
            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </Col>
        </Row>
      </Form>
      )}
    </Layout>
  )
}

export default Profile