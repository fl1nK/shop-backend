import express from 'express';
import { get, merge } from 'lodash';

import { getUserBySessionToken } from '../models/users';

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const { id } = req.params;
    console.log(id);

    const currentUserId = get(req, 'identity._id') as string;

    console.log(currentUserId);

    if (!currentUserId) {
      return res.status(401).json({ message: 'Not found current user' });
    }

    if (currentUserId.toString() !== id) {
      return res.sendStatus(403);
    }

    return next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const sessionToken = req.cookies['Token'];

    if (!sessionToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existinUser = await getUserBySessionToken(sessionToken);

    if (!existinUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    merge(req, { identity: existinUser });

    return next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
