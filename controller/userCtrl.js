const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const  validateMongoDbId  = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const { text } = require("body-parser");
const { sendEmail } = require("./emailCtrl");
const crypto = require("crypto");

// create a user
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser= await User.findOne({email:email});
    if(!findUser){
        // create a new user
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
       throw new Error("User Already Exixst");
    }
});

//login a user
const loginUserCtrl = asyncHandler(async(req, res) => {
    const {email, password} = req.body;
    // check if user exists or not
    const findUser = await User.findOne({email});
    if(findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?.id);
        const updateUser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,
            },
            {
                new: true
            }
        );
        res.cookie('refreshToken',refreshToken, {
            httpOnly: true,
            maxAge: 72*60*60*1000,
        }),
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    } else {
        throw new Error("Invalid Credentials");
    }
});

//logout a user/function

const logout = asyncHandler(async(req, res) => {
    const cookies = req.cookies;
    const refreshToken = cookies?.refreshToken;

    if (!refreshToken) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        });
        return res.status(400).json({ message: "No refresh token in cookies" });
    }

    const user = await User.findOne({ refreshToken });

    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        });
        return res.sendStatus(204); // No Content
    }

    await User.findOneAndUpdate({ refreshToken }, { refreshToken: "" });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    });
    res.sendStatus(204); // No Content
});

// get all users

const getallUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    }catch(error){
        throw new Error(error);
    }
});

// get a single user

const getaUser = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        })
    } catch (error) {
        throw new Error(error);
    }
});

// delete a user
const deletedUser = asyncHandler(async(req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const dedeletedUser = await User.findByIdAndDelete(id);
        res.json({
            deletedUser,
        })
    } catch (error) {
        throw new Error(error);
    }
});

//new function that will handle refresh token 

const handleRefreshToken = asyncHandler(async(req, res) =>{
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    console.log(refreshToken);
    const user = await User.findOne({refreshToken});
    if (!user) throw new Error("No Refresh Token present in Database or Matched");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with Refresh Token");
        } 
        const accessToken = generateToken(user?.id)
        res.json(accessToken);
    });
});

// Update a user

const updatedUser = asyncHandler(async(req, res ) => {
    const {id} = req.user;
    validateMongoDbId(id);
    try {
        const updatedUser = await User.findByIdAndUpdate(
            id, 
        {
            firstname: req?.body?.firstname, 
            lastname: req?.body?.lastname, 
            email: req?.body?.email, 
            mobile: req?.body?.mobile,
        },
        {
            new: true,        
        }
    );
    res.json(updatedUser);
    } catch (error) {
        throw new Error(error);
    }
});
// Block users

const blockUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const block = await User.findByIdAndUpdate(
            id,
        {
            isBlocked: true,
        },
        {
            new: true,
        }
    );
    res.json({
        message: "User Blocked", block
    });
    } catch (error) {
        throw new Error(error);
    }
});

//Unblocked a user
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const unblock = await User.findByIdAndUpdate(
            id,
    {
        isBlocked: false,
    },
    {
        new: true,
    }
);
res.json({
    message: "User Unblocked", unblock
});
} catch (error) {
    throw new Error(error);
}});

//Update or Change Password
const updatePassword = asyncHandler(async(req, res) => {
    const {id} = req.user;
    validateMongoDbId(id);
    const {password} = req.body;
    const user = await User.findById(id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json({
            message: "Password Updated",
            updatedPassword,
        });
    }else {
        res.json(user);
    }
});

//Generate Forgot Password Token
const forgotPasswordToken = asyncHandler(async(req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if (!user) throw new Error("No User Found");
    try {
        const token = await user.createPasswordResetToken();
        await user.save({validateBeforeSave: false});
        const resetUrl = `Hi, Please click on this link to reset your password, This link will be valid for 5 minutes: <a href='http://localhost:5000/api/user/reset-password/${token}' >Click Here</a>`;
        const data = {
            text: "Hey GAY person",
            to: email,
            subject: "Reset Password",
            htm: resetUrl,
        };
        sendEmail(data);
        res.json(token);
    } catch (error) {
        
    }
});

const resetPassword = asyncHandler(async(req, res) => {
    const {password} = req.body;
    const {token} = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: Date.now()
        },
    });
    if (!user) throw new Error("Token Expired, Try Again Later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});

module.exports = { 
    createUser, 
    loginUserCtrl, 
    getallUser, 
    getaUser, 
    deletedUser, 
    updatedUser, 
    blockUser, 
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword
};