import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
    try {
        const token=generateStreamToken(req.user.id);
        res.json({token});
    } catch (error) {
        console.log("Error in getStreamToken controller", error.message);
        res.json({message: "Internal Server Error"});
    }
}