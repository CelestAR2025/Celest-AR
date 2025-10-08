import { db } from '../config/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

export const fixUserDocuments = async () => {
  try {
    console.log('Starting user document migration...');
    
    // Get all user documents
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    const migrations = [];
    
    usersSnapshot.docs.forEach((docSnapshot) => {
      const userData = docSnapshot.data();
      const currentDocId = docSnapshot.id;
      const correctDocId = userData.uid;
      
      // If the document ID doesn't match the UID, we need to migrate
      if (currentDocId !== correctDocId) {
        migrations.push({
          currentDocId,
          correctDocId,
          userData
        });
      }
    });
    
    console.log(`Found ${migrations.length} documents that need migration`);
    
    // Perform migrations
    for (const migration of migrations) {
      console.log(`Migrating user: ${migration.userData.email}`);
      console.log(`From document ID: ${migration.currentDocId}`);
      console.log(`To document ID: ${migration.correctDocId}`);
      
      // Create new document with correct ID
      await setDoc(doc(db, 'users', migration.correctDocId), migration.userData);
      
      // Delete old document
      await deleteDoc(doc(db, 'users', migration.currentDocId));
      
      console.log(`Migration completed for ${migration.userData.email}`);
    }
    
    console.log('All migrations completed successfully!');
    return { success: true, migratedCount: migrations.length };
    
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error: error.message };
  }
};
