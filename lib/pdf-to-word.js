const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

/**
 * Converts a PDF document to Word (DOCX).
 * @param {string} inputPath - Path to the input PDF file.
 * @param {string} outputPath - Path where the DOCX should be saved.
 * @returns {Promise<string>} - Path to the generated DOCX.
 */
async function convertPdfToWord(inputPath, outputPath) {
    // Check if input file exists
    try {
        await fs.access(inputPath);
    } catch (e) {
        throw new Error(`Input file not found: ${inputPath}`);
    }

    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '..', 'scripts', 'convert_pdf_to_docx.py');

        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);

        const pythonProcess = spawn('python', [scriptPath, inputPath, outputPath]);

        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Conversion failed. Python script exited with code ${code}.\nError: ${errorData}\nOutput: ${outputData}`));
            } else {
                resolve(outputPath);
            }
        });

        pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to start python process: ${err.message}. Make sure Python is installed and in your PATH.`));
        });
    });
}

module.exports = { convertPdfToWord };
