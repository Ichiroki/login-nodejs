// import User from '../models/User'
import jwt from 'jsonwebtoken'
import { Prisma, PrismaClient } from '@prisma/client'
import { body, validationResult } from 'express-validator'

const prisma = new PrismaClient()

interface ValidationError{
  properties: {
    path: string
    message: string
  }
}

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    (Object.values(err.errors) as ValidationError[]).forEach((error: ValidationError) => {
      if(!errors[error.properties.path]) {
        errors[error.properties.path] = [error.properties.message]
      } else {
        errors[error.properties.path].push([error.properties.message])
      }
    })
  }

  return errors;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'jwt', {
    expiresIn: maxAge
  });
};

// controller actions
export const signup_get = (req, res) => {
  res.render('auth/signup', {
    active: 'Signup'
  });
}

export const login_get = (req, res) => {
  res.render('auth/login', {
    active: 'Login'
  });
}

export const signup_post = async (req, res) => {
  const {name, email, password, confPassword} = req.body

  const error = validationResult(req);

  if(!error.isEmpty()) {
    return res.status(400).json({errors: error.array()})
  }

  if(password !== confPassword) {
    return res.status(400).json({errors: error.array()})
  }

  try {
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        password,
      },
    })
    res.json(user)

    // const userId = '39dac1e3749e6034f6a61ddd0eff7d6c1c1c412a512ac3d0de477d788ff993de'
    // const token = createToken(userId)

    // res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
    // res.status(201).json({ user:userId });
  } catch(err) {
    console.log('Error ', err);
  }
}

export const login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    // const user = await User.login(email, password);
    // const token = createToken(user._id);
    // res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    // res.status(200).json({ user: user._id });
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}

export const logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
}

export default { signup_get, signup_post, login_get, login_post, logout_get }