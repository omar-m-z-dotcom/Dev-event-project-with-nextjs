import mongoose, { Mongoose } from 'mongoose';

/**
 * Cached MongoDB connection
 * 
 * This variable stores the Mongoose connection instance to prevent
 * creating multiple connections during development when Next.js hot-reloads.
 * In production, this ensures we reuse the same connection across requests.
 */
let cached: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
} = {
    conn: null,
    promise: null,
};

/**
 * Establishes a connection to MongoDB using Mongoose
 * 
 * This function implements connection caching to prevent multiple connections
 * during development hot-reloads and ensures efficient connection reuse in production.
 * 
 * @returns Promise<Mongoose> - The Mongoose connection instance
 * @throws Error if MONGODB_URI environment variable is not set
 */
async function connectDB(): Promise<Mongoose> {
    // Get MongoDB URI from environment variables
    const MONGODB_URI: string | undefined = process.env.MONGODB_URI;

    // Validate that MONGODB_URI is set
    if (!MONGODB_URI) {
        throw new Error(
            'Please define the MONGODB_URI environment variable inside .env.local'
        );
    }

    // If we already have a cached connection, return it immediately
    if (cached.conn) {
        return cached.conn;
    }

    // If we don't have a connection promise, create one
    if (!cached.promise) {
        // Configure connection options
        const opts: mongoose.ConnectOptions = {
            bufferCommands: false, // Disable mongoose buffering for better error handling
        };

        // Create connection promise
        // Note: In development, Next.js may call this function multiple times
        // due to hot-reloading, so we cache the promise to prevent multiple connections
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance: Mongoose) => {
            // Once connected, store the connection in the cache
            cached.conn = mongooseInstance;
            return mongooseInstance;
        });
    }

    // Wait for the connection to be established
    try {
        cached.conn = await cached.promise;
    } catch (error: unknown) {
        // If connection fails, clear the promise cache so we can retry
        cached.promise = null;

        // Re-throw the error with a more descriptive message
        if (error instanceof Error) {
            throw new Error(`Failed to connect to MongoDB: ${error.message}`);
        }
        throw new Error('Failed to connect to MongoDB: Unknown error');
    }

    return cached.conn;
}

/**
 * Disconnects from MongoDB and clears the connection cache
 * 
 * Useful for cleanup operations or when you need to force a new connection.
 * In most cases, you won't need to call this manually as Mongoose handles
 * connection lifecycle automatically.
 */
async function disconnectDB(): Promise<void> {
    if (cached.conn) {
        await mongoose.disconnect();
        cached.conn = null;
        cached.promise = null;
    }
}

// Export the connection function and disconnect utility
export { connectDB, disconnectDB };
export default connectDB;

