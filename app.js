import express from 'express';
import router from './router/web.js';
import connectdb from './db/connectdb.js';
const app=express();
const port=process.env.PORT || 9500;
const DATABASE_URL=process.env.DATABASE_URL || "mongodb+srv://karan:karan12712@cluster0.z9qdea3.mongodb.net/";

connectdb(DATABASE_URL);
app.use(express.json())

app.use('/',router)


app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
})