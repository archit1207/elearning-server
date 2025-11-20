import express from 'express';
import { loginUser, register, VerifyUser, myProfile  } from '../controllers/user.js';
import { isAuth } from '../middlewares/isAuth.js';


const userRoutes = express.Router();

userRoutes.post('/user/verify', VerifyUser);
userRoutes.post('/user/register', register);
userRoutes.post('/user/login', loginUser);
userRoutes.get('/user/me', isAuth, myProfile);

export default userRoutes;
