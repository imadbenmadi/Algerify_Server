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
const searchProduct = async (req, res) => {
    const search = req.params.search;
    if (!search) return res.status(409).json({ error: "Messing Data" });
    try {
        const Product_in_db = await Products.find({
            Title: { $regex: search, $options: "i" },
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
const FilterProducts = async (req, res) => {
    const { category, price, rate, sortBy, location } = req.body;
    try {
        let query = {};

        // Add filtering criteria
        if (category) {
            query.Category = category;
        }
        if (price) {
            query.Price = { $lte: price };
        }
        if (rate) {
            query.Product_RatingAverage = { $gte: rate };
        }
        if (location) {
            query.Location = location;
        }

        // Define default sorting criteria as an empty object
        let sortCriteria = {};

        // Update sorting criteria if sortBy parameter is provided
        if (sortBy) {
            if (sortBy === "mostViewed") {
                sortCriteria = { Visits: -1 };
            } else if (sortBy === "mostRated") {
                sortCriteria = { Product_RatingAverage: -1 };
            } else if (sortBy === "mostBought") {
                sortCriteria = { Basket_Counter: -1 };
            } else {
                // Invalid sortBy parameter
                return res
                    .status(400)
                    .json({ error: "Invalid sortBy parameter." });
            }
        }

        // Find products matching the specified criteria and sort them
        const filteredProducts = await Products.find(query)
            .sort(sortCriteria)
            .select(
                "Title Description Category Price Product_RatingAverage Visits Basket_Counter Location"
            );

        if (filteredProducts.length === 0) {
            // If no products match the criteria, return a 404 error
            return res.status(404).json({
                error: "Could not find products with that category or criteria.",
            });
        }

        // Return the filtered products
        return res.status(200).json(filteredProducts);
    } catch (error) {
        // If an error occurs, return a 500 error
        return res.status(500).json({ error: error.message });
    }
};
module.exports = {
    getAllProducts,
    getProduct,
    getProduct,
    getAllCategorys,
    getProductByCategory,
    FilterProducts,
    searchProduct,
};
