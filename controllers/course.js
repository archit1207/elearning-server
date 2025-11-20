import { instance } from "../config/razorpay.js";
import tryCatch from "../middlewares/tryCatch.js"
import Courses from "../models/Courses.js"
import { Lecture } from "../models/Lecture.js"
import User from '../models/user.js'
import crypto from 'crypto'
import { Payment } from "../models/Payment.js"


export const getAllCourses = tryCatch(async (req, res) => {
    const courses = await Courses.find();
    res.json({
        courses,
    });
});

export const getSingleCourse = tryCatch(async (req, res) => {
    const course = await Courses.findById(req.params.id)
    res.json({
        course,
    });
});

export const fetchLectures = tryCatch(async (req, res) => {
    const lectures = await Lecture.find({ course: req.params.id })

    const user = req.user;

    if (user.role === "admin") {
        return res.json({
            lectures
        });
    }

    if (!user.subscription.includes(req.params.id))
        return res.status(400).json({
            message: "You have not Subscribed to this Course"
        });

    res.json({
        lectures
    });
});

export const fetchLecture = tryCatch(async (req, res) => {
    const lecture = await Lecture.findById(req.params.id);

    const user = req.user;

    if (user.role === "admin") {
        return res.json({
            lecture
        });
    }

    if (!user.subscription.includes(lecture.course))
        return res.status(400).json({
            message: "You have not Subscribed to this Course"
        });

    res.json({ lecture });
});

export const getMyCourses = tryCatch(async (req, res) => {
    const courses = await Courses.find({
        _id: { $in: req.user.subscription }
    });


    res.json({
        courses,
    });
});

export const checkout = tryCatch(async (req, res) => {
    const user = await User.findById(req.user._id);
    const course = await Courses.findById(req.params.id);

    if (user.subscription.includes(course._id)) {
        return res.status(400).json({
            message: "You have Already Subscribed this Course"
        });
    }

    const options = {
        amount: course.price * 100,
        currency: "INR",
    };

    const order = await instance.orders.create(options);

    res.status(200).json({ order, course });
});

// verification
export const paymentVerification = tryCatch(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body)
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
        return res.status(400).json({ message: "Payment Failed" });
    }

    await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    });

    const user = await User.findById(req.user._id);
    const course = await Courses.findById(req.params.id);

    user.subscription.push(course._id);
    await user.save();

    res.status(200).json({ message: "Course Purchased Successfully" });
});
