import { notFound } from 'next/navigation';
import Image from 'next/image';
import { IEvent } from '@/database';
import { getSimilarEventsBySlug } from '@/lib/actions/event.actions';
import EventCard from '@/app/components/EventCard';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface PageProps {
    params: Promise<{ slug: string }> | { slug: string };
}

async function getEvent(slug: string): Promise<IEvent | null> {
    try {
        const response = await fetch(`${BASE_URL}/api/events/${slug}`, {
            cache: 'no-store', // Always fetch fresh data
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error('Failed to fetch event');
        }

        const data = await response.json();
        return data.event;
    } catch (error) {
        console.error('Error fetching event:', error);
        return null;
    }
}

export default async function EventPage(props: PageProps) {
    // Handle both sync and async params (Next.js 15+)
    const resolvedParams = await Promise.resolve(props.params);
    const { slug } = resolvedParams;

    const event = await getEvent(slug);

    if (!event) {
        notFound();
    }

    // Fetch similar events based on shared tags
    const similarEvents = await getSimilarEventsBySlug(slug);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Event Image */}
                <div className="mb-8">
                    <Image
                        src={event.image}
                        alt={event.title}
                        width={1200}
                        height={600}
                        className="w-full h-auto rounded-lg object-cover"
                    />
                </div>

                {/* Event Title */}
                <h1 className="text-4xl font-bold mb-4">{event.title}</h1>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Location */}
                    <div className="flex items-center gap-2">
                        <Image
                            src="/icons/pin.svg"
                            alt="location"
                            width={20}
                            height={20}
                        />
                        <div>
                            <p className="font-semibold">Location</p>
                            <p>{event.location}</p>
                            <p className="text-sm text-gray-600">{event.venue}</p>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-2">
                        <Image
                            src="/icons/calendar.svg"
                            alt="date"
                            width={20}
                            height={20}
                        />
                        <div>
                            <p className="font-semibold">Date</p>
                            <p>{event.date}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Image
                            src="/icons/clock.svg"
                            alt="time"
                            width={20}
                            height={20}
                        />
                        <div>
                            <p className="font-semibold">Time</p>
                            <p>{event.time}</p>
                        </div>
                    </div>

                    {/* Mode */}
                    <div className="flex items-center gap-2">
                        <Image
                            src="/icons/mode.svg"
                            alt="mode"
                            width={20}
                            height={20}
                        />
                        <div>
                            <p className="font-semibold">Mode</p>
                            <p>{event.mode}</p>
                        </div>
                    </div>

                    {/* Audience */}
                    <div className="flex items-center gap-2">
                        <Image
                            src="/icons/audience.svg"
                            alt="audience"
                            width={20}
                            height={20}
                        />
                        <div>
                            <p className="font-semibold">Audience</p>
                            <p>{event.audience}</p>
                        </div>
                    </div>

                    {/* Organizer */}
                    <div>
                        <p className="font-semibold">Organizer</p>
                        <p>{event.organizer}</p>
                    </div>
                </div>

                {/* Overview */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Overview</h2>
                    <p className="text-gray-700 leading-relaxed">{event.overview}</p>
                </div>

                {/* Description */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Description</h2>
                    <p className="text-gray-700 leading-relaxed">{event.description}</p>
                </div>

                {/* Agenda */}
                {event.agenda && event.agenda.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Agenda</h2>
                        <ul className="list-disc list-inside space-y-2">
                            {event.agenda.map((item, index) => {
                                // Clean unwanted characters from agenda items
                                const cleanItem = String(item)
                                    .replace(/[\[\]]/g, '') // Remove brackets [ ]
                                    .replace(/["']/g, '') // Remove quotes " and '
                                    .trim();
                                return (
                                    <li key={index} className="text-gray-700">
                                        {cleanItem}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Tags</h2>
                        <div className="flex flex-wrap gap-2">
                            {event.tags.map((tag, index) => {
                                // Clean unwanted characters from tag items
                                const cleanTag = String(tag)
                                    .replace(/[\[\]]/g, '') // Remove brackets [ ]
                                    .replace(/["']/g, '') // Remove quotes " and '
                                    .trim();
                                return (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-200 rounded-full text-sm text-gray-700"
                                    >
                                        {cleanTag}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Similar Events */}
                {similarEvents && similarEvents.length > 0 && (
                    <div className="mt-20 space-y-7">
                        <h3>Similar Events</h3>
                        <ul className="events">
                            {similarEvents.map((similarEvent: any) => (
                                <EventCard
                                    key={similarEvent._id}
                                    title={similarEvent.title}
                                    image={similarEvent.image}
                                    slug={similarEvent.slug}
                                    location={similarEvent.location}
                                    date={similarEvent.date}
                                    time={similarEvent.time}
                                />
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

