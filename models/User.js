const mongoose = require ("mongoose");
const bcrypt = require ("bcrypts");
const validator = require ("validator");
const jwt = require ("jsonwebtoken");
const userSchema = new mongoose.Schema({
    name: {
       type: String,
       required: true,
       lowercase: true
     },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate( value ) {
            if( !validator.isEmail( value )) {
                 throw new Error( ‘Email is invalid’ )
                  }
                }
    tokens: [{
        token: {
        type: String,
        required: true
              }
            }],
     },
     password: {
        type: String,
        required: true,
        minLength: 7
    },
    timestamps: true
})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString()},      process.env.JWT_SECRET)
 user.tokens = user.tokens.concat({token})
    await user.save()
    return token
 }

 //login in users
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to log in')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    console.log(isMatch)
    if(!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//Hash plain password before saving
userSchema.pre('save', async function(next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model("User", userSchema)
module.exports = User