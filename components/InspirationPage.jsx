'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Lightbulb, Heart, Calendar, Users, Gift, Star, Cake, PartyPopper, Search, X } from 'lucide-react';
import PublicHeader from './PublicHeader';

const CATEGORIES = ['All', 'Wedding', 'Birthday', 'Corporate', 'Baby Shower', 'Anniversary', 'Budget-Friendly'];

const ARTICLES = [
  // ── Wedding (5) ──
  {
    id: 1,
    title: '10 Wedding Trends for 2026',
    category: 'Wedding',
    excerpt: 'From sustainable florals to interactive food stations, here are the top wedding trends making waves this year.',
    tips: [
      'Sustainable and dried flower arrangements are replacing traditional bouquets',
      'Interactive food stations (build-your-own tacos, pizza bars) are a hit with guests',
      'Micro-weddings (under 50 guests) continue to grow in popularity',
      'Bold colour palettes — think deep burgundy, emerald green, and burnt orange',
      'Live musicians during the ceremony instead of recorded music',
      'Personalised wedding favours that guests actually want to keep',
      'Outdoor ceremonies with indoor receptions as a best-of-both option',
      'Video guest books replacing traditional sign-in books',
      'Late-night snack stations for the evening party',
      'Hiring a day-of coordinator to reduce stress',
    ],
    icon: Heart,
    colour: 'purple',
  },
  {
    id: 2,
    title: 'How to Choose the Right Photographer',
    category: 'Wedding',
    excerpt: 'Your photographer captures memories that last forever. Here\'s what to look for when choosing one.',
    tips: [
      'Review their full portfolio, not just the highlights reel',
      'Ask to see a complete wedding album to judge consistency',
      'Meet them in person or video call — personality matters on the day',
      'Check if they have a second shooter for larger events',
      'Clarify what\'s included: how many hours, edited photos, prints?',
      'Ask about their backup equipment policy',
      'Read reviews from other couples, not just testimonials on their site',
      'Book early — the best photographers fill up 12+ months ahead',
    ],
    icon: Calendar,
    colour: 'blue',
  },
  {
    id: 3,
    title: 'How to Choose the Perfect Wedding Venue',
    category: 'Wedding',
    excerpt: 'Your venue sets the tone for the entire day. Here\'s how to find the right one for your style and budget.',
    tips: [
      'Visit venues at the same time of day as your ceremony for accurate lighting',
      'Ask about hidden costs: corkage, overtime, service charges, VAT',
      'Check capacity for both ceremony and reception — they may differ',
      'Ask what\'s included (tables, chairs, linens, PA system)',
      'Consider travel time for guests and available parking or transport',
      'Ask about wet weather backup plans for outdoor venues',
      'Check noise restrictions — some venues have 11pm curfews',
      'Book at least 12-18 months ahead for popular venues',
    ],
    icon: Heart,
    colour: 'purple',
  },
  {
    id: 4,
    title: 'Wedding Planning Timeline: 12-Month Countdown',
    category: 'Wedding',
    excerpt: 'A month-by-month guide to keep your wedding planning on track and stress-free.',
    tips: [
      '12 months: Set budget, book venue, and choose your wedding party',
      '10 months: Book photographer, caterer, DJ/band, and florist',
      '8 months: Send save-the-dates and start dress/suit shopping',
      '6 months: Book officiant, plan honeymoon, and order invitations',
      '4 months: Finalise menu, book transport, and arrange accommodation',
      '2 months: Send invitations, do final dress fitting, and write vows',
      '1 month: Confirm all vendors, create seating plan, and break in shoes',
      '1 week: Final numbers to caterer, prepare day-of emergency kit',
    ],
    icon: Calendar,
    colour: 'blue',
  },
  {
    id: 5,
    title: 'DIY Wedding Decor That Looks Professional',
    category: 'Wedding',
    excerpt: 'Save money without sacrificing style. These DIY decoration ideas look expensive but cost a fraction.',
    tips: [
      'Eucalyptus table runners are cheap, elegant, and smell amazing',
      'Collect mismatched vintage jars and bottles for flower vases',
      'Fairy lights in glass bottles make beautiful centrepieces',
      'Use a Cricut machine for personalised place cards and signage',
      'Fabric draping can transform any plain venue — buy in bulk online',
      'Make a photo wall with string, pegs, and printed photos of the couple',
      'Spray-paint cheap frames gold or rose gold for an upscale look',
      'Recruit crafty friends and host a "decor-making party" a month before',
    ],
    icon: Sparkles,
    colour: 'amber',
  },
  // ── Birthday (5) ──
  {
    id: 6,
    title: 'Kids Birthday Party Themes They\'ll Love',
    category: 'Birthday',
    excerpt: 'From superheroes to space adventures, these party themes are guaranteed crowd-pleasers for children.',
    tips: [
      'Superhero party: capes as party favours, obstacle course, mask-making station',
      'Dinosaur dig: sandbox with buried toys, fossil cookies, dino egg hunt',
      'Under the sea: blue balloons, bubble machines, fish-themed games',
      'Space adventure: glow-in-the-dark stars, rocket ship craft, astronaut food',
      'Princess/knight: crown-making, treasure hunt, castle bouncy house',
      'Keep party length to 2 hours max for under-8s to avoid meltdowns',
      'Have a simple backup plan for outdoor parties (gazebo or indoor space)',
      'Send invites 3-4 weeks ahead and follow up 1 week before',
    ],
    icon: Cake,
    colour: 'pink',
  },
  {
    id: 7,
    title: 'Milestone Birthday Ideas: 18th, 21st, 30th, 40th, 50th',
    category: 'Birthday',
    excerpt: 'Make milestone birthdays truly special with these celebration ideas for every big number.',
    tips: [
      '18th: Festival-themed garden party with a photo booth and live playlist',
      '21st: Cocktail night with a personalised drinks menu and speeches',
      '30th: "Dirty thirty" — glam dinner party or weekend away with friends',
      '40th: Experience gift (hot air balloon, cooking class) or surprise party',
      '50th: Golden celebration — hire a private room, photo slideshow of 50 years',
      'Create a memory jar where guests write their favourite moment with the birthday person',
      'A personalised video montage from friends and family is always a tearjerker',
      'Whatever the age, the best gift is having the people they love in one room',
    ],
    icon: PartyPopper,
    colour: 'purple',
  },
  {
    id: 8,
    title: 'How to Plan a Surprise Birthday Party',
    category: 'Birthday',
    excerpt: 'Pull off the ultimate surprise without getting caught. A step-by-step guide to secret party planning.',
    tips: [
      'Recruit one trusted friend as your co-conspirator for coordination',
      'Create a cover story for the day — a "casual dinner" or "running errands"',
      'Use a group chat WITHOUT the birthday person for all planning',
      'Book the venue under someone else\'s name to avoid spoilers',
      'Have someone bring the guest of honour at a specific time',
      'Brief guests to arrive 30 minutes before the birthday person',
      'Keep the guest list manageable — the more people, the higher the leak risk',
      'Have someone record the moment they walk in — you\'ll want to rewatch it',
    ],
    icon: Gift,
    colour: 'amber',
  },
  {
    id: 9,
    title: 'Teen Birthday Party Ideas',
    category: 'Birthday',
    excerpt: 'Too old for bouncy castles, too young for bars. Here are birthday ideas teenagers will actually enjoy.',
    tips: [
      'Movie night: projector, bean bags, popcorn bar, and a voted-on film',
      'Gaming tournament: set up consoles or PC stations with prizes',
      'Pizza-making party: buy dough and let everyone create their own',
      'Outdoor cinema in the garden with fairy lights and blankets',
      'Escape room booking — most have group packages for teens',
      'TikTok challenge party: set up a ring light and props, film together',
      'Let the teen have real input on the guest list and activities',
      'Budget £10-15 per head and you can host a great party at home',
    ],
    icon: Sparkles,
    colour: 'blue',
  },
  {
    id: 10,
    title: 'Garden Party Ideas for Summer Birthdays',
    category: 'Birthday',
    excerpt: 'Make the most of sunny weather with these garden party tips for a relaxed outdoor birthday celebration.',
    tips: [
      'Set up different zones: eating area, lawn games, chill-out corner',
      'Hire or borrow a gazebo for shade and as a rain backup',
      'Lawn games everyone loves: croquet, giant Jenga, rounders, boules',
      'A BBQ or pizza oven is the easiest outdoor catering option',
      'Freeze fruit in ice cubes for a colourful touch in drinks',
      'Hang festoon lights for atmosphere as the sun goes down',
      'Blankets and cushions on the grass create a relaxed festival vibe',
      'Citronella candles or bug spray — don\'t let insects ruin the party',
    ],
    icon: PartyPopper,
    colour: 'green',
  },
  // ── Corporate (5) ──
  {
    id: 11,
    title: 'Corporate Team Building Ideas That Actually Work',
    category: 'Corporate',
    excerpt: 'Skip the trust falls. Here are corporate event ideas your team will genuinely enjoy.',
    tips: [
      'Cooking classes — teams work together and eat the results',
      'Escape rooms with mixed teams from different departments',
      'Outdoor adventure days (hiking, kayaking, obstacle courses)',
      'Volunteer days — give back while bonding as a team',
      'Creative workshops (pottery, art, cocktail making)',
      'Quiz nights with themed rounds and prizes',
      'Hire a professional host to keep energy high',
      'Always include good food and drinks — it makes everything better',
    ],
    icon: Users,
    colour: 'green',
  },
  {
    id: 12,
    title: 'How to Plan a Successful Conference',
    category: 'Corporate',
    excerpt: 'From speaker line-ups to delegate packs, here\'s how to organise a conference people actually want to attend.',
    tips: [
      'Start planning at least 6 months ahead for a multi-day event',
      'Choose a venue with good Wi-Fi, AV equipment, and breakout rooms',
      'Mix keynotes with panels and interactive workshops to keep energy up',
      'Send a pre-event survey to understand what attendees want to learn',
      'Provide a dedicated networking slot — not just coffee breaks',
      'Hire a professional AV team — bad sound ruins even great speakers',
      'Live-stream or record sessions for people who can\'t attend in person',
      'Follow up within 48 hours with slides, recordings, and a feedback form',
    ],
    icon: Users,
    colour: 'blue',
  },
  {
    id: 13,
    title: 'Christmas Party Planning for the Office',
    category: 'Corporate',
    excerpt: 'Tips for organising a company Christmas party that everyone looks forward to — from venues to Secret Santa.',
    tips: [
      'Book early — December venues fill up by September',
      'Set a clear budget per head and stick to it (£30-80 is typical)',
      'Offer a non-alcoholic drinks menu alongside the bar',
      'Theme it: Winter Wonderland, 80s disco, or black-tie glam',
      'Plan Secret Santa with a £10-15 cap and anonymous gift exchange',
      'Hire a DJ or create a playlist voted on by the team',
      'Include dietary options for everyone — check allergies in advance',
      'Arrange group transport home — taxis or a minibus for safety',
    ],
    icon: Sparkles,
    colour: 'rose',
  },
  {
    id: 14,
    title: 'Product Launch Event Planning',
    category: 'Corporate',
    excerpt: 'First impressions matter. Here\'s how to plan a product launch that generates buzz and media coverage.',
    tips: [
      'Define one clear message — what should attendees remember?',
      'Choose a venue that aligns with your brand identity',
      'Create an Instagram-worthy photo moment or backdrop',
      'Invite media, influencers, and key customers — quality over quantity',
      'Have product demos available for hands-on experience',
      'Prepare a press kit with high-res images, quotes, and product details',
      'Live-stream the launch for remote audiences on social media',
      'Follow up with attendees within 24 hours while excitement is high',
    ],
    icon: Star,
    colour: 'purple',
  },
  {
    id: 15,
    title: 'Company Away Day Ideas',
    category: 'Corporate',
    excerpt: 'Get the team out of the office and into fresh ideas with these away day formats that boost morale and creativity.',
    tips: [
      'Combine strategy work with fun — half-day workshops, half-day activities',
      'Choose a venue outside the office to change the mental scenery',
      'Start with an icebreaker that mixes people from different teams',
      'Include at least one physical activity — even a walk works wonders',
      'Set clear goals: what decisions need to be made by end of day?',
      'Ban laptops during group sessions — phones on silent',
      'End with a social element: dinner, pub, or group activity',
      'Follow up with action points within a week or it was all for nothing',
    ],
    icon: Users,
    colour: 'green',
  },
  // ── Baby Shower (5) ──
  {
    id: 16,
    title: 'Baby Shower Planning Guide',
    category: 'Baby Shower',
    excerpt: 'Everything you need to know about planning the perfect baby shower, from themes to games to food.',
    tips: [
      'Plan for 4-6 weeks before the due date',
      'Choose a theme that reflects the parents\' personality',
      'Set up a gift registry to avoid duplicate gifts',
      'Plan 2-3 games or activities max — don\'t over-schedule',
      'Finger food works better than a sit-down meal',
      'Create a nappy cake as a centrepiece that doubles as a gift',
      'Set up a "wishes for baby" station where guests write advice cards',
      'Consider a gender-neutral theme if the parents are keeping it a surprise',
    ],
    icon: Heart,
    colour: 'pink',
  },
  {
    id: 17,
    title: 'Co-Ed Baby Shower Ideas',
    category: 'Baby Shower',
    excerpt: 'Baby showers aren\'t just for the girls anymore. Here\'s how to throw an inclusive celebration everyone enjoys.',
    tips: [
      'Swap traditional games for mixed-group activities like a quiz or bingo',
      'Choose a relaxed venue: pub garden, BBQ at home, or brewery tour',
      'Beer and nappies theme: "Huggies & Chuggies" is a popular format',
      'Set up a onesie-decorating station with fabric markers',
      'Prediction cards: guess the birth date, weight, and hair colour',
      'Include a "dad advice" station alongside the mum advice cards',
      'Serve food everyone loves: sliders, pizza, tacos — skip the dainty sandwiches',
      'Keep it to 2-3 hours to maintain energy without dragging on',
    ],
    icon: Users,
    colour: 'blue',
  },
  {
    id: 18,
    title: 'Virtual Baby Shower: How to Celebrate Remotely',
    category: 'Baby Shower',
    excerpt: 'Long-distance friends and family can still celebrate. Here\'s how to host a virtual baby shower that feels special.',
    tips: [
      'Use Zoom or Google Meet and send invites with a clear time and link',
      'Mail a small party box to guests: snacks, a prop, and a game card',
      'Play games that work on video: trivia, bingo, "guess the baby photo"',
      'Open gifts on camera so remote guests can share the moment',
      'Create a shared photo album or playlist guests can contribute to',
      'Keep it to 60-90 minutes — screen fatigue is real',
      'Record the session so the parents can rewatch later',
      'Send digital thank-you notes within a week',
    ],
    icon: Calendar,
    colour: 'green',
  },
  {
    id: 19,
    title: 'Baby Shower Games Everyone Actually Enjoys',
    category: 'Baby Shower',
    excerpt: 'Ditch the cringe — these baby shower games are genuinely fun and get everyone involved.',
    tips: [
      'Baby bingo: guests fill in a card predicting what gifts will be opened',
      'Don\'t say "baby": give everyone a pin/clip — steal theirs if they say the word',
      'Guess the baby food flavour: remove labels and let people taste-test',
      'Baby photo match: guess which baby photo belongs to which guest',
      'Nappy raffle: everyone who brings a pack of nappies gets a raffle ticket',
      'The price is right: guess the retail price of baby items',
      'Baby word scramble: unscramble baby-related words against the clock',
      'Keep prizes simple: candles, chocolates, or mini bottles of prosecco',
    ],
    icon: Gift,
    colour: 'amber',
  },
  {
    id: 20,
    title: 'Themed Baby Shower Ideas',
    category: 'Baby Shower',
    excerpt: 'From woodland creatures to storybook adventures, these themed baby showers make planning easy and the photos adorable.',
    tips: [
      'Woodland theme: animal balloons, leafy garlands, wooden accents',
      'Storybook theme: decorate with classic children\'s books as centrepieces',
      'Safari theme: animal print tablecloths, stuffed animals, green foliage',
      'Twinkle Twinkle Little Star: gold stars, fairy lights, cloud-shaped cookies',
      'Bumble bee theme: yellow and black stripes, honeycomb decor, "sweet as honey" favours',
      'Rainbow theme: colourful balloons, rainbow cake, bright flowers',
      'Pick one theme and carry it through invites, decor, cake, and favours',
      'Search Pinterest for your theme 4 weeks ahead to order supplies in time',
    ],
    icon: Sparkles,
    colour: 'pink',
  },
  // ── Anniversary (5) ──
  {
    id: 21,
    title: 'Anniversary Celebration Ideas by Milestone',
    category: 'Anniversary',
    excerpt: 'From your 1st to your 50th, here are celebration ideas for every major anniversary milestone.',
    tips: [
      '1st anniversary: Intimate dinner at the restaurant where you first met',
      '5th anniversary: Weekend getaway to somewhere new together',
      '10th anniversary: Renew your vows with close friends and family',
      '25th (Silver): Throw a party with a silver theme and photo slideshow',
      '50th (Gold): Host a grand celebration with all the family',
      'Create a memory book with photos and stories from each year',
      'Commission a custom piece of art or jewellery as a keepsake',
      'Hire a photographer to capture the celebration professionally',
    ],
    icon: Sparkles,
    colour: 'rose',
  },
  {
    id: 22,
    title: 'Romantic Anniversary Dinner Ideas',
    category: 'Anniversary',
    excerpt: 'Whether you\'re cooking at home or booking a restaurant, here\'s how to make your anniversary dinner unforgettable.',
    tips: [
      'Book a restaurant with sentimental value — where you had your first date',
      'If cooking at home, set the scene: candles, flowers, your best tableware',
      'Cook a meal from the country you honeymooned in (or want to visit)',
      'Create a tasting menu: small courses are more special than one big plate',
      'Pair each course with a different wine — even if you\'re no expert',
      'Write a short letter to read aloud during dinner — it means more than any gift',
      'Play a playlist of songs from your relationship milestones',
      'End with a dessert you both love — or order from a patisserie',
    ],
    icon: Heart,
    colour: 'pink',
  },
  {
    id: 23,
    title: 'Surprise Anniversary Party Planning',
    category: 'Anniversary',
    excerpt: 'Planning a surprise anniversary party for your partner or parents? Here\'s how to make it happen without getting caught.',
    tips: [
      'Set a realistic budget — surprise doesn\'t mean extravagant',
      'Pick a date close to the anniversary but not the exact day (less suspicious)',
      'Use a trusted friend or family member as your planning partner',
      'Create a fake event (dinner, film night) as the cover story',
      'Collect old photos for a slideshow — raid family albums and social media',
      'Ask guests to bring a written memory or piece of advice for the couple',
      'Keep the guest list to people who can keep a secret',
      'Have someone record the surprise moment on camera',
    ],
    icon: Gift,
    colour: 'amber',
  },
  {
    id: 24,
    title: 'Vow Renewal Ceremony Guide',
    category: 'Anniversary',
    excerpt: 'Thinking of renewing your vows? Here\'s everything you need to plan a meaningful ceremony on any budget.',
    tips: [
      'You don\'t need an officiant — vow renewals are symbolic, not legal',
      'Write new vows that reflect what you\'ve learned since your wedding',
      'Keep it intimate: just close family, or even just the two of you',
      'Return to your original wedding venue for sentimental value',
      'Wear something special but comfortable — no need for a full wedding outfit',
      'Include your children or grandchildren in the ceremony',
      'Hire a photographer for at least one hour to capture the moment',
      'Follow the ceremony with a celebration: dinner, party, or champagne toast',
    ],
    icon: Heart,
    colour: 'purple',
  },
  {
    id: 25,
    title: 'Budget Anniversary Celebration Ideas',
    category: 'Anniversary',
    excerpt: 'You don\'t need to spend a fortune to make your anniversary special. These ideas are meaningful without breaking the bank.',
    tips: [
      'Recreate your first date at home — same meal, same movie, same vibes',
      'Write each other 10 reasons you\'re glad you married them',
      'Have a picnic in a meaningful spot — the park where you got engaged',
      'Cook a fancy meal together: pick a recipe you\'ve never tried',
      'Make a scrapbook of your best photos and ticket stubs from the year',
      'Watch your wedding video (or look through your album) with champagne',
      'Go on a sunrise or sunset walk together — simple but romantic',
      'Plan a future trip together — the anticipation is half the fun',
    ],
    icon: Sparkles,
    colour: 'green',
  },
  // ── Budget-Friendly (5) ──
  {
    id: 26,
    title: 'Planning a Birthday Party on a Budget',
    category: 'Budget-Friendly',
    excerpt: 'You don\'t need to spend a fortune to throw an amazing birthday party. Here\'s how to keep costs down without sacrificing fun.',
    tips: [
      'Host at home or in a free public space like a park',
      'Make your own decorations — Pinterest is full of DIY ideas',
      'Cook or bake yourself instead of hiring a caterer for small parties',
      'Create a collaborative Spotify playlist instead of hiring a DJ',
      'Set a clear budget before you start and track every expense',
      'Ask friends and family to help with setup and food',
      'Use digital invitations instead of printed ones',
      'Focus spending on one "wow" element (like an amazing cake)',
    ],
    icon: Sparkles,
    colour: 'amber',
  },
  {
    id: 27,
    title: 'Free and Low-Cost Venue Ideas',
    category: 'Budget-Friendly',
    excerpt: 'The venue is often the biggest expense. Here are clever alternatives that cost little or nothing.',
    tips: [
      'Public parks — many have sheltered areas you can book for free',
      'Community halls: often £50-100 for a whole evening',
      'Your own garden: gazebo, fairy lights, and you\'re set',
      'Village halls: charming, affordable, and usually have a kitchen',
      'Beach or lakeside: check local rules about gatherings',
      'A friend\'s large garden or barn: offer to pay for cleaning',
      'Church halls: available to non-members for a small donation',
      'Check if local pubs offer free function rooms with a minimum spend',
    ],
    icon: Calendar,
    colour: 'blue',
  },
  {
    id: 28,
    title: 'DIY Decorations That Look Expensive',
    category: 'Budget-Friendly',
    excerpt: 'Impress your guests with decorations that look professionally designed but cost next to nothing to make.',
    tips: [
      'Paper fans and honeycomb balls: buy in bulk online for pennies each',
      'Balloon arches: YouTube tutorials make them easy with a balloon strip',
      'Tissue paper pom-poms: cheap, colourful, and fill a room fast',
      'Mason jar centrepieces: wildflowers, candles, or fairy lights inside',
      'Gold-sprayed leaves and branches for elegant autumn decor',
      'Photo strings: print photos at home, hang with mini pegs on twine',
      'Chalkboard signs: one board, reusable for any event',
      'Buy decorations from charity shops or Facebook Marketplace after wedding season',
    ],
    icon: Lightbulb,
    colour: 'amber',
  },
  {
    id: 29,
    title: 'Potluck Party Planning Guide',
    category: 'Budget-Friendly',
    excerpt: 'Share the load and the cost. A well-organised potluck means amazing food and a fraction of the expense.',
    tips: [
      'Assign categories (starters, mains, sides, desserts) to avoid 10 salads',
      'Use a shared Google Sheet so everyone can see what\'s covered',
      'You provide the main dish, drinks, and tableware — guests bring the rest',
      'Label dishes with ingredients for allergy awareness',
      'Set up a buffet station rather than plated service',
      'Provide disposable containers so guests can take leftovers home',
      'A potluck works brilliantly for casual birthdays, housewarming, and game nights',
      'Ask one or two guests to bring ice — you always need more than you think',
    ],
    icon: Users,
    colour: 'green',
  },
  {
    id: 30,
    title: 'Budget Wedding: How to Marry for Under £3,000',
    category: 'Budget-Friendly',
    excerpt: 'Yes, it\'s possible to have a beautiful wedding without the five-figure price tag. Here\'s the playbook.',
    tips: [
      'Marry on a weekday or in off-season (November-March) for huge venue discounts',
      'Registry office ceremony: from £50 for the legal bit',
      'One outfit: buy from ASOS, Preloved, or a charity bridal shop',
      'DIY flowers: supermarket bouquets the morning of the wedding',
      'Ask a talented friend to photograph key moments (backup with disposable cameras)',
      'Pub or restaurant reception: set menu deals beat traditional catering',
      'Spotify playlist + a Bluetooth speaker instead of a DJ',
      'The best weddings aren\'t the most expensive — they\'re the most personal',
    ],
    icon: Heart,
    colour: 'rose',
  },
];

const COLOUR_MAP = {
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  amber:  { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  blue:   { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  green:  { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  pink:   { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  rose:   { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function InspirationPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [favourites, setFavourites] = useState(new Set());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('inspirationFavourites') || '[]');
      setFavourites(new Set(stored));
    } catch {}
  }, []);

  function toggleFavourite(id) {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('inspirationFavourites', JSON.stringify([...next]));
      return next;
    });
  }

  // Shuffle once on mount for the "All" view
  const shuffled = useMemo(() => shuffle(ARTICLES), []);

  const filtered = (filter === 'All' ? shuffled : ARTICLES).filter((a) => {
    if (filter === 'Favourites') return favourites.has(a.id);
    if (filter !== 'All' && a.category !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tips.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Event Inspiration</h1>
          <p className="text-purple-100 text-lg">Ideas, tips, and guides to help you plan the perfect event</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles, tips, ideas..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[...CATEGORIES, 'Favourites'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filter === cat
                  ? cat === 'Favourites' ? 'bg-yellow-500 text-white' : 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {cat === 'Favourites' && <Star size={14} className={filter === 'Favourites' ? 'fill-white' : ''} />}
              {cat}
              {cat === 'Favourites' && favourites.size > 0 && (
                <span className={`text-xs ${filter === 'Favourites' ? 'text-yellow-100' : 'text-gray-400'}`}>
                  ({favourites.size})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="space-y-4">
          {filtered.map((article) => {
            const Icon = article.icon;
            const colours = COLOUR_MAP[article.colour] || COLOUR_MAP.purple;
            const isExpanded = expandedId === article.id;

            return (
              <div key={article.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-start">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : article.id)}
                    className="flex-1 flex items-start gap-4 p-5 text-left hover:bg-gray-50 transition-colors min-w-0"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colours.bg}`}>
                      <Icon size={18} className={colours.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-semibold text-gray-900">{article.title}</h2>
                      </div>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 ${colours.bg} ${colours.text}`}>
                        {article.category}
                      </span>
                      <p className="text-sm text-gray-500">{article.excerpt}</p>
                    </div>
                    <ArrowRight
                      size={18}
                      className={`text-gray-300 flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>
                  <button
                    onClick={() => toggleFavourite(article.id)}
                    className="p-4 flex-shrink-0 hover:scale-110 transition-transform"
                    aria-label={favourites.has(article.id) ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    <Star
                      size={18}
                      className={favourites.has(article.id)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300 hover:text-yellow-400'
                      }
                    />
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-5">
                    <ul className="space-y-3">
                      {article.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${colours.bg} ${colours.text}`}>
                            {i + 1}
                          </span>
                          {tip}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <p className="text-sm text-gray-500">Ready to start planning?</p>
                      <div className="flex gap-2">
                        <Link
                          href="/marketplace"
                          className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          Find Vendors
                        </Link>
                        <Link
                          href="/plan-my-event"
                          className="text-sm px-4 py-2 bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                        >
                          AI Planner
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            {filter === 'Favourites' ? (
              <>
                <Star size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No favourites yet. Star articles to save them here.</p>
              </>
            ) : (
              <p className="text-gray-500">
                {search.trim() ? `No articles matching "${search}"` : 'No articles in this category yet.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
