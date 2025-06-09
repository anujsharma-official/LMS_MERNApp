import Razorpay from "razorpay";
import crypto from "crypto";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import { log } from "console";

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id; // Assuming middleware adds user info
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    const amountInPaise = course.coursePrice * 100;

    const order = await instance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcptid-${Math.floor(Math.random() * 10000)}`,
      notes: {
        courseId: courseId,
        userId: userId.toString(),
        courseTitle: course.courseTitle,
        courseThumbnail: course.courseThumbnail,
      },
    });

    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
      orderId: order.id,
    });

    await newPurchase.save();

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate("creator")
      .populate("lectures");

    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    // Check for purchase with status "completed"
    const purchase = await CoursePurchase.findOne({
      userId,
      courseId,
      status: "completed",
    });

    return res.status(200).json({
      course,
      purchased: !!purchase, // true only if purchase exists AND status is completed
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    console.log(
      "RAZORPAY_KEY_SECRET:",
      process.env.RAZORPAY_KEY_SECRET ? "Loaded" : "Missing"
    );

    console.log("Received from Razorpay:", {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
    });

    console.log("Looking for orderId in DB:", razorpay_order_id);

    // 1️⃣ Validate signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    console.log(generated_signature);

    if (generated_signature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // 2️⃣ Update purchase status to completed
    const purchase = await CoursePurchase.findOne({
      orderId: razorpay_order_id,
    });
    if (!purchase) {
      console.log("Purchase not found for orderId:", razorpay_order_id);
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }

    purchase.status = "completed";
    purchase.paymentId = razorpay_payment_id;
    await purchase.save();

    // 3️⃣ Enroll user in course
    await User.findByIdAndUpdate(
      purchase.userId,
      { $addToSet: { enrolledCourses: purchase.courseId } },
      { new: true }
    );

    await Course.findByIdAndUpdate(
      purchase.courseId,
      { $addToSet: { enrolledStudents: purchase.userId } },
      { new: true }
    );

    // Don't unlock all lectures globally by setting isPreviewFree
    // Instead, check purchase status on frontend/backend when user tries to access

    return res.status(200).json({ success: true, message: "Payment verified" });
  } catch (error) {
    console.error("Verification error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
export const razorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const webhookBody = JSON.stringify(req.body);
  const signature = req.headers["x-razorpay-signature"];

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(webhookBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    return res.status(400).send("Invalid signature");
  }

  const event = req.body;

  if (event.event === "payment.captured") {
    try {
      const paymentId = event.payload.payment.entity.id;
      const orderId = event.payload.payment.entity.order_id;

      const purchase = await CoursePurchase.findOne({ orderId });
      if (!purchase) {
        return res.status(404).send("Purchase not found");
      }

      purchase.status = "completed";
      purchase.paymentId = paymentId;
      await purchase.save();

      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId } },
        { new: true }
      );

      await Course.findByIdAndUpdate(
        purchase.courseId,
        { $addToSet: { enrolledStudents: purchase.userId } },
        { new: true }
      );

      // Again, no global isPreviewFree changes here

      return res.status(200).send("Webhook processed");
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).send("Internal Server Error");
    }
  }

  return res.status(200).send("Event ignored");
};
export const getAllPurchasedCourse = async (_, res) => {
  try {
    const purchasedCourse = await CoursePurchase.find({
      status: "completed",
    }).populate("courseId");

    if (purchasedCourse.length === 0) {
      return res.status(404).json({
        purchasedCourse: [],
        message: "No completed purchases found",
      });
    }

    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    return res.status(500).json({
      message: "Internal Server Error!!",
    });
  }
};

