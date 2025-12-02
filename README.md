# Node.js Word <-> PDF Converter Library

A high-quality Node.js library for converting Word documents to PDF and PDF documents to Word.
This library supports a Free tier and a Premium tier structure.

## Prerequisites

To use this library, you must have the following installed on your system:

1.  **Node.js** (v14 or higher)
2.  **Python** (v3.6 or higher) - Required for PDF to Word conversion.
    *   Install the required Python package:
        ```bash
        pip install -r requirements.txt
        ```
3.  **Puppeteer** - Automatically installed with npm, handles Word to PDF conversion.

## Installation

```bash
npm install
```

## Usage

### Basic (Free) Usage

```javascript
const { Converter } = require('./index');

const converter = new Converter();

// Word to PDF (Uses Puppeteer - No LibreOffice needed)
converter.wordToPdf('C:/path/to/document.docx', 'C:/path/to/output.pdf')
    .then(path => console.log('Converted to:', path))
    .catch(err => console.error(err));

// PDF to Word
converter.pdfToWord('C:/path/to/document.pdf', 'C:/path/to/output.docx')
    .then(path => console.log('Converted to:', path))
    .catch(err => console.error(err));
```

### Premium Usage

The Premium converter requires a license key (mocked as starting with `PREMIUM-`).
It includes features like batch conversion.

```javascript
const { PremiumConverter } = require('./index');

try {
    const premium = new PremiumConverter('PREMIUM-12345');
    
    // Batch Convert
    const files = [
        { input: 'C:/doc1.docx', output: 'C:/doc1.pdf' },
        { input: 'C:/doc2.docx', output: 'C:/doc2.pdf' }
    ];

    premium.batchConvert(files, 'pdf')
        .then(results => console.log(results));

} catch (e) {
    console.error("License invalid");
}
```

## Monetization Model

- **Free Version**: Single file conversion.
- **Premium Version**: Batch conversion, priority support, faster processing (simulated), no watermarks (if implemented).

## Troubleshooting

- **"Python script exited with code 1"**: Check if `pdf2docx` is installed (`pip install pdf2docx`).
