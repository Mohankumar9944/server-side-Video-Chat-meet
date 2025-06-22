import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { onboard, signin, signout, signup } from '../controllers/auth.controller.js';

const router=express.Router();

const authRoutes = () => {
    router.post("/signup", signup);

    router.post("/signin", signin);

    router.post("/signout", signout);

    router.post("/onboarding", protectRoute, onboard);

    router.get("/me", protectRoute, (req, res) => {
        res.json({ success: true, user: req.user})
    })
    return router;
}

export default authRoutes;