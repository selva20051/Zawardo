import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { generateAccessToken } from '../utils/generateTokens.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { sendResponse } from '../utils/responseHelper.js';

const prisma = new PrismaClient();

export const Auth = async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  if (!email || !password) {
    return sendResponse(res, {
      success: false,
      error: 'Bad Request',
      message: 'Email and password are required',
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Login Flow
    if (existingUser) {
      const validPassword = await bcryptjs.compare(password, existingUser.password);
      
      if (!validPassword) {
        return sendResponse(res, {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid password',
        });
      }

      const token = generateAccessToken(existingUser.id, res);
      return sendResponse(res, {
        success: true,
        data: { 
          isNewUser: false, 
          authToken: token,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role
          }
        },
        message: 'Login successful',
      });
    }

    // Registration Flow
    if (!name) {
      return sendResponse(res, {
        success: false,
        error: 'Bad Request',
        message: 'Name is required for registration',
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'USER',
      },
    });

    const token = generateAccessToken(newUser.id, res);
    return sendResponse(res, {
      success: true,
      data: { 
        isNewUser: true, 
        authToken: token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      },
      message: 'Registration successful',
    });

  } catch (error) {
    console.error('Error in Auth controller:', error);
    return sendResponse(res, {
      success: false,
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const googleStrategy = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/users/auth/google/callback',
        passReqToCallback: true,
      },
      async (request, accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          if (existingUser) {
            return done(null, existingUser);
          }

          const newUser = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              password: '',
              role: 'USER',
            },
          });

          return done(null, newUser);
        } catch (error) {
          console.error('Error in Google strategy:', error);
          return done(error, null);
        }
      }
    )
  );
};

export const getUserData = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;

    if (!user) {
      return sendResponse(res, {
        success: false,
        error: 'Unauthorized',
        message: 'User not authorized',
      });
    }

    return sendResponse(res, {
      success: true,
      data: {
        userName: user.name,
        userEmail: user.email,
        userProfileImageLink: user.profilePicture,
      },
      message: 'User data fetched successfully',
    });
  } catch (error) {
    console.error('Error getting user data:', error);
    return sendResponse(res, {
      success: false,
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};
