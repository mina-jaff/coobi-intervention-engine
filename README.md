# Coobi Intervention Engine
A server-side intervention engine for delivering micro-interventions to support addiction recovery. This system determines which intervention to deliver to a user based on their daily data.

## Project Overview
The intervention engine consists of:

### Exercise Modelling: A scalable content model for exercises with:

Support for ordered steps
Localization
Conditional branching


### Intervention Processor: Logic to decide whether and which intervention to send to a user based on:

Daily data (stress, sleep, activity)
Past interaction history


## Tech Stack

Backend: Node.js, Express.js, TypeScript
Database: PostgreSQL with Prisma ORM
API: RESTful API
Testing: Jest

## Getting Started
### Prerequisites

Node.js (v16+)
PostgreSQL
npm or yarn

### Installation

Clone the repository:
```bash
git clone https://github.com/mina-jaff/coobi-intervention-engine.git
cd coobi-intervention-engine
```

Install dependencies:
```bash
npm install
# or if you prefer yarn
yarn
```

Create a .env file based on the example:
```bash
cp .env.example .env
```
Then update your database connection string in the .env file:
```bash
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/coobi_intervention_engine"
```

Set up the database:
```bash
# Create the database
npx prisma migrate dev --name init
```

# Seed the database with sample data
npm run db:seed


## Running the Application
Start the development server:
```bash
npm run dev
```
The server will start on http://localhost:3000. You should see console output like:
Server running on port 3000
Health check available at http://localhost:3000/health
API documentation available at http://localhost:3000/api-docs

## Testing the API
I've set up multiple ways to test and interact with the API:

### Using Swagger UI
The easiest way to test the API is through the Swagger documentation:

Start the server if it's not already running
Open http://localhost:3000/api-docs in your browser
You'll see all the available endpoints with descriptions
Click on any endpoint, then click "Try it out" to execute requests

Here's a quick test flow you can try:

First, get an intervention for a user: GET /api/users/{userId}/interventions/today
Use one of the seeded user IDs (e.g., 1a46c026-361c-4c12-9b6a-8903447faf32)
Note the interactionId and step IDs from the response
Record a response to a step: POST /api/interactions/{interactionId}/steps/{stepId}/response
Mark the intervention as completed: POST /api/interactions/{interactionId}/complete

## Quick Start: Test the API

Submitting daily might be a bit tricky in the beginning, so the script below will help you do that. This will allow you to test the endpoints.
To quickly test the intervention engine with sample data, I've included a setup script that:
1. Creates sample daily data for a user
2. Creates a matching intervention with exercises and steps

Here's how to use it:

```bash
# Create a test setup script
cat > setup-test-data.js << 'EOL'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Setting up test data...');
  
  // 1. Find a user (or create one if none exists)
  let user = await prisma.user.findFirst();
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        language: 'en'
      }
    });
    console.log('Created new user:', user.id);
  } else {
    console.log('Using existing user:', user.id);
  }
  
  // 2. Create daily data for today with specific metrics
  const dailyData = await prisma.dailyData.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: new Date()
      }
    },
    update: {
      stressLevel: 3.0,   // High stress (>2)
      sleepHours: 4.5,    // Low sleep (<5)
      activitySteps: 2000, // Low activity (<3000)
      activityMinutes: 5   // Low activity (<10)
    },
    create: {
      userId: user.id,
      date: new Date(),
      stressLevel: 3.0,
      sleepHours: 4.5,
      activitySteps: 2000,
      activityMinutes: 5
    }
  });
  
  console.log('Created daily data:', {
    stressLevel: dailyData.stressLevel,
    sleepHours: dailyData.sleepHours,
    activitySteps: dailyData.activitySteps
  });
  
  // 3. Create a matching intervention
  const condition = 'high_stress_low_sleep_low_activity';
  
  // Check if we already have this intervention
  const existingIntervention = await prisma.intervention.findFirst({
    where: {
      condition,
      isActive: true
    },
    include: {
      exercises: {
        include: {
          steps: true
        }
      }
    }
  });
  
  if (existingIntervention && 
      existingIntervention.exercises.length > 0 && 
      existingIntervention.exercises[0].steps.length > 0) {
    console.log('Using existing intervention:', existingIntervention.id);
  } else {
    // Create new intervention with exercise and step
    const intervention = await prisma.intervention.create({
      data: {
        name: "Test Intervention",
        description: "A test intervention for API testing",
        condition: condition,
        priority: 10,
        isActive: true,
        exercises: {
          create: [
            {
              name: "Test Exercise",
              description: "A test exercise",
              orderIndex: 0,
              isActive: true,
              steps: {
                create: [
                  {
                    type: "INFORMATION",
                    content: {
                      title: "Test Step",
                      content: "This is a test step in the intervention engine.",
                      acknowledgmentRequired: true
                    },
                    orderIndex: 0,
                    isActive: true
                  },
                  {
                    type: "QUESTION_SINGLE_CHOICE",
                    content: {
                      title: "Test Question",
                      question: "How would you rate this intervention engine?",
                      options: [
                        { id: "opt-1", text: "Excellent", value: 5 },
                        { id: "opt-2", text: "Good", value: 4 },
                        { id: "opt-3", text: "Average", value: 3 },
                        { id: "opt-4", text: "Below Average", value: 2 },
                        { id: "opt-5", text: "Poor", value: 1 }
                      ],
                      required: true
                    },
                    orderIndex: 1,
                    isActive: true
                  }
                ]
              }
            }
          ]
        }
      }
    });
    
    console.log('Created new intervention:', intervention.id);
  }
  
  console.log('\nSetup complete! 🎉');
  console.log('\nTest the API with these steps:');
  console.log(`1. GET /api/users/${user.id}/interventions/today`);
  console.log('2. Copy the interactionId and stepId from the response');
  console.log('3. POST /api/interactions/{interactionId}/steps/{stepId}/response');
  console.log('   with body: {"response": {"acknowledged": true}}');
  console.log('4. POST /api/interactions/{interactionId}/complete');
  
  // Return the user ID for convenience
  return user.id;
}

main()
  .then(async (userId) => {
    console.log(`\nUser ID for testing: ${userId}`);
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error setting up test data:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
EOL

# Run the script
node setup-test-data.js
After running this script, you'll get a user ID and instructions for testing the API using Swagger UI or curl.
The script creates:

Daily data with metrics that will trigger an intervention (high stress, low sleep, low activity)
A matching intervention with two test steps (an information step and a question step)

This ensures you can test the complete API flow without having to manually create records or guess at the right values.
```

### Using Prisma Studio
To explore the database directly:
```bash
npx prisma studio
```
This opens a visual database browser at http://localhost:5555 where you can:

View and edit data in all tables
Create new records
Check relationships between tables

It's super useful for seeing how interventions, exercises, and steps are structured!

Using curl
If you prefer the command line, here are some example curl commands:
```bash
# Get an intervention for a user
curl -X GET http://localhost:3000/api/users/1a46c026-361c-4c12-9b6a-8903447faf32/interventions/today

# Record a response (replace the IDs with ones from your database)
curl -X POST \
  http://localhost:3000/api/interactions/YOUR_INTERACTION_ID/steps/YOUR_STEP_ID/response \
  -H 'Content-Type: application/json' \
  -d '{"response": {"acknowledged": true}}'

# Complete an intervention
curl -X POST http://localhost:3000/api/interactions/YOUR_INTERACTION_ID/complete
```

## Project Structure

src/ - Source code

controllers/ - API endpoint handlers
services/ - Business logic
types/ - TypeScript type definitions
routes/ - API route definitions
config/ - Configuration files
db/ - Database scripts and migrations


### If anything's unclear or you run into issues, feel free to reach out!
