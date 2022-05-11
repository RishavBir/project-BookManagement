const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
const userModel=require("../models/userModel")


  //EMAIL VALIDATION BY REJEX
   const validateEmail = (email) => {
   return String(email)
    .toLowerCase()
    .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
       );
      };
const createUser = async (req, res) => {
    try {
  
//PASSWORD VALIDATION BY REJEX
    const validatePassword = (password) => {
    return String(password).match(
         /^(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,15}$)/
   );
      };
  
 //STRING VALIDATION BY REJEX
    const validatefeild= (shivam) => {
     return String(shivam).match(
         /^[a-zA-Z]/);
      };
  
 //VALIDATION OF MOBILE NO BY REJEX
  const validateNumber = (Feild) => {
      return String(Feild).match(
        /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/);
    };
  
  
    //VALIDATION OF pincode BY REJEX
  const validatepincode = (pincode) => {
    return String(pincode).match(
      /^(\d{4}|\d{6})$/);
  };
  
  
  
      const data = req.body;
      if (Object.keys(data).length == 0) {
        return res.status(400).send({status:false, msg: "Feild Can't Empty.Please Enter Some Details" });
      }
  
       if (!data.title){
       return res.status(400).send({ status:false,msg:"Title is missing"});
      }
  
      //Title validation by Rejex
      if (!validatefeild(data.title)) {
        return res.status(400).send({status: false,msg: "Title must contain Alphabet",});
      }
  
      if (!data.name){
        return res.status(400).send({ status:false,msg:"Name is missing"});
       }
  
       //Name validation by Rejex
       if (!validatefeild(data.name)) {
         return res.status(400).send({status: false,msg: "Name must contain Alphabet or Number"});
       }
  
  
       if (!data.phone){
        return res.status(400).send({status:false,message:"Phone Number is missing"});
    }
        //Phone no. validation by Rejex
        if (!validateNumber(data.phone)) {
        return res.status(400).send({status: false, message: "Invaild Phone No.." });
        }
  
        const findphoneno = await userModel.findOne({ phone: data.phone});
  
        if(findphoneno){
          return res.status(404).send({ status:false,message: `Phone no. ${data.phone} Already Registered.Please,Give Another Phone.no`})
      }
  
        if (!data.email){
           return res.status(400).send({status:false,message:"Email is missing"});
        }
  
       //email validation by Rejex
       if (!validateEmail(data.email)) {
        return res.status(400).send({status: false, message: "Invaild E-mail id." });
        }
  
        const findemail = await userModel.findOne({ email: data.email }); //email exist or not
  
       if(findemail){
      return res.status(404).send({ status:false,message:  `Email Id >> ${data.email} Already Registered.Please,Give Another ID`})
  }
  
      if (!data.password) {
    return res.status(400).send({status:false,msg:"Password is missing"});
  }
  
  //password validation by Rejex
  
    if (!validatePassword(data.password)) {
    return res.status(400).send({status: false,msg: "Password should contain at-least one number,one special character and one capital letter",}); //password validation
  }
  

  if(data.address.city){
  if (!validatefeild(data.address.city)) {
    return res.status(400).send({status: false,msg: "City must contain Alphabet or Number",});
  }}
  
  if(data.address.pincode){
  if (!validatepincode(data.address.pincode)) {
    return res.status(400).send({status: false,msg: "Invalid Pincode",});
  }}
  
  const user = await userModel.create(data);
        return res.status(201).send({status:true,msg: user });
      }
  
      catch (err) {
        res.status(500).send({ status:false,error: err.message });
      }
    }

/************************************************************************************************************************** */


const login=async function(req,res){
    const email=req.body.email
    const password=req.body.password
    const data = req.body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Please Enter E-mail and Password..." })
        }
        if (email == undefined) {
            return res.status(400).send({ status: false, msg: "Please Enter Email" })
        }
        if (password == undefined) {
            return res.status(400).send({ status: false, msg: "Please Provide Password" })
        }
       
        if (!validateEmail(email)) {
            return res.status(400).send({ status: false, msg: "Invaild E-mail id " })
        }
    const result =await userModel.findOne({email:email,password:password}).select({_id:1})
    if (!result) {
        return res.status(400).send({ status: false, msg: "Invalid Credentials" })
    }
    const token = jwt.sign({
        userId: result._id
    }, "Project 3",{expiresIn:"10m"});
    res.setHeader("x-api-key", token);
    res.status(200).send({ status: true, data: "logged in successfully",data:token })
}



module.exports.createUser=createUser
module.exports.login=login