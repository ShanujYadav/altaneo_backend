import { app } from './app.js'
import dotenv from 'dotenv'
import connectDB from './src/db/connectDB.js'

dotenv.config({
    path:'../env'
})

app.get('/altaneo/hello', (req, res) => {
    res.status(200).send('Ha bhai');
});

connectDB()
.then(()=>{
    app.listen(process.env.PORT|| 8000,()=>{
        console.log(`Server is running at ${process.env.PORT}`);
   })
})

.catch((err)=>{
    console.log('Error=---',err)
})