const fs = require('fs')
const path = require('path')

const themes = {
  wedding: [
    'Your dream wedding starts with the right team',
    'Finding the perfect wedding vendor shouldn\'t be stressful',
    'One platform. Every vendor you need for your big day',
    'Compare wedding vendors, read real reviews, book with confidence',
    'Your wedding deserves vendors who truly care',
  ],
  corporate: [
    'Corporate events made effortless with Event Nest',
    'From conferences to team retreats — find the best vendors',
    'Plan your next corporate event without the chaos',
    'Trusted vendors for unforgettable corporate experiences',
    'Stop juggling spreadsheets. Start booking the right vendors',
  ],
  birthday: [
    'Make their birthday one to remember',
    'Birthday party planning? We\'ve got the vendors',
    'From DJs to decorators — book birthday vendors instantly',
    'Every birthday deserves a little magic',
    'The easiest way to plan an epic birthday bash',
  ],
  vendor: [
    'Event vendors: your next booking is waiting on Event Nest',
    'Get discovered by customers who need exactly what you offer',
    'Join Event Nest and grow your event business',
    'More visibility. More bookings. Less admin',
    'The smartest way for event vendors to get found',
  ],
  general: [
    'Every great event starts with the right plan',
    'Browse, compare, and book event vendors in one place',
    'Event planning doesn\'t have to be overwhelming',
    'Real reviews. Real vendors. Real results',
    'Your event. Your vision. We help you find the team',
  ],
  tips: [
    'Top 5 questions to ask before booking a caterer',
    'How to set a realistic event budget (and stick to it)',
    '3 signs you\'ve found the right event photographer',
    'Why booking early saves you money and stress',
    'The vendor checklist every event planner needs',
  ],
}

const hashtagSets = {
  wedding: ['#WeddingPlanning', '#Wedding', '#WeddingVendors', '#BrideToBeUK', '#EventNest'],
  corporate: ['#CorporateEvents', '#EventProfs', '#BusinessEvents', '#ConferencePlanning', '#EventNest'],
  birthday: ['#BirthdayParty', '#PartyPlanning', '#BirthdayIdeas', '#Celebration', '#EventNest'],
  vendor: ['#EventVendors', '#GrowYourBusiness', '#EventIndustry', '#SmallBusinessUK', '#EventNest'],
  general: ['#EventPlanning', '#Events', '#PartyPlanning', '#EventTips', '#EventNest'],
  tips: ['#EventTips', '#EventPlanning', '#PlanningTips', '#EventAdvice', '#EventNest'],
}

const imageDescriptions = {
  wedding: 'Elegant wedding table setting with flowers and candlelight',
  corporate: 'Professional conference setup with branded stage',
  birthday: 'Colourful birthday party decorations with balloons',
  vendor: 'Event vendor setting up equipment with a smile',
  general: 'Beautiful event venue with happy guests',
  tips: 'Clean infographic-style visual with tip text overlay',
}

function generatePosts() {
  const posts = []
  let id = 1

  // 30 Instagram posts
  for (const [theme, messages] of Object.entries(themes)) {
    for (const text of messages) {
      posts.push({
        id: id++,
        platform: 'instagram',
        theme,
        text,
        hashtags: hashtagSets[theme],
        suggestedImageDescription: imageDescriptions[theme],
      })
    }
  }

  // 30 Twitter/X posts (shorter, punchier)
  for (const [theme, messages] of Object.entries(themes)) {
    for (const text of messages) {
      posts.push({
        id: id++,
        platform: 'twitter',
        theme,
        text: text.length > 200 ? text.slice(0, 197) + '...' : text,
        hashtags: hashtagSets[theme].slice(0, 3),
        suggestedImageDescription: imageDescriptions[theme],
      })
    }
  }

  // 10 LinkedIn posts (professional tone)
  const linkedInThemes = ['vendor', 'corporate', 'general', 'tips']
  for (const theme of linkedInThemes) {
    const messages = themes[theme]
    const count = (theme === 'tips' || theme === 'vendor') ? 3 : 2
    const selected = messages.slice(0, count)
    for (const text of selected) {
      const expanded = `${text}.\n\nEvent Nest connects event planners with trusted, verified vendors — making it easier to compare, communicate, and book all in one place.\n\n${theme === 'vendor' ? 'If you\'re an event vendor looking to grow your bookings, join our platform today.' : 'Whether you\'re planning a wedding, corporate event, or birthday, we\'ve got you covered.'}`
      posts.push({
        id: id++,
        platform: 'linkedin',
        theme,
        text: expanded,
        hashtags: ['#EventNest', '#EventPlanning', '#EventIndustry'],
        suggestedImageDescription: imageDescriptions[theme],
      })
    }
  }

  return posts
}

const posts = generatePosts()
const outPath = path.join(__dirname, 'posts.json')
fs.writeFileSync(outPath, JSON.stringify(posts, null, 2))
console.log(`Generated ${posts.length} social media posts → ${outPath}`)
