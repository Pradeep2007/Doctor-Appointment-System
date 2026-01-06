import React from "react";
import Layout from "../components/Layout";
import { Form, Col, Row, Input, TimePicker, Button } from "antd";
import { message } from "antd";
import { useDispatch,useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const ApplyDoctor = () => {
    const navigate=useNavigate();
    const {user}=useSelector((state)=>state.user);
    const dispatch=useDispatch();
 const handleFinish = async (values) => {
  try {
    console.log("Form values:", values);
    console.log("Timings from form:", values.timings);
    
    if (!values.timings || values.timings.length !== 2) {
      message.error("Please select both start and end timings");
      return;
    }

    const formattedTimings = [
      values.timings[0].format("HH:mm"),
      values.timings[1].format("HH:mm"),
    ];

    console.log("Formatted timings:", formattedTimings);

    dispatch(showLoading());

    const res = await axios.post(
      "/api/v1/user/apply-doctor",
      {
        ...values,
        userId: user._id,
        timings: formattedTimings, 
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    dispatch(hideLoading());

    if (res.data.success) {
      message.success("Doctor Application Submitted Successfully");
      console.log("Application response:", res.data);
      navigate("/");
    } else {
      message.error(res.data.message);
    }
  } catch (error) {
    dispatch(hideLoading());
    console.error("Apply doctor error:", error);
    
    if (error.response) {
      console.error("Response error:", error.response.data);
      message.error(error.response.data?.message || "Something went wrong");
    } else {
      message.error("Something went wrong");
    }
  }
};

  return (
    <Layout>
      <h1 className="text-center">Apply Doctor</h1>
      <Form layout="vertical" onFinish={handleFinish}>
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
              Submit
            </Button>
          </Col>
        </Row>
      </Form>
    </Layout>
  );
};

export default ApplyDoctor;
