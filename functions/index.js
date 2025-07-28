const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

exports.deleteUserData = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const userEmail = context.auth.token.email;

  console.log(`🔥 Cloud Function: Starting deletion for user ${userId} (${userEmail})`);

  try {
    let totalDeleted = 0;

    // PRIORITY 1: Delete from leaderboard collection with multiple methods
    console.log('🏆 Deleting leaderboard documents...');
    
    // Method 1: Direct deletion by document ID
    try {
      await db.collection('leaderboard').doc(userId).delete();
      totalDeleted++;
      console.log(`✅ Deleted leaderboard/${userId} directly`);
    } catch (error) {
      console.log(`⚠️ Direct deletion failed: ${error.message}`);
    }

    // Method 2: Query by uid field
    try {
      const uidQuery = await db.collection('leaderboard').where('uid', '==', userId).get();
      console.log(`Found ${uidQuery.docs.length} documents with uid=${userId}`);
      
      const batch1 = db.batch();
      uidQuery.docs.forEach(doc => {
        batch1.delete(doc.ref);
        totalDeleted++;
        console.log(`✅ Added ${doc.id} to deletion batch (uid match)`);
      });
      
      if (uidQuery.docs.length > 0) {
        await batch1.commit();
      }
    } catch (error) {
      console.log(`⚠️ UID query deletion failed: ${error.message}`);
    }

    // Method 3: Query by email field
    try {
      const emailQuery = await db.collection('leaderboard').where('email', '==', userEmail).get();
      console.log(`Found ${emailQuery.docs.length} documents with email=${userEmail}`);
      
      const batch2 = db.batch();
      emailQuery.docs.forEach(doc => {
        batch2.delete(doc.ref);
        totalDeleted++;
        console.log(`✅ Added ${doc.id} to deletion batch (email match)`);
      });
      
      if (emailQuery.docs.length > 0) {
        await batch2.commit();
      }
    } catch (error) {
      console.log(`⚠️ Email query deletion failed: ${error.message}`);
    }

    // Method 4: Scan ALL leaderboard documents (nuclear option)
    try {
      const allDocs = await db.collection('leaderboard').get();
      console.log(`Scanning ${allDocs.docs.length} total leaderboard documents...`);
      
      const batch3 = db.batch();
      let foundMatches = 0;
      
      allDocs.docs.forEach(doc => {
        const data = doc.data();
        const docId = doc.id;
        
        // Check if this document belongs to the user
        if (docId === userId || 
            data.uid === userId || 
            data.email === userEmail ||
            data.userId === userId) {
          
          batch3.delete(doc.ref);
          totalDeleted++;
          foundMatches++;
          console.log(`🎯 MATCH FOUND: ${docId} - will delete`);
        }
      });
      
      if (foundMatches > 0) {
        await batch3.commit();
        console.log(`✅ Deleted ${foundMatches} documents via scan method`);
      } else {
        console.log('⚠️ No matches found in scan method');
      }
    } catch (error) {
      console.log(`⚠️ Scan deletion failed: ${error.message}`);
    }

    // Delete from users collection
    try {
      await db.collection('users').doc(userId).delete();
      totalDeleted++;
      console.log('✅ Deleted user document');
    } catch (error) {
      console.log(`⚠️ User document deletion failed: ${error.message}`);
    }

    // Delete from other collections
    const collections = [
      'focusSessions',
      'tasks', 
      'garden',
      'statistics',
      'userPreferences',
      'sessions',
      'achievements'
    ];
    
    for (const collectionName of collections) {
      try {
        const query = await db.collection(collectionName).where('userId', '==', userId).get();
        
        if (query.docs.length > 0) {
          const batch = db.batch();
          query.docs.forEach(doc => {
            batch.delete(doc.ref);
            totalDeleted++;
          });
          
          await batch.commit();
          console.log(`✅ Deleted ${query.docs.length} documents from ${collectionName}`);
        }
      } catch (error) {
        console.log(`⚠️ ${collectionName} deletion failed: ${error.message}`);
      }
    }

    console.log(`🎉 Cloud Function completed! Total deleted: ${totalDeleted} documents`);
    
    return { 
      success: true, 
      deletedCount: totalDeleted,
      message: `Successfully deleted ${totalDeleted} documents`,
      userId: userId,
      userEmail: userEmail
    };

  } catch (error) {
    console.error('💥 Cloud Function critical error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to delete user data', {
      originalError: error.message,
      userId: userId
    });
  }
});