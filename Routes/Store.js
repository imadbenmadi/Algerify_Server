const express = require("express");
const router = express.Router();
const StoreController = require("../Controllers/StoreController");
router.put("/:storeId", StoreController.EditStore);
router.put("/:storeId/Products/:productId", StoreController.EditProduct);
router.get("/", StoreController.getAllStores);
router.get("/Profile/:storeId", StoreController.getStore_Profile);
router.get("/:storeId", StoreController.getStore);
router.get("/:storeId/Products", StoreController.getStoreProducts);
router.delete("/:storeId", StoreController.DeleteStore);
router.delete("/:storeId/Products/:productId",StoreController.DeleteProduct);
router.post("/:storeId/Products/Create", StoreController.CreateProduct);

module.exports = router;
