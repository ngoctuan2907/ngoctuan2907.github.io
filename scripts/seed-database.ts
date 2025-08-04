import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // First, create cuisine types
    const cuisineTypes = [
      'Peranakan',
      'Western Fusion', 
      'Indian',
      'Chinese',
      'Desserts',
      'Healthy',
      'Local',
      'Japanese',
      'Korean',
      'Thai',
      'Vietnamese',
      'Italian'
    ]

    console.log('Creating cuisine types...')
    for (const cuisine of cuisineTypes) {
      const { error } = await supabase
        .from('cuisine_types')
        .insert({ name: cuisine })
        .select()

      if (error && !error.message.includes('duplicate key')) {
        console.error(`Error creating cuisine ${cuisine}:`, error)
      }
    }

    // Create sample businesses
    const businesses = [
      {
        business_name: "Ah Ma's Kitchen",
        slug: "ah-mas-kitchen", 
        description: "Welcome to Ah Ma's Kitchen, where traditional Peranakan recipes meet modern home dining. Started by Mrs. Lim in her HDB flat, we specialize in authentic Nyonya kueh and traditional dishes passed down through three generations.",
        specialty: "Authentic Nyonya Kueh & Traditional Peranakan Dishes",
        full_address: "Blk 123 Toa Payoh Lorong 1, #01-456, Singapore 310123",
        district: "Toa Payoh",
        postal_code: "310123",
        phone: "+65 9123 4567",
        email: "ahmaskitchen@gmail.com",
        price_range: "$$",
        status: "active",
        instagram_handle: "@ahmas_kitchen_sg",
        whatsapp_number: "+65 9123 4567"
      },
      {
        business_name: "Brew & Bite",
        slug: "brew-and-bite",
        description: "Artisan coffee and gourmet brunch served from our cozy home setup. We focus on ethically sourced beans and locally inspired fusion dishes.",
        specialty: "Artisan Coffee & Gourmet Brunch",
        full_address: "Blk 456 Tampines Ave 5, #02-789, Singapore 529789",
        district: "Tampines", 
        postal_code: "529789",
        phone: "+65 8765 4321",
        email: "hello@brewandbite.sg",
        price_range: "$$$",
        status: "active",
        instagram_handle: "@brewandbite_sg"
      },
      {
        business_name: "Spice Route Home",
        slug: "spice-route-home",
        description: "Authentic North and South Indian home-cooked meals prepared with love and traditional spices. Family recipes passed down through generations.",
        specialty: "Homestyle Indian Curries & Traditional Dishes",
        full_address: "Blk 789 Jurong West St 91, #03-123, Singapore 640789",
        district: "Jurong West",
        postal_code: "640789", 
        phone: "+65 9876 5432",
        email: "spiceroute@gmail.com",
        price_range: "$",
        status: "active",
        instagram_handle: "@spiceroutehome"
      },
      {
        business_name: "Noodle Nest",
        slug: "noodle-nest",
        description: "Hand-pulled noodles and traditional Chinese soups made fresh daily. Experience authentic flavors from our family's hometown recipes.",
        specialty: "Hand-pulled Noodles & Traditional Chinese Soups",
        full_address: "Blk 321 Ang Mo Kio Ave 3, #01-234, Singapore 560321",
        district: "Ang Mo Kio",
        postal_code: "560321",
        phone: "+65 8765 1234", 
        email: "noodlenest@hotmail.com",
        price_range: "$$",
        status: "active"
      }
    ]

    console.log('Creating sample businesses...')
    const createdBusinesses = []
    for (const business of businesses) {
      const { data, error } = await supabase
        .from('businesses')
        .insert(business)
        .select()
        .single()

      if (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`Business ${business.business_name} already exists, skipping...`)
          const { data: existing } = await supabase
            .from('businesses')
            .select('*')
            .eq('slug', business.slug)
            .single()
          if (existing) createdBusinesses.push(existing)
        } else {
          console.error(`Error creating business ${business.business_name}:`, error)
        }
      } else {
        console.log(`✅ Created business: ${business.business_name}`)
        createdBusinesses.push(data)
      }
    }

    // Create business hours for each business
    console.log('Setting up business hours...')
    for (const business of createdBusinesses) {
      const hours = [
        { day_of_week: 1, is_open: true, open_time: '09:00', close_time: '18:00' }, // Monday
        { day_of_week: 2, is_open: true, open_time: '09:00', close_time: '18:00' }, // Tuesday
        { day_of_week: 3, is_open: true, open_time: '09:00', close_time: '18:00' }, // Wednesday 
        { day_of_week: 4, is_open: true, open_time: '09:00', close_time: '18:00' }, // Thursday
        { day_of_week: 5, is_open: true, open_time: '09:00', close_time: '18:00' }, // Friday
        { day_of_week: 6, is_open: true, open_time: '08:00', close_time: '19:00' }, // Saturday
        { day_of_week: 0, is_open: false } // Sunday - closed
      ]

      for (const hour of hours) {
        const { error } = await supabase
          .from('business_hours')
          .insert({
            business_id: business.id,
            ...hour
          })

        if (error && !error.message.includes('duplicate key')) {
          console.error(`Error creating hours for ${business.business_name}:`, error)
        }
      }
    }

    // Create some sample reviews
    console.log('Creating sample reviews...')
    const sampleReviews = [
      {
        business_id: createdBusinesses[0]?.id, // Ah Ma's Kitchen
        rating: 5,
        comment: "Amazing authentic Peranakan food! The kueh lapis was exactly like my grandmother used to make. Mrs. Lim is so passionate about preserving these traditional recipes."
      },
      {
        business_id: createdBusinesses[0]?.id,
        rating: 5, 
        comment: "Best laksa lemak I've had in Singapore! The flavors are so rich and authentic. Definitely ordering again."
      },
      {
        business_id: createdBusinesses[1]?.id, // Brew & Bite
        rating: 4,
        comment: "Great coffee and the avocado toast was Instagram-worthy! Love supporting local home businesses."
      },
      {
        business_id: createdBusinesses[2]?.id, // Spice Route Home
        rating: 5,
        comment: "Incredible curry! Tastes just like my Indian friend's mother's cooking. So authentic and flavorful."
      }
    ]

    for (const review of sampleReviews) {
      if (review.business_id) {
        const { error } = await supabase
          .from('reviews')
          .insert(review)

        if (error && !error.message.includes('duplicate key')) {
          console.error('Error creating review:', error)
        }
      }
    }

    // Update stats in the API response
    const stats = await calculateStats()
    console.log('📊 Current stats:', stats)

    console.log('✅ Database seeding completed!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

async function calculateStats() {
  // Get business count
  const { count: businessCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Mock other stats for now
  return {
    cafes: businessCount || 4,
    customers: 1247,
    orders: 5692
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('Seeding completed')
    process.exit(0)
  }).catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })
}

export { seedDatabase }
