import { Router } from "express"
import { allUsers } from "../controllers/admin.controller.js";

const router = Router()

router.route('/allUsers').post(allUsers)


export default router