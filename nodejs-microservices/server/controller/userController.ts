import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { generateAccessToken } from '../utils/generateTokens.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const prisma = new PrismaClient();

// Auth Controller
export const Auth = async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;

    try {
        // Check if user exists in the database
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        // If user exists, handle login
        if (existingUser) {
            const validPassword = await bcryptjs.compare(password, existingUser.password);

            if (validPassword) {
                // Generate token and send success response
                const token = generateAccessToken(existingUser.id, res);
                return res.status(200).json({
                    isNewUser: false,
                    invalidPassword: false,
                    token,
                });
            } else {
                // Invalid password response
                return res.status(401).json({
                    isNewUser: false,
                    invalidPassword: true,
                    token: null,
                });
            }
        }

        // If user doesn't exist and `name` is provided, register the user
        if (!existingUser && name) {
            const hashedPassword = await bcryptjs.hash(password, 10); // Hash the password
            const newUser = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    role: role || "USER", // Default role is USER
                },
            });

            // Generate token and send success response for new user
            const token = generateAccessToken(newUser.id, res);
            return res.status(201).json({
                isNewUser: true,
                invalidPassword: false,
                token,
            });
        }

        // If user doesn't exist but no `name` provided, prompt for registration
        return res.status(404).json({
            isNewUser: true,
            invalidPassword: false,
            token: null,
        });


    } catch (error) {
        console.error("Error in Auth controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getUsers = async (req: Request, res: Response) => {

    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(400).json(error);
        console.error(error);
    }
}

export const googleStrategy = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/users/google/callback",  // Make sure this matches your redirect URI
        passReqToCallback: true,
    }, async (request, accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { googleId: profile.id },
            });

            if (existingUser) {
                return done(null, existingUser); // User exists, return the user
            }

            // Create a new user if not found
            const newUser = await prisma.user.create({
                data: {
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    password: '',  // Google auth users don't need a password
                    role: 'USER',  // Default role
                },
            });

            return done(null, newUser); // Return the newly created user
        } catch (error) {
            console.error('Error in Google strategy:', error);
            return done(error, null);
        }
    }));
};