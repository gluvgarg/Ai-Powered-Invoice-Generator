const jwt = require("jsonwebtoken");
const User = require("../models/User");

//helper : generate Jwt;
const generateToken = (id) => {
  return jwt.sign({id},process.env.JWT_SECRET,{
    expiresIn: "7d",
  });
};

//@desc register new user 
//@route POST/api/auth/register 
//@access  Public
exports.registerUser = async (req,res)=>{
  const {name,email,password} = req.body;

  try{
     if(!name || !email || !password){
      return res.status(400).json({message : "Please fill all fields"});
    }

    //check if user exists 
    const userExists = await User.findOne({email});
    if(userExists){
      return res.status(400).json({message : "User already Exists"});
    }

    //Create user 
    const user = await User.create({ name,email,password});

    if(user){
      res.status(201).json({
        _id : user._id,
        name : user.name,
        email : user.email,
        token : generateToken(user._id),
        businessName : user.businessName || "",
        address : user.address || "",
        phone : user.phone || "",
      });}
      else{
        res.status(400).json({message : "Invalid user data"})
      }
    }catch (err) {
  console.log("REGISTER ERROR:", err);   // 🔥 ADD THIS

  res.status(500).json({
    message: err.message || "server error",
  });
}
  // }catch(error) {
  //   res.status(500).json({message : "server error"});
  // }
};

//desc login user
// @route POST/api/auth/login
// @access Public
exports.loginUser = async (req,res)=>{
  const{email,password} = req.body;
  try{
       const user = await User.findOne({email}).select("+password");

    if(user && (await user.matchPassword(password))){
      res.json({
        _id : user._id,
        name : user.name,
        email : user.email,
        token : generateToken(user._id),

        businessName : user.businessName || "",
        address : user.address || "",
        phone : user.phone || "",
      });
    }else { 
       res.status(401).json({message : "Invalid Credentials"});
    }
    
  }catch(error) {
    res.status(500).json({message : "server error"});
  }
};

//@desc Get current logged-in user 
//@route GET/api/auth/me
//@access Private
exports.getMe = async(req,res)=>{
  try{
     const user = await User.findById(req.user.id);
     res.json({
      _id : user._id,
        name : user.name,
        email : user.email, 

        businessName : user.businessName || "",
        address : user.address || "",
        phone : user.phone || "",
     });
  }catch(error) {
    res.status(500).json({message : "server error"});
  }

};

//@desc Update user Profile
//@route Put/api/auth/me
//@access Private
exports.updateUserProfile = async(req,res) => {
  try{
    const user = await User.findById(req.user.id);
    
    if(user){
      user.name = req.body.name || user.name;
      user.businessName = req.body.businessName || user.businessName;
      user.address = req.body.address || user.address;
      user.phone = req.body.phone || user.phone;

      const updatedUser = await user.save();

      res.json({
        _id : updatedUser._id,
        name : updatedUser.name,
        email : updatedUser.email,
        businessName : updatedUser.businessName,
        address : updatedUser.address,
        phone : updatedUser.phone,
      });      
    }
    else{
      res.status(404).json({message : " User not found"});
    }
  }catch(error) {
    res.status(500).json({message : "server error"});
  }
};

