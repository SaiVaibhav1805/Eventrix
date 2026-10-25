"use client";

import { useRouter } from "next/navigation";
import { Heart, Loader2, Sparkles } from "lucide-react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Authenticated, Unauthenticated } from "convex/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EventCard from "@/components/event-card";

export default function YourInterestsPage() {
  const router = useRouter();

  const { data: events, isLoading } = useConvexQuery(
    api.interests.getEventsForYourInterests,
    { limit: 24 }
  );

  const handleEventClick = (slug) => {
    router.push(`/events/${slug}`);
  };

  return (
    <>
      {/* Hero */}
      <div className="pb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
          Your Interests
        </h1>
        <p className="text-lg text-muted-foreground">
          Events picked from your profile interests and events you&apos;ve
          attended or registered for
        </p>
      </div>

      <Unauthenticated>
        <Card className="p-8 border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Personalized for you
                </h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  Sign in and set your interests (or register for events) to see
                  recommendations based on what you like and where you&apos;ve
                  been.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 gap-2">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </Unauthenticated>

      <Authenticated>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-muted animate-pulse" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-3 bg-muted animate-pulse rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                variant="compact"
                onClick={() => handleEventClick(event.slug)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 border-dashed">
            <CardContent className="text-center py-8">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold mb-2">
                No recommendations yet
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Set your interests in your profile, or register for a few events.
                We&apos;ll use that to show you events you&apos;ll love here.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild variant="outline">
                  <Link href="/explore">Browse all events</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </Authenticated>
    </>
  );
}
