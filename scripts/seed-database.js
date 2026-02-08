require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Service = require('../server/models/Service');
const BlogPost = require('../server/models/BlogPost');
const Work = require('../server/models/Work');
const SEO = require('../server/models/SEO');

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
    const basePath = publicPath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    const baseUrl = imagePath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');

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

// Services data - loaded from docx-extracted JSON (data/services-seed-data.json)
const servicesDataPath = path.join(__dirname, '../data/services-seed-data.json');
const servicesData = fs.existsSync(servicesDataPath)
    ? JSON.parse(fs.readFileSync(servicesDataPath, 'utf8'))
    : [];

// Blog posts data - Generated from real content  
const blogPostsData = [
        {
                "title": "How a Basement Is Built",
                "excerpt": "How A Basement Is Built    Excavation  In order to set the basement below ground, a large pit is dug using a large track hoe. There is no standard dep...",
                "content": "<div class=\"blog-intro\">\n        <p>In order to set the basement below ground, a large pit is dug using a large track hoe. There is no standard depth, instead it is determined on a per job basis by the engineer. </p>\n    </div><p>At the base of the excavation, a footing, a short and fairly wide base for the concrete foundation walls to be placed on, is formed along the perimeter. This simple form consists of lumber, into which concrete, reinforced with steel rebar, is poured and allowed to cure.</p><p>Large lumber form boards are set standing in place on top of the footing to outline the perimeter of the house. Once these forms are squared and leveled, steel rebar is woven throughout the empty space inside the forms. Finally, concrete is poured into the forms and given time to set. Once ready, the forms are then stripped leaving only the concrete structure to which the house is then framed on top of.</p>",
                "featuredImage": "/images/stock/1000_F_218645986_sbD58xe5jAXVjvKYRHwUMZzmKiyg1BZk - Copy.webp",
                "published": true,
                "publishedAt": "2024-01-01T07:00:00.000Z"
        },
        {
                "title": "Basement Insulation",
                "excerpt": "Basement Insulation  Insulating your basement in an effective manner helps maintain the right temperature under all weather conditions. It also helps...",
                "content": "<div class=\"blog-intro\">\n        <p>Insulating your basement in an effective manner helps maintain the right temperature under all weather conditions. It also helps in maintaining the right level of humidity in your home. It contributes a great deal towards conservation of electricity especially when you use air conditioners. In short, insulation helps in cutting down on your power bills. There are various types of materials used for basement insulation such as blanket bat and roll, concrete block, foam board, glass fiber, rock wool, perlite, silicate compounds and so on. The type of insulation you use for the basement depends upon the temperature required for your home to help withstand all weather conditions. There are three methods of heat transference. In the first method, the heat is directly transferred from mass to mass, which is known as conduction. In the second method, the heat is transferred from one space to another space, which is called convection. In the third method, the warm object transmits heat to a cooler object/area, which is known as radiation. Basement insulation done correctly will decrease the convection and radiation of heat transfer by minimizing the solid conduction, which in turn helps your home stay cool during the warm weather conditions and warm during winters.</p>\n    </div>",
                "featuredImage": "/images/stock/229861-5d13b0a3b85b6_yo2 - Copy.webp",
                "published": true,
                "publishedAt": "2024-01-02T07:00:00.000Z"
        },
        {
                "title": "Can Crack Injections Be Used on All Cracks",
                "excerpt": "Can Crack Injections Be Used on All Cracks?  It is possible to use crack injections only on poured concrete walls. To repair these cracks, the entire...",
                "content": "<div class=\"blog-intro\">\n        <p>Can Crack Injections Be Used on All Cracks?</p>\n    </div><p>It is possible to use crack injections only on poured concrete walls. To repair these cracks, the entire depth and length of the crack, from inside to outside, is filled up by the viscous, expanding liquid injected into them. Crack injections are extremely effective in eliminating leakage of water on a permanent basis.</p><p>Cinder block walls on the other hand, have hollow core, making it practically impossible to fill sufficiently. In this case, the wall must be waterproofed from outside. The ground will be excavated down to the footing, a flexible, waterproof membrane applied, then Delta wrap, then the ground backfilled and tamped down.</p><p>Often, one will notice cracks in the above-grade parging around the house. As parging is only a thin layer of cement applied to the foundation above grade, cracking is common, and periodic maintenance is necessary. Injection repairs, however, are not appropriate unless the crack extends below grade, past the parging.</p><p>Floor cracks in the slab are also not good candidates for injection repairs as there is often a cavity below slab, making it difficult, if not impossible, to secure a seal on the outside of slab. The only way a slab/floor crack is going to leak is if one has a problem with hydrostatic pressure. If the water table is higher than the slab, it will push up against the bottom of the slab. As concrete is porous, the pressure created will cause water to push right up to the surface. Sump pumps(s) and weeping tile are the correct ways to deal with this issue.</p>",
                "featuredImage": "/images/stock/Cement with Crack - Copy.webp",
                "published": true,
                "publishedAt": "2024-01-03T07:00:00.000Z"
        },
        {
                "title": "Cost-Effective Foundation Maintenance",
                "excerpt": "Cost-Effective Foundation Maintenance  Basement leakage can happen for several reasons including thermal contraction and expansion, shrinkage, natural...",
                "content": "<div class=\"blog-intro\">\n        <p>Cost-Effective Foundation Maintenance</p>\n    </div><p>Basement leakage can happen for several reasons including thermal contraction and expansion, shrinkage, natural calamities, inferior quality or deterioration of material used for waterproofing. Vertical cracks in your foundation are normal and may not necessarily leak if grade and eavestroughing are well maintained. By periodically checking for little problems, it is possible to avoid bigger problems, protect the property value, and ensure enhanced home safety. It is indeed fortunate that foundation problems do not arise all of a sudden and spread quickly. It develops gradually over a period of time giving us ample time to inspect, identify, and repair.</p><p>Periodic checks can prevent major expenses in future. Vertical cracks do not affect the structural integrity of the building. However, it is in your interest to avoid water seepage into the basement and accompanying health related problems, not to mention property damage. Those living in your home could develop conditions such as allergies and asthma attacks, due to mold and mildew formation in damp environments. Cracks should be repaired immediately if you find them allowing water seepage into the building.</p><p>Usually, a building inspector identifies moisture by checking for rusted heaters and steel port base, damp wall base, mildew in carpets, peeling of floor tiles, a white powdery substance called efflorescence on the concrete, decay, discoloration or stains on the wooden panelling, posts, partitions and drywall, moss growth, improper water grading, rain gutter damage, condensation on concrete and windows and a musty smell.</p><p>Periodically check your foundation to find any visible cracks or leaks in the concrete. There are methods with which it is possible to check for transmission of moisture through concrete. The easiest method is to cut a square piece of plastic foil or sheeting and place it on the area to be tested. Use duct tape to seal the edges and leave it for a couple of days. If you find damp spots or water droplets in the plastic, then you can be sure there is moisture in the concrete. It is then time to start looking for cracks and call in experts to fill them.</p><h2>If you locate a horizontal crack that runs through the found</h2><p>If you locate a horizontal crack that runs through the foundation along the basement length, this usually indicates a major problem where the foundation is unable to bear the weight of the soil surrounding it. The crack is a result of huge lateral pressure applied on the foundation by the soil. When bowing of the wall (deflection) is observed, immediate structural reinforcement is recommended. On a regular basis therefore, be sure to check for straightness of foundation wall by sighting it down, repair minor cracks with foundation crack injections and check for proper grading of soil.</p><p>Please see our article titled Waterproofing for further tips about preventative maintenance.</p>",
                "featuredImage": "/images/stock/ChatGPT Image Oct 19, 2025, 03_42_23 PM - Copy.webp",
                "published": true,
                "publishedAt": "2024-02-04T07:00:00.000Z"
        },
        {
                "title": "Epoxy Crack Injection",
                "excerpt": "Epoxy Crack Injection  A horizontal crack in the basement wall represents a structural problem with the foundation. Epoxy crack injection is one metho...",
                "content": "<div class=\"blog-intro\">\n        <p>A horizontal crack in the basement wall represents a structural problem with the foundation. Epoxy crack injection is one method by which one can stop water leakage and repair the wall. Some of the advantages of repairing foundation cracks with epoxy crack injections include:</p>\n    </div><p>Epoxy Injections structurally repair the concrete</p><p>Epoxies are much stronger compared to concrete</p><p>Injecting epoxies from the inside of the building repairs cracks on the basement wall. Epoxies are in a liquid form and made of two components that are mixed even as it is injected into the crack. When the components mix, they cure and form a strong and durable material that reinforces the wall. As compared to concrete, epoxies are highly tensile and strong and have high compression.</p><p>The process of injecting epoxy into the cracks is quite simple. A special paste is used to attach plastic injection ports are every six to twelve inches. The special surface paste is then applied to the other parts of the crack after attaching the ports. This ensures that during the hardening process, epoxy is retained in the crack.</p><h2>The third step is the actual injection of epoxy into the cra</h2><p>The third step is the actual injection of epoxy into the crack. Starting from the lowest port, epoxy is injected throughout the crack. The epoxy cartridge is inserted into the port after attaching a mixer to it. Upon injecting, the epoxy flows right up to the outer surface of the crack. All ports are injected and the epoxy is left to cure. It takes an average of seven days for epoxies to cure and completely harden.</p>",
                "featuredImage": "/images/stock/Google Review - Copy.webp",
                "published": true,
                "publishedAt": "2024-02-05T07:00:00.000Z"
        },
        {
                "title": "Grading and Drainage",
                "excerpt": "Grading and Drainage    The best way to keep one’s basement dry is to not allow water to accumulate near the foundation in the first place. Shoveling...",
                "content": "<div class=\"blog-intro\">\n        <p>The best way to keep one’s basement dry is to not allow water to accumulate near the foundation in the first place. Shoveling snow away from the walls of one’s house is one easy way to avoid Spring flooding. Beyond that though, one needs to consider grading and drainage in the landscaping.</p>\n    </div><p>All eavestroughing should be directed well away from the home, and in such a way that water will not simply just roll back toward the foundation. Check periodically to make sure no deficiencies have arisen which may allow water to drain right beside the house. If enough water is allowed to accumulate beside the house, it will eventually find a way in, whether there are cracks in the foundation or not. Even tie-rods (snap ties) can rust and leak, and every house has many!</p><p>The ground outside the house should be sloped down 10% for every two metres away from foundation. This is called positive grade. If the ground is sloped down toward the house instead of away from it, it is called negative grade, and is a sure way to invite water into the basement.</p><p>The grade should end at a swale. One will often notice in new neighbourhoods a sort of sharp valley between homes. This low point is called the swale and it is designed to carry run-off from both homes away to the street’s gutter. If the adjacent property’s landscaping does not allow for a shared swale, an internal side-lot swale must be created, with the same aim of directing surface drainage away from home and toward a city right of way. The swale should have a minimum slope of 1.5%, minimum depth of 10 cm, and minimum width of 15 cm.</p>",
                "featuredImage": "/images/stock/Hydrostatic-Pressure-Diagram for horizontal crack - Copy.webp",
                "published": true,
                "publishedAt": "2024-02-06T07:00:00.000Z"
        },
        {
                "title": "Mold and Mildew Prevention",
                "excerpt": "Mold and Mildew Prevention  Mold and its early form mildew are types of fungus that can form anywhere that moisture is present. Generally, molds aren’...",
                "content": "<div class=\"blog-intro\">\n        <p>Mold and its early form mildew are types of fungus that can form anywhere that moisture is present. Generally, molds aren’t bad, but they contribute to the natural breakdown of things in nature, they are used in antibiotics, and some of them, like mushrooms, are even tasty. However, mold and mildew in your home cause bad odors, poor air quality and damage to the surfaces they grow on. Mold can be harmful to your family’s health by irritating conditions like allergies and asthma and may contribute to respiratory infections. The key to mold prevention is to reduce sources of moisture in your home.</p>\n    </div><p>Preventing mold is much easier than removing it. Some simple steps can be taken to help mold proof your home. Gutters and air conditioning drip pans should be kept clean, unobstructed and in good repair to prevent water intrusion in the home. Sloping the ground away from the foundation of the house will prevent water from collecting and possibly entering though un-repaired foundation cracks or un-waterproofed surfaces. Always repair foundation cracks and leaks in your roof, windows or doors as soon as possible. The longer an area stays wet, the more likely mold or mildew will begin to form so you should always clean up spills or leaks as soon as possible. Drying out an area within 48 hours typically prevents mold from beginning to grow.</p><p>Humidity and condensation both create moisture in your home and can contribute to mold growth but both are simple to control. If possible, air conditioning units should be set to maintain the indoor humidity below 60 percent. If your AC unit doesn’t have a humidity setting a dehumidifier can be used to obtain the same result. Insulating cold surfaces like cold water pipes will prevent condensation from forming on them and nearby surfaces. Whenever using appliances like dryers and heaters that can produce moisture exhaust fans or vents should be used to vent the humidity outside of the home. Decorative fans like ceiling fans contribute to the beauty of your home and prevent moisture buildup by increasing air movement.</p><p>If an area has remained wet for more than 48 hours mold may have started to form even if no spots are visible. You can prevent mold growth from becoming a problem by cleaning the area with soap and water, a bleach solution of one cup bleach to one gallon (3.8L) of water, or by purchasing a commercial cleaner designed to remove mold. .</p>",
                "featuredImage": "/images/stock/Identifying-Different-Types-of-Foundation-Cracks - Copy.webp",
                "published": true,
                "publishedAt": "2024-03-07T07:00:00.000Z"
        },
        {
                "title": "Polyurethane Injection of Vertical Foundation Cracks",
                "excerpt": "Polyurethane Injection of Vertical Foundation Cracks  A vertical crack in one’s foundation wall does not represent a structural concern. Any poured co...",
                "content": "<div class=\"blog-intro\">\n        <p>Polyurethane Injection of Vertical Foundation Cracks</p>\n    </div><p>A vertical crack in one’s foundation wall does not represent a structural concern. Any poured concrete foundation more than a year old will have vertical cracks, typically caused by the initial settling of the house. Polyurethane (PU) injections, done correctly, can permanently stop water from entering the crack. Advantages of using PU crack injections to repair foundation cracks are as follows:</p><p>Will effectively stop water from leaking into the basement</p><p>Holes are drilled directly on top of the crack, all the way through the wall to the soil outside. This will allow the PU, once injected, to seal on the outside of the wall, which is absolutely critical. Any injection that does not seal the crack at the outside will ultimately fail, and is often described as “a fancy bandage.”</p><p>Injection ports are then installed, high pressure backflush cleans a path for the PU to expand into at the back (outside) of the crack, and the PU injected with a simple dual cartridge caulking gun. The PU will expand 5 to 10 times, filling the crack and sealing it outside, resulting in a permanent repair.</p>",
                "featuredImage": "/images/stock/OIP - Copy.webp",
                "published": true,
                "publishedAt": "2024-03-08T07:00:00.000Z"
        },
        {
                "title": "Real Estate Investments",
                "excerpt": "Foundation Cracks: Real Estate Investments and Insurance Coverage  One of the most frightening phrases a homeowner, buyer or seller can hear is “damag...",
                "content": "<div class=\"blog-intro\">\n        <p>Foundation Cracks: Real Estate Investments and Insurance Coverage</p>\n    </div><p>One of the most frightening phrases a homeowner, buyer or seller can hear is “damaged foundation,” but it doesn’t have to be. How a cracked foundation or other foundation damage will affect your investment depends on several factors. Here are some things to consider.</p><p>Buyers: Often, people seeking to purchase a home will immediately remove a prospective property from their list if there is foundation damage. Before you walk away, get more information.</p><p>What will it cost to repair the damage?</p><p>Is the seller willing to have the foundation fixed or to lower the cost of the property to cover the cost of repair?</p><h2>Depending on the answers to these questions, the property ma</h2><p>Depending on the answers to these questions, the property may still be a good investment. As long as it can be repaired, a damaged foundation can reduce competition for the property and give you room to negotiate a price reduction which can cover repair costs.</p><p>Keep in mind that the integrity of your property can have an impact on whether you can get a home loan and what your rates will be if you do. Some mortgage companies will require that the foundation repair is done before the property is financed or that a more substantial down payment is made. Before making your decision, you should be sure to have a professional foundation repair company inspect the damage.</p><p>Sellers: If you are trying to sell your home and you know that there are foundation issues, you might ask yourself, “should I repair it before I sell?” The answer to that question is, “it depends.” Ask yourself this:</p><p>Are you willing to accept a lower price to cover foundation repair costs?</p><h2> Are you willing to pay to repair the foundation damage</h2><p>Are you willing to pay to repair the foundation damage?</p><p>How many prospective buyers do you want to view your home?</p><p>Whether or not you have the foundation repaired before you sell, you will have to disclose the damage to your real estate agent and prospective buyers. Keep in mind that some buyers may have a hard time financing a home with a cracked or damaged foundation.</p><p>If you choose to repair the damaged foundation before you put your home on the market be sure to hire a qualified professional foundation repair company that will honor their warranty after the sale. It can be an additional selling point when negotiating with buyers.</p><h2>Insurance: Whether you have a cracked foundation or more ext</h2><p>Insurance: Whether you have a cracked foundation or more extensive foundation damage it is up to the individual insurance company if they will cover your property and how much your coverage will cost. To determine if your home can be insured speak to your insurance agent and be sure to have a report of the damage from a professional foundation repair company to show the limit or extent of the damage.</p><p>If you are already insured and you discover damage to your foundation chances are your insurance company will not cover the cost of repair. Insurance is intended to cover damages caused by accidents or natural disasters. Keeping your foundation in good repair is considered standard home maintenance and is not typically included in your home coverage.</p>",
                "featuredImage": "/images/stock/Screenshot 2025-10-18 000428 - Copy.webp",
                "published": true,
                "publishedAt": "2024-03-09T07:00:00.000Z"
        },
        {
                "title": "Settlement",
                "excerpt": "Settlement  There is always a degree of settlement involved in any building project. Settling may be caused by faulty mechanics during the building pr...",
                "content": "<div class=\"blog-intro\">\n        <p>There is always a degree of settlement involved in any building project. Settling may be caused by faulty mechanics during the building process (improper mixing of the concrete, curing the concrete too rapidly, premature backfilling against the foundation, etc.). More often, however, it has to do with the soil conditions at the site—especially directly underneath the footings. Any time soil is disturbed—as it is in the excavation process—there will always be adjustment until the soil comes to a new stable configuration. Anyone who has played in a sandbox knows that it makes a big difference whether or not you pack the sand tightly in the pail before turning it over. In a similar way, soil needs to be compacted at the time the foundation footing is laid. Sometimes, even properly compacted soil can develop voids. If a foundation is laid over soil which contains significant organic material, the organic material can decay, leaving pockets in the soil.</p>\n    </div><p>Most settlement problems stem from extremes in moisture conditions under the footings. If the movement of water through the soil under the foundation is not uniform, isolated shifts can occur in the soil supporting the footings. Supporting soil can be eroded out from under footings by water movement. Moisture can collect unevenly beneath the footings, and the wet regions could be subject to frost heaves. Because some degree of settlement always occurs, there are always some stresses on the foundation. These stresses due to settlement often cause cracks in the foundation, but not all cracks that develop in the foundation are due to settlement.</p><p>Fortunately, cracks that result from foundation settlement are often easily recognized and dealt with. Prior to building, you can minimize settlement by studying the building site, testing the soil, and properly planning excavation for the foundation. But what about after you’ve built? Chances are, you’re not dealing with a “Leaning Tower of Pisa” and there are effective steps you can take to address the results of settlement on your existing foundation.</p>",
                "featuredImage": "/images/stock/Screenshot 2025-10-18 000647 - Copy.webp",
                "published": true,
                "publishedAt": "2024-04-10T06:00:00.000Z"
        },
        {
                "title": "Shrinkage Cracks",
                "excerpt": "Shrinkage Cracks  Almost every home that has a concrete basement faces the problem of dealing with foundation cracks at some time or another. Cracks m...",
                "content": "<div class=\"blog-intro\">\n        <p>Almost every home that has a concrete basement faces the problem of dealing with foundation cracks at some time or another. Cracks may occur due to various problems, one of the most common being the shrinkage in volume of the concrete as it cures. As the surface of the concrete is exposed to air, water will evaporate at a faster rate than the deeper concrete, causing particles to pull together and stress the surface. Usually, shrinkage cracks will not be vertically continuous, and exist only on the surface.</p>\n    </div><p>Sometimes however, when the basement window corners crack, rainwater enters the crack and runs down through it till there is a narrowing of the crack. This forces the water to enter the basement wall interior face.</p>",
                "featuredImage": "/images/stock/Screenshot 2025-10-18 000706 - Copy.webp",
                "published": true,
                "publishedAt": "2024-04-11T06:00:00.000Z"
        },
        {
                "title": "The Facts About Radon Mitigation",
                "excerpt": "The Facts About Radon Mitigation  Radon is a colorless, tasteless, odorless gas that forms in nature when uranium in the soil breaks down and it is kn...",
                "content": "<div class=\"blog-intro\">\n        <p>The Facts About Radon Mitigation</p>\n    </div><p>Radon is a colorless, tasteless, odorless gas that forms in nature when uranium in the soil breaks down and it is known to be one of the leading causes of lung cancer. The prevention of radon in your home, and the identification and removal of radon that is already present, is essential to the health of your family. Fortunately, it is easy to prevent, detect, and mitigate radon in the home.</p><p>The best way to protect your family from radon is prevention. Radon can be found anywhere in the house, but it often builds up in unhealthy levels in low lying enclosed spaces like basements. The most common way for radon to enter your home is through openings such as poorly sealed sump pumps or cracks in the foundation and through porous construction materials that aren’t properly sealed. To prevent radon from entering your home be sure that all vents, pumps and other intentional openings have proper seals to allow water or exhaust to escape without permitting outside radon contamination. All surfaces should have adequate waterproofing and foundation crack repair should be tended to immediately.</p><p>Even if you believe your home to be safe from radon contamination, it is recommended that you test your home every two years. Quality home tests can be purchased at your local home improvement store, or you can call a local radon testing and mitigation company to perform a professional inspection in your home. If radon is detected don’t worry, there are ways to remove radon and restore your homes air quality.</p><p>The best way to mitigate radon in your home depends on several factors such as the condition and layout of the building, and the type of soil beneath it. When the air pressure in your home is lower than that in the soil, radon seeps in through cracks and openings. To ensure effective removal of radon, consult a radon mitigation specialist. They will evaluate your situation and suggest the most appropriate action. Using correctly installed ventilation systems can ensure regulation of air pressure, as well as constant circulation between inside and outside air to optimize air quality. Covering exposed earth in crawl spaces or basements and the timely repair of foundation cracks will prevent new radon build up. You should always consult a professional to repair foundation cracks properly.</p>",
                "featuredImage": "/images/stock/Screenshot 2025-10-18 000755 - Copy.webp",
                "published": true,
                "publishedAt": "2024-04-12T06:00:00.000Z"
        },
        {
                "title": "Tips on Maintaining Indoor Air Quality",
                "excerpt": "Tips on Maintaining Indoor Air Quality  Many people think they only have to worry about air pollution outside, but the air in homes and other building...",
                "content": "<div class=\"blog-intro\">\n        <p>Tips on Maintaining Indoor Air Quality</p>\n    </div><p>Many people think they only have to worry about air pollution outside, but the air in homes and other buildings can become polluted as well. Illness from poor air quality in buildings is so common that there is even a term for it, sick building syndrome, and it leads to respiratory ailments, headaches, fatigue, and other health issues. It is important to maintain healthy air quality in your home and other buildings, and it’s also easy. Air quality can be controlled through knowledge, source control, ventilation, and filtration.</p><p>Discover It: It is important to know the quality of the air you breathe. Even if the air seems okay, there may be toxins present that can damage your health. Purchase a monitoring system from your local home improvement store or call a licensed professional to test your home’s air quality.</p><p>Don’t Deny It: Although radon has no odour, other potential contaminates do. If something smells bad, it probably is bad. Don’t just cover up bad odours with candles and sprays. Find the source and remove it.</p><p>Doormats: Eliminating the source of pollutants in your home or building is essential to maintaining your air quality. Doormats aren’t only for decoration; they also prevent dirt and other contaminates from entering a building. Placing two doormats at each entrance, one inside the door and one outside, will significantly reduce contaminates.</p><h2>Vacuums: No matter how careful you are, you can’t keep all p</h2><p>Vacuums: No matter how careful you are, you can’t keep all pollutants out of your building. Be sure to vacuum carpets, floors, and upholstery twice a week using a high powered vacuum with a HEPA filter.</p><p>Mopping: Even the best vacuum will leave some behind some particles. Always follow up by mopping hard surfaces like tile floors. A simple damp mop can be used to pick up remaining dust and particles.</p><p>Moisture Control: Keeping the humidity in your home under 60% will help prevent mold. Be sure to clean your dehumidifier regularly, or it can develop pollutants of its own which can harm rather than improve your air quality. Repair foundation cracks, and leaking doors and windows as soon as they are noticed and make sure all porous surfaces like concrete basement floors are adequately waterproofed and maintained.</p><p>Work Outside: Projects that use chemicals like glues, paints, and thinners can damage your building’s air quality. So can activities like sanding, cutting, and drilling. Always work outside in a well-ventilated area. Working inside can’t always be avoided when this is the case be sure to clean up quickly and thoroughly.</p><h2>Wash: Wash all of your bedding including comforters weekly t</h2><p>Wash: Wash all of your bedding including comforters weekly to reduce allergens and dust mites, and to remove any pollutants you may have inadvertently carried in on your clothing.</p><p>Windows: While it is true that the air outside contains contaminates and pollutants it is likely that the enclosed space of your building has a lower air quality than the air outside. When the weather is nice, open your windows to let in a little fresh air. Be mindful of your allergies though! Consider the season and what is blooming outside when deciding if you should open your windows.</p><p>Exhaust: Be sure to install exhaust fans that vent to the outside of the building on appliances like dryers and stoves, and in areas like the bathroom where moisture and fumes from cleaning products can build up. Leave the exhaust fan running for at least 30 minutes to allow contaminates and moisture from building up and harming your air quality.</p><p>Filters: Make sure that the filters in your air conditioning and heating units are changed regularly to reduce dust and other particles in your air. Ion generators and electrostatic filtration systems can be added to the existing system to increase the buildings air quality. If you are using these types of systems be sure they are certified as low ozone.</p>",
                "featuredImage": "/images/stock/Screenshot 2025-10-18 001030 - Copy.webp",
                "published": true,
                "publishedAt": "2024-05-13T06:00:00.000Z"
        },
        {
                "title": "Types of Foundation Cracks and Assessment",
                "excerpt": "Types of Foundation Cracks and Assessment  Visible crack on outside parging: Parging is a thin layer of cement over the outside of the foundation wall...",
                "content": "<div class=\"blog-intro\">\n        <p>Types of Foundation Cracks and Assessment</p>\n    </div><p>Visible crack on outside parging: Parging is a thin layer of cement over the outside of the foundation wall, serving a mainly aesthetic function. As the concrete of the foundation wall itself will expand and contract with temperature fluctuation, and shift due to settling, this thin parge coat will crack and flake off over time. Therefore, parging cracks are not necessarily something to panic about. If the crack is consistently vertical, dig down a little bit and see if the crack continues below the parging.</p><p>Visible vertical crack in foundation wall: If a vertical crack is visible on the inside foundation (concrete) wall, or outside below the parging, it is still not yet time to panic, but take note. Vertical cracks are normal (one would be hard pressed to find a basement more than a year old without at least one or two), caused by the natural settling of the house, and if the grade and eavestroughing are correct and well maintained, may never leak. Look for drip stains, dirt on the wall, or a white fuzzy/chalky substance known as efflorescence. All of these are signs of water entry and repair is indicated. Please give our office a call and we will come out to do a free estimate.</p><p>Significant cracks visible outside where either the garage or steps meet the foundation of the house: These can sometimes look bad but do not usually represent cracks in the actual foundation. Garages and steps leading into one’s house are not usually sunk into the ground the way the basement is. For the sake of aesthetics, it is common practice to parge over so as to give the illusion that it is all one connected piece. Since they are in fact actually two separate pieces, they will settle differently, causing the parging to flake off, and making it look as though there is a crack when really there is not. No need to panic.</p><p>Horizontal crack visible on inside wall: This is a very serious issue. A horizontal crack will typically run from one end of the wall to the other and is caused by lateral pressure being exerted against the wall, causing it to buckle along the crack. Reinforcement is required. Please contact our office for an appointment ASAP.</p>",
                "featuredImage": "/images/stock/Screenshot 2025-10-18 012728 - Copy.webp",
                "published": true,
                "publishedAt": "2024-05-14T06:00:00.000Z"
        },
        {
                "title": "Why Is My Basement Leaking",
                "excerpt": "Why Is My Basement Leaking?  Most modern basements are finished with drywall and carpeting, making it all the more upsetting when water comes in. Unfo...",
                "content": "<div class=\"blog-intro\">\n        <p>Most modern basements are finished with drywall and carpeting, making it all the more upsetting when water comes in. Unfortunately, though finishing the basement is attractive and increases functionality, it also hides leakage/seepage problems until they become severe. There are many potential causes of these problems, and ultimately, the only way to know for sure is to remove drywall and insulation to expose the concrete wall.</p>\n    </div><p>Faulty Plumbing: Once the drywall has been removed, check for any plumbing in the vicinity and look for leaks before stressing about the foundation.</p><p>Condensation: If the portion of the basement wall above the freeze line is insufficiently insulated, temperature difference between outside and inside can create condensation, sometimes even leading to ice build-up inside. If the source of leakage is above-grade, and nothing to do with faulty plumbing, condensation is almost certainly the cause.</p><p>Poor Grading and Drainage: The best way to keep water out of one’s basement is to not let it near the house in the first place. The ground around the house should be sloped down away from the house, towards a swale (low point), further directing run-off away from home. Eaves should be checked for leaks, and placed well away from house. It is also a good idea to shovel snow away from walls. If a great deal of water is allowed to collect around foundation, it is likely to find a way in.</p><p>Foundation Cracks: All foundations have cracks. If water is allowed to accumulate around foundation, cracks will leak.</p><h2>Honeycombing: If the concrete of the foundation is insuffici</h2><p>Honeycombing: If the concrete of the foundation is insufficiently vibrated while being poured, a poor ratio of cement to gravel may occur, resulting in a “pebbly” look we call honeycombing, which can potentially leak.</p><p>Tie-Rods/Snap-Ties: After the concrete is poured for one’s foundation, excess rebar is snapped off and patched outside. Sometimes these patches can fail, causing the tie-rod to rust and allow water entry.</p><p>Hydrostatic Pressure: If the water table is higher than the slab of the basement floor, water will push through the slab from below. This is a problem that must be corrected with sump pump(s) and weeping tile.</p><p>Besides the inconvenience, leaky basements can also create health concerns and should be addressed ASAP.</p><h2>Foundation cracks, honeycombing, and tie-rods can all be fix</h2><p>Foundation cracks, honeycombing, and tie-rods can all be fixed with Crack Buster’s injection repair. Please contact our office for a free estimate.</p>",
                "featuredImage": "/images/stock/Screenshot 2025-10-18 012756 - Copy.webp",
                "published": true,
                "publishedAt": "2024-05-15T06:00:00.000Z"
        },
        {
                "title": "Why Repair Cracks",
                "excerpt": "Why Repair Cracks  Horizontal cracks in one’s foundation are caused by lateral pressure and must be reinforced in order to preserve the structural int...",
                "content": "<div class=\"blog-intro\">\n        <p>Horizontal cracks in one’s foundation are caused by lateral pressure and must be reinforced in order to preserve the structural integrity of the foundation.</p>\n    </div><p>There are, however, important reasons for repairing cracks even when they do not indicate significant structural damage. The main objective is to prevent water from entering the basement.</p><p>There are several ways in which water can damage basements. Continuous movement of water over concrete can lead to its deterioration. Once concrete has begun to deteriorate, the damage can accelerate, ultimately compromising the integrity of the foundation.</p><p>The presence of water in a basement can also create a health hazard. The moist environment is conducive to mildew and mold growth. Mold spores are always present in the air but require moisture to grow. The cool, damp basement is an ideal environment for molds to flourish. Once mold becomes established it can affect the air quality, triggering allergies or more severe reactions.</p><p>Leakage of water into the basement makes the space less functional. The high humidity can be harmful to stored items such as papers or clothing, and it can make the environment unsatisfactory for working or recreation. From a financial standpoint, a wet basement detracts from the value of a home. Repairing foundation cracks to prevent water seepage is a sound investment in the structural safety, occupant health, and usefulness of a home.</p>",
                "featuredImage": "/images/stock/Screenshot 2025-10-18 165338 - Copy.webp",
                "published": true,
                "publishedAt": "2024-06-16T06:00:00.000Z"
        }
];

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
        `<p>Professional foundation crack repair completed using polyurethane injection. The crack was sealed from inside, preventing water infiltration permanently.</p>`,
        `<p>Comprehensive foundation repair including crack injection and structural reinforcement. All work completed with lifetime warranty.</p>`,
        `<p>Basement waterproofing and crack repair project. Multiple cracks were sealed using advanced injection techniques.</p>`,
        `<p>Foundation repair project involving epoxy injection for structural cracks. The repair restored the foundation's integrity.</p>`,
        `<p>Complete basement waterproofing solution including crack repairs and drainage improvements.</p>`
    ];

    folders.forEach((folder, index) => {
        const folderNum = parseInt(folder.replace(/[^0-9]/g, '')) || index + 1;
        const folderPath = path.join(publicJobsPath, folder);
        const folderImages = getAllImagesFromDir(folderPath, '');
        const imageUrls = folderImages.map(img => {
            const relativePath = img.relativePath || img.name;
            return `/images/jobs/${folder}/${relativePath}`;
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
                title: `Foundation Repair Project #${folderNum}`,
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

// SEO data for all pages (stored in DB, editable in Admin)
const seoData = [
    { page: 'home', title: 'Foundation Crack Repair in Edmonton | CrackBuster', description: 'Professional foundation crack repair services in Edmonton, Canada. Expert solutions for basement waterproofing, foundation repair, and crack injection. Free estimates available.', keywords: 'foundation crack repair, edmonton, canada, basement waterproofing, foundation repair, crack injection, concrete repair', ogTitle: 'Foundation Crack Repair in Edmonton | CrackBuster', ogDescription: 'Professional foundation crack repair services in Edmonton, Canada. Expert solutions for basement waterproofing, foundation repair, and crack injection.', ogImage: '/images/og-image.webp', twitterTitle: 'Foundation Crack Repair in Edmonton | CrackBuster', twitterDescription: 'Professional foundation crack repair services in Edmonton, Canada.', twitterImage: '/images/og-image.webp' },
    { page: 'about-us', title: 'About Us - Foundation Crack Repair Experts in Edmonton | CrackBuster', description: 'Learn about CrackBuster - over 17 years of experience in foundation crack repair. Serving Edmonton, Sherwood Park, and St. Albert with no-digging crack repair technology and lifetime guarantee.', keywords: 'about crackbuster, foundation repair experts, edmonton foundation repair, crack repair specialists', ogTitle: 'About Us - Foundation Crack Repair Experts in Edmonton | CrackBuster', ogDescription: 'Learn about CrackBuster - over 17 years of experience in foundation crack repair. Serving Edmonton, Sherwood Park, and St. Albert.', ogImage: '/images/og-image.webp', twitterTitle: 'About Us - Foundation Crack Repair Experts in Edmonton | CrackBuster', twitterDescription: 'Learn about CrackBuster - over 17 years of experience in foundation crack repair.', twitterImage: '/images/og-image.webp' },
    { page: 'contact-us', title: 'Contact Us - Foundation Repair Experts | CrackBuster Edmonton', description: 'Contact CrackBuster for foundation repair services in Edmonton. Get in touch with our expert team for consultations and inquiries.', keywords: 'contact crackbuster, foundation repair contact, edmonton foundation repair contact', ogTitle: 'Contact Us - Foundation Repair Experts | CrackBuster Edmonton', ogDescription: 'Contact CrackBuster for foundation repair services in Edmonton. Get in touch with our expert team for consultations and inquiries.', ogImage: '/images/og-image.webp', twitterTitle: 'Contact Us - Foundation Repair Experts | CrackBuster Edmonton', twitterDescription: 'Contact CrackBuster for foundation repair services in Edmonton.', twitterImage: '/images/og-image.webp' },
    { page: 'get-estimate', title: 'Get Free Estimate - Foundation Repair | CrackBuster Edmonton', description: 'Get a free estimate for your foundation repair project in Edmonton. Fill out our form and we\'ll get back to you with a detailed quote.', keywords: 'free estimate, foundation repair estimate, edmonton foundation repair quote', ogTitle: 'Get Free Estimate - Foundation Repair | CrackBuster Edmonton', ogDescription: 'Get a free estimate for your foundation repair project in Edmonton. Fill out our form and we\'ll get back to you with a detailed quote.', ogImage: '/images/og-image.webp', twitterTitle: 'Get Free Estimate - Foundation Repair | CrackBuster Edmonton', twitterDescription: 'Get a free estimate for your foundation repair project in Edmonton.', twitterImage: '/images/og-image.webp' },
    { page: 'our-works', title: 'Our Work & Gallery - Real Results | CrackBuster Edmonton', description: 'View our completed foundation repair projects in Edmonton. See examples of our quality workmanship and successful foundation repair solutions.', keywords: 'foundation repair projects, completed works, edmonton foundation repair examples, portfolio', ogTitle: 'Our Work & Gallery - Real Results | CrackBuster Edmonton', ogDescription: 'View our completed foundation repair projects in Edmonton. See examples of our quality workmanship and successful foundation repair solutions.', ogImage: '/images/og-image.webp', twitterTitle: 'Our Work & Gallery - Real Results | CrackBuster Edmonton', twitterDescription: 'View our completed foundation repair projects in Edmonton.', twitterImage: '/images/og-image.webp' },
    { page: 'blog', title: 'Foundation Repair Blog | CrackBuster Edmonton', description: 'Expert articles about foundation repair, basement waterproofing, and crack repair. Tips and guides from Edmonton\'s foundation repair experts.', keywords: 'foundation repair blog, foundation repair articles, basement waterproofing tips, crack repair guides', ogTitle: 'Foundation Repair Blog | CrackBuster Edmonton', ogDescription: 'Expert articles about foundation repair, basement waterproofing, and crack repair. Tips and guides from Edmonton\'s foundation repair experts.', ogImage: '/images/og-image.webp', twitterTitle: 'Foundation Repair Blog | CrackBuster Edmonton', twitterDescription: 'Expert articles about foundation repair, basement waterproofing, and crack repair.', twitterImage: '/images/og-image.webp' },
    { page: 'blog-post', title: 'Blog Post | CrackBuster Blog', description: 'Read expert articles about foundation repair, basement waterproofing, and crack repair from Edmonton\'s leading foundation repair specialists.', keywords: 'foundation repair, blog post, foundation repair article', ogTitle: 'Blog Post | CrackBuster Blog', ogDescription: 'Read expert articles about foundation repair, basement waterproofing, and crack repair from Edmonton\'s leading foundation repair specialists.', ogImage: '/images/og-image.webp', twitterTitle: 'Blog Post | CrackBuster Blog', twitterDescription: 'Read expert articles about foundation repair from Edmonton\'s leading specialists.', twitterImage: '/images/og-image.webp' },
    { page: 'service-detail', title: 'Service | CrackBuster', description: 'Professional foundation repair services in Edmonton. Expert solutions for your foundation needs.', keywords: 'foundation repair service, edmonton foundation services', ogTitle: 'Service | CrackBuster', ogDescription: 'Professional foundation repair services in Edmonton. Expert solutions for your foundation needs.', ogImage: '/images/og-image.webp', twitterTitle: 'Service | CrackBuster', twitterDescription: 'Professional foundation repair services in Edmonton.', twitterImage: '/images/og-image.webp' },
    { page: 'services', title: 'Our Services - Foundation Repair | CrackBuster Edmonton', description: 'Comprehensive foundation repair services in Edmonton. From crack injection to complete structural repair, we have the solution for your foundation needs.', keywords: 'foundation repair services, edmonton foundation services, crack injection services', ogTitle: 'Our Services - Foundation Repair | CrackBuster Edmonton', ogDescription: 'Comprehensive foundation repair services in Edmonton. From crack injection to complete structural repair.', ogImage: '/images/og-image.webp', twitterTitle: 'Our Services - Foundation Repair | CrackBuster Edmonton', twitterDescription: 'Comprehensive foundation repair services in Edmonton.', twitterImage: '/images/og-image.webp' },
    { page: '404', title: '404 - Page Not Found | CrackBuster', description: 'Oops! The page you\'re looking for has a crack in it. Let us help you find what you need.', keywords: '', ogTitle: '404 - Page Not Found | CrackBuster', ogDescription: 'Oops! The page you\'re looking for has a crack in it. Let us help you find what you need.', ogImage: '/images/og-image.webp', twitterTitle: '404 - Page Not Found | CrackBuster', twitterDescription: 'Oops! The page you\'re looking for has a crack in it.', twitterImage: '/images/og-image.webp', robots: 'noindex, nofollow' }
];

async function seedSEO() {
    const publicImagesPath = path.join(__dirname, '../client/public/images');
    if (!fs.existsSync(publicImagesPath)) {
        fs.mkdirSync(publicImagesPath, { recursive: true });
        fs.writeFileSync(path.join(publicImagesPath, 'README.txt'), 'Add og-image.webp (1200×630 px) here for social sharing (Open Graph / Twitter).\n');
        console.log('  Created client/public/images (add og-image.webp 1200×630 for social sharing)');
    }
    for (const item of seoData) {
        const existing = await SEO.findOne({ page: item.page });
        if (existing) {
            Object.assign(existing, item);
            await existing.save();
            console.log(`  ✓ Updated SEO: ${item.page}`);
        } else {
            await SEO.create(item);
            console.log(`  ✓ Created SEO: ${item.page}`);
        }
    }
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
            const fixedImages = (serviceData.images || []).map(img => checkImageFileExists(img));

            const service = new Service({
                ...serviceData,
                content: fixedContent,
                image: fixedImage,
                images: fixedImages,
                slug: serviceData.slug || createSlug(serviceData.title)
            });
            await service.save();
            console.log(`  ✓ Created service: ${service.title}`);
        }

        console.log('Seeding blog posts...');
        for (const postData of blogPostsData) {
            const fixedContent = fixImagePathsInHTML(postData.content);
            const slug = createSlug(postData.title);
            const featuredImagePath = `/images/blog/${slug}/hero.webp`;

            const post = new BlogPost({
                ...postData,
                content: fixedContent,
                featuredImage: featuredImagePath,
                slug
            });
            await post.save();
            console.log(`  ✓ Created blog post: ${post.title}`);
        }

        console.log('Seeding works...');
        const worksData = await getWorksData();
        for (const workData of worksData) {
            const work = new Work(workData);
            await work.save();
            console.log(`  ✓ Created work: ${work.title} (${work.images.length} images)`);
        }

        console.log('Seeding SEO (page meta, OG, Twitter)...');
        await seedSEO();

        console.log('\n✅ Database seeding completed successfully!');
        console.log(`   Services: ${servicesData.length}`);
        console.log(`   Blog Posts: ${blogPostsData.length}`);
        console.log(`   Works: ${worksData.length}`);
        console.log(`   SEO: ${seoData.length} pages`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run seeding
seedDatabase();
