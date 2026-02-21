import express from "express";
import { login, logout } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login",login);
router.post("/logout",logout);
//router.post("/updateprofile",updateprofile);

router.get("/me", protectRoute, (req, res) => {
  res.status(200).json(req.user);
});

export default router;
