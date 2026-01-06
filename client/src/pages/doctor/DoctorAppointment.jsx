// import React, { useState, useEffect } from "react";
// import Layout from "./../../components/Layout";

// import axios from "axios";

// import moment from "moment";
// import { message, Table } from "antd";

// const DoctorAppointments = () => {
//   const [appointments, setAppointments] = useState([]);

//   const getAppointments = async () => {
//     try {
//       const res = await axios.get("/api/v1/doctor/doctor-appointments", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       if (res.data.success) {
//         setAppointments(res.data.data);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     getAppointments();
//   }, []);

//   const handleStatus = async (record, status) => {
//     try {
//       const res = await axios.post(
//         "/api/v1/doctor/update-status",
//         { appointmentsId: record._id, status },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       if (res.data.success) {
//         message.success(res.data.message);
//         getAppointments();
//       }
//     } catch (error) {
//       console.log(error);
//       message.error("Something Went Wrong");
//     }
//   };

//   const columns = [
//     {
//       title: "ID",
//       dataIndex: "_id",
//     },
//     {
//       title: "Date & Time",
//       dataIndex: "date",
//       render: (text, record) => (
//         <span>
//           {moment(record.date).format("DD-MM-YYYY")} &nbsp;
//           {moment(record.time).format("HH:mm")}
//         </span>
//       ),
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//     },
//     {
//       title: "Actions",
//       dataIndex: "actions",
//       render: (text, record) => (
//         <div className="d-flex">
//           {record.status === "pending" && (
//             <div className="d-flex">
//               <button
//                 className="btn btn-success"
//                 onClick={() => handleStatus(record, "approved")}
//               >
//                 Approved
//               </button>
//               <button
//                 className="btn btn-danger ms-2"
//                 onClick={() => handleStatus(record, "rejected")}
//               >
//                 Reject
//               </button>
//             </div>
//           )}
//         </div>
//       ),
//     },
//   ];
//   return (
//     <Layout>
//       <h1>Appoinmtnets Lists</h1>
//       <Table columns={columns} dataSource={appointments} scroll={{ x: true }}/>
//     </Layout>
//   );
// };

// export default DoctorAppointments;

import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import moment from "moment";
import { message, Table, Tag, Button, Space } from "antd";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/doctor/doctor-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      message.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  const handleStatus = async (record, status) => {
    try {
      const res = await axios.post(
        "/api/v1/doctor/update-status",
        { appointmentsId: record._id, status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getAppointments();
      } else {
        message.error(res.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Something went wrong");
    }
  };

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    // Try different formats
    const formats = ["DD-MM-YYYY", "YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY"];
    
    for (let format of formats) {
      const date = moment(dateString, format, true);
      if (date.isValid()) {
        return date.format("DD-MM-YYYY");
      }
    }
    
    // If no format works, return raw string
    return dateString;
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      width: 100,
      render: (id) => <span style={{ fontSize: "12px" }}>{id?.substring(0, 8)}...</span>,
    },
    {
      title: "Patient",
      key: "patient",
      width: 200,
      render: (_, record) => {
        try {
          let patientName = "Unknown";
          
          if (typeof record.userInfo === 'string') {
            const parsed = JSON.parse(record.userInfo);
            patientName = `${parsed.name || parsed.firstName || ''} ${parsed.lastName || ''}`.trim();
          } else if (record.userInfo && typeof record.userInfo === 'object') {
            patientName = `${record.userInfo.name || record.userInfo.firstName || ''} ${record.userInfo.lastName || ''}`.trim();
          }
          
          return <span>{patientName || "Unknown Patient"}</span>;
        } catch (error) {
          console.log(error)
          return <span>Unknown Patient</span>;
        }
      },
    },
    {
      title: "Date",
      key: "date",
      width: 120,
      render: (_, record) => {
        const formattedDate = formatDate(record.date);
        return <span>{formattedDate}</span>;
      },
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      width: 100,
      render: (time) => <span>{time || "N/A"}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        let color = "";
        let text = "";
        
        switch (status?.toLowerCase()) {
          case "approved":
            color = "green";
            text = "Approved";
            break;
          case "pending":
            color = "orange";
            text = "Pending";
            break;
          case "rejected":
            color = "red";
            text = "Rejected";
            break;
          default:
            color = "default";
            text = status || "Unknown";
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Created On",
      key: "createdAt",
      width: 180,
      render: (_, record) => {
        if (record.createdAt) {
          return <span>{moment(record.createdAt).format("DD-MM-YYYY HH:mm")}</span>;
        }
        return <span>N/A</span>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          {record.status === "pending" && (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => handleStatus(record, "approved")}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                Approve
              </Button>
              <Button
                type="primary"
                danger
                size="small"
                onClick={() => handleStatus(record, "rejected")}
              >
                Reject
              </Button>
            </>
          )}
          {record.status !== "pending" && (
            <Tag color={record.status === "approved" ? "green" : "red"}>
              {record.status === "approved" ? "Approved" : "Rejected"}
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Doctor Appointments</h1>
          <button 
            className="btn btn-outline-primary"
            onClick={getAppointments}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        
        {appointments.length === 0 && !loading ? (
          <div className="text-center py-5">
            <div className="display-1 text-muted mb-3">📅</div>
            <h3 className="text-muted">No Appointments Found</h3>
            <p className="text-muted">You don't have any appointments yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table 
              columns={columns} 
              dataSource={appointments.map(app => ({
                ...app,
                key: app._id
              }))}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} appointments`,
              }}
              scroll={{ x: 1000 }}
              bordered
              size="middle"
            />
          </div>
        )}
        
        {/* Summary Stats */}
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
                  <h5 className="card-title">Approved</h5>
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
                  <h5 className="card-title">Rejected</h5>
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

export default DoctorAppointments;