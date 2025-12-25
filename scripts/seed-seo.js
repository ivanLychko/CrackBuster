require('dotenv').config();
const mongoose = require('mongoose');
const SEO = require('../server/models/SEO');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crackbuster')
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// SEO data for all pages
const seoData = [
    {
        page: 'home',
        title: 'Foundation Crack Repair in Edmonton | CrackBuster',
        description: 'Professional foundation crack repair services in Edmonton, Canada. Expert solutions for basement waterproofing, foundation repair, and crack injection. Free estimates available.',
        keywords: 'foundation crack repair, edmonton, canada, basement waterproofing, foundation repair, crack injection, concrete repair',
        ogTitle: 'Foundation Crack Repair in Edmonton | CrackBuster',
        ogDescription: 'Professional foundation crack repair services in Edmonton, Canada. Expert solutions for basement waterproofing, foundation repair, and crack injection.',
        ogImage: '/images/og-image.jpg',
        twitterTitle: 'Foundation Crack Repair in Edmonton | CrackBuster',
        twitterDescription: 'Professional foundation crack repair services in Edmonton, Canada.',
        twitterImage: '/images/og-image.jpg'
    },
    {
        page: 'about-us',
        title: 'About Us - Foundation Crack Repair Experts in Edmonton | CrackBuster',
        description: 'Learn about CrackBuster - over 12 years of experience in foundation crack repair. Serving Edmonton, Sherwood Park, and St. Albert with NO DIGGING crack repair technology and lifetime guarantee.',
        keywords: 'about crackbuster, foundation repair experts, edmonton foundation repair, crack repair specialists',
        ogTitle: 'About Us - Foundation Crack Repair Experts in Edmonton | CrackBuster',
        ogDescription: 'Learn about CrackBuster - over 12 years of experience in foundation crack repair. Serving Edmonton, Sherwood Park, and St. Albert with NO DIGGING crack repair technology and lifetime guarantee.',
        ogImage: '/images/og-image.jpg',
        twitterTitle: 'About Us - Foundation Crack Repair Experts in Edmonton | CrackBuster',
        twitterDescription: 'Learn about CrackBuster - over 12 years of experience in foundation crack repair.',
        twitterImage: '/images/og-image.jpg'
    },
    {
        page: 'contact-us',
        title: 'Contact Us - Foundation Repair Experts | CrackBuster Edmonton',
        description: 'Contact CrackBuster for foundation repair services in Edmonton. Get in touch with our expert team for consultations and inquiries.',
        keywords: 'contact crackbuster, foundation repair contact, edmonton foundation repair contact',
        ogTitle: 'Contact Us - Foundation Repair Experts | CrackBuster Edmonton',
        ogDescription: 'Contact CrackBuster for foundation repair services in Edmonton. Get in touch with our expert team for consultations and inquiries.',
        ogImage: '/images/og-image.jpg',
        twitterTitle: 'Contact Us - Foundation Repair Experts | CrackBuster Edmonton',
        twitterDescription: 'Contact CrackBuster for foundation repair services in Edmonton.',
        twitterImage: '/images/og-image.jpg'
    },
    {
        page: 'get-estimate',
        title: 'Get Free Estimate - Foundation Repair | CrackBuster Edmonton',
        description: 'Get a free estimate for your foundation repair project in Edmonton. Fill out our form and we\'ll get back to you with a detailed quote.',
        keywords: 'free estimate, foundation repair estimate, edmonton foundation repair quote',
        ogTitle: 'Get Free Estimate - Foundation Repair | CrackBuster Edmonton',
        ogDescription: 'Get a free estimate for your foundation repair project in Edmonton. Fill out our form and we\'ll get back to you with a detailed quote.',
        ogImage: '/images/og-image.jpg',
        twitterTitle: 'Get Free Estimate - Foundation Repair | CrackBuster Edmonton',
        twitterDescription: 'Get a free estimate for your foundation repair project in Edmonton.',
        twitterImage: '/images/og-image.jpg'
    },
    {
        page: 'our-works',
        title: 'Our Works - Foundation Repair Projects | CrackBuster Edmonton',
        description: 'View our completed foundation repair projects in Edmonton. See examples of our quality workmanship and successful foundation repair solutions.',
        keywords: 'foundation repair projects, completed works, edmonton foundation repair examples, portfolio',
        ogTitle: 'Our Works - Foundation Repair Projects | CrackBuster Edmonton',
        ogDescription: 'View our completed foundation repair projects in Edmonton. See examples of our quality workmanship and successful foundation repair solutions.',
        ogImage: '/images/og-image.jpg',
        twitterTitle: 'Our Works - Foundation Repair Projects | CrackBuster Edmonton',
        twitterDescription: 'View our completed foundation repair projects in Edmonton.',
        twitterImage: '/images/og-image.jpg'
    },
    {
        page: 'blog',
        title: 'Foundation Repair Blog | CrackBuster Edmonton',
        description: 'Expert articles about foundation repair, basement waterproofing, and crack repair. Tips and guides from Edmonton\'s foundation repair experts.',
        keywords: 'foundation repair blog, foundation repair articles, basement waterproofing tips, crack repair guides',
        ogTitle: 'Foundation Repair Blog | CrackBuster Edmonton',
        ogDescription: 'Expert articles about foundation repair, basement waterproofing, and crack repair. Tips and guides from Edmonton\'s foundation repair experts.',
        ogImage: '/images/og-image.jpg',
        twitterTitle: 'Foundation Repair Blog | CrackBuster Edmonton',
        twitterDescription: 'Expert articles about foundation repair, basement waterproofing, and crack repair.',
        twitterImage: '/images/og-image.jpg'
    },
    {
        page: 'blog-post',
        title: 'Blog Post | CrackBuster Blog',
        description: 'Read expert articles about foundation repair, basement waterproofing, and crack repair from Edmonton\'s leading foundation repair specialists.',
        keywords: 'foundation repair, blog post, foundation repair article',
        ogTitle: 'Blog Post | CrackBuster Blog',
        ogDescription: 'Read expert articles about foundation repair, basement waterproofing, and crack repair from Edmonton\'s leading foundation repair specialists.',
        ogImage: '/images/og-image.jpg',
        twitterTitle: 'Blog Post | CrackBuster Blog',
        twitterDescription: 'Read expert articles about foundation repair from Edmonton\'s leading specialists.',
        twitterImage: '/images/og-image.jpg'
    },
    {
        page: 'service-detail',
        title: 'Service | CrackBuster',
        description: 'Professional foundation repair services in Edmonton. Expert solutions for your foundation needs.',
        keywords: 'foundation repair service, edmonton foundation services',
        ogTitle: 'Service | CrackBuster',
        ogDescription: 'Professional foundation repair services in Edmonton. Expert solutions for your foundation needs.',
        ogImage: '/images/og-image.jpg',
        twitterTitle: 'Service | CrackBuster',
        twitterDescription: 'Professional foundation repair services in Edmonton.',
        twitterImage: '/images/og-image.jpg'
    },
    {
        page: 'services',
        title: 'Our Services - Foundation Repair | CrackBuster Edmonton',
        description: 'Comprehensive foundation repair services in Edmonton. From crack injection to complete structural repair, we have the solution for your foundation needs.',
        keywords: 'foundation repair services, edmonton foundation services, crack injection services',
        ogTitle: 'Our Services - Foundation Repair | CrackBuster Edmonton',
        ogDescription: 'Comprehensive foundation repair services in Edmonton. From crack injection to complete structural repair.',
        ogImage: '/images/og-image.jpg',
        twitterTitle: 'Our Services - Foundation Repair | CrackBuster Edmonton',
        twitterDescription: 'Comprehensive foundation repair services in Edmonton.',
        twitterImage: '/images/og-image.jpg'
    },
    {
        page: '404',
        title: '404 - Page Not Found | CrackBuster',
        description: 'Oops! The page you\'re looking for has a crack in it. Let us help you find what you need.',
        keywords: '',
        ogTitle: '404 - Page Not Found | CrackBuster',
        ogDescription: 'Oops! The page you\'re looking for has a crack in it. Let us help you find what you need.',
        ogImage: '/images/og-image.jpg',
        twitterTitle: '404 - Page Not Found | CrackBuster',
        twitterDescription: 'Oops! The page you\'re looking for has a crack in it.',
        twitterImage: '/images/og-image.jpg',
        robots: 'noindex, nofollow'
    }
];

// Seed SEO data
async function seedSEO() {
    try {
        console.log('Starting SEO seed...');

        for (const seoItem of seoData) {
            // Check if SEO already exists
            const existing = await SEO.findOne({ page: seoItem.page });
            
            if (existing) {
                // Update existing SEO
                Object.assign(existing, seoItem);
                await existing.save();
                console.log(`✓ Updated SEO for page: ${seoItem.page}`);
            } else {
                // Create new SEO
                await SEO.create(seoItem);
                console.log(`✓ Created SEO for page: ${seoItem.page}`);
            }
        }

        console.log('\n✅ SEO seed completed successfully!');
        console.log(`Total pages: ${seoData.length}`);
    } catch (error) {
        console.error('❌ Error seeding SEO:', error);
        throw error;
    }
}

// Run seed
seedSEO()
    .then(() => {
        console.log('Closing MongoDB connection...');
        mongoose.connection.close();
        process.exit(0);
    })
    .catch((error) => {
        console.error('Seed failed:', error);
        mongoose.connection.close();
        process.exit(1);
    });



