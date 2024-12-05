import { Lead } from "../models/lead.model.js";
import { User } from "../models/user.model.js";
import { VendorFinancing } from "../models/vendorFinancing.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from 'mongoose';


const addDocument = asyncHandler(async (req, res) => {
    const { pid, appName, ts, reqAction, clientIp, userId } = req.body.meta
    const { bankStatement, copyOfAgreement, auditedFinancial, purchaseOrder, phone } = req.body.pay

    try {
        if (!(pid === 'ALTA' && appName === "Altaneo" && reqAction === 'addDocument' && userId && ts)) {
            return res.status(400).json(new ApiResponse(400, "Payload Meta Malformed!"));
        }
        if ([bankStatement, copyOfAgreement, auditedFinancial, purchaseOrder].some((field) => !field?.trim())) {
            return res.status(400).json(new ApiResponse(400, "Payload body Malformed!"));
        }

        const newDocument = {
            bankStatement,
            copyOfAgreement,
            auditedFinancial,
            purchaseOrder,
            docId: new mongoose.Types.ObjectId().toString(),
            uploadedAt: ts,
        }

        let user=await User.findById(userId)

        if(!user){
            return res.status(400).json(new ApiResponse(400, "User does not Exist !"));
        }

        // Find vendor financing by userId
        let vendor = await VendorFinancing.findOne({ userId })

        if (!vendor) {
            // If vendor doesn't exist, create a new entry
            vendor = new VendorFinancing({
                userId,
                doc: [newDocument],
            })
            await vendor.save();
            
            const result = await Lead.deleteMany({
                phone,
                reqAction: 'sendOtp',
            })

            if (result.deletedCount === 0) {
                console.log(`No leads found with phone: ${phone} and reqAction: 'sentOtp'.`);
            }
            
            return res.status(200).json(new ApiResponse('000', "Doc Uploaded !", vendor));
        } else {
            // Ensure no document is re-uploaded within 24 hours
            const lastUploadedDoc = vendor.doc.slice(-1)[0] 

            // const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            const oneDayInMs = 60 * 1000; // 1 minute in milliseconds

            if (lastUploadedDoc && new Date() - new Date(lastUploadedDoc.createdAt) < oneDayInMs) {
                return res.status(400).json(new ApiResponse(400, "Document upload is allowed only once in 24 hours."));
            }

            // Add new document to the existing vendor 
            vendor.doc.push(newDocument);
            await vendor.save()


            // ------------delete leads of this number--------------------
            const result = await Lead.deleteMany({
                phone,
                reqAction: 'sendOtp',
            })

            console.log('result---', result)

            if (result.deletedCount === 0) {
                console.log(`No leads found with phone: ${phone} and reqAction: 'sentOtp'.`);
            }
            console.log(`Lead with phone: ${phone} deleted successfully.`);
        }

        return res.status(200).json(new ApiResponse('000', "Doc Uploaded !", vendor));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message))
    }
})

export { addDocument }