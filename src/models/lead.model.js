import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    ts: {
        type: String,
        required: true,
        trim: true
    },
    reqAction: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
    },
    message: {
        type: String,
    },
    location: {
        type: String,
        required: true,
    },
}, { timestamps: true });

export const Lead = mongoose.model("lead", leadSchema)