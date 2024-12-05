import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { hmacVal } from "../utils/encryption.js";

const rateLimitCache = new Map(); // Simple in-memory cache for rate limiting

export const headerVerify = asyncHandler(async (req, res, next) => {
    try {
        const getHmac = req.header('reqHmac');
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

        if (!getHmac || !userAgent) {
            return res.status(401).json(new ApiResponse(401, 'Empty Headers'));
        }

        if (getHmac !== hmacVal) {
            return res.status(401).json(new ApiResponse(401, 'Invalid reqHmac'));
        }

        if (userAgent !== 'ALTA') {
            return res.status(401).json(new ApiResponse(401, 'Invalid userAgent'));
        }

        next();
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message || 'Invalid Headers'));
    }
});











// import { ApiResponse } from "../utils/ApiResponse.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { hmacVal } from "../utils/encryption.js";

// export const headerVerify = asyncHandler(async (req, res, next) => {
//     try {
//         const getHmac = req.header('reqHmac')
//         const userAgent = req.header('userAgent')

//         if (!getHmac || !userAgent) {
//             res.send(new ApiResponse(401, 'Empty Headers'))
//             return
//         }

//         if (getHmac !== hmacVal) {
//             res.send(new ApiResponse(401, 'Invalid reqHmac'))
//             return
//         }

//         if (userAgent !== 'ALTA') {
//             res.send(new ApiResponse(401, 'Invalid userAgent'))
//             return
//         }
//         next()
//     } catch (error) {
//         return res.status(500).json(new ApiResponse(500, error?.message || "Invalid  Headers"))
//     }
// }) 