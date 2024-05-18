const { PrismaClient } = require('@prisma/client');
const {JWT_SECRET}=require("../config")
const jwt=require('jsonwebtoken');
const express=require("express");
const zod=require("zod");
const { authMiddleware } = require('../auth');
const signupbody=zod.object({
    username:zod.string(),
    email:zod.string().email(),
    passwordHash:zod.string().min(6),
    fullname:zod.string().optional(),
    bio:zod.string().optional(),
    profilepictureUrl:zod.string().optional(),


})
const signinbody=zod.object({
    username:zod.string(),
    passwordHash:zod.string().min(6)
})
const router=express.Router();
const prisma=new PrismaClient();
//creating the user
router.post("/signup",async (req,res)=>{
    try{const success =signupbody.safeParse(req.body);
    if(!success){
       return  res.status(411).json({
            message:"Invalid inputs"
        })
    }
   
    const existingUser =await prisma.User.findUnique({
        where:{
            username:req.body.username
        }
    })
    if(existingUser){
        return res.status(411).json({
            message:"Email already taken"
        })
    }
    const result=await prisma.User.create({
        data:{
            username:req.body.username,
            email:req.body.email,
            passwordHash:req.body.passwordHash
        }
    })
    const userId=result.id;
    const token=jwt.sign({
        userId
    },JWT_SECRET)
    res.json({
        message:"User created successfully",
        token:token
    })}catch(err){
        return res.status(400).json({
            message:"Internal Server error"
        })
    }
    

})
//signing up the user
router.post("/signin",async (req,res)=>{

    const {success}=signinbody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message:"Invalid inputs"
        })
    }
    const user=await prisma.User.findUnique({
        where:{
            username:req.body.username,
            passwordHash:req.body.passwordHash
        }
    })
    if(!user){
        return res.status(411).json({
            message:"You can not sign in ! You need to sign up first"
        })
    }
    const userId=user.id;
    const token=jwt.sign({
        userId
    },JWT_SECRET)

    res.json({
        message:"You are signed in and Welcome",
        token:token
    })
})
//finding the user with the given username
router.get("/find",async (req,res)=>{
  try{const result=await prisma.User.findUnique({
    where:{
        username:req.body.username
    }
  })

  if(!result){
    return res.json({
        message:"No user with this username"
    })
  }
   return res.json({
    message:"user found",
    userId:result.id,
    email:result.email,
    bio:result.bio,
    fullname:result.fullname,
    profilePictureUrl:result.profilePictureUrl
   })
}catch(err){
    return res.status(400).json({
        message:"Internal server error"
    })
}
})

//following the user
router.post('/follows', authMiddleware,async (req, res) => {
    try{
    const follow = await prisma.Follows.create({
              data: {
             followerId:parseInt(req.userId),

                followeeId:parseInt(req.body.followeeId)
              },
            });
    res.json(follow);
        }catch(err){
            return res.status(400).json({
                message:"Internal server error"
            })
        }
  });

  router.get('/feed',authMiddleware,async (req,res)=>{

       
        const feed = await prisma.post.findMany({
            where: {
              OR: [
                { userId: parseInt(req.userId) },
                {
                  user: {
                    followers: {
                      some: {
                        followerId: parseInt(req.userId)
                      }
                    }
                  }
                }
              ]
            },
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              user: false, // Include user information for each post
              _count: {
                select: {
                  likes: true,
                  comments: true
                }
              }
            }
          });
          res.json(feed)
       
      
  })
  

module.exports=router;