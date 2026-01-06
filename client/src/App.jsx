import {BrowserRouter, Routes, Route} from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { useSelector } from 'react-redux'
import Spinner from './components/Spinner.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PublicRoute from './components/PublicRoute.jsx'
import ApplyDoctor from './pages/ApplyDoctor.jsx'
import NotificationPage from './pages/NotificationPage.jsx'
import Users from './pages/admin/Users.jsx'
import Doctors from './pages/admin/Doctors.jsx'
import Profile from './pages/doctor/Profile.jsx'
import BookingPage from './pages/BookingPage.jsx'
import Appointments from './pages/Appointments.jsx'
import DoctorAppointments from './pages/doctor/DoctorAppointment.jsx'
function App() {
  const {loading}=useSelector((state)=>state.alerts)
  return (
    <>
      <BrowserRouter>
      {loading ? (<Spinner/>) :(
        <Routes>
        <Route path='/apply-doctor' element={
          < ProtectedRoute>
            <ApplyDoctor/>
          </ProtectedRoute>
        }/>
        <Route path='/admin/users' element={
          < ProtectedRoute>
            <Users/>
          </ProtectedRoute>
        }/>
        <Route path='/admin/doctors' element={
          < ProtectedRoute>
            <Doctors/>
          </ProtectedRoute>
        }/>
        <Route path='/doctor/profile/:id' element={
          < ProtectedRoute>
            <Profile/>
          </ProtectedRoute>
        }/>
        <Route path='/doctor/book-appointment/:doctorId' element={
          < ProtectedRoute>
            <BookingPage/>
          </ProtectedRoute>
        }/>
        <Route path='/notification' element={
          < ProtectedRoute>
            <NotificationPage/>
          </ProtectedRoute>
        }/>
        <Route path='/login' element={
          < PublicRoute>
            <Login/>
          </ PublicRoute>
        }/>
        <Route path='/register' element={
          < PublicRoute>
            <Register/>
          </ PublicRoute>
        }/>
        <Route path='/appointments' element={
          < ProtectedRoute>
            <Appointments/>
          </ ProtectedRoute>
        }/>
        <Route path='/doctor-appointments' element={
          < ProtectedRoute>
            <DoctorAppointments/>
          </ ProtectedRoute>
        }/>
        <Route path='/' element={
          < ProtectedRoute>
            <HomePage/>
          </ProtectedRoute>
        }/>
      </Routes>
      )}
      </BrowserRouter>
    </>
  )
}

export default App
