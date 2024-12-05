import { Router } from "express";
import { sendOtp, verifyOtp } from "../controllers/login.controller.js";


const router = Router()

router.route('/sendOtp').post(sendOtp)
router.route('/verifyOtp').post(verifyOtp)


// Secure Routes
// router.route('/logout').post(verifyUser, logoutEmp)

export default router