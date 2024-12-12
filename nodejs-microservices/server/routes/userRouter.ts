import express from 'express';
import passport from 'passport';
import { Auth, googleStrategy, getUserData } from '../controller/userController.js';
import { authChecker } from '../middleware/authChecker.js';
import { Request, Response } from 'express';
import { generateAccessToken } from '../utils/generateTokens.js';

const router = express.Router();

router.post('/auth', Auth);
router.get('/user-data', );

googleStrategy();

// Route to initiate Google OAuth
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback route
router.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: false 
  }),
  (req: Request, res: Response) => {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
    
    const token = generateAccessToken((req.user as any).id, res);
    
    // Send HTML that closes itself and communicates with opener
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ token: '${token}' }, '${process.env.FRONTEND_URL}');
              window.close();
            }
          </script>
        </body>
      </html>
    `);
  }
);

router.get('/user-data', authChecker, getUserData);

export default router;