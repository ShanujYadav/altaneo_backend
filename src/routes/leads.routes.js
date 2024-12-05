import { Router } from "express"
import { allLeads, contactUs } from "../controllers/leads.controller.js";

const router = Router()

router.route('/allLeads').post(allLeads)
router.route('/contactUs').post(contactUs)


export default router