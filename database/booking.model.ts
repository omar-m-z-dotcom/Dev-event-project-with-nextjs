import mongoose, { Schema, Model, Document, Types } from 'mongoose';
import { Event } from './event.model';

/**
 * Interface for Booking document
 */
export interface IBooking extends Document {
    eventId: Types.ObjectId;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Booking schema with validation and pre-save hooks
 */
const bookingSchema = new Schema<IBooking>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Event ID is required'],
            index: true, // Index for faster queries
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            validate: {
                validator: (value: string) => {
                    // Email validation regex
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(value);
                },
                message: 'Email must be a valid email address',
            },
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

/**
 * Pre-save hook: Validate that the referenced event exists
 * Throws an error if eventId doesn't correspond to an existing Event
 * 
 * Note: This validation adds a database query for every booking save.
 * For better performance during bulk operations, consider moving this
 * validation to the service or controller layer where bookings are created.
 */
bookingSchema.pre('save', async function (next) {
    try {
        // Check if event exists in database
        const event = await Event.findById(this.eventId);
        if (!event) {
            throw new Error(`Event with ID ${this.eventId} does not exist`);
        }
        next();
    } catch (error) {
        if (error instanceof Error) {
            next(error);
        } else {
            next(new Error('Failed to validate event reference'));
        }
    }
});

/**
 * Booking model
 */
export const Booking: Model<IBooking> =
    mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);
