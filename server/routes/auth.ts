import express, { Request, Response } from 'express';
import User from '../models/User'.default;
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password }: { username: string; email: string; password: string } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email già in uso' });
      return;
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: false,
    });

    await user.save();

    res.status(201).json({ message: 'Registrazione completata con successo', user });
  } catch (error) {
    console.error('Errore durante la registrazione:', error.message);
    res.status(500).json({ error: 'Errore durante la registrazione' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ error: 'Utente non trovato' });
      return;
    }

    const isPasswordValid: boolean = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Password non valida' });
      return;
    }

    req.session.userId = user._id;
    req.session.isAdmin = user.isAdmin;

    res.json({ message: 'Login riuscito', user });
  } catch (error) {
    console.error('Errore nel login:', error);
    res.status(500).json({ error: 'Errore durante il login' });
  }
});

router.post('/logout', (req: Request, res: Response): void => {
  req.session.destroy((err?: Error): void => {
    if (err) {
      res.status(500).json({ error: 'Errore durante il logout' });
      return;
    }
    
    res.json({ message: 'Logout completato' });
  });
});

router.get('/status', (req: Request, res: Response): void => {
  if (req.session && req.session.userId) {
    res.json({
      isLoggedIn: true,
      isAdmin: req.session.isAdmin || false,
    });
  } else {
     res.json({ isLoggedIn: false, isAdmin: false });
  }
});

export default router;