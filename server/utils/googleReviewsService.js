const GoogleReview = require('../models/GoogleReview');
const GoogleReviewSettings = require('../models/GoogleReviewSettings');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Fetch reviews from Google Maps using Place ID
 * Supports both Google Places API and web scraping methods
 */
class GoogleReviewsService {
    /**
     * Fetch reviews using Google Places API (official method)
     * Requires API key and Place ID
     */
    async fetchReviewsWithAPI(placeId, apiKey) {
        try {
            if (!placeId) {
                throw new Error('Place ID is required');
            }

            if (!apiKey) {
                throw new Error('Google API Key is required for Places API method');
            }

            // Use Google Places API Details endpoint
            const url = `https://maps.googleapis.com/maps/api/place/details/json`;
            const params = {
                place_id: placeId,
                fields: 'name,rating,user_ratings_total,reviews,place_id',
                key: apiKey,
                language: 'en'
            };

            const queryString = new URLSearchParams(params).toString();
            const fullUrl = `${url}?${queryString}`;
            const response = await fetch(fullUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Handle different API response statuses
            if (data.status === 'ZERO_RESULTS') {
                throw new Error('Place ID not found. Please verify your Place ID is correct.');
            }

            if (data.status === 'REQUEST_DENIED') {
                throw new Error(`API request denied: ${data.error_message || 'Invalid API key or API key does not have Places API enabled. Please check your API key and enable Places API in Google Cloud Console.'}`);
            }

            if (data.status === 'INVALID_REQUEST') {
                throw new Error(`Invalid request: ${data.error_message || 'Please check your Place ID format.'}`);
            }

            if (data.status === 'OVER_QUERY_LIMIT') {
                throw new Error('API quota exceeded. Please check your Google Cloud billing and quota limits.');
            }

            if (data.status !== 'OK') {
                throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
            }

            if (!data.result) {
                throw new Error('No result returned from Google Places API. Please verify your Place ID.');
            }

            // Check if place exists but has no reviews
            if (!data.result.reviews || data.result.reviews.length === 0) {
                const placeName = data.result.name || 'This place';
                throw new Error(`${placeName} has no reviews available. Reviews may be disabled for this location or the place may not have any reviews yet.`);
            }

            const reviews = data.result.reviews.map(review => ({
                reviewId: review.author_url ? review.author_url.split('/').pop() : '',
                authorName: review.author_name || 'Anonymous',
                authorPhoto: review.profile_photo_url || '',
                authorUrl: review.author_url || '',
                rating: review.rating || 0,
                text: review.text || '',
                reviewTime: review.time ? new Date(review.time * 1000) : new Date(),
                originalData: review
            }));

            return { reviews, placeName: data.result.name || '' };
        } catch (error) {
            console.error('Error fetching reviews with API:', error);
            throw error;
        }
    }

    /**
     * Helper function to delay execution (to avoid rate limiting)
     */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Fetch reviews using Puppeteer (headless browser)
     * Using exact working code from user
     */
    async fetchReviewsWithScraping(placeId, maxScrolls = 20) {
       throw "Not implemented";
       
    }

    /**
     * Sync reviews from Google Maps
     * Tries API method first, falls back to scraping if API key not available
     */
    async syncReviews() {
        console.log('[Google Reviews Sync] Starting sync process...');
        try {
            const settings = await GoogleReviewSettings.getSettings();
            console.log('[Google Reviews Sync] Settings loaded:', {
                placeId: settings.placeId ? 'Set' : 'Not set',
                hasApiKey: !!settings.apiKey,
                enabled: settings.enabled
            });

            if (!settings.placeId) {
                console.error('[Google Reviews Sync] Place ID is not configured');
                throw new Error('Place ID is not configured. Please set it in SEO settings.');
            }

            // Update sync status
            console.log('[Google Reviews Sync] Updating sync status to "syncing"...');
            settings.syncStatus = 'syncing';
            settings.lastSyncError = '';
            await settings.save();
            console.log('[Google Reviews Sync] Sync status updated');

            let reviewsData;

            // Try API method if API key is available
            if (settings.apiKey) {
                console.log('[Google Reviews Sync] Using API method...');
                try {
                    reviewsData = await this.fetchReviewsWithAPI(settings.placeId, settings.apiKey);
                    console.log('[Google Reviews Sync] API method succeeded, got', reviewsData.reviews?.length || 0, 'reviews');
                } catch (apiError) {
                    console.error('[Google Reviews Sync] API method failed:', apiError.message);
                    // Only fallback to scraping for certain errors, not for invalid Place ID
                    if (apiError.message.includes('Place ID not found') ||
                        apiError.message.includes('has no reviews')) {
                        // Don't try scraping for these errors - they're definitive
                        console.error('[Google Reviews Sync] API error is definitive, not trying scraping');
                        throw apiError;
                    }
                    // For other API errors, try scraping as fallback
                    console.log('[Google Reviews Sync] Falling back to scraping method...');
                    try {
                        reviewsData = await this.fetchReviewsWithScraping(settings.placeId);
                        console.log('[Google Reviews Sync] Scraping method succeeded, got', reviewsData.reviews?.length || 0, 'reviews');
                    } catch (scrapingError) {
                        console.error('[Google Reviews Sync] Scraping method also failed:', scrapingError.message);
                        // If scraping also fails, throw the original API error as it's more informative
                        throw apiError;
                    }
                }
            } else {
                // Use scraping method if no API key
                console.log('[Google Reviews Sync] No API key, using scraping method...');
                reviewsData = await this.fetchReviewsWithScraping(settings.placeId);
                console.log('[Google Reviews Sync] Scraping method succeeded, got', reviewsData.reviews?.length || 0, 'reviews');
            }

            if (!reviewsData.reviews || reviewsData.reviews.length === 0) {
                console.error('[Google Reviews Sync] No reviews found in response');
                // Provide more helpful error message
                let errorMessage = 'No reviews found. ';
                if (settings.apiKey) {
                    errorMessage += 'The API returned no reviews. This could mean:\n';
                    errorMessage += '1. The Place ID is incorrect\n';
                    errorMessage += '2. The place has no reviews\n';
                    errorMessage += '3. The API key does not have proper permissions';
                } else {
                    errorMessage += 'Scraping method could not extract reviews. Please:\n';
                    errorMessage += '1. Verify your Place ID is correct\n';
                    errorMessage += '2. Consider using Google Places API with an API key for better results';
                }
                throw new Error(errorMessage);
            }

            console.log(`[Google Reviews Sync] Processing ${reviewsData.reviews.length} reviews...`);
            // Save or update reviews
            let savedCount = 0;
            let updatedCount = 0;

            for (let i = 0; i < reviewsData.reviews.length; i++) {
                const reviewData = reviewsData.reviews[i];
                if (i % 10 === 0) {
                    console.log(`[Google Reviews Sync] Processing review ${i + 1}/${reviewsData.reviews.length}...`);
                }
                // Try to find existing review by reviewId or authorName + text
                let existingReview = null;

                if (reviewData.reviewId) {
                    existingReview = await GoogleReview.findOne({ reviewId: reviewData.reviewId });
                }

                if (!existingReview && reviewData.text) {
                    // Try to find by author name and text (first 100 chars)
                    const textSnippet = reviewData.text.substring(0, 100);
                    existingReview = await GoogleReview.findOne({
                        authorName: reviewData.authorName,
                        text: { $regex: textSnippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
                    });
                }

                if (existingReview) {
                    // Update existing review
                    Object.assign(existingReview, {
                        ...reviewData,
                        lastSynced: new Date(),
                        active: true
                    });
                    await existingReview.save();
                    updatedCount++;
                } else {
                    // Create new review
                    const newReview = new GoogleReview({
                        ...reviewData,
                        lastSynced: new Date()
                    });
                    await newReview.save();
                    savedCount++;
                }
            }

            console.log(`[Google Reviews Sync] Saved ${savedCount} new reviews, updated ${updatedCount} existing reviews`);

            // Update settings
            console.log('[Google Reviews Sync] Updating sync status to "success"...');
            settings.syncStatus = 'success';
            settings.lastSynced = new Date();
            settings.lastSyncError = '';
            await settings.save();
            console.log('[Google Reviews Sync] Sync completed successfully');

            return {
                success: true,
                message: `Synced ${savedCount} new reviews and updated ${updatedCount} existing reviews`,
                savedCount,
                updatedCount,
                totalReviews: reviewsData.reviews.length
            };
        } catch (error) {
            console.error('[Google Reviews Sync] Error syncing reviews:', error);
            console.error('[Google Reviews Sync] Error stack:', error.stack);

            // Update settings with error
            const settings = await GoogleReviewSettings.getSettings();
            settings.syncStatus = 'error';
            settings.lastSyncError = error.message;
            await settings.save();
            console.error('[Google Reviews Sync] Sync status updated to "error"');

            throw error;
        }
    }

    /**
     * Get active reviews for display
     */
    async getActiveReviews(limit = 5) {
        return await GoogleReview.getActiveReviews(limit);
    }

    /**
     * Validate Place ID and API key
     * Returns place information if valid
     */
    async validatePlaceId(placeId, apiKey) {
        try {
            if (!placeId) {
                throw new Error('Place ID is required');
            }

            if (!apiKey) {
                return {
                    valid: false,
                    message: 'API key is required for validation. Please provide your Google Places API key.'
                };
            }

            const url = `https://maps.googleapis.com/maps/api/place/details/json`;
            const params = {
                place_id: placeId,
                fields: 'name,rating,user_ratings_total,reviews,place_id,formatted_address',
                key: apiKey,
                language: 'en'
            };

            const queryString = new URLSearchParams(params).toString();
            const fullUrl = `${url}?${queryString}`;
            const response = await fetch(fullUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'ZERO_RESULTS') {
                return {
                    valid: false,
                    message: 'Place ID not found. Please verify your Place ID is correct.'
                };
            }

            if (data.status === 'REQUEST_DENIED') {
                return {
                    valid: false,
                    message: `API request denied: ${data.error_message || 'Invalid API key or API key does not have Places API enabled. Please check your API key and enable Places API in Google Cloud Console.'}`
                };
            }

            if (data.status === 'INVALID_REQUEST') {
                return {
                    valid: false,
                    message: `Invalid request: ${data.error_message || 'Please check your Place ID format.'}`
                };
            }

            if (data.status !== 'OK') {
                return {
                    valid: false,
                    message: `Error: ${data.status} - ${data.error_message || 'Unknown error'}`
                };
            }

            if (!data.result) {
                return {
                    valid: false,
                    message: 'No result returned from Google Places API.'
                };
            }

            const place = data.result;
            const reviewCount = place.reviews ? place.reviews.length : 0;
            const totalRatings = place.user_ratings_total || 0;

            return {
                valid: true,
                place: {
                    name: place.name || 'Unknown',
                    address: place.formatted_address || 'No address',
                    rating: place.rating || 0,
                    totalRatings: totalRatings,
                    reviewCount: reviewCount
                },
                message: `Found: ${place.name || 'Place'}. ${totalRatings} total ratings, ${reviewCount} reviews available.`
            };
        } catch (error) {
            return {
                valid: false,
                message: `Validation error: ${error.message}`
            };
        }
    }
}

module.exports = new GoogleReviewsService();

