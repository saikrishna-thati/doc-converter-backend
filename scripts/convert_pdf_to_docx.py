import sys
import os
from pdf2docx import Converter

def convert_pdf_to_docx(pdf_file, docx_file):
    # Ensure output directory exists
    os.makedirs(os.path.dirname(docx_file), exist_ok=True)
    
    cv = Converter(pdf_file)
    cv.convert(docx_file, start=0, end=None)
    cv.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_pdf_to_docx.py <input_pdf> <output_docx>")
        sys.exit(1)
    
    input_pdf = sys.argv[1]
    output_docx = sys.argv[2]
    
    if not os.path.exists(input_pdf):
        print(f"Error: Input file '{input_pdf}' not found.")
        sys.exit(1)

    try:
        convert_pdf_to_docx(input_pdf, output_docx)
        print("Conversion successful")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
