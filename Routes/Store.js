const express = require("express");
const router = express.Router();
const StoreController = require("../Controllers/StoreController");
router.put("/:storeId", StoreController.EditStore);
router.get("/:storeId", StoreController.getStore);
router.get("/:storeId/Products", StoreController.getStoreProducts);
router.get("/", StoreController.getAllStores);
router.delete("/:storeId", StoreController.DeleteStore);
router.post("/Create", StoreController.CreateStore);
router.get("/getRate/:storeId", StoreController.getRate);
router.post("/RateStore/:userId", StoreController.RateStore);
router.delete("/RateStore/:userId", StoreController.RateStore);

module.exports = router;
