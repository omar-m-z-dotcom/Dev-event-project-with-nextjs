'use server';

import { Event } from '@/database/event.model';
import connectDB from '@/lib/mongodb';

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();

        // Find the target event by slug
        const event = await Event.findOne({ slug });

        if (!event) {
            return [];
        }

        // Find events that:
        // 1. Are not the same event (different _id)
        // 2. Have at least one tag in common with the target event
        const similarEvents = await Event.find({
            _id: { $ne: event._id },
            tags: { $in: event.tags },
        })
            .limit(6) // Limit to 6 similar events
            .lean();

        // Convert to plain objects for client-side use
        return similarEvents.map((event) => ({
            ...event,
            _id: event._id.toString(),
        }));
    } catch (error) {
        console.error('Error fetching similar events:', error);
        return [];
    }
};
