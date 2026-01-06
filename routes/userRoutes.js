const express = require('express');
const { loginController, registerController, authController, applyDoctorController, getAllNotificationsController,
    deleteAllNotificationsController, getAllDoctorsController, bookAppointmentController, bookingAvailabilityController, 
    userAppointmentController } = require('../controllers/userCtrl');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
// Login Route
router.post('/login',loginController)

router.post('/register',registerController)

router.post("/getUserData",authMiddleware,authController)

router.post('/apply-doctor',authMiddleware,applyDoctorController)

router.post('/get-all-notifications',authMiddleware,getAllNotificationsController)

router.post('/delete-all-notifications',authMiddleware,deleteAllNotificationsController)

router.get('/getAllDoctors',authMiddleware,getAllDoctorsController)

router.post('/book-appointment',authMiddleware,bookAppointmentController)

router.post('/booking-availability',authMiddleware,bookingAvailabilityController)

router.get('/user-appointments',authMiddleware,userAppointmentController)
module.exports = router;