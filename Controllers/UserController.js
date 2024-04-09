const {
    Users,
    Stores,
    Products,
    Refresh_tokens,
    email_verification_tokens,
    UserActions,
    Categories,
    // Products,
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

        const userActions = await UserActions.findOne({ userId: userId });
        if (userActions) {
            userActions.Followed_Stores.push({
                storeId: req.params.storeId,
            });
            await userActions.save();
        } else {
            const newUserActions = new UserActions({
                userId: userId,
                Added_To_Basket: [],
                Added_To_Favorite: [],
                Rated_Products: [],
                Commented_Products: [],
                Rated_Stores: [],
                Visited_Products: [],
                Visited_Stores: [],
                Not_interesting_Products: [],
                interesting_Products: [],
                Followed_Stores: [{ storeId: req.params.storeId }],
            });
            await newUserActions.save();
        }
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
            });
            await userActions.save();
        } else {
            const newUserActions = new UserActions({
                userId: userId,
                Added_To_Basket: [{ productId: productId }],
                Added_To_Favorite: [],
                Rated_Products: [],
                Commented_Products: [],
                Rated_Stores: [],
                Visited_Products: [],
                Visited_Stores: [],
                Not_interesting_Products: [],
                interesting_Products: [],
                Followed_Stores: [],
            });
            await newUserActions.save();
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
            });
            await userActions.save();
        } else {
            const newUserActions = new UserActions({
                userId: userId,
                Added_To_Basket: [],
                Added_To_Favorite: [{ productId: productId }],
                Rated_Products: [],
                Commented_Products: [],
                Rated_Stores: [],
                Visited_Products: [],
                Visited_Stores: [],
                Not_interesting_Products: [],
                interesting_Products: [],
                Followed_Stores: [],
            });
            await newUserActions.save();
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
        if (!userActions) {
            try {
                const userAction = new UserActions({
                    userId: user_in_db._id,
                    Added_To_Basket: [],
                    Added_To_Favorite: [],
                    Rated_Products: [],
                    Commented_Products: [],
                    Rated_Stores: [],
                    Visited_Products: [{ productId: productId }],
                    Visited_Stores: [],
                    Not_interesting_Products: [],
                    interesting_Products: [],
                    Followed_Stores: [],
                });
                // await userAction.save();

                await userAction.save();
                product_in_db.Visits = product_in_db.Visits + 1;
                await product_in_db.save();
                return res.status(200).json({
                    message: "Product added to visited products successfully.",
                });
            } catch (err) {
                console.log(err);
                return res.status(404).json({
                    error: "UserActions not found. could not Create documnet",
                });
            }
        } else {
            const alreadyVisited = userActions.Visited_Products.some((visit) =>
                visit.productId.equals(productId)
            );
            if (!alreadyVisited) {
                userActions.Visited_Products.push({
                    productId: productId,
                });
                await userActions.save();
                product_in_db.Visits = product_in_db.Visits + 1;
                await product_in_db.save();
            }

            return res.status(200).json({
                message: "Product added to visited products successfully.",
            });
        }
    } catch (error) {
        console.log(error);
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
        if (!userActions) {
            try {
                const userAction = new UserActions({
                    userId: user_in_db._id,
                    Added_To_Basket: [],
                    Rated_Products: [],
                    Commented_Products: [],
                    Rated_Stores: [],
                    Visited_Products: [],
                    Visited_Stores: [{ storeId: storeId }],
                    Not_interesting_Products: [],
                    interesting_Products: [],
                    Followed_Stores: [],
                });
                await userAction.save();
                Store_in_db.Visits = Store_in_db.Visits + 1;
                await Store_in_db.save();
                return res.status(200).json({
                    message: "Store added to visited Stores successfully.",
                });
            } catch (err) {
                return res.status(404).json({
                    error: "UserActions not found. could not Create documnet",
                });
            }
        } else {
            const alreadyVisited = userActions.Visited_Stores.some((visit) =>
                visit.storeId.equals(storeId)
            );
            if (!alreadyVisited) {
                userActions.Visited_Stores.push({
                    storeId: storeId,
                });
                await userActions.save();
                Store_in_db.Visits = Store_in_db.Visits + 1;
                await Store_in_db.save();
            }

            return res.status(200).json({
                message: "Store added to visited Stores successfully.",
            });
        }
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const Recommended_Products = async (req, res) => {
    const userId = req.params.id;
    if (!userId) return res.status(409).json({ error: "Missing Data" });
    try {
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }
        const userActions = await UserActions.findOne({ userId: userId });
        if (!userActions) {
            try {
                const userAction = new UserActions({
                    userId: user_in_db._id,
                    Added_To_Basket: [],
                    Rated_Products: [],
                    Commented_Products: [],
                    Rated_Stores: [],
                    Visited_Products: [],
                    Visited_Stores: [],
                    Not_interesting_Products: [],
                    interesting_Products: [],
                    Followed_Stores: [],
                });
                await userAction.save();
                // Fetch the 30 most visited products as fallback recommendation
                const mostVisitedProducts = await Products.find()
                    .sort({ Visits: -1 }) // Sort by Visits field in descending order (most visited first)
                    .limit(30); // Limit the number of results to 30
                return res
                    .status(200)
                    .json({ recommendedProducts: mostVisitedProducts });
            } catch (err) {
                return res.status(404).json({
                    error: "UserActions not found. could not Create documnet",
                });
            }
        }
        const products = await Products.find();
        const categories = await Categories.find();
        if (!products.length)
            return res
                .status(404)
                .json({ message: "No Product for the moment" });
        if (!categories.length)
            return res
                .status(404)
                .json({ message: "No Category for the moment" });

        const score = categories.map((category) => ({
            [category.Category]: 10,
        }));
        const actions_scores = [
            { Visited_Products: 6 },
            { Added_To_Favorite: 9 },
            { Added_To_Basket: 9 },
            { Rated_Products_mt3: 8 },
            { Rated_Products_lt3: 2 },
            { interesting_Products: 10 },
            { Not_interesting_Products: 0 },
        ];
        userActions.Visited_Products.forEach((item) => {
            if (item.productCategory) {
                score.forEach((i) => {
                    const categoryName = Object.keys(i)[0]; // Retrieve category name within the loop
                    if (
                        // i[categoryName] < 10 &&
                        categoryName === item.productCategory
                    ) {
                        const actions_score = actions_scores.find((action) =>
                            action.hasOwnProperty("Visited_Products")
                        );
                        i[categoryName] =
                            (i[categoryName] +
                                actions_score["Visited_Products"]) /
                            2;
                    }
                });
            }
        });
        userActions.Added_To_Favorite.forEach((item) => {
            if (item.productCategory) {
                score.forEach((i) => {
                    const categoryName = Object.keys(i)[0]; // Retrieve category name within the loop
                    if (
                        // i[categoryName] < 10 &&
                        categoryName === item.productCategory
                    ) {
                        const actions_score = actions_scores.find((action) =>
                            action.hasOwnProperty("Added_To_Favorite")
                        );
                        i[categoryName] =
                            (i[categoryName] +
                                actions_score["Added_To_Favorite"]) /
                            2;
                    }
                });
            }
        });
        userActions.Added_To_Basket.forEach((item) => {
            if (item.productCategory) {
                score.forEach((i) => {
                    const categoryName = Object.keys(i)[0]; // Retrieve category name within the loop
                    if (
                        // i[categoryName] < 10 &&
                        categoryName === item.productCategory
                    ) {
                        const actions_score = actions_scores.find((action) =>
                            action.hasOwnProperty("Added_To_Basket")
                        );
                        i[categoryName] =
                            (i[categoryName] +
                                actions_score["Added_To_Basket"]) /
                            2;
                    }
                });
            }
        });
        userActions.Rated_Products.forEach((item) => {
            if (item.productCategory) {
                score.forEach((i) => {
                    const categoryName = Object.keys(i)[0]; // Retrieve category name within the loop
                    if (
                        // i[categoryName] < 10 &&
                        categoryName === item.productCategory
                    ) {
                        if (item.rate >= 3) {
                            const actions_score = actions_scores.find(
                                (action) =>
                                    action.hasOwnProperty("Rated_Products_mt3")
                            );
                            i[categoryName] =
                                (i[categoryName] +
                                    actions_score["Rated_Products_mt3"]) /
                                2;
                        } else if (item.rate < 3) {
                            const actions_score = actions_scores.find(
                                (action) =>
                                    action.hasOwnProperty("Rated_Products_lt3")
                            );
                            i[categoryName] =
                                (i[categoryName] +
                                    actions_score["Rated_Products_lt3"]) /
                                2;
                        }
                    }
                });
            }
        });
        userActions.interesting_Products.forEach((item) => {
            if (item.productCategory) {
                score.forEach((i) => {
                    const categoryName = Object.keys(i)[0]; // Retrieve category name within the loop
                    if (
                        // i[categoryName] < 10 &&
                        categoryName === item.productCategory
                    ) {
                        const actions_score = actions_scores.find((action) =>
                            action.hasOwnProperty("interesting_Products")
                        );
                        i[categoryName] =
                            (i[categoryName] +
                                actions_score["interesting_Products"]) /
                            2;
                    }
                });
            }
        });
        userActions.Not_interesting_Products.forEach((item) => {
            if (item.productCategory) {
                score.forEach((i) => {
                    const categoryName = Object.keys(i)[0]; // Retrieve category name within the loop
                    if (
                        // i[categoryName] < 10 &&
                        categoryName === item.productCategory
                    ) {
                        const actions_score = actions_scores.find((action) =>
                            action.hasOwnProperty("Not_interesting_Products")
                        );
                        i[categoryName] =
                            (i[categoryName] +
                                actions_score["Not_interesting_Products"]) /
                            2;
                    }
                });
            }
        });
        // Calculate the total score for all categories
        const totalScore = score.reduce(
            (acc, curr) => acc + Object.values(curr)[0],
            0
        );
        // Calculate the percentage score for each category
        const categoriesScore = score.map((item) => {
            const categoryName = Object.keys(item)[0];
            const categoryScore = (Object.values(item)[0] / totalScore) * 100;
            return { [categoryName]: categoryScore };
        });
        // Sort the categories by score in descending order
        categoriesScore.sort(
            (a, b) => Object.values(b)[0] - Object.values(a)[0]
        );
        // Initialize variables
        let recommendedProducts = [];
        let remainingRecommendations = 30;

        // Recommend products from high-percentage categories
        categoriesScore.forEach(async (category) => {
            const categoryName = Object.keys(category)[0];
            const percentage = Object.values(category)[0];
            const numberOfProductsToRecommend = Math.ceil(
                (percentage / 100) * 30
            );

            // Recommend products from this category, ensuring not to exceed remaining recommendations
            // You need to implement a function to fetch products based on category and other criteria
            const productsFromCategory = await Products.find({
                Category: categoryName,
            })
                .sort({ Visits: -1 }) // Sort by Visits field in descending order (most visited first)
                .limit(numberOfProductsToRecommend); // Limit the number of results to the calculated numbers

            recommendedProducts =
                recommendedProducts.concat(productsFromCategory);
            remainingRecommendations -= productsFromCategory.length;
        });

        // If there are remaining recommendations, recommend at least one product from low-percentage categories
        if (remainingRecommendations > 0) {
            const lowPercentageCategories = categoriesScore.filter(
                (category) => Object.values(category)[0] < 10
            );
            lowPercentageCategories.forEach((category) => {
                const categoryName = Object.keys(category)[0];
                const productsFromCategory = fetchProductsByCategory(
                    categoryName,
                    1,
                    "newest"
                );
                recommendedProducts =
                    recommendedProducts.concat(productsFromCategory);
                remainingRecommendations--;
            });
        }

        if (recommendedProducts.length > 0) {
            // Sort recommended products by date (newest first) as per your requirement
            recommendedProducts.sort((a, b) => b.Visits - a.Visits);
            return res.status(200).json({ recommendedProducts });
        } else {
            // Fetch the 30 most visited products as fallback recommendation
            const mostVisitedProducts = await Products.find()
                .sort({ Visits: -1 }) // Sort by Visits field in descending order (most visited first)
                .limit(30); // Limit the number of results to 30
            return res
                .status(200)
                .json({ recommendedProducts: mostVisitedProducts });
        }
        // return res.status(200).json({ categoriesScore, score });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
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
    Recommended_Products,
};
