var mongoose = require('mongoose');

var publSchema = new mongoose.Schema({
    authorName:{type: String, default:"user"},
    authorEmail:{type: String, required: false},
    publText: { type: String, required: true, default: "em branco" },
    likes: {type: Array},
    created: { type: Date, default: Date.now }
});

// export model user with UserSchema 
module.exports = mongoose.model("Publ", publSchema);