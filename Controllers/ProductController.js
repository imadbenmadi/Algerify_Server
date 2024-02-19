const { Products, Users } = require("../models/Database");
require("dotenv").config();
const Verify_Product = require("../Middleware/Verify_Product");
const Verify_Admin = require("../Middleware/Verify_Admin");

const getAllProducts = async (req, res) => {
    try {
        const allProducts = await Products.find().select(
            "Title Describtion Category Price Product_RatingAverage"
        );

        return res.status(200).json(allProducts);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const getProduct = async (req, res) => {
    const productId = req.params.productId;
    if (!productId) return res.status(409).json({ error: "Messing Data" });
    try {
        const Product_in_db = await Products.findById(productId);
        if (!Product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        return res.status(200).json(Product_in_db);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const getAllCategorys = async (req, res) => {
    try {
        return res
            .status(200)
            .json({ Categories: ["Tech", "Kitchen", "Books", "Clothes"] });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const getProductByCategory = async (req, res) => {
    const category = req.params.category;
    if (!category) return res.status(409).json({ error: "Messing Data" });
    try {
        const Product_in_db = await Products.find({
            Category: category,
        }).select("Title Describtion Category Price Product_RatingAverage");
        if (!Product_in_db) {
            return res
                .status(404)
                .json({ error: " Could not find products with that category" });
        }
        return res.status(200).json(Product_in_db);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};

// productId trogh body
const add_to_Basket = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        const isAuth = await Verify_Product(req, res);
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
        const productId = req.body.productId;
        const productId = req.params.productId;
        if (!productId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const Product_in_db = await Products.findById(productId);
        if (!Product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        const productExists = Product_in_db.basket.some(
            (item) => item.ProductId === productId
        );
        if (productExists) {
            return res
                .status(400)
                .json({ error: "Product already in basket." });
        }
        Product_in_db.basket.push({ ProductId: productId });
        await Product_in_db.save();
        return res.status(200).json({
            message: "Product added to basket successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const delete_from_Basket = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        const isAuth = await Verify_Product(req, res);
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
        const productId = req.body.productId;
        const productId = req.params.productId;
        if (!productId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const Product_in_db = await Products.findById(productId);
        if (!Product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        // Find the index of the product in the basket array
        const productIndex = Product_in_db.basket.findIndex(
            (item) => item.ProductId === productId
        );
        if (productIndex === -1)
            return res
                .status(404)
                .json({ error: "Product not found in Product's basket." });

        // Remove the product from the basket array
        Product_in_db.basket.splice(productIndex, 1);
        await Product_in_db.save();
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
        const isAuth = await Verify_Product(req, res);
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
        const productId = req.params.productId;
        if (!productId) return res.status(409).json({ error: "Messing Data" });
        const Product_in_db = await Products.findById(productId).populate(
            "basket"
        );
        if (!Product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        return res.status(200).json(Product_in_db.basket);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const add_to_Favorit = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        const isAuth = await Verify_Product(req, res);
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
        const productId = req.body.productId;
        const productId = req.params.productId;
        if (!productId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const Product_in_db = await Products.findById(productId);
        if (!Product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        const productExists = Product_in_db.Favorite.some(
            (item) => item.ProductId === productId
        );
        if (productExists) {
            return res
                .status(400)
                .json({ error: "Product already in Favorite." });
        }
        Product_in_db.Favorite.push({ ProductId: productId });
        await Product_in_db.save();
        return res.status(200).json({
            message: "Product added to Favorite successfully.",
        });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};

const delete_from_Favorit = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        const isAuth = await Verify_Product(req, res);
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
        const productId = req.body.productId;
        const productId = req.params.productId;
        if (!productId || !productId)
            return res.status(409).json({ error: "Messing Data" });
        const Product_in_db = await Products.findById(productId);
        if (!Product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        // Find the index of the product in the basket array
        const productIndex = Product_in_db.Favorite.findIndex(
            (item) => item.ProductId === productId
        );
        if (productIndex === -1)
            return res
                .status(404)
                .json({ error: "Product not found in Product's Favorite." });

        // Remove the product from the basket array
        Product_in_db.Favorite.splice(productIndex, 1);
        await Product_in_db.save();
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
        const isAuth = await Verify_Product(req, res);
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
        const productId = req.params.productId;
        if (!productId) return res.status(409).json({ error: "Messing Data" });
        const Product_in_db = await Products.findById(productId).populate(
            "Favorite"
        );
        if (!Product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        return res.status(200).json(Product_in_db.Favorite);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
module.exports = {
    EditProduct,
    getAllProducts,
    getProduct,
    getProduct,
    getAllCategorys,
    getProductByCategory,
    DeleteProduct,
    CreateProduct,
    add_to_Basket,
    delete_from_Basket,
    get_Basket,
    add_to_Favorit,
    delete_from_Favorit,
    get_Favorite,
};
