/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import Response from '../utils/response';
import { generateToken, generateVerifylink, verifyToken } from '../utils/token';
import userService from '../services/userServices';
import Password from '../utils/password';
import verifyEmailSender from '../utils/emails/sendVerifyEmail';

class Users {
  /**
   * Used to create a new user and send verification link.
   * @param {object} req .
   * @param {object} res .
   * @param {object} next  details.
   * @returns {object}.
  */
  async createUser(req, res, next) {
    try {
      const availableUser = await userService.findUser({ email: req.body.email });
      if (availableUser) Response.conflictError(res, 'User exists');
      req.body.verified = false;
      const password = new Password(req.body.password);
      const hashedPassword = await password.encryptPassword();
      req.body.password = hashedPassword;
      const user = await userService.createUser(req.body);
      if (user) {
        const url = generateVerifylink({ email: user.email, endpoint: 'verify' });
        verifyEmailSender.send({
          url,
          user: req.body.firstName,
          template: 'verifyEmail',
          subject: 'Wholsale Duuka Account Verification'
        }, req.body.email);
        Response.customResponse(res, 201, 'Check your inbox and verify account');
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * handles user login and generate token.
   * @param {object} req .
   * @param {object} res .
   * @param {object} next  details.
   * @returns {object}.
  */
  async loginUser(req, res, next) {
    if (!req.user) Response.authenticationError(res, 'Wrong Email and Password');
    if (!req.user.verified) Response.authorizationError(res, 'Account not verified');
    delete req.user.password;
    const token = generateToken(req.user);
    Response.customResponse(res, 200, 'User login succesfully', token);
  }

  /**
   * Used to verify new user.
   * @param {object} req .
   * @param {object} res .
   * @param {object} next  details.
   * @returns {object}.
  */
  async verifyUser(req, res, next) {
    try {
      const decoded = verifyToken(req.body.verifyToken);
      if (!decoded) Response.badRequestError(res, 'link expired');
      const user = await userService.findUser({ email: decoded.email });
      if (user.verified) Response.conflictError(res, 'User already verified');
      const [, [verifiedUser]] = await userService.updateUser(
        { verified: true }, { email: decoded.email }
      );
      if (verifiedUser.verified) Response.customResponse(res, 200, 'User verified sucessfully');
    } catch (error) {
      return next(error);
    }
  }

  /**
 * handles requests of a verification link.
 * @param {object} req .
 * @param {object} res .
 * @param {object} next  details.
 * @returns {object}.
*/
  async requestVerifyLink(req, res, next) {
    try {
      const user = await userService.findUser({ email: req.body.email });
      if (!user) Response.notFoundError(res, 'Usernot found');
      if (user.verified) Response.conflictError(res, 'User already verified');
      const url = generateVerifylink({ email: user.email, endpoint: 'verify' });
      verifyEmailSender.send({
        url, user: user.firstName, template: 'verifyEmail', subject: 'Wholsale Duuka Account Verification'
      }, user.email);
      Response.customResponse(res, 200, 'Check your inbox and verify account');
    } catch (error) {
      return next(error);
    }
  }

  /**
   /* Sends reset password email
   * @param {Object} req  request details.
   * @param {Object} res  response details.
   * @param {Object} next middleware details
   * @returns {Object}.
   */
  async requestPasswordReset(req, res, next) {
    const { email } = req.body;
    try {
      const user = await userService.findUser({ email });
      if (!user) {
        return Response.customResponse(
          res,
          200,
          'If the email is found, a Reset link will be sent to your email'
        );
      }
      const url = generateVerifylink({ email: user.email, endpoint: 'passwordReset' });
      verifyEmailSender.send({
        url, user: user.firstName, template: 'forgotPassword', subject: 'Wholesale Duuka Password Reset'
      }, user.email);
      return Response.customResponse(
        res,
        200,
        'If your email is found, a Reset link will be sent to you email',
        url
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * resets new password
   * @param {Object} req  request details.
   * @param {Object} res  response details.
   * @param {Object} next middleware details
   * @returns {Object}.
   */
  async resetPassword(req, res, next) {
    try {
      const decoded = verifyToken(req.body.verifyToken);
      const data = await userService.findUser({ email: decoded.email });
      if (!data || !decoded) {
        return Response.authenticationError(res, 'Forbidden Request');
      }
      if (req.body.password !== req.body.confirmPassword) {
        return Response.badRequestError(res, 'Passwords do not match re-type password');
      }
      const password = new Password(req.body.password);
      const hashedPassword = await password.encryptPassword();
      req.body.password = hashedPassword;
      const updatedUser = await userService.updateUser(
        {
          password: hashedPassword
        },
        { id: data.id }
      );
      return Response.customResponse(
        res,
        200,
        'Password has been sucessfully changed. Proceed to login'
      );
    } catch (error) {
      return next(error);
    }
  }
}

export default new Users();
