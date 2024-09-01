const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const PORT = process.env.PORT || 8000;
const cors = require("cors");

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: ["https://mernblog-frontend-phi.vercel.app"],
    methods: ["POST", "GET"],
    credentials: true,
  })
);
mongoose.connect(
  "mongodb+srv:MujShif01:MujShif@2002@cluster0.5zvzd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

//Initialze middleware
app.use(express.json({ extended: false }));
const withDB = async (operations, res) => {
  try {
    const client = await MongoClient.connect("mongodb://localhost:27017");
    const db = client.db("mernblog");
    await operations(db);
    client.close();
  } catch (error) {
    res.status(500).json({ message: "Error connecting to databse", error });
  }
};

app.get("/api/articles/:name", async (req, res) => {
  withDB(async (db) => {
    const articleName = req.params.name;
    const articlesInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    res.status(200).json(articlesInfo);
  }, res);
});
//just a test route for now
app.post("/api/articles/:name/add-comments", (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;
  withDB(async (db) => {
    const articlesInfo = await db.collection("articles").findOne({
      name: articleName,
    });
    await db.collection("articles").updateOne(
      { name: articleName },
      {
        $set: {
          comments: articlesInfo.comments.concat({ username, text }),
        },
      }
    );
    const updateArticlesInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    res.status(200).json(updateArticlesInfo);
  }, res);
});

app.listen(PORT, () => console.log(`server start at port ${PORT}`));
