import passport from "passport"
import local from 'passport-local'
import GithubStrategy from 'passport-github2'
import UserModel from "../dao/models/user.model.js"
import { createHash, isValidPassword } from "../utils.js"

const LocalStrategy = local.Strategy

const initializePassport = () => {
    passport.use('register', new LocalStrategy(
        {passReqToCallback: true, usernameField: 'email'}, async (req, username, password, done) => {
            try {
                const { first_name, last_name, email, age } = req.body
                if(!first_name || !last_name || !email || !age || !password ) return res.status(400).json({status: 'error', error: 'all fields must be filled'})

                const user = await UserModel.findOne({email: username})
                
                if(user) {
                    console.log('El usuario ya existe')
                    return done(null, false)
                }

                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password)
                }

                const result = await UserModel.create(newUser)
                return done(null, result)
            } catch (error) {
                return done('Error al obtener el usuario: ' + error)
            }
        }
    ))

    passport.use('login', new LocalStrategy({usernameField: 'email'}, async (username, password, done) => {
        try {
            if(username === 'adminCoder@coder.com' && password === 'adminCod3r123') {
                const admin = {
                    _id: '63e4ee6a795025c3ccb9b29a',
                    email: username,
                    password,
                    first_name: 'Admin',
                    last_name: 'Coder',
                    age: 38,
                    role: 'admin'
                }
                return done(null, admin)
            }
    
            const user = await UserModel.findOne({email: username})
            if(!user) {
                console.log("El usuario no Existe")
                return done(null, false)
            }
            if(!isValidPassword(user, password)) return done(null, false)
            
            return done(null, user)
        } catch(error) {
            return done(error)
        }
    }))

    passport.use('github', new GithubStrategy({
        clientID: 'Iv1.a921d6102a249409',
        clientSecret: '92c970321f572e81e1b4c19a40430aea1609d848',
        callbackURL: 'http://192.168.1.10:8080/api/sessions/githubcallback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await UserModel.findOne({email: profile._json.email})

            if(!user) {
                const newUser = {
                    first_name: profile._json.name,
                    last_name: '',
                    age: 0,
                    email: profile._json.email,
                    password: ''
                }
                
                const result = await UserModel.create(newUser)
                return done(null, result)
            }
            done(null, user)
        } catch(error) {
            return done(error)
        }
    }))
}

passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
    const user = await UserModel.findById(id)
    done(null, user)
})


export default initializePassport