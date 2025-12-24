require('dotenv').config();
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data/Foundation Crack Repair website info');

// Recursively find all .docx files
function findDocxFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            findDocxFiles(filePath, fileList);
        } else if (file.endsWith('.docx') && !file.startsWith('~$')) {
            fileList.push({
                path: filePath,
                relativePath: path.relative(dataDir, filePath),
                name: file
            });
        }
    });
    
    return fileList;
}

// Extract text from docx file
async function extractText(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return null;
    }
}

// Main function
async function extractAllContent() {
    console.log('Finding all .docx files...');
    const docxFiles = findDocxFiles(dataDir);
    console.log(`Found ${docxFiles.length} .docx files\n`);
    
    const extractedContent = [];
    
    for (const file of docxFiles) {
        console.log(`Extracting: ${file.relativePath}`);
        const content = await extractText(file.path);
        
        if (content) {
            extractedContent.push({
                fileName: file.name,
                relativePath: file.relativePath,
                content: content.trim()
            });
            console.log(`  ✓ Extracted ${content.length} characters\n`);
        } else {
            console.log(`  ✗ Failed to extract\n`);
        }
    }
    
    // Save to JSON file
    const outputPath = path.join(__dirname, '../data/extracted-content.json');
    fs.writeFileSync(outputPath, JSON.stringify(extractedContent, null, 2), 'utf8');
    
    console.log(`\n✅ Extraction complete!`);
    console.log(`   Total files: ${docxFiles.length}`);
    console.log(`   Successfully extracted: ${extractedContent.length}`);
    console.log(`   Output saved to: ${outputPath}`);
}

extractAllContent().catch(console.error);

