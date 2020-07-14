var mongoose = require('mongoose');

var memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: {type: String, default: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Circle-icons-profile.svg/512px-Circle-icons-profile.svg.png"},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    created: { type: Date, default: Date.now },
    member: { type: String, default: 1},
    // profile_pic:{type:String, default:"default_profile.png"},
    // member_id: {type: String, default: shortid.generate},
    friends: {type: Array}
});

module.exports = mongoose.model("Member", memberSchema);