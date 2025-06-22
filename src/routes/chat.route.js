import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { getStreamToken } from '../controllers/chat.controller.js';

const router=express.Router();

const chatRoutes = () => {
    router.get('/token', protectRoute, getStreamToken);
    return router;
}

export default chatRoutes;