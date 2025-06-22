import {StreamChat} from 'stream-chat';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret=process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("Stream API key or secret is missing");
}

const StreamClient=StreamChat.getInstance(apiKey, apiSecret);

export const createStreamUser = async (userData) => {
    try {
        await StreamClient.upsertUser(userData);
        return userData;
    } catch (error) {
        console.log("Error upserting Stream user: ", error);
    }
}

export const generateStreamToken = (userId) => {
    if (!userId) throw new Error("User ID is required to generate token.");
    try {
        const userIdStr=userId.toString();
        return StreamClient.createToken(userIdStr);

    } catch (error) {
        console.log('Error generating Stream token: ', error);
    }
};