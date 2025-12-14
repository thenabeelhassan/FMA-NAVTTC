const dotenv = require("dotenv")
const app = require("./src/app.js")

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`File Manager API running on port ${PORT}`);
});