import express from 'express';
import usersRouter from './users';

const router = express.Router();
router.use('/auth', usersRouter);

router.use((err, req, res, next) => {
  if (err.name === 'JsonWebTokenError') {
    return res.status(400).json({
      status: 400,
      errors: "Server can't handle the request currently"
    });
  }

  return next(err);
});

module.exports = router;
