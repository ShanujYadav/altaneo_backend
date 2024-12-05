import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const personalDetails = asyncHandler(async (req, res) => {
    const { pid, appName, ts, reqAction, clientIp, userId } = req.body.meta
    const { name, panNo, DOB, email, pinCode, phone } = req.body.pay

    try {
        if (!(pid === 'ALTA' && appName === "Altaneo" && reqAction === 'personalDetails' && userId)) {
            return res.status(400).json(
                new ApiResponse(400, "Payload meta Malformed !"))
        }
        if ([name, panNo, DOB, email, pinCode, phone].some((field) => field?.trim() === '')) {
            return res.status(400).json(new ApiResponse(400, "Payload body Malformed !"))
        }

        // -----------------Verify User details from PAN CARD ----------------------- 
        const dummyName = 'Shanuj Yadav'
        const dummyDOB = '15-01-2004'

        if (!(dummyDOB === DOB && dummyName === name)) {
            return res.status(401).json(new ApiResponse(401, "Provided Details are Not align with PAN CARD !"))
        }


        //-----------------If verified with PAN then save into User table -------------------
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                'personalDetails.name': name,
                'personalDetails.panNo': panNo,
                'personalDetails.DOB': DOB,
                'personalDetails.email': email,
                'personalDetails.pinCode': pinCode,
                'personalDetails.panVerified': true,
            },
            { new: true, runValidators: true }
        ).select('-refreshToken');

        if (!updatedUser) {
            return res.status(404).json(new ApiResponse(404, 'User not found'))
        }

        return res.status(200).json(new ApiResponse('000', "User Verified With PAN !", updatedUser))
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message))
    }
})

const businessDetails = asyncHandler(async (req, res) => {
    const { pid, appName, ts, reqAction, clientIp, userId } = req.body.meta
    const { gstRegistered, gstNo, businessType, businessAge, businessPinCode, yearlySales, turnOver, } = req.body.pay
    try {
        if (!(pid === 'ALTA' && appName === "Altaneo" && reqAction === 'businessDetails' && userId)) {
            return res.status(400).json(new ApiResponse(400, "Payload Meta  Malformed !"))
        }

        if (!(gstRegistered && gstNo && businessType && businessAge && businessPinCode && yearlySales && turnOver)) {
            return res.status(400).json(new ApiResponse(400, "Payload Body Malformed !"))
        }
        //-----------------------Verify GST NO---------------------------


        // --------------------Store details in User table----------------------
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                'businessDetails.gstRegistred': gstRegistered,
                'businessDetails.gstNo': gstNo,
                'businessDetails.businessType': businessType,
                'businessDetails.businessAge': businessAge,
                'businessDetails.businessPinCode': businessPinCode,
                'businessDetails.yearlySales': yearlySales,
                'businessDetails.turnOver': turnOver,
            },
            { new: true, runValidators: true }
        ).select('-refreshToken');

        if (!updatedUser) {
            return res.status(404).json(new ApiResponse(404, 'User not found !'))
        }

        return res.status(200).json(new ApiResponse('000', "Business Details Submited !", updatedUser))
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message))
    }
})

export { personalDetails, businessDetails }