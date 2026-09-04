const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);


// ==========================================
// VERIFY GOOGLE TOKEN
// ==========================================

const verifyGoogleToken = async (credential) => {

    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    return payload;
};


// ==========================================
// FIND OR CREATE USER
// ==========================================

const findOrCreateUser = async (googleUser) => {

    let user = await User.findOne({
        googleId: googleUser.sub
    });


    if (!user) {

        user = await User.create({
            googleId: googleUser.sub,
            name: googleUser.name,
            email: googleUser.email,
            picture: googleUser.picture
        });

    } else {

        user.name = googleUser.name;
        user.email = googleUser.email;
        user.picture = googleUser.picture;

        await user.save();
    }


    return user;
};


// ==========================================
// CREATE OUR JWT
// ==========================================

const createToken = (user) => {

    return jwt.sign(
        {
            userId: user._id
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }
    );
};


module.exports = {
    verifyGoogleToken,
    findOrCreateUser,
    createToken
};