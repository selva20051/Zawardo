import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authChecker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json('Unauthorized');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!user) {
      return res.status(401).json('user not found');
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json('Unauthorized');
    console.error(error);
  }
};
