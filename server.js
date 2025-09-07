import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Comment out all routes for now
// app.get('/user/:id', (req, res) => {
//   const userId = req.params.id;
//   res.send(`User  ID: ${userId}`);
// });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
