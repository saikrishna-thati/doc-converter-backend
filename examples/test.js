const { Converter, PremiumConverter } = require('../index');
const path = require('path');
const fs = require('fs');

// NOTE: We use a generated test file
const inputDocx = path.join(__dirname, 'simple_test.docx');
const outputPdf = path.join(__dirname, 'simple_test_output.pdf');
const outputDocx = path.join(__dirname, 'simple_test_back.docx');

async function run() {
    const converter = new Converter();

    console.log("--- Testing Word to PDF ---");
    if (fs.existsSync(inputDocx)) {
        try {
            console.log(`Converting ${inputDocx} to ${outputPdf}...`);
            await converter.wordToPdf(inputDocx, outputPdf);
            console.log("Word to PDF Success!");
        } catch (e) {
            console.error("Word to PDF failed:", e.message);
        }
    } else {
        console.log(`Skipping Word to PDF: '${inputDocx}' not found. Please create this file to test.`);
    }

    console.log("\n--- Testing PDF to Word ---");
    // We can only test this if we have a PDF. If the previous step worked, we have one.
    // Or if the user provided one.
    const pdfToTest = fs.existsSync(outputPdf) ? outputPdf : (fs.existsSync(path.join(__dirname, 'test.pdf')) ? path.join(__dirname, 'test.pdf') : null);

    if (pdfToTest) {
        try {
            console.log(`Converting ${pdfToTest} to ${outputDocx}...`);
            await converter.pdfToWord(pdfToTest, outputDocx);
            console.log("PDF to Word Success!");
        } catch (e) {
            console.error("PDF to Word failed:", e.message);
        }
    } else {
        console.log("Skipping PDF to Word: No PDF file found to test.");
    }

    console.log("\n--- Testing Premium Batch ---");
    try {
        const premium = new PremiumConverter('PREMIUM-TEST');
        console.log("Premium License Validated.");
        // Mock batch
        await premium.batchConvert([], 'pdf');
        console.log("Batch conversion (empty list) executed.");
    } catch (e) {
        console.error("Premium test failed:", e.message);
    }
}

run();
