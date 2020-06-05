var mongoose = require("mongoose");
// var shortid = require("shortid");

var userSchema =  new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  age:{type: String, required: true},
  city:{type: String, required: true},
  state:{type: String, required: true},
  course:{type: String, required: true},
  university:{type: String, required: true },
  created:{type: Date, default: Date.now}
  // profile_pic:{type:String, default:"default_profile.png"},
  // member_id: {type: String, default: shortid.generate},
  // friends:[{"member_id": String, "friend_name": String, "profile_pic": String}]
});


// export model user with UserSchema
const User = mongoose.model("User", userSchema);
module.exports = User;