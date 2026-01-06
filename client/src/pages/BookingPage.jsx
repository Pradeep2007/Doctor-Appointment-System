import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useParams } from "react-router-dom";
import axios from "axios";
import { DatePicker, message, Select, Card, Row, Col, Button } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";

const { Option } = Select;

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
  const params = useParams();
  const dispatch = useDispatch();
  
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [canBook, setCanBook] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getDoctorInfo = async () => {
      try {
        const res = await axios.post(
          "/api/v1/doctor/getDoctorById",
          { doctorId: params.doctorId },
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        if (res.data.success) {
          setDoctor(res.data.data);
          createTimeSlots(res.data.data.timings);
        }
      } catch (error) {
        console.error(error);
        message.error("Failed to load doctor information");
      }
    };
    getDoctorInfo();
  }, [params.doctorId]);

  const createTimeSlots = (timings) => {
    if (!timings || timings.length < 2) return;
    
    const slots = [];
    const startTime = moment(timings[0], "HH:mm");
    const endTime = moment(timings[1], "HH:mm");
    
    let current = moment(startTime);
    while (current <= endTime) {
      slots.push(current.format("HH:mm"));
      current.add(30, 'minutes');
    }
    
    setTimeSlots(slots);
  };

  const onDateChange = (dateValue) => {
    if (dateValue) {
      const formatted = moment(dateValue).format("DD-MM-YYYY");
      setDate(formatted);
      console.log("Date set to:", formatted);
    } else {
      setDate("");
    }
    setTime("");
    setCanBook(false);
    setMessageText("");
  };

  const onTimeChange = (timeValue) => {
    setTime(timeValue);
    console.log("Time set to:", timeValue);
    setCanBook(false);
    setMessageText("");
  };

  const checkAvailability = async () => {
    if (!date) {
      message.error("Please select a date");
      return;
    }
    if (!time) {
      message.error("Please select a time");
      return;
    }

    console.log("Checking availability...");
    console.log("Doctor ID:", params.doctorId);
    console.log("Date:", date);
    console.log("Time:", time);

    try {
      setIsLoading(true);
      const response = await axios.post(
        "/api/v1/user/booking-availability",
        {
          doctorId: params.doctorId,
          date: date,
          time: time
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Backend response:", response.data);

      if (response.data.success === true) {
        setCanBook(true);
        setMessageText(response.data.message || "Slot is available!");
        message.success("Slot is available! You can book now.");
      } else {
        setCanBook(false);
        setMessageText(response.data.message || "Slot not available");
        message.error(response.data.message || "Slot not available");
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setCanBook(false);
      setMessageText("Error checking availability");
      message.error("Error checking availability");
    } finally {
      setIsLoading(false);
    }
  };

  const bookAppointment = async () => {
    if (!canBook) {
      message.error("Please check availability first");
      return;
    }

    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/v1/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctor,
          userInfo: user,
          date: date,
          time: time,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());

      if (response.data.success) {
        message.success("Appointment booked successfully!");
        setDate("");
        setTime("");
        setCanBook(false);
        setMessageText("");
        
        setTimeout(() => {
          window.location.href = "/appointments";
        }, 1500);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Booking error:", error);
      message.error("Failed to book appointment");
    }
  };

  const forceEnableBooking = () => {
    console.log("Force enabling booking...");
    setCanBook(true);
    setMessageText("✅ DEBUG: Booking enabled");
    message.success("Debug: Booking enabled");
  };

  return (
    <Layout>
      <div className="container" style={{ maxWidth: "1200px", marginTop: "30px" }}>
        <h1 className="text-center mb-4">Book Appointment</h1>
        
        {doctor ? (
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card 
                title={<span style={{ fontSize: "18px", fontWeight: "bold" }}>Doctor Information</span>}
                style={{ height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              >
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <h3 style={{ color: "#1890ff" }}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p style={{ color: "#666" }}>{doctor.specialization}</p>
                </div>
                
                <div style={{ lineHeight: "2" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold", color: "#555" }}>Experience:</span>
                    <span>{doctor.experience}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold", color: "#555" }}>Consultation Fee:</span>
                    <span style={{ color: "#1890ff", fontWeight: "bold" }}>₹{doctor.feesPerConsultation}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold", color: "#555" }}>Working Hours:</span>
                    <span style={{ color: "#52c41a", fontWeight: "bold" }}>
                      {doctor.timings[0]} - {doctor.timings[1]}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold", color: "#555" }}>Phone:</span>
                    <span>{doctor.phone}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold", color: "#555" }}>Email:</span>
                    <span>{doctor.email}</span>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card 
                title={<span style={{ fontSize: "18px", fontWeight: "bold" }}>Book Your Appointment</span>}
                style={{ height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              >
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", fontSize: "16px" }}>
                    1. Select Date *
                  </label>
                  <DatePicker
                    style={{ width: "100%", height: "40px" }}
                    format="DD-MM-YYYY"
                    value={date ? moment(date, "DD-MM-YYYY") : null}
                    onChange={onDateChange}
                    disabledDate={(current) => current && current < moment().startOf('day')}
                    placeholder="Click to select date"
                  />
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                    Select a future date for your appointment
                  </div>
                </div>

                {date && (
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px", fontSize: "16px" }}>
                      2. Select Time *
                    </label>
                    <Select
                      style={{ width: "100%", height: "40px" }}
                      placeholder="Select time slot"
                      value={time || undefined}
                      onChange={onTimeChange}
                      disabled={!date}
                    >
                      {timeSlots.map((slot, index) => (
                        <Option key={index} value={slot}>
                          {slot}
                        </Option>
                      ))}
                    </Select>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                      Available: {doctor.timings[0]} to {doctor.timings[1]} (30-min slots)
                    </div>
                  </div>
                )}

                {messageText && (
                  <div style={{
                    marginBottom: "20px",
                    padding: "12px",
                    borderRadius: "6px",
                    backgroundColor: canBook ? "#f6ffed" : "#fff2f0",
                    border: canBook ? "1px solid #b7eb8f" : "1px solid #ffccc7",
                    color: canBook ? "#52c41a" : "#ff4d4f"
                  }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: "18px", marginRight: "8px" }}>
                        {canBook ? "✅" : "❌"}
                      </span>
                      <span style={{ fontWeight: "bold" }}>{messageText}</span>
                    </div>
                  </div>
                )}

                <div style={{
                  marginBottom: "20px",
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #e9ecef",
                  fontSize: "14px"
                }}>
                  <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#666" }}>Current Status:</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>Date Selected:</span>
                    <span style={{ fontWeight: "bold", color: date ? "#1890ff" : "#ff4d4f" }}>
                      {date ? date : "No"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span>Time Selected:</span>
                    <span style={{ fontWeight: "bold", color: time ? "#1890ff" : "#ff4d4f" }}>
                      {time ? time : "No"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Can Book Now:</span>
                    <span style={{ 
                      fontWeight: "bold", 
                      color: canBook ? "#52c41a" : "#ff4d4f",
                      fontSize: "16px"
                    }}>
                      {canBook ? "YES ✅" : "NO ❌"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={checkAvailability}
                    disabled={!date || !time || isLoading}
                    style={{
                      height: "48px",
                      fontSize: "16px",
                      fontWeight: "bold"
                    }}
                    loading={isLoading}
                  >
                    {isLoading ? "Checking..." : "Check Availability"}
                  </Button>

                  <Button
                    type={canBook ? "primary" : "default"}
                    size="large"
                    onClick={bookAppointment}
                    disabled={!canBook}
                    style={{
                      height: "48px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      backgroundColor: canBook ? "#52c41a" : undefined,
                      borderColor: canBook ? "#52c41a" : undefined,
                      color: canBook ? "white" : undefined,
                      opacity: canBook ? 1 : 0.7
                    }}
                  >
                    {canBook ? "📅 Book Appointment Now" : "Please Check Availability First"}
                  </Button>
                </div>

                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <Button
                    type="dashed"
                    size="small"
                    onClick={forceEnableBooking}
                    style={{ fontSize: "12px" }}
                  >
                    Debug: Force Enable Booking
                  </Button>
                </div>

                <div style={{
                  marginTop: "24px",
                  padding: "16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #e9ecef"
                }}>
                  <h6 style={{ marginBottom: "12px", color: "#333" }}>📝 How to Book:</h6>
                  <ol style={{ margin: 0, paddingLeft: "20px", color: "#666" }}>
                    <li style={{ marginBottom: "8px" }}><strong>Select a date</strong> from the calendar</li>
                    <li style={{ marginBottom: "8px" }}><strong>Choose a time</strong> from the dropdown</li>
                    <li style={{ marginBottom: "8px" }}><strong>Click "Check Availability"</strong> to verify</li>
                    <li style={{ marginBottom: "8px" }}>If available, <strong>"Book Appointment Now"</strong> button turns green</li>
                    <li><strong>Click it</strong> to confirm your booking</li>
                  </ol>
                </div>
              </Card>
            </Col>
          </Row>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ marginTop: "20px", color: "#666" }}>Loading doctor information...</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookingPage;