const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        require: true
    },

    email : {
        type : String,
        require: true
    },

    phone : {
        type : String,
        require: true
    },

    password : {
        type : String,
        require: true
    },

    isAdmin : {
        type : Boolean,
        default : false
    }
});

userSchema.methods.genrateToken = async function(){
    try{
        return jwt.sign(
            { 
                userId : this._id.toString(), email : this.email, isAdmin : this.isAdmin 
            }, 
            process.env.JWT_SIGNATURE,
            {
                expiresIn : '1h'
            }
        )
    }catch(error){
        console.log(error);
    }
};

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.pre('save', async function(next){
    const user = this;

    if(!user.isModified('password')){
        next();
    }

    try{
        const saltRound = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(user.password, saltRound);
        user.password = hashPassword;
    }catch(error){
        next(error);
    }
});

const User = new mongoose.model('User', userSchema);

module.exports = User;