const fs = require('fs')
const path = require('path')

function generateCountdownPosts() {
  const posts = []
  const hooks = [
    { day: 14, text: '14 days until Event Nest goes live! The easiest way to find and book event vendors is almost here.', theme: 'teaser' },
    { day: 13, text: '13 days to go. We\'ve been building something special for event planners and vendors. Stay tuned.', theme: 'teaser' },
    { day: 12, text: '12 days out. Did you know the average person contacts 8+ vendors before booking? We\'re fixing that.', theme: 'problem' },
    { day: 11, text: '11 days. One platform to browse, compare, message, and book — that\'s Event Nest.', theme: 'solution' },
    { day: 10, text: '10 days! Double digits no more. Event planning is about to get a whole lot easier.', theme: 'excitement' },
    { day: 9, text: '9 days. Vendors: want to be featured at launch? Sign up now for early access.', theme: 'vendor_cta' },
    { day: 8, text: '8 days to launch. Real reviews from real customers. No fake ratings. That\'s our promise.', theme: 'trust' },
    { day: 7, text: '1 week to go! Whether it\'s a wedding, birthday, or corporate event — we\'ve got the vendors.', theme: 'use_cases' },
    { day: 6, text: '6 days. Sneak peek: our AI event planner helps you build a complete event plan in seconds.', theme: 'feature' },
    { day: 5, text: '5 days! Compare packages, read reviews, and book — all without a single phone call.', theme: 'feature' },
    { day: 4, text: '4 days. We built Event Nest because planning events shouldn\'t feel like a second job.', theme: 'story' },
    { day: 3, text: '3 days to go. Join the waitlist now and be first to access our vendor marketplace.', theme: 'urgency' },
    { day: 2, text: '2 days! Final countdown. Tag someone who\'s planning an event — they\'ll thank you later.', theme: 'social' },
    { day: 1, text: 'TOMORROW. Event Nest launches. The future of event planning starts here.', theme: 'hype' },
  ]

  for (const post of hooks) {
    posts.push({
      ...post,
      platform: 'all',
      hashtags: ['#EventNest', '#LaunchDay', '#EventPlanning', '#ComingSoon'],
      suggestedImageDescription: `Bold countdown graphic showing "${post.day} days" with Event Nest branding`,
    })
  }

  return posts
}

function generateLaunchEmails() {
  return [
    {
      id: 'launch_announcement',
      trigger: 'launch_day',
      subject: 'Event Nest is LIVE — start planning your perfect event',
      preheader: 'Browse vendors, compare packages, and book today.',
      body: `We're thrilled to announce that Event Nest is officially live!

Whether you're planning a wedding, birthday, corporate event, or anything in between, you can now:

- Browse verified event vendors in your area
- Compare packages and read real reviews
- Message vendors and get custom quotes
- Book directly through the platform

As a waitlist member, you're among the first to experience it.

{cta_button: Explore the Marketplace | {app_url}/marketplace}

Thanks for being part of this from the start.

The Event Nest Team`,
    },
    {
      id: 'vendor_launch',
      trigger: 'launch_day',
      subject: 'Event Nest is live — your profile is ready for customers',
      preheader: 'Customers are already browsing. Make sure your profile stands out.',
      body: `Great news — Event Nest has officially launched!

Customers are already browsing our marketplace looking for vendors like you. Here's how to make the most of it:

1. Complete your profile with photos and packages
2. Set your availability so customers can see your open dates
3. Respond quickly to inquiries — fast responders get more bookings

{cta_button: Update Your Profile | {app_url}/profile-editor}

Welcome aboard.

The Event Nest Team`,
    },
    {
      id: 'pre_launch_reminder',
      trigger: '3_days_before',
      subject: 'We launch in 3 days — here\'s what to expect',
      preheader: 'Event Nest is almost ready. Get excited.',
      body: `Just 3 days until Event Nest goes live!

Here's what you'll be able to do on launch day:

- Browse our curated marketplace of event vendors
- Use our AI event planner to build a complete event plan
- Save vendors to your wishlist and compare options
- Message and book vendors directly

We'll send you a link the moment we're live.

See you soon,
The Event Nest Team`,
    },
  ]
}

function generateRecruitmentMessages() {
  return [
    {
      id: 'waitlist_referral',
      channel: 'email',
      subject: 'Know someone planning an event? Share Event Nest',
      body: `Hey {name},

Thanks for joining the Event Nest waitlist! We launch soon and we'd love your help spreading the word.

Know a friend planning a wedding, birthday, or event? Share this link and they'll get early access too:

{referral_link}

The more people who join, the better the experience for everyone.

Thanks,
The Event Nest Team`,
      personalizationSlots: ['{name}', '{referral_link}'],
    },
    {
      id: 'vendor_referral_ask',
      channel: 'email',
      subject: 'Know other event vendors? Refer them to Event Nest',
      body: `Hi {vendorName},

Thanks for joining Event Nest early! We're looking to onboard more quality vendors before launch.

If you know other event professionals who'd benefit from more bookings and visibility, send them our vendor signup page:

{vendor_signup_link}

We're building the best marketplace for event vendors — and your referrals help make that happen.

Cheers,
The Event Nest Team`,
      personalizationSlots: ['{vendorName}', '{vendor_signup_link}'],
    },
  ]
}

const campaign = {
  countdownPosts: generateCountdownPosts(),
  launchEmails: generateLaunchEmails(),
  recruitmentMessages: generateRecruitmentMessages(),
  generatedAt: new Date().toISOString(),
}

const outPath = path.join(__dirname, 'campaign.json')
fs.writeFileSync(outPath, JSON.stringify(campaign, null, 2))

console.log(`Generated launch campaign → ${outPath}`)
console.log(`  ${campaign.countdownPosts.length} countdown posts`)
console.log(`  ${campaign.launchEmails.length} launch emails`)
console.log(`  ${campaign.recruitmentMessages.length} recruitment messages`)
