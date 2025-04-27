const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = 3000;

const mongoUrl = "mongodb+srv://Admin:Bunny%25404eva@cluster0.nv2dh8x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "real_estate_crm";
const collectionName = "leads";

app.use(cors());
app.use(bodyParser.json());
app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

function requireLogin(req, res, next) {
  if (req.session.user) next();
  else res.redirect("/login.html");
}

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  try {
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, "users.json"), "utf8"));
    const adminUsers = ["admin"];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      req.session.user = username;
      req.session.role = adminUsers.includes(username) ? "admin" : "agent";
      res.json({
        success: true,
        message: "Login successful",
        redirectTo: req.session.role === "admin" ? "/dashboard.html" : "/agent-dashboard.html"
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

app.get("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: "Logged out" });
});

app.get("/dashboard.html", (req, res) => {
  if (req.session.user && req.session.role === "admin") {
    res.sendFile(path.join(__dirname, "dashboard.html"));
  } else {
    res.redirect("/login.html");
  }
});

app.get("/agent-dashboard.html", (req, res) => {
  if (req.session.user && req.session.role === "agent") {
    res.sendFile(path.join(__dirname, "agent-dashboard.html"));
  } else {
    res.redirect("/login.html");
  }
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/submit-lead", async (req, res) => {
  const { name, email, phone, projectId } = req.body;
  if (!name || !email || !phone || !projectId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    await client.db(dbName).collection(collectionName).insertOne({
      name, email, phone, projectId, timestamp: new Date()
    });
    await client.close();
    res.status(200).json({ message: "Lead captured successfully" });
  } catch (err) {
    console.error("MongoDB Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/leads", async (req, res) => {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const leads = await client.db(dbName).collection(collectionName)
      .find().sort({ timestamp: -1 }).toArray();
    await client.close();
    res.json(leads);
  } catch (err) {
    console.error("Error fetching leads:", err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

app.get("/api/assigned-leads", async (req, res) => {
  const user = req.session.user || req.query.user;
  if (!user) return res.status(400).json({ error: "Username required" });

  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const assignedLeads = await client.db(dbName).collection(collectionName)
      .find({ assignedTo: user }).sort({ timestamp: -1 }).toArray();
    await client.close();
    res.json(assignedLeads);
  } catch (err) {
    console.error("Error fetching assigned leads:", err);
    res.status(500).json({ error: "Failed to fetch assigned leads" });
  }
});

app.post("/api/assign-lead", async (req, res) => {
  const { leadId, assignedTo } = req.body;
  if (!leadId || typeof assignedTo !== "string") {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }

  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    await client.db(dbName).collection(collectionName)
      .updateOne({ _id: new ObjectId(leadId) }, { $set: { assignedTo } });
    await client.close();
    res.json({ success: true });
  } catch (err) {
    console.error("Error assigning lead:", err);
    res.status(500).json({ success: false, message: "Failed to assign lead" });
  }
});

app.post("/api/users/add", (req, res) => {
  const { username, password } = req.body;
  const usersPath = path.join(__dirname, "users.json");

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required" });
  }

  const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  users.push({ username, password });
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.json({ success: true, message: "User added successfully" });
});

app.post("/api/users/delete", (req, res) => {
  const { username } = req.body;
  const usersPath = path.join(__dirname, "users.json");

  if (!username) return res.status(400).json({ success: false, message: "Username required" });

  let users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
  const filtered = users.filter(u => u.username !== username);

  if (filtered.length === users.length) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  fs.writeFileSync(usersPath, JSON.stringify(filtered, null, 2));
  res.json({ success: true, message: "User deleted successfully" });
});

app.get("/api/residences/:projectId", (req, res) => {
  const projectPath = path.join(__dirname, "media", req.params.projectId);
  if (!fs.existsSync(projectPath)) return res.status(404).json({ error: "Project not found" });

  const folders = fs.readdirSync(projectPath)
    .filter(name => fs.statSync(path.join(projectPath, name)).isDirectory())
    .filter(name => name.toLowerCase().includes("apartment"));

  res.json(folders);
});

// ✅ Updated Template Routing Logic
app.get("/", async (req, res) => {
  const projectId = req.query.projectId; // << correct param
  if (!projectId) return res.status(400).send("Missing project ID");

  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const project = await client.db(dbName).collection("projects").findOne({ projectId: projectId });
    await client.close();

    if (!project) return res.status(404).send("Project not found");

    const template = project.template || "template1";
    const templateFile = `${template}.html`;
    const templateDir = path.join(__dirname, "templates", template);
    const templatePath = path.join(templateDir, templateFile);

    if (!fs.existsSync(templatePath)) return res.status(404).send("Template not found");

    res.sendFile(templatePath);
  } catch (err) {
    console.error("Error loading project:", err);
    res.status(500).send("Internal server error");
  }
});

// Static File Routes
app.use('/projects', express.static(path.join(__dirname, 'projects')));
app.use('/templates', express.static(path.join(__dirname, 'templates')));
app.use('/media', express.static(path.join(__dirname, 'media')));
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
