import express from 'express'
import db from '../db.ts'
const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body;
        if (!username  || !password) {  
            return res.status(400).json({ error: 'Username and password are required' });
        }
        const [account] = await db.query('SELECT * FROM users WHERE username = ? AND Pass_word = ?',
            [username, password]) as any[];
            if (account.length === 0) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            res.json({ message: 'Login successful', status: "success"});

    } 
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;