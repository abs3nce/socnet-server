const mongoose = require("mongoose");
const { v1: uuidv1 } = require("uuid");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: true,
  },

  passwordHash: {
    type: String,
    required: true,
  },

  salt: String,

  created: {
    type: Date,
    default: Date.now(),
  },

  updated: Date,
});

//virtual field
//dostaneme z klienta 'password' a nasledne ho ulozime ako "passwordHash" pricom 'password' je virtual pretoze sa nikde neuklada
userSchema
  .virtual("password")
  .set(function (password) {
    //vytvorime temp var _password
    this._password = password;

    //generovanie timestampu (saltu)
    this.salt = uuidv1();

    //zahashovanie _password
    this.passwordHash = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

//methods
userSchema.methods = {
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", userSchema);
