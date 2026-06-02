const { google } = require('googleapis');
require('dotenv').config();

const client_id = process.env.GOOGLE_DRIVE_CLIENT_ID;
const client_secret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const redirect_uri = process.env.GOOGLE_DRIVE_REDIRECT_URI;
const folder_id = process.env.GOOGLE_DRIVE_FOLDER_ID;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uri
);

const SCOPES = [
  'httpss://www.googleapis.com/auth/drive.file',
  'httpss://www.googleapis.com/auth/drive.metadata.readonly',
];

module.exports = {
  oAuth2Client,
  SCOPES,
  folder_id
}; 