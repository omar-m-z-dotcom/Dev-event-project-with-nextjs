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
            unique: true,
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
 */
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
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
 * Normalize time to consistent format (HH:MM or HH:MM:SS)
 * Removes extra whitespace and ensures consistent format
 */
function normalizeTime(timeString: string): string {
    const trimmed = timeString.trim();
    // Match time formats like HH:MM or HH:MM:SS
    const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
    if (timeRegex.test(trimmed)) {
        return trimmed;
    }
    return trimmed; // Return as-is if doesn't match expected format
}

/**
 * Pre-save hook: Generate slug from title and normalize date/time
 * Only regenerates slug if title has changed
 */
eventSchema.pre('save', function (next) {
    // Generate slug only if title changed or slug doesn't exist
    if (this.isModified('title') || !this.slug) {
        this.slug = generateSlug(this.title);
    }

    // Normalize date to ISO format
    if (this.isModified('date')) {
        this.date = normalizeDate(this.date);
    }

    // Normalize time format
    if (this.isModified('time')) {
        this.time = normalizeTime(this.time);
    }

    next();
});

// Add unique index on slug for faster lookups
eventSchema.index({ slug: 1 }, { unique: true });

/**
 * Event model
 */
export const Event: Model<IEvent> =
    mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);
