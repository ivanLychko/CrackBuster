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
    .sort();

console.log(`Found ${stockImages.length} stock images`);
console.log(`Found ${extractedContent.length} extracted documents\n`);

// Map documents to services - using actual file names and content
const serviceDocuments = {
    'Foundation Crack Repair': extractedContent.find(doc => 
        doc.fileName.includes('Crack Repair Info') || 
        doc.fileName.includes('Crack Repair Technique') ||
        doc.fileName.includes('Foundation Crack Repair')
    ),
    'Epoxy Crack Injection': extractedContent.find(doc => 
        doc.fileName.includes('Epoxy Crack Injection')
    ),
    'Polyurethane Injection': extractedContent.find(doc => 
        doc.fileName.includes('Polyurethane Injection')
    ),
    'Basement Waterproofing': extractedContent.find(doc => 
        doc.fileName.includes('Waterproofing') && !doc.fileName.includes('Basement Water')
    ),
    'Grading and Drainage': extractedContent.find(doc => 
        doc.fileName.includes('Grading and Drainage')
    ),
    'Basement Insulation': extractedContent.find(doc => 
        doc.fileName.includes('Basement Insulation')
    ),
    'Radon Mitigation': extractedContent.find(doc => 
        doc.fileName.includes('Radon Mitigation')
    )
};

// Map documents to blogs
const blogDocuments = extractedContent.filter(doc => 
    doc.fileName.includes('Website article') || 
    doc.fileName.includes('Articles/') ||
    (doc.fileName.includes('Article') && !doc.fileName.includes('Crack Repair Info'))
);

// Helper to convert text to HTML with SEO optimization
function convertToHTML(content, title, type = 'service') {
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 30);
    
    if (type === 'service') {
        return generateServiceHTML(paragraphs, title);
    } else {
        return generateBlogHTML(paragraphs, title);
    }
}

function generateServiceHTML(paragraphs, title) {
    let html = `<div class="service-intro">
        <p>${escapeHtml(paragraphs[0] || '')}</p>
    </div>`;
    
    if (paragraphs.length > 1) {
        html += `<section class="service-details">
            <h2>About ${title} in Edmonton</h2>`;
        
        paragraphs.slice(1, Math.min(6, paragraphs.length)).forEach(para => {
            if (para.trim().length > 50) {
                html += `<p>${escapeHtml(para.trim())}</p>`;
            }
        });
        
        html += `</section>`;
        
        if (paragraphs.length > 6) {
            html += `<section class="service-benefits">
                <h2>Benefits of ${title}</h2>
                <ul>`;
            
            paragraphs.slice(6, Math.min(10, paragraphs.length)).forEach(para => {
                if (para.trim().length > 30) {
                    html += `<li>${escapeHtml(para.trim().substring(0, 150))}</li>`;
                }
            });
            
            html += `</ul></section>`;
        }
    }
    
    return html;
}

function generateBlogHTML(paragraphs, title) {
    let html = `<div class="blog-intro">
        <p>${escapeHtml(paragraphs[0] || '')}</p>
    </div>`;
    
    paragraphs.slice(1).forEach((para, index) => {
        if (para.trim().length > 30) {
            // Add headings every 3-4 paragraphs
            if (index > 0 && index % 4 === 0) {
                const heading = para.substring(0, 60).replace(/[.!?]$/, '');
                html += `<h2>${escapeHtml(heading)}</h2>`;
            }
            html += `<p>${escapeHtml(para.trim())}</p>`;
        }
    });
    
    return html;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Generate services
const servicesData = [];
let imageIndex = 0;

for (const [title, doc] of Object.entries(serviceDocuments)) {
    if (!doc) continue;
    
    const image = `/images/stock/${stockImages[imageIndex % stockImages.length]}`;
    imageIndex++;
    
    const description = doc.content.substring(0, 200).replace(/\n/g, ' ').trim() + '...';
    const content = convertToHTML(doc.content, title, 'service');
    
    servicesData.push({
        title: title,
        description: description,
        content: content,
        image: image,
        faq: [
            {
                question: `What is ${title}?`,
                answer: doc.content.substring(0, 250).replace(/\n/g, ' ').trim() + '...'
            },
            {
                question: `How does ${title} work?`,
                answer: 'Our certified technicians use advanced techniques and high-quality materials to ensure permanent repairs that last for decades.'
            },
            {
                question: `How long does ${title} take?`,
                answer: 'Most repairs can be completed in a single day, depending on the extent of the damage. We provide free estimates and work around your schedule.'
            }
        ]
    });
}

// Generate blog posts
const blogPostsData = [];
const usedBlogImages = new Set();

blogDocuments.forEach((doc, index) => {
    if (!doc || doc.content.length < 200) return;
    
    // Extract title from filename
    let title = doc.fileName
        .replace(/Website article--/gi, '')
        .replace(/Website Article--/gi, '')
        .replace(/\.docx$/i, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    if (!title || title.length < 10) return;
    
    // Find unique image
    let image = null;
    for (let i = 0; i < stockImages.length; i++) {
        const img = `/images/stock/${stockImages[(index + i) % stockImages.length]}`;
        if (!usedBlogImages.has(img)) {
            image = img;
            usedBlogImages.add(img);
            break;
        }
    }
    
    if (!image) {
        image = `/images/stock/${stockImages[index % stockImages.length]}`;
    }
    
    const excerpt = doc.content.substring(0, 150).replace(/\n/g, ' ').trim() + '...';
    const content = convertToHTML(doc.content, title, 'blog');
    
    blogPostsData.push({
        title: title,
        excerpt: excerpt,
        content: content,
        featuredImage: image,
        published: true,
        publishedAt: new Date(2024, Math.floor(index / 3), (index % 28) + 1)
    });
});

// Create seed file content
const seedFileContent = `require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Service = require('../server/models/Service');
const BlogPost = require('../server/models/BlogPost');
const Work = require('../server/models/Work');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crackbuster')
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Helper function to create slug from title
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Helper function to check if image file exists (with alternative formats)
function checkImageFileExists(imagePath) {
    if (!imagePath || !imagePath.startsWith('/images/')) {
        return imagePath;
    }

    const publicPath = path.join(__dirname, '../client/public', imagePath);
    if (fs.existsSync(publicPath)) {
        return imagePath;
    }

    const ext = path.extname(publicPath).toLowerCase();
    const basePath = publicPath.replace(/\\.(jpg|jpeg|png|gif|webp)$/i, '');
    const baseUrl = imagePath.replace(/\\.(jpg|jpeg|png|gif|webp)$/i, '');

    const alternativeExts = ['.webp', '.jpg', '.jpeg', '.png', '.gif'];
    for (const altExt of alternativeExts) {
        if (altExt !== ext && fs.existsSync(basePath + altExt)) {
            return baseUrl + altExt;
        }
    }

    return imagePath;
}

// Helper function to fix image paths in HTML content
function fixImagePathsInHTML(htmlContent) {
    if (!htmlContent) return htmlContent;
    return htmlContent.replace(/src="([^"]+)"/g, (match, imagePath) => {
        if (imagePath.startsWith('/images/')) {
            const fixedPath = checkImageFileExists(imagePath);
            if (fixedPath) {
                return \`src="\${fixedPath}"\`;
            }
        }
        return match;
    });
}

// Helper function to recursively get all images from a directory
function getAllImagesFromDir(dirPath, basePath = '') {
    const images = [];
    if (!fs.existsSync(dirPath)) return images;

    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    items.forEach(item => {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
            images.push(...getAllImagesFromDir(fullPath, path.join(basePath, item.name)));
        } else if (item.isFile()) {
            const ext = path.extname(item.name).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
                images.push({
                    name: item.name,
                    path: fullPath,
                    relativePath: basePath ? path.join(basePath, item.name) : item.name
                });
            }
        }
    });
    return images;
}

// Services data - Generated from real content
const servicesData = ${JSON.stringify(servicesData, null, 8)};

// Blog posts data - Generated from real content  
const blogPostsData = ${JSON.stringify(blogPostsData, null, 8)};

// Works data (from Job Images folders)
async function getWorksData() {
    const worksData = [];
    const publicJobsPath = path.join(__dirname, '../client/public/images/jobs');

    if (!fs.existsSync(publicJobsPath)) {
        console.warn('Warning: public/images/jobs folder not found. Works will have no images.');
        return worksData;
    }

    const folders = fs.readdirSync(publicJobsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('Pictures'))
        .map(dirent => dirent.name)
        .sort((a, b) => {
            const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
            const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
            return numA - numB;
        });

    const projectDescriptions = [
        \`<p>Professional foundation crack repair completed using polyurethane injection. The crack was sealed from inside, preventing water infiltration permanently.</p>\`,
        \`<p>Comprehensive foundation repair including crack injection and structural reinforcement. All work completed with lifetime warranty.</p>\`,
        \`<p>Basement waterproofing and crack repair project. Multiple cracks were sealed using advanced injection techniques.</p>\`,
        \`<p>Foundation repair project involving epoxy injection for structural cracks. The repair restored the foundation's integrity.</p>\`,
        \`<p>Complete basement waterproofing solution including crack repairs and drainage improvements.</p>\`
    ];

    folders.forEach((folder, index) => {
        const folderNum = parseInt(folder.replace(/[^0-9]/g, '')) || index + 1;
        const folderPath = path.join(publicJobsPath, folder);
        const folderImages = getAllImagesFromDir(folderPath, '');
        const imageUrls = folderImages.map(img => {
            const relativePath = img.relativePath || img.name;
            return \`/images/jobs/\${folder}/\${relativePath}\`;
        }).filter(url => {
            const filePath = url.replace('/images/jobs/', '');
            const fullPath = path.join(publicJobsPath, filePath);
            return fs.existsSync(fullPath);
        });

        if (imageUrls.length > 0) {
            const beforeImages = imageUrls.filter(img =>
                path.basename(img).toLowerCase().includes('before')
            );
            const afterImages = imageUrls.filter(img =>
                path.basename(img).toLowerCase().includes('after')
            );
            const midImages = imageUrls.filter(img =>
                path.basename(img).toLowerCase().includes('mid') ||
                path.basename(img).toLowerCase().includes('injection') ||
                path.basename(img).toLowerCase().includes('during')
            );
            const otherImages = imageUrls.filter(img =>
                !beforeImages.includes(img) &&
                !afterImages.includes(img) &&
                !midImages.includes(img)
            );

            const orderedImages = [
                ...beforeImages,
                ...midImages,
                ...afterImages,
                ...otherImages
            ];

            const descriptionIndex = index % projectDescriptions.length;
            const description = projectDescriptions[descriptionIndex];

            worksData.push({
                title: \`Foundation Repair Project #\${folderNum}\`,
                description: description,
                images: orderedImages,
                location: 'Edmonton, AB',
                completedAt: new Date(2024, 0, 1 + index * 15),
                featured: index < 5
            });
        }
    });

    return worksData;
}

// Main seeding function
async function seedDatabase() {
    try {
        console.log('Starting database seeding with real content...');

        console.log('Clearing existing data...');
        await Service.deleteMany({});
        await BlogPost.deleteMany({});
        await Work.deleteMany({});

        console.log('Seeding services...');
        for (const serviceData of servicesData) {
            const fixedContent = fixImagePathsInHTML(serviceData.content);
            const fixedImage = checkImageFileExists(serviceData.image);

            const service = new Service({
                ...serviceData,
                content: fixedContent,
                image: fixedImage,
                slug: createSlug(serviceData.title)
            });
            await service.save();
            console.log(\`  ✓ Created service: \${service.title}\`);
        }

        console.log('Seeding blog posts...');
        for (const postData of blogPostsData) {
            const fixedContent = fixImagePathsInHTML(postData.content);
            const fixedFeaturedImage = postData.featuredImage ?
                checkImageFileExists(postData.featuredImage) :
                postData.featuredImage;

            const post = new BlogPost({
                ...postData,
                content: fixedContent,
                featuredImage: fixedFeaturedImage,
                slug: createSlug(postData.title)
            });
            await post.save();
            console.log(\`  ✓ Created blog post: \${post.title}\`);
        }

        console.log('Seeding works...');
        const worksData = await getWorksData();
        for (const workData of worksData) {
            const work = new Work(workData);
            await work.save();
            console.log(\`  ✓ Created work: \${work.title} (\${work.images.length} images)\`);
        }

        console.log('\\n✅ Database seeding completed successfully!');
        console.log(\`   Services: \${servicesData.length}\`);
        console.log(\`   Blog Posts: \${blogPostsData.length}\`);
        console.log(\`   Works: \${worksData.length}\`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run seeding
seedDatabase();
`;

// Save seed file
const seedFilePath = path.join(__dirname, '../scripts/seed-database-real.js');
fs.writeFileSync(seedFilePath, seedFileContent, 'utf8');

console.log(`\n✅ Created seed file with real content:`);
console.log(`   Services: ${servicesData.length}`);
console.log(`   Blog Posts: ${blogPostsData.length}`);
console.log(`   Output saved to: ${seedFilePath}`);
console.log(`\nTo use this file, rename it to seed-database.js or run: node scripts/seed-database-real.js`);



