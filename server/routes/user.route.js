import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUserProfile,
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/userdata").get(isAuthenticated, getAllUsers);
router.delete("/userdata/:userId", isAuthenticated, deleteUser);
router
  .route("/profile/update")
  .put(isAuthenticated, upload.single("profilePhoto"), updateProfile);

export default router;
