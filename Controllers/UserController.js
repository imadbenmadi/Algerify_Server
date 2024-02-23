const {
    Users,
    Stores,
    Products,
    Refresh_tokens,
    email_verification_tokens,
    UserActions,
} = require("../models/Database");
require("dotenv").config();
const Verify_user = require("../Middleware/Verify_user");
const Verify_Admin = require("../Middleware/Verify_Admin");
const EditProfile = async (req, res) => {
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
        const userId = req.params.userId;
        if (!userId) {
            return res.status(409).json({ error: "Messing Data" });
        }

        const userToUpdate = await Users.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({ error: "User not found." });
        }
        const { FirstName, LastName, Age, Gender, Telephone } = req.body;
        // Update individual fields
        if (FirstName) {
            userToUpdate.FirstName = FirstName;
        }
        if (LastName) {
            userToUpdate.LastName = LastName;
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
const Follow_Store = async (req, res) => {
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
        const userId = req.params.userId;
        const storeId = req.params.storeId;
        if (!userId || !storeId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const store_in_db = await Stores.findById(storeId);
        if (!store_in_db) {
            return res.status(404).json({ error: "Store not found." });
        }
        const Already_Followed = store_in_db.Followers.some(
            (item) => item == userId
        );
        if (Already_Followed) {
            return res
                .status(400)
                .json({ error: "User already followed this store." });
        }
        store_in_db.Followers.push(userId);
        console.log(store_in_db.Followers);
        await store_in_db.save();
        const userActions = await UserActions.findOne({ userId: userId });
        if (userActions) {
            userActions.Followed_Stores.push(storeId);
            await userActions.save();
        }
        await user_in_db.save();
        return res.status(200).json({
            message: "Store followed successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
// Only Dashboard can get all users
const getAllUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    try {
        const totalCount = await Users.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);
        const skip = (page - 1) * limit;

        const allUsers = await Users.find()
            .select("FirstName LastName")
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ totalPages, allUsers });
    } catch (error) {
        return res.status(500).json({ error });
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
        const userId = req.params.userId;
        if (!userId) return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        await Users.findByIdAndDelete(userId);
        await Stores.deleteMany({ Owner: userId });
        await Products.deleteMany({ Owner: userId });
        await Refresh_tokens.deleteMany({ userId: userId });
        await email_verification_tokens.deleteMany({ userId: userId });
        await UserActions.deleteMany({ userId: userId });
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
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
        const userId = req.params.userId;
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
        const userActions = await UserActions.findOne({ userId: userId });
        if (userActions) {
            userActions.Added_To_Basket.push({
                productId: productId,
                time: new Date(),
            });
            await userActions.save();
        }
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
        const userId = req.params.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        // Find the index of the product in the basket array
        const productIndex = user_in_db.basket.findIndex((item) => {
            return item.ProductId == productId;
        });

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
        const userId = req.params.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const product_in_db = await Products.findById(productId);
        if (!product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        const productExists = user_in_db.Favorite.some(
            (item) => item.ProductId == productId
        );
        if (productExists) {
            return res
                .status(400)
                .json({ error: "Product already in Favorite." });
        }
        user_in_db.Favorite.push({ ProductId: productId });
        product_in_db.Favorite_Counter = product_in_db.Favorite_Counter + 1;
        await product_in_db.save();
        await user_in_db.save();
        const userActions = await UserActions.findOne({ userId: userId });
        if (userActions) {
            userActions.Added_To_Favorite.push({
                productId: productId,
                time: new Date(),
            });
            await userActions.save();
        }
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
        const userId = req.params.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const product_in_db = await Products.findById(productId);
        if (!product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        // Find the index of the product in the basket array
        const productIndex = user_in_db.Favorite.findIndex((item) => {
            return item.ProductId == productId;
        });
        if (productIndex == -1)
            return res
                .status(404)
                .json({ error: "Product not found in user's Favorite." });

        // Remove the product from the basket array
        user_in_db.Favorite.splice(productIndex, 1);
        product_in_db.Favorite_Counter = product_in_db.Favorite_Counter - 1;
        
        await user_in_db.save();
        await product_in_db.save();
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
    const isAuth = await Verify_user(req, res);
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
        const { Email, Password, StoreName, Store_Describtion, Telephone } =
            req.body;
        if (
            !Email ||
            !Password ||
            !StoreName ||
            !Store_Describtion ||
            !Telephone
        ) {
            return res.status(409).json({ error: "Messing Data" });
        }
        if (StoreName.length < 3 || Store_Describtion.length < 3) {
            return res.status(409).json({
                error: "StoreName and Store Description must be at least 3 characters long.",
            });
        } else if (Telephone.length < 9 || Telephone.length > 11) {
            return res.status(409).json({ error: "Invalid Telephone number" });
        } else if (Password.length < 8) {
            return res
                .status(409)
                .json({ error: "Password must be at least 8 characters" });
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(Email)) {
            return res.status(409).json({ error: "Invalid Email" });
        }
        const Store_Name_Exist = await Stores.findOne({ StoreName: StoreName });
        if (Store_Name_Exist) {
            return res
                .status(409)
                .json({ error: "Store Name already exists." });
        }
        const newStore = new Stores({
            Owner: req.params.userId,
            Email,
            Password,
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
    Follow_Store,
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
