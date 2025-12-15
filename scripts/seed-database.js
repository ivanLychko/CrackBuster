require('dotenv').config();
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
        return imagePath; // Return as-is if not a valid image path
    }

    const publicPath = path.join(__dirname, '../client/public', imagePath);
    if (fs.existsSync(publicPath)) {
        return imagePath;
    }

    // Try alternative formats
    const ext = path.extname(publicPath).toLowerCase();
    const basePath = publicPath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    const baseUrl = imagePath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');

    const alternativeExts = ['.webp', '.jpg', '.jpeg', '.png', '.gif'];
    for (const altExt of alternativeExts) {
        if (altExt !== ext && fs.existsSync(basePath + altExt)) {
            return baseUrl + altExt;
        }
    }

    // Return original path if not found (for backward compatibility)
    return imagePath;
}

// Helper function to fix image paths in HTML content
function fixImagePathsInHTML(htmlContent) {
    if (!htmlContent) return htmlContent;

    // Match img src attributes
    return htmlContent.replace(/src="([^"]+)"/g, (match, imagePath) => {
        if (imagePath.startsWith('/images/')) {
            const fixedPath = checkImageFileExists(imagePath);
            if (fixedPath) {
                return `src="${fixedPath}"`;
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
            // Recursively search subdirectories
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

// Services data
const servicesData = [
    {
        title: 'Foundation Crack Repair',
        description: 'Professional foundation crack repair services using advanced injection techniques to restore your foundation\'s integrity and prevent water damage.',
        content: `<div class="service-intro">
            <p>Foundation cracks are more than just cosmetic issues—they can compromise your home's structural integrity and lead to costly water damage. At CrackBuster, we specialize in professional foundation crack repair using state-of-the-art injection techniques that seal cracks permanently and restore your foundation's strength.</p>
            <img src="/images/stock/Identifying-Different-Types-of-Foundation-Cracks - Copy.jpg" alt="Types of Foundation Cracks" class="service-image" loading="lazy" />
        </div>

        <section class="why-needed">
            <h2>Why Foundation Crack Repair is Essential</h2>
            <p>Ignoring foundation cracks can lead to serious consequences that result in expensive repairs. Here's why timely repair is crucial:</p>
            
            <div class="benefits-grid">
                <div class="benefit-item">
                    <h3>🛡️ Prevent Water Damage</h3>
                    <p>Even hairline cracks can allow significant water infiltration during heavy rains or snowmelt. This water can cause:</p>
                    <ul>
                        <li>Basement flooding and damage to stored items</li>
                        <li>Mold and mildew growth affecting air quality</li>
                        <li>Deterioration of foundation materials over time</li>
                        <li>Damage to interior finishes and flooring</li>
                    </ul>
                </div>
                
                <div class="benefit-item">
                    <h3>🏗️ Maintain Structural Integrity</h3>
                    <p>Foundation cracks can compromise your home's structural stability, especially if they're widening or accompanied by other signs of foundation movement. Repairing cracks early prevents:</p>
                    <ul>
                        <li>Further crack propagation and expansion</li>
                        <li>Structural weakening of load-bearing walls</li>
                        <li>Uneven settling that affects doors and windows</li>
                        <li>Potential safety hazards for your family</li>
                    </ul>
                </div>
                
                <div class="benefit-item">
                    <h3>💰 Protect Property Value</h3>
                    <p>Unrepaired foundation issues can significantly reduce your property value and make it difficult to sell your home. Professional repair:</p>
                    <ul>
                        <li>Maintains or increases your home's market value</li>
                        <li>Provides documentation for potential buyers</li>
                        <li>Prevents issues from appearing in home inspections</li>
                        <li>Gives you peace of mind about your investment</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="how-we-do-it">
            <h2>How We Repair Foundation Cracks</h2>
            <p>Our certified technicians use advanced injection techniques tailored to your specific situation. Here's our comprehensive approach:</p>
            
            <div class="process-steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h3>Thorough Assessment</h3>
                        <p>We begin with a comprehensive inspection of your foundation to identify all cracks, assess their severity, and determine the underlying causes. Our technicians examine:</p>
                        <ul>
                            <li>Crack width, length, and pattern</li>
                            <li>Signs of active movement or water infiltration</li>
                            <li>Foundation type and construction method</li>
                            <li>Surrounding drainage and soil conditions</li>
                        </ul>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h3>Method Selection</h3>
                        <p>Based on our assessment, we select the most appropriate repair method:</p>
                        <div class="methods-grid">
                            <div class="method-card">
                                <h4>Epoxy Crack Injection</h4>
                                <p>For structural cracks that need strength restoration. Creates a rigid bond that restores load-bearing capacity.</p>
                            </div>
                            <div class="method-card">
                                <h4>Polyurethane Injection</h4>
                                <p>For active leaks and water infiltration. Creates a flexible, watertight seal that accommodates minor movement.</p>
                            </div>
                            <div class="method-card">
                                <h4>Low-Pressure Injection</h4>
                                <p>For fine hairline cracks. Gentle application ensures complete penetration without damaging surrounding concrete.</p>
                            </div>
                            <div class="method-card">
                                <h4>High-Pressure Injection</h4>
                                <p>For larger structural cracks. Ensures material reaches deep into the crack for complete sealing.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h3>Professional Installation</h3>
                        <p>Our certified technicians perform the injection with precision:</p>
                        <ul>
                            <li>Surface preparation and crack cleaning</li>
                            <li>Installation of injection ports at strategic intervals</li>
                            <li>Precise material injection under controlled pressure</li>
                            <li>Quality control to ensure complete crack filling</li>
                        </ul>
                        <img src="/images/stock/Cement with Crack - Copy.png" alt="Crack Injection Process" class="process-image" loading="lazy" />
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h3>Final Inspection & Cleanup</h3>
                        <p>After the material cures, we conduct a final inspection to verify the repair's effectiveness, remove injection ports, and clean the work area. You'll receive documentation of the completed work.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="what-you-get">
            <h2>What You'll Get with Our Foundation Crack Repair</h2>
            <p>When you choose CrackBuster for your foundation crack repair, you receive comprehensive service and lasting results:</p>
            
            <div class="results-grid">
                <div class="result-card">
                    <h3>✅ Permanent Seal</h3>
                    <p>Our injection materials become part of your foundation structure, creating a permanent seal that prevents water infiltration and crack propagation for decades.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Structural Restoration</h3>
                    <p>Epoxy injections restore the structural integrity of cracked concrete, returning load-bearing capacity and preventing further deterioration.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Warranty Protection</h3>
                    <p>All our repairs come with comprehensive warranties. The specific terms depend on the repair method, and we provide full warranty documentation with your estimate.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Professional Documentation</h3>
                    <p>You'll receive detailed documentation of the repair work, including before/after photos, material specifications, and warranty information—valuable for insurance claims and future home sales.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Expert Recommendations</h3>
                    <p>Our technicians provide recommendations for preventing future cracks, including drainage improvements, moisture control, and maintenance tips specific to your property.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Peace of Mind</h3>
                    <p>Knowing your foundation is properly repaired gives you confidence in your home's structural integrity and protects your investment for years to come.</p>
                </div>
            </div>
        </section>

        <section class="example-case">
            <h2>Real Example: Before & After</h2>
            <p>Here's what a typical foundation crack repair looks like:</p>
            <div class="example-content">
                <div class="example-item">
                    <h4>Before Repair</h4>
                    <p>A homeowner noticed a 1/4-inch vertical crack in their basement foundation wall that was allowing water to seep in during heavy rains. The crack was widening over time, and they were concerned about structural damage.</p>
                </div>
                <div class="example-item">
                    <h4>Our Solution</h4>
                    <p>We assessed the crack and determined it was suitable for polyurethane injection. The crack was cleaned, injection ports were installed, and we injected high-quality polyurethane material that expanded to fill the entire crack.</p>
                </div>
                <div class="example-item">
                    <h4>After Repair</h4>
                    <p>The crack is now completely sealed, water infiltration has stopped, and the homeowner has peace of mind. The repair was completed in one day with minimal disruption, and they received a comprehensive warranty.</p>
                </div>
            </div>
        </section>

        <section class="call-to-action">
            <p><strong>Don't let foundation cracks become a major problem.</strong> Contact CrackBuster today for a free assessment and estimate. Our expert technicians will evaluate your foundation and recommend the best repair solution for your specific situation.</p>
        </section>`,
        image: '/images/stock/Identifying-Different-Types-of-Foundation-Cracks - Copy.jpg',
        metaTitle: 'Foundation Crack Repair in Edmonton | CrackBuster',
        metaDescription: 'Professional foundation crack repair services in Edmonton. Expert crack injection and sealing solutions.',
        keywords: ['foundation crack repair', 'crack injection', 'foundation repair', 'edmonton'],
        featured: true,
        faq: [
            {
                question: 'How do I know if my foundation crack needs repair?',
                answer: 'If you notice cracks wider than 1/8 inch, cracks that are widening over time, or cracks allowing water into your basement, they should be assessed by a professional. Horizontal cracks and stair-step cracks are particularly concerning and should be addressed promptly.'
            },
            {
                question: 'How long does foundation crack repair take?',
                answer: 'Most foundation crack repairs can be completed in one day. The exact time depends on the number and size of cracks, but our technicians work efficiently to minimize disruption to your daily routine.'
            },
            {
                question: 'Will the repair prevent future cracks?',
                answer: 'While we can\'t prevent all future cracks, our repair methods seal existing cracks and strengthen the foundation. We also provide recommendations for preventing future issues, such as proper drainage and moisture control.'
            },
            {
                question: 'Is foundation crack repair covered by insurance?',
                answer: 'Coverage varies by insurance policy and the cause of the cracks. Cracks caused by normal settling are typically not covered, but damage from specific events may be. We recommend checking with your insurance provider.'
            },
            {
                question: 'How much does foundation crack repair cost?',
                answer: 'Cost depends on the number and severity of cracks, the repair method needed, and accessibility. We provide free estimates so you know exactly what to expect before work begins.'
            },
            {
                question: 'Do you offer a warranty on crack repairs?',
                answer: 'Yes, all our foundation crack repairs come with a warranty. The specific terms depend on the repair method used, and we\'ll provide full warranty details with your estimate.'
            }
        ]
    },
    {
        title: 'Basement Waterproofing',
        description: 'Comprehensive basement waterproofing solutions to keep your basement dry and protected from water damage.',
        content: `<div class="service-intro">
            <p>A dry basement is essential for your home's structural integrity, your family's health, and your property's value. At CrackBuster, we provide comprehensive basement waterproofing solutions that keep water out permanently, protecting your investment and creating a healthy living environment.</p>
            <img src="/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.png" alt="Hydrostatic Pressure and Basement Waterproofing" class="service-image" loading="lazy" />
        </div>

        <section class="why-needed">
            <h2>Why Basement Waterproofing is Critical</h2>
            <p>Water in your basement isn't just an inconvenience—it's a serious problem that can cause extensive damage and health issues. Here's why professional waterproofing is essential:</p>
            
            <div class="benefits-grid">
                <div class="benefit-item">
                    <h3>🏠 Protect Your Home's Foundation</h3>
                    <p>Water infiltration can cause serious damage to your foundation over time:</p>
                    <ul>
                        <li>Hydrostatic pressure from saturated soil can crack foundation walls</li>
                        <li>Freeze-thaw cycles can expand existing cracks</li>
                        <li>Water can erode soil around your foundation, causing settling</li>
                        <li>Moisture weakens concrete and masonry materials</li>
                    </ul>
                </div>
                
                <div class="benefit-item">
                    <h3>🌡️ Prevent Health Hazards</h3>
                    <p>A damp basement creates the perfect environment for mold and mildew growth, which can:</p>
                    <ul>
                        <li>Affect indoor air quality throughout your home</li>
                        <li>Trigger allergies and respiratory problems</li>
                        <li>Create musty odors that are difficult to eliminate</li>
                        <li>Damage stored items and furniture</li>
                    </ul>
                </div>
                
                <div class="benefit-item">
                    <h3>💵 Save Money Long-Term</h3>
                    <p>Investing in professional waterproofing now prevents costly repairs later:</p>
                    <ul>
                        <li>Avoid expensive foundation repairs from water damage</li>
                        <li>Prevent damage to finished basements and belongings</li>
                        <li>Reduce energy costs by eliminating moisture issues</li>
                        <li>Maintain or increase your property value</li>
                    </ul>
                </div>
                
                <div class="benefit-item">
                    <h3>📈 Increase Usable Space</h3>
                    <p>A dry basement becomes valuable living space:</p>
                    <ul>
                        <li>Safe storage for valuable items</li>
                        <li>Potential for finishing as living space</li>
                        <li>Increased home value and functionality</li>
                        <li>Peace of mind knowing your basement is protected</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="how-we-do-it">
            <h2>How We Waterproof Your Basement</h2>
            <p>Our comprehensive waterproofing approach addresses water problems from multiple angles. We assess your specific situation and implement the most effective combination of solutions:</p>
            
            <div class="process-steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h3>Comprehensive Assessment</h3>
                        <p>We start with a thorough evaluation of your basement and property:</p>
                        <ul>
                            <li>Inspection of foundation walls for cracks and damage</li>
                            <li>Assessment of interior and exterior drainage</li>
                            <li>Evaluation of grading and water flow patterns</li>
                            <li>Identification of water entry points and sources</li>
                            <li>Analysis of soil conditions and water table levels</li>
                        </ul>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h3>Customized Solution Design</h3>
                        <p>Based on our assessment, we design a waterproofing system tailored to your property. Our solutions may include:</p>
                        <div class="methods-grid">
                            <div class="method-card">
                                <h4>Interior Drainage Systems</h4>
                                <p>Channel water that enters your basement to a sump pump. Installed along the perimeter of your basement floor, these systems collect water and direct it away from your foundation.</p>
                            </div>
                            <div class="method-card">
                                <h4>Exterior Waterproofing Membranes</h4>
                                <p>Applied to the exterior of foundation walls, these membranes create a barrier that prevents water from reaching your foundation. Combined with proper drainage, this is the most effective long-term solution.</p>
                            </div>
                            <div class="method-card">
                                <h4>Sump Pump Installation</h4>
                                <p>Active defense against water intrusion. Collects water from drainage systems and pumps it away from your foundation. Essential for areas with high water tables or recurring water issues.</p>
                            </div>
                            <div class="method-card">
                                <h4>French Drain Systems</h4>
                                <p>Perforated pipes surrounded by gravel that collect and redirect groundwater away from your foundation. Can be installed interior or exterior depending on your needs.</p>
                            </div>
                            <div class="method-card">
                                <h4>Grading & Drainage Improvements</h4>
                                <p>Ensuring proper slope away from your foundation and maintaining gutters and downspouts. Often the first line of defense against water problems.</p>
                            </div>
                            <div class="method-card">
                                <h4>Crack Sealing & Repair</h4>
                                <p>Sealing foundation cracks with injection methods to prevent water entry points. Essential component of comprehensive waterproofing.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h3>Professional Installation</h3>
                        <p>Our certified technicians install your waterproofing system with precision and attention to detail:</p>
                        <ul>
                            <li>Proper excavation when exterior work is needed</li>
                            <li>High-quality materials that meet industry standards</li>
                            <li>Precise installation following manufacturer specifications</li>
                            <li>Integration of multiple systems for maximum effectiveness</li>
                            <li>Minimal disruption to your daily routine</li>
                        </ul>
                        <img src="/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.png" alt="Waterproofing Installation" class="process-image" loading="lazy" />
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h3>Testing & Maintenance Guidance</h3>
                        <p>After installation, we test all systems to ensure proper operation and provide you with maintenance guidelines to keep your waterproofing system functioning optimally for years to come.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="what-you-get">
            <h2>What You'll Get with Our Basement Waterproofing</h2>
            <p>When you choose CrackBuster for basement waterproofing, you receive a comprehensive solution that protects your home for decades:</p>
            
            <div class="results-grid">
                <div class="result-card">
                    <h3>✅ Dry Basement Guarantee</h3>
                    <p>A permanently dry basement that stays dry even during heavy rains, snowmelt, and high water table conditions. Our systems are designed to handle hydrostatic pressure and prevent water infiltration.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Long-Lasting Protection</h3>
                    <p>Properly installed waterproofing systems last 20-30 years or more. We use high-quality materials and proven installation techniques to ensure your investment provides lasting protection.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Comprehensive Warranty</h3>
                    <p>All our waterproofing work comes with comprehensive warranties. We stand behind our installations and provide full warranty documentation for your peace of mind.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Improved Air Quality</h3>
                    <p>Eliminating moisture prevents mold and mildew growth, improving the air quality throughout your home and creating a healthier living environment for your family.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Increased Property Value</h3>
                    <p>A dry, waterproofed basement increases your home's value and makes it more attractive to potential buyers. You'll have documentation of the professional waterproofing work.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Usable Basement Space</h3>
                    <p>With a dry basement, you can safely store belongings, finish the space as living area, or simply enjoy the peace of mind that comes with a protected foundation.</p>
                </div>
            </div>
        </section>

        <section class="example-case">
            <h2>Real Example: Complete Basement Transformation</h2>
            <p>Here's how we solved a challenging basement water problem:</p>
            <div class="example-content">
                <div class="example-item">
                    <h4>The Problem</h4>
                    <p>A homeowner in Edmonton had recurring water issues in their basement, especially during spring thaw. Water was seeping through foundation cracks and pooling on the floor. They had tried DIY solutions without success and were concerned about mold growth and foundation damage.</p>
                </div>
                <div class="example-item">
                    <h4>Our Solution</h4>
                    <p>We conducted a comprehensive assessment and found multiple issues: foundation cracks, poor exterior drainage, and inadequate grading. We implemented a complete solution: sealed all foundation cracks with polyurethane injection, installed an interior drainage system with a sump pump, improved exterior grading, and extended downspouts away from the foundation.</p>
                </div>
                <div class="example-item">
                    <h4>The Result</h4>
                    <p>The basement has remained completely dry through multiple heavy rain seasons and spring thaws. The homeowner can now safely use their basement for storage and is considering finishing it as additional living space. They have peace of mind knowing their foundation is protected.</p>
                </div>
            </div>
        </section>

        <section class="call-to-action">
            <p><strong>Don't let water damage your basement and foundation.</strong> Contact CrackBuster today for a free assessment. Our waterproofing experts will evaluate your situation and design a customized solution to keep your basement dry permanently.</p>
        </section>`,
        image: '/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.png',
        metaTitle: 'Basement Waterproofing in Edmonton | CrackBuster',
        metaDescription: 'Professional basement waterproofing services in Edmonton. Keep your basement dry with our expert solutions.',
        keywords: ['basement waterproofing', 'waterproofing', 'basement repair', 'edmonton'],
        featured: true,
        faq: [
            {
                question: 'What causes basement water problems?',
                answer: 'Common causes include hydrostatic pressure from water-saturated soil, poor drainage around your foundation, foundation cracks, improper grading, and inadequate or failed waterproofing systems. Our assessment will identify the specific cause in your situation.'
            },
            {
                question: 'What is the difference between interior and exterior waterproofing?',
                answer: 'Interior waterproofing manages water that has already entered your basement through drainage systems and sump pumps. Exterior waterproofing prevents water from reaching your foundation walls through membranes and proper drainage. The best solution often combines both approaches.'
            },
            {
                question: 'How long does basement waterproofing last?',
                answer: 'Properly installed waterproofing systems can last 20-30 years or more. The lifespan depends on the system type, installation quality, and ongoing maintenance. We use high-quality materials and proper installation techniques to ensure long-lasting results.'
            },
            {
                question: 'Will waterproofing require major excavation?',
                answer: 'Not always. Interior waterproofing systems typically don\'t require excavation. Exterior waterproofing does require excavation, but we work efficiently to minimize disruption. We\'ll discuss all options and their requirements during your free estimate.'
            },
            {
                question: 'Do I need a sump pump?',
                answer: 'A sump pump is recommended if you have recurring water issues, live in an area with high water tables, or have a finished basement. It provides an active defense against water intrusion by collecting and pumping water away from your foundation.'
            },
            {
                question: 'Can I waterproof my basement myself?',
                answer: 'While some minor maintenance tasks can be DIY, professional waterproofing requires specialized knowledge, equipment, and materials. Improper installation can lead to continued problems and costly repairs. We recommend professional installation for reliable, long-term results.'
            }
        ]
    },
    {
        title: 'Crack Injection',
        description: 'Advanced crack injection techniques for effective and long-lasting crack repairs in concrete foundations.',
        content: `<div class="service-intro">
            <p>Crack injection is one of the most effective and efficient methods for repairing foundation cracks. At CrackBuster, we use state-of-the-art injection systems and premium materials to seal cracks from the inside out, creating permanent repairs that restore structural integrity and prevent water infiltration.</p>
            <img src="/images/stock/Cement with Crack - Copy.png" alt="Crack Injection Process" class="service-image" loading="lazy" />
        </div>

        <section class="why-needed">
            <h2>Why Choose Crack Injection for Foundation Repair</h2>
            <p>Crack injection offers numerous advantages over traditional repair methods. Here's why it's the preferred solution for foundation crack repair:</p>
            
            <div class="benefits-grid">
                <div class="benefit-item">
                    <h3>🎯 Precise & Effective</h3>
                    <p>Crack injection delivers repair material directly into the crack, ensuring complete filling:</p>
                    <ul>
                        <li>Material reaches deep into the crack, not just the surface</li>
                        <li>Creates a bond that becomes part of the concrete structure</li>
                        <li>More effective than surface sealing methods</li>
                        <li>Works on cracks that are difficult to access from outside</li>
                    </ul>
                </div>
                
                <div class="benefit-item">
                    <h3>⚡ Fast & Non-Invasive</h3>
                    <p>Injection repairs are completed quickly with minimal disruption:</p>
                    <ul>
                        <li>Most repairs completed in one day</li>
                        <li>No major excavation required</li>
                        <li>Minimal disruption to your daily routine</li>
                        <li>Can be performed from inside your basement</li>
                    </ul>
                </div>
                
                <div class="benefit-item">
                    <h3>💪 Structural Restoration</h3>
                    <p>Epoxy injection restores strength to cracked concrete:</p>
                    <ul>
                        <li>Creates a rigid bond that restores load-bearing capacity</li>
                        <li>Prevents crack propagation and widening</li>
                        <li>Returns structural integrity to damaged concrete</li>
                        <li>Can be stronger than the original concrete in some cases</li>
                    </ul>
                </div>
                
                <div class="benefit-item">
                    <h3>🌊 Watertight Sealing</h3>
                    <p>Polyurethane injection creates flexible, watertight seals:</p>
                    <ul>
                        <li>Expands to fill entire crack volume</li>
                        <li>Creates a flexible seal that accommodates minor movement</li>
                        <li>Stops active leaks immediately</li>
                        <li>Prevents future water infiltration</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="how-we-do-it">
            <h2>How We Perform Crack Injection</h2>
            <p>Our crack injection process is precise, professional, and tailored to your specific crack type and conditions. Here's our step-by-step approach:</p>
            
            <div class="process-steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h3>Crack Assessment & Material Selection</h3>
                        <p>We begin by thoroughly assessing your crack to determine the best injection method and material:</p>
                        <ul>
                            <li>Measure crack width, length, and depth</li>
                            <li>Check for active water infiltration</li>
                            <li>Assess structural significance</li>
                            <li>Determine if crack is still moving</li>
                        </ul>
                        <p>Based on this assessment, we select the appropriate material:</p>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h3>Material Types & Applications</h3>
                        <div class="methods-grid">
                            <div class="method-card">
                                <h4>Epoxy Injection</h4>
                                <p><strong>Best for:</strong> Structural cracks that need strength restoration</p>
                                <ul>
                                    <li>Creates rigid, structural bond</li>
                                    <li>Restores load-bearing capacity</li>
                                    <li>Prevents crack propagation</li>
                                    <li>Cures to full strength in 24-48 hours</li>
                                </ul>
                            </div>
                            <div class="method-card">
                                <h4>Polyurethane Injection</h4>
                                <p><strong>Best for:</strong> Active leaks and water infiltration</p>
                                <ul>
                                    <li>Creates flexible, watertight seal</li>
                                    <li>Expands to fill entire crack</li>
                                    <li>Cures quickly (minutes to hours)</li>
                                    <li>Accommodates minor movement</li>
                                </ul>
                            </div>
                            <div class="method-card">
                                <h4>Low-Pressure Injection</h4>
                                <p><strong>Best for:</strong> Fine hairline cracks</p>
                                <ul>
                                    <li>Gentle application method</li>
                                    <li>Prevents damage to surrounding concrete</li>
                                    <li>Ensures complete penetration</li>
                                    <li>Ideal for delicate repairs</li>
                                </ul>
                            </div>
                            <div class="method-card">
                                <h4>High-Pressure Injection</h4>
                                <p><strong>Best for:</strong> Larger structural cracks</p>
                                <ul>
                                    <li>Forces material deep into crack</li>
                                    <li>Ensures complete filling</li>
                                    <li>Effective for wide or deep cracks</li>
                                    <li>Professional equipment required</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h3>Surface Preparation</h3>
                        <p>Proper preparation ensures optimal results:</p>
                        <ul>
                            <li>Clean crack surface to remove loose material and debris</li>
                            <li>Remove any existing sealants or coatings</li>
                            <li>Dry the crack if necessary (for epoxy injection)</li>
                            <li>Mark injection port locations at strategic intervals</li>
                        </ul>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h3>Injection Port Installation</h3>
                        <p>We install injection ports along the crack at carefully calculated intervals:</p>
                        <ul>
                            <li>Ports are spaced based on crack width and material type</li>
                            <li>Sealed to prevent material leakage during injection</li>
                            <li>Positioned to ensure complete crack filling</li>
                            <li>Can be installed on vertical, horizontal, or overhead surfaces</li>
                        </ul>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">5</div>
                    <div class="step-content">
                        <h3>Material Injection</h3>
                        <p>Using professional injection equipment, we inject the material:</p>
                        <ul>
                            <li>Start from the lowest port and work upward</li>
                            <li>Inject under controlled pressure</li>
                            <li>Monitor material flow to ensure complete filling</li>
                            <li>Continue until material appears at adjacent ports</li>
                        </ul>
                        <img src="/images/stock/Cement with Crack - Copy.png" alt="Crack Injection in Progress" class="process-image" loading="lazy" />
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">6</div>
                    <div class="step-content">
                        <h3>Curing & Final Inspection</h3>
                        <p>After injection, we allow proper curing time and then:</p>
                        <ul>
                            <li>Remove injection ports</li>
                            <li>Grind port locations flush with the surface</li>
                            <li>Conduct final inspection to verify complete filling</li>
                            <li>Test for water tightness if applicable</li>
                            <li>Clean work area thoroughly</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section class="what-you-get">
            <h2>What You'll Get with Our Crack Injection Service</h2>
            <p>When you choose CrackBuster for crack injection, you receive professional service and lasting results:</p>
            
            <div class="results-grid">
                <div class="result-card">
                    <h3>✅ Permanent Repair</h3>
                    <p>The injection material becomes part of your foundation structure, creating a permanent repair that lasts for decades. Unlike surface treatments, injection repairs don't deteriorate over time.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Complete Crack Filling</h3>
                    <p>Our injection process ensures the entire crack is filled, from surface to depth. Material flows into all voids and fissures, creating a complete seal that prevents water infiltration.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Structural Strength Restoration</h3>
                    <p>Epoxy injection restores the structural integrity of cracked concrete. The rigid bond created by epoxy can actually be stronger than the original concrete, preventing further crack propagation.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Immediate Water Sealing</h3>
                    <p>Polyurethane injection stops active leaks immediately. The material expands and cures quickly, creating a watertight seal that prevents further water damage.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Professional Equipment & Materials</h3>
                    <p>We use state-of-the-art injection equipment and premium materials from trusted manufacturers. Our materials meet strict quality and safety standards.</p>
                </div>
                
                <div class="result-card">
                    <h3>✅ Comprehensive Warranty</h3>
                    <p>All our injection work comes with warranties. We stand behind our repairs and provide full warranty documentation for your peace of mind.</p>
                </div>
            </div>
        </section>

        <section class="example-case">
            <h2>Real Example: Successful Crack Injection Repair</h2>
            <p>Here's how we solved a challenging crack problem:</p>
            <div class="example-content">
                <div class="example-item">
                    <h4>The Challenge</h4>
                    <p>A homeowner discovered a 3/8-inch vertical crack in their basement foundation wall that was actively leaking water during heavy rains. The crack extended from the floor to the ceiling and was showing signs of widening. They were concerned about structural damage and water damage to their finished basement.</p>
                </div>
                <div class="example-item">
                    <h4>Our Solution</h4>
                    <p>We assessed the crack and determined it required polyurethane injection due to the active leak. We cleaned the crack thoroughly, installed injection ports at 12-inch intervals, and injected high-quality polyurethane material under controlled pressure. The material expanded to fill the entire crack, including small fissures that weren't visible on the surface.</p>
                </div>
                <div class="example-item">
                    <h4>The Result</h4>
                    <p>The leak stopped immediately after injection. The crack is now completely sealed, and the homeowner has had no water issues through multiple heavy rain seasons. The repair was completed in one day with minimal disruption, and they received a comprehensive warranty. Their basement remains dry, and they have peace of mind about their foundation's integrity.</p>
                </div>
            </div>
        </section>

        <section class="call-to-action">
            <p><strong>Don't let foundation cracks compromise your home.</strong> Contact CrackBuster today for a free assessment. Our injection specialists will evaluate your cracks and recommend the best injection method and material for a permanent repair.</p>
        </section>`,
        image: '/images/stock/Cement with Crack - Copy.png',
        metaTitle: 'Crack Injection Services in Edmonton | CrackBuster',
        metaDescription: 'Professional crack injection services in Edmonton. Advanced injection techniques for lasting repairs.',
        keywords: ['crack injection', 'epoxy injection', 'polyurethane injection', 'edmonton'],
        featured: true,
        faq: [
            {
                question: 'What is the difference between epoxy and polyurethane injection?',
                answer: 'Epoxy injection creates a rigid, structural bond that restores strength to cracked concrete. It\'s ideal for structural cracks. Polyurethane injection creates a flexible, watertight seal and is better for active leaks. We\'ll recommend the best material based on your specific situation.'
            },
            {
                question: 'Can injection be used on all types of cracks?',
                answer: 'Injection works well for most vertical and diagonal cracks, hairline to moderate width cracks, and active leaks. It\'s not suitable for severe structural damage or cracks in severely deteriorated concrete. Our assessment will determine if injection is appropriate for your cracks.'
            },
            {
                question: 'How long does the injection material take to cure?',
                answer: 'Polyurethane typically cures within minutes to hours, allowing for immediate water sealing. Epoxy takes longer to cure, usually 24-48 hours for full strength. We\'ll provide specific timelines based on the material used and environmental conditions.'
            },
            {
                question: 'Is crack injection safe for my family and pets?',
                answer: 'Yes, our injection materials are environmentally friendly and safe once cured. We use materials that meet strict safety standards. During installation, we ensure proper ventilation and follow all safety protocols.'
            },
            {
                question: 'Will injection work on cracks that are still moving?',
                answer: 'Polyurethane injection is flexible and can accommodate minor movement. For cracks with significant movement, we may need to address the underlying cause first. Our assessment will identify any movement issues and recommend appropriate solutions.'
            },
            {
                question: 'How long will the injection repair last?',
                answer: 'When properly installed, injection repairs can last for decades. The material becomes part of the concrete structure, creating a permanent seal. We provide warranties on our injection work to ensure your peace of mind.'
            },
            {
                question: 'Can I do crack injection myself?',
                answer: 'While DIY injection kits are available, professional injection requires proper equipment, technique, and material selection. Improper injection can be ineffective or even cause damage. Professional installation ensures proper material placement and long-lasting results.'
            }
        ]
    }
];

// Blog posts data (based on articles found)
const blogPostsData = [
    {
        title: 'Types of Foundation Cracks and Assessment',
        excerpt: 'Understanding different types of foundation cracks and how to assess their severity is crucial for homeowners.',
        content: `<div class="blog-intro">
            <p>Foundation cracks come in various forms, each indicating different levels of concern. As a homeowner, understanding these types and knowing how to assess their severity can help you determine when to call a professional and prevent costly damage. This comprehensive guide will help you identify and understand the different types of foundation cracks.</p>
            <img src="/images/stock/Identifying-Different-Types-of-Foundation-Cracks - Copy.jpg" alt="Types of Foundation Cracks" class="blog-featured-image" loading="lazy" />
        </div>

        <section class="crack-types">
            <h2>Common Types of Foundation Cracks</h2>
            
            <article class="crack-type-item">
                <h3>Vertical Cracks</h3>
                <div class="crack-content">
                    <div class="crack-description">
                        <p><strong>Appearance:</strong> Straight up-and-down cracks running vertically along foundation walls.</p>
                        <p><strong>Common Causes:</strong></p>
                        <ul>
                            <li>Normal concrete shrinkage during curing</li>
                            <li>Minor foundation settling</li>
                            <li>Temperature changes causing expansion and contraction</li>
                        </ul>
                        <p><strong>Severity:</strong> Usually the least concerning type of crack. Most vertical cracks are cosmetic and don't indicate structural problems, especially if they're:</p>
                        <ul>
                            <li>Less than 1/8 inch wide</li>
                            <li>Not widening over time</li>
                            <li>Not allowing water infiltration</li>
                        </ul>
                        <p><strong>When to Worry:</strong> If vertical cracks are wider than 1/4 inch, are widening, or are allowing water into your basement, they should be assessed by a professional.</p>
                        <p><strong>Repair Method:</strong> Most vertical cracks can be repaired with simple injection methods (epoxy or polyurethane) if they're allowing water or if you want to prevent future issues.</p>
                    </div>
                </div>
            </article>

            <article class="crack-type-item">
                <h3>Horizontal Cracks</h3>
                <div class="crack-content">
                    <div class="crack-description">
                        <p><strong>Appearance:</strong> Cracks running horizontally across foundation walls, often parallel to the ground.</p>
                        <p><strong>Common Causes:</strong></p>
                        <ul>
                            <li>Hydrostatic pressure from water-saturated soil</li>
                            <li>Foundation wall bowing or bulging</li>
                            <li>Excessive lateral pressure on foundation walls</li>
                            <li>Frost heave in cold climates</li>
                        </ul>
                        <p><strong>Severity:</strong> <strong>These are serious and require immediate professional attention.</strong> Horizontal cracks often indicate structural issues that can compromise your foundation's integrity.</p>
                        <p><strong>Why They're Serious:</strong></p>
                        <ul>
                            <li>Indicate foundation walls are under excessive pressure</li>
                            <li>Can lead to wall failure if not addressed</li>
                            <li>Often accompanied by bowing or bulging walls</li>
                            <li>May require structural reinforcement, not just sealing</li>
                        </ul>
                        <p><strong>Action Required:</strong> Contact a foundation repair professional immediately if you notice horizontal cracks. They will assess the severity and recommend appropriate structural repairs.</p>
                        <img src="/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.png" alt="Horizontal Crack from Hydrostatic Pressure" class="blog-image" loading="lazy" />
                    </div>
                </div>
            </article>

            <article class="crack-type-item">
                <h3>Diagonal Cracks</h3>
                <div class="crack-content">
                    <div class="crack-description">
                        <p><strong>Appearance:</strong> Cracks running at an angle, typically from corners or at 45-degree angles.</p>
                        <p><strong>Common Causes:</strong></p>
                        <ul>
                            <li>Foundation settlement (uneven or differential settling)</li>
                            <li>Foundation shifting or movement</li>
                            <li>Soil movement beneath the foundation</li>
                            <li>Expansive soil conditions</li>
                        </ul>
                        <p><strong>Severity:</strong> Varies based on width, length, and whether the crack is active (widening). The angle and location help determine severity:</p>
                        <ul>
                            <li><strong>Narrow diagonal cracks</strong> (less than 1/8 inch) are often due to normal settling</li>
                            <li><strong>Wide diagonal cracks</strong> (more than 1/4 inch) may indicate significant foundation movement</li>
                            <li><strong>Cracks at corners</strong> can indicate differential settlement</li>
                        </ul>
                        <p><strong>Assessment Factors:</strong></p>
                        <ul>
                            <li>Is the crack widening over time?</li>
                            <li>Are there other signs of foundation movement (sticking doors, uneven floors)?</li>
                            <li>Is water entering through the crack?</li>
                            <li>What is the crack's width and length?</li>
                        </ul>
                        <p><strong>Repair:</strong> Diagonal cracks should be assessed by a professional. Repair may involve crack injection, foundation stabilization, or addressing underlying settlement issues.</p>
                    </div>
                </div>
            </article>

            <article class="crack-type-item">
                <h3>Stair-Step Cracks</h3>
                <div class="crack-content">
                    <div class="crack-description">
                        <p><strong>Appearance:</strong> Cracks that follow the mortar joints in block or brick foundations, creating a stair-step pattern.</p>
                        <p><strong>Common Causes:</strong></p>
                        <ul>
                            <li>Foundation settlement or movement</li>
                            <li>Lateral pressure on foundation walls</li>
                            <li>Frost heave</li>
                            <li>Soil expansion and contraction</li>
                        </ul>
                        <p><strong>Severity:</strong> Can range from minor to serious depending on:</p>
                        <ul>
                            <li>Width of the crack</li>
                            <li>Whether it's widening</li>
                            <li>Location and extent of the crack</li>
                            <li>Presence of other foundation issues</li>
                        </ul>
                        <p><strong>Why They Follow Mortar Joints:</strong> Mortar is weaker than the blocks or bricks, so cracks naturally follow the path of least resistance along mortar joints.</p>
                        <p><strong>Assessment:</strong> Stair-step cracks should be evaluated by a professional, especially if they're wider than 1/4 inch, are widening, or are accompanied by other signs of foundation problems.</p>
                    </div>
                </div>
            </article>
        </section>

        <section class="assessment-guide">
            <h2>How to Assess Foundation Cracks</h2>
            <p>When evaluating foundation cracks, consider these key factors:</p>
            
            <div class="assessment-factors">
                <div class="factor-card">
                    <h3>1. Crack Width</h3>
                    <ul>
                        <li><strong>Hairline to 1/8 inch:</strong> Usually not a structural concern, but should be monitored</li>
                        <li><strong>1/8 to 1/4 inch:</strong> Should be assessed by a professional, especially if allowing water</li>
                        <li><strong>More than 1/4 inch:</strong> Requires immediate professional evaluation</li>
                    </ul>
                </div>
                
                <div class="factor-card">
                    <h3>2. Crack Activity</h3>
                    <ul>
                        <li><strong>Stable cracks:</strong> Not widening over time - less urgent</li>
                        <li><strong>Active cracks:</strong> Widening or lengthening - requires attention</li>
                        <li><strong>Monitor with:</strong> Mark crack ends with pencil and measure periodically</li>
                    </ul>
                </div>
                
                <div class="factor-card">
                    <h3>3. Water Infiltration</h3>
                    <ul>
                        <li><strong>Dry cracks:</strong> May be cosmetic, but should still be sealed</li>
                        <li><strong>Wet cracks:</strong> Indicate active water problems requiring repair</li>
                        <li><strong>Leaking cracks:</strong> Need immediate attention to prevent damage</li>
                    </ul>
                </div>
                
                <div class="factor-card">
                    <h3>4. Location and Pattern</h3>
                    <ul>
                        <li><strong>Single isolated crack:</strong> Often less concerning</li>
                        <li><strong>Multiple cracks:</strong> May indicate broader foundation issues</li>
                        <li><strong>Pattern:</strong> Horizontal and stair-step patterns are more serious</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="when-to-call-professional">
            <h2>When to Call a Professional</h2>
            <p>While some cracks are minor, others require immediate professional attention. Call a foundation repair specialist if you notice:</p>
            <ul class="warning-list">
                <li>Any horizontal cracks</li>
                <li>Cracks wider than 1/4 inch</li>
                <li>Cracks that are widening over time</li>
                <li>Cracks allowing water into your basement</li>
                <li>Multiple cracks appearing in a short time</li>
                <li>Cracks accompanied by other signs (sticking doors, uneven floors, bowing walls)</li>
                <li>Stair-step cracks wider than 1/4 inch</li>
            </ul>
        </section>

        <section class="conclusion">
            <h2>Conclusion</h2>
            <p>Understanding the different types of foundation cracks and their implications is crucial for protecting your home. While some cracks are normal and minor, others indicate serious structural issues that require immediate attention. When in doubt, it's always best to have cracks assessed by a professional foundation repair specialist.</p>
            <p>Early detection and repair can prevent more serious and expensive problems down the road. If you've noticed cracks in your foundation, don't hesitate to contact CrackBuster for a free professional assessment. Our certified technicians will evaluate your cracks and recommend the appropriate repair solution.</p>
        </section>`,
        featuredImage: '/images/stock/Identifying-Different-Types-of-Foundation-Cracks - Copy.jpg',
        metaTitle: 'Types of Foundation Cracks and Assessment | CrackBuster Blog',
        metaDescription: 'Learn about different types of foundation cracks and how to assess their severity.',
        keywords: ['foundation cracks', 'crack assessment', 'foundation repair'],
        published: true,
        publishedAt: new Date('2024-01-15')
    },
    {
        title: 'Why Is My Basement Leaking?',
        excerpt: 'Common causes of basement leaks and how to identify the source of water problems.',
        content: `<div class="blog-intro">
            <p>Basement leaks can be frustrating, damaging, and costly. Understanding the common causes of basement leaks is the first step toward finding an effective solution. This comprehensive guide will help you identify why your basement is leaking and what you can do about it.</p>
            <img src="/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.png" alt="Basement Leak Causes" class="blog-featured-image" loading="lazy" />
        </div>

        <section class="common-causes">
            <h2>Common Causes of Basement Leaks</h2>
            
            <article class="cause-item">
                <h3>1. Hydrostatic Pressure</h3>
                <div class="cause-content">
                    <p><strong>What it is:</strong> Hydrostatic pressure occurs when water accumulates in the soil around your foundation, creating pressure that forces water through cracks and porous concrete.</p>
                    <p><strong>How it happens:</strong></p>
                    <ul>
                        <li>Heavy rain or snowmelt saturates the soil around your foundation</li>
                        <li>Water-saturated soil creates pressure against foundation walls</li>
                        <li>This pressure forces water through any available opening</li>
                        <li>Even small cracks can allow significant water infiltration under pressure</li>
                    </ul>
                    <p><strong>Signs:</strong></p>
                    <ul>
                        <li>Water seeping through foundation cracks</li>
                        <li>Water appearing at the base of walls</li>
                        <li>Leaks that worsen during or after heavy rain</li>
                        <li>Horizontal cracks in foundation walls (caused by pressure)</li>
                    </ul>
                    <p><strong>Solutions:</strong></p>
                    <ul>
                        <li>Improve exterior drainage to reduce water accumulation</li>
                        <li>Install interior drainage systems to manage water that enters</li>
                        <li>Seal foundation cracks to prevent water entry</li>
                        <li>Install sump pump to remove accumulated water</li>
                    </ul>
                    <img src="/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.png" alt="Hydrostatic Pressure Diagram" class="blog-image" loading="lazy" />
                </div>
            </article>

            <article class="cause-item">
                <h3>2. Poor Drainage</h3>
                <div class="cause-content">
                    <p><strong>What it is:</strong> Improper grading, clogged gutters, or inadequate downspouts can direct water toward your foundation instead of away from it.</p>
                    <p><strong>Common drainage problems:</strong></p>
                    <ul>
                        <li><strong>Improper grading:</strong> Soil slopes toward foundation instead of away</li>
                        <li><strong>Clogged gutters:</strong> Water overflows and pools near foundation</li>
                        <li><strong>Short downspouts:</strong> Water is released too close to foundation</li>
                        <li><strong>Missing downspout extensions:</strong> Water doesn't drain far enough away</li>
                        <li><strong>Poor landscaping:</strong> Planters or features that trap water near foundation</li>
                    </ul>
                    <p><strong>Signs:</strong></p>
                    <ul>
                        <li>Water pooling near foundation after rain</li>
                        <li>Erosion around foundation</li>
                        <li>Leaks that correlate with rainfall</li>
                        <li>Wet spots in yard near foundation</li>
                    </ul>
                    <p><strong>Solutions:</strong></p>
                    <ul>
                        <li>Regrade soil to slope away from foundation (minimum 6 inches in first 10 feet)</li>
                        <li>Clean gutters regularly and ensure proper flow</li>
                        <li>Extend downspouts at least 6 feet from foundation</li>
                        <li>Install French drains if needed</li>
                        <li>Improve landscaping to direct water away</li>
                    </ul>
                </div>
            </article>

            <article class="cause-item">
                <h3>3. Foundation Cracks</h3>
                <div class="cause-content">
                    <p><strong>What it is:</strong> Even small foundation cracks can allow significant water infiltration, especially during heavy rains or when hydrostatic pressure is present.</p>
                    <p><strong>How cracks allow leaks:</strong></p>
                    <ul>
                        <li>Water follows the path of least resistance</li>
                        <li>Cracks provide direct pathways for water entry</li>
                        <li>Under pressure, even hairline cracks can leak</li>
                        <li>Multiple cracks can allow substantial water infiltration</li>
                    </ul>
                    <p><strong>Types of cracks that leak:</strong></p>
                    <ul>
                        <li>Vertical cracks (most common leak points)</li>
                        <li>Horizontal cracks (serious structural concern)</li>
                        <li>Diagonal cracks (settlement-related)</li>
                        <li>Stair-step cracks (in block foundations)</li>
                    </ul>
                    <p><strong>Solutions:</strong></p>
                    <ul>
                        <li>Professional crack assessment to identify all leaks</li>
                        <li>Crack injection (epoxy or polyurethane) to seal leaks</li>
                        <li>Address underlying causes (settlement, pressure, etc.)</li>
                        <li>Combine with drainage improvements for complete solution</li>
                    </ul>
                    <img src="/images/stock/Cement with Crack - Copy.png" alt="Foundation Crack Leak" class="blog-image" loading="lazy" />
                </div>
            </article>

            <article class="cause-item">
                <h3>4. Window Well Issues</h3>
                <div class="cause-content">
                    <p><strong>What it is:</strong> Window wells that aren't properly sealed, drained, or covered can allow water into your basement.</p>
                    <p><strong>Common problems:</strong></p>
                    <ul>
                        <li>Missing or damaged window well covers</li>
                        <li>Improper sealing around basement windows</li>
                        <li>Inadequate drainage in window wells</li>
                        <li>Debris blocking window well drains</li>
                        <li>Windows not properly installed or sealed</li>
                    </ul>
                    <p><strong>Signs:</strong></p>
                    <ul>
                        <li>Water entering around basement windows</li>
                        <li>Water pooling in window wells</li>
                        <li>Leaks that start near windows</li>
                        <li>Visible gaps or damage around window frames</li>
                    </ul>
                    <p><strong>Solutions:</strong></p>
                    <ul>
                        <li>Install or repair window well covers</li>
                        <li>Ensure proper drainage in window wells</li>
                        <li>Seal gaps around window frames</li>
                        <li>Clean window well drains regularly</li>
                        <li>Consider window well drainage systems</li>
                    </ul>
                </div>
            </article>

            <article class="cause-item">
                <h3>5. Plumbing Leaks</h3>
                <div class="cause-content">
                    <p><strong>What it is:</strong> Sometimes the water isn't coming from outside—it's from plumbing leaks inside your home.</p>
                    <p><strong>Common sources:</strong></p>
                    <ul>
                        <li>Leaking pipes in walls or ceiling</li>
                        <li>Faulty water heater</li>
                        <li>Leaking washing machine connections</li>
                        <li>Drain line problems</li>
                        <li>Condensation from HVAC systems</li>
                    </ul>
                    <p><strong>How to identify:</strong></p>
                    <ul>
                        <li>Leaks that occur regardless of weather</li>
                        <li>Water appearing from walls or ceiling</li>
                        <li>Dampness near plumbing fixtures</li>
                        <li>Unusual water usage on utility bills</li>
                        <li>Musty odors from hidden leaks</li>
                    </ul>
                    <p><strong>Solutions:</strong></p>
                    <ul>
                        <li>Inspect all visible plumbing</li>
                        <li>Check water heater for leaks</li>
                        <li>Test washing machine connections</li>
                        <li>Call plumber for hidden leaks</li>
                        <li>Address HVAC condensation issues</li>
                    </ul>
                </div>
            </article>

            <article class="cause-item">
                <h3>6. Failed or Missing Waterproofing</h3>
                <div class="cause-content">
                    <p><strong>What it is:</strong> Older homes may have inadequate or failed waterproofing systems that no longer protect against water infiltration.</p>
                    <p><strong>Common issues:</strong></p>
                    <ul>
                        <li>No waterproofing membrane on exterior walls</li>
                        <li>Deteriorated or damaged waterproofing</li>
                        <li>Inadequate drainage systems</li>
                        <li>Missing or failed sump pump</li>
                    </ul>
                    <p><strong>Solutions:</strong></p>
                    <ul>
                        <li>Install interior drainage systems</li>
                        <li>Apply exterior waterproofing membranes (requires excavation)</li>
                        <li>Install or repair sump pump</li>
                        <li>Implement comprehensive waterproofing solution</li>
                    </ul>
                </div>
            </article>
        </section>

        <section class="identification-guide">
            <h2>How to Identify the Source of Your Leak</h2>
            <p>Determining the source of your basement leak is crucial for effective repair. Here's a systematic approach:</p>
            
            <div class="identification-steps">
                <div class="step-card">
                    <h3>Step 1: Observe When Leaks Occur</h3>
                    <ul>
                        <li>During or immediately after rain? → Likely exterior water source</li>
                        <li>Regardless of weather? → Could be plumbing or condensation</li>
                        <li>Only in specific seasons? → May be related to water table or freeze-thaw</li>
                    </ul>
                </div>
                
                <div class="step-card">
                    <h3>Step 2: Locate the Entry Point</h3>
                    <ul>
                        <li>Track water to its source</li>
                        <li>Look for cracks, gaps, or openings</li>
                        <li>Check window wells and window frames</li>
                        <li>Inspect floor and wall junctions</li>
                    </ul>
                </div>
                
                <div class="step-card">
                    <h3>Step 3: Check Exterior Conditions</h3>
                    <ul>
                        <li>Inspect grading around foundation</li>
                        <li>Check gutter and downspout function</li>
                        <li>Look for water pooling near foundation</li>
                        <li>Examine foundation walls for cracks</li>
                    </ul>
                </div>
                
                <div class="step-card">
                    <h3>Step 4: Professional Inspection</h3>
                    <p>For accurate diagnosis and effective solutions, a professional inspection is recommended. Professionals can:</p>
                    <ul>
                        <li>Identify all water entry points</li>
                        <li>Assess foundation condition</li>
                        <li>Evaluate drainage systems</li>
                        <li>Recommend comprehensive solutions</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="prevention-tips">
            <h2>Preventing Future Basement Leaks</h2>
            <p>Once you've addressed existing leaks, prevent future problems with these maintenance tips:</p>
            <ul>
                <li>Keep gutters clean and ensure proper drainage</li>
                <li>Maintain proper grading around foundation</li>
                <li>Extend downspouts at least 6 feet from foundation</li>
                <li>Seal foundation cracks promptly</li>
                <li>Install window well covers</li>
                <li>Test sump pump regularly</li>
                <li>Monitor for new cracks or signs of water</li>
                <li>Address plumbing issues immediately</li>
            </ul>
        </section>

        <section class="conclusion">
            <h2>Conclusion</h2>
            <p>The first step in solving a basement leak is identifying the source. While some causes are obvious, others require professional assessment. Understanding these common causes can help you communicate effectively with professionals and make informed decisions about repairs.</p>
            <p>If you're experiencing basement leaks, don't wait for the problem to worsen. Contact CrackBuster for a free professional inspection. Our experts will identify the source of your leak and recommend the most effective solution to keep your basement dry.</p>
        </section>`,
        featuredImage: '/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.png',
        metaTitle: 'Why Is My Basement Leaking? | CrackBuster Blog',
        metaDescription: 'Common causes of basement leaks and how to identify and fix water problems.',
        keywords: ['basement leak', 'waterproofing', 'basement repair'],
        published: true,
        publishedAt: new Date('2024-02-10')
    },
    {
        title: 'Polyurethane Injection of Vertical Foundation Cracks',
        excerpt: 'Learn about polyurethane injection, an effective method for repairing vertical foundation cracks.',
        content: `<div class="blog-intro">
            <p>Polyurethane injection is one of the most effective and efficient methods for repairing vertical foundation cracks. This advanced technique involves injecting specialized polyurethane material into cracks, where it expands to create a permanent, watertight seal. This comprehensive guide explains how polyurethane injection works, when to use it, and why it's an excellent choice for foundation crack repair.</p>
            <img src="/images/stock/Cement with Crack - Copy.png" alt="Polyurethane Injection Process" class="blog-featured-image" loading="lazy" />
        </div>

        <section class="what-is-polyurethane">
            <h2>What is Polyurethane Injection?</h2>
            <p>Polyurethane injection is a foundation repair technique that uses specialized polyurethane resins to seal cracks in concrete foundations. The material is injected into cracks under controlled pressure, where it expands and cures to create a flexible, watertight seal that becomes part of the foundation structure.</p>
            
            <div class="key-features">
                <h3>Key Characteristics of Polyurethane Injection:</h3>
                <ul>
                    <li><strong>Expansion:</strong> Material expands 20-30 times its original volume to fill entire crack</li>
                    <li><strong>Flexibility:</strong> Cured material remains flexible, accommodating minor foundation movement</li>
                    <li><strong>Watertight:</strong> Creates an impermeable barrier that prevents water infiltration</li>
                    <li><strong>Fast Curing:</strong> Cures in minutes to hours, allowing immediate water sealing</li>
                    <li><strong>Permanent:</strong> Becomes part of the concrete structure for long-lasting protection</li>
                </ul>
            </div>
        </section>

        <section class="how-it-works">
            <h2>How Polyurethane Injection Works</h2>
            <p>The polyurethane injection process is precise and methodical, ensuring complete crack filling and optimal results:</p>
            
            <div class="process-steps">
                <div class="process-step">
                    <h3>Step 1: Crack Assessment</h3>
                    <p>Our technicians first assess the crack to determine if polyurethane injection is appropriate:</p>
                    <ul>
                        <li>Measure crack width, length, and depth</li>
                        <li>Check for active water infiltration</li>
                        <li>Evaluate crack stability and movement</li>
                        <li>Determine injection port placement</li>
                    </ul>
                </div>
                
                <div class="process-step">
                    <h3>Step 2: Surface Preparation</h3>
                    <p>Proper preparation ensures optimal material adhesion and penetration:</p>
                    <ul>
                        <li>Clean crack surface to remove loose material and debris</li>
                        <li>Remove any existing sealants or coatings</li>
                        <li>Mark injection port locations at strategic intervals</li>
                        <li>Prepare work area for injection equipment</li>
                    </ul>
                </div>
                
                <div class="process-step">
                    <h3>Step 3: Injection Port Installation</h3>
                    <p>Injection ports are installed along the crack at carefully calculated intervals:</p>
                    <ul>
                        <li>Ports spaced based on crack width (typically 6-12 inches apart)</li>
                        <li>Sealed to prevent material leakage during injection</li>
                        <li>Positioned to ensure complete crack filling</li>
                        <li>Can be installed on vertical, horizontal, or overhead surfaces</li>
                    </ul>
                </div>
                
                <div class="process-step">
                    <h3>Step 4: Material Injection</h3>
                    <p>Using professional injection equipment, polyurethane material is injected:</p>
                    <ul>
                        <li>Start from the lowest port and work upward</li>
                        <li>Inject under controlled pressure</li>
                        <li>Material expands to fill entire crack volume</li>
                        <li>Continue until material appears at adjacent ports</li>
                        <li>Monitor injection to ensure complete filling</li>
                    </ul>
                    <img src="/images/stock/Cement with Crack - Copy.png" alt="Polyurethane Injection in Progress" class="blog-image" loading="lazy" />
                </div>
                
                <div class="process-step">
                    <h3>Step 5: Curing and Cleanup</h3>
                    <p>After injection, the material cures quickly:</p>
                    <ul>
                        <li>Polyurethane typically cures within minutes to hours</li>
                        <li>Injection ports are removed after curing</li>
                        <li>Port locations are ground flush with the surface</li>
                        <li>Final inspection verifies complete sealing</li>
                        <li>Work area is cleaned thoroughly</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="benefits">
            <h2>Benefits of Polyurethane Injection</h2>
            <p>Polyurethane injection offers numerous advantages over other crack repair methods:</p>
            
            <div class="benefits-grid">
                <div class="benefit-card">
                    <h3>✅ Permanent, Flexible Seal</h3>
                    <p>The cured polyurethane creates a permanent seal that remains flexible, allowing it to accommodate minor foundation movement without cracking or failing. This flexibility is crucial for foundations that may experience slight settling or movement.</p>
                </div>
                
                <div class="benefit-card">
                    <h3>✅ Works on Active Leaks</h3>
                    <p>Unlike some repair methods, polyurethane injection can be used on actively leaking cracks. The material expands and cures even in the presence of water, making it ideal for emergency leak situations.</p>
                </div>
                
                <div class="benefit-card">
                    <h3>✅ Fast Curing Time</h3>
                    <p>Polyurethane cures quickly—often within minutes to hours—allowing for immediate water sealing. This is especially valuable when dealing with active leaks that need immediate attention.</p>
                </div>
                
                <div class="benefit-card">
                    <h3>✅ Environmentally Friendly</h3>
                    <p>Modern polyurethane injection materials are environmentally friendly and safe once cured. They meet strict safety standards and don't release harmful chemicals into your home or the environment.</p>
                </div>
                
                <div class="benefit-card">
                    <h3>✅ Cost-Effective Solution</h3>
                    <p>Polyurethane injection is typically more cost-effective than major excavation and foundation repair. It provides excellent results at a fraction of the cost of more invasive repair methods.</p>
                </div>
                
                <div class="benefit-card">
                    <h3>✅ Non-Invasive Process</h3>
                    <p>The injection process requires no major excavation and can often be performed from inside your basement. This minimizes disruption to your property and daily routine.</p>
                </div>
            </div>
        </section>

        <section class="when-to-use">
            <h2>When to Use Polyurethane Injection</h2>
            <p>Polyurethane injection is ideal for specific types of foundation cracks and situations:</p>
            
            <div class="ideal-uses">
                <h3>Ideal Applications:</h3>
                <ul>
                    <li><strong>Vertical cracks:</strong> Most common application, especially effective for vertical foundation cracks</li>
                    <li><strong>Active water leaks:</strong> Can seal leaks even while water is present</li>
                    <li><strong>Below-grade foundations:</strong> Effective for cracks in basement walls and below-ground foundations</li>
                    <li><strong>Immediate sealing needs:</strong> Fast curing makes it ideal for urgent leak situations</li>
                    <li><strong>Flexible seal requirements:</strong> When cracks may experience minor movement</li>
                    <li><strong>Water infiltration prevention:</strong> Excellent for preventing water from entering through cracks</li>
                </ul>
                
                <h3>When Other Methods May Be Better:</h3>
                <ul>
                    <li><strong>Structural cracks requiring strength:</strong> Epoxy injection may be better for restoring structural integrity</li>
                    <li><strong>Severe structural damage:</strong> May require additional structural reinforcement</li>
                    <li><strong>Very wide cracks:</strong> May need assessment to determine if injection alone is sufficient</li>
                </ul>
            </div>
        </section>

        <section class="vs-epoxy">
            <h2>Polyurethane vs. Epoxy Injection</h2>
            <p>Understanding the difference between polyurethane and epoxy injection helps determine the best solution:</p>
            
            <div class="comparison-table">
                <table>
                    <thead>
                        <tr>
                            <th>Characteristic</th>
                            <th>Polyurethane</th>
                            <th>Epoxy</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Flexibility</strong></td>
                            <td>Flexible, accommodates movement</td>
                            <td>Rigid, structural bond</td>
                        </tr>
                        <tr>
                            <td><strong>Best For</strong></td>
                            <td>Water sealing, active leaks</td>
                            <td>Structural strength restoration</td>
                        </tr>
                        <tr>
                            <td><strong>Curing Time</strong></td>
                            <td>Minutes to hours</td>
                            <td>24-48 hours</td>
                        </tr>
                        <tr>
                            <td><strong>Water Presence</strong></td>
                            <td>Can work with water present</td>
                            <td>Requires dry conditions</td>
                        </tr>
                        <tr>
                            <td><strong>Strength</strong></td>
                            <td>Flexible seal</td>
                            <td>Restores structural strength</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="professional-installation">
            <h2>Why Professional Installation Matters</h2>
            <p>While DIY injection kits are available, professional installation ensures optimal results:</p>
            <ul>
                <li><strong>Proper Equipment:</strong> Professional-grade injection equipment ensures proper material placement and pressure control</li>
                <li><strong>Material Selection:</strong> Professionals select the right material type and formulation for your specific situation</li>
                <li><strong>Technique:</strong> Proper injection technique ensures complete crack filling and optimal material distribution</li>
                <li><strong>Assessment:</strong> Professional evaluation determines if injection is appropriate and identifies all cracks needing repair</li>
                <li><strong>Warranty:</strong> Professional installation typically includes warranties for peace of mind</li>
            </ul>
            <p>Our certified technicians use state-of-the-art injection equipment and premium materials to ensure proper application and maximum effectiveness. We stand behind our work with comprehensive warranties.</p>
        </section>

        <section class="conclusion">
            <h2>Conclusion</h2>
            <p>Polyurethane injection is an excellent solution for repairing vertical foundation cracks, especially when dealing with active leaks or water infiltration. Its flexibility, fast curing time, and effectiveness make it a preferred choice for many foundation crack repairs.</p>
            <p>If you have vertical foundation cracks that need repair, contact CrackBuster for a free assessment. Our injection specialists will evaluate your cracks and determine if polyurethane injection is the right solution for your situation. We'll provide a detailed estimate and explain the repair process so you know exactly what to expect.</p>
        </section>`,
        featuredImage: '/images/stock/Cement with Crack - Copy.png',
        metaTitle: 'Polyurethane Injection for Foundation Cracks | CrackBuster Blog',
        metaDescription: 'Learn about polyurethane injection, an effective method for repairing vertical foundation cracks.',
        keywords: ['polyurethane injection', 'crack injection', 'foundation repair'],
        published: true,
        publishedAt: new Date('2024-03-05')
    },
    {
        title: 'Epoxy Crack Injection',
        excerpt: 'Epoxy injection is a structural repair method that restores strength to cracked concrete foundations.',
        content: `<div class="blog-intro">
            <p>Epoxy crack injection is a structural repair method used to restore the strength and integrity of cracked concrete foundations. Unlike polyurethane injection, which creates a flexible seal, epoxy creates a rigid bond that actually restores structural strength to damaged concrete. This comprehensive guide explains when and why epoxy injection is the right choice for foundation crack repair.</p>
            <img src="/images/stock/Cement with Crack - Copy.png" alt="Epoxy Crack Injection" class="blog-featured-image" loading="lazy" />
        </div>

        <section class="what-is-epoxy">
            <h2>What is Epoxy Crack Injection?</h2>
            <p>Epoxy injection is a structural repair technique that uses specialized epoxy resins to restore strength to cracked concrete. The epoxy material is injected into cracks under pressure, where it flows throughout the crack and cures to form a strong, rigid bond that becomes part of the concrete structure.</p>
            
            <div class="key-features">
                <h3>Key Characteristics of Epoxy Injection:</h3>
                <ul>
                    <li><strong>Rigid Bond:</strong> Creates a structural bond that restores load-bearing capacity</li>
                    <li><strong>High Strength:</strong> Epoxy can be stronger than the original concrete</li>
                    <li><strong>Permanent:</strong> Becomes part of the concrete structure for lasting repair</li>
                    <li><strong>Prevents Propagation:</strong> Stops cracks from widening or extending</li>
                    <li><strong>Structural Restoration:</strong> Returns structural integrity to damaged concrete</li>
                </ul>
            </div>
        </section>

        <section class="how-it-works">
            <h2>How Epoxy Injection Works</h2>
            <p>The epoxy injection process is precise and requires professional expertise to ensure optimal structural restoration:</p>
            
            <div class="process-steps">
                <div class="process-step">
                    <h3>Step 1: Crack Assessment</h3>
                    <p>Thorough evaluation determines if epoxy injection is appropriate:</p>
                    <ul>
                        <li>Measure crack dimensions and assess structural significance</li>
                        <li>Evaluate load-bearing requirements</li>
                        <li>Check for active movement (epoxy requires stable cracks)</li>
                        <li>Ensure crack is dry (epoxy requires dry conditions)</li>
                        <li>Determine injection port placement</li>
                    </ul>
                </div>
                
                <div class="process-step">
                    <h3>Step 2: Surface Preparation</h3>
                    <p>Critical preparation ensures proper epoxy adhesion:</p>
                    <ul>
                        <li>Thoroughly clean crack to remove all loose material and debris</li>
                        <li>Remove any existing sealants, coatings, or contaminants</li>
                        <li>Ensure crack is completely dry (moisture prevents proper bonding)</li>
                        <li>Mark injection port locations at calculated intervals</li>
                        <li>Seal crack surface to contain injected material</li>
                    </ul>
                </div>
                
                <div class="process-step">
                    <h3>Step 3: Injection Port Installation</h3>
                    <p>Ports are strategically placed for optimal material distribution:</p>
                    <ul>
                        <li>Ports spaced based on crack width and depth</li>
                        <li>Sealed to prevent epoxy leakage during injection</li>
                        <li>Positioned to ensure complete crack filling</li>
                        <li>Can be installed on various surfaces and orientations</li>
                    </ul>
                </div>
                
                <div class="process-step">
                    <h3>Step 4: Epoxy Injection</h3>
                    <p>Professional injection ensures complete crack filling:</p>
                    <ul>
                        <li>Epoxy resin is mixed according to manufacturer specifications</li>
                        <li>Injected under controlled pressure using professional equipment</li>
                        <li>Start from lowest port and work upward</li>
                        <li>Epoxy flows throughout crack, filling all voids</li>
                        <li>Continue until epoxy appears at adjacent ports</li>
                        <li>Monitor injection to ensure complete filling</li>
                    </ul>
                    <img src="/images/stock/Cement with Crack - Copy.png" alt="Epoxy Injection Process" class="blog-image" loading="lazy" />
                </div>
                
                <div class="process-step">
                    <h3>Step 5: Curing and Finishing</h3>
                    <p>Proper curing ensures maximum strength:</p>
                    <ul>
                        <li>Epoxy cures over 24-48 hours to full strength</li>
                        <li>Temperature and humidity controlled during curing</li>
                        <li>Injection ports removed after curing</li>
                        <li>Port locations ground flush with surface</li>
                        <li>Final inspection verifies structural restoration</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="benefits">
            <h2>Benefits of Epoxy Injection</h2>
            <p>Epoxy injection offers unique advantages for structural crack repair:</p>
            
            <div class="benefits-grid">
                <div class="benefit-card">
                    <h3>✅ Restores Structural Strength</h3>
                    <p>Epoxy creates a rigid bond that actually restores the load-bearing capacity of cracked concrete. In many cases, the repaired area can be stronger than the original concrete.</p>
                </div>
                
                <div class="benefit-card">
                    <h3>✅ Permanent Structural Bond</h3>
                    <p>The epoxy becomes part of the concrete structure, creating a permanent repair that lasts for decades. It doesn't deteriorate or lose strength over time.</p>
                </div>
                
                <div class="benefit-card">
                    <h3>✅ Prevents Crack Propagation</h3>
                    <p>By restoring structural integrity, epoxy prevents cracks from widening or extending. This stops further deterioration and maintains foundation stability.</p>
                </div>
                
                <div class="benefit-card">
                    <h3>✅ Suitable for Structural Cracks</h3>
                    <p>Epoxy is specifically designed for structural cracks that affect load-bearing capacity. It's the preferred method when structural restoration is required.</p>
                </div>
                
                <div class="benefit-card">
                    <h3>✅ Long-Lasting Solution</h3>
                    <p>When properly installed, epoxy repairs last for the life of the structure. The material doesn't degrade and maintains its strength indefinitely.</p>
                </div>
                
                <div class="benefit-card">
                    <h3>✅ High Strength Material</h3>
                    <p>Epoxy resins have exceptional compressive and tensile strength, making them ideal for restoring structural integrity to damaged concrete.</p>
                </div>
            </div>
        </section>

        <section class="when-to-use">
            <h2>When to Use Epoxy Injection</h2>
            <p>Epoxy injection is specifically recommended for certain types of cracks and situations:</p>
            
            <div class="ideal-uses">
                <h3>Ideal Applications:</h3>
                <ul>
                    <li><strong>Structural cracks:</strong> Cracks that affect the load-bearing capacity of concrete</li>
                    <li><strong>Load-bearing elements:</strong> Cracks in beams, columns, or other critical structural components</li>
                    <li><strong>Stable cracks:</strong> Cracks that are not actively moving (epoxy requires stable conditions)</li>
                    <li><strong>Dry cracks:</strong> Cracks that are not actively leaking (epoxy requires dry conditions)</li>
                    <li><strong>Strength restoration:</strong> When structural strength needs to be restored, not just sealed</li>
                    <li><strong>Prevent propagation:</strong> To stop cracks from widening or extending further</li>
                </ul>
                
                <h3>When Polyurethane May Be Better:</h3>
                <ul>
                    <li><strong>Active leaks:</strong> Polyurethane works better for actively leaking cracks</li>
                    <li><strong>Flexible seal needed:</strong> When cracks may experience movement</li>
                    <li><strong>Water presence:</strong> Polyurethane can work in wet conditions</li>
                    <li><strong>Non-structural cracks:</strong> For cosmetic or water-sealing purposes only</li>
                </ul>
            </div>
        </section>

        <section class="vs-polyurethane">
            <h2>Epoxy vs. Polyurethane: Choosing the Right Method</h2>
            <p>Understanding when to use epoxy versus polyurethane is crucial for effective repairs:</p>
            
            <div class="comparison-table">
                <table>
                    <thead>
                        <tr>
                            <th>Factor</th>
                            <th>Epoxy Injection</th>
                            <th>Polyurethane Injection</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Primary Purpose</strong></td>
                            <td>Structural strength restoration</td>
                            <td>Water sealing</td>
                        </tr>
                        <tr>
                            <td><strong>Bond Type</strong></td>
                            <td>Rigid, structural</td>
                            <td>Flexible, watertight</td>
                        </tr>
                        <tr>
                            <td><strong>Best For</strong></td>
                            <td>Structural cracks, load-bearing elements</td>
                            <td>Active leaks, water infiltration</td>
                        </tr>
                        <tr>
                            <td><strong>Curing Time</strong></td>
                            <td>24-48 hours</td>
                            <td>Minutes to hours</td>
                        </tr>
                        <tr>
                            <td><strong>Water Presence</strong></td>
                            <td>Requires dry conditions</td>
                            <td>Can work with water present</td>
                        </tr>
                        <tr>
                            <td><strong>Movement</strong></td>
                            <td>Requires stable cracks</td>
                            <td>Accommodates minor movement</td>
                        </tr>
                        <tr>
                            <td><strong>Strength</strong></td>
                            <td>Restores structural strength</td>
                            <td>Creates flexible seal</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="professional-installation">
            <h2>Why Professional Installation is Essential</h2>
            <p>Epoxy injection requires professional expertise for optimal results:</p>
            <ul>
                <li><strong>Proper Material Selection:</strong> Professionals select the right epoxy formulation for your specific situation</li>
                <li><strong>Precise Mixing:</strong> Epoxy must be mixed in exact ratios for optimal strength</li>
                <li><strong>Correct Technique:</strong> Proper injection technique ensures complete crack filling and optimal strength</li>
                <li><strong>Quality Equipment:</strong> Professional-grade equipment ensures proper pressure and material distribution</li>
                <li><strong>Surface Preparation:</strong> Critical preparation steps require professional knowledge</li>
                <li><strong>Warranty:</strong> Professional installation includes warranties for peace of mind</li>
            </ul>
            <p>Our team uses high-quality epoxy materials and precise injection techniques to ensure optimal structural restoration. We stand behind our work with comprehensive warranties.</p>
        </section>

        <section class="conclusion">
            <h2>Conclusion</h2>
            <p>Epoxy crack injection is the preferred method for restoring structural strength to cracked concrete foundations. When you have structural cracks that affect load-bearing capacity, epoxy injection provides a permanent solution that restores integrity and prevents further deterioration.</p>
            <p>If you have foundation cracks that may be structural in nature, contact CrackBuster for a professional assessment. Our experts will evaluate your cracks and determine if epoxy injection is the right solution. We'll provide a detailed estimate and explain the repair process to ensure you understand how we'll restore your foundation's structural integrity.</p>
        </section>`,
        featuredImage: '/images/stock/Cement with Crack - Copy.png',
        metaTitle: 'Epoxy Crack Injection Services | CrackBuster Blog',
        metaDescription: 'Learn about epoxy crack injection, a structural repair method for concrete foundations.',
        keywords: ['epoxy injection', 'structural repair', 'concrete repair'],
        published: true,
        publishedAt: new Date('2024-03-20')
    },
    {
        title: 'Cost-Effective Foundation Maintenance',
        excerpt: 'Tips for maintaining your foundation and preventing expensive repairs through regular maintenance.',
        content: `<div class="blog-intro">
            <p>Regular foundation maintenance can save you significant money on repairs. Many homeowners wait until problems become serious before addressing foundation issues, but proactive maintenance is far more cost-effective. This comprehensive guide provides practical, cost-effective strategies for maintaining your foundation and preventing expensive repairs.</p>
            <img src="/images/stock/Identifying-Different-Types-of-Foundation-Cracks - Copy.jpg" alt="Foundation Maintenance" class="blog-featured-image" loading="lazy" />
        </div>

        <section class="maintenance-overview">
            <h2>Why Foundation Maintenance Matters</h2>
            <p>Your foundation is the most critical structural component of your home. Regular maintenance helps you:</p>
            <ul>
                <li><strong>Prevent costly repairs:</strong> Early detection and minor repairs cost far less than major foundation work</li>
                <li><strong>Protect your investment:</strong> Your home is likely your largest investment—protect it with proper maintenance</li>
                <li><strong>Avoid emergency situations:</strong> Regular maintenance prevents unexpected problems during storms or extreme weather</li>
                <li><strong>Maintain property value:</strong> Well-maintained foundations maintain or increase home value</li>
                <li><strong>Ensure family safety:</strong> Structural integrity is essential for your family's safety</li>
            </ul>
        </section>

        <section class="monitoring-cracks">
            <h2>1. Regular Crack Monitoring</h2>
            <p>Regularly inspecting your foundation for new cracks or changes in existing ones is one of the most important maintenance tasks. Early detection allows for less expensive repairs and prevents minor issues from becoming major problems.</p>
            
            <div class="monitoring-guide">
                <h3>How to Monitor Foundation Cracks:</h3>
                <ul>
                    <li><strong>Visual inspections:</strong> Walk around your foundation every 3-6 months, looking for new cracks or changes</li>
                    <li><strong>Document changes:</strong> Take photos and measurements of existing cracks to track any changes</li>
                    <li><strong>Mark crack ends:</strong> Use a pencil to mark the ends of cracks, making it easy to see if they're widening</li>
                    <li><strong>Measure crack width:</strong> Use a ruler or crack gauge to measure width and track changes over time</li>
                    <li><strong>Check after weather events:</strong> Inspect after heavy rains, freezes, or other extreme weather</li>
                </ul>
                
                <h3>What to Look For:</h3>
                <ul>
                    <li>New cracks appearing</li>
                    <li>Existing cracks widening or lengthening</li>
                    <li>Horizontal cracks (serious concern)</li>
                    <li>Cracks wider than 1/8 inch</li>
                    <li>Multiple cracks in the same area</li>
                    <li>Cracks allowing water infiltration</li>
                </ul>
                
                <p><strong>Cost Savings:</strong> Monitoring cracks yourself costs nothing but time. Early detection can save significant money compared to waiting until problems become severe.</p>
            </div>
        </section>

        <section class="drainage-maintenance">
            <h2>2. Maintain Proper Drainage</h2>
            <p>Proper drainage is essential for protecting your foundation from water damage. Poor drainage is one of the leading causes of foundation problems, but maintaining good drainage is relatively simple and cost-effective.</p>
            
            <div class="drainage-tasks">
                <h3>Gutter Maintenance:</h3>
                <ul>
                    <li><strong>Clean gutters regularly:</strong> Remove leaves, debris, and blockages at least twice per year (spring and fall)</li>
                    <li><strong>Check for damage:</strong> Repair loose or damaged gutters promptly</li>
                    <li><strong>Ensure proper flow:</strong> Make sure water flows freely through gutters and downspouts</li>
                    <li><strong>Install gutter guards:</strong> Consider installing guards to reduce maintenance needs</li>
                </ul>
                
                <h3>Downspout Management:</h3>
                <ul>
                    <li><strong>Extend downspouts:</strong> Ensure downspouts extend at least 6 feet from your foundation</li>
                    <li><strong>Direct water away:</strong> Use extensions or splash blocks to direct water away from foundation</li>
                    <li><strong>Check for blockages:</strong> Ensure downspouts aren't clogged or damaged</li>
                    <li><strong>Consider underground drainage:</strong> For persistent problems, consider underground downspout extensions</li>
                </ul>
                
                <h3>Grading Maintenance:</h3>
                <ul>
                    <li><strong>Check soil slope:</strong> Ensure soil slopes away from foundation (minimum 6 inches in first 10 feet)</li>
                    <li><strong>Fill low spots:</strong> Add soil to areas where water pools near foundation</li>
                    <li><strong>Maintain landscaping:</strong> Ensure plants and features don't trap water near foundation</li>
                    <li><strong>Regrade as needed:</strong> Address grading issues before they cause foundation problems</li>
                </ul>
                
                <p><strong>Cost:</strong> Basic drainage maintenance costs little—mostly your time. Professional grading or drainage improvements are an investment that prevents much more expensive foundation repairs. Contact us for a free estimate on drainage improvements.</p>
            </div>
        </section>

        <section class="moisture-control">
            <h2>3. Control Soil Moisture</h2>
            <p>Maintaining consistent soil moisture around your foundation is crucial. Too much or too little moisture can cause foundation problems, but proper moisture control is achievable with regular attention.</p>
            
            <div class="moisture-strategies">
                <h3>Preventing Excess Moisture:</h3>
                <ul>
                    <li><strong>Maintain proper drainage:</strong> Good drainage prevents water from accumulating around foundation</li>
                    <li><strong>Fix leaks promptly:</strong> Repair leaking pipes, hoses, or irrigation systems immediately</li>
                    <li><strong>Use soaker hoses wisely:</strong> If using soaker hoses, place them at least 18 inches from foundation</li>
                    <li><strong>Monitor during wet seasons:</strong> Pay extra attention during rainy seasons or snowmelt periods</li>
                </ul>
                
                <h3>Preventing Insufficient Moisture:</h3>
                <ul>
                    <li><strong>Water during dry periods:</strong> In extremely dry conditions, maintain consistent soil moisture</li>
                    <li><strong>Use soaker hoses:</strong> Soaker hoses placed 18-24 inches from foundation can help maintain moisture</li>
                    <li><strong>Mulch appropriately:</strong> Proper mulching helps retain soil moisture</li>
                    <li><strong>Monitor during droughts:</strong> Pay attention during extended dry periods</li>
                </ul>
                
                <h3>Edmonton-Specific Considerations:</h3>
                <ul>
                    <li><strong>Freeze-thaw cycles:</strong> Alberta's climate creates freeze-thaw cycles that can affect foundations</li>
                    <li><strong>Spring snowmelt:</strong> Manage water from spring snowmelt to prevent foundation problems</li>
                    <li><strong>Winter preparation:</strong> Ensure proper drainage before winter to prevent ice buildup</li>
                </ul>
            </div>
        </section>

        <section class="prompt-repairs">
            <h2>4. Address Issues Promptly</h2>
            <p>Don't ignore small cracks or minor water issues. They can quickly become major problems that cost significantly more to repair. Prompt attention to foundation issues is one of the most cost-effective maintenance strategies.</p>
            
            <div class="prompt-action-guide">
                <h3>Issues That Need Immediate Attention:</h3>
                <ul>
                    <li><strong>Horizontal cracks:</strong> These indicate serious structural issues—call a professional immediately</li>
                    <li><strong>Widening cracks:</strong> Cracks that are getting larger need professional assessment</li>
                    <li><strong>Active water leaks:</strong> Water entering through cracks should be addressed promptly</li>
                    <li><strong>Multiple new cracks:</strong> Several new cracks appearing quickly may indicate foundation movement</li>
                    <li><strong>Cracks wider than 1/4 inch:</strong> These require professional evaluation</li>
                </ul>
                
                <h3>Cost Comparison:</h3>
                <div class="cost-comparison">
                    <div class="cost-item">
                        <h4>Prompt Repair (Small Crack)</h4>
                        <ul>
                            <li>Affordable crack injection repair</li>
                            <li>Prevents water damage</li>
                            <li>Stops further deterioration</li>
                            <li>Minimal disruption</li>
                        </ul>
                    </div>
                    <div class="cost-item">
                        <h4>Delayed Repair (Major Problem)</h4>
                        <ul>
                            <li>Expensive water damage restoration</li>
                            <li>Costly mold remediation</li>
                            <li>Major foundation repairs</li>
                            <li>Replacement of damaged belongings</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section class="professional-inspections">
            <h2>5. Professional Inspections</h2>
            <p>While regular DIY inspections are important, annual professional inspections can catch issues early and prevent expensive repairs. Professional inspectors have the expertise and tools to identify problems you might miss.</p>
            
            <div class="inspection-benefits">
                <h3>What Professional Inspections Include:</h3>
                <ul>
                    <li><strong>Comprehensive assessment:</strong> Thorough evaluation of all foundation elements</li>
                    <li><strong>Expert identification:</strong> Professionals can identify subtle signs of problems</li>
                    <li><strong>Detailed reporting:</strong> Written reports documenting foundation condition</li>
                    <li><strong>Recommendations:</strong> Expert recommendations for maintenance and repairs</li>
                    <li><strong>Early detection:</strong> Catching problems before they become serious</li>
                </ul>
                
                <h3>When to Schedule Inspections:</h3>
                <ul>
                    <li><strong>Annually:</strong> Regular annual inspections for preventive maintenance</li>
                    <li><strong>After extreme weather:</strong> After heavy rains, freezes, or other extreme events</li>
                    <li><strong>Before buying/selling:</strong> When purchasing or selling a home</li>
                    <li><strong>When concerns arise:</strong> If you notice any concerning signs</li>
                </ul>
                
                <h3>Cost vs. Benefit:</h3>
                <p>Professional inspections are an affordable investment that can identify problems early, preventing expensive repairs if left unaddressed. The peace of mind alone is often worth the investment. Contact us for a free consultation about inspection services.</p>
            </div>
        </section>

        <section class="maintenance-checklist">
            <h2>Foundation Maintenance Checklist</h2>
            <p>Use this checklist to stay on top of foundation maintenance:</p>
            
            <div class="checklist-items">
                <h3>Monthly:</h3>
                <ul>
                    <li>Walk around foundation, looking for new cracks or changes</li>
                    <li>Check for water pooling near foundation</li>
                    <li>Inspect gutters for blockages or damage</li>
                </ul>
                
                <h3>Quarterly (Every 3 Months):</h3>
                <ul>
                    <li>Thorough visual inspection of all foundation walls</li>
                    <li>Measure and document existing cracks</li>
                    <li>Check downspouts and extensions</li>
                    <li>Inspect grading around foundation</li>
                </ul>
                
                <h3>Twice Per Year (Spring & Fall):</h3>
                <ul>
                    <li>Clean gutters thoroughly</li>
                    <li>Check and repair any drainage issues</li>
                    <li>Assess overall foundation condition</li>
                    <li>Address any minor issues before winter/summer</li>
                </ul>
                
                <h3>Annually:</h3>
                <ul>
                    <li>Professional foundation inspection</li>
                    <li>Comprehensive assessment of all foundation elements</li>
                    <li>Review and update maintenance plan</li>
                </ul>
            </div>
        </section>

        <section class="cost-effectiveness">
            <h2>The Cost-Effectiveness of Maintenance</h2>
            <p>Investing in regular foundation maintenance is one of the most cost-effective home maintenance strategies. Here's why:</p>
            
            <div class="cost-analysis">
                <h3>Annual Maintenance Investment:</h3>
                <ul>
                    <li>DIY inspections: Free (your time)</li>
                    <li>Gutter cleaning: Affordable service or DIY</li>
                    <li>Minor repairs: Varies based on needs</li>
                    <li>Professional inspection: Affordable preventive investment</li>
                    <li><strong>Total: Minimal annual investment</strong></li>
                </ul>
                
                <h3>Cost of Neglect:</h3>
                <ul>
                    <li>Expensive water damage restoration</li>
                    <li>Costly mold remediation</li>
                    <li>Major foundation repairs</li>
                    <li>Extensive structural repairs</li>
                    <li>Significant property value loss</li>
                </ul>
                
                <p><strong>The comparison is clear:</strong> Regular maintenance costs a fraction of what major repairs cost. Investing in maintenance prevents problems and saves money long-term.</p>
            </div>
        </section>

        <section class="conclusion">
            <h2>Conclusion</h2>
            <p>Regular foundation maintenance is one of the most cost-effective ways to protect your home. By monitoring cracks, maintaining proper drainage, controlling soil moisture, addressing issues promptly, and scheduling professional inspections, you can prevent expensive repairs and protect your investment.</p>
            <p>Don't wait until problems become serious. Start implementing these maintenance strategies today. If you need help with foundation maintenance or have concerns about your foundation, contact CrackBuster for a professional assessment. Our experts can help you develop a maintenance plan tailored to your home's specific needs.</p>
        </section>`,
        featuredImage: '/images/stock/Identifying-Different-Types-of-Foundation-Cracks - Copy.jpg',
        metaTitle: 'Cost-Effective Foundation Maintenance Tips | CrackBuster Blog',
        metaDescription: 'Learn how to maintain your foundation and prevent expensive repairs through regular maintenance.',
        keywords: ['foundation maintenance', 'preventive maintenance', 'foundation care'],
        published: true,
        publishedAt: new Date('2024-04-10')
    },
    {
        title: 'Can Crack Injections Be Used on All Cracks?',
        excerpt: 'Understanding which types of foundation cracks can be effectively repaired using injection methods.',
        content: `<div class="blog-intro">
            <p>Crack injection is a versatile and effective repair method, but it's not suitable for every type of foundation crack. Understanding when injection is appropriate and when other methods may be better can help you make informed decisions about foundation repair. This comprehensive guide explains which cracks can be repaired with injection and which require different approaches.</p>
            <img src="/images/stock/Cement with Crack - Copy.png" alt="Crack Injection Assessment" class="blog-featured-image" loading="lazy" />
        </div>

        <section class="injection-overview">
            <h2>Understanding Crack Injection</h2>
            <p>Crack injection involves injecting specialized materials (polyurethane or epoxy) into foundation cracks to seal them and restore integrity. This method is highly effective for many types of cracks, but professional assessment is essential to determine if injection is the right solution for your specific situation.</p>
        </section>

        <section class="suitable-cracks">
            <h2>Cracks Suitable for Injection</h2>
            <p>Injection is an excellent solution for many types of foundation cracks. Here are the types of cracks that are typically well-suited for injection repair:</p>
            
            <div class="crack-types-suitable">
                <article class="crack-type">
                    <h3>✅ Vertical Cracks</h3>
                    <p>Vertical cracks are the most common type of foundation crack and are typically ideal candidates for injection:</p>
                    <ul>
                        <li>Most vertical cracks respond well to injection</li>
                        <li>Can be sealed with polyurethane or epoxy</li>
                        <li>Effective for both active leaks and preventive sealing</li>
                        <li>Works on cracks of various widths (hairline to moderate)</li>
                    </ul>
                </article>
                
                <article class="crack-type">
                    <h3>✅ Diagonal Cracks</h3>
                    <p>Diagonal cracks, often caused by settlement, are generally suitable for injection:</p>
                    <ul>
                        <li>Can be effectively sealed with injection</li>
                        <li>May require assessment to determine if underlying settlement needs addressing</li>
                        <li>Works well for cracks caused by normal settling</li>
                    </ul>
                </article>
                
                <article class="crack-type">
                    <h3>✅ Hairline to Moderate Width Cracks</h3>
                    <p>Injection is particularly effective for cracks in this size range:</p>
                    <ul>
                        <li>Hairline cracks (less than 1/16 inch)</li>
                        <li>Small cracks (1/16 to 1/8 inch)</li>
                        <li>Moderate cracks (1/8 to 1/4 inch)</li>
                        <li>Material can penetrate and fill these cracks effectively</li>
                    </ul>
                </article>
                
                <article class="crack-type">
                    <h3>✅ Active Leaks</h3>
                    <p>Polyurethane injection is specifically designed to work on actively leaking cracks:</p>
                    <ul>
                        <li>Can seal leaks even while water is present</li>
                        <li>Material expands and cures in wet conditions</li>
                        <li>Ideal for emergency leak situations</li>
                        <li>Provides immediate water sealing</li>
                    </ul>
                </article>
                
                <article class="crack-type">
                    <h3>✅ Non-Structural Cracks</h3>
                    <p>Cracks that don't affect structural integrity are excellent candidates:</p>
                    <ul>
                        <li>Cosmetic cracks</li>
                        <li>Water-sealing applications</li>
                        <li>Cracks that don't affect load-bearing capacity</li>
                        <li>Preventive sealing of minor cracks</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="not-suitable-cracks">
            <h2>Cracks Not Suitable for Injection Alone</h2>
            <p>While injection is versatile, some cracks require different approaches or combined repair methods. Here are situations where injection alone may not be sufficient:</p>
            
            <div class="crack-types-not-suitable">
                <article class="crack-type">
                    <h3>❌ Severe Structural Damage</h3>
                    <p>Cracks indicating severe structural problems may require more than injection:</p>
                    <ul>
                        <li>May need structural reinforcement in addition to sealing</li>
                        <li>Requires professional structural assessment</li>
                        <li>May need foundation stabilization or underpinning</li>
                        <li>Injection may be part of a larger repair plan</li>
                    </ul>
                </article>
                
                <article class="crack-type">
                    <h3>❌ Very Wide Cracks</h3>
                    <p>Cracks wider than 1/4 inch need professional assessment:</p>
                    <ul>
                        <li>May indicate significant structural issues</li>
                        <li>Requires evaluation before determining repair method</li>
                        <li>May need structural repair in addition to sealing</li>
                        <li>Assessment determines if injection is appropriate</li>
                    </ul>
                </article>
                
                <article class="crack-type">
                    <h3>❌ Foundation Failure Cracks</h3>
                    <p>Cracks caused by foundation failure need comprehensive solutions:</p>
                    <ul>
                        <li>Indicate serious underlying problems</li>
                        <li>Require addressing root causes, not just symptoms</li>
                        <li>May need foundation stabilization</li>
                        <li>Injection alone won't solve the underlying problem</li>
                    </ul>
                </article>
                
                <article class="crack-type">
                    <h3>❌ Severely Deteriorated Concrete</h3>
                    <p>Cracks in severely deteriorated concrete may need different approaches:</p>
                    <ul>
                        <li>Concrete may be too weak to hold injection material</li>
                        <li>May require concrete repair or replacement</li>
                        <li>Needs professional assessment of concrete condition</li>
                        <li>May need structural reinforcement</li>
                    </ul>
                </article>
                
                <article class="crack-type">
                    <h3>❌ Horizontal Cracks (Structural Assessment Required)</h3>
                    <p>Horizontal cracks often indicate serious structural issues:</p>
                    <ul>
                        <li>May require structural reinforcement, not just sealing</li>
                        <li>Indicates foundation walls under excessive pressure</li>
                        <li>Needs professional structural assessment</li>
                        <li>Injection may be part of a larger structural repair</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="assessment-process">
            <h2>Professional Assessment Process</h2>
            <p>Our technicians use a systematic approach to determine if injection is appropriate for your cracks:</p>
            
            <div class="assessment-steps">
                <div class="step">
                    <h3>Step 1: Visual Inspection</h3>
                    <ul>
                        <li>Examine crack width, length, and pattern</li>
                        <li>Assess crack location and orientation</li>
                        <li>Check for signs of active movement</li>
                        <li>Look for water infiltration</li>
                    </ul>
                </div>
                
                <div class="step">
                    <h3>Step 2: Structural Evaluation</h3>
                    <ul>
                        <li>Determine if crack affects structural integrity</li>
                        <li>Assess foundation condition</li>
                        <li>Evaluate load-bearing requirements</li>
                        <li>Check for signs of foundation movement</li>
                    </ul>
                </div>
                
                <div class="step">
                    <h3>Step 3: Material Selection</h3>
                    <ul>
                        <li>Choose between polyurethane and epoxy</li>
                        <li>Consider crack characteristics</li>
                        <li>Evaluate water presence</li>
                        <li>Determine if structural restoration is needed</li>
                    </ul>
                </div>
                
                <div class="step">
                    <h3>Step 4: Repair Plan</h3>
                    <ul>
                        <li>Determine if injection alone is sufficient</li>
                        <li>Identify if additional repairs are needed</li>
                        <li>Develop comprehensive repair strategy</li>
                        <li>Provide detailed estimate and explanation</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="combined-approaches">
            <h2>Combined Repair Approaches</h2>
            <p>In some cases, injection is combined with other repair techniques for optimal results:</p>
            
            <div class="combined-methods">
                <article class="method">
                    <h3>Injection + Structural Reinforcement</h3>
                    <p>For structural cracks, injection may be combined with:</p>
                    <ul>
                        <li>Carbon fiber reinforcement</li>
                        <li>Steel beam installation</li>
                        <li>Wall anchors or braces</li>
                        <li>Foundation stabilization</li>
                    </ul>
                </article>
                
                <article class="method">
                    <h3>Injection + Drainage Improvements</h3>
                    <p>For water-related cracks, injection is often combined with:</p>
                    <ul>
                        <li>Interior drainage systems</li>
                        <li>Sump pump installation</li>
                        <li>Exterior drainage improvements</li>
                        <li>Grading corrections</li>
                    </ul>
                </article>
                
                <article class="method">
                    <h3>Injection + Foundation Stabilization</h3>
                    <p>For settlement-related cracks, injection may be part of:</p>
                    <ul>
                        <li>Foundation underpinning</li>
                        <li>Soil stabilization</li>
                        <li>Settlement correction</li>
                        <li>Comprehensive foundation repair</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="when-to-choose-injection">
            <h2>When to Choose Injection</h2>
            <p>Injection is often the best choice when:</p>
            <ul>
                <li>You have vertical or diagonal cracks that need sealing</li>
                <li>You're dealing with active water leaks</li>
                <li>Cracks are non-structural or minor structural</li>
                <li>You want a non-invasive repair method</li>
                <li>You need fast, effective water sealing</li>
                <li>Cost-effectiveness is a priority</li>
                <li>You want minimal disruption to your property</li>
            </ul>
        </section>

        <section class="conclusion">
            <h2>Conclusion</h2>
            <p>Crack injection is a versatile and effective repair method suitable for many types of foundation cracks, including vertical cracks, diagonal cracks, hairline to moderate width cracks, active leaks, and non-structural cracks. However, it's not appropriate for all situations. Severe structural damage, very wide cracks, foundation failure cracks, and severely deteriorated concrete may require different approaches or combined repair methods.</p>
            <p>The key is professional assessment. Our technicians will evaluate your specific situation and recommend the best repair method. In many cases, injection is the ideal solution. In others, injection may be combined with additional repairs, or different methods may be recommended. Contact CrackBuster for a free professional assessment of your foundation cracks. We'll determine if injection is right for your situation and provide a detailed explanation of the recommended repair approach.</p>
        </section>`,
        featuredImage: '/images/stock/Cement with Crack - Copy.png',
        metaTitle: 'Can Crack Injections Be Used on All Cracks? | CrackBuster Blog',
        metaDescription: 'Learn which types of foundation cracks can be repaired using injection methods and when other approaches may be needed.',
        keywords: ['crack injection', 'foundation repair', 'crack assessment'],
        published: true,
        publishedAt: new Date('2024-05-01')
    },
    {
        title: 'Shrinkage Cracks in Concrete Foundations',
        excerpt: 'Understanding shrinkage cracks, why they occur, and when they need professional attention.',
        content: `<div class="blog-intro">
            <p>Shrinkage cracks are among the most common types of foundation cracks. They occur as concrete cures and loses moisture, causing it to contract slightly. While most shrinkage cracks are cosmetic and not a structural concern, understanding them helps homeowners make informed decisions about when to repair them. This comprehensive guide explains shrinkage cracks, why they occur, and when they need professional attention.</p>
            <img src="/images/stock/Identifying-Different-Types-of-Foundation-Cracks - Copy.jpg" alt="Shrinkage Cracks in Foundation" class="blog-featured-image" loading="lazy" />
        </div>

        <section class="what-are-shrinkage-cracks">
            <h2>What Are Shrinkage Cracks?</h2>
            <p>Shrinkage cracks occur during the concrete curing process. As concrete hardens, it loses moisture through evaporation and hydration. This moisture loss causes the concrete to shrink slightly, and when the tensile stress from shrinkage exceeds the concrete's tensile strength, cracks form.</p>
            
            <div class="crack-formation">
                <h3>How Shrinkage Cracks Form:</h3>
                <ul>
                    <li><strong>Moisture loss:</strong> Concrete loses water as it cures</li>
                    <li><strong>Volume reduction:</strong> Loss of moisture causes concrete to shrink</li>
                    <li><strong>Tensile stress:</strong> Shrinkage creates internal tensile stress</li>
                    <li><strong>Crack formation:</strong> When stress exceeds strength, cracks appear</li>
                    <li><strong>Natural process:</strong> This is a normal part of concrete curing</li>
                </ul>
            </div>
        </section>

        <section class="characteristics">
            <h2>Characteristics of Shrinkage Cracks</h2>
            <p>Shrinkage cracks have distinctive characteristics that help identify them:</p>
            
            <div class="characteristics-list">
                <article class="characteristic">
                    <h3>Orientation</h3>
                    <p>Shrinkage cracks are typically:</p>
                    <ul>
                        <li>Vertical or diagonal in orientation</li>
                        <li>Rarely horizontal (horizontal cracks usually indicate other problems)</li>
                        <li>Often appear in a pattern or network</li>
                    </ul>
                </article>
                
                <article class="characteristic">
                    <h3>Size</h3>
                    <p>Shrinkage cracks are typically:</p>
                    <ul>
                        <li>Hairline to 1/8 inch wide</li>
                        <li>Usually narrow and consistent in width</li>
                        <li>May be several feet long</li>
                    </ul>
                </article>
                
                <article class="characteristic">
                    <h3>Timing</h3>
                    <p>Shrinkage cracks typically:</p>
                    <ul>
                        <li>Appear within the first year after construction</li>
                        <li>Often appear within the first few months</li>
                        <li>Usually stabilize after initial formation</li>
                    </ul>
                </article>
                
                <article class="characteristic">
                    <h3>Structural Impact</h3>
                    <p>Most shrinkage cracks:</p>
                    <ul>
                        <li>Are not structural concerns</li>
                        <li>Don't affect load-bearing capacity</li>
                        <li>Are primarily cosmetic</li>
                        <li>Don't indicate foundation failure</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="when-to-worry">
            <h2>When to Worry About Shrinkage Cracks</h2>
            <p>While most shrinkage cracks are harmless, certain characteristics indicate they need attention:</p>
            
            <div class="warning-signs">
                <article class="warning-sign">
                    <h3>⚠️ Cracks Wider Than 1/4 Inch</h3>
                    <p>Shrinkage cracks wider than 1/4 inch may indicate:</p>
                    <ul>
                        <li>More serious underlying issues</li>
                        <li>Problems beyond normal shrinkage</li>
                        <li>Need for professional assessment</li>
                    </ul>
                </article>
                
                <article class="warning-sign">
                    <h3>⚠️ Cracks That Are Widening</h3>
                    <p>If shrinkage cracks are widening over time, this suggests:</p>
                    <ul>
                        <li>Active foundation movement</li>
                        <li>Ongoing stress on foundation</li>
                        <li>Need for professional evaluation</li>
                    </ul>
                </article>
                
                <article class="warning-sign">
                    <h3>⚠️ Cracks Accompanied by Other Issues</h3>
                    <p>If shrinkage cracks appear with other signs, they may indicate:</p>
                    <ul>
                        <li>Foundation settlement problems</li>
                        <li>Structural issues</li>
                        <li>Need for comprehensive assessment</li>
                    </ul>
                </article>
                
                <article class="warning-sign">
                    <h3>⚠️ Cracks Allowing Water Infiltration</h3>
                    <p>If shrinkage cracks are allowing water into your basement:</p>
                    <ul>
                        <li>They should be sealed to prevent damage</li>
                        <li>Water can cause further deterioration</li>
                        <li>Repair prevents mold and water damage</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="prevention">
            <h2>Preventing Excessive Shrinkage Cracks</h2>
            <p>While some shrinkage is inevitable, proper construction practices can minimize shrinkage cracks:</p>
            
            <div class="prevention-methods">
                <h3>Construction Practices:</h3>
                <ul>
                    <li><strong>Proper mix design:</strong> Appropriate water-cement ratio reduces shrinkage</li>
                    <li><strong>Curing methods:</strong> Proper curing maintains moisture and reduces shrinkage</li>
                    <li><strong>Control joints:</strong> Strategic placement of control joints directs cracking</li>
                    <li><strong>Reinforcement:</strong> Proper reinforcement helps control crack width</li>
                </ul>
                
                <h3>For Existing Foundations:</h3>
                <ul>
                    <li>Monitor cracks for changes</li>
                    <li>Seal cracks that allow water</li>
                    <li>Maintain proper drainage</li>
                    <li>Address any widening cracks promptly</li>
                </ul>
            </div>
        </section>

        <section class="repair-considerations">
            <h2>When to Repair Shrinkage Cracks</h2>
            <p>Most shrinkage cracks don't require immediate repair, but consider repair if:</p>
            
            <div class="repair-reasons">
                <article class="reason">
                    <h3>Water Infiltration</h3>
                    <p>If cracks are allowing water into your basement, they should be sealed:</p>
                    <ul>
                        <li>Prevents water damage</li>
                        <li>Stops mold growth</li>
                        <li>Protects stored belongings</li>
                        <li>Prevents further deterioration</li>
                    </ul>
                </article>
                
                <article class="reason">
                    <h3>Preventive Sealing</h3>
                    <p>Even if not currently leaking, sealing can:</p>
                    <ul>
                        <li>Prevent future water problems</li>
                        <li>Protect against freeze-thaw damage</li>
                        <li>Provide peace of mind</li>
                        <li>Be cost-effective preventive maintenance</li>
                    </ul>
                </article>
                
                <article class="reason">
                    <h3>Cosmetic Concerns</h3>
                    <p>If cracks are unsightly, repair can:</p>
                    <ul>
                        <li>Improve appearance</li>
                        <li>Maintain property value</li>
                        <li>Provide a clean, finished look</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="repair-methods">
            <h2>Repair Methods for Shrinkage Cracks</h2>
            <p>If shrinkage cracks need repair, several methods are available:</p>
            
            <div class="methods">
                <article class="method">
                    <h3>Crack Injection</h3>
                    <p>For cracks allowing water or for preventive sealing:</p>
                    <ul>
                        <li>Polyurethane injection for active leaks</li>
                        <li>Epoxy injection for structural concerns</li>
                        <li>Effective and long-lasting</li>
                        <li>Non-invasive process</li>
                    </ul>
                </article>
                
                <article class="method">
                    <h3>Surface Sealing</h3>
                    <p>For cosmetic purposes or minor sealing:</p>
                    <ul>
                        <li>Caulking or sealants</li>
                        <li>Less expensive option</li>
                        <li>May need periodic reapplication</li>
                        <li>Good for non-leaking cracks</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="conclusion">
            <h2>Conclusion</h2>
            <p>Shrinkage cracks are a normal part of concrete foundation curing and are generally not a structural concern. They're typically vertical or diagonal, hairline to 1/8 inch wide, and appear within the first year after construction. Most shrinkage cracks are cosmetic and don't require immediate repair.</p>
            <p>However, if shrinkage cracks are wider than 1/4 inch, are widening over time, are accompanied by other foundation issues, or are allowing water infiltration, they should be assessed by a professional. Even if not currently problematic, sealing shrinkage cracks can prevent future water problems and provide peace of mind.</p>
            <p>If you have shrinkage cracks in your foundation and want to know if they need repair, contact CrackBuster for a free professional assessment. Our experts will evaluate your cracks and recommend the appropriate course of action.</p>
        </section>`,
        featuredImage: '/images/stock/Identifying-Different-Types-of-Foundation-Cracks - Copy.jpg',
        metaTitle: 'Shrinkage Cracks in Concrete Foundations | CrackBuster Blog',
        metaDescription: 'Learn about shrinkage cracks, why they occur, and when they need professional attention or repair.',
        keywords: ['shrinkage cracks', 'concrete cracks', 'foundation cracks'],
        published: true,
        publishedAt: new Date('2024-05-15')
    },
    {
        title: 'Settlement and Foundation Cracks',
        excerpt: 'Understanding foundation settlement, its causes, and how it relates to crack formation.',
        content: `<div class="blog-intro">
            <p>Foundation settlement is a natural process that occurs as the soil beneath your foundation compacts over time. While some settlement is normal and expected, excessive or uneven settlement can cause serious problems, including foundation cracks. Understanding the difference between normal and problematic settlement helps homeowners identify when professional intervention is needed. This comprehensive guide explains foundation settlement, its causes, and how it relates to crack formation.</p>
            <img src="/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.png" alt="Foundation Settlement" class="blog-featured-image" loading="lazy" />
        </div>

        <section class="what-is-settlement">
            <h2>What is Foundation Settlement?</h2>
            <p>Foundation settlement occurs when the soil beneath a foundation compacts or shifts, causing the foundation to move downward. This is a natural process that happens to some degree with almost all foundations. The key is understanding the difference between normal, expected settlement and problematic settlement that requires attention.</p>
            
            <div class="settlement-explanation">
                <h3>Why Settlement Occurs:</h3>
                <ul>
                    <li><strong>Soil compaction:</strong> Soil naturally compacts under the weight of the structure</li>
                    <li><strong>Moisture changes:</strong> Changes in soil moisture can cause expansion or contraction</li>
                    <li><strong>Time:</strong> Settlement often occurs gradually over years</li>
                    <li><strong>Soil type:</strong> Different soil types settle at different rates</li>
                </ul>
            </div>
        </section>

        <section class="normal-settlement">
            <h2>Normal Settlement</h2>
            <p>Normal settlement is expected and generally not a cause for concern. Understanding what constitutes normal settlement helps homeowners avoid unnecessary worry while staying alert to potential problems.</p>
            
            <div class="normal-characteristics">
                <h3>Characteristics of Normal Settlement:</h3>
                <ul>
                    <li><strong>Gradual occurrence:</strong> Happens slowly over years, not suddenly</li>
                    <li><strong>Uniform distribution:</strong> Usually uniform across the foundation</li>
                    <li><strong>Minor cracks:</strong> May cause minor, stable cracks</li>
                    <li><strong>No structural impact:</strong> Doesn't affect structural integrity</li>
                    <li><strong>Stabilizes:</strong> Settlement typically stabilizes over time</li>
                </ul>
                
                <h3>What to Expect:</h3>
                <ul>
                    <li>Minor hairline cracks may appear</li>
                    <li>Cracks remain stable (don't widen)</li>
                    <li>No impact on doors, windows, or floors</li>
                    <li>No signs of structural stress</li>
                </ul>
            </div>
        </section>

        <section class="problematic-settlement">
            <h2>Problematic Settlement</h2>
            <p>Problematic settlement is more serious and requires professional attention. It can cause significant foundation cracks and structural issues that need to be addressed promptly.</p>
            
            <div class="problematic-types">
                <article class="settlement-type">
                    <h3>Uneven Settlement (Differential Settlement)</h3>
                    <p>This occurs when different parts of the foundation settle at different rates:</p>
                    <ul>
                        <li>Causes structural stress and cracking</li>
                        <li>Can lead to significant foundation damage</li>
                        <li>Often causes diagonal cracks</li>
                        <li>May affect doors, windows, and floors</li>
                    </ul>
                </article>
                
                <article class="settlement-type">
                    <h3>Rapid Settlement</h3>
                    <p>Settlement that occurs quickly is concerning:</p>
                    <ul>
                        <li>Indicates underlying soil problems</li>
                        <li>Can cause sudden structural damage</li>
                        <li>Requires immediate professional assessment</li>
                        <li>May indicate soil washout or other issues</li>
                    </ul>
                </article>
                
                <article class="settlement-type">
                    <h3>Excessive Settlement</h3>
                    <p>Settlement that exceeds normal amounts:</p>
                    <ul>
                        <li>Causes significant cracks</li>
                        <li>Affects structural integrity</li>
                        <li>Impacts doors, windows, and floors</li>
                        <li>Requires professional intervention</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="causes">
            <h2>Causes of Problematic Settlement</h2>
            <p>Understanding what causes problematic settlement helps prevent it and identify when it's occurring:</p>
            
            <div class="causes-list">
                <article class="cause">
                    <h3>Poor Soil Conditions</h3>
                    <ul>
                        <li>Expansive soils that shrink and swell</li>
                        <li>Poorly compacted fill soil</li>
                        <li>Organic soils that decompose</li>
                        <li>Soils with poor load-bearing capacity</li>
                    </ul>
                </article>
                
                <article class="cause">
                    <h3>Moisture Changes</h3>
                    <ul>
                        <li>Drought causing soil shrinkage</li>
                        <li>Excessive moisture causing soil expansion</li>
                        <li>Poor drainage leading to soil saturation</li>
                        <li>Plumbing leaks affecting soil moisture</li>
                    </ul>
                </article>
                
                <article class="cause">
                    <h3>Construction Issues</h3>
                    <ul>
                        <li>Inadequate soil preparation</li>
                        <li>Poor foundation design</li>
                        <li>Insufficient foundation depth</li>
                        <li>Improper backfilling</li>
                    </ul>
                </article>
                
                <article class="cause">
                    <h3>External Factors</h3>
                    <ul>
                        <li>Nearby construction or excavation</li>
                        <li>Tree roots affecting soil</li>
                        <li>Water table changes</li>
                        <li>Vibration from traffic or construction</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="signs">
            <h2>Signs of Problematic Settlement</h2>
            <p>Recognizing the signs of problematic settlement helps you identify when professional assessment is needed:</p>
            
            <div class="signs-list">
                <article class="sign">
                    <h3>Doors and Windows</h3>
                    <ul>
                        <li>Doors that stick or won't close properly</li>
                        <li>Windows that are difficult to open or close</li>
                        <li>Gaps around door or window frames</li>
                        <li>Doors or windows that were previously fine</li>
                    </ul>
                </article>
                
                <article class="sign">
                    <h3>Cracks</h3>
                    <ul>
                        <li>Cracks in drywall, especially at corners</li>
                        <li>Diagonal cracks in walls</li>
                        <li>Foundation cracks that are widening</li>
                        <li>Multiple cracks appearing</li>
                    </ul>
                </article>
                
                <article class="sign">
                    <h3>Floors</h3>
                    <ul>
                        <li>Uneven or sloping floors</li>
                        <li>Gaps between floor and baseboards</li>
                        <li>Floors that feel bouncy or soft</li>
                        <li>Visible slopes or dips</li>
                    </ul>
                </article>
                
                <article class="sign">
                    <h3>Foundation</h3>
                    <ul>
                        <li>Foundation cracks that are widening</li>
                        <li>Multiple foundation cracks</li>
                        <li>Diagonal cracks from corners</li>
                        <li>Cracks wider than 1/4 inch</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="crack-relationship">
            <h2>How Settlement Causes Cracks</h2>
            <p>Settlement creates stress in foundation walls, which can lead to cracking:</p>
            
            <div class="crack-formation">
                <h3>The Process:</h3>
                <ol>
                    <li><strong>Soil movement:</strong> Soil beneath foundation compacts or shifts</li>
                    <li><strong>Foundation movement:</strong> Foundation moves with the soil</li>
                    <li><strong>Stress development:</strong> Movement creates stress in foundation walls</li>
                    <li><strong>Crack formation:</strong> When stress exceeds concrete strength, cracks form</li>
                </ol>
                
                <h3>Types of Cracks from Settlement:</h3>
                <ul>
                    <li><strong>Diagonal cracks:</strong> Often from corners, indicating differential settlement</li>
                    <li><strong>Vertical cracks:</strong> Can occur from uniform or differential settlement</li>
                    <li><strong>Stair-step cracks:</strong> In block foundations, following mortar joints</li>
                    <li><strong>Multiple cracks:</strong> Indicate significant settlement</li>
                </ul>
            </div>
        </section>

        <section class="prevention">
            <h2>Preventing Problematic Settlement</h2>
            <p>While some settlement is inevitable, you can take steps to prevent problematic settlement:</p>
            
            <div class="prevention-methods">
                <h3>For New Construction:</h3>
                <ul>
                    <li>Proper soil testing and preparation</li>
                    <li>Adequate foundation depth</li>
                    <li>Proper soil compaction</li>
                    <li>Appropriate foundation design</li>
                </ul>
                
                <h3>For Existing Homes:</h3>
                <ul>
                    <li>Maintain consistent soil moisture</li>
                    <li>Ensure proper drainage</li>
                    <li>Address plumbing leaks promptly</li>
                    <li>Monitor for signs of settlement</li>
                    <li>Professional inspections</li>
                </ul>
            </div>
        </section>

        <section class="when-to-call-professional">
            <h2>When to Call a Professional</h2>
            <p>If you notice signs of problematic settlement, it's important to have your foundation assessed by a professional:</p>
            <ul>
                <li>Doors or windows that stick or won't close</li>
                <li>Cracks in drywall, especially at corners</li>
                <li>Uneven or sloping floors</li>
                <li>Foundation cracks that are widening</li>
                <li>Multiple cracks appearing</li>
                <li>Any concerns about foundation stability</li>
            </ul>
            <p>Early intervention can prevent more serious structural issues and save money in the long run.</p>
        </section>

        <section class="conclusion">
            <h2>Conclusion</h2>
            <p>Foundation settlement is a natural process, but problematic settlement can cause serious foundation cracks and structural issues. Understanding the difference between normal and problematic settlement, recognizing the signs, and knowing when to call a professional are essential for protecting your home.</p>
            <p>If you notice signs of problematic settlement or have concerns about foundation cracks, contact CrackBuster for a professional assessment. Our experts will evaluate your foundation and determine if settlement is causing your cracks. We'll provide recommendations for addressing any issues and preventing further problems.</p>
        </section>`,
        featuredImage: '/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.png',
        metaTitle: 'Settlement and Foundation Cracks | CrackBuster Blog',
        metaDescription: 'Learn about foundation settlement, its causes, and how it relates to crack formation and structural issues.',
        keywords: ['settlement', 'foundation settlement', 'structural issues', 'foundation cracks'],
        published: true,
        publishedAt: new Date('2024-06-01')
    },
    {
        title: 'Why Repair Cracks?',
        excerpt: 'Understanding the importance of timely foundation crack repair and the consequences of neglect.',
        content: `<div class="blog-intro">
            <p>Many homeowners wonder if foundation cracks really need to be repaired. The answer depends on the type and severity of the crack, but in most cases, timely repair is the best choice. This comprehensive guide explains why foundation crack repair is important and what can happen if cracks are left untreated.</p>
            <img src="/images/stock/Cement with Crack - Copy.png" alt="Foundation Crack Repair" class="blog-featured-image" loading="lazy" />
        </div>

        <section class="why-repair">
            <h2>Why Foundation Crack Repair is Essential</h2>
            <p>Foundation cracks may seem minor, but they can lead to serious problems if left untreated. Here are the key reasons why timely crack repair is crucial:</p>
        </section>

        <section class="water-damage">
            <h2>1. Prevent Water Damage</h2>
            <p>Even small cracks can allow significant water infiltration, especially during heavy rains or when hydrostatic pressure is present. Water damage from foundation cracks can lead to:</p>
            
            <div class="damage-grid">
                <div class="damage-item">
                    <h3>🌊 Basement Flooding</h3>
                    <p>Water entering through cracks can flood your basement, causing extensive damage to:</p>
                    <ul>
                        <li>Stored belongings and furniture</li>
                        <li>Finished basement materials</li>
                        <li>Electrical systems and appliances</li>
                        <li>Personal items and valuables</li>
                    </ul>
                </div>
                
                <div class="damage-item">
                    <h3>🦠 Mold and Mildew Growth</h3>
                    <p>Moisture from cracks creates ideal conditions for mold and mildew, which can:</p>
                    <ul>
                        <li>Affect indoor air quality throughout your home</li>
                        <li>Trigger allergies and respiratory problems</li>
                        <li>Create musty odors that are difficult to eliminate</li>
                        <li>Require expensive professional remediation</li>
                    </ul>
                </div>
                
                <div class="damage-item">
                    <h3>💧 Damage to Stored Items</h3>
                    <p>Water infiltration can damage or destroy:</p>
                    <ul>
                        <li>Boxes and stored belongings</li>
                        <li>Furniture and upholstery</li>
                        <li>Documents and photographs</li>
                        <li>Electronics and appliances</li>
                    </ul>
                </div>
                
                <div class="damage-item">
                    <h3>🏗️ Structural Deterioration</h3>
                    <p>Water can cause ongoing damage to your foundation:</p>
                    <ul>
                        <li>Freeze-thaw cycles expand cracks</li>
                        <li>Water erodes concrete and masonry</li>
                        <li>Moisture weakens foundation materials</li>
                        <li>Can lead to more extensive foundation problems</li>
                    </ul>
                </div>
            </div>
            
            <img src="/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.png" alt="Water Damage from Foundation Cracks" class="blog-image" loading="lazy" />
        </section>

        <section class="structural-integrity">
            <h2>2. Maintain Structural Integrity</h2>
            <p>Some foundation cracks can compromise your home's structural integrity, especially if they're:</p>
            <ul>
                <li><strong>Widening over time:</strong> Indicates ongoing foundation movement or stress</li>
                <li><strong>Horizontal cracks:</strong> Often indicate serious structural issues requiring immediate attention</li>
                <li><strong>Wide cracks:</strong> Cracks wider than 1/4 inch may affect load-bearing capacity</li>
                <li><strong>Multiple cracks:</strong> Can indicate broader foundation problems</li>
                <li><strong>Accompanied by other signs:</strong> Such as bowing walls, uneven floors, or sticking doors</li>
            </ul>
            <p>Unrepaired structural cracks can lead to:</p>
            <ul>
                <li>Further foundation deterioration</li>
                <li>Increased repair costs over time</li>
                <li>Safety concerns for your family</li>
                <li>Potential for more extensive structural damage</li>
            </ul>
        </section>

        <section class="property-value">
            <h2>3. Protect Property Value</h2>
            <p>Unrepaired foundation issues can significantly impact your property value and ability to sell your home:</p>
            
            <div class="value-impact">
                <h3>Impact on Home Value:</h3>
                <ul>
                    <li><strong>Reduced Market Value:</strong> Foundation issues can significantly reduce your home's value</li>
                    <li><strong>Difficult to Sell:</strong> Buyers are often hesitant to purchase homes with foundation problems</li>
                    <li><strong>Failed Inspections:</strong> Foundation cracks often appear in home inspections, causing sales to fall through</li>
                    <li><strong>Negotiation Leverage:</strong> Buyers may demand price reductions or repairs before closing</li>
                </ul>
                
                <h3>Benefits of Professional Repair:</h3>
                <ul>
                    <li>Maintains or increases property value</li>
                    <li>Provides documentation for potential buyers</li>
                    <li>Prevents issues from appearing in inspections</li>
                    <li>Gives buyers confidence in the home's condition</li>
                </ul>
            </div>
        </section>

        <section class="cost-savings">
            <h2>4. Save Money Long-Term</h2>
            <p>Small cracks are much less expensive to repair than the damage they can cause if left untreated:</p>
            
            <div class="cost-comparison">
                <div class="cost-item">
                    <h3>Early Repair Investment</h3>
                    <ul>
                        <li>Affordable crack injection repair</li>
                        <li>Prevents water damage</li>
                        <li>Stops further deterioration</li>
                        <li>Minimal disruption</li>
                    </ul>
                </div>
                
                <div class="cost-item">
                    <h3>Delayed Repair Costs</h3>
                    <ul>
                        <li>Expensive water damage restoration</li>
                        <li>Costly mold remediation</li>
                        <li>Major foundation repairs</li>
                        <li>Replacement of damaged belongings</li>
                        <li>Potential structural repairs</li>
                    </ul>
                </div>
            </div>
            
            <p><strong>The comparison is clear:</strong> Repairing cracks early is far more cost-effective than dealing with the consequences of neglect. Contact us for a free estimate to see how affordable early repair can be.</p>
        </section>

        <section class="peace-of-mind">
            <h2>5. Peace of Mind</h2>
            <p>Knowing your foundation is properly maintained provides invaluable peace of mind:</p>
            <ul>
                <li><strong>Confidence in Your Home:</strong> You know your foundation is sound and protected</li>
                <li><strong>No Worry About Water:</strong> Sealed cracks prevent unexpected water problems</li>
                <li><strong>Protected Investment:</strong> Your home is one of your largest investments—protect it</li>
                <li><strong>Family Safety:</strong> Structural integrity ensures your family's safety</li>
                <li><strong>Reduced Stress:</strong> No more worrying about what might happen during the next rain</li>
            </ul>
        </section>

        <section class="consequences-of-neglect">
            <h2>Consequences of Not Repairing Cracks</h2>
            <p>If foundation cracks are left untreated, they can lead to:</p>
            
            <div class="consequences-list">
                <div class="consequence-item">
                    <h3>⚠️ Escalating Problems</h3>
                    <p>Small cracks can become large problems over time. What starts as a minor issue can develop into serious structural damage requiring extensive and expensive repairs.</p>
                </div>
                
                <div class="consequence-item">
                    <h3>⚠️ Increased Repair Costs</h3>
                    <p>As problems worsen, repair costs increase significantly. A simple crack injection today can prevent extensive damage and expensive repairs tomorrow.</p>
                </div>
                
                <div class="consequence-item">
                    <h3>⚠️ Health Hazards</h3>
                    <p>Water infiltration can lead to mold growth, which can affect your family's health and require expensive professional remediation.</p>
                </div>
                
                <div class="consequence-item">
                    <h3>⚠️ Safety Concerns</h3>
                    <p>Unrepaired structural cracks can compromise your foundation's integrity, potentially creating safety hazards for your family.</p>
                </div>
            </div>
        </section>

        <section class="when-to-repair">
            <h2>When to Repair Foundation Cracks</h2>
            <p>While not all cracks require immediate attention, you should have cracks assessed by a professional if they:</p>
            <ul class="warning-list">
                <li>Are wider than 1/8 inch</li>
                <li>Are widening over time</li>
                <li>Are allowing water into your basement</li>
                <li>Are horizontal in orientation</li>
                <li>Are accompanied by other foundation issues</li>
                <li>Are causing concern about structural integrity</li>
            </ul>
            <p>When in doubt, it's always best to have cracks assessed by a professional. Early assessment and repair can prevent major problems and save you money.</p>
        </section>

        <section class="conclusion">
            <h2>Conclusion</h2>
            <p>Foundation crack repair is an investment in your home's protection, value, and your family's safety. While it may be tempting to ignore small cracks, timely repair prevents water damage, maintains structural integrity, protects property value, saves money long-term, and provides peace of mind.</p>
            <p><strong>Don't wait until a small problem becomes a major issue.</strong> Contact CrackBuster today for a free assessment of your foundation cracks. Our expert technicians will evaluate your cracks and recommend the appropriate repair solution. We'll provide a detailed estimate and explain the repair process so you can make an informed decision about protecting your home.</p>
        </section>`,
        featuredImage: '/images/stock/Cement with Crack - Copy.png',
        metaTitle: 'Why Repair Foundation Cracks? | CrackBuster Blog',
        metaDescription: 'Learn why timely foundation crack repair is important and the consequences of neglect.',
        keywords: ['crack repair', 'foundation maintenance', 'water damage'],
        published: true,
        publishedAt: new Date('2024-06-15')
    },
    {
        title: 'How a Basement Is Built',
        excerpt: 'Understanding basement construction helps homeowners better understand foundation issues and repairs.',
        content: `<div class="blog-intro">
            <p>Understanding how your basement was constructed can help you better understand foundation issues and the repair process. Knowing the construction methods and materials used in your basement provides valuable context when discussing foundation problems with professionals. This comprehensive guide explains the basement construction process, the materials used, and how construction methods relate to common foundation issues.</p>
            <img src="/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.png" alt="Basement Construction Process" class="blog-featured-image" loading="lazy" />
        </div>

        <section class="construction-overview">
            <h2>Basement Construction Overview</h2>
            <p>Basement construction is a complex process involving multiple stages, each critical to the foundation's long-term performance. Understanding these stages helps homeowners recognize potential issues and understand why certain repair methods are recommended.</p>
        </section>

        <section class="construction-stages">
            <h2>The Basement Construction Process</h2>
            <p>Basement construction follows a specific sequence of steps, each building on the previous one. Here's a detailed look at each stage:</p>
            
            <div class="stages">
                <article class="stage">
                    <h3>1. Site Preparation and Excavation</h3>
                    <p>The first step in basement construction is preparing the site and excavating to the desired depth:</p>
                    <ul>
                        <li><strong>Site clearing:</strong> Remove trees, vegetation, and obstacles</li>
                        <li><strong>Surveying:</strong> Mark exact foundation location and elevation</li>
                        <li><strong>Excavation:</strong> Dig to desired depth, typically 8-10 feet below grade</li>
                        <li><strong>Soil testing:</strong> Evaluate soil conditions and load-bearing capacity</li>
                        <li><strong>Grading:</strong> Level and prepare the excavation base</li>
                    </ul>
                    <p><strong>Why it matters:</strong> Proper excavation depth and soil preparation are crucial for foundation stability. Inadequate depth or poor soil conditions can lead to settlement and cracking.</p>
                </article>
                
                <article class="stage">
                    <h3>2. Footing Installation</h3>
                    <p>Footings are the base of the foundation system, distributing the weight of the structure:</p>
                    <ul>
                        <li><strong>Footing design:</strong> Sized based on soil conditions and building load</li>
                        <li><strong>Excavation:</strong> Trenches dug for footings, typically wider than walls</li>
                        <li><strong>Reinforcement:</strong> Rebar placed in footings for strength</li>
                        <li><strong>Concrete pour:</strong> Footings poured and leveled</li>
                        <li><strong>Curing:</strong> Footings allowed to cure before wall construction</li>
                    </ul>
                    <p><strong>Why it matters:</strong> Footings distribute building weight over a larger area, preventing excessive settlement. Inadequate footings can cause foundation movement and cracking.</p>
                </article>
                
                <article class="stage">
                    <h3>3. Foundation Wall Construction</h3>
                    <p>Foundation walls are constructed using one of several methods, each with different characteristics:</p>
                    
                    <div class="wall-types">
                        <h4>Poured Concrete (Most Common)</h4>
                        <ul>
                            <li>Forms are built to create wall shape</li>
                            <li>Reinforcement (rebar) is placed in forms</li>
                            <li>Concrete is poured into forms</li>
                            <li>Forms are removed after concrete cures</li>
                            <li>Creates monolithic, seamless walls</li>
                        </ul>
                        <p><strong>Advantages:</strong> Strong, seamless, less prone to leaks, good for water resistance</p>
                        
                        <h4>Concrete Block</h4>
                        <ul>
                            <li>Concrete blocks are laid with mortar</li>
                            <li>Reinforcement may be added in block cores</li>
                            <li>Mortar joints create potential leak points</li>
                            <li>More labor-intensive than poured concrete</li>
                        </ul>
                        <p><strong>Characteristics:</strong> Cracks often follow mortar joints (stair-step pattern), more susceptible to water infiltration</p>
                        
                        <h4>Precast Panels</h4>
                        <ul>
                            <li>Panels are manufactured off-site</li>
                            <li>Panels are transported and installed</li>
                            <li>Joints between panels must be sealed</li>
                            <li>Less common in residential construction</li>
                        </ul>
                        <p><strong>Characteristics:</strong> Joints between panels can be potential leak points</p>
                    </div>
                </article>
                
                <article class="stage">
                    <h3>4. Waterproofing Application</h3>
                    <p>Waterproofing is applied to the exterior of foundation walls to prevent water infiltration:</p>
                    <ul>
                        <li><strong>Surface preparation:</strong> Walls cleaned and prepared</li>
                        <li><strong>Membrane application:</strong> Waterproofing membrane applied to exterior</li>
                        <li><strong>Drainage board:</strong> May include drainage board for additional protection</li>
                        <li><strong>Protection:</strong> Membrane protected during backfilling</li>
                    </ul>
                    <p><strong>Why it matters:</strong> Proper waterproofing is essential for preventing basement leaks. Inadequate or damaged waterproofing is a leading cause of basement water problems.</p>
                </article>
                
                <article class="stage">
                    <h3>5. Backfilling</h3>
                    <p>After waterproofing, soil is backfilled around the foundation:</p>
                    <ul>
                        <li><strong>Backfill material:</strong> Appropriate soil selected for backfilling</li>
                        <li><strong>Compaction:</strong> Soil compacted in layers to prevent settling</li>
                        <li><strong>Drainage:</strong> Drainage systems may be installed during backfilling</li>
                        <li><strong>Grading:</strong> Final grading slopes away from foundation</li>
                    </ul>
                    <p><strong>Why it matters:</strong> Improper backfilling can create excessive pressure on foundation walls, leading to bowing, cracking, and structural problems.</p>
                </article>
            </div>
        </section>

        <section class="construction-materials">
            <h2>Materials Used in Basement Construction</h2>
            <p>Understanding the materials used in your basement helps explain why certain issues occur and which repair methods are most appropriate:</p>
            
            <div class="materials">
                <article class="material">
                    <h3>Concrete</h3>
                    <p>The primary material for foundation construction:</p>
                    <ul>
                        <li>Mixture of cement, water, sand, and aggregate</li>
                        <li>Strength depends on mix design and curing</li>
                        <li>Can develop cracks due to shrinkage, settlement, or stress</li>
                        <li>Durability depends on quality and maintenance</li>
                    </ul>
                </article>
                
                <article class="material">
                    <h3>Reinforcement (Rebar)</h3>
                    <p>Steel reinforcement adds strength to concrete:</p>
                    <ul>
                        <li>Prevents cracks from widening</li>
                        <li>Distributes stress throughout structure</li>
                        <li>Essential for structural integrity</li>
                        <li>Can corrode if exposed to moisture</li>
                    </ul>
                </article>
                
                <article class="material">
                    <h3>Waterproofing Membranes</h3>
                    <p>Protective barriers applied to foundation walls:</p>
                    <ul>
                        <li>Prevent water infiltration</li>
                        <li>Can be liquid-applied or sheet membranes</li>
                        <li>Must be properly installed and protected</li>
                        <li>Can deteriorate over time</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="common-issues">
            <h2>Common Construction-Related Issues</h2>
            <p>Understanding how construction issues relate to foundation problems helps identify causes and solutions:</p>
            
            <div class="issues">
                <article class="issue">
                    <h3>Improper Backfilling</h3>
                    <p>Problems with backfilling can cause significant foundation issues:</p>
                    <ul>
                        <li><strong>Excessive pressure:</strong> Over-compaction or poor material selection can create excessive lateral pressure</li>
                        <li><strong>Inadequate compaction:</strong> Poor compaction can lead to settlement</li>
                        <li><strong>Result:</strong> Bowing walls, horizontal cracks, structural stress</li>
                        <li><strong>Solution:</strong> May require wall stabilization, proper drainage, or structural reinforcement</li>
                    </ul>
                </article>
                
                <article class="issue">
                    <h3>Inadequate Waterproofing</h3>
                    <p>Waterproofing problems are a leading cause of basement leaks:</p>
                    <ul>
                        <li><strong>Missing waterproofing:</strong> Older homes may lack proper waterproofing</li>
                        <li><strong>Damaged membrane:</strong> Waterproofing can be damaged during construction or deteriorate over time</li>
                        <li><strong>Poor installation:</strong> Improperly installed waterproofing fails to protect</li>
                        <li><strong>Result:</strong> Water infiltration, leaks, mold, and damage</li>
                        <li><strong>Solution:</strong> Interior drainage systems, exterior waterproofing (requires excavation), or crack sealing</li>
                    </ul>
                </article>
                
                <article class="issue">
                    <h3>Poor Drainage</h3>
                    <p>Inadequate drainage systems cause water problems:</p>
                    <ul>
                        <li><strong>Missing drainage:</strong> No perimeter drainage installed</li>
                        <li><strong>Inadequate slope:</strong> Poor grading directs water toward foundation</li>
                        <li><strong>Clogged systems:</strong> Drainage systems can become blocked</li>
                        <li><strong>Result:</strong> Hydrostatic pressure, water infiltration, foundation damage</li>
                        <li><strong>Solution:</strong> Install or repair drainage systems, improve grading, install sump pump</li>
                    </ul>
                </article>
                
                <article class="issue">
                    <h3>Insufficient Foundation Depth</h3>
                    <p>Foundations that aren't deep enough can have problems:</p>
                    <ul>
                        <li><strong>Frost heave:</strong> Shallow foundations can be affected by freeze-thaw cycles</li>
                        <li><strong>Inadequate support:</strong> May not reach stable soil layers</li>
                        <li><strong>Result:</strong> Movement, cracking, structural issues</li>
                        <li><strong>Solution:</strong> Foundation stabilization, underpinning, or structural reinforcement</li>
                    </ul>
                </article>
                
                <article class="issue">
                    <h3>Construction Defects</h3>
                    <p>Defects during construction can cause long-term problems:</p>
                    <ul>
                        <li><strong>Poor concrete quality:</strong> Weak concrete is more prone to cracking</li>
                        <li><strong>Inadequate reinforcement:</strong> Insufficient rebar reduces strength</li>
                        <li><strong>Improper curing:</strong> Poor curing can weaken concrete</li>
                        <li><strong>Result:</strong> Cracking, reduced strength, premature deterioration</li>
                        <li><strong>Solution:</strong> Structural reinforcement, crack repair, or foundation stabilization</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="construction-and-repairs">
            <h2>How Construction Methods Affect Repairs</h2>
            <p>Understanding your basement's construction helps our technicians recommend the most appropriate repair methods:</p>
            
            <div class="repair-considerations">
                <article class="consideration">
                    <h3>Poured Concrete Walls</h3>
                    <p>Repair considerations for poured concrete:</p>
                    <ul>
                        <li>Cracks are typically vertical or diagonal</li>
                        <li>Injection methods work well for sealing</li>
                        <li>Structural reinforcement may be needed for serious cracks</li>
                        <li>Waterproofing can be applied to interior or exterior</li>
                    </ul>
                </article>
                
                <article class="consideration">
                    <h3>Concrete Block Walls</h3>
                    <p>Repair considerations for block walls:</p>
                    <ul>
                        <li>Cracks often follow mortar joints (stair-step pattern)</li>
                        <li>Mortar joints are potential leak points</li>
                        <li>May require repointing or sealing of joints</li>
                        <li>Structural reinforcement may be needed for bowing</li>
                    </ul>
                </article>
                
                <article class="consideration">
                    <h3>Age and Condition</h3>
                    <p>Construction age affects repair options:</p>
                    <ul>
                        <li>Older homes may lack modern waterproofing</li>
                        <li>Materials may have deteriorated over time</li>
                        <li>Construction standards have improved over decades</li>
                        <li>Repair methods must account for existing conditions</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="importance-of-understanding">
            <h2>Why Understanding Construction Matters</h2>
            <p>Knowing how your basement was constructed provides valuable context for:</p>
            <ul>
                <li><strong>Identifying issues:</strong> Understanding construction helps identify potential problem areas</li>
                <li><strong>Choosing repairs:</strong> Construction type influences which repair methods are most effective</li>
                <li><strong>Preventing problems:</strong> Knowing construction helps prevent issues through proper maintenance</li>
                <li><strong>Communicating with professionals:</strong> Understanding construction helps you discuss issues effectively</li>
            </ul>
        </section>

        <section class="conclusion">
            <h2>Conclusion</h2>
            <p>Understanding how your basement was constructed provides valuable insight into foundation issues and repair options. The construction process involves excavation, footings, wall construction, waterproofing, and backfilling, each stage critical to long-term performance. Common construction-related issues include improper backfilling, inadequate waterproofing, poor drainage, insufficient foundation depth, and construction defects.</p>
            <p>When you understand your basement's construction, you can better identify potential problems and understand why certain repair methods are recommended. If you're experiencing foundation issues, contact CrackBuster for a professional assessment. Our technicians will evaluate your foundation, consider its construction, and recommend the most appropriate repair methods for your specific situation.</p>
        </section>`,
        featuredImage: '/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.png',
        metaTitle: 'How a Basement Is Built | CrackBuster Blog',
        metaDescription: 'Learn about basement construction, the materials and methods used, and how construction relates to foundation issues and repairs.',
        keywords: ['basement construction', 'foundation construction', 'basement building', 'foundation walls'],
        published: true,
        publishedAt: new Date('2024-07-01')
    },
    {
        title: 'Grading and Drainage for Foundation Protection',
        excerpt: 'Proper grading and drainage are essential for protecting your foundation from water damage.',
        content: `<div class="blog-intro">
            <p>Proper grading and drainage are among the most important factors in protecting your foundation from water damage. Poor drainage is a leading cause of foundation problems, including cracks, leaks, and structural issues. Understanding how to maintain proper grading and drainage can prevent many foundation problems and is often more cost-effective than repairing damage caused by poor drainage. This comprehensive guide explains proper grading, drainage systems, and how to protect your foundation from water damage.</p>
            <img src="/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.png" alt="Grading and Drainage for Foundation Protection" class="blog-featured-image" loading="lazy" />
        </div>

        <section class="importance">
            <h2>Why Grading and Drainage Matter</h2>
            <p>Water is one of the greatest threats to foundation integrity. Proper grading and drainage systems work together to direct water away from your foundation, preventing:</p>
            <ul>
                <li>Hydrostatic pressure that can cause foundation cracks</li>
                <li>Water infiltration into basements</li>
                <li>Soil erosion around foundations</li>
                <li>Foundation settlement and movement</li>
                <li>Mold and mildew growth</li>
                <li>Structural damage and deterioration</li>
            </ul>
            <p>Investing in proper grading and drainage is one of the most cost-effective ways to protect your foundation.</p>
        </section>

        <section class="proper-grading">
            <h2>Proper Grading for Foundation Protection</h2>
            <p>Grading refers to the slope of the ground around your foundation. Proper grading directs water away from your foundation, preventing it from pooling near foundation walls.</p>
            
            <div class="grading-requirements">
                <h3>Grading Standards</h3>
                <ul>
                    <li><strong>Slope direction:</strong> Soil should slope away from foundation in all directions</li>
                    <li><strong>Minimum slope:</strong> At least 6 inches of drop in the first 10 feet from foundation</li>
                    <li><strong>Consistent slope:</strong> Maintain slope around entire foundation perimeter</li>
                    <li><strong>Distance:</strong> Slope should extend at least 10 feet from foundation</li>
                </ul>
                
                <h3>How to Check Your Grading</h3>
                <ol>
                    <li>Walk around your foundation after a rain</li>
                    <li>Look for areas where water pools</li>
                    <li>Check if water flows toward or away from foundation</li>
                    <li>Use a level to measure slope if needed</li>
                    <li>Identify low spots that need filling</li>
                </ol>
                
                <h3>Improving Grading</h3>
                <ul>
                    <li><strong>Add soil:</strong> Fill low spots with compacted soil</li>
                    <li><strong>Regrade:</strong> Reshape soil to create proper slope</li>
                    <li><strong>Compact:</strong> Properly compact soil to prevent settling</li>
                    <li><strong>Maintain:</strong> Regularly check and maintain grading</li>
                </ul>
            </div>
        </section>

        <section class="gutter-maintenance">
            <h2>Gutter and Downspout Maintenance</h2>
            <p>Gutters and downspouts are your first line of defense against water damage. They collect rainwater from your roof and direct it away from your foundation.</p>
            
            <div class="gutter-care">
                <article class="maintenance-task">
                    <h3>Gutter Cleaning</h3>
                    <p>Keep gutters clean and free of debris:</p>
                    <ul>
                        <li><strong>Frequency:</strong> Clean at least twice per year (spring and fall)</li>
                        <li><strong>Remove debris:</strong> Clear leaves, twigs, and other blockages</li>
                        <li><strong>Check for damage:</strong> Repair loose or damaged gutters</li>
                        <li><strong>Ensure flow:</strong> Make sure water flows freely through gutters</li>
                        <li><strong>Consider guards:</strong> Gutter guards can reduce maintenance needs</li>
                    </ul>
                </article>
                
                <article class="maintenance-task">
                    <h3>Downspout Management</h3>
                    <p>Proper downspout placement is crucial:</p>
                    <ul>
                        <li><strong>Extension length:</strong> Downspouts should extend at least 6 feet from foundation</li>
                        <li><strong>Direction:</strong> Direct water away from foundation, not toward it</li>
                        <li><strong>Splash blocks:</strong> Use splash blocks to prevent erosion</li>
                        <li><strong>Underground extensions:</strong> Consider underground extensions for better drainage</li>
                        <li><strong>Check for blockages:</strong> Ensure downspouts aren't clogged</li>
                    </ul>
                </article>
                
                <article class="maintenance-task">
                    <h3>Common Gutter Problems</h3>
                    <p>Watch for these issues:</p>
                    <ul>
                        <li>Clogged gutters causing overflow</li>
                        <li>Loose or damaged gutters</li>
                        <li>Improperly positioned downspouts</li>
                        <li>Missing or damaged extensions</li>
                        <li>Gutters that don't slope properly</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="drainage-solutions">
            <h2>Drainage Solutions for Foundation Protection</h2>
            <p>Various drainage systems can be installed to protect your foundation from water damage:</p>
            
            <div class="drainage-types">
                <article class="drainage-type">
                    <h3>French Drains</h3>
                    <p>Perimeter drainage systems that collect and redirect water:</p>
                    <ul>
                        <li><strong>Location:</strong> Installed around foundation perimeter</li>
                        <li><strong>Function:</strong> Collects water and directs it away from foundation</li>
                        <li><strong>Components:</strong> Perforated pipe in gravel-filled trench</li>
                        <li><strong>Benefits:</strong> Effective for managing groundwater and surface water</li>
                        <li><strong>Installation:</strong> Can be exterior or interior</li>
                    </ul>
                </article>
                
                <article class="drainage-type">
                    <h3>Sump Pump Systems</h3>
                    <p>Pump systems that remove accumulated water:</p>
                    <ul>
                        <li><strong>Function:</strong> Pumps water out of basement or crawl space</li>
                        <li><strong>Components:</strong> Sump pit, pump, discharge pipe</li>
                        <li><strong>Benefits:</strong> Removes water that enters basement</li>
                        <li><strong>Backup:</strong> Battery backup recommended for power outages</li>
                        <li><strong>Maintenance:</strong> Regular testing and maintenance required</li>
                    </ul>
                </article>
                
                <article class="drainage-type">
                    <h3>Exterior Drainage Systems</h3>
                    <p>Systems installed outside foundation walls:</p>
                    <ul>
                        <li><strong>Location:</strong> Around foundation exterior</li>
                        <li><strong>Function:</strong> Prevents water from reaching foundation</li>
                        <li><strong>Installation:</strong> Requires excavation around foundation</li>
                        <li><strong>Benefits:</strong> Addresses water before it reaches foundation</li>
                        <li><strong>Considerations:</strong> More invasive but very effective</li>
                    </ul>
                </article>
                
                <article class="drainage-type">
                    <h3>Interior Drainage Systems</h3>
                    <p>Systems installed inside basement:</p>
                    <ul>
                        <li><strong>Location:</strong> Along interior perimeter of basement</li>
                        <li><strong>Function:</strong> Collects water that enters basement</li>
                        <li><strong>Installation:</strong> Less invasive than exterior systems</li>
                        <li><strong>Benefits:</strong> Manages water that gets past exterior protection</li>
                        <li><strong>Components:</strong> Drainage channel, sump pump, discharge</li>
                    </ul>
                </article>
                
                <article class="drainage-type">
                    <h3>Surface Drainage</h3>
                    <p>Simple solutions for surface water management:</p>
                    <ul>
                        <li><strong>Swales:</strong> Shallow ditches that direct water away</li>
                        <li><strong>Dry wells:</strong> Underground storage for excess water</li>
                        <li><strong>Channel drains:</strong> Surface drains that collect and redirect water</li>
                        <li><strong>Benefits:</strong> Cost-effective for surface water issues</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="signs-of-poor-drainage">
            <h2>Signs of Poor Drainage</h2>
            <p>Recognizing signs of poor drainage helps you identify problems before they cause serious foundation damage:</p>
            
            <div class="warning-signs">
                <article class="sign">
                    <h3>Water Pooling</h3>
                    <ul>
                        <li>Water standing near foundation after rain</li>
                        <li>Puddles that don't drain quickly</li>
                        <li>Muddy areas around foundation</li>
                        <li>Water collecting in low spots</li>
                    </ul>
                </article>
                
                <article class="sign">
                    <h3>Basement Leaks</h3>
                    <ul>
                        <li>Water entering basement during or after rain</li>
                        <li>Dampness or moisture in basement</li>
                        <li>Water stains on walls or floor</li>
                        <li>Musty odors from moisture</li>
                    </ul>
                </article>
                
                <article class="sign">
                    <h3>Erosion</h3>
                    <ul>
                        <li>Soil washing away around foundation</li>
                        <li>Exposed foundation in some areas</li>
                        <li>Gullies or channels forming</li>
                        <li>Mulch or landscaping washing away</li>
                    </ul>
                </article>
                
                <article class="sign">
                    <h3>Foundation Cracks</h3>
                    <ul>
                        <li>New cracks appearing after heavy rain</li>
                        <li>Cracks that leak water</li>
                        <li>Horizontal cracks (indicate pressure)</li>
                        <li>Multiple cracks in same area</li>
                    </ul>
                </article>
                
                <article class="sign">
                    <h3>Gutter Problems</h3>
                    <ul>
                        <li>Gutters overflowing during rain</li>
                        <li>Water spilling over gutter edges</li>
                        <li>Downspouts releasing water too close to foundation</li>
                        <li>Visible water flow toward foundation</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="edmonton-considerations">
            <h2>Edmonton-Specific Considerations</h2>
            <p>Edmonton's climate presents unique challenges for foundation drainage:</p>
            
            <div class="climate-factors">
                <article class="factor">
                    <h3>Freeze-Thaw Cycles</h3>
                    <ul>
                        <li>Water freezing in soil can cause expansion</li>
                        <li>Thawing creates excess moisture</li>
                        <li>Proper drainage prevents water accumulation</li>
                        <li>Foundation depth must be below frost line</li>
                    </ul>
                </article>
                
                <article class="factor">
                    <h3>Spring Snowmelt</h3>
                    <ul>
                        <li>Rapid snowmelt can overwhelm drainage systems</li>
                        <li>Large volumes of water need proper management</li>
                        <li>Ensure drainage systems are clear before spring</li>
                        <li>May need additional drainage capacity</li>
                    </ul>
                </article>
                
                <article class="factor">
                    <h3>Heavy Rainfall</h3>
                    <ul>
                        <li>Summer storms can produce heavy rainfall</li>
                        <li>Drainage systems must handle peak volumes</li>
                        <li>Proper grading prevents water accumulation</li>
                        <li>Sump pumps may be necessary</li>
                    </ul>
                </article>
            </div>
        </section>

        <section class="maintenance-checklist">
            <h2>Drainage Maintenance Checklist</h2>
            <p>Regular maintenance keeps your drainage systems functioning properly:</p>
            
            <div class="checklist">
                <h3>Monthly:</h3>
                <ul>
                    <li>Check for water pooling near foundation</li>
                    <li>Inspect gutters for blockages</li>
                    <li>Look for signs of erosion</li>
                </ul>
                
                <h3>Quarterly:</h3>
                <ul>
                    <li>Thoroughly clean gutters</li>
                    <li>Check downspout extensions</li>
                    <li>Inspect grading around foundation</li>
                    <li>Test sump pump if installed</li>
                </ul>
                
                <h3>Annually:</h3>
                <ul>
                    <li>Professional drainage inspection</li>
                    <li>Clean and inspect drainage systems</li>
                    <li>Assess and improve grading as needed</li>
                    <li>Check for new drainage issues</li>
                </ul>
            </div>
        </section>

        <section class="cost-effectiveness">
            <h2>Cost-Effectiveness of Proper Drainage</h2>
            <p>Investing in proper grading and drainage is highly cost-effective:</p>
            
            <div class="cost-comparison">
                <article class="cost-item">
                    <h3>Drainage Improvements</h3>
                    <ul>
                        <li>Affordable grading improvements</li>
                        <li>Reasonable gutter maintenance costs</li>
                        <li>Professional drainage systems</li>
                        <li>Prevents expensive foundation repairs</li>
                    </ul>
                </article>
                
                <article class="cost-item">
                    <h3>Cost of Poor Drainage</h3>
                    <ul>
                        <li>Major foundation repairs</li>
                        <li>Expensive water damage restoration</li>
                        <li>Costly mold remediation</li>
                        <li>Extensive structural repairs</li>
                    </ul>
                </article>
            </div>
            <p><strong>The investment in proper drainage pays for itself many times over by preventing foundation damage. Contact us for a free estimate on drainage improvements.</strong></p>
        </section>

        <section class="conclusion">
            <h2>Conclusion</h2>
            <p>Proper grading and drainage are essential for protecting your foundation from water damage. Maintaining proper grading, keeping gutters and downspouts functioning, and installing appropriate drainage systems can prevent many foundation problems. Poor drainage is a leading cause of foundation issues, but these problems are largely preventable with proper maintenance and improvements.</p>
            <p>If you're experiencing drainage problems or want to improve your foundation's protection, contact CrackBuster for a professional assessment. Our experts will evaluate your property's drainage, identify issues, and recommend solutions to protect your foundation. We can help you implement cost-effective drainage improvements that prevent expensive foundation repairs.</p>
        </section>`,
        featuredImage: '/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.png',
        metaTitle: 'Grading and Drainage for Foundation Protection | CrackBuster Blog',
        metaDescription: 'Learn how proper grading and drainage protect your foundation from water damage and prevent expensive foundation repairs.',
        keywords: ['drainage', 'grading', 'foundation protection', 'waterproofing', 'basement drainage'],
        published: true,
        publishedAt: new Date('2024-07-15')
    }
];

// Works data (from Job Images folders - new structure with subfolders)
async function getWorksData() {
    const worksData = [];
    const publicJobsPath = path.join(__dirname, '../client/public/images/jobs');

    if (!fs.existsSync(publicJobsPath)) {
        console.warn('Warning: public/images/jobs folder not found. Works will have no images.');
        return worksData;
    }

    // Get all Pictures folders from public/jobs (new structure)
    const folders = fs.readdirSync(publicJobsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('Pictures'))
        .map(dirent => dirent.name)
        .sort((a, b) => {
            const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
            const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
            return numA - numB;
        });

    // Unique descriptions with HTML for each project
    const projectDescriptions = [
        `<div class="project-description">
            <h3>Comprehensive Foundation Crack Repair</h3>
            <p>This residential foundation repair project involved addressing multiple structural cracks in a 1980s home in Edmonton. Our team performed <strong>epoxy crack injection</strong> to restore structural integrity and <strong>polyurethane sealing</strong> to prevent water infiltration.</p>
            <ul>
                <li>Identified and repaired 3 major vertical cracks</li>
                <li>Applied structural epoxy injection for load-bearing restoration</li>
                <li>Sealed all cracks with flexible polyurethane material</li>
                <li>Completed waterproofing to prevent future water damage</li>
            </ul>
            <p><strong>Result:</strong> Foundation integrity fully restored, zero water infiltration, comprehensive warranty provided.</p>
        </div>`,
        `<div class="project-description">
            <h3>Basement Waterproofing & Crack Sealing</h3>
            <p>A commercial building in downtown Edmonton required extensive foundation repair due to hydrostatic pressure causing horizontal cracks. We implemented a <strong>comprehensive waterproofing solution</strong> combined with crack injection.</p>
            <ul>
                <li>Repaired horizontal foundation cracks caused by soil pressure</li>
                <li>Installed interior drainage system</li>
                <li>Applied high-pressure polyurethane injection</li>
                <li>Completed full basement waterproofing</li>
            </ul>
            <p><strong>Result:</strong> Complete water elimination, structural stability restored, building remains dry year-round.</p>
        </div>`,
        `<div class="project-description">
            <h3>Emergency Foundation Repair - Active Leak</h3>
            <p>This urgent repair addressed an active water leak through foundation cracks during spring thaw. Our emergency response team arrived within 24 hours to stop the leak and perform permanent repairs.</p>
            <ul>
                <li>Emergency leak stoppage using fast-cure polyurethane</li>
                <li>Structural crack repair with epoxy injection</li>
                <li>Preventive measures for future water issues</li>
                <li>Comprehensive documentation for insurance claim</li>
            </ul>
            <p><strong>Result:</strong> Leak stopped immediately, permanent repair completed, homeowner satisfied with rapid response.</p>
        </div>`,
        `<div class="project-description">
            <h3>Historic Home Foundation Restoration</h3>
            <p>A century-old heritage home required careful foundation repair to maintain its historical integrity while addressing modern structural concerns. We used <strong>specialized techniques</strong> to preserve the original foundation.</p>
            <ul>
                <li>Gentle low-pressure injection for delicate concrete</li>
                <li>Preservation of original foundation materials</li>
                <li>Custom-matched repair materials</li>
                <li>Compliance with heritage building regulations</li>
            </ul>
            <p><strong>Result:</strong> Foundation stabilized while preserving historical character, approved by heritage committee.</p>
        </div>`,
        `<div class="project-description">
            <h3>Multi-Crack Foundation Repair</h3>
            <p>This project involved repairing a network of interconnected foundation cracks in a residential basement. Our systematic approach ensured all cracks were properly sealed and the foundation's structural integrity was restored.</p>
            <ul>
                <li>Mapped and documented 8 separate crack locations</li>
                <li>Sequential injection process for interconnected cracks</li>
                <li>Quality testing to verify complete sealing</li>
                <li>Long-term monitoring plan established</li>
            </ul>
            <p><strong>Result:</strong> All cracks permanently sealed, foundation strength restored, comprehensive warranty coverage.</p>
        </div>`,
        `<div class="project-description">
            <h3>Foundation Crack Repair with Structural Reinforcement</h3>
            <p>A foundation showing signs of structural movement required both crack sealing and reinforcement. We combined <strong>crack injection</strong> with <strong>structural reinforcement</strong> to ensure long-term stability.</p>
            <ul>
                <li>Epoxy injection for structural strength restoration</li>
                <li>Carbon fiber reinforcement strips installed</li>
                <li>Comprehensive structural assessment</li>
                <li>Preventive measures for future movement</li>
            </ul>
            <p><strong>Result:</strong> Foundation stabilized, structural integrity enhanced, movement concerns eliminated.</p>
        </div>`,
        `<div class="project-description">
            <h3>Basement Foundation Waterproofing Project</h3>
            <p>This comprehensive project addressed both foundation cracks and overall basement waterproofing. The solution included crack repair, drainage improvements, and moisture control systems.</p>
            <ul>
                <li>Foundation crack injection and sealing</li>
                <li>Interior perimeter drainage installation</li>
                <li>Vapor barrier and moisture control</li>
                <li>Complete basement waterproofing system</li>
            </ul>
            <p><strong>Result:</strong> Dry basement year-round, foundation protected, comprehensive waterproofing solution.</p>
        </div>`,
        `<div class="project-description">
            <h3>Post-Construction Foundation Repair</h3>
            <p>A newly constructed home developed foundation cracks within the first year. We performed warranty repairs using advanced injection techniques to ensure the foundation meets all structural requirements.</p>
            <ul>
                <li>Assessment of post-construction settling cracks</li>
                <li>Professional-grade epoxy injection</li>
                <li>Warranty documentation for builder</li>
                <li>Long-term monitoring recommendations</li>
            </ul>
            <p><strong>Result:</strong> All cracks properly sealed, foundation meets code requirements, warranty documentation provided.</p>
        </div>`,
        `<div class="project-description">
            <h3>Foundation Repair with Exterior Waterproofing</h3>
            <p>This project combined interior crack repair with exterior waterproofing measures. The comprehensive approach addressed both the symptoms and root causes of foundation water issues.</p>
            <ul>
                <li>Interior crack injection and sealing</li>
                <li>Exterior foundation waterproofing membrane</li>
                <li>Drainage system improvements</li>
                <li>Landscaping adjustments for water management</li>
            </ul>
            <p><strong>Result:</strong> Complete water elimination, foundation protected from all directions, long-term solution implemented.</p>
        </div>`,
        `<div class="project-description">
            <h3>Commercial Foundation Crack Repair</h3>
            <p>A commercial warehouse required foundation repair to maintain operational continuity. Our team worked efficiently to minimize disruption while ensuring thorough crack sealing and structural restoration.</p>
            <ul>
                <li>Rapid assessment and repair planning</li>
                <li>High-volume epoxy injection for large cracks</li>
                <li>Minimal disruption to business operations</li>
                <li>Commercial-grade warranty and documentation</li>
            </ul>
            <p><strong>Result:</strong> Foundation repaired with minimal downtime, structural integrity restored, business operations uninterrupted.</p>
        </div>`,
        `<div class="project-description">
            <h3>Foundation Crack Repair - Seasonal Preparation</h3>
            <p>This proactive repair was completed before winter to prevent freeze-thaw damage. The homeowner wanted to address foundation cracks before the harsh Edmonton winter could cause further deterioration.</p>
            <ul>
                <li>Pre-winter foundation assessment</li>
                <li>Preventive crack sealing with flexible materials</li>
                <li>Freeze-thaw protection measures</li>
                <li>Winter maintenance recommendations</li>
            </ul>
            <p><strong>Result:</strong> Foundation protected for winter, cracks sealed before freeze-thaw cycles, peace of mind for homeowner.</p>
        </div>`,
        `<div class="project-description">
            <h3>Foundation Repair - Post-Flood Restoration</h3>
            <p>After a basement flood, this foundation required both crack repair and water damage restoration. We addressed the structural issues while coordinating with restoration specialists.</p>
            <ul>
                <li>Post-flood foundation assessment</li>
                <li>Emergency crack sealing to prevent re-entry</li>
                <li>Structural integrity restoration</li>
                <li>Coordination with water damage restoration</li>
            </ul>
            <p><strong>Result:</strong> Foundation secured, water entry eliminated, restoration completed successfully.</p>
        </div>`,
        `<div class="project-description">
            <h3>Foundation Crack Injection - Precision Work</h3>
            <p>This project required precise crack injection in a finished basement with minimal disruption. Our technicians used specialized low-pressure techniques to avoid damage to interior finishes.</p>
            <ul>
                <li>Careful planning to protect finished spaces</li>
                <li>Low-pressure injection for precision</li>
                <li>Minimal disruption to living spaces</li>
                <li>Clean work area maintenance</li>
            </ul>
            <p><strong>Result:</strong> Cracks sealed without damage to finishes, homeowner satisfied with clean work, minimal disruption.</p>
        </div>`,
        `<div class="project-description">
            <h3>Comprehensive Foundation Assessment & Repair</h3>
            <p>A complete foundation evaluation revealed multiple issues requiring systematic repair. We developed a comprehensive repair plan addressing all identified problems in a coordinated sequence.</p>
            <ul>
                <li>Complete foundation inspection and documentation</li>
                <li>Systematic crack repair in priority order</li>
                <li>Structural reinforcement where needed</li>
                <li>Long-term maintenance plan provided</li>
            </ul>
            <p><strong>Result:</strong> All foundation issues addressed, comprehensive repair completed, maintenance plan established.</p>
        </div>`,
        `<div class="project-description">
            <h3>Foundation Repair - New Construction Standards</h3>
            <p>This repair brought an older foundation up to current building code standards. The work included crack sealing, structural improvements, and code compliance verification.</p>
            <ul>
                <li>Code compliance assessment</li>
                <li>Structural improvements to meet standards</li>
                <li>Professional crack injection</li>
                <li>Building code compliance documentation</li>
            </ul>
            <p><strong>Result:</strong> Foundation meets current code standards, structural integrity verified, compliance documentation provided.</p>
        </div>`,
        `<div class="project-description">
            <h3>Foundation Crack Repair - Rental Property</h3>
            <p>A rental property required foundation repair to maintain habitability and protect the investment. We completed efficient repairs with comprehensive documentation for property management.</p>
            <ul>
                <li>Rapid assessment and repair planning</li>
                <li>Efficient crack injection process</li>
                <li>Tenant-friendly scheduling</li>
                <li>Property management documentation</li>
            </ul>
            <p><strong>Result:</strong> Foundation repaired efficiently, property protected, comprehensive documentation for management.</p>
        </div>`,
        `<div class="project-description">
            <h3>Foundation Repair - Energy Efficiency Focus</h3>
            <p>This project combined foundation repair with energy efficiency improvements. Sealing foundation cracks also improved the home's thermal performance and reduced energy costs.</p>
            <ul>
                <li>Foundation crack sealing</li>
                <li>Air sealing for energy efficiency</li>
                <li>Moisture control improvements</li>
                <li>Energy savings documentation</li>
            </ul>
            <p><strong>Result:</strong> Foundation repaired, energy efficiency improved, reduced heating costs for homeowner.</p>
        </div>`,
        `<div class="project-description">
            <h3>Foundation Crack Repair - Insurance Claim</h3>
            <p>This repair was completed as part of an insurance claim process. We provided detailed documentation, professional repairs, and insurance-compliant reporting throughout the project.</p>
            <ul>
                <li>Detailed damage assessment and documentation</li>
                <li>Insurance-compliant repair methods</li>
                <li>Comprehensive before/after documentation</li>
                <li>Insurance claim support and reporting</li>
            </ul>
            <p><strong>Result:</strong> Professional repairs completed, insurance claim supported, comprehensive documentation provided.</p>
        </div>`,
        `<div class="project-description">
            <h3>Foundation Repair - Pre-Sale Preparation</h3>
            <p>A homeowner preparing to sell their home needed foundation repairs to pass inspection and maximize property value. We completed professional repairs with full documentation for potential buyers.</p>
            <ul>
                <li>Pre-sale foundation inspection</li>
                <li>Professional crack repair and sealing</li>
                <li>Comprehensive repair documentation</li>
                <li>Warranty transfer information</li>
            </ul>
            <p><strong>Result:</strong> Foundation ready for sale, inspection passed, property value protected, documentation for buyers.</p>
        </div>`,
        `<div class="project-description">
            <h3>Foundation Crack Repair - Long-Term Maintenance</h3>
            <p>This project was part of a long-term foundation maintenance program. We performed scheduled crack repairs and preventive measures to maintain the foundation's condition over time.</p>
            <ul>
                <li>Scheduled foundation maintenance</li>
                <li>Preventive crack sealing</li>
                <li>Long-term monitoring setup</li>
                <li>Maintenance schedule recommendations</li>
            </ul>
            <p><strong>Result:</strong> Foundation maintained in excellent condition, preventive measures in place, long-term protection established.</p>
        </div>`
    ];

    folders.forEach((folder, index) => {
        const folderNum = parseInt(folder.replace(/[^0-9]/g, '')) || index + 1;
        const folderPath = path.join(publicJobsPath, folder);

        // Get all images from this folder (including subfolders)
        const folderImages = getAllImagesFromDir(folderPath, '');

        // Map images to URLs with subfolder path
        const imageUrls = folderImages.map(img => {
            const relativePath = img.relativePath || img.name;
            return `/images/jobs/${folder}/${relativePath}`;
        }).filter(url => {
            // Verify file exists
            const filePath = url.replace('/images/jobs/', '');
            const fullPath = path.join(publicJobsPath, filePath);
            return fs.existsSync(fullPath);
        });

        if (imageUrls.length > 0) {
            // Order: Before -> Injection/Mid -> After -> Others
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

            // Get unique description (cycle through available descriptions)
            const descriptionIndex = index % projectDescriptions.length;
            const description = projectDescriptions[descriptionIndex];

            worksData.push({
                title: `Foundation Repair Project #${folderNum}`,
                description: description,
                images: orderedImages,
                location: 'Edmonton, AB',
                completedAt: new Date(2024, 0, 1 + index * 15), // Spread dates throughout 2024
                featured: index < 5 // First 5 are featured
            });
        }
    });

    return worksData;
}

// Main seeding function
async function seedDatabase() {
    try {
        console.log('Starting database seeding...');

        // Clear existing data
        console.log('Clearing existing data...');
        await Service.deleteMany({});
        await BlogPost.deleteMany({});
        await Work.deleteMany({});

        // Seed Services
        console.log('Seeding services...');
        for (const serviceData of servicesData) {
            // Fix image paths in content and image field
            const fixedContent = fixImagePathsInHTML(serviceData.content);
            const fixedImage = checkImageFileExists(serviceData.image);

            const service = new Service({
                ...serviceData,
                content: fixedContent,
                image: fixedImage,
                slug: createSlug(serviceData.title)
            });
            await service.save();
            console.log(`  ✓ Created service: ${service.title}`);
        }

        // Seed Blog Posts
        console.log('Seeding blog posts...');
        for (const postData of blogPostsData) {
            // Fix image paths in content and featuredImage field
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
            console.log(`  ✓ Created blog post: ${post.title}`);
        }

        // Seed Works
        console.log('Seeding works...');
        const worksData = await getWorksData();
        for (const workData of worksData) {
            const work = new Work(workData);
            await work.save();
            console.log(`  ✓ Created work: ${work.title} (${work.images.length} images)`);
        }

        console.log('\n✅ Database seeding completed successfully!');
        console.log(`   Services: ${servicesData.length}`);
        console.log(`   Blog Posts: ${blogPostsData.length}`);
        console.log(`   Works: ${worksData.length}`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run seeding
seedDatabase();

