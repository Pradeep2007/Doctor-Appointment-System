import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Spin, message } from "antd";
import { setUser, clearUser } from "../redux/features/userSlice";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);

  const getUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.log("No token found, redirecting to login");
        dispatch(clearUser());
        navigate("/login");
        return;
      }

      console.log("Fetching user data with token...");
      
      const res = await axios.post(
        "/api/v1/user/getUserData",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("User data response:", res.data);

      if (res.data.success) {
        dispatch(setUser({
          user: res.data.data,
          isDoctor: res.data.data.isDoctor || false,
          isAdmin: res.data.data.isAdmin || false
        }));
        setLoading(false);
      } else {
        console.log("API returned success: false", res.data.message);
        localStorage.removeItem("token");
        dispatch(clearUser());
        message.error(res.data.message || "Session expired");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error in ProtectedRoute:", error);
      
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        
        if (error.response.status === 401 || error.response.status === 403) {
          message.error("Session expired. Please login again.");
        } else if (error.response.status === 500) {
          message.error("Server error. Please try again later.");
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        message.error("Network error. Please check your connection.");
      } else {
        console.error("Request error:", error.message);
        message.error("Error loading user data.");
      }
      
      localStorage.removeItem("token");
      dispatch(clearUser());
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(false);
      return;
    }
    getUser();
  }, [navigate, user, dispatch]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column"
      }}>
        <Spin size="large" />
        <p style={{ marginTop: "20px" }}>Loading...</p>
      </div>
    );
  }

  return children;
}