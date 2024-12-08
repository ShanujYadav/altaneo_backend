import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {  hmacVal } from "../utils/encryption.js";

const rateLimitCache = new Map();

export const headerVerify = asyncHandler(async (req, res, next) => {
    console.log('getHmac----', hmacVal())

    try {
        const reqHmac = req.header('reqHmac');
        const userAgent = req.header('userAgent');
        const ip = req.ip;
        const currentTime = Date.now();
        const windowMs = 60 * 1000;
        const maxRequests = 10;

        // Rate limit logic
        if (!rateLimitCache.has(ip)) {
            rateLimitCache.set(ip, { count: 1, startTime: currentTime });
        } else {
            const rateData = rateLimitCache.get(ip);
            if (currentTime - rateData.startTime < windowMs) {
                rateData.count += 1;
                if (rateData.count > maxRequests) {
                    return res.status(429).json(new ApiResponse(429, 'Too many requests. Try again later.'));
                }
            } else {
                rateLimitCache.set(ip, { count: 1, startTime: currentTime });
            }
        }

        if (!reqHmac || !userAgent) {
            return res.status(401).json(new ApiResponse(401, 'Empty Headers'));
        }

        if (hmacVal() !== reqHmac) {
            return res.status(401).json(new ApiResponse(401, 'Invalid reqHmac'));
        }

        if (userAgent !== 'ALTA') {
            return res.status(401).json(new ApiResponse(401, 'Invalid userAgent'));
        }

        next();
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message || 'Invalid Headers'));
    }
})