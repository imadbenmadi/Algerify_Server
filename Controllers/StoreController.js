const { Users, Stores , Products } = require("../models/Database");
require("dotenv").config();
const Verify_user = require("../Middleware/Verify_user");
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
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "Messing Data" });
        }

        const userToUpdate = await Users.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({ error: "User not found." });
        }

        // Extract fields that can be modified from the request body
        const { FirstName, LastName, Email, Age, Gender, Telephone } = req.body;

        // Update individual fields
        if (FirstName) {
            userToUpdate.FirstName = FirstName;
        }
        if (LastName) {
            userToUpdate.LastName = LastName;
        }
        if (Email) {
            userToUpdate.Email = Email;
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
const EditProduct = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    try {
        const storeId = req.params.storeId;
        const productId = req.params.productId;
        if (!productId || !storeId) {
            return res.status(409).json({ error: "Messing Data" });
        }

        const ProductToUpdate = await Products.findById(productId);
        if (!ProductToUpdate) {
            return res.status(404).json({ error: "Product not found." });
        }
        if (ProductToUpdate.Owner !=  ) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { Title, Describtion, Price } = req.body;
        // Update individual fields
        if (Title) {
            ProductToUpdate.Title = Title;
        }
        if (Describtion) {
            ProductToUpdate.Describtion = Describtion;
        }
        if (Price) {
            ProductToUpdate.Price = Price;
        }
        await ProductToUpdate.save();
        return res
            .status(200)
            .json({ message: "Product updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
// Only Admin can delete a Product
const DeleteProduct = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    try {
        const storeId = req.params.storeId;
        const productId = req.params.productId;
        if (!productId) return res.status(409).json({ error: "Messing Data" });
        const Product_in_db = await Products.findById(productId);
        if (!Product_in_db) {
            return res.status(404).json({ error: "Product not found." });
        }
        if (Product_in_db.Owner != storeId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        await Products.findByIdAndDelete(productId);
        return res
            .status(200)
            .json({ message: "Product deleted successfully." });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};

// Only Admin can create a new Product
const CreateProduct = async (req, res) => {
    const isAdmin = await Verify_Admin(req, res);
    if (isAdmin.status == true && isAdmin.Refresh == true) {
        res.cookie("admin_accessToken", isAdmin.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    } else if (isAdmin.status == false && isAdmin.Refresh == false) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    try {
        const {
            FirstName,
            LastName,
            Email,
            Password,
            Telephone,
            Age,
            Gender,
            Address,
        } = req.body;
        if (!FirstName || !LastName || !Email || !Password || !Telephone) {
            return res.status(409).json({ error: "Messing Data" });
        }
        const Product_in_db = await Products.findOne({ Email: Email });
        if (Product_in_db) {
            return res.status(400).json({ error: "Product already exists." });
        }
        const newProduct = new Products({
            FirstName: FirstName,
            LastName: LastName,
            Email: Email,
            Password: Password,
            Telephone: Telephone,
            Age: Age,
            Gender: Gender,
            Address: Address,
            IsEmailVerified: true,
        });
        await newProduct.save();
        return res
            .status(200)
            .json({ message: "Product Created successfully." });
    } catch (error) {
        return res.status(500).json({ error: error });
    }
};
const getProfile = async (req, res) => {
    const userId = req.body.userId;

    if (!userId) return res.status(400).json({ error: "User Id is required." });
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
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(401).json({ error: "user not found." });
        }

        return res.status(200).json(user_in_db);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error." });
    }
};
const DeleteProfile = async (req, res) => {
    const userId = req.body.userId;

    if (!userId) return res.status(400).json({ error: "User Id is required." });
    try {
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ error: "User not found." });
        }

        await Users.findByIdAndDelete(userId);
        return res.status(200).json(user_in_db);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = {
    EditProfile,
    EditProduct,
    DeleteProduct,
    getProfile,
    DeleteProfile,
};
