import axios from "axios";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Lead } from "../models/lead.model.js";
import { genrateMobHash, verifyMobHash } from "../utils/encryption.js";



const genrateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.genrateAccessToken()
        const refreshToken = user.genrateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, "Something went wrong !",))
    }
}







const sendOtp = asyncHandler(async (req, res) => {
    const { appName, pid, ts, location, reqAction } = req.body.meta
    const { phone } = req.body.pay

    try {
        if (pid !== "ALTA" || appName !== 'Altaneo' || reqAction !== 'sendOtp' || !ts) {
            return res.status(400).json(
                new ApiResponse(400, "Payload Meta Malformed !"))
        }
        if (!phone || phone.length !== 10) {
            return res.status(400).json(new ApiResponse(400, 'Invalied Phone Number !'))
        }

        const existedUser = await User.findOne({ 'personalDetails.phone': phone })
        if (existedUser) {
            const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(existedUser._id)

            const loggedInUser = existedUser.toObject();
            delete loggedInUser.refreshToken;

            const options = {
                httpOnly: true,
                secure: true
            }
            return res.status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(new ApiResponse(
                    '000', "User Logged In !", {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },))
        }

        // ----------------------Create Entry in lead Table if not find in user Table-------------------------
        const lead = await Lead.create({
            phone,
            ts,
            reqAction,
            location
        })


        // ------------------------- logic for send otp ---------------------------
        const otp = Math.floor(1000 + Math.random() * 9000)

        const body = JSON.stringify({
            apikey: process.env.MTALKZ_APIKEY,
            senderid: process.env.MTALKZ_SENDERID,
            number: phone,
            message: `Your OTP- One Time Password is ${otp} to authenticate your login with ${otp} Powered By mTalkz`,
            format: "json"
        })

        // const otpResponse = await axios.post(process.env.MTALKZ_BASEURL, body, {
        //     headers: {
        //         'Content-Type': 'application/json'
        //     }
        // })
        // if (otpResponse.data.status !== 'OK') {
        //     return res.status(400).json(new ApiResponse(400, otpResponse.data.message))
        // }

        const input = phone + otp
        const mobHash = genrateMobHash(input)

        const visible = phone.slice(-4)
        const maskedPhone = `*******${visible}`

        return res.status(200).json(new ApiResponse('000', `Otp sent Successfully on ${maskedPhone}!`, { mobHash, otp, phone }))
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message))
    }
})












const verifyOtp = asyncHandler(async (req, res) => {
    const { appName, pid, ts, location, clientIp, reqAction } = req.body.meta
    const { phone, otp, mobHash } = req.body.pay
    try {
        if (pid !== "ALTA" || appName !== 'Altaneo' || reqAction !== 'verifyOtp' || !ts) {
            return res.status(400).json(
                new ApiResponse(400, "Payload Meta Malformed !"))
        }
        if ([phone, otp, mobHash].some((field) =>
            field?.trim() === '')
        ) {
            return res.status(400).json(new ApiResponse(400, "Payload Body Malformed !"))
        }

        if (!(phone.length == 10 && otp.length == 4)) {
            return res.status(401).json(new ApiResponse(401, 'Invalied Credentials !'))
        }

        const decodedToken = verifyMobHash(mobHash)
        if (!decodedToken) {
            return res.status(401).json(new ApiResponse(401, 'Timed Out, Please genrate a new OTP !'))
        }

        const payload = decodedToken.data
        const decodedPhone = payload.slice(0, 10);
        const decodedOtp = payload.slice(-4)

        if (!(otp == decodedOtp && phone == decodedPhone)) {
            return res.status(401).json(new ApiResponse(401, 'Invalied OTP or Phone Number !'))
        }


        //-------------------------After Verify Phone and Otp Create Entry in User table--------------------
        const newUser = new User({
            personalDetails: { phone }
        })
        const savedUser = await newUser.save()

        const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(savedUser._id)
        const loggedInUser = await User.findById(savedUser._id).select("-refreshToken")

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(
                '000', "Otp Verified SuccessFully !", {
                user: loggedInUser,
                accessToken,
                refreshToken
            },))


    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message))
    }
})

export { sendOtp, verifyOtp }