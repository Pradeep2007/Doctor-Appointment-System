const doctorModel = require('../models/doctorModel')
const userModel = require('../models/userModels')

const getAllUsersController = async(req,res) => {
    try{
        const users = await userModel.find({})
        res.status(200).send({
            success:true,
            message:'users data list',
            data:users,
        });
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'error white feching users',
            error
        })
    }
}
const getAllDoctorsController = async(req,res) => {
    try{
        const doctors = await doctorModel.find({})
        res.status(200).send({
            success:true,
            message:'Doctors Data list',
            data:doctors,
        })
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send({
            success:false,
            message:' error while getting doctos data',
            error
        })
    }
}

const changeDoctorAccountStatusController = async (req, res) => {
  try {
    const { doctorId, userId, status } = req.body;

    const doctor = await doctorModel.findByIdAndUpdate(
      doctorId,
      { status },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.notification.push({
      type: "doctor-account-request-updated",
      message: `Your doctor account request has been ${status}`,
      onClickPath: "/notification",
    });

    user.isDoctor = status === "approved";

    await user.save();

    res.status(200).send({
      success: true,
      message: "Account status updated successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while changing doctor account status",
    });
  }
};

module.exports = {getAllDoctorsController, getAllUsersController,changeDoctorAccountStatusController,}