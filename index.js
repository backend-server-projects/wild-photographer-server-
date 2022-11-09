const express= require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000
require('dotenv').config()

app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Hello World')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tgkwl01.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run = async()=>{
    try{
        const servicesCollection = client.db('wildPhotographer').collection('services')
        const reviewCollection = client.db('wildPhotographer').collection('review')
        app.get('/services',async(req,res)=>{
            const query = {}
            const cursor = servicesCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })

      
    }
    finally{}
}

run().catch(err=>{
    console.error(err);
})




app.listen(port, ()=>{
    console.log('Server running on:', port);
})