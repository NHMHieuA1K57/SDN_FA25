const express = require("express");
const {
  createOrder,
  capturePaymentAndFinalizeOrder,
} = require("../../controllers/student-controller/order-controller");

const router = express.Router();


module.exports = router;
