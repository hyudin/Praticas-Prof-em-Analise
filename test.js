var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017")

var profileSchema = new mongoose.Schema({
    name: String,
    age: Number,

});