import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const CATEGORIES = [
  'Catering',
  'Photography',
  'Videography',
  'Florist',
  'DJ',
  'Live Band/Music',
  'Venue',
  'Decorator/Stylist',
  'Cake',
];

const SYSTEM_PROMPT = `You are an expert event planner for Event Nest, a UK-based event vendor marketplace.

The user will describe an event they want to plan. Generate a detailed event plan with budget breakdown.

Available vendor categories: ${CATEGORIES.join(', ')}

You MUST respond with valid JSON only, no markdown, no extra text. Use this exact schema:
{
  "title": "string - creative name for the event plan",
  "theme": "string - suggested theme in a few words",
  "totalBudget": number,
  "categories": [
    {
      "category": "string - must be one of the available categories listed above",
      "budgetAllocation": number,
      "priority": "essential" | "recommended" | "optional",
      "notes": "string - brief AI advice for this category, 1-2 sentences"
    }
  ],
  "tips": ["string - practical planning tip", "string - another tip", "string - another tip"]
}

Rules:
- Budget amounts in GBP (£). If the user doesn't specify a budget, suggest a reasonable one.
- Only include categories that are relevant to the event type.
- Budget allocations must sum to totalBudget.
- Include 3-5 practical tips.
- Keep notes concise and helpful.
- Priority: "essential" = must-have, "recommended" = strongly suggested, "optional" = nice-to-have.`;

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const role = user.user_metadata?.role;
    if (role !== 'customer' && role !== 'vendor') {
      return NextResponse.json({ error: 'Customers only' }, { status: 403 });
    }

    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
      return NextResponse.json({ error: 'Please describe your event in more detail' }, { status: 400 });
    }

    // Call Claude API
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt.trim() }],
    });

    let text = message.content[0]?.text || '';
    console.log('Claude raw response:', text.slice(0, 500));

    // Strip markdown code fences if present
    text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    let plan;
    try {
      plan = JSON.parse(text);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr.message, 'Response:', text.slice(0, 300));
      return NextResponse.json({ error: 'Failed to generate plan. Please try again.' }, { status: 500 });
    }

    // Fetch real vendors for each category in the plan
    const categoryVendors = {};
    await Promise.all(
      (plan.categories || []).map(async (cat) => {
        const vendors = await prisma.vendorProfile.findMany({
          where: {
            category: cat.category,
            isApproved: true,
          },
          orderBy: [
            { averageRating: 'desc' },
            { totalReviews: 'desc' },
          ],
          take: 5,
          select: {
            id: true,
            businessName: true,
            category: true,
            profileImageUrl: true,
            coverImageUrl: true,
            location: true,
            averageRating: true,
            totalReviews: true,
            pricePerDay: true,
            pricePerHead: true,
            pricingModel: true,
            tagline: true,
            packages: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: { price: true },
            },
          },
        });

        categoryVendors[cat.category] = vendors.map((v) => ({
          id: v.id,
          businessName: v.businessName,
          category: v.category,
          profileImageUrl: v.profileImageUrl,
          coverImageUrl: v.coverImageUrl,
          location: v.location,
          averageRating: v.averageRating ? Number(v.averageRating) : null,
          totalReviews: v.totalReviews,
          startingPrice: v.packages[0]?.price
            ? Number(v.packages[0].price)
            : v.pricePerDay
            ? Number(v.pricePerDay)
            : v.pricePerHead
            ? Number(v.pricePerHead)
            : null,
          tagline: v.tagline,
        }));
      })
    );

    return NextResponse.json({ plan, vendors: categoryVendors });
  } catch (err) {
    console.error('Event planner error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
