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


        app.post('/services', async(req,res)=>{
            const getService = req.body;
            const service = await servicesCollection.insertOne(getService)
            service.id = service.insertedId;
            res.send(service)
        }) 

        app.get('/homeServices',async(req,res)=>{
            const query = {}
            const cursor = servicesCollection.find(query)
            const services = await cursor.limit(3).toArray()
            res.send(services)
        }) 

        app.get('/details/:id', async(req,res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const cursor = servicesCollection.findOne(query)
            const result = await cursor;
            res.send(result);
        }) 


        app.post('/review', async(req,res)=>{
            const getReview = req.body;
            const review = await reviewCollection.insertOne(getReview)
            review.id = review.insertedId;
            res.send(review)
        }) 
        
        app.get('/review/:id', async(req,res)=>{
            const review_id = req.params.id
            const query = {review_id}
            const cursor = reviewCollection.find(query)
            const review = await cursor.toArray();
            res.send(review)
        }) 

        app.get('/myReview',async(req,res)=>{
            const email = req.headers.email;
            const query = {email}
            const cursor = reviewCollection.find(query)
            const review = await cursor.toArray()
            res.send(review)
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