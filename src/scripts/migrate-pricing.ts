import { getPayload } from 'payload'
import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'

// Load environment variables manually
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#\s]+?)=(.*)$/)
    if (match) {
      process.env[match[1]] = match[2].trim().replace(/^['"](.*)['"]$/, '$1')
    }
  })
}

async function migrate() {
  console.log('Starting pricing matrix migration...')

  // 1. Connect to MongoDB directly to read the old data that Payload schema now ignores
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing')
  }
  
  console.log('Connecting to MongoDB...')
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to DB.')

  // 2. Fetch the old global pricing-page document directly from MongoDB
  const db = mongoose.connection.db
  if (!db) {
    throw new Error('Database connection failed to establish.')
  }
  const globalsCollection = db.collection('globals')
  
  const pricingPageDoc = await globalsCollection.findOne({ globalType: 'pricing-page' })
  
  if (!pricingPageDoc || !pricingPageDoc.standardPlans) {
    console.log('No old standardPlans data found in pricing-page global. Exiting.')
    process.exit(0)
  }

  const oldPlans = pricingPageDoc.standardPlans
  console.log(`Found ${oldPlans.length} old plans to migrate.`)

  // 3. Initialize Payload to create new records
  const configModule = await import('../payload.config')
  const payload = await getPayload({ config: configModule.default })

  // 4. Create a default category since old data didn't have categories
  console.log('Creating default General category...')
  const categoryRes = await payload.create({
    collection: 'feature-categories',
    data: {
      title: 'GENERAL FEATURES',
      order: 1
    }
  })
  const categoryId = categoryRes.id

  // 5. Extract all unique features across all old plans
  console.log('Extracting unique features...')
  const uniqueFeatureNames = Array.from(new Set(
    oldPlans.flatMap((plan: any) => 
      (plan.features || []).map((f: any) => f.featureText)
    )
  )).filter(Boolean) as string[]

  const featureMap: Record<string, string> = {}
  
  // 6. Create the features
  for (let i = 0; i < uniqueFeatureNames.length; i++) {
    const featureName = uniqueFeatureNames[i]
    console.log(`Creating feature: ${featureName}`)
    const featureRes = await payload.create({
      collection: 'features',
      data: {
        title: featureName,
        category: categoryId as any,
        order: i + 1
      }
    })
    featureMap[featureName] = featureRes.id
  }

  // 7. Create the Plans and link the features
  for (let i = 0; i < oldPlans.length; i++) {
    const oldPlan = oldPlans[i]
    console.log(`Migrating plan: ${oldPlan.title}`)
    
    const planFeatures = (oldPlan.features || []).map((f: any) => {
      return {
        feature: featureMap[f.featureText],
        value: f.value || 'Yes'
      }
    })

    await payload.create({
      collection: 'plans',
      data: {
        name: oldPlan.title,
        description: oldPlan.description || '',
        isRecommended: oldPlan.isRecommended || false,
        monthlyPrice: oldPlan.monthlyPrice || 0,
        quarterlyPrice: oldPlan.quarterlyPrice || 0,
        annualPrice: oldPlan.annualPrice || 0,
        planFeatures: planFeatures,
        order: i + 1
      }
    })
  }

  console.log('Migration completed successfully! All data pushed to new DB structure.')
  process.exit(0)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
