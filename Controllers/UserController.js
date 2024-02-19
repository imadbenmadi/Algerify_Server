const { Users, Stores } = require("../models/Database");
require("dotenv").config();
const Verify_user = require("../Middleware/Verify_user");
const Verify_Admin = require("../Middleware/Verify_Admin");
const EditProfile = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        const isAuth = await Verify_user(req, res);
        if (isAuth.status == false)
            return res
                .status(401)
                .json({ error: "Unauthorized: Invalid token" });
        if (isAuth.status == true && isAuth.Refresh == true) {
            res.cookie("accessToken", isAuth.newAccessToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
            });
        }
    }

    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(409).json({ error: "Messing Data" });
        }

        const userToUpdate = await Users.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({ error: "User not found." });
        }
        const { FirstName, LastName, Email, Age, Gender, Telephone } = req.body;
        // Update individual fields
        if (FirstName) {
            userToUpdate.FirstName = FirstName;
        }
        if (LastName) {
            userToUpdate.LastName = LastName;
        }
        if (Email) {
            userToUpdate.Email = Email;
        }
        if (Age) {
            userToUpdate.Age = Age;
        }
        if (Gender) {
            userToUpdate.Gender = Gender;
        }
        if (Telephone) {
            userToUpdate.Telephone = Telephone;
        }

        // Save the updated user
        await userToUpdate.save();

        return res
            .status(200)
            .json({ message: "Profile updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
// Only Admin can get all users
const getAllUsers = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    try {
        const allUsers = await Users.find().select(
            "FirstName LastName Telephone Email Age"
        );

        return res.status(200).json(allUsers);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const getUser = async (req, res) => {
    const userId = req.params.userId;
    if (!userId) return res.status(409).json({ error: "Messing Data" });
    try {
        const user_in_db = await Users.findById(userId).select(
            "FirstName LastName Telephone Email Age Gender ProfilePic"
        );
        if (!user_in_db) {
            return res.status(404).json({ error: "user not found." });
        }
        return res.status(200).json(user_in_db);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const getProfile = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        const isAuth = await Verify_user(req, res);
        if (isAuth.status == false)
            return res
                .status(401)
                .json({ error: "Unauthorized: Invalid token" });
        if (isAuth.status == true && isAuth.Refresh == true) {
            res.cookie("accessToken", isAuth.newAccessToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
            });
        }
    }
    const userId = req.params.userId;
    if (!userId) return res.status(409).json({ error: "Messing Data" });
    try {
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "user not found." });
        }
        return res.status(200).json(user_in_db);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const DeleteProfile = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        const isAuth = await Verify_user(req, res);
        if (isAuth.status == false)
            return res
                .status(401)
                .json({ error: "Unauthorized: Invalid token" });
        if (isAuth.status == true && isAuth.Refresh == true) {
            res.cookie("accessToken", isAuth.newAccessToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
            });
        }
    }
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        await Users.findByIdAndDelete(userId);
        return res
            .status(200)
            .json({ message: "Profile deleted successfully." });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
// userid trogh body
const add_to_Basket = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    try {
        const userId = req.body.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const productExists = user_in_db.basket.some(
            (item) => item.ProductId === productId
        );
        if (productExists) {
            return res
                .status(400)
                .json({ error: "Product already in basket." });
        }
        user_in_db.basket.push({ ProductId: productId });
        await user_in_db.save();
        return res.status(200).json({
            message: "Product added to basket successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const delete_from_Basket = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    try {
        const userId = req.body.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        // Find the index of the product in the basket array
        const productIndex = user_in_db.basket.findIndex(
            (item) => item.ProductId === productId
        );
        if (productIndex === -1)
            return res
                .status(404)
                .json({ error: "Product not found in user's basket." });

        // Remove the product from the basket array
        user_in_db.basket.splice(productIndex, 1);
        await user_in_db.save();
        return res.status(200).json({
            message: "Product deleted from basket successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const get_Basket = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        const isAuth = await Verify_user(req, res);
        if (isAuth.status == false)
            return res
                .status(401)
                .json({ error: "Unauthorized: Invalid token" });
        if (isAuth.status == true && isAuth.Refresh == true) {
            res.cookie("accessToken", isAuth.newAccessToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
            });
        }
    }
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId).populate("basket");
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        return res.status(200).json(user_in_db.basket);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const add_to_Favorit = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }

    try {
        const userId = req.body.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const productExists = user_in_db.Favorite.some(
            (item) => item.ProductId === productId
        );
        if (productExists) {
            return res
                .status(400)
                .json({ error: "Product already in Favorite." });
        }
        user_in_db.Favorite.push({ ProductId: productId });
        await user_in_db.save();
        return res.status(200).json({
            message: "Product added to Favorite successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};

const delete_from_Favorit = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    try {
        const userId = req.body.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        // Find the index of the product in the basket array
        const productIndex = user_in_db.Favorite.findIndex(
            (item) => item.ProductId === productId
        );
        if (productIndex === -1)
            return res
                .status(404)
                .json({ error: "Product not found in user's Favorite." });

        // Remove the product from the basket array
        user_in_db.Favorite.splice(productIndex, 1);
        await user_in_db.save();
        return res.status(200).json({
            message: "Product deleted from Favorite successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const get_Favorite = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        const isAuth = await Verify_user(req, res);
        if (isAuth.status == false)
            return res
                .status(401)
                .json({ error: "Unauthorized: Invalid token" });
        if (isAuth.status == true && isAuth.Refresh == true) {
            res.cookie("accessToken", isAuth.newAccessToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
            });
        }
    }
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId).populate("Favorite");
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        return res.status(200).json(user_in_db.Favorite);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const CreateStore = async (req, res) => {
    const isAuth = await Verify_Store(req, res);
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    if (isAuth.status == false)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    try {
        const { StoreName, Store_Describtion, Telephone } = req.body;
        if (!StoreName || !Store_Describtion || !Telephone) {
            return res.status(409).json({ error: "Messing Data" });
        }
        if (StoreName.length < 3 || Store_Describtion.length < 3) {
            return res
                .status(409)
                .json({
                    error: "StoreName and Store Description must be at least 3 characters long.",
                });
        }
        if (Telephone.length < 9 || Telephone.length > 11) {
            return res.status(409).json({ error: "Invalid Telephone number" });
        }
        const Store_Name_Exist = await Stores.findOne({ StoreName: StoreName });
        if (Store_Name_Exist) {
            return res
                .status(409)
                .json({ error: "Store Name already exists." });
        }
        const newStore = new Stores({
            Owner: req.params.userId,
            StoreName,
            Store_Describtion,
            Telephone,
        });
        await newStore.save();
        return res.status(200).json({ message: "Store Created successfully." });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
module.exports = {
    EditProfile,
    getAllUsers,
    getProfile,
    getUser,
    DeleteProfile,
    CreateStore,
    add_to_Basket,
    delete_from_Basket,
    get_Basket,
    add_to_Favorit,
    delete_from_Favorit,
    get_Favorite,
};
