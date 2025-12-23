import ratelimit from "../config/upstash.js";

export async function rateLimiter (req , res, next) {
    try {
        const {success} = await ratelimit.limit("my-rate-limit-key");

        if(!success){
            return res.status(429).json({Message: "Too many requests" , status: "failed"});
        }
        next();
    } catch (error) {
        console.error("Rate limiter error:", error);
        next(error);
    }
};