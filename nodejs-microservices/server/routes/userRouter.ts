import express from 'express';
import { Auth, getUsers, googleStrategy } from '../controller/userController.js';
import { generateAccessToken } from '../utils/generateTokens.js';
import passport from 'passport';

const router = express.Router();

// Initialize Google strategy
googleStrategy();

// Route to get all users
router.get('/', getUsers);

// Route for user authentication
router.post('/auth', Auth);

// Google OAuth route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        if (!req.user) {
            // Redirect to login if authentication fails
            return res.redirect('/login');
        }

        const user = req.user;
        const token = generateAccessToken(user.id, res); // Generate an access token for the user

        // Send token to the frontend securely via postMessage
        res.send(`
            <html>
                <body>
                    <script>
                        if (window.opener) {
                            // Send the token to the frontend using postMessage
                            window.opener.postMessage(
                                { token: '${token}' },
                                '${process.env.FRONTEND_URL}'
                            );
                            window.close();
                        } else {
                            // Fallback to redirecting to the frontend root if window.opener is unavailable
                            window.location.href = '${process.env.FRONTEND_URL}';
                        }
                    </script>
                </body>
            </html>
        `);
    }
);

export default router;
