import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Interface for Event document
 */
export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Event schema with validation and pre-save hooks
 */
const eventSchema = new Schema<IEvent>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            validate: {
                validator: (value: string) => value.trim().length > 0,
                message: 'Title cannot be empty',
            },
        },
        slug: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            validate: {
                validator: (value: string) => value.trim().length > 0,
                message: 'Description cannot be empty',
            },
        },
        overview: {
            type: String,
            required: [true, 'Overview is required'],
            trim: true,
            validate: {
                validator: (value: string) => value.trim().length > 0,
                message: 'Overview cannot be empty',
            },
        },
        image: {
            type: String,
            required: [true, 'Image is required'],
            trim: true,
            validate: {
                validator: (value: string) => value.trim().length > 0,
                message: 'Image cannot be empty',
            },
        },
        venue: {
            type: String,
            required: [true, 'Venue is required'],
            trim: true,
            validate: {
                validator: (value: string) => value.trim().length > 0,
                message: 'Venue cannot be empty',
            },
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
            validate: {
                validator: (value: string) => value.trim().length > 0,
                message: 'Location cannot be empty',
            },
        },
        date: {
            type: String,
            required: [true, 'Date is required'],
            trim: true,
        },
        time: {
            type: String,
            required: [true, 'Time is required'],
            trim: true,
            validate: {
                validator: (value: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value),
                message: 'Time must be in HH:mm 24-hour format',
            },
        },
        mode: {
            type: String,
            required: [true, 'Mode is required'],
            trim: true,
            validate: {
                validator: (value: string) => value.trim().length > 0,
                message: 'Mode cannot be empty',
            },
        },
        audience: {
            type: String,
            required: [true, 'Audience is required'],
            trim: true,
            validate: {
                validator: (value: string) => value.trim().length > 0,
                message: 'Audience cannot be empty',
            },
        },
        agenda: {
            type: [String],
            required: [true, 'Agenda is required'],
            validate: {
                validator: (value: string[]) => Array.isArray(value) && value.length > 0,
                message: 'Agenda must be a non-empty array',
            },
        },
        organizer: {
            type: String,
            required: [true, 'Organizer is required'],
            trim: true,
            validate: {
                validator: (value: string) => value.trim().length > 0,
                message: 'Organizer cannot be empty',
            },
        },
        tags: {
            type: [String],
            required: [true, 'Tags is required'],
            validate: {
                validator: (value: string[]) => Array.isArray(value) && value.length > 0,
                message: 'Tags must be a non-empty array',
            },
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

/**
 * Generate URL-friendly slug from title
 * Converts to lowercase, replaces spaces and special chars with hyphens
 * Ensures uniqueness by appending a numeric suffix if needed
 * Handles empty slugs by creating a fallback with timestamp
 */
async function generateUniqueSlug(
    title: string,
    eventModel: Model<IEvent>,
    excludeId?: string
): Promise<string> {
    let baseSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    // If slug is empty after sanitization, create a fallback with timestamp
    if (!baseSlug) {
        // Generate a URL-safe timestamp-based fallback
        const timestamp = Date.now().toString(36); // Base36 encoding for shorter string
        baseSlug = `untitled-${timestamp}`;
    }

    let slug = baseSlug;
    let suffix = 1;

    // Check for existing slugs, excluding current document if updating
    while (true) {
        const query: { slug: string; _id?: { $ne: string } } = { slug };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const exists = await eventModel.exists(query);
        if (!exists) {
            break;
        }
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
    }

    return slug;
}

/**
 * Normalize date to ISO format
 * Accepts various date formats and converts to YYYY-MM-DD
 */
function normalizeDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch {
        // If parsing fails, return original string trimmed
        return dateString.trim();
    }
}

/**
 * Normalize time to consistent format (HH:mm)
 * Pads hours to 2 digits and ensures consistent format
 * Note: Consider using a dedicated date library (e.g., date-fns or dayjs) for more robust parsing
 */
function normalizeTime(timeString: string): string {
    const trimmed = timeString.trim();
    // Match time formats like H:MM, HH:MM, H:MM:SS, or HH:MM:SS
    const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
    const match = trimmed.match(timeRegex);

    if (match) {
        // Extract hours and minutes
        const hours = match[1].padStart(2, '0'); // Pad to 2 digits
        const minutes = match[2]; // Already 2 digits from regex
        // Return in HH:mm format (drop seconds for consistency)
        return `${hours}:${minutes}`;
    }

    // If format doesn't match, return trimmed as fallback
    // Validation will catch invalid formats if schema validation is enabled
    return trimmed;
}

/**
 * Pre-save hook: Generate slug from title and normalize date/time
 * Only regenerates slug if title has changed
 * Handles slug collisions by appending numeric suffixes
 */
eventSchema.pre('save', async function (next) {
    try {
        // Generate unique slug only if title changed or slug doesn't exist
        if (this.isModified('title') || !this.slug) {
            const excludeId = this._id ? this._id.toString() : undefined;
            // Get the Event model using this.model() which is available in document middleware
            const EventModel = this.constructor as Model<IEvent>;
            this.slug = await generateUniqueSlug(this.title, EventModel, excludeId);
        }

        // Normalize date to ISO format
        if (this.isModified('date')) {
            this.date = normalizeDate(this.date);
        }

        // Normalize time format (ensures HH:mm format)
        if (this.isModified('time')) {
            this.time = normalizeTime(this.time);
        }

        next();
    } catch (error) {
        next(error instanceof Error ? error : new Error('Failed to generate unique slug'));
    }
});

// Add unique index on slug for faster lookups
eventSchema.index({ slug: 1 }, { unique: true });

/**
 * Event model
 */
export const Event: Model<IEvent> =
    mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);
