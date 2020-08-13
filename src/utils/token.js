import jwt from 'jsonwebtoken';

export const generateToken = (data, expiresIn) => {
  const options = expiresIn ? { expiresIn } : undefined;
  const token = jwt.sign(
    {
      id: data.id,
      email: data.email,
      firstName: data.firstName,
      accountType: data.accountType,
      lastName: data.lastName
    },
    process.env.TOKEN,
    options
  );
  return token;
};

export const generateVerifylink = (data) => {
  const token = generateToken({ email: data.email }, '1hr');
  return `${process.env.FRONTENDURL}/${data.endpoint}?code=${token}`;
};

export const verifyToken = (token) => {
  const decoded = jwt.verify(token, process.env.TOKEN);
  return decoded;
};
