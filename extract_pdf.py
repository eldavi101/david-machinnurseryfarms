#!/usr/bin/env python
import sys
import os

pdf_path = r"c:\Users\machi\GEO-REPORT-MachinNurseryFarms.pdf"

# Try pdfplumber first
try:
    import pdfplumber
    print("Using pdfplumber...")
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            print(f"\n===== PAGE {page_num} =====\n")
            text = page.extract_text()
            if text:
                print(text)
            else:
                print("[No text extracted from this page]")
    sys.exit(0)
except ImportError:
    print("pdfplumber not available, trying PyPDF2...")

# Try PyPDF2
try:
    from PyPDF2 import PdfReader
    print("Using PyPDF2...")
    reader = PdfReader(pdf_path)
    for page_num, page in enumerate(reader.pages, 1):
        print(f"\n===== PAGE {page_num} =====\n")
        text = page.extract_text()
        if text:
            print(text)
        else:
            print("[No text extracted from this page]")
    sys.exit(0)
except ImportError:
    print("PyPDF2 not available, trying pymupdf...")

# Try pymupdf
try:
    import fitz  # pymupdf
    print("Using pymupdf...")
    doc = fitz.open(pdf_path)
    for page_num in range(len(doc)):
        page = doc[page_num]
        print(f"\n===== PAGE {page_num + 1} =====\n")
        text = page.get_text()
        if text:
            print(text)
        else:
            print("[No text extracted from this page]")
    doc.close()
    sys.exit(0)
except ImportError:
    print("pymupdf not available either")
    sys.exit(1)
