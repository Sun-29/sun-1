const fs = require('fs');
const path = require('path');

/**
 * Extract text content from a resume file (PDF or DOCX)
 */
async function extractResumeText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return extractPdfText(filePath);
  } else if (ext === '.docx' || ext === '.doc') {
    return extractDocxText(filePath);
  }
  return '';
}

async function extractPdfText(filePath) {
  try {
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (e) {
    console.warn('[ResumeParser] PDF extraction failed:', e.message);
    return '';
  }
}

async function extractDocxText(filePath) {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (e) {
    console.warn('[ResumeParser] DOCX extraction failed:', e.message);
    return '';
  }
}

module.exports = { extractResumeText };
