# CrackBuster - Foundation Crack Repair Website

A professional foundation crack repair website for Edmonton, Canada, built with React, Node.js Express, and MongoDB. The application features server-side rendering (SSR) for optimal SEO performance.

## Tech Stack

- **Frontend**: React 18, React Router, React Helmet Async
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Build Tool**: Webpack
- **Styling**: SCSS
- **SEO**: Server-Side Rendering, Sitemap, Robots.txt, Structured Data

## Features

- ✅ Server-Side Rendering (SSR) for search engine optimization
- ✅ All pages: Home, About Us, Services, Blog, Our Works, Get Estimate, Contact Us
- ✅ SEO optimized with meta tags, structured data, and sitemap
- ✅ Responsive design
- ✅ MongoDB integration for dynamic content
- ✅ Contact and estimate form submissions

## Project Structure

```
CrackBuster/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       └── styles/         # SCSS styles
├── server/                 # Express backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── index.js           # Server entry point
├── data/                  # Static assets and documents
└── dist/                  # Build output (generated)
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)

3. Start MongoDB (if running locally):
```bash
mongod
```

## Development

Run both client and server in development mode:
```bash
npm run dev
```

Or run separately:
```bash
npm run dev:server  # Express server on port 3000
npm run dev:client  # Webpack dev server on port 3001
```

## Production Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Pages

- `/` - Home page
- `/about-us` - About Us
- `/services` - Services listing
- `/services/:slug` - Service detail page
- `/blog` - Blog listing
- `/blog/:slug` - Blog post detail
- `/our-works` - Portfolio/Projects
- `/get-estimate` - Estimate request form
- `/contact-us` - Contact form

## SEO Features

- Server-side rendering for search engine crawlers
- Dynamic sitemap generation (`/sitemap.xml`) with lastmod dates
- Robots.txt (`/robots.txt`)
- Comprehensive meta tags on all pages:
  - Title and description tags
  - Open Graph tags (Facebook, LinkedIn)
  - Twitter Card tags
  - Canonical URLs (dynamic based on current domain)
- Structured data (JSON-LD):
  - LocalBusiness schema on homepage
  - Service schema on service pages
  - BlogPosting schema on blog posts
  - AboutPage, ContactPage schemas
- SEO-optimized images with proper alt attributes
- Proper robots meta tags (noindex for 404 pages)

## MongoDB Models

- **BlogPost**: Blog articles
- **Service**: Service offerings
- **Work**: Completed projects
- **Contact**: Contact and estimate submissions

## Environment Variables

- `PORT`: Server port
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)

## License

ISC




