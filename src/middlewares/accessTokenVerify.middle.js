import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import { hmacVal } from "../utils/encryption.js";
import { User } from "../models/user.model.js";

export const accessTokenVerify = asyncHandler(async (req, res, next) => {
    try {
        const reqHmac = req.header('reqHmac')
        const token = req.header('accessToken')
        const userAgent = req.header('userAgent')
        const segId = req.header('segId')

        if (!(token && reqHmac && userAgent && segId)) {
            return res.status(401).json(new ApiResponse(401, "Empty Headers !"))
        }
        if (reqHmac !== hmacVal) {
            return res.status(401).json(
                new ApiResponse(401, "Invalid reqHmac !")
            )
        }
        if (userAgent != "ALTA") {
            return res.status(401).json(
                new ApiResponse(401, "Invalid userAgent!")
            )
        }

        const decodedToken = jwt.verify(token, process.env.ACCESSTOKEN_KEY)

        if (segId !== decodedToken?._id) {
            return res.status(401).json(new ApiResponse(401, "Invalid SegId or Access Token !"))
        }

        const user = await User.findById(decodedToken?._id).select('-refreshToken')

        if (!user) {
            return res.status(401).json(new ApiResponse(401, "Invalid Access Token"))
        }
        
        req.user = user
        next()
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message || "Invalid  Headers"))
    }
})