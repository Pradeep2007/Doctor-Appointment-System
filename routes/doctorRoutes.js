const express=require('express');
const authMiddleware=require('../middlewares/authMiddleware');
const { getDoctorInfoController, updateProfileController, getDoctorByIdController, doctorAppointmentController, updateStatusController, getDoctorAppointmentsByDate } = require('../controllers/doctorCtrl');
const router=express.Router();

router.post('/getDoctorInfo',authMiddleware,getDoctorInfoController)

router.post('/updateProfile',authMiddleware,updateProfileController)

router.post('/getDoctorById',authMiddleware,getDoctorByIdController)

router.get('/doctor-appointments',authMiddleware,doctorAppointmentController)

router.post('/update-status',authMiddleware,updateStatusController)

// Add this route
router.get('/doctor-appointments-by-date', authMiddleware, getDoctorAppointmentsByDate);

module.exports=router;