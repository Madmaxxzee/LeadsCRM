const { MongoClient } = require("mongodb");

const mongoUrl = "mongodb+srv://Admin:Bunny%25404eva@cluster0.nv2dh8x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "real_estate_crm";
const collectionName = "leads";

async function assignLead() {
  const client = new MongoClient(mongoUrl);
  await client.connect();

  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  // You can use _id or email, depending on how you want to find the lead
  const filter = { email: "sajid.azure@gmail.com" };
  const update = { $set: { assignedTo: "agent1" } };

  const result = await collection.updateOne(filter, update);

  await client.close();
  console.log("✅ Lead assigned to agent1", result);
}

assignLead();