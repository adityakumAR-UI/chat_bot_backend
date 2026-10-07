const {
    verifyGoogleToken,
    findOrCreateUser,
    createToken
} = require("../services/authService");




const googleLogin = async (req, res) => {

    try {

        const { credential } = req.body;


        if (!credential) {

            return res.status(400).json({
                error: "Google credential is required"
            });
        }




        const googleUser =
            await verifyGoogleToken(
                credential
            );


        if (!googleUser) {

            return res.status(401).json({
                error: "Invalid Google token"
            });
        }



        const user =
            await findOrCreateUser(
                googleUser
            );



        const token =
            createToken(user);


     

        res.json({

            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }

        });

    } catch (error) {

        console.error(
            "GOOGLE LOGIN ERROR:",
            error
        );

        res.status(401).json({
            error: "Google authentication failed"
        });
    }
};
const getCurrentUser = async (req, res) => {
    try {
        const User = require("../models/User");

        const user = await User.findById(
            req.user.userId
        );

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        });

    } catch (error) {
        console.error(
            "GET CURRENT USER ERROR:",
            error
        );

        res.status(500).json({
            error: "Failed to get user"
        });
    }
};


module.exports = {
    googleLogin,
    getCurrentUser
};
