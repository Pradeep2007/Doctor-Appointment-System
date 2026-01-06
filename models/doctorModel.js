const mongoose=require('mongoose')

const doctorSchema=new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    firstName:{
        type:String,
        required:[true,"First Name is required"],
    },
    lastName:{
        type:String,
        required:[true,"Last Name is required"],
    },
    phone:{
        type:String,
        required:[true,"Phone Number is required"],
    },
    email:{
        type:String,
        required:[true,"Email is required"],
    },
    website:{
        type:String,
    },
    address:{
        type:String,
        required:[true,"Address is required"],
    },
    specialization:{
        type:String,
        required:[true,"Specialization is required"],
    },
    experience:{
        type:String,
        required:[true,"Experience is required"],
    },
    feesPerConsultation:{
        type:Number,
        required:[true,"Fees Per Consultation is required"],
    },
    status:{
        type:String,
        default:"pending",
    },
    timings:{
        type:[String],
        required:[true,"Timings is required"],
    },
},{timestamps:true})

const doctorModel=mongoose.model("doctors",doctorSchema);
module.exports=doctorModel;