//base packages import
const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const expressValidator = require("express-validator");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const cors = require("cors");

//databaza
mongoose
    .connect(process.env.DB_CONN, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log(
            `DB > DB READY STATE: (`,
            mongoose.connection.readyState,
            ")"
        );
        console.log(`DB > CONNECTION SUCCESSFUL`);
    });

mongoose.connection.on("error", (err) => {
    console.log(`DB > CONNECTION ERROR: ${err.message}`);
});

//deprication fix
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

//import custom routes
const postRoutes = require("./routes/route_posts");
const authRoutes = require("./routes/route_account");
const usersRoutes = require("./routes/route_users");

//base middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(morgan("dev"));

//routes
//pouzite ako middleware, pri accessnuti "/" presmeruju na spravny route podla url (vsetko v subore routes)
app.use("/api", postRoutes);
app.use("/api", authRoutes);
app.use("/api", usersRoutes);

//dokumentacia API na "/" route
app.get("/api", (req, res, next) => {
    fs.readFile("docs/apidocs.json", (err, data) => {
        if (err) {
            res.status(500).json({ error: err });
        }
        const docs = JSON.parse(data);
        res.status(200).json(docs);
    });
});

//funkcia express-jwt ktora handluje (kazdy) 'UnauthorizedError'
//podla nej menim response json
app.use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        res.status(401).json({
            error: "Užívateľ musí byť prihlásený na vykonanie tejto akcie",
        });
    }
});

//listening serveru na porte
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`API > LISTENING ON PORT: ${port}`);
});

//db.users.update({_id:ObjectId("00000000000000000000000")},{$set:{role:"administrator"}})
//paste querry na OP
