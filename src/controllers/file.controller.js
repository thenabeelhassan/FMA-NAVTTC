const archiver = require('archiver');
const fsSync = require('fs'); // for streaming
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const UPLOAD_DIR = process.env.UPLOAD_DIR;

const { getJsonFiles, readJson, getParentKeys, getChildKeys, getEntries } = require('../utils/json.util');

// List JSON files (top-level folders)
exports.index = async (req, res) => {
  try {
    const folders = await fs.readdir(UPLOAD_DIR, { withFileTypes: true });
    const jsonFolders = folders.filter(f => f.isDirectory()).map(f => f.name);
    res.render('index', { folders: jsonFolders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error reading folders');
  }
};

// View next-level folders dynamically
exports.viewHierarchy = async (req, res) => {
  try {
    const { level1, level2, level3, level4 } = req.params;

    // Build current path
    const folderPath = path.join(
      UPLOAD_DIR,
      level1 || '',
      level2 || '',
      level3 || '',
      level4 || ''
    );

    // Read folders and files
    const items = await fs.readdir(folderPath, { withFileTypes: true });
    const folders = items.filter(f => f.isDirectory()).map(f => f.name);
    const files = items.filter(f => f.isFile()).map(f => f.name);

    // Pass levels and items to EJS
    res.render('hierarchy', {
      level1: level1 || null,
      level2: level2 || null,
      level3: level3 || null,
      level4: level4 || null,
      folders,
      files
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading folder hierarchy');
  }
};

// Download functions stay the same
exports.downloadFile = async (req, res) => {
  const { level1, level2, level3, level4, file } = req.params;
  let filePath = UPLOAD_DIR;
  if (level1) filePath = path.join(filePath, level1);
  if (level2) filePath = path.join(filePath, level2);
  if (level3) filePath = path.join(filePath, level3);
  if (level4) filePath = path.join(filePath, level4);
  filePath = path.join(filePath, file);

  try {
    await fs.access(filePath);
    res.download(filePath);
  } catch (err) {
    res.status(404).send('File not found');
  }
};

exports.downloadFolder = async (req, res) => {
  const { level1, level2, level3 } = req.params;
  let folderPath = UPLOAD_DIR;
  if (level1) folderPath = path.join(folderPath, level1);
  if (level2) folderPath = path.join(folderPath, level2);
  if (level3) folderPath = path.join(folderPath, level3);

  try {
    await fs.access(folderPath);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${path.basename(folderPath)}.zip`
    );
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.directory(folderPath, false);
    archive.pipe(res);
    await archive.finalize();
  } catch (err) {
    res.status(404).send('Folder not found');
  }
};

exports.viewFolder = async (req, res) => {
  const folderName = req.params.folder;
  const folderPath = path.join(process.env.UPLOAD_DIR, folderName);

  const files = await fs.readdir(folderPath, { withFileTypes: true });
  const fileNames = files.filter(f => f.isFile()).map(f => f.name);

  res.render('folder', { folder: folderName, files: fileNames });
};

async function resizeToTarget(buffer, targetKB = 250) {
  let quality = 90; // start high
  let resizedBuffer = await sharp(buffer)
    .jpeg({ quality })
    .toBuffer();

  while (resizedBuffer.length / 1024 > targetKB && quality > 10) {
    quality -= 5;
    resizedBuffer = await sharp(buffer)
      .jpeg({ quality })
      .toBuffer();
  }

  return resizedBuffer;
}

// GET /upload page
exports.uploadPage = async (req, res) => {
  try {
    const jsonFiles = await getJsonFiles();
    res.render('upload', { jsonFiles, parentKeys: [], childKeys: [], entries: [] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading JSON data');
  }
};

// POST /upload files
exports.upload = async (req, res) => {
  try {
    const files = req.files;
    const { jsonFile, parentKey, childKey, entryIndex } = req.body;

    if (!files || files.length === 0) return res.status(400).send('No files uploaded');
    if (!jsonFile || !parentKey || !childKey || entryIndex === undefined) return res.status(400).send('Missing hierarchy selection');

    // Get candidate info
    const jsonData = await readJson(jsonFile);
    const entries = getEntries(jsonData, parentKey, childKey);
    const entry = entries[entryIndex];
    if (!entry) return res.status(400).send('Invalid candidate selection');

    const candidateFolder = `${entry.CNIC} - ${entry.Name}`;

    // Create hierarchical folders
    const finalDir = path.join(
      UPLOAD_DIR,
      jsonFile.replace(/\.json$/, ''),
      parentKey,
      childKey,
      candidateFolder
    );
    await fs.mkdir(finalDir, { recursive: true });

    // Process each file
    for (const file of files) {
      const filePath = path.join(finalDir, file.originalname);

      const finalBuffer = await resizeToTarget(file.buffer, 250); // ~250KB
      await fs.writeFile(filePath, finalBuffer);
    }

    res.redirect('/upload');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading files');
  }
};

// API route for dynamic dropdowns
exports.getJsonData = async (req, res) => {
  const { fileName, parentKey, childKey } = req.query;

  if (!fileName) return res.json({ parentKeys: [], childKeys: [], entries: [] });

  const jsonData = await readJson(fileName);

  const parentKeys = getParentKeys(jsonData);
  const childKeys = parentKey ? getChildKeys(jsonData, parentKey) : [];
  const entries = parentKey && childKey ? getEntries(jsonData, parentKey, childKey) : [];

  res.json({ parentKeys, childKeys, entries });
};
