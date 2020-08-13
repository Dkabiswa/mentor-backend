/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
import passport from 'passport';
import passportJWT from 'passport-jwt';
import passportLocal from 'passport-local';
import userService from '../services/userServices';
import Password from '../utils/password';

class Auth {
  /**
   * intializes passport
   * @returns {function} .
  */
  intialize() {
    return passport.initialize();
  }

  /**
   * intializes passport strategies
   * @returns {function} .
  */
  config() {
    this.localConfig();
    this.jwtConfig();
  }

  /**
   * jwt strategy passport middleware
   * @returns {function} .
  */
  authorize() {
    return passport.authenticate('jwt', { session: false });
  }

  /**
   * local strategy passport middleware
   * @returns {function} .
  */
  localAuth() {
    return passport.authenticate('local', { session: false });
  }

  /**
   * configures local strategy.
   * @returns {function}
  */
  localConfig() {
    const { Strategy } = passportLocal;
    const strategy = new Strategy({
      usernameField: 'email',
      passwordField: 'password',
    }, async (email, password, done) => {
      try {
        const user = await userService.findUser({ email });
        if (!user) return done(null, false);
        const isRightPassword = await Password.checkPasswordMatch(password, user.password);
        if (!isRightPassword) return done(null, false);
        return done(null, user);
      } catch (error) {
        console.log(error);
        return done(error);
      }
    });
    passport.use(strategy);
  }

  /**
   * configures jwt strategy.
   * @returns {function}
  */
  jwtConfig() {
    const { ExtractJwt } = passportJWT;
    const params = {
      secretOrKey: process.env.TOKEN,
      jwtFromRequest: ExtractJwt.fromHeader('authorization')
    };
    const { Strategy } = passportJWT;
    const strategy = new Strategy(params, async (payload, done) => {
      try {
        const user = await userService.findUser({ id: payload.id });
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    });
    passport.use(strategy);
  }
}

const auth = new Auth();
export default auth;
