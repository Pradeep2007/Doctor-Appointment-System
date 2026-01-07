// import React from "react";
// import Layout from "./../components/Layout";
// import { message, Tabs } from "antd";
// import { useSelector, useDispatch } from "react-redux";
// import { showLoading, hideLoading } from "../redux/features/alertSlice";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const NotificationPage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.user);
//   //   handle read notification
//   const handleMarkAllRead = async () => {
//     try {
//       dispatch(showLoading());
//       const res = await axios.post(
//         "/api/v1/user/get-all-notification",
//         {
//           userId: user._id,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       dispatch(hideLoading());
//       if (res.data.success) {
//         message.success(res.data.message);
//       } else {
//         message.error(res.data.message);
//       }
//     } catch (error) {
//       dispatch(hideLoading());
//       console.log(error);
//       message.error("somthing went wrong");
//     }
//   };

//   // delete notifications
//   const handleDeleteAllRead = async () => {
//     try {
//       dispatch(showLoading());
//       const res = await axios.post(
//         "/api/v1/user/delete-all-notification",
//         { userId: user._id },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       dispatch(hideLoading());
//       if (res.data.success) {
//         message.success(res.data.message);
//       } else {
//         message.error(res.data.message);
//       }
//     } catch (error) {
//       dispatch(hideLoading());
//       console.log(error);
//       message.error("Somthing Went Wrong In Ntifications");
//     }
//   };
//   return (
//     <Layout>
//       <h4 className="p-3 text-center">Notification Page</h4>
//       <Tabs>
//         <Tabs.TabPane tab="unRead" key={0}>
//           <div className="d-flex justify-content-end">
//             <h4 className="p-2" onClick={handleMarkAllRead}>
//               Mark All Read
//             </h4>
//           </div>
//           {user?.notification.map((notificationMgs) => (
//             <div className="card" style={{ cursor: "pointer" }}>
//               <div
//                 className="card-text"
//                 onClick={() => navigate(notificationMgs.onClickPath)}
//               >
//                 {notificationMgs.message}
//               </div>
//             </div>
//           ))}
//         </Tabs.TabPane>
//         <Tabs.TabPane tab="Read" key={1}>
//           <div className="d-flex justify-content-end">
//             <h4
//               className="p-2 text-primary"
//               style={{ cursor: "pointer" }}
//               onClick={handleDeleteAllRead}
//             >
//               Delete All Read
//             </h4>
//           </div>
//           {user?.seennotification.map((notificationMgs) => (
//             <div className="card" style={{ cursor: "pointer" }}>
//               <div
//                 className="card-text"
//                 onClick={() => navigate(notificationMgs.onClickPath)}
//               >
//                 {notificationMgs.message}
//               </div>
//             </div>
//           ))}
//         </Tabs.TabPane>
//       </Tabs>
//     </Layout>
//   );
// };

// export default NotificationPage;/

import React, { useState } from "react";
import Layout from "./../components/Layout";
import { message, Tabs } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { setUser } from "../redux/features/userSlice"; // ADD THIS IMPORT
import { useNavigate } from "react-router-dom";
import axios from "axios";

const NotificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("0");
  
  //   handle read notification
  const handleMarkAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/get-all-notification",
        {
          userId: user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
        // Update user state with new data
        if (res.data.data) {
          dispatch(setUser(res.data.data));
        }
        setActiveTab("1"); // Switch to read tab
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Something went wrong");
    }
  };

  // delete notifications
  const handleDeleteAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/delete-all-notification",
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
        // Update user state with new data
        if (res.data.data) {
          dispatch(setUser(res.data.data));
        }
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Something Went Wrong In Notifications");
    }
  };
  
  return (
    <Layout>
      <h4 className="p-3 text-center">Notification Page</h4>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab={`Unread (${user?.notification?.length || 0})`} key={0}>
          <div className="d-flex justify-content-end">
            <h4 
              className="p-2 text-primary" 
              style={{ cursor: "pointer" }} 
              onClick={handleMarkAllRead}
            >
              Mark All Read
            </h4>
          </div>
          {user?.notification && user.notification.length > 0 ? (
            user.notification.map((notificationMsg, index) => (  // FIXED: "notification" not "notifcation"
              <div 
                key={index} 
                className="card m-2 p-3" 
                style={{ cursor: "pointer" }}
              >
                <div
                  className="card-text"
                  onClick={() => navigate(notificationMsg.onClickPath || "/")}
                >
                  {notificationMsg.message}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center p-3">No unread notifications</p>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab={`Read (${user?.seennotification?.length || 0})`} key={1}>
          <div className="d-flex justify-content-end">
            <h4
              className="p-2 text-danger"
              style={{ cursor: "pointer" }}
              onClick={handleDeleteAllRead}
            >
              Delete All Read
            </h4>
          </div>
          {user?.seennotification && user.seennotification.length > 0 ? (
            user.seennotification.map((notificationMsg, index) => (
              <div 
                key={index} 
                className="card m-2 p-3" 
                style={{ cursor: "pointer" }}
              >
                <div
                  className="card-text"
                  onClick={() => navigate(notificationMsg.onClickPath || "/")}
                >
                  {notificationMsg.message}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center p-3">No read notifications</p>
          )}
        </Tabs.TabPane>
      </Tabs>
    </Layout>
  );
};

export default NotificationPage;