import { User } from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import getDataUri from '../utils/dataUri.js';
import cloudinary from '../utils/cloudinary.js';

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        if (!fullname || !email || !password || !role || !phoneNumber) {
            return res.status(400).json({
                message: "Something is Missing",
                success: false
            })
        }
        const file = req.file;
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content)

        //check if user already exist with this email
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: "User already exist with this email",
                success: false
            })
        }

        // hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: cloudResponse.secure_url
            }
        })

        res.status(201).json({
            message: "Account created Succesfully.",
            success: true
        })

    } catch (error) {
        console.log(error);

    }
}

// now business logic for login

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is Missing",
                success: false
            })
        }
        // check if user exist
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password",
                success: false
            })
        }
        //compare password

        const isPasswordMatch = bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password",
                success: false
            })
        }

        //check whether role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "account does not exist with current role",
                success: false
            })
        }

        //generate token
        const tokenData = {
            userid: user._id,
        }
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' })

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: 'strict' }).json({
            message: `Welcome Back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);

    }
}


// business logic for logout
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged Out Succesfully",
            success: true
        })
    } catch (error) {
        console.log(error);

    }
}

// business logic for update profile

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, bio, skills, phoneNumber } = req.body;

        const file = req.file;
        const timestamp = Date.now();
        // const publicId = `${file.originalname.split('.')[0]}`;
        //cloudinary ayga idhr
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {

            allowed_formats: ['pdf'],
            folder: 'resume',
        });
        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");
        }
        const userId = req.id  // comes from middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User Not Found",
                success: false
            })
        }
        //updating data
        if (fullname) user.fullname = fullname
        if (email) user.email = email
        if (bio) user.profile.bio = bio
        if (skills) user.profile.skills = skillsArray
        if (phoneNumber) user.phoneNumber = phoneNumber

        //resume comes later here
        if (cloudResponse) {
            user.profile.resume = cloudResponse.secure_url//save the cloudinary url
            user.profile.resumeOriginalName = file.originalname//save the original filename
        }

        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message: "Profile Updated Successfully",
            user,
            success: true
        })
    } catch (error) {
        console.log(error);

    }
}