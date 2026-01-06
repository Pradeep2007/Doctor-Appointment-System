import React, { useState } from "react";
import "../styles/LayoutStyle.css";
import { adminMenu, userMenu } from "../data/data";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { message ,Badge} from "antd";
import { useDispatch } from "react-redux";
import { clearUser } from "../redux/features/userSlice";
const Layout = ({ children }) => {
  const {user} = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const dispatch = useDispatch();
  const handleLogout = () => {
    localStorage.clear();
    dispatch(clearUser())
    message.success("Logout Successfully");
    navigate("/login");
  };

  // =============doctor Menu===============

  const doctorMenu=[
      {
          name:"Home",
          path:"/",
          icon:"fa-solid fa-house"
      },
      {
          name:"Appointments",
          path:"/doctor-appointments",
          icon:"fa-solid fa-list"
      },
      {
          name:"Profile",
          path:`/doctor/profile/${user?._id}`,
          icon:"fa-solid fa-user"
      },
  ]

  // =============doctor Menu===============


  const SidebarMenu = user?.isAdmin ? adminMenu : user?.isDoctor?doctorMenu:userMenu;

  return (
    <div className="main">
      <div className="layout">
        <div className={`sidebar ${showSidebar ? "show" : ""}`}>
          <div className="logo">
            <h6>DOC APP</h6>
          </div>

          <div className="menu">
            {SidebarMenu.map((menu) => {
              const isActive = location.pathname === menu.path;
              return (
                <div
                  key={menu.path}
                  className={`menu-item ${isActive ? "active" : ""}`}
                  onClick={() => setShowSidebar(false)}
                >
                  <i className={menu.icon}></i>
                  <Link to={menu.path}>{menu.name}</Link>
                </div>
              );
            })}

            <div className="menu-item" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Logout</span>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="header">
            <i
              className={`hamburger ${
                showSidebar ? "ri-close-line cross" : "ri-menu-line"
              }`}
              onClick={() => setShowSidebar(!showSidebar)}
            ></i>

            <div className="header-content">
              <Badge count={user?.notification?.length || 0} onClick={()=>{navigate('/notification')}} style={{cursor:'pointer'}}>
                <i className="fa-solid fa-bell"></i>
              </Badge>
              <Link to="/profile">{user?.name}</Link>
            </div>
          </div>

          <div className="body">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
