const mongoose = require("mongoose");
const Users = mongoose.model(
    "Users",
    new mongoose.Schema({
        FirstName: { type: String },
        LastName: { type: String },
        Telephone: { type: String },
        Email: { type: String },
        Password: { type: String },
        Age: { type: Number },
        Gender: { type: String, enum: ["male", "female"] },
        ProfilePic: { type: String },
        Address: { type: String },
        IsEmailVerified: { type: Boolean, default: false },
        Notifications: [
            {
                Type: {
                    type: String,
                    enum: ["verify", "contact", "other"],
                },
                Title: { type: String },
                Text: { type: String },
                Date: { type: Date },
                Readed: { type: Boolean, default: false },
            },
        ],
        basket: [
            { ProductId: { type: mongoose.Types.ObjectId, ref: "Products" } },
        ],
        Favorite: [
            { ProductId: { type: mongoose.Types.ObjectId, ref: "Products" } },
        ],
        intrested_products: [
            { ProductId: { type: mongoose.Types.ObjectId, ref: "Products" } },
        ],
        not_intrested_products: [
            { ProductId: { type: mongoose.Types.ObjectId, ref: "Products" } },
        ],
        Stores: [{ StoreId: { type: mongoose.Types.ObjectId, ref: "Stores" } }],
        Followed_Stores: [
            { StoreId: { type: mongoose.Types.ObjectId, ref: "Stores" } },
        ],
    })
);
const Refresh_tokens = mongoose.model(
    "refresh_tokens",
    new mongoose.Schema({
        userId: { type: mongoose.Types.ObjectId, ref: "Users" },
        token: { type: String },
    })
);
const email_verification_tokens = mongoose.model(
    "email_verification_tokens",
    new mongoose.Schema({
        userId: { type: mongoose.Types.ObjectId, ref: "Users" },
        token: { type: String },
        expire: { type: Date, default: Date.now() + 24 * 60 * 60 * 1000 },
        Date: { type: Date, default: Date.now() },
    })
);

const Stores = mongoose.model(
    "Stores",
    new mongoose.Schema({
        Owner: { type: mongoose.Types.ObjectId, ref: "Users" },
        Email: { type: String },
        Password: { type: String },
        StoreName: { type: String },
        Store_Describtion: { type: String },
        Telephone: { type: String },
        Location: { type: String },
        Store_Image: { type: String },
        Followers: [{ type: mongoose.Types.ObjectId, ref: "Users" }],
        Ratings: [
            {
                userId: { type: mongoose.Types.ObjectId, ref: "Users" },
                rate: { type: Number },
            },
        ],
        Store_RatingAverage: { type: Number, default: 0 },
        storeProducts: [{ type: mongoose.Types.ObjectId, ref: "Products" }],
        Visits: { type: Number, default: 0 },
        StoreCategory: { type: String },
    })
);
const Products = mongoose.model(
    "Products",
    new mongoose.Schema({
        Owner: { type: mongoose.Types.ObjectId, ref: "Stores" },
        Title: { type: String },
        Describtion: { type: String },
        Category: {
            type: String,
            // enum: ["Tech", "Kitchen", "Books", "clothes"],
        },
        Price: { type: Number, default: 0 },
        Product_Image: { type: String },
        Comments: [
            {
                user: { type: mongoose.Types.ObjectId, ref: "Users" },
                Comment: { type: String },
            },
        ],
        Ratings: [
            {
                user: { type: mongoose.Types.ObjectId, ref: "Users" },
                rate: { type: Number },
            },
        ],
        Product_RatingAverage: { type: Number, default: 0 },
        Favorite_Counter: { type: Number, default: 0 },
        Basket_Counter: { type: Number, default: 0 },
        bought_Counter: { type: Number, default: 0 },
        Visits: { type: Number, default: 0 },
    })
);
const UserActions = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: "Users" },
    Added_To_Favorite: [
        {
            productId: { type: mongoose.Types.ObjectId, ref: "Products" },
            productTitle: String,
            productCategory: String,
            productPrice: Number,
            time: { type: Date, default: Date.now },
        },
    ],
    Added_To_Basket: [
        {
            productId: { type: mongoose.Types.ObjectId, ref: "Products" },
            productTitle: String,
            productCategory: String,
            productPrice: Number,
            time: { type: Date, default: Date.now },
        },
    ],
    Rated_Products: [
        {
            rate: { type: Number },
            productId: { type: mongoose.Types.ObjectId, ref: "Products" },
            productTitle: String,
            productCategory: String,
            productPrice: Number,
            time: { type: Date, default: Date.now },
        },
    ],
    Commented_Products: [
        {
            Comment: { type: String },
            productId: { type: mongoose.Types.ObjectId, ref: "Products" },
            productTitle: String,
            productCategory: String,
            productPrice: Number,
            time: { type: Date, default: Date.now },
        },
    ],
    Rated_Stores: [
        {
            rate: { type: Number },
            storeId: { type: mongoose.Types.ObjectId, ref: "Stores" },
            storeName: String,
            storeLocation: String,
            StoreCategory: String,
            time: { type: Date, default: Date.now },
        },
    ],
    Visited_Products: [
        {
            productId: { type: mongoose.Types.ObjectId, ref: "Products" },
            productTitle: String,
            productCategory: String,
            productPrice: Number,
            time: { type: Number, default: Date.now() },
        },
    ],
    Visited_Stores: [
        {
            storeId: { type: mongoose.Types.ObjectId, ref: "Stores" },
            storeName: String,
            storeLocation: String,
            StoreCategory: String,
            time: { type: Number, default: Date.now() },
        },
    ],
    Not_interesting_Products: [
        {
            productId: { type: mongoose.Types.ObjectId, ref: "Products" },
            productTitle: String,
            productCategory: String,
            productPrice: Number,
            time: { type: Number, default: Date.now() },
        },
    ],
    interesting_Products: [
        {
            productId: { type: mongoose.Types.ObjectId, ref: "Products" },
            productTitle: String,
            productCategory: String,
            productPrice: Number,
            time: { type: Number, default: Date.now() },
        },
    ],
    Followed_Stores: [
        {
            storeId: { type: mongoose.Types.ObjectId, ref: "Stores" },
            storeName: String,
            storeLocation: String,
            StoreCategory: String,
            time: { type: Number, default: Date.now() },
        },
    ],
});
const Categories = mongoose.model(
    "Categories",
    new mongoose.Schema({
        Categories: ["Tech", "Kitchen", "Books", "clothes"],
        SubCategories: [
            { Tech: ["Mobiles", "Laptops", "Tablets"] },
            { Kitchen: ["Blenders", "Cookers", "Microwaves"] },
            { Books: ["Novels", "Science", "History"] },
            { clothes: ["T-shirts", "Pants", "Jackets"] },
        ],
    })
);

module.exports = {
    Users,
    Refresh_tokens,
    email_verification_tokens,
    Products,
    Stores,
    UserActions,
    Categories,
};
