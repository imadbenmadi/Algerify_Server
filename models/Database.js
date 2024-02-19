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
        Stores: [{ StoreId: { type: mongoose.Types.ObjectId, ref: "Stores" } }],
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
        Store_Image: { type: String },
        Store_Ratings: [
            {
                userId: { type: mongoose.Types.ObjectId, ref: "Users" },
                rate: { type: Number },
            },
        ],
        Store_RatingAverage: { type: Number, default: 0 },
        storeProducts: [ { type: mongoose.Types.ObjectId, ref: "Products" } ],
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
                stars: { type: Number },
            },
        ],
        Product_RatingAverage: { type: Number, default: 0 },
    })
);

const UserActions = mongoose.model(
    "UsersActions",
    new mongoose.Schema({
        userId: { type: mongoose.Types.ObjectId, ref: "Users" },
        Favorite_Products: [
            {
                Product_Category: {
                    type: String,
                    enum: ["Tech", "Kitchen", "Books", "clothes"],
                },
                time: { type: Date, default: Date.now },
                Store_Rating_Average: { type: Number },
                Store_Rating_Length: { type: Number },
                Product_Rating_Average: { type: Number },
                Product_Rating_Length: { type: Number },
                Product_Comments_Length: { type: Number },
            },
        ],
        Basket_Products: [
            {
                Product_Category: {
                    type: String,
                    enum: ["Tech", "Kitchen", "Books", "clothes"],
                },
                time: { type: Date, default: Date.now },
                Store_Rating_Average: { type: Number },
                Store_Rating_Length: { type: Number },
                Product_Rating_Average: { type: Number },
                Product_Rating_Length: { type: Number },
                Product_Comments_Length: { type: Number },
            },
        ],
        Rated_Products: [
            {
                rate: { type: Number },
                Product_Category: {
                    type: String,
                    enum: ["Tech", "Kitchen", "Books", "clothes"],
                },
                time: { type: Date, default: Date.now },
                Store_Rating_Average: { type: Number },
                Store_Rating_Length: { type: Number },
                Product_Rating_Average: { type: Number },
                Product_Rating_Length: { type: Number },
                Product_Comments_Length: { type: Number },
            },
        ],
        Commented_Products: [
            {
                Comment: { type: String },
                Product_Category: {
                    type: String,
                    enum: ["Tech", "Kitchen", "Books", "clothes"],
                },
                time: { type: Date, default: Date.now },
                Store_Rating_Average: { type: Number },
                Store_Rating_Length: { type: Number },
                Product_Rating_Average: { type: Number },
                Product_Rating_Length: { type: Number },
                Product_Comments_Length: { type: Number },
            },
        ],
        Rated_Stores: [
            {
                rate: { type: Number },
                Store_Rating_Average: { type: Number },
                Store_Rating_Length: { type: Number },
                Time_Of_Watching: { type: Number },
                time: { type: Date, default: Date.now },
            },
        ],
        Visited_Products: [
            {
                time: { type: Number, default: 0 },
                Product_Category: {
                    type: String,
                    enum: ["Tech", "Kitchen", "Books", "clothes"],
                },
                time: { type: Date, default: Date.now },
                Store_Rating_Average: { type: Number },
                Store_Rating_Length: { type: Number },
                Product_Rating_Average: { type: Number },
                Product_Rating_Length: { type: Number },
                Product_Comments_Length: { type: Number },
            },
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
};
