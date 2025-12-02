const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Converter } = require('./index');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for frontend access
app.use(cors());

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize Converter
const converter = new Converter();

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.post('/convert/word-to-pdf', upload.single('file'), async (req, res) => {
    console.log(`[POST] /convert/word-to-pdf - Request received`);
    if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).send('No file uploaded.');
    }
    console.log(`File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);

    const inputPath = req.file.path;
    const outputPath = path.join('uploads', `${req.file.filename}.pdf`);

    try {
        await converter.wordToPdf(inputPath, outputPath);
        res.download(outputPath, 'converted.pdf', (err) => {
            // Cleanup files after download
            fs.unlinkSync(inputPath);
            if (!err) fs.unlinkSync(outputPath);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Conversion failed');
        // Cleanup on error
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    }
});

app.post('/convert/pdf-to-word', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const inputPath = req.file.path;
    const outputPath = path.join('uploads', `${req.file.filename}.docx`);

    try {
        await converter.pdfToWord(inputPath, outputPath);
        res.download(outputPath, 'converted.docx', (err) => {
            // Cleanup files after download
            fs.unlinkSync(inputPath);
            if (!err) fs.unlinkSync(outputPath);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Conversion failed');
        // Cleanup on error
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    }
});

app.listen(port, () => {
    console.log(`Converter Backend running at http://localhost:${port}`);
});
