/**
 * ONE-TIME MIGRATION SCRIPT
 * Fixes existing projects that have clientId but missing clientEmail
 * Run this once: node scripts/fix-project-client-linkage.js
 */

const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

// Simple .env parser
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      env[key] = value;
    }
  });
  return env;
}

const env = loadEnv();

async function fixProjectClientLinkage() {
  const client = await MongoClient.connect(env.MONGODB_URI);
  const db = client.db('pixelsdigital');

  console.log('🔧 Starting project-client linkage fix...\n');

  // Find all projects
  const projects = await db.collection('projects').find({}).toArray();
  console.log(`📊 Found ${projects.length} total projects`);

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const project of projects) {
    const projectId = project._id;
    const projectName = project.projectName || 'Unnamed';

    // Check if clientEmail is missing
    if (project.clientId && !project.clientEmail) {
      console.log(`\n🔍 Project: ${projectName} (${projectId})`);
      console.log(`   Has clientId: ${project.clientId}`);
      console.log(`   Missing clientEmail - fixing...`);

      try {
        // Fetch client by clientId
        const client = await db.collection('clients').findOne({
          _id: new ObjectId(project.clientId),
        });

        if (client) {
          // Update project with clientEmail
          await db.collection('projects').updateOne(
            { _id: projectId },
            { $set: { clientEmail: client.email } }
          );
          console.log(`   ✅ Fixed! Set clientEmail to: ${client.email}`);
          fixed++;
        } else {
          console.log(`   ⚠️  Client not found for clientId: ${project.clientId}`);
          errors++;
        }
      } catch (error) {
        console.log(`   ❌ Error fixing project: ${error.message}`);
        errors++;
      }
    } else if (!project.clientId && !project.clientEmail) {
      console.log(`\n⚠️  Project: ${projectName} (${projectId}) has NO client linkage!`);
      errors++;
    } else {
      skipped++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY:');
  console.log(`   ✅ Fixed: ${fixed} projects`);
  console.log(`   ⏭️  Skipped (already correct): ${skipped} projects`);
  console.log(`   ❌ Errors: ${errors} projects`);
  console.log('='.repeat(60));

  await client.close();
  console.log('\n✨ Migration complete!');
}

fixProjectClientLinkage().catch(console.error);
