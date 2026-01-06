import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { Table } from "antd";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/v1/admin/getAllUsers", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getUsers();
  }, []); 
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Email",
      dataIndex: "email",
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Doctor",
      dataIndex: "isDoctor",
      responsive: ["xs", "sm", "md", "lg"],
      render: (_, record) => (record.isDoctor ? "Yes" : "No"),
    },
    {
      title: "Actions",
      responsive: ["xs", "sm", "md", "lg"],
      render: () => (
        <button className="btn btn-danger btn-sm">Block</button>
      ),
    },
  ];

  return (
    <Layout>
      <h1 className="text-center m-2">Users List</h1>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={users}
        loading={loading}
        scroll={{ x: true }}
      />
    </Layout>
  );
};

export default Users;