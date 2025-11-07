// configs/momo.js
import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const createMoMoPayment = async (orderId, amount, orderInfo) => {
    const requestId = orderId + new Date().getTime();
    const rawSignature =
        "accessKey=" +
        process.env.MOMO_ACCESS_KEY +
        "&amount=" +
        amount +
        "&extraData=" +
        "" +
        "&ipnUrl=" +
        process.env.MOMO_NOTIFY_URL +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        orderInfo +
        "&partnerCode=" +
        process.env.MOMO_PARTNER_CODE +
        "&redirectUrl=" +
        process.env.MOMO_RETURN_URL +
        "&requestId=" +
        requestId +
        "&requestType=captureWallet";

    const signature = crypto
        .createHmac("sha256", process.env.MOMO_SECRET_KEY)
        .update(rawSignature)
        .digest("hex");

    const requestBody = {
        partnerCode: process.env.MOMO_PARTNER_CODE,
        accessKey: process.env.MOMO_ACCESS_KEY,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl: process.env.MOMO_RETURN_URL,
        ipnUrl: process.env.MOMO_NOTIFY_URL,
        extraData: "",
        requestType: "captureWallet",
        signature,
        lang: "vi",
    };

    const { data } = await axios.post(process.env.MOMO_API_URL, requestBody);
    return data;
};
