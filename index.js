const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = 3000;

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://PawMart:yUrTowfbsfaN1ssj@cluster0.fmz6hpp.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const database = client.db("PawMart");
    const productList = database.collection("productList");

    // post or save product data
    app.post("/add-product-form", async (req, res) => {
      const data = req.body;
      const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
      data.createdAt = date;
      console.log(data);
      const result = await productList.insertOne(data);
      res.send(result);
    });

    // get product data
    app.get("/add-product-form", async (req, res) => {
      const result = await productList.find().toArray();
      res.send(result);
    });

    app.get("/product-details/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const query = { _id: new ObjectId(id) };
      const result = await productList.findOne(query);
      res.send(result);
    });

    // get data by email
    app.get("/my-products", async (req, res) => {
      const { email } = req.query;
      const query = { email: email };
      const result = await productList.find(query).toArray();
      res.send(result);
    });

    // update data
    app.put("/update/:id", async (req, res) => {
      const data = req.body;
      const id = req.params;
      const query = { _id: new ObjectId(id) };

      const updateServices = {
        $set: data,
      };

      const result = await productList.updateOne(query, updateServices);
      res.send(result);
    });

    // get product data by category
    app.get("/filtered-category/:category", async (req, res) => {
      try {
        const category = req.params.category.trim();
        console.log("Category requested:", category);

        const query = { category: { $regex: new RegExp(`^${category}$`, "i") } };

        const products = await productList.find(query).sort({ _id: -1 }).limit(4).toArray();

        if (!products.length) {
          return res.status(404).send({ message: "No products found for this category" });
        }

        res.send(products);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch products by category" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Paws Lover!");
});

app.listen(port, () => {
  console.log(`Sever is running on the port: ${port}`);
});
