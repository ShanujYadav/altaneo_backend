import { Router } from "express";
import { businessDetails, personalDetails } from "../controllers/user.controller.js";


const router = Router()

router.route('/personalDetails').post(personalDetails)
router.route('/businessDetails').post(businessDetails)


// Secure Routes
// router.route('/logout').post(verifyUser, logoutEmp)

export default router