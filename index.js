const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.izhds6e.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

client.connect(err => {
    const toyCollection = client.db('danyDB').collection('toys');

    app.get('/toy', async (req, res) => {
        const serchText = req.query.name;
        const query = {name: serchText};
        const result = await toyCollection.find(query).toArray();
        res.json(result);
    });

    app.get('/toys', async (req, res) => {
        const limit = parseInt(req.query.limit);

        console.log(limit);
        if (limit) {
            const result = await toyCollection.find().limit(limit).toArray();
            return res.json(result);
        }
        const result = await toyCollection.find().toArray();
        return res.json(result);

    })
    app.get('/toy/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await toyCollection.findOne(query);
        res.json(result);
    })

    app.get('/my-toys', async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const sortToy = parseInt(req.query.sort);
        const options = {
            sort: {price: sortToy}
        }
        if (sortToy) {
            const result = await toyCollection.find(query, options).toArray();
            return res.json(result);
        }
        const result = await toyCollection.find(query).toArray();
        res.json(result);
    });

    // Toy POST request
    app.post('/add-toy', async (req, res) => {
        const body = req.body;
        const result = await toyCollection.insertOne(body);
        res.json(result);
    });

    // MyToy Edit
    app.put('/my-toys/edit/:id', async (req, res) => {
        const id = req.params.id;
        const body = req.body;
        console.log(body);
        const filter = { _id: new ObjectId(id) };
        const updateToys = {
            $set: {
                price: body.price,
                quantity: body.quantity,
                description: body.description
            }
        }
        const result = await toyCollection.updateOne(filter, updateToys);
        res.json(result)
    });

    // MyToys Delete
    app.delete('/my-Toys/delete/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await toyCollection.deleteOne(query);
        res.json(result);
    });

});


app.get("/", (req, res) => {
    res.send("Welcome to Dany Server!");
})

app.listen(port, () => {
    console.log("Server is running on port " + port);
})