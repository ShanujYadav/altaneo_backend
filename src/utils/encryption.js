import { createHash, createHmac } from "crypto-browserify"
import { ymd } from "./metaData.js"
import jwt from 'jsonwebtoken';


const pid = process.env.PID
const hmacKey = process.env.HMACKEY
const secretKey = process.env.SECRETKEY


export const genrateMobHash = (payload) => {
    const expiresIn = "5m"
    return jwt.sign({ data: payload }, secretKey, { expiresIn });
}

export const verifyMobHash = (token) => {
    try {
        const decoded = jwt.verify(token, secretKey)
        return decoded
    } catch (error) {
        return null;
    }
}


export const SHA256 = (input) => {
    const hash = createHash('sha256').update(input, 'utf-8').digest('hex');
    return hash.toUpperCase()
}


const getHmac = (pid, ymd) => {
    const value = pid.toString().concat(ymd)
    var hmac = createHmac("sha256", hmacKey).update(value).digest("hex")
    return hmac.toString("base64")
}


const hmacVal = getHmac(pid, ymd)
export { hmacVal }