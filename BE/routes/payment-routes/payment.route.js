const express = require("express");
const {
  handleCreateVNPayPayment,
  handleVerifyVNPayReturn,
} = require("../../controllers/payment-controller/payment.controller");

const router = express.Router();

router.post("/vnpay/create", handleCreateVNPayPayment);

router.post("/vnpay/verify-return", handleVerifyVNPayReturn);


module.exports = router;
