// const cron = require('node-cron');
// const Result = require('../models/Result');  

// // Run the job every day at midnight
// cron.schedule('0 0 * * *', async () => {
//   const cutoffDate = new Date();
//   cutoffDate.setDate(cutoffDate.getDate() - 180);

//   try {
//     const updatedResults = await Result.updateMany(
//       {
//         updatedAt: { $lte: cutoffDate },  // Check if 180+ days old
//         certificateURL: { $ne: null }    // Only update if certificateURL is not null
//       },
//       { $unset: { certificateURL: "" } }   // Remove certificate link
//     );

//     console.log(`Removed certificates for ${updatedResults.modifiedCount} results.`);
//   } catch (error) {
//     console.error('Error in auto-delete job:', error);
//   }
// });


const cron = require('node-cron');
const Result = require('../models/Result');

// Run the job every 2 minutes
cron.schedule('*/59 * * * *', async () => {
  try {
    // Set certificateURL to null only if it's currently null or an empty string
    const updatedCertificates = await Result.updateMany(
      Result.find({ certificateURL: { $nin: [null, ""] } })
,  // Filter: Only update if null or empty
      { $set: { certificateURL: null } }        // Set to null
    );

    console.log(`Updated certificateURL to null for ${updatedCertificates.modifiedCount} results.`);
  } catch (error) {
    console.error('Error in auto-update job:', error);
  }
});
