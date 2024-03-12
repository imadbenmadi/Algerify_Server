const {
    Products,
    Users,
    UserActions,
    Categories,
} = require("../models/Database");
require("dotenv").config();

const getAllProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;

    try {
        const totalCount = await Products.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);
        const skip = (page - 1) * limit;

        const allProducts = await Products.find()
            .select("Title Describtion Category Price Product_RatingAverage")
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ totalPages, products: allProducts });
    } catch (error) {
        return res.status(500).json({ error });
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
        if (req.body.userId) {
            const userActions = await UserActions.findOne({
                userId: req.body.userId,
            });
            if (userActions) {
                const alreadyVisited = userActions.Visited_Products.some(visit => visit.productId.equals(productId));
                if (!alreadyVisited) {
                    userActions.Visited_Products.push({
                        productId: productId,
                        time: new Date(),
                    });
                    await userActions.save();
                    await Products.findByIdAndUpdate(productId, {
                        $inc: { Visits: 1 },
                    });
                }
            }
            
        }

        return res.status(200).json(Product_in_db);
    } catch (error) {
        console.log(error);
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
    if (!category) return res.status(409).json({ error: "Missing Data" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    try {
        const totalCount = await Products.countDocuments({
            Category: category,
        });
        const totalPages = Math.ceil(totalCount / limit);
        const skip = (page - 1) * limit;

        const products = await Products.find({ Category: category })
            .select("Title Describtion Category Price Product_RatingAverage")
            .skip(skip)
            .limit(limit);

        if (!products || products.length === 0) {
            return res
                .status(404)
                .json({ error: "Could not find products with that category" });
        }

        return res.status(200).json({ totalPages, products });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const searchProduct = async (req, res) => {
    const search = req.params.search;
    const page = parseInt(req.query.page) || 1; // default to page 1 if not provided
    let limit = parseInt(req.query.limit) || 20; // default to limit of 20 if not provided

    try {
        if (!search) {
            return res.status(400).json({ error: "Missing Data" });
        }

        const count = await Products.countDocuments({
            Title: { $regex: `.*${search}.*`, $options: "i" },
        });

        const totalPages = Math.ceil(count / limit);
        const skip = (page - 1) * limit;

        // Adjust limit if total documents are less than requested limit
        if (count < limit) {
            limit = count;
        }

        const products = await Products.find({
            Title: { $regex: `.*${search}.*`, $options: "i" },
        })
            .select("Title Description Category Price Product_RatingAverage")
            .skip(skip)
            .limit(limit);

        if (products.length === 0) {
            return res.status(404).json({
                error: "No products found matching the search query.",
            });
        }

        return res.status(200).json({ totalPages, products });
    } catch (error) {
        return res.status(500).json({ error: error});
    }
};

const FilterProducts = async (req, res) => {
    const { category, price, rate, sortBy, location } = req.query;
    const page = parseInt(req.query.page) || 1; // default to page 1 if not provided
    let limit = parseInt(req.query.limit) || 20; // default to limit of 20 if not provided

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

        // Find total count of products matching the specified criteria
        const totalCount = await Products.countDocuments(query);

        // Calculate total number of pages
        const totalPages = Math.ceil(totalCount / limit);

        // Calculate skip based on pagination
        const skip = (page - 1) * limit;

        // Define default sorting criteria
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

        // Find products matching the specified criteria, sort them, and paginate the results
        const filteredProducts = await Products.find(query)
            .sort(sortCriteria)
            .skip(skip)
            .limit(limit)
            .select(
                "Title Description Category Price Product_RatingAverage Visits Basket_Counter Location"
            );

        if (filteredProducts.length === 0) {
            // If no products match the criteria, return a 404 error
            return res.status(404).json({
                error: "Could not find products with that category or criteria.",
            });
        }

        // Return the filtered products and total number of pages
        return res.status(200).json({ totalPages, filteredProducts });
    } catch (error) {
        // If an error occurs, return a 500 error
        console.error(error);
        return res.status(500).json({ error: error });
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
