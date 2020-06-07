var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
    authorName:{type: String, default:"user"},
    postText: { type: String, required: true, default: "em branco" },
    likes: {type: Number, default:0},
    created: { type: Date, default: Date.now }
});

// export model user with UserSchema 
module.exports = mongoose.model("Post", postSchema);