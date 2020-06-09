var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: {type: String, default: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Circle-icons-profile.svg/512px-Circle-icons-profile.svg.png"},
    email: { type: String, required: true },
    password: { type: String, required: true },
    age: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    course: { type: String, required: true },
    university: { type: String, required: true },
    created: { type: Date, default: Date.now },
    // profile_pic:{type:String, default:"default_profile.png"},
    // member_id: {type: String, default: shortid.generate},
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:"post"}]
});

module.exports = mongoose.model("User", userSchema);