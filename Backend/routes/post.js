const exprees=require("express");
const { authMiddleware } = require("../auth");
const { PrismaClient } = require('@prisma/client');
const router=exprees.Router();
const prisma=new PrismaClient();

router.post("/",authMiddleware, async (req,res)=>{

    //creating the post of the particular user
try{
    const result=await prisma.Post.create({
        data:{
            userId:parseInt(req.userId),
            content:req.body.content
        }
    })
    return res.json({
        message:"You post is created"
    })}catch(err){
        return res.status(400).json({
            message:"Internal server error"
        })
    }
})

//fetching the particular content of the particular post
router.get("/post/:postId",authMiddleware,async (req,res)=>{
    try{
      const postId=parseInt(req.params.postId);
      const post=await prisma.Post.findUnique({
        where:{
            id:postId
        }
      })
    
    return res.json(post)}
    catch(err){
        return res.status(400).json({
            message:"Internal Server error"
        })
    }
     
})
router.post('/posts/:postId/like',authMiddleware,async (req,res)=>{
try{
    const postId=req.params.postId;

    //check if the post is already liked by the user
    const existinglike=await prisma.like.findUnique({
        where:{
            userId_postId: {
                userId: parseInt(req.userId),
                postId: parseInt(postId)
              }
        }
    })

    if(existinglike){
        return res.status(400).json({
            message:"Post already liked by the user"
        })
    }

    const like=await prisma.Like.create({
        data:{
            userId:parseInt(req.userId),
            postId:parseInt(postId)
        }
    })
    return res.json(like)

}catch(err){
    return res.status(400).json({
        message:"Internal server error"
    })
}

})

router.post('/posts/:postId/unlike',authMiddleware,async (req,res)=>{
    try{
       const postId=req.params.postId;
        const existingLike = await prisma.Like.findUnique({
            where: {
              userId_postId: {
                userId: parseInt(req.userId),
                postId: parseInt(postId)
              }
            }
          });
      
          if (!existingLike) {
            return res.status(400).json({ error: 'Like not found' });
          }
          const like = await prisma.like.delete({
            where: {
              userId_postId: {
                userId: parseInt(req.userId),
                postId: parseInt(postId)
              }
            }
          });
      
          res.json({ message: 'Like removed' });

        }catch(err){
            return res.status(400).json({
                message:"Internal Server Error"
            })
        }
    
})




module.exports=router