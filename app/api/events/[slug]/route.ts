import { NextRequest, NextResponse } from 'next/server';
import { Event } from '@/database';
import connectDB from '@/lib/mongodb';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
    try {
        await connectDB();

        // Handle both sync and async params (Next.js 15+)
        const resolvedParams = await Promise.resolve(params);
        const { slug } = resolvedParams;

        if (!slug) {
            return NextResponse.json(
                { message: 'Slug is required' },
                { status: 400 }
            );
        }

        // Find event by slug
        const event = await Event.findOne({ slug });

        if (!event) {
            return NextResponse.json(
                { message: 'Event not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Event fetched successfully', event },
            { status: 200 }
        );
    } catch (e: unknown) {
        console.error('Event Fetching Error:', e);
        const errorMessage =
            e instanceof Error ? e.message : 'Unknown error';
        return NextResponse.json(
            { message: 'Event fetching failed', error: errorMessage },
            { status: 500 }
        );
    }
}

