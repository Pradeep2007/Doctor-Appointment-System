const express = require("express");
const {
  getAllUsersController,
  getAllDoctorsController,
  changeDoctorAccountStatusController,} = require("../controllers/adminCtrl");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

//GET METHOD || USERS
router.get("/getAllUsers", authMiddleware, getAllUsersController);

//GET METHOD || DOCTORS
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

router.post('/updateDoctorStatus',authMiddleware,changeDoctorAccountStatusController)

module.exports = router;