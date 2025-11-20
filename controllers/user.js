import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendMail from '../middlewares/sendMail.js';
import tryCatch from '../middlewares/tryCatch.js';


export const register = tryCatch(async (req, res) => {
        const { email, name, password } = req.body;

        let user = await User.findOne({ email });

        if (user) return res.status(400).json({
            message: "User Already Exist",
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        user = {
            name,
            email,
            password: hashedPassword,
        }

        const otp = Math.floor(Math.random() * 1000000);
        // console.log(otp);

        const activationToken = jwt.sign({
            user,
            otp
        },
        process.env.Activation_Secret,
        {
            expiresIn: '7d',   
        }
    );

    const data = {
        name,
        otp,
    };

    await sendMail(
        email,
        "E-learning",
        data
    )

    res.status(200).json({
        message: "OTP send to your email",
        activationToken,
    });
});

export const VerifyUser = tryCatch(async (req, res) => {
    const {otp, activationToken} = req.body

    const verify = jwt.verify(activationToken, process.env.Activation_Secret)

    if(!verify) return res.status(400).json({
        message: "OTP Expired",
    });

    if(verify.otp !== otp) return res.status(400).json({
        message: "Invalid OTP",
    });

    await User.create({
        name: verify.user.name,
        email: verify.user.email,
        password: verify.user.password,
    })

    res.json({
        message: "User Registered",
    })
});

export const loginUser = tryCatch(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({email})

    if(!user) return res.status(400).json({
        message: "No User Found",
    });

    const mathPassword = await bcrypt.compare(password, user.password);

    if(!mathPassword) return res.status(400).json({
        message: "Invalid Password",
    });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_Secret,{
        expiresIn: "15d",
    });

    res.json({
        message: `Welcome Back ${user.name}`,
        token
    })
});

export const myProfile = tryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.status(200).json({ user });
});
