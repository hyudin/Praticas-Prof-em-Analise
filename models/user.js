var mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    name: { type: String, required: false },
    image: {type: String, default: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Circle-icons-profile.svg/512px-Circle-icons-profile.svg.png"},
    email: { type: String, required: false },
    password: { type: String, required: false },
    age: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    course: { type: String, required: false },
    university: { type: String, required: false },
    created: { type: Date, default: Date.now },
    // profile_pic:{type:String, default:"default_profile.png"},
    // member_id: {type: String, default: shortid.generate},
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:"post"}]
});
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);