import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get events for "Your Interests" page: personalized by
 * 1) onboarding interests and 2) categories from events you've registered for (past + upcoming).
 * Requires authenticated user.
 */
export const getEventsForYourInterests = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return [];
    }

    const now = Date.now();

    const events = await ctx.db
      .query("events")
      .withIndex("by_start_date")
      .filter((q) => q.gte(q.field("startDate"), now))
      .collect();

    // 1) Preferred categories from onboarding (weight 2 each)
    const categoryWeights = {};
    for (const id of user.interests || []) {
      const key = id.toLowerCase();
      if (key) categoryWeights[key] = (categoryWeights[key] || 0) + 2;
    }

    // 2) Categories and tags from events user has registered for (past + upcoming)
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const reg of registrations) {
      const event = await ctx.db.get(reg.eventId);
      if (!event) continue;
      const cat = event.category?.toLowerCase();
      if (cat) {
        categoryWeights[cat] = (categoryWeights[cat] || 0) + 2;
      }
      for (const tag of event.tags || []) {
        const t = String(tag).toLowerCase();
        if (t) categoryWeights[t] = (categoryWeights[t] || 0) + 1;
      }
    }

    const preferredSet = new Set(Object.keys(categoryWeights));

    // No interests and no past events: return popular upcoming events
    if (preferredSet.size === 0) {
      return events
        .sort((a, b) => b.registrationCount - a.registrationCount)
        .slice(0, args.limit ?? 24);
    }

    const getWeight = (key) => categoryWeights[key] ?? 0;

    const userCity = (user.location?.city || "").toLowerCase();
    const userState = (user.location?.state || "").toLowerCase();
    const userCountry = (user.location?.country || "").toLowerCase();

    const scored = events.map((event) => {
      let interestScore = 0;
      if (preferredSet.has(event.category?.toLowerCase())) {
        interestScore += getWeight(event.category.toLowerCase());
      }
      for (const tag of event.tags || []) {
        const t = String(tag).toLowerCase();
        if (preferredSet.has(t)) interestScore += getWeight(t) * 0.5;
      }

      let locationScore = 0;
      if (userCity && event.city?.toLowerCase() === userCity) {
        locationScore += 2;
      } else if (userState && event.state?.toLowerCase() === userState) {
        locationScore += 1;
      } else if (userCountry && event.country?.toLowerCase() === userCountry) {
        locationScore += 0.5;
      }

      const totalScore = interestScore + locationScore;
      return { event, totalScore };
    });

    const sorted = scored
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (b.event.registrationCount !== a.event.registrationCount) {
          return b.event.registrationCount - a.event.registrationCount;
        }
        return a.event.startDate - b.event.startDate;
      })
      .map(({ event }) => event)
      .slice(0, args.limit ?? 24);

    return sorted;
  },
});
