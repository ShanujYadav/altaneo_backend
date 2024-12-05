import mongoose, { Schema } from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        bankStatement: {
            type: String,
            required: true,
        },
        copyOfAgreement: {
            type: String,
            required: true,
        },
        auditedFinancial: {
            type: String,
            required: true,
        },
        purchaseOrder: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
        uploadedAt: {
            type: String
        },
        docId: {
            type: String,
        },
    },
    { timestamps: true, _id: false }
)

const vendorFinancingSchema = new mongoose.Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        doc: {
            type: [documentSchema],
            required: true,
        },
    },
    { timestamps: true }
)

export const VendorFinancing = mongoose.model(
    "vendorFinancing",
    vendorFinancingSchema
);
