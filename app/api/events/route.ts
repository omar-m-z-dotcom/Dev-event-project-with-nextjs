import { NextRequest, NextResponse } from 'next/server';
import { Event, IEvent } from '@/database';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/lib/mongodb';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        // Convert formData entries to a plain object
        let eventData: Partial<IEvent>;
        try {
            const entries = formData.entries();
            eventData = Object.fromEntries(entries) as Partial<IEvent>;
        } catch (e) {
            return NextResponse.json(
                { message: 'Invalid data format' },
                { status: 400 }
            );
        }

        // Helper function to clean unwanted characters from array items
        const cleanArrayItem = (item: string): string => {
            return item
                .replace(/[\[\]]/g, '') // Remove brackets [ ]
                .replace(/["']/g, '') // Remove quotes " and '
                .trim();
        };

        // Process array fields (agenda, tags) - formData sends values as strings
        const agendaValue = (eventData as any).agenda;
        if (typeof agendaValue === 'string') {
            eventData.agenda = agendaValue
                .split(',')
                .map((item: string) => cleanArrayItem(item))
                .filter((item: string) => item.length > 0);
        } else if (!Array.isArray(agendaValue)) {
            eventData.agenda = [];
        } else if (Array.isArray(agendaValue)) {
            // Clean existing array items
            eventData.agenda = agendaValue
                .map((item: string) => cleanArrayItem(String(item)))
                .filter((item: string) => item.length > 0);
        }

        const tagsValue = (eventData as any).tags;
        if (typeof tagsValue === 'string') {
            eventData.tags = tagsValue
                .split(',')
                .map((item: string) => cleanArrayItem(item))
                .filter((item: string) => item.length > 0);
        } else if (!Array.isArray(tagsValue)) {
            eventData.tags = [];
        } else if (Array.isArray(tagsValue)) {
            // Clean existing array items
            eventData.tags = tagsValue
                .map((item: string) => cleanArrayItem(String(item)))
                .filter((item: string) => item.length > 0);
        }

        // Process image file upload to Cloudinary
        const file = formData.get('image') as File;
        if (!file) {
            return NextResponse.json(
                { message: 'Image file is required' },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    { resource_type: 'image', folder: 'DevEvent' },
                    (error, results) => {
                        if (error) return reject(error);
                        resolve(results);
                    }
                )
                .end(buffer);
        });

        eventData.image = (uploadResult as { secure_url: string }).secure_url;

        // Create a new Event document
        // Pre-save hooks will handle slug generation, date/time normalization, and validation
        const newEvent = new Event(eventData);

        // Save the event to the database
        await newEvent.save();

        // Return success response with created event
        return NextResponse.json(
            { message: 'Event created successfully', event: newEvent },
            { status: 201 }
        );
    } catch (e: unknown) {
        console.error('Event Creation Error:', e);

        // Handle Mongoose validation errors
        if (
            typeof e === 'object' &&
            e !== null &&
            'name' in e &&
            e.name === 'ValidationError'
        ) {
            const errors: { [key: string]: string } = {};
            if ('errors' in e && typeof e.errors === 'object') {
                for (const field in e.errors) {
                    const error = (e.errors as any)[field];
                    if (error && typeof error.message === 'string') {
                        errors[field] = error.message;
                    }
                }
            }
            return NextResponse.json(
                { message: 'Validation Failed', errors },
                { status: 400 }
            );
        }

        // Handle other errors
        const errorMessage =
            e instanceof Error ? e.message : 'Unknown error';
        return NextResponse.json(
            { message: 'Event Creation Failed', error: errorMessage },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json(
            { message: 'Events fetched successfully', events },
            { status: 200 }
        );
    } catch (e: unknown) {
        console.error('Event Fetching Error:', e);
        return NextResponse.json(
            { message: 'Event fetching failed', error: e },
            { status: 500 }
        );
    }
}