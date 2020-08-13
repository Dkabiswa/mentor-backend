/* eslint-disable no-unused-vars */
import express from 'express';
import Users from '../../controllers/userController';
import method from '../../utils/method';
import auth from '../../config/passport';

const router = express.Router();

router
  .route('/signup')
  .post(Users.createUser)
  .all(method);

router
  .route('/login')
  .post(auth.localAuth(), Users.loginUser)
  .all(method);

router
  .route('/verify')
  .post(Users.verifyUser)
  .all(method);

router
  .route('/verify-link')
  .post(Users.requestVerifyLink)
  .all(method);

router
  .route('/requestPasswordReset')
  .post(Users.requestPasswordReset)
  .all(method);

router
  .route('/resetPassword')
  .put(Users.resetPassword)
  .all(method);

export default router;
