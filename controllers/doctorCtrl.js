const appointmentModel = require('../models/appointmentModel');
const doctorModel=require('../models/doctorModel');
const moment = require("moment");
const userModel=require('../models/userModels')
const getDoctorInfoController=async(req,res)=>{
    try {
        const doctor=await doctorModel.findOne({userId:req.user.userId})
        res.status(200).send({
            success:true,
            data:doctor,
            message:"Doctor info fetched successfully"
        })
    } catch (error) {
        console.log(error)
        resizeBy.status(500).send({
            success:false,
            error,
            message:"Error in getting doctor info"
        })
    }
}

const updateProfileController=async(req,res)=>{
    try {
        const doctor=await doctorModel.findOneAndUpdate({userId:req.body.userId},req.body)
        res.status(200).send({
            success:true,
            message:"Doctor profile updated successfully",
            data:doctor,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:"Error in updating profile"
        })
    }
}

const getDoctorByIdController=async(req,res)=>{
    try {
        const doctor=await doctorModel.findOne({_id:req.body.doctorId})
        res.status(200).send({
            success:true,
            data:doctor,
            message:"Doctor info fetched successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:"Error in getting doctor by id"
        })
    }
}

const doctorAppointmentController=async(req,res)=>{
    try {
        const doctor=await doctorModel.findOne({userId:req.user.userId})
        const appointments=await appointmentModel.find({doctorId:doctor._id})
        res.status(200).send({
            success:true,
            message:'Doctor appointments fetch successfully',
            data:appointments
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error in Doc Appointments'
        })
    }
}

const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;

    const appointments = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status },
      { new: true }
    );

    if (!appointments) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }

    const user = await userModel.findById(appointments.userId);

    if (user) {
      user.notification.push({
        type: "status-updated",
        message: `Your appointment has been updated ${status}`,
        onClickPath: "/doctor-appointments",
      });
      await user.save();
    }

    res.status(200).send({
      success: true,
      message: "Appointment Status Updated",
    });
  } catch (error) {
    console.log("UPDATE STATUS ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Error In Update Status",
    });
  }
};

const getDoctorAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.query; // "DD-MM-YYYY"

    const appointments = await appointmentModel.find({
      doctorId: req.user.userId,
      date,
    });

    res.status(200).send({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching appointments by date",
    });
  }
};

module.exports={getDoctorInfoController,updateProfileController,getDoctorByIdController,getDoctorAppointmentsByDate,doctorAppointmentController,updateStatusController}