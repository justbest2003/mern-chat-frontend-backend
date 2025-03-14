import express from "express";
const router = express.Router();
import { protectedRoute } from "../middlewares/auth.middleware.js";
import {
  getUsersForSidebar,
  sendMessage,
  getMessages,
} from "../controllers/message.controller.js";
import { checkFriendShip } from "../middlewares/friend.middleware.js";

router.get("/users", protectedRoute, getUsersForSidebar);
router.get("/:id", protectedRoute, getMessages);
router.post("/send/:id", protectedRoute, checkFriendShip, sendMessage);

export default router;
