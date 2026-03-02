# Resonate Health - Server

Backend API for Resonate Health fitness and wellness platform with AI-powered personalization.

## Features

- User authentication and authorization
- Fitness tracking and workout management
- Nutrition planning and meal logging
- Daily check-ins (sleep, stress, energy)
- Diagnostic data management (blood tests, BCA, CGM)
- AI-powered recommendations
- **Memory Layer**: Personalized context using Mem0 Platform

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT, Firebase Auth, Google OAuth
- **Memory Layer**: Mem0 Platform
- **Cloud Storage**: Cloudinary
- **Notifications**: Twilio WhatsApp

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB instance
- Mem0 Platform API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```bash
   # Server
   PORT=5000
   CLIENT_URL=http://localhost:5173
   MICROSERVICE_URL=http://127.0.0.1:8000
   
   # Database
   MONGO_URI=your_mongodb_connection_string
   
   # Authentication
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/fit/google/callback
   
   # Mem0 Platform (Memory Layer)
   MEM0_API_KEY=your_mem0_api_key
   MEM0_AGENT_ID=resonate-health-agent
   MEM0_PROJECT_NAME=resonate-health-memory
   
   # Cloudinary
   CLOUD_NAME=your_cloud_name
   CLOUD_API_KEY=your_api_key
   CLOUD_API_SECRET=your_api_secret
   
   # Twilio
   TWILIO_SID=your_twilio_sid
   TWILIO_AUTH=your_twilio_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Mem0 Platform Setup

### Connectivity Checklist

Follow these steps to set up the Mem0 memory layer:

- [ ] **Step 1**: Sign up for Mem0 Platform account at [mem0.ai](https://mem0.ai)
- [ ] **Step 2**: Create a new project named "resonate-health-memory"
- [ ] **Step 3**: Generate API key from Mem0 dashboard
- [ ] **Step 4**: Add `MEM0_API_KEY` to `.env` file
- [ ] **Step 5**: Run connectivity test:
  ```bash
  node scripts/test-mem0-connectivity.js
  ```
- [ ] **Step 6**: Verify all tests pass:
  - ✅ Authentication works
  - ✅ Can add memory
  - ✅ Can search memory
  - ✅ Error handling works
  - ✅ Cleanup successful

### Memory Schema

The memory layer uses a structured taxonomy with 9 core categories:

1. `fitness.training` - Workout sessions and training data
2. `nutrition.intake` - Meals and dietary information
3. `recovery.sleep` - Sleep tracking and quality
4. `recovery.stress` - Stress levels and recovery status
5. `diagnostics.blood` - Blood test results and biomarkers
6. `diagnostics.bca` - Body composition analysis
7. `diagnostics.cgm` - Continuous glucose monitoring
8. `intervention.plan` - AI recommendations
9. `intervention.outcome` - Intervention results

See `docs/memory_schema.md` for complete documentation.

## Project Structure

```
Resonate-Server/
├── src/
│   ├── config/          # Configuration files
│   │   └── mem0.config.js
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middlewares/     # Express middlewares
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── scripts/             # Utility scripts
│   └── test-mem0-connectivity.js
├── docs/                # Documentation
│   └── memory_schema.md
├── .env                 # Environment variables
└── package.json
```

## API Endpoints

### API Documentation
The full Swagger API documentation is available at:
- `http://localhost:5000/api-docs` (Local Development)

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/google` - Google OAuth

### Fitness
- `GET /fitness/workouts` - Get user workouts
- `POST /fitness/workouts` - Log workout
- `GET /fitness/plans` - Get fitness plans

### Nutrition
- `GET /nutrition/meals` - Get meal logs
- `POST /nutrition/meals` - Log meal
- `GET /nutrition/plans` - Get nutrition plans

### Daily Logs
- `POST /daily-logs` - Create daily check-in
- `GET /daily-logs/weekly` - Get weekly trends

### Diagnostics
- `POST /diagnostics/blood` - Upload blood test
- `POST /diagnostics/bca` - Upload BCA scan
- `GET /diagnostics/history` - Get diagnostic history

### Memory
- `GET /user/memories` - Get own memories
- `GET /api/admin/memory/:userId` - Get user memories (Admin)
- `POST /api/admin/memory/:userId` - Add memory (Admin)
- `DELETE /api/admin/memory/:memoryId` - Delete memory (Admin)

## Development

### Running Tests
```bash
npm test
```

### Memory Layer Testing
```bash
# Test Mem0 connectivity
node scripts/test-mem0-connectivity.js
```

## Memory Layer Implementation Status

### ✅ Completed (Pre-Day 1 & Day 1)
- [x] Mem0 Platform account setup
- [x] API key configuration
- [x] Connectivity test script
- [x] Memory taxonomy definition (9 categories)
- [x] Metadata standard
- [x] Category-specific examples (17 examples)
- [x] Validation rules

### 🚧 In Progress
- [ ] MemoryService wrapper (Day 2)
- [ ] Ingestion adapters (Days 3-4)
- [ ] Retrieval strategy (Day 5)
- [ ] AI integration (Day 6)

### 📋 Planned
- [ ] Memory QA tools (Day 7)
- [ ] Intervention system (Day 8)
- [ ] Insights engine (Day 9)
- [ ] Full integration testing (Days 10-14)

## Contributing

1. Follow the memory schema strictly
2. All memories must include proper metadata
3. Use the MemoryService wrapper (don't call Mem0 API directly)
4. Write tests for new features

## License

Proprietary - Resonate Health
