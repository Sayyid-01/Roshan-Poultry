const router = require("express").Router();
const { getMovements, adjustStock } = require("../controllers/inventory.controller");

router.get("/movements", getMovements);
router.patch("/:id/adjust", adjustStock);

module.exports = router;
