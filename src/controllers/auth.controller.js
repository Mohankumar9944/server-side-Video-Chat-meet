import User, { matchPassword } from "../models/User.js";
import jwt from 'jsonwebtoken';
import { createStreamUser } from '../lib/stream.js';

export async function signup(req, res) {
  const { email, fullName, password } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}`;

    const newUser = await User.create({
      email,
      fullname: fullName,
      password,
      profilePic: randomAvatar,
    });

    try {
        await createStreamUser({
            id: newUser.id.toString(),
            name: newUser.fullname,
            image: newUser.profilePic || "",
            role: "user",
        });
        console.log(`✅ Stream user created for ${newUser.fullname}`);
    } catch (error) {
        console.error("Stream user upsert failed:", error);
    }

    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie('jwt', token, {
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        secure: process.env.NODE_ENV === 'production' 
    })
    const { password: _, ...safeUser } = newUser.dataValues;
    return res.status(201).json({
      success: true,
      message: "Signup successful",
      user: safeUser,
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

export async function signin (req, res) {
  try {
    const { email, password } = req.body;
    if(!email || !password){
        return res.json({ message: "All fields are required" });
    }

    const user=await User.findOne({ where: {email} } );
    if(!user){
        return res.json({ message: "Invalid email or passowrd "});
    }

    const isPasswordCorrect= await matchPassword(password, user.password);
    if(!isPasswordCorrect){
        return res.json( {message: "Inavlid email or password"} );
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie('jwt', token, {
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        secure: process.env.NODE_ENV === 'production' 
    })
    const { password: _, ...safeUser } = user.dataValues;

    res.json({
        success: true,
        message: "Signin successful",
        user: safeUser,
    })
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
}

export function signout(req, res) {
  res.clearCookie('jwt' );
  return res.status(200).json({ success: true, message: "Successfully signed out" });
}

export async function onboard(req, res) {
    try{
        const userId=req.user.id;
        const {fullName, bio, nativeLanguage, learningLanguage, location}=req.body;
        if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location){
            return res.json({
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ].filter(Boolean),
            });
        }
        await User.update(
            {
                fullname: fullName,
                bio,
                nativeLanguage,
                learningLanguage,
                location,
                isOnboarded: true,
            },
            {
                where: { id: userId },
            }
        );
        const updatedUser = await User.findByPk(userId);


        if(!updatedUser){
            return res.json({ message: "User not found " });
        }

        try{
            await createStreamUser({
                id: updatedUser.id.toString(),
                name: updatedUser.fullname,
                image: updatedUser.profilePic || "",
            })
            console.log(`Stream user updated after onboarding for ${updatedUser.fullname}`);
        }catch(streamError){
            console.log("Error updating Stream user during onboarding:", streamError.message);
        }

        res.json({ success: true, user: updatedUser })
    }catch{
        console.error("Onboarding error:", error);
        res.status(500).json({ message: "Internal Server error" });
    }
}
