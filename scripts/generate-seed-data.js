require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Read extracted content
const extractedContentPath = path.join(__dirname, '../data/extracted-content.json');
const extractedContent = JSON.parse(fs.readFileSync(extractedContentPath, 'utf8'));

// Get available images
const stockImagesPath = path.join(__dirname, '../client/public/images/stock');
const stockImages = fs.readdirSync(stockImagesPath)
    .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
    .map(file => `/images/stock/${file}`);

console.log(`Found ${stockImages.length} stock images`);
console.log(`Found ${extractedContent.length} extracted documents`);

// Map documents to services and blogs
const servicesMap = {
    'Foundation Crack Repair': {
        keywords: ['foundation', 'crack', 'repair', 'injection'],
        images: ['Identifying-Different-Types-of-Foundation-Cracks', 'Cement with Crack', 'Vertical Cracks']
    },
    'Epoxy Crack Injection': {
        keywords: ['epoxy', 'injection', 'structural'],
        images: ['Cement with Crack', 'Screenshot 2025-10-18']
    },
    'Polyurethane Injection': {
        keywords: ['polyurethane', 'injection', 'flexible'],
        images: ['Cement with Crack', 'Screenshot 2025-10-19']
    },
    'Basement Waterproofing': {
        keywords: ['waterproofing', 'basement', 'water'],
        images: ['Screenshot 2025-11-30', 'Screenshot 2025-12-01']
    },
    'Grading and Drainage': {
        keywords: ['grading', 'drainage', 'water'],
        images: ['Screenshot 2025-12-12']
    },
    'Basement Insulation': {
        keywords: ['insulation', 'basement', 'temperature'],
        images: ['Screenshot 2025-10-18 170747']
    },
    'Radon Mitigation': {
        keywords: ['radon', 'mitigation', 'air quality'],
        images: ['Screenshot 2025-10-27']
    }
};

const blogsMap = {
    'Types of Foundation Cracks and Assessment': {
        keywords: ['types', 'cracks', 'assessment'],
        images: ['Identifying-Different-Types-of-Foundation-Cracks', 'Hydrostatic-Pressure-Diagram']
    },
    'Why Repair Cracks': {
        keywords: ['why', 'repair', 'cracks'],
        images: ['Cement with Crack']
    },
    'Settlement': {
        keywords: ['settlement', 'foundation'],
        images: ['lateral-movement-side-view']
    },
    'Shrinkage Cracks': {
        keywords: ['shrinkage', 'cracks'],
        images: ['Vertical Cracks']
    },
    'How a Basement Is Built': {
        keywords: ['basement', 'built', 'construction'],
        images: ['Screenshot 2025-10-18 000428']
    },
    'Mold and Mildew Prevention': {
        keywords: ['mold', 'mildew', 'prevention'],
        images: ['Screenshot 2025-11-30 235426']
    },
    'Cost-Effective Foundation Maintenance': {
        keywords: ['maintenance', 'cost', 'effective'],
        images: ['Screenshot 2025-12-01 000022']
    },
    'Can Crack Injections Be Used on All Cracks': {
        keywords: ['injections', 'cracks', 'all'],
        images: ['Cement with Crack']
    },
    'When to Panic And When Not to': {
        keywords: ['panic', 'when', 'not'],
        images: ['Identifying-Different-Types-of-Foundation-Cracks']
    },
    'Why Is My Basement Leaking': {
        keywords: ['basement', 'leaking', 'why'],
        images: ['Screenshot 2025-12-01 001041']
    },
    'Leaky Basement Problems': {
        keywords: ['leaky', 'basement', 'problems'],
        images: ['Screenshot 2025-12-01 001351']
    },
    'Tips on Maintaining Indoor Air Quality': {
        keywords: ['air', 'quality', 'indoor'],
        images: ['Screenshot 2025-12-12 232652']
    },
    'The Facts About Radon Mitigation': {
        keywords: ['radon', 'mitigation', 'facts'],
        images: ['Screenshot 2025-10-27 182338']
    },
    'Real Estate Investments and Insurance Coverage': {
        keywords: ['real estate', 'insurance', 'coverage'],
        images: ['Screenshot 2025-12-12 233432']
    },
    'Can Foundation Cracks Be Repaired In Winter': {
        keywords: ['winter', 'repair', 'cracks'],
        images: ['Screenshot 2025-10-19 172848']
    },
    'Low Pressure Injection for Concrete Cracks': {
        keywords: ['low pressure', 'injection', 'concrete'],
        images: ['Cement with Crack']
    },
    'Importance of Flexibility': {
        keywords: ['flexibility', 'importance'],
        images: ['Cement with Crack']
    },
    'Building Materials - Poured Concrete': {
        keywords: ['building', 'materials', 'concrete'],
        images: ['Screenshot 2025-10-18 000706']
    },
    'Waterproofing': {
        keywords: ['waterproofing'],
        images: ['Screenshot 2025-12-01 001105']
    },
    'Basement Water Drainage above Grade': {
        keywords: ['drainage', 'basement', 'water'],
        images: ['Screenshot 2025-12-12 233507']
    },
    'How to Seal Cracks in a Crawl Space': {
        keywords: ['crawl space', 'seal', 'cracks'],
        images: ['Screenshot 2025-12-12 233610']
    },
    'Home Insulation with Crawl Space': {
        keywords: ['insulation', 'crawl space', 'home'],
        images: ['Screenshot 2025-12-12 233818']
    },
    'Concrete Crack Repair Methods': {
        keywords: ['concrete', 'crack', 'repair', 'methods'],
        images: ['Cement with Crack']
    },
    'How to Fix Foundation Cracks': {
        keywords: ['how', 'fix', 'foundation', 'cracks'],
        images: ['Screenshot 2025-10-18 001030']
    },
    'Prevent Expensive Foundation Crack Repairs': {
        keywords: ['prevent', 'expensive', 'repairs'],
        images: ['Screenshot 2025-12-12 233851']
    },
    'Overcoming Leaky Basement Problems': {
        keywords: ['overcoming', 'leaky', 'basement'],
        images: ['Screenshot 2025-12-12 233911']
    },
    'Relieving Hydrostatic Pressure': {
        keywords: ['hydrostatic', 'pressure', 'relieving'],
        images: ['Hydrostatic-Pressure-Diagram']
    },
    'Efflorescence': {
        keywords: ['efflorescence'],
        images: ['Screenshot 2025-12-12 234204']
    }
};

// Helper function to find image by keywords
function findImageByKeywords(keywords, preferredImages = []) {
    // First try preferred images
    for (const preferred of preferredImages) {
        const found = stockImages.find(img => 
            img.toLowerCase().includes(preferred.toLowerCase().replace(/\s+/g, '-'))
        );
        if (found) return found;
    }
    
    // Then try keywords
    for (const keyword of keywords) {
        const found = stockImages.find(img => 
            img.toLowerCase().includes(keyword.toLowerCase())
        );
        if (found) return found;
    }
    
    // Return first available image
    return stockImages[0] || '/images/stock/logo.png';
}

// Helper function to find document by title keywords
function findDocumentByTitle(title, keywords) {
    const titleLower = title.toLowerCase();
    return extractedContent.find(doc => {
        const fileName = doc.fileName.toLowerCase();
        const content = doc.content.toLowerCase();
        
        // Check if title matches
        if (fileName.includes(titleLower.replace(/[^a-z0-9\s]/g, ''))) {
            return true;
        }
        
        // Check keywords
        return keywords.some(keyword => 
            fileName.includes(keyword.toLowerCase()) || 
            content.includes(keyword.toLowerCase())
        );
    });
}

// Generate services data
const servicesData = [];
let imageIndex = 0;
const usedImages = new Set();

for (const [serviceTitle, config] of Object.entries(servicesMap)) {
    const doc = findDocumentByTitle(serviceTitle, config.keywords);
    const image = findImageByKeywords(config.keywords, config.images);
    
    if (!usedImages.has(image)) {
        usedImages.add(image);
    }
    
    if (doc) {
        servicesData.push({
            title: serviceTitle,
            description: doc.content.substring(0, 200) + '...',
            content: generateServiceContent(doc.content, serviceTitle),
            image: image,
            faq: generateFAQ(serviceTitle, doc.content)
        });
    }
}

// Generate blog posts data
const blogPostsData = [];

for (const [blogTitle, config] of Object.entries(blogsMap)) {
    const doc = findDocumentByTitle(blogTitle, config.keywords);
    const image = findImageByKeywords(config.keywords, config.images);
    
    if (doc) {
        blogPostsData.push({
            title: blogTitle,
            excerpt: doc.content.substring(0, 150) + '...',
            content: generateBlogContent(doc.content, blogTitle),
            featuredImage: image,
            published: true,
            publishedAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        });
    }
}

// Helper functions
function generateServiceContent(originalContent, title) {
    // Convert plain text to HTML with SEO optimization
    const paragraphs = originalContent.split('\n\n').filter(p => p.trim().length > 50);
    
    let html = `<div class="service-intro">
        <p>${paragraphs[0] || originalContent.substring(0, 300)}</p>
    </div>`;
    
    if (paragraphs.length > 1) {
        html += `<section class="service-details">
            <h2>About ${title}</h2>`;
        
        paragraphs.slice(1, 5).forEach(para => {
            if (para.trim().length > 50) {
                html += `<p>${para.trim()}</p>`;
            }
        });
        
        html += `</section>`;
    }
    
    return html;
}

function generateBlogContent(originalContent, title) {
    const paragraphs = originalContent.split('\n\n').filter(p => p.trim().length > 30);
    
    let html = `<div class="blog-intro">
        <p>${paragraphs[0] || originalContent.substring(0, 300)}</p>
    </div>`;
    
    paragraphs.slice(1).forEach((para, index) => {
        if (para.trim().length > 30) {
            if (index % 3 === 0 && index > 0) {
                html += `<h2>${getHeadingFromParagraph(para)}</h2>`;
            }
            html += `<p>${para.trim()}</p>`;
        }
    });
    
    return html;
}

function getHeadingFromParagraph(para) {
    // Extract potential heading (first sentence or key phrase)
    const sentences = para.split(/[.!?]/);
    return sentences[0].substring(0, 60) || 'Important Information';
}

function generateFAQ(title, content) {
    // Generate basic FAQ based on content
    return [
        {
            question: `What is ${title}?`,
            answer: content.substring(0, 200) + '...'
        },
        {
            question: `How does ${title} work?`,
            answer: 'Our professional technicians use advanced techniques and high-quality materials to ensure permanent repairs.'
        },
        {
            question: `How long does ${title} take?`,
            answer: 'Most repairs can be completed in a single day, depending on the extent of the damage.'
        }
    ];
}

// Save generated data
const outputPath = path.join(__dirname, '../data/generated-seed-data.json');
fs.writeFileSync(outputPath, JSON.stringify({
    services: servicesData,
    blogs: blogPostsData,
    stats: {
        servicesCount: servicesData.length,
        blogsCount: blogPostsData.length,
        imagesUsed: usedImages.size,
        totalImages: stockImages.length
    }
}, null, 2));

console.log(`\n✅ Generated seed data:`);
console.log(`   Services: ${servicesData.length}`);
console.log(`   Blog Posts: ${blogPostsData.length}`);
console.log(`   Output saved to: ${outputPath}`);



