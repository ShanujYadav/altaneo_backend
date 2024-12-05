import { Router } from "express";
import { addDocument } from "../controllers/vendorFinancing.controller.js";

const router = Router()


router.route('/addDocument').post(addDocument)

// Secure Routes
// router.route('/logout').post(verifyUser, logoutEmp)

export default router