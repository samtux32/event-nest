const fs = require('fs')
const path = require('path')

const categories = [
  'Photography', 'Videography', 'Catering', 'DJ / Music',
  'Florist', 'Decoration', 'Venue', 'Wedding Planner',
  'Hair & Makeup', 'Entertainment', 'Transport', 'Cake & Desserts',
]

const channels = ['email', 'instagram_dm', 'linkedin']

function coldEmail(category) {
  return {
    subject: `Partner with Event Nest — get bookings from local {customerType} customers`,
    body: `Hi {vendorName},

I came across {businessName} and was really impressed by your work in ${category.toLowerCase()}.

I'm reaching out from Event Nest — a new platform that connects event vendors with customers looking for exactly what you offer. We're launching soon and inviting select ${category.toLowerCase()} vendors to join early.

Here's what you get:
- A dedicated profile page with photos, packages, and reviews
- Direct bookings and inquiries from verified customers
- Messaging, quotes, and calendar management built in
- It's completely free to join

We'd love to have {businessName} as one of our featured ${category.toLowerCase()} vendors. Would you be interested in setting up a profile?

Best,
{senderName}
Event Nest`,
    personalizationSlots: ['{vendorName}', '{businessName}', '{customerType}', '{senderName}'],
  }
}

function instagramDM(category) {
  return {
    subject: null,
    body: `Hey {vendorName}! Love your ${category.toLowerCase()} work 🙌 We're launching Event Nest — a free platform where event vendors get discovered and booked by local customers. We're inviting top ${category.toLowerCase()} vendors to join early. Interested? I can send you the signup link!`,
    personalizationSlots: ['{vendorName}'],
  }
}

function linkedInMessage(category) {
  return {
    subject: null,
    body: `Hi {vendorName}, I noticed your experience in the ${category.toLowerCase()} space and wanted to reach out.

We're building Event Nest — a platform that helps event vendors get discovered by customers planning weddings, corporate events, and celebrations. We're onboarding vendors ahead of our launch and I think {businessName} would be a great fit.

It's free to join and takes about 5 minutes to set up a profile. Happy to share more details if you're interested.`,
    personalizationSlots: ['{vendorName}', '{businessName}'],
  }
}

function generateMessages() {
  const messages = []
  let id = 1

  for (const category of categories) {
    for (const channel of channels) {
      let content
      if (channel === 'email') content = coldEmail(category)
      else if (channel === 'instagram_dm') content = instagramDM(category)
      else content = linkedInMessage(category)

      messages.push({
        id: id++,
        category,
        channel,
        ...content,
      })
    }
  }

  return messages
}

const messages = generateMessages()
const outPath = path.join(__dirname, 'messages.json')
fs.writeFileSync(outPath, JSON.stringify(messages, null, 2))
console.log(`Generated ${messages.length} vendor outreach messages → ${outPath}`)
