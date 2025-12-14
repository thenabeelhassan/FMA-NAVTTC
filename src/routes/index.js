const router = require("express").Router();
const fileController = require("../controllers/file.controller");
const multer = require("../config/multer.config"); // assuming multer config

// Top-level JSON folders
router.get("/", fileController.index);

// View hierarchy drill-down
router.get('/view', fileController.index); // top-level JSON folders
router.get('/view/:level1', fileController.viewHierarchy);
router.get('/view/:level1/:level2', fileController.viewHierarchy);
router.get('/view/:level1/:level2/:level3', fileController.viewHierarchy);
router.get('/view/:level1/:level2/:level3/:level4', fileController.viewHierarchy);

// Download file - explicit paths
router.get("/download/file/:level1/:file", fileController.downloadFile);
router.get("/download/file/:level1/:level2/:file", fileController.downloadFile);
router.get("/download/file/:level1/:level2/:level3/:file", fileController.downloadFile);
router.get("/download/file/:level1/:level2/:level3/:level4/:file", fileController.downloadFile);

// Download folder - explicit paths
router.get("/download/folder/:level1", fileController.downloadFolder);
router.get("/download/folder/:level1/:level2", fileController.downloadFolder);
router.get("/download/folder/:level1/:level2/:level3", fileController.downloadFolder);
router.get("/download/folder/:level1/:level2/:level3/:level4", fileController.downloadFolder);

// Dynamic JSON data for cascading dropdowns
router.get("/json-data", fileController.getJsonData);

// Upload
router.get("/upload", fileController.uploadPage);
router.post("/upload", multer.array("file"), fileController.upload); // <--- use array() and call controller

// Data
router.get("/folder/:folder", fileController.viewFolder);

module.exports = router;
