require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 9000;
const app = express();
// middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://portfolio2-tawny-eight.vercel.app",
    "https://my-portfolio-f17dc.web.app",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
// app.use(cors());
app.use(cors(corsOptions));

app.use(express.json());

// const verifyToken = async (req, res, next) => {
//   const token = req.cookies?.token;

//   if (!token) {
//     return res.status(401).send({ message: "unauthorized access" });
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       console.log(err);
//       return res.status(401).send({ message: "unauthorized access" });
//     }
//     req.user = decoded;
//     next();
//   });
// };

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@portfolio.llb8y.mongodb.net/?retryWrites=true&w=majority&appName=portfolio`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Generate jwt token
    // app.post("/jwt", async (req, res) => {
    //   const email = req.body;
    //   const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: "365d",
    //   });
    //   res
    //     .cookie("token", token, {
    //       httpOnly: true,
    //       secure: process.env.NODE_ENV === "production",
    //       sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    //     })
    //     .send({ success: true });
    // });
    // Logout
    // app.get("/logout", async (req, res) => {
    //   try {
    //     res
    //       .clearCookie("token", {
    //         maxAge: 0,
    //         secure: process.env.NODE_ENV === "production",
    //         sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    //       })
    //       .send({ success: true });
    //   } catch (err) {
    //     res.status(500).send(err);
    //   }
    // });

    const db = client.db("portfolioDB");
    const technologiesCollection = db.collection("technologies");
    const projectsCollection = db.collection("projects");
    const userCollection = db.collection("users");
    const messageCollection = db.collection("messages");
    const feedbackCollection = db.collection("feedbacks");
    const certificateCollection = db.collection("certificates");

    /**************************
     * Admin Related API
     **************************/
    app.post("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = req.body;
      const isExist = await userCollection.findOne(query);
      if (isExist) {
        return res.send({ message: "Already Exists" });
      }
      const result = await userCollection.insertOne({
        ...user,
        role: "admin",
        Timestamp: new Date(),
      });
      res.send(result);
    });

    // get user role
    app.get("/user/role/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send({ role: result?.role });
    });

    /**************************
     * Technologies Related API
     **************************/
    app.get("/technologies", async (req, res) => {
      const result = await technologiesCollection.find().toArray();
      res.send(result);
    });

    /**************************
     * Feedback Related API
     **************************/
    app.post("/feedbacks", async (req, res) => {
      const feedback = req.body;
      const result = await feedbackCollection.insertOne(feedback);
      res.send(result);
    });

    app.get("/feedbacks", async (req, res) => {
      const result = await feedbackCollection.find().toArray();
      res.send(result);
    });

    /**************************
     * Message Related API
     **************************/
    app.post("/messages", async (req, res) => {
      const message = req.body;
      const result = await messageCollection.insertOne(message);
      res.send(result);
    });

    app.delete("/messages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await messageCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/messages", async (req, res) => {
      const result = await messageCollection.find().toArray();
      res.send(result);
    });

    /**************************
     * Projects Related API
     **************************/
    app.get("/projects", async (req, res) => {
      const result = await projectsCollection
        .find()
        .sort({ createdAt: -1 })
        // .limit(3)
        .toArray();
      res.send(result);
    });

    app.get("/projects/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await projectsCollection.findOne(query);
      res.send(result);
    });

    app.post("/projects", async (req, res) => {
      const project = req.body;
      const result = await projectsCollection.insertOne(project);
      res.send(result);
    });

    /**************************
     * Certificate Related API
     **************************/
    app.post("/certificate", async (req, res) => {
      const certificate = req.body;
      const result = await certificateCollection.insertOne(certificate);
      res.send(result);
    });

    app.get("/certificate", async (req, res) => {
      const result = await certificateCollection
        .find()
        .sort({ createdAt: -1 })
        // .limit(3)
        .toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Portfolio Server..");
});

app.listen(port, () => {
  console.log(`Portfolio is running on port ${port}`);
});
