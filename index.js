const { convertWordToPdf } = require('./lib/word-to-pdf');
const { convertPdfToWord } = require('./lib/pdf-to-word');

class Converter {
    constructor() {
        this.isPremium = false;
    }

    /**
     * Convert Word (DOCX) to PDF
     * @param {string} inputPath - Absolute path to input file
     * @param {string} outputPath - Absolute path to output file
     */
    async wordToPdf(inputPath, outputPath) {
        console.log(`[Converter] Converting Word to PDF: ${inputPath} -> ${outputPath}`);
        return convertWordToPdf(inputPath, outputPath);
    }

    /**
     * Convert PDF to Word (DOCX)
     * @param {string} inputPath - Absolute path to input file
     * @param {string} outputPath - Absolute path to output file
     */
    async pdfToWord(inputPath, outputPath) {
        console.log(`[Converter] Converting PDF to Word: ${inputPath} -> ${outputPath}`);
        return convertPdfToWord(inputPath, outputPath);
    }
}

class PremiumConverter extends Converter {
    constructor(licenseKey) {
        super();
        if (this.validateLicense(licenseKey)) {
            this.isPremium = true;
            console.log("[PremiumConverter] Premium features enabled.");
        } else {
            throw new Error("Invalid license key. Please purchase a premium license.");
        }
    }

    validateLicense(key) {
        // In a real app, this would check against a database or verify a JWT/signature.
        // For this demo, any key starting with 'PREMIUM-' is valid.
        return typeof key === 'string' && key.startsWith("PREMIUM-");
    }

    // Example premium feature: Batch conversion
    async batchConvert(files, targetFormat) {
        if (!this.isPremium) throw new Error("Batch conversion is a premium feature.");

        const results = [];
        for (const file of files) {
            try {
                if (targetFormat === 'pdf') {
                    await this.wordToPdf(file.input, file.output);
                } else if (targetFormat === 'docx') {
                    await this.pdfToWord(file.input, file.output);
                }
                results.push({ file: file.input, status: 'success' });
            } catch (e) {
                results.push({ file: file.input, status: 'error', error: e.message });
            }
        }
        return results;
    }
}

module.exports = {
    Converter,
    PremiumConverter,
    convertWordToPdf,
    convertPdfToWord
};
