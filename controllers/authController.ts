// import User from '../models/User'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import { UserValidate } from '../validation/userRequest'
import flash from 'connect-flash'


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
  return jwt.sign({ id }, 'access', {
    expiresIn: maxAge
  });
};

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt()
  const hash = await bcrypt.hash(password, salt)

  return hash
}

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
  const {name, email, password} = req.body

  const pw = await hashPassword(password)
  const validationError = UserValidate.parse({name, email, password})

  if(validationError) {
    return res.render('signup')
  }

  try {
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID().toString(),
        name,
        email,
        password: pw,
      },
    })
    res.json(user)

    req.flash('success', 'Registration Successfully');
    res.redirect('/login')
  } catch(err) {
    console.log('Error ', err);
  }
}

export const login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = prisma.users.findUnique({
      where: {
        email,
        password
      }
    })
    const passwordMatch = await bcrypt.compare(password, user['password'])

    if(user) {
      if(passwordMatch) {
        const token = jwt.sign(user['id'], 'access', {expiresIn : '1h'})
        res.json({token})
      }
      return res.status(401).json({ error: 'Email atau password salah' })
    }
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}

export const logout_get = (req, res) => {
  res.cookie('access', '', { maxAge: 1 });
  res.redirect('/');
}

export default { signup_get, signup_post, login_get, login_post, logout_get }