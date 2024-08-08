import express from 'express';

import { createUser, getUserByEmail } from '../models/users';
import { authentication, random } from '../helpers';

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await getUserByEmail(email).select(
      '+authentication.salt +authentication.password',
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const expectedHash = authentication(user.authentication.salt, user.authentication.password);

    if (user.authentication.password === expectedHash) {
      return res.status(403).json({ message: 'Invalid credentials' });
    }

    const salt = random();
    user.authentication.sessionToken = authentication(salt, user._id.toString());

    await user.save();

    res.cookie('Token', user.authentication.sessionToken, { domain: 'localhost', path: '/' });

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body;

    console.log(req.body);

    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existinUser = await getUserByEmail(email);
    if (existinUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const salt = random();

    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
