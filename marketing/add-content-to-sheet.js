#!/usr/bin/env node

/**
 * Adds generated content rows to the Google Sheet
 * Usage: node marketing/add-content-to-sheet.js
 */

require('dotenv').config({ path: '.env' });
const { google } = require('googleapis');

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

async function addContentToSheet(rows) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: SERVICE_ACCOUNT,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get sheet metadata to find the first sheet
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const firstSheetTitle = metadata.data.sheets[0].properties.title;
    console.log(`Using sheet: "${firstSheetTitle}"`);

    // Append rows
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${firstSheetTitle}!A2`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: rows,
      },
    });

    console.log(`✓ Added ${response.data.updates.updatedRows} rows to Google Sheet`);
    console.log(`✓ Updated cells: ${response.data.updates.updatedCells}`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// Example posts
const examplePosts = [
  [
    '2026-03-17',
    'Instagram',
    'Vendor Spotlight',
    '📸 Meet Emma — our top photographer! 50+ bookings since joining Event Nest 2 months ago. "The platform is so easy to use and the bookings just keep coming!" Ready to start earning? Join for free today 👇',
    'Instagram 1080x1350px: Emma\'s best event photo (vibrant, high-quality), overlay a testimonial quote "bookings just keep coming", Event Nest purple accent bar bottom, white sans-serif text',
    '#EventNest #Photographers #WeddingPhotography #HirePhotographer #EventVendor',
    'Draft',
    'Looks great',
  ],
  [
    '2026-03-20',
    'LinkedIn',
    'Vendor Tip',
    '🎯 Event Tip: How to stand out as a photographer\n\n1️⃣ Show your best work first\n2️⃣ Tell the story behind each photo\n3️⃣ Respond fast to inquiries\n4️⃣ Ask for reviews after every event\n\nReady to showcase your work to thousands of couples? Join Event Nest 🔗',
    'LinkedIn 1200x628px: Split design - left side shows 4 numbered tips in bold, right side shows happy couple photo, Event Nest logo top-right',
    '#EventVendor #Photography #SmallBusiness #Events #Photographer',
    'Draft',
    'Maybe add icon emojis to the 4 tips',
  ],
];

addContentToSheet(examplePosts)
  .then(() => console.log('\n✓ Done! Check your Google Sheet now.'))
  .catch(console.error);
