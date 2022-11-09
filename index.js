const express= require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000
require('dotenv').config()

app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Hello World')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tgkwl01.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyJWT = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'})
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
        if(err){
            return res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded = decoded
        next()
    })
}
const run = async()=>{
    try{
        const servicesCollection = client.db('wildPhotographer').collection('services')
        const reviewCollection = client.db('wildPhotographer').collection('review')

        app.post('/jwt',(req,res)=>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '4h'})
            res.send({token})
        })


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
            const result = await servicesCollection.findOne(query)
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
            const cursor = reviewCollection.find(query).sort({$natural:-1})
            const review = await cursor.toArray();
            res.send(review)
        }) 

        app.get('/edit/:id', async(req,res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const cursor =  reviewCollection.find(query)
            const review = await cursor.toArray();
            res.send(review)
        }) 

        app.put('/edit/:id', async(req,res)=>{
            const id = req.params.id;
            const review = req.body;
            const filter = {_id: ObjectId(id)}
            const option = {upsert: true}
            const updateReview = {
                $set:{
                    reviewText: review.reviewText,
                    email: review.email,
                    fullName: review.fullName,
                    image: review.image
                }
            }
            const result = await reviewCollection.updateOne(filter,updateReview,option)
            res.send(result)

        })

        app.get('/myReview',verifyJWT,async(req,res)=>{
            const decoded = req.decoded;
            console.log(decoded.email);
            if(decoded.email !== req.query.email){
            return res.status(401).send({message: 'unauthorized access'})
            }
            const email = req.query.email;
            const query = {email}
            const cursor = reviewCollection.find(query).sort({$natural:-1})
            const review = await cursor.toArray()
            res.send(review)
        }) 

        app.delete('/delete/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
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