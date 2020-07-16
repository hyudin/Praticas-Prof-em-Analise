var mongoose = require('mongoose');

var publSchema = new mongoose.Schema({
    authorName:{type: String, default:"user"},
    authorEmail:{type: String, required: false},
    publText: { type: String, required: true, default: "em branco" },
    publTitle: {type:String, required:true},
    ano: {type: Number, required:true},
    tags: {type: Array, default:""},
    local: {type: String, default:""},
    url: {type: String, default:""},
    arquivo: {type: String},
    likes: {type: Array},
    created: { type: Date, default: Date.now }
});

// export model user with UserSchema 
module.exports = mongoose.model("Publ", publSchema);