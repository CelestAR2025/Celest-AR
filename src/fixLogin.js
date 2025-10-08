// Standalone script to fix user login issues
// Run this by opening browser console and pasting this code

import { db } from './config/firebase.js';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

window.fixUserLogin = async function() {
  try {
    console.log('🔧 Starting user login fix...');
    
    // Get all user documents
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    console.log(`Found ${usersSnapshot.docs.length} user documents`);
    
    for (const docSnapshot of usersSnapshot.docs) {
      const userData = docSnapshot.data();
      const currentDocId = docSnapshot.id;
      const correctDocId = userData.uid;
      
      console.log('Processing user:', userData.email);
      console.log('Current doc ID:', currentDocId);
      console.log('Should be doc ID:', correctDocId);
      
      // If the document ID doesn't match the UID, we need to migrate
      if (currentDocId !== correctDocId) {
        console.log(`❌ Mismatch detected for ${userData.email}`);
        console.log(`📝 Migrating from ${currentDocId} to ${correctDocId}`);
        
        // Create new document with correct ID
        await setDoc(doc(db, 'users', correctDocId), userData);
        console.log('✅ Created new document with correct ID');
        
        // Delete old document
        await deleteDoc(doc(db, 'users', currentDocId));
        console.log('🗑️ Deleted old document');
        
        console.log(`✅ Migration completed for ${userData.email}`);
      } else {
        console.log(`✅ User ${userData.email} already has correct structure`);
      }
    }
    
    console.log('🎉 All users fixed! Try logging in now.');
    return 'Success! All user documents have been fixed.';
    
  } catch (error) {
    console.error('❌ Error fixing users:', error);
    return `Error: ${error.message}`;
  }
};

console.log('📋 User fix script loaded!');
console.log('🚀 Run: fixUserLogin() in the console to fix the login issue');
