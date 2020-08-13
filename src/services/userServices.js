/* eslint-disable no-useless-catch */
/* eslint-disable class-methods-use-this */
import database from '../database/models';

const { User } = database;
/** Class representing a User services. */
class UserService {

  /**
   * finds user by user data e.g, email, id, name
   * @param {string} param data to be used
   * @return {object} Oject of user if found
   */
  async findUser(param) {
    try {
      return await User.findOne({ where: param });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a new user.
   * @param {object} user The first number.
   * @returns {object} The User object.
  */
  async createUser(user) {
    try {
      return await User.create(user);
    } catch (error) {
      throw error;
    }
  }

  /**
   * change user password
   * @param {string} user data to be updated
   * @param {Object} param parameters to be checked against
   * @return {object} Oject of user if found
  */
  async updateUser(user, param) {
    try {
      return await User.update(user, {
        returning: true,
        where: [param]
      });
    } catch (error) {
      throw error;
    }
  }
}

const userService = new UserService()
export default userService;