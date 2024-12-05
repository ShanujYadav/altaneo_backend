import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const allUsers = asyncHandler(async (req, res) => {
    const { appName, pid, ts, location, reqAction } = req.body.meta
    const { phone, password } = req.body.pay

    try {
        if (pid !== "ALTA" || appName !== 'Altaneo' || reqAction !== 'allUsers' || !ts) {
            return res.status(400).json(
                new ApiResponse(400, "Payload Meta Malformed !"))
        }
        if (!phone || !password) {
            return res.status(400).json(new ApiResponse(400, 'Payload Body Malformed !'))
        }

        if (!(phone == '9528492010' && password == '9528492010')) {
            return res.status(400).json(new ApiResponse(400, 'Invalied Admin !'))
        }

        const users = await User.find().select('-refreshToken');

        if (!users.length) {
            return res.status(404).json(new ApiResponse(404, 'No users found'))
        }
        return res.status(200).json(new ApiResponse('000', 'Users retrieved successfully', users))
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message))
    }
})

export { allUsers }