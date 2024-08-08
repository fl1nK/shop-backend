import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import env from 'dotenv';
env.config();

import router from './router';

const app = express();

app.use(cors({ credentials: true }));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(process.env.PORT || 5000);
    console.log('DB connected and server is running on port ' + process.env.PORT);
  })
  .catch((err) => {
    console.log(err);
  });

app.use('/', router());
