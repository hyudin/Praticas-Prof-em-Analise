var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: {type: String, default: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Circle-icons-profile.svg/512px-Circle-icons-profile.svg.png"},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    course: { type: String, required: true },
    university: { type: String, required: true },
    inicDados: {type: Date, required: false },
    instPesquisa: {type: String, required:false, default:""},
    formacao: {type: String, required: false, default:""},
    curriculum: {type: String, required:false},
    created: { type: Date, default: Date.now },
    // profile_pic:{type:String, default:"default_profile.png"},
    // member_id: {type: String, default: shortid.generate},
    friends: {type: Array}
});

module.exports = mongoose.model("User", userSchema);