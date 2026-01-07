const userModel=require('../models/userModels')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const doctorModel = require('../models/doctorModel')
const appointmentModel = require('../models/appointmentModel')
const moment = require("moment");
const registerController =async(req,res)=>{
    try {
        const existingUser=await userModel.findOne({email:req.body.email})
        if(existingUser){
            return res.status(200).send({
                success:false,
                message:"User already exists"
            })
        }
        const password=req.body.password
        const salt=await bcrypt.genSalt(10)
        const hashedPasswor=await bcrypt.hash(password,salt)
        req.body.password=hashedPasswor
        const newUser=new userModel(req.body)
        await newUser.save()
        res.status(201).send({
            success:true,
            message:"User Registered Successfully",
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message:`Register Controller ${error.message}`
        })
    }
}
const loginController =async(req,res)=>{
    try {
        const user=await userModel.findOne({email:req.body.email})
        if(!user){
            return res.status(200).send({
                success:false,
                message:"User not found"
            })
        }
        const isMatch=await bcrypt.compare(req.body.password,user.password)
        if(!isMatch){
            return res.status(200).send({
                success:false,
                message:"Invalid email or password"
            })
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1d"})
        res.status(200).send({
            success:true,
            message:"Login Successfully",
            token,
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message:`Login Controller ${error.message}`
        })
    }
}

// const authController=async(req,res)=>{
//     try {
//         const user=await userModel.findById({_id:req.user.userId})
//         user.password=undefined
//         if(!user){
//             return res.status(401).send({
//                 success:false,
//                 message:"User not found"
//             })
//         }
//         res.status(200).send({
//             success:true,
//             message:"User Authenticated",
//             data:user,
//         })
//     } catch (error) {
//         console.log(error)
//         res.status(500).send({
//             success:false,
//             message:"Auth Error",
//             error
//         })
//     }
// }

const authController = async (req, res) => {
  try {
    console.log("=== AUTH CONTROLLER ===");
    console.log("User ID from token:", req.user.userId);
    
    // Find user by ID
    const user = await userModel.findById(req.user.userId).select('-password');
    if (!user) {
      console.log("User not found in database");
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    console.log("User found:", user.email);

    // Check if user is a doctor
    let isDoctor = false;
    let doctorInfo = null;
    
    try {
      const doctor = await doctorModel.findOne({ userId: user._id });
      if (doctor) {
        isDoctor = true;
        doctorInfo = {
          _id: doctor._id,
          status: doctor.status,
          specialization: doctor.specialization
        };
        console.log("User is a doctor, status:", doctor.status);
      }
    } catch (doctorError) {
      console.log("Error checking doctor status (non-critical):", doctorError.message);
    }

    // Prepare response
    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || false,
      isDoctor: isDoctor,
      doctorInfo: doctorInfo,
      // Add any other user fields you need
      ...(user.phone && { phone: user.phone }),
      ...(user.address && { address: user.address }),
    };

    console.log("Sending response:", responseData);

    res.status(200).send({
      success: true,
      message: "User authenticated successfully",
      data: responseData,
    });

  } catch (error) {
    console.error("=== AUTH CONTROLLER ERROR ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    
    // Check for specific errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).send({
        success: false,
        message: "Invalid token",
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send({
        success: false,
        message: "Token expired",
      });
    }

    res.status(500).send({
      success: false,
      message: "Authentication error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
const applyDoctorController = async (req, res) => {
  try {
    console.log("=== APPLY DOCTOR REQUEST ===");
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
    console.log("Timings from request:", req.body.timings);
    console.log("Timings type:", typeof req.body.timings);
    console.log("Timings is array?", Array.isArray(req.body.timings));

    let timingsArray;

    if (Array.isArray(req.body.timings)) {
      if (req.body.timings.length === 2) {
        timingsArray = [
          req.body.timings[0].toString ? req.body.timings[0].toString() : String(req.body.timings[0]),
          req.body.timings[1].toString ? req.body.timings[1].toString() : String(req.body.timings[1]),
        ];
      } else {
        console.error("Timings array should have exactly 2 elements");
        return res.status(400).send({
          success: false,
          message: "Please provide start and end timings",
        });
      }
    } else {
      console.error("Timings is not an array:", req.body.timings);
      return res.status(400).send({
        success: false,
        message: "Invalid timings format",
      });
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(timingsArray[0])) {
      console.error("Invalid start time format:", timingsArray[0]);
      return res.status(400).send({
        success: false,
        message: "Invalid start time format. Use HH:mm (24-hour format)",
      });
    }
    
    if (!timeRegex.test(timingsArray[1])) {
      console.error("Invalid end time format:", timingsArray[1]);
      return res.status(400).send({
        success: false,
        message: "Invalid end time format. Use HH:mm (24-hour format)",
      });
    }

    console.log("Processed timings:", timingsArray);

    const newDoctor = new doctorModel({
      ...req.body,
      timings: timingsArray, 
      status: "pending",
    });

    await newDoctor.save();
    console.log("Doctor saved successfully with timings:", newDoctor.timings);

    const adminUser = await userModel.findOne({ isAdmin: true });
    if (adminUser) {
      adminUser.notification.push({
        type: "apply-doctor-request",
        message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
        data: {
          doctorId: newDoctor._id,
          name: `${newDoctor.firstName} ${newDoctor.lastName}`,
          onClickPath: "/admin/doctors",
        },
      });
      await adminUser.save();
    }

    res.status(201).send({
      success: true,
      message: "Doctor account applied successfully",
      data: {
        doctorId: newDoctor._id,
        timings: newDoctor.timings,
      },
    });
  } catch (error) {
    console.error("=== APPLY DOCTOR ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error details:", error);
    
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
      return res.status(400).send({
        success: false,
        message: "Validation error: " + Object.values(error.errors).map(e => e.message).join(', '),
      });
    }

    if (error.code === 11000) {
      console.error("Duplicate key error:", error.keyValue);
      return res.status(400).send({
        success: false,
        message: "Email or phone already exists",
      });
    }

    res.status(500).send({
      success: false,
      message: "Error while applying for doctor",
      error: error.message,
    });
  }
};

// const getAllNotificationsController = async (req, res) => {
//   try {
//     const user = await userModel.findOne({ _id: req.body.userId });
//     const seennotification = user.seennotification;
//     const notification = user.notification;
//     seennotification.push(...notification);
//     user.notifcation = [];
//     user.seennotification = notification;
//     const updatedUser = await user.save();
//     res.status(200).send({
//       success: true,
//       message: "all notification marked as read",
//       data: updatedUser,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: "Error in notification",
//       success: false,
//       error,
//     });
//   }
// };

// // delete notifications
// const deleteAllNotificationsController = async (req, res) => {
//   try {
//     const user = await userModel.findOne({ _id: req.body.userId });
//     user.notification = [];
//     user.seennotification = [];
//     const updatedUser = await user.save();
//     updatedUser.password = undefined;
//     res.status(200).send({
//       success: true,
//       message: "Notifications Deleted successfully",
//       data: updatedUser,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "unable to delete all notifications",
//       error,
//     });
//   }
// };

// Line 312 - You defined it as getAllNotificationController (singular)
const getAllNotificationsController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notification = user.notification;  
    seennotification.push(...notification);
    user.notification = [];  
    user.seennotification = notification; 
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "all notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};

// Line 334 - You defined it as deleteAllNotificationController (singular)
const deleteAllNotificationsController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notification = [];  // CORRECT: uses "notification"
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "unable to delete all notifications",
      error,
    });
  }
};

const getAllDoctorsController=async(req,res)=>{
    try {
        const doctors=await doctorModel.find({status:'approved'})
        res.status(200).send({
            success:true,
            message:'Doctors list fetched successfully',
            data:doctors
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error while fetching doctors'
        })
    }
}


const bookAppointmentController = async (req, res) => {
  try {
    const { doctorId, userId, date, time, doctorInfo, userInfo } = req.body;

    if (!doctorId || !userId || !date || !time) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).send({
        success: false,
        message: "Invalid date format. Use DD-MM-YYYY format",
      });
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return res.status(400).send({
        success: false,
        message: "Invalid time format. Use HH:mm format",
      });
    }

    const newAppointment = new appointmentModel({
      doctorId,
      userId,
      doctorInfo: JSON.stringify(doctorInfo), 
      userInfo: JSON.stringify(userInfo),     
      date,   
      time,   
      status: "pending",
    });

    await newAppointment.save();

    if (doctorInfo && doctorInfo.userId) {
      const doctorUser = await userModel.findById(doctorInfo.userId);
      if (doctorUser) {
        doctorUser.notification.push({
          type: "New-appointment-request",
          message: `New appointment request for ${date} at ${time}`,
          onClickPath: "/doctor/appointments",
        });
        await doctorUser.save();
      }
    }

    res.status(200).send({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.error("Book appointment error:", error);
    res.status(500).send({
      success: false,
      message: "Error while booking appointment",
      error: error.message,
    });
  }
};

const bookingAvailabilityController = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    console.log("=== AVAILABILITY CHECK ===");
    console.log("Doctor ID:", doctorId);
    console.log("Date:", date);
    console.log("Time:", time);

    if (!doctorId || !date || !time) {
      return res.status(200).send({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.status(200).send({
        success: false,
        message: "Doctor not found",
      });
    }

    if (doctor.status !== "approved") {
      return res.status(200).send({
        success: false,
        message: "Doctor is not approved for appointments",
      });
    }

    const requestedTime = moment(time, "HH:mm");
    const startTime = moment(doctor.timings[0], "HH:mm");
    const endTime = moment(doctor.timings[1], "HH:mm");

    if (requestedTime.isBefore(startTime)) {
      return res.status(200).send({
        success: false,
        message: `Doctor is available from ${doctor.timings[0]}. Please select a later time.`,
      });
    }

    if (requestedTime.isAfter(endTime)) {
      return res.status(200).send({
        success: false,
        message: `Doctor is available until ${doctor.timings[1]}. Please select an earlier time.`,
      });
    }

    const existingAppointment = await appointmentModel.findOne({
      doctorId,
      date,
      time,
      status: { $in: ["pending", "approved"] }
    });

    if (existingAppointment) {
      return res.status(200).send({
        success: false,
        message: "This time slot is already booked. Please choose another time.",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Time slot is available for booking!",
    });

  } catch (error) {
    console.error("Error in booking availability:", error);
    return res.status(200).send({
      success: false,
      message: "An error occurred while checking availability. Please try again.",
    });
  }
};
const userAppointmentController=async(req,res)=>{
    try {
      const appointments=await appointmentModel.find({userId:req.user.userId})
      res.status(200).send({
          success:true,
          message:'Users Appointments Fetched Successfully',
          data:appointments,
      })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error in user Appointments'
        })
    }
}

module.exports = {loginController,bookingAvailabilityController, userAppointmentController,bookAppointmentController,registerController,authController,applyDoctorController,getAllNotificationsController,deleteAllNotificationsController,getAllDoctorsController};