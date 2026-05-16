const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware
app.use(express.json());
// NEW (Serves from root - easier for beginners)
app.use(express.static('.')); 
app.use('/uploads', express.static('assets')); // Serves uploaded images

// Ensure 'assets' folder exists
if (!fs.existsSync('./assets')) {
		fs.mkdirSync('./assets');
}

// Configure Storage (Multer)
const storage = multer.diskStorage({
		destination: function (req, file, cb) {
				cb(null, 'assets/'); 
		},
		filename: function (req, file, cb) {
				const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
				cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
		}
});

const upload = multer({ storage: storage });

// API: Get List of Images
app.get('/images', (req, res) => {
		const directoryPath = './assets';

		fs.readdir(directoryPath, function (err, files) {
				if (err) return res.status(500).json({ error: 'Unable to scan directory' });

				const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
				const imageList = files.filter(file => {
						const ext = path.extname(file).toLowerCase();
						return validExtensions.includes(ext);
				}).map(file => ({
						name: file,
						url: `/uploads/${file}`
				}));

				res.json(imageList);
		});
});

// API: Upload Image
app.post('/upload', upload.single('image'), (req, res) => {
		if (!req.file) return res.status(400).send('No file uploaded.');
		res.json({ message: 'Uploaded', url: '/uploads/' + req.file.filename });
});

// API: Delete Image
app.delete('/delete/:filename', (req, res) => {
		const fileName = req.params.filename;
		const filePath = path.join(__dirname, 'assets', fileName);

		if (fs.existsSync(filePath)) {
				fs.unlink(filePath, (err) => {
						if (err) return res.status(500).send('Error deleting');
						res.json({ success: true });
				});
		} else {
				res.status(404).send('File not found');
		}
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
		console.log(`Server running at http://localhost:${PORT}`);
});