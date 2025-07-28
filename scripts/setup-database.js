const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log("🚀 Setting up database...")

    // Read and execute the schema SQL
    const schemaSQL = fs.readFileSync(path.join(__dirname, "01-create-tables.sql"), "utf8")

    const { error: schemaError } = await supabase.rpc("exec_sql", {
      sql: schemaSQL,
    })

    if (schemaError) {
      console.error("Error creating schema:", schemaError)
      process.exit(1)
    }

    console.log("✅ Database schema created successfully")

    // Read and execute the seed data SQL
    const seedSQL = fs.readFileSync(path.join(__dirname, "02-seed-data.sql"), "utf8")

    const { error: seedError } = await supabase.rpc("exec_sql", {
      sql: seedSQL,
    })

    if (seedError) {
      console.error("Error seeding data:", seedError)
      process.exit(1)
    }

    console.log("✅ Database seeded successfully")
    console.log("🎉 Database setup complete!")
  } catch (error) {
    console.error("Setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()
