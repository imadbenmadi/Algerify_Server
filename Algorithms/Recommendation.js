const {
    Users,
    Products,
    UserActions,
    Categories,
} = require("../models/Database");
require("dotenv").config();


const Recommended_Products = async (req, res) => {
    const products = await Products.find();
    const categories = await Categories.find();
    if (!products.length)
        return res.status(404).json({ message: "No Product for the moment" });
    if (!categories.length)
        return res.status(404).json({ message: "No Category for the moment" });

    
    const mostVisitedProducts = await Products.find()
        .sort({ Visits: -1 })
        .limit(30);
    
    const userId = req.params.id;
    if (!userId) return res.status(409).json({ error: "Missing Data" });
    try {
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            // return res.status(404).json({ error: "User not found." });
             return res
                 .status(200)
                 .json({ recommendedProducts: mostVisitedProducts });
        }
        const userActions = await UserActions.findOne({ userId: userId });
        if (!userActions || !user_in_db) {
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
                return res
                    .status(200)
                    .json({ recommendedProducts: mostVisitedProducts });
            } catch (err) {
                // return res.status(404).json({
                //     error: "UserActions not found. could not Create documnet",
                // });
                 return res
                     .status(200)
                     .json({ recommendedProducts: mostVisitedProducts });
            }
        }
        const score = categories.map((category) => ({
            [category.Category]: 0,
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
        for (const category of categoriesScore) {
            const categoryName = Object.keys(category)[0];
            const percentage = Object.values(category)[0];
            const numberOfProductsToRecommend = Math.ceil(
                (percentage / 100) * 30
            );
            const productsFromCategory = await Products.find({
                Category: categoryName,
            })
                .sort({ Visits: -1 })
                .limit(numberOfProductsToRecommend);
            recommendedProducts =
                recommendedProducts.concat(productsFromCategory);
            remainingRecommendations -= productsFromCategory.length;
        }

        // If there are remaining recommendations
        if (remainingRecommendations > 0) {
            for (const category of categoriesScore) {
                const categoryName = Object.keys(category)[0];
                const percentage = Object.values(category)[0];
                if (percentage < 10 && remainingRecommendations > 0) {
                    const productsFromCategory = await Products.find({
                        Category: categoryName,
                    })
                        .sort({ Visits: -1 })
                        .limit(remainingRecommendations);
                    recommendedProducts =
                        recommendedProducts.concat(productsFromCategory);
                    remainingRecommendations -= productsFromCategory.length;
                }
            }
        }

        if (recommendedProducts.length > 0) {
            // Sort recommended products by Most Visited
            recommendedProducts.sort((a, b) => b.Visits - a.Visits);
            return res
                .status(200)
                .json({ categoriesScore, recommendedProducts });
        } else {
            const mostVisitedProducts = await Products.find()
                .sort({ Visits: -1 })
                .limit(30);
            return res.status(200).json({
                categoriesScore,
                recommendedProducts: mostVisitedProducts,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};
