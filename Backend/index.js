const express=require("express");
const app=new express();
const cors=require("cors");
const mainrouter=require("./routes/index")

app.use(cors());
app.use(express.json());
app.use("/",mainrouter);



app.listen(3000,(err)=>{
    console.log("The server is running at port 3000");
})

