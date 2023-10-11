import express, { Request, Response } from 'express'
import authRoutes from './routes/authRoutes'
import cookieParser from 'cookie-parser'
// import { requireAuth, checkUser } from './middleware/authMiddleware'

const App = express()

// middleware
App.use(express.static('public'))
App.use(express.json())
App.use(cookieParser())

// view engine
App.set('view engine', 'ejs')

// , checkUser
// , requireAuth

// routes
App.get('*')
App.get('/', (req : Request, res : Response) => res.render('home', { active: 'Home' }))
App.get('/menu', (req : Request, res : Response) => res.render('menu', {active: 'Menu'}))
App.use(authRoutes)

App.listen(3000, () => {
   console.log(`Server is running on ${3000} : http://127.0.0.1:3000`)
})