const {
    Users,
    Stores,
    Products,
    Refresh_tokens,
    email_verification_tokens,
    UserActions,
} = require("../models/Database");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Verify_user = require("../Middleware/Verify_user");

const EditProfile = async (req, res) => {
    try {
        const userToUpdate = req.userToUpdate;
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
        const ProfilePic = req.generatedFilename;
        if (ProfilePic) {
            userToUpdate.ProfilePic = ProfilePic;
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
        if (req.params.userId !== isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorised" });
        }
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

        // const userActions = await UserActions.findOne({ userId: userId });
        // if (userActions) {
        //     userActions.Followed_Stores.push(storeId);
        //     await userActions.save();
        // }

        await UserActions.findOneAndUpdate(
            { userId: user_in_db._id },
            {
                $push: {
                    Followed_Stores: {
                        storeId: store_in_db._id,
                        storeName: store_in_db.StoreName,
                        storeLocation: store_in_db.Location,
                        StoreCategory: store_in_db.Category,
                    },
                },
            },
            { new: true, upsert: true }
        );
        user_in_db.Followed_Stores.push(storeId);
        await user_in_db.save();
        await store_in_db.save();
        return res.status(200).json({
            message: "Store followed successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
};
const Unfollow_Store = async (req, res) => {
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
        if (req.params.userId !== isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorised" });
        }
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
        if (!Already_Followed) {
            return res
                .status(400)
                .json({ error: "User not followed this store." });
        }
        store_in_db.Followers = store_in_db.Followers.filter(
            (item) => item != userId
        );

        user_in_db.Followed_Stores = user_in_db.Followed_Stores.filter(
            (item) => {
                console.log(item);
                item._id != storeId;
            }
        );
        await user_in_db.save();
        await store_in_db.save();

        return res.status(200).json({
            message: "Store unfollowed successfully.",
        });
    } catch (error) {
        console.log(error);
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
    if (req.params.userId !== isAuth.decoded.userId) {
        return res.status(401).json({ error: "Unauthorised" });
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
        if (req.params.userId !== isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorised" });
        }
        const userId = req.params.userId;
        if (!userId) return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        if (user_in_db.ProfilePic) {
            const imagePath = path.join(
                __dirname,
                "../../Public/Users",
                user_in_db.ProfilePic
            );
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        await Users.findByIdAndDelete(userId);
        await Stores.deleteMany({ Owner: userId });
        await Products.deleteMany({ Owner: userId });
        await Refresh_tokens.deleteMany({ userId: userId });
        await email_verification_tokens.deleteMany({ userId: userId });
        await UserActions.deleteMany({ userId: userId });
        if (req.cookies.accessToken) {
            res.clearCookie("accessToken");
        }
        if (req.cookies.refreshToken) {
            res.clearCookie("refreshToken");
        }
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
        if (req.params.userId !== isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorised" });
        }
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
        const Store_Owner = await Stores.findOne({ _id: product_in_db.Owner });
        if (!Store_Owner)
            return res.status(404).json({ error: "could not find the Store " });

        if (userId == Store_Owner.Owner) {
            return res.status(409).json({ error: "User Own this Product" });
        }

        const productExists = user_in_db.basket.some(
            (item) => item.ProductId == productId
        );
        if (productExists) {
            return res
                .status(400)
                .json({ error: "Product already in basket." });
        }
        user_in_db.basket.push({ ProductId: productId });
        product_in_db.Basket_Counter += 1; // Incrementing Basket_Counter
        await product_in_db.save(); // Saving the updated product
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
        if (req.params.userId !== isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorised" });
        }
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
        product_in_db.Basket_Counter = product_in_db.Basket_Counter - 1;
        await product_in_db.save();
        return res.status(200).json({
            message: "Product deleted from basket successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const get_Basket = async (req, res) => {
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
        if (req.params.userId !== isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorised" });
        }
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1; // default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 20; // default to limit of 20 if not provided
        if (!userId) return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId).populate({
            path: "basket",
            populate: {
                path: "ProductId",
                model: "Products",
            },
        });

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
        if (req.params.userId !== isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorised" });
        }
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
        const page = parseInt(req.query.page) || 1; // default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 20; // default to limit of 20 if not provided
        if (!userId) return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId).populate({
            path: "Favorite",
            options: {
                skip: (page - 1) * limit,
                limit: limit,
            },
        });

        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        return res.status(200).json(user_in_db.Favorite);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};

const CreateStore = async (req, res) => {
    try {
        let { Email, StoreName, Store_Describtion, Telephone } = req.body;
        const newStore = new Stores({
            Owner: req.params.userId,
            Email,
            StoreName,
            Store_Describtion,
            Telephone,
            Store_Image: req.generatedFilename,
        });
        await newStore.save();
        const user_in_db = await Users.findById(req.params.userId);
        user_in_db.Stores.push(newStore._id);
        await user_in_db.save();
        return res.status(200).json({ message: "Store Created successfully." });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const add_to_visited_products = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (!isAuth.status)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status && isAuth.Refresh) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000,
        });
    }
    try {
        if (req.params.userId !== isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorised" });
        }
        const userId = req.params.userId;
        const productId = req.params.productId;
        if (!userId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db)
            return res.status(404).json({ error: "User not found." });
        const product_in_db = await Products.findById(productId);
        if (!product_in_db)
            return res.status(404).json({ error: "Product not found." });
        const userActions = await UserActions.findOne({ userId });
        if (!userActions)
            return res.status(404).json({ error: "UserAction not found." });
        const alreadyVisited = userActions.Visited_Products.some((visit) =>
            visit.productId.equals(productId)
        );
        if (!alreadyVisited) {
            userActions.Visited_Products.push({
                productId: productId,
                time: new Date(),
            });
            await userActions.save();
            product_in_db.Visits = product_in_db.Visits + 1;
            await product_in_db.save();
        }

        return res.status(200).json({
            message: "Product added to visited products successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const add_to_visited_stores = async (req, res) => {
    const isAuth = await Verify_user(req, res);
    if (!isAuth.status)
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    if (isAuth.status && isAuth.Refresh) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000,
        });
    }
    try {
        if (req.params.userId !== isAuth.decoded.userId) {
            return res.status(401).json({ error: "Unauthorised" });
        }
        const userId = req.params.userId;
        const storeId = req.params.storeId;
        if (!userId || !storeId)
            return res.status(409).json({ error: "Messing Data" });
        const user_in_db = await Users.findById(userId);
        if (!user_in_db)
            return res.status(404).json({ error: "User not found." });
        const Store_in_db = await Stores.findById(storeId);
        if (!Store_in_db)
            return res.status(404).json({ error: "Store not found." });
        const userActions = await UserActions.findOne({ userId });
        if (!userActions)
            return res.status(404).json({ error: "UserAction not found." });
        const alreadyVisited = userActions.Visited_Stores.some((visit) =>
            visit.storeId.equals(storeId)
        );
        if (!alreadyVisited) {
            userActions.Visited_Stores.push({
                storeId: storeId,
                time: new Date(),
            });
            await userActions.save();
            Store_in_db.Visits = Store_in_db.Visits + 1;
            await Store_in_db.save();
        }

        return res.status(200).json({
            message: "Store added to visited Stores successfully.",
        });
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
    Unfollow_Store,
    add_to_visited_products,
    add_to_visited_stores,
};
