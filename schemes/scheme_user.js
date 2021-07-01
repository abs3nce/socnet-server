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

//virtual field - logicke zapisovacie pole, ktoreho obsah nezapiseme do DB, udaje sa daju nastavit automaticky podla prednastavenych hodnot alebo manualne
//dobry priklad pouzitia je navratenie celeho mena, namiesto stavbar.prvemeno + stavbar.druhemeno vieme pouzit virtual a napisat stavbar.celemeno
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
  //navrati true ak sa rovnaju a false ak nie
  authUser: function (plainPassword) {
    return this.encryptPassword(plainPassword) == this.passwordHash;
  },

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
