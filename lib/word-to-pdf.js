const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Converts a Word document (DOCX) to PDF using Puppeteer and docx-preview.
 * This removes the dependency on LibreOffice.
 * @param {string} inputPath - Path to the input Word file.
 * @param {string} outputPath - Path where the PDF should be saved.
 * @returns {Promise<string>} - Path to the generated PDF.
 */
async function convertWordToPdf(inputPath, outputPath) {
    let browser = null;
    try {
        // Check if input file exists
        await fs.access(inputPath);

        // Read DOCX file as buffer
        const docxBuffer = await fs.readFile(inputPath);

        // Convert buffer to base64 to pass to browser (or we can pass array buffer via evaluate)
        // Actually, passing base64 is safer for evaluate
        const docxBase64 = docxBuffer.toString('base64');

        // Launch Puppeteer
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage' // Critical for Docker/Render
            ]
        });
        const page = await browser.newPage();

        // Load the template HTML
        const templatePath = path.join(__dirname, 'render-template.html');
        const htmlContent = await fs.readFile(templatePath, 'utf8');
        await page.setContent(htmlContent);

        // Enable console logging from the browser
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

        // Inject JSZip (Required by docx-preview)
        // We need to manually read the file content because require.resolve might point to a nodejs version
        // or we need to ensure we get the browser build.
        const jszipPath = require.resolve('jszip/dist/jszip.min.js');
        await page.addScriptTag({ path: jszipPath });

        // Wait for JSZip to be available in window
        await page.waitForFunction(() => window.JSZip !== undefined);

        // Inject docx-preview library
        const docxPreviewPath = require.resolve('docx-preview');
        await page.addScriptTag({ path: docxPreviewPath });

        // Render DOCX in the page
        await page.evaluate(async (base64Data) => {
            // Convert base64 back to ArrayBuffer
            const binaryString = window.atob(base64Data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const arrayBuffer = bytes.buffer;

            // Call the render function defined in template
            await window.renderDocx(arrayBuffer);
        }, docxBase64);

        // Wait a bit for images/fonts to settle (optional but recommended)
        // docx-preview is async but sometimes layout takes a moment
        // Wait for the docx-preview wrapper to appear
        try {
            await page.waitForSelector('.docx-wrapper', { timeout: 10000 });
            // Add a small delay for layout to stabilize after rendering
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.warn("Warning: .docx-wrapper selector not found, PDF might be blank.");
        }

        // Generate PDF
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px'
            }
        });

        return outputPath;

    } catch (error) {
        throw new Error(`Error converting Word to PDF: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { convertWordToPdf };
