const {
    Products,
    Users,
    UserActions,
    Categories,
} = require("../models/Database");
require("dotenv").config();

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
    if (req.body.userId) {
        const user_in_db = await Users.findById(req.body.userId);
        if (user_in_db) {
            const userActions = await UserActions.findOne({ userId: userId });
            if (userActions) {
                userActions.Visited_Products.push({
                    productId: productId,
                    time: new Date(),
                });
                await userActions.save();
            }
        }
    }
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
        const categories = await Categories.find().select("Category");
        return res.status(200).json(categories);
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

module.exports = {
    getAllProducts,
    getProduct,
    getProduct,
    getAllCategorys,
    getProductByCategory,
};
