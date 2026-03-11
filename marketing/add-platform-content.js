#!/usr/bin/env node

/**
 * Adds platform-focused content (not vendor spotlights) to the Google Sheet
 * Focus: Show Event Nest features + drive waitlist signups
 */

require('dotenv').config({ path: '.env' });
const { google } = require('googleapis');

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

async function addContent(rows) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: SERVICE_ACCOUNT,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get sheet metadata
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetTitle = metadata.data.sheets[0].properties.title;
    console.log(`Adding content to: "${sheetTitle}"`);

    // Delete existing content first (rows 2-3)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: metadata.data.sheets[0].properties.sheetId,
                dimension: 'ROWS',
                startIndex: 1,
                endIndex: 3,
              },
            },
          },
        ],
      },
    });
    console.log('✓ Cleared old posts');

    // Add new rows
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetTitle}!A2`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: rows,
      },
    });

    console.log(`✓ Added ${response.data.updates.updatedRows} new posts`);
    console.log('✓ Done!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

// Platform-focused posts (NOT vendor spotlights)
const platformPosts = [
  [
    '2026-03-17',
    'Instagram',
    'Platform Feature',
    "🎉 Planning an event? Event Nest makes finding vendors SO easy.\n\n✅ Browse 1000+ vendors in seconds\n✅ See real reviews & photos\n✅ Get instant quotes\n✅ Book with one click\n\nStop jumping between 10 websites. Everything you need in one place.\n\nJoin the waitlist → eventnestgroup.com/waitlist",
    'Instagram 1080x1350px: Split screen - left side shows stressed person with phone chaos, right side shows happy person with Event Nest interface clean & organized. Event Nest logo + purple accent. URL (eventnestgroup.com/waitlist) at bottom.',
    '#EventPlanning #Weddings #Birthdays #Events #VendorSearch',
    'Draft',
    '',
  ],
  [
    '2026-03-20',
    'LinkedIn',
    'Vendor Benefit',
    "💼 Event Nest is hiring vendors.\n\nIf you offer event services (photography, catering, DJ, flowers, etc.), Event Nest connects you with customers actively booking.\n\n🎯 No commissions upfront\n🎯 Keep 100% of quotes you send\n🎯 Grow your business organically\n\nVendors are joining daily. Get on the waitlist before launch.\n\neventnestgroup.com/waitlist",
    'LinkedIn 1200x628px: Professional looking image with vendor types (photographer, caterer, DJ) arranged in grid. Text: "Event Nest: Where vendors grow their business." URL (eventnestgroup.com/waitlist) and Event Nest branding bottom.',
    '#SmallBusiness #EventVendor #Entrepreneur #BusinessGrowth #Freelance',
    'Draft',
    '',
  ],
];

addContent(platformPosts);
