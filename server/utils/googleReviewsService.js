const GoogleReview = require('../models/GoogleReview');
const GoogleReviewSettings = require('../models/GoogleReviewSettings');

/**
 * Fetches and syncs reviews from an external JSON endpoint: { place, reviews[] }
 */
class GoogleReviewsService {
    /**
     * Import reviews from feed URL.
     * Expected JSON: { place: { name, placeId, address, rating, user_ratings_total, type }, reviews: [ { author_name, rating, text, time, iso_date, images? } ] }
     */
    async importFromFeedUrl(feedUrl) {
        if (!feedUrl || typeof feedUrl !== 'string' || !feedUrl.trim()) {
            throw new Error('Reviews feed URL is required.');
        }
        const url = feedUrl.trim();
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch reviews: HTTP ${response.status}`);
        }
        const data = await response.json();
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response: expected JSON object.');
        }
        const reviews = Array.isArray(data.reviews) ? data.reviews : [];
        const placeName = (data.place && data.place.name) ? data.place.name : '';

        if (reviews.length === 0) {
            throw new Error('No reviews in feed. Expected JSON with "reviews" array.');
        }

        const mapped = reviews.map((r, index) => {
            const reviewTime = r.iso_date ? new Date(r.iso_date) : (r.time ? new Date(r.time) : new Date());
            return {
                reviewId: (data.place && data.place.placeId) ? `${data.place.placeId}-${index}` : `feed-${index}-${Date.now()}`,
                authorName: r.author_name || 'Anonymous',
                authorPhoto: '',
                authorUrl: '',
                rating: typeof r.rating === 'number' ? r.rating : parseInt(r.rating, 10) || 5,
                text: r.text || '',
                reviewTime,
                images: Array.isArray(r.images) ? r.images : [],
                originalData: { ...r, place: data.place }
            };
        });

        return { reviews: mapped, placeName };
    }

    /**
     * Sync reviews from the configured feed URL (JSON: { place, reviews[] }).
     */
    async syncReviews() {
        console.log('[Google Reviews Sync] Starting...');
        try {
            const settings = await GoogleReviewSettings.getSettings();
            const feedUrl = (settings.reviewsFeedUrl || '').trim();
            if (!feedUrl) {
                throw new Error('Please set the reviews feed URL in settings (SEO → Google Reviews).');
            }

            settings.syncStatus = 'syncing';
            settings.lastSyncError = '';
            await settings.save();

            let reviewsData;
            try {
                reviewsData = await this.importFromFeedUrl(settings.reviewsFeedUrl);
            } catch (feedError) {
                settings.syncStatus = 'error';
                settings.lastSyncError = feedError.message;
                await settings.save();
                throw feedError;
            }

            if (!reviewsData.reviews || reviewsData.reviews.length === 0) {
                const err = new Error('No reviews in response (expected JSON with "reviews" array).');
                settings.syncStatus = 'error';
                settings.lastSyncError = err.message;
                await settings.save();
                throw err;
            }

            let savedCount = 0;
            let updatedCount = 0;
            for (let i = 0; i < reviewsData.reviews.length; i++) {
                const reviewData = reviewsData.reviews[i];
                const textSnippet = (reviewData.text || '').substring(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                let existingReview = await GoogleReview.findOne({
                    $or: [
                        { reviewId: reviewData.reviewId },
                        ...(textSnippet ? [{ authorName: reviewData.authorName, text: { $regex: textSnippet, $options: 'i' } }] : [])
                    ]
                });
                if (existingReview) {
                    Object.assign(existingReview, { ...reviewData, lastSynced: new Date(), active: true });
                    await existingReview.save();
                    updatedCount++;
                } else {
                    await new GoogleReview({ ...reviewData, lastSynced: new Date() }).save();
                    savedCount++;
                }
            }

            settings.syncStatus = 'success';
            settings.lastSynced = new Date();
            settings.lastSyncError = '';
            await settings.save();

            return {
                success: true,
                message: `Synced: ${savedCount} new, ${updatedCount} updated`,
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
}

module.exports = new GoogleReviewsService();

