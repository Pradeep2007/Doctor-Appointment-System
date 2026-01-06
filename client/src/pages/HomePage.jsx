import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Row, Col, Card, Button, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import DoctorList from '../components/DoctorList';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const { user, isDoctor, isAdmin } = useSelector((state) => state.user);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getUserData = async () => {
    try {
      setLoading(true);
      
      if (isDoctor) {
        const res = await axios.post(
          '/api/v1/doctor/getDoctorInfo',
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.data.success) {
          setDoctors([res.data.data]);
        }
      } else {
        const res = await axios.get('/api/v1/user/getAllDoctors', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.data.success) {
          let filteredDoctors = res.data.data;
          if (!isAdmin) {
            filteredDoctors = res.data.data.filter(
              (doctor) => doctor.status === 'approved'
            );
          }
          setDoctors(filteredDoctors);
        }
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, [isDoctor, isAdmin]);

  const renderDoctorDashboard = () => {
    const doctor = doctors[0];
    
    return (
      <div className="container">
        <h2 className="text-center mb-4">Welcome, Dr. {doctor?.firstName}!</h2>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card 
              title="My Profile" 
              className="shadow"
              extra={
                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => navigate('/doctor/profile/:id')}
                >
                  Edit Profile
                </Button>
              }
            >
              {doctor && (
                <div>
                  <div className="text-center mb-4">
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      backgroundColor: '#1890ff',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '36px',
                      margin: '0 auto 15px'
                    }}>
                      {doctor.firstName?.charAt(0)}{doctor.lastName?.charAt(0)}
                    </div>
                    <h4 className="text-primary">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h4>
                    <p className="text-muted">{doctor.specialization}</p>
                  </div>
                  
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <strong>Experience:</strong>
                      <p>{doctor.experience}</p>
                    </Col>
                    <Col span={12}>
                      <strong>Consultation Fee:</strong>
                      <p className="text-success fw-bold">₹{doctor.feesPerConsultation}</p>
                    </Col>
                    <Col span={12}>
                      <strong>Available Timings:</strong>
                      <p>{doctor.timings?.[0]} - {doctor.timings?.[1]}</p>
                    </Col>
                    <Col span={12}>
                      <strong>Status:</strong>
                      <p>
                        <span className={`badge ${doctor.status === 'approved' ? 'bg-success' : doctor.status === 'pending' ? 'bg-warning' : 'bg-danger'}`}>
                          {doctor.status}
                        </span>
                      </p>
                    </Col>
                    <Col span={24}>
                      <strong>Contact:</strong>
                      <p>{doctor.phone} | {doctor.email}</p>
                    </Col>
                    <Col span={24}>
                      <strong>Address:</strong>
                      <p>{doctor.address}</p>
                    </Col>
                  </Row>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Quick Actions" className="shadow">
              <div className="d-grid gap-3 mb-4">
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => navigate('/doctor-appointments')}
                >
                  📅 View Appointments
                </Button>
                
                <Button 
                  type="default" 
                  size="large"
                  onClick={() => navigate('/doctor/profile/:id')}
                >
                  ✏️ Update Profile
                </Button>
                
                {doctor?.status === 'approved' && (
                  <Button 
                    type="default" 
                    size="large"
                    onClick={() => message.info('Schedule feature coming soon')}
                  >
                    🗓️ Manage Schedule
                  </Button>
                )}
              </div>

              <Card size="small" title="Appointment Statistics">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="text-center p-2">
                      <h3 className="text-primary mb-1">0</h3>
                      <small className="text-muted">Today</small>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="text-center p-2">
                      <h3 className="text-success mb-1">0</h3>
                      <small className="text-muted">This Week</small>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="text-center p-2">
                      <h3 className="text-warning mb-1">0</h3>
                      <small className="text-muted">Pending</small>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="text-center p-2">
                      <h3 className="text-info mb-1">0</h3>
                      <small className="text-muted">Total</small>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderUserHomePage = () => (
    <div className="container">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3">Find & Book Your Doctor</h1>
        <p className="lead text-muted mb-4">
          Connect with verified healthcare professionals for your medical needs
        </p>
        {doctors.length > 0 && (
          <p className="text-success">
            <i className="fas fa-check-circle me-2"></i>
            {doctors.length} doctors available for consultation
          </p>
        )}
      </div>

      {doctors.length === 0 && !loading ? (
        <div className="text-center py-5">
          <div className="display-1 text-muted mb-3">🏥</div>
          <h3 className="text-muted">No Doctors Available</h3>
          <p className="text-muted mb-4">Please check back later for available doctors.</p>
          <Button 
            type="primary" 
            size="large"
            onClick={getUserData}
          >
            Refresh
          </Button>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Available Doctors</h3>
            <span className="badge bg-primary">{doctors.length} doctors</span>
          </div>
          
          <Row gutter={[24, 24]}>
            {doctors.map((doctor) => (
              <Col key={doctor._id} xs={24} sm={12} lg={8} xl={6}>
                <DoctorList doctor={doctor} />
              </Col>
            ))}
          </Row>
        </>
      )}

      <div className="mt-5 pt-4">
        <Card 
          title={<h4 className="mb-0">Why Choose Our Platform</h4>}
          className="border-0 shadow-sm"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div className="text-center p-3">
                <div className="display-4 text-primary mb-3">👨‍⚕️</div>
                <h5>Verified Doctors</h5>
                <p className="text-muted">All doctors are verified and licensed professionals</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center p-3">
                <div className="display-4 text-primary mb-3">⏰</div>
                <h5>Flexible Timings</h5>
                <p className="text-muted">Book appointments at your convenience</p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center p-3">
                <div className="display-4 text-primary mb-3">💰</div>
                <h5>Transparent Pricing</h5>
                <p className="text-muted">No hidden charges, clear consultation fees</p>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5">
          <Spin size="large" />
          <p className="mt-3">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {isDoctor ? renderDoctorDashboard() : renderUserHomePage()}
    </Layout>
  );
};

export default HomePage;