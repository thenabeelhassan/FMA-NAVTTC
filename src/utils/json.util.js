const fs = require("fs/promises");
const path = require("path");

// Base path for JSON files
const DB_PATH = path.join(__dirname, "../../db");

async function getJsonFiles() {
  const files = await fs.readdir(DB_PATH);
  return files.filter((f) => f.endsWith(".json"));
}

async function readJson(fileName) {
  if (!fileName.endsWith(".json")) fileName += ".json"; // <-- auto fix
  const filePath = path.join(DB_PATH, fileName);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

// Get parent keys
function getParentKeys(jsonData) {
  return Object.keys(jsonData);
}

// Get first-level child keys for a given parent
function getChildKeys(jsonData, parentKey) {
  if (!jsonData[parentKey]) return [];
  return Object.keys(jsonData[parentKey]);
}

// Get name & CNIC for selected parent + child
function getEntries(jsonData, parentKey, childKey) {
  if (!jsonData[parentKey] || !jsonData[parentKey][childKey]) return [];
  const entries = Object.values(jsonData[parentKey][childKey]);
  return entries; // array of {CNIC, Name}
}

module.exports = {
  getJsonFiles,
  readJson,
  getParentKeys,
  getChildKeys,
  getEntries,
};
