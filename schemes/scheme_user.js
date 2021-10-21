//base packages import
const mongoose = require("mongoose");
const { v1: uuidv1 } = require("uuid");
const crypto = require("crypto");

//vytvorenie noveho modelu pre usera
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true, //vsetky medzery pred a po mene orez
    required: true,
  },

  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },

  passwordHash: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    trim: true,
  },

  salt: String,

  created: {
    type: Date,
    default: Date.now(),
  },

  updated: Date,

  profilePicture: {
    data: Buffer,
    contentType: String,
  },
});

//virtual field - logicke zapisovacie pole, ktoreho obsah nezapiseme do DB, udaje sa daju nastavit automaticky podla prednastavenych hodnot alebo manualne
//dobry priklad pouzitia je navratenie celeho mena, namiesto stavbar.prvemeno + stavbar.druhemeno vieme pouzit virtual a napisat stavbar.celemeno

//dostaneme z klienta nejake heslo a vytvorime virtual field password
userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    //vytvorime temp premennu _password a nahrame do nej heslo, ktore sme dostali z klienta
    //toto heslo z klienta namiesto toho aby sme ho ulozili do db ho ulozime iba do virtual fieldu
    //pretoze s nim chceme dalej pracovat ale nechceme ho ukladat, uklada sa az konecny hash

    //generovanie timestampu (saltu) pomocou nahodneho uuid
    this.salt = uuidv1();

    //FOR THE FUTURE ME
    //tento system hashovania by sa hodilo prerobit plne na bcrypt pretoze ten toto robi jednoduchsie

    //zahashovanie _password
    this.passwordHash = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

//methods
userSchema.methods = {
  encryptPassword: function (password) {
    if (!password) return ""; //navratenie prazdneho stringu na porovnavanie vo funkcii authUser
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password) //nahranie hashu do originalneho stringu passwordu (teraz sa uklada hash a plain password uz nebude existovat)
        .digest("hex");
    } catch (err) {
      return ""; //navratenie prazdneho stringu na porovnavanie vo funkcii authUser
    }
  },

  //navrati true ak sa hesla rovnaju a false ak sa hesla nerovnaju
  authUser: function (plainPassword) {
    return this.encryptPassword(plainPassword) == this.passwordHash;
  },
};

module.exports = mongoose.model("User", userSchema);
