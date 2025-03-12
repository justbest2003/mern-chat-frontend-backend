import express from "express";
const router = express.Router();
import {
  signup,
  signin,
  logout,
  updateProfile,
} from "../controllers/auth.controller.js";

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", logout);
router.put("/updateProfile", updateProfile);

export default router;
