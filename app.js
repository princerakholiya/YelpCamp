if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}



const express = require('express')
const app =express()
//const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const Campground = require('./models/campground.js')
// befor routes created catchasync was here
const Review = require('./models/review.js')

const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const session=require('express-session')
const flash=require('connect-flash')
const passport=require('passport')
const LocalStrategy=require('passport-local')
const User=require('./models/user')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate);
app.set('view engine','ejs')
//app.set('views' , path.join(__dirname , 'viwes'))
app.use(express.urlencoded({extended :true}))
app.use(methodOverride('_method'))



const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
 

app.use(express.static('public'))


const sessionConfig={
    secret: 'blaablaablaa',
    resave: false,
    saveUninitialized:true,
    cookies:{
        httponly:true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }

}
app.use(session(sessionConfig))
app.use(flash()) 

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    console.log(req.session)
    res.locals.currentUser=req.user
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next()
})

app.get('/fakeUser' , async(req,res)=>{
    const user=new User({email:'prince@gmail.com' , username:'princeee'})
    const newUser=await User.register(user, 'chicken')
    res.send(newUser)
})

app.use('/',userRoutes )
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)


app.get('/', (req,res)=>{
      res.render('home')
})

//async function


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


app.listen(3000 , ()=>{
    console.log("on 3000")
})