const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const idArg = args.find(arg => arg.startsWith("--id="));
const titleArg = args.find(arg => arg.startsWith("--title="));

if (!idArg || !titleArg) {
  console.error("Usage: node createProject.js --id=102 --title=\"Project Name\"");
  process.exit(1);
}

const projectId = idArg.split("=")[1];
const title = titleArg.split("=")[1];
const mediaDir = path.join(__dirname, "media", projectId);
const jsonPath = path.join(__dirname, "projects", `${projectId}.json`);

// 1. Create media folder
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
  fs.writeFileSync(path.join(mediaDir, "project.jpg"), "");
  fs.writeFileSync(path.join(mediaDir, "brochure.pdf"), "");
  console.log(`✅ Created media/${projectId}/ with empty files`);
} else {
  console.log(`⚠️  media/${projectId}/ already exists`);
}

// 2. Create JSON file
const jsonContent = {
  title: title,
  heading: "Your heading here",
  subheading: "Your subheading here",
  image: `media/${projectId}/project.jpg`,
  brochure: `media/${projectId}/brochure.pdf`
};

if (!fs.existsSync(jsonPath)) {
  fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2));
  console.log(`✅ Created projects/${projectId}.json`);
} else {
  console.log(`⚠️  projects/${projectId}.json already exists`);
}
