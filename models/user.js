const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    userImage: {
        type: String,

    },
    resetToken: { type: String },
    resetTokenExpiration: { type: Date },
    username: { type: String }
})

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });//tell passport with which input parameter it will authenticate 


module.exports = mongoose.model('User', userSchema)