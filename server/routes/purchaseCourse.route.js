import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createCheckoutSession,
  getAllPurchasedCourse,
  getCourseDetailWithPurchaseStatus,
  verifyPayment,
  razorpayWebhook,   // import new webhook handler
} from "../controllers/coursePurchase.controller.js";

const router = express.Router();

router.route("/checkout/create-checkout-session").post(isAuthenticated, createCheckoutSession);
router.route("/course/:courseId/detail-with-status").get(isAuthenticated, getCourseDetailWithPurchaseStatus);
router.post("/payment/verify", isAuthenticated, verifyPayment);

// Razorpay webhook should be raw body parser (to verify signature)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),  // IMPORTANT: raw body required
  razorpayWebhook
);

router.route("/").get(isAuthenticated, getAllPurchasedCourse);

export default router;
