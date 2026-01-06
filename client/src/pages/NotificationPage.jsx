import React from 'react'
import Layout from '../components/Layout'
import { message, Tabs } from 'antd';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../redux/features/alertSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const NotificationPage = () => {
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const {user}=useSelector((state)=>state.user);
    const handleMarkAllRead=async()=>{
        try {
            dispatch(showLoading());
            const res=await axios.post('/api/v1/user/get-all-notifications',
            {userId:user._id},
            { headers:{
                    Authorization:`Bearer ${localStorage.getItem('token')}`
                }
            }
        )
            dispatch(hideLoading());
            if(res.data.success){
                message.success(res.data.message);
            }
            else{
                message.error(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            console.log(error);
            message.error("Something went wrong")
        }
    }

    const handleMarkAllDelete=async()=>{
        try {
            dispatch(showLoading());
            const res=await axios.post('/api/v1/user/delete-all-notifications',{userId:user._id},
            { headers:{
                    Authorization:`Bearer ${localStorage.getItem('token')}`
                }
            })
            dispatch(hideLoading());
            if(res.data.success){
                message.success(res.data.message);
            }
            else{
                message.error(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            console.log(error);
            message.error("Something went wrong")
        }
    }
  return (
    <Layout>
        <h4 className="p-3 text-center">Notification Page</h4>
        <Tabs>
            <Tabs.TabPane tab="Unread" key={0}>
                <div className="d-flex justify-content-end">
                    <h4 className="p-2 text-primary" style={{cursor:"pointer"}} onClick={handleMarkAllRead}>Mark All Read</h4>
                </div>
                {user?.notification.map((notificationMsg) => (
                    <div
                        key={notificationMsg._id}
                        className="card"
                        style={{ cursor: "pointer"}}
                        onClick={navigate(notificationMsg.onClickPath)}
                    >
                        <div className="card-text">
                        {notificationMsg.message}
                        </div>
                    </div>
                ))}
            </Tabs.TabPane>
            <Tabs.TabPane tab="Read" key={1}>
                <div className="d-flex justify-content-end">
                    <h4 className="p-2 text-danger" style={{cursor:"pointer"}} onClick={handleMarkAllDelete}>Delete All Read</h4>
                </div>
                {user?.seennotification.map((notificationMsg) => (
                    <div
                        key={notificationMsg._id}
                        className="card"
                        style={{ cursor: "pointer"}}
                        onClick={navigate(notificationMsg.onClickPath)}
                    >
                        <div className="card-text">
                        {notificationMsg.message}
                        </div>
                    </div>
                ))}
            </Tabs.TabPane>
        </Tabs>
    </Layout>
  )
}

export default NotificationPage