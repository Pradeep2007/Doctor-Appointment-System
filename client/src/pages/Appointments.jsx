import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import moment from "moment";
import { Table, Spin, Alert } from "antd";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get("/api/v1/user/user-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (res.data.success) {
        setAppointments(res.data.data);
      } else {
        setError("Failed to fetch appointments");
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []); 
  useEffect(() => {
    getAppointments();
  }, [getAppointments]); 

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Doctor Info",
      key: "doctorInfo",
      render: (_, record) => {
        let doctorInfo = "";
        try {
          if (typeof record.doctorInfo === 'string') {
            const parsed = JSON.parse(record.doctorInfo);
            doctorInfo = parsed.firstName + " " + parsed.lastName;
          } else if (record.doctorInfo && record.doctorInfo.firstName) {
            doctorInfo = record.doctorInfo.firstName + " " + record.doctorInfo.lastName;
          }
        } catch (error) {
          doctorInfo = "N/A";
          console.log(error);
        }
        return <span>{doctorInfo}</span>;
      },
    },
    {
      title: "Date & Time",
      key: "datetime",
      render: (_, record) => (
        <span>
          {moment(record.date, "DD-MM-YYYY").format("MMM DD, YYYY")} &nbsp;
          at {record.time}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let className = "";
        let text = status;
        
        switch (status) {
          case "approved":
            className = "text-success fw-bold";
            text = "Confirmed";
            break;
          case "pending":
            className = "text-warning fw-bold";
            text = "Pending";
            break;
          case "rejected":
            className = "text-danger fw-bold";
            text = "Cancelled";
            break;
          default:
            className = "text-muted";
        }
        
        return <span className={className}>{text}</span>;
      },
    },
    {
      title: "Created At",
      key: "createdAt",
      render: (_, record) => (
        <span>{moment(record.createdAt).format("MMM DD, YYYY HH:mm")}</span>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="text-center mt-5">
          <Spin size="large" />
          <p className="mt-3">Loading appointments...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mt-4">
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
          <div className="text-center mt-4">
            <button 
              className="btn btn-primary"
              onClick={getAppointments}
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>My Appointments</h1>
          <button 
            className="btn btn-outline-primary"
            onClick={getAppointments}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        
        {appointments.length === 0 ? (
          <div className="text-center py-5">
            <div className="display-1 text-muted mb-3">📅</div>
            <h3 className="text-muted">No Appointments Found</h3>
            <p className="text-muted">You haven't booked any appointments yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table 
              columns={columns} 
              dataSource={appointments.map(app => ({
                ...app,
                key: app._id
              }))}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} appointments`,
              }}
              scroll={{ x: 800 }}
              bordered
              rowClassName={(record) => {
                switch (record.status) {
                  case "approved":
                    return "table-success";
                  case "pending":
                    return "table-warning";
                  case "rejected":
                    return "table-danger";
                  default:
                    return "";
                }
              }}
            />
          </div>
        )}
        
        {appointments.length > 0 && (
          <div className="row mt-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">Total</h5>
                  <h2>{appointments.length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">Confirmed</h5>
                  <h2>{appointments.filter(a => a.status === "approved").length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">Pending</h5>
                  <h2>{appointments.filter(a => a.status === "pending").length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-danger text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">Cancelled</h5>
                  <h2>{appointments.filter(a => a.status === "rejected").length}</h2>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Appointments;