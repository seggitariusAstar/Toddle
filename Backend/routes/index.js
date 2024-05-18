const express=require("express");
const router=express.Router();
const userRouter=require("./user");
const postrouter=require("./post")
router.use("/user",userRouter);
router.use("/post",postrouter);
module.exports =router;