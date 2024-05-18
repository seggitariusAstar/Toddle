const jwt=require("jsonwebtoken");
const { JWT_SECRET } = require("./config");


const authMiddleware=(req,res,next)=>{

    const authheader=req.headers.authorization;

    if(!authheader || !authheader.startsWith('Bearer')){
        return res.status(403).json({
            message:"Autorization header is not correct"
        })
    }
    const token=authheader.split(' ')[1];
    try{
            const decode=jwt.verify(token,JWT_SECRET)

            if(decode.userId){
                req.userId=decode.userId
                next()
            }
            else{
                return res.status(403).json({
                    message:"You can access this due to the authentication error"
                })
            }
    }
    catch(err){
        return res.status(403).json({
            message:"Server run into error please try again later"
        })
    }

}
module.exports={
    authMiddleware
}