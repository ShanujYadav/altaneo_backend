import { Lead } from "../models/lead.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const allLeads = asyncHandler(async (req, res) => {
    const { appName, pid, ts, location, reqAction } = req.body.meta
    const { phone, password } = req.body.pay

    try {
        if (pid !== "ALTA" || appName !== 'Altaneo' || reqAction !== 'allLeads' || !ts) {
            return res.status(400).json(
                new ApiResponse(400, "Payload Meta Malformed !"))
        }
        if (!phone || !password) {
            return res.status(400).json(new ApiResponse(400, 'Payload Body Malformed !'))
        }

        if (!(phone == '9528492010' && password == '9528492010')) {
            return res.status(400).json(new ApiResponse(400, 'Invalied User '))
        }
        const leads = await Lead.find(); 
        
        if (!leads.length) {
          return res.status(404).json(new ApiResponse(404, 'No leads found'))
        }
        return res.status(200).json(new ApiResponse('000', 'Leads retrieved successfully', leads ))
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message))
    }
})


const contactUs = asyncHandler(async (req, res) => {
    const { appName, pid, ts, location, reqAction } = req.body.meta
    const { phone, message,name } = req.body.pay

    try {
        if (!(pid == "ALTA" && appName == 'Altaneo' && reqAction == 'contactUs' && ts && location)) {
            return res.status(400).json(
                new ApiResponse(400, "Payload Meta Malformed !"))
        }
        if (!phone || !message || !name) {
            return res.status(400).json(new ApiResponse(400, 'Please Fill All Fields !'))
        }

        const lead = await Lead.create({
            phone,
            ts,
            reqAction,
            location,
            message,
            name
        })        

        return res.status(200).json(new ApiResponse('000', 'Thank You Our team will Contact You Soon', lead ))
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message))
    }
})



export { allLeads,contactUs}