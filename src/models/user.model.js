import mongoose, { Schema } from "mongoose"
import Jwt from "jsonwebtoken";
const jwt = Jwt;


const userSchema = new Schema({
    personalDetails: {
        name: { type: String, trim: true, index: true },
        phone: { type: String, required: true, unique: true, trim: true, },
        panNo: { type: String, unique: true, trim: true, index: true },
        DOB: { type: String, trim: true },
        pinCode: { type: String, trim: true },
        email: { type: String, lowercase: true, trim: true },
        panVerified: { type: Boolean, default: false },
    },
    businessDetails: {
        gstRegistred: { type: Boolean },
        gstNo: { type: String, trim: true, },
        businessType: { type: String, trim: true, },
        businessAge: { type: String, trim: true },
        businessPinCode: { type: String, trim: true },
        yearlySales: { type: String, trim: true },
        turnOver: { type: String, trim: true },
    },
    accessToken: {
        type: String,
    },
    refreshToken: {
        type: String,
    },
},
    { timestamps: true })


userSchema.methods.genrateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        phone: this.phone,
    },
        process.env.ACCESSTOKEN_KEY,
        {
            expiresIn: process.env.ACCESSTOKEN_EXPIRY
        }
    )
}


userSchema.methods.genrateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESHTOKEN_KEY,
        {
            expiresIn: process.env.REFRESHTOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model('user', userSchema)