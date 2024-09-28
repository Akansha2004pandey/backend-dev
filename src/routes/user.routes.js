// src/routes/user.routes.js
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js"; // Ensure correct path and export

const router = Router();
console.log("problem");
router.route("/register").post(registerUser); 

export default router;
