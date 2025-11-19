# Meju - Menu Planning App Roadmap

## Completed

### Authentication
- Google OAuth login
- Session management with NextAuth v4
- User database schema
- Protected routes

### Recipe Management (Backend)
- Create recipe API (POST /api/recipes)
- List recipes API (GET /api/recipes)
- Get single recipe API (GET /api/recipes/[id])
- Update recipe API (PUT /api/recipes/[id])
- Delete recipe API (DELETE /api/recipes/[id])
- Zod validation schemas
- Prisma database schema

### Recipe Management (Frontend)
- RecipeForm component (reusable for create/edit)
- Create recipe page (/recipes/new)
- Dashboard with recipe list
- Basic styling with Tailwind

### Testing
- Vitest setup and configuration
- Unit tests for all recipe endpoints
- Zod schema validation

---

## Next Tasks (Priority Order)

### 1. Recipe Shuffle API
Backend endpoint: GET /api/recipes/shuffle
- Query parameters: limit, includeTags, excludeTags
- Filter by user
- Apply tag filters
- Randomize and return limited results
- Example: /api/recipes/shuffle?limit=5&includeTags=lunch&excludeTags=pork

### 2. Recipe Detail Page
Frontend page: /recipes/[id]
- Display recipe with rendered markdown
- Show metadata (labels, dates)
- Action buttons (Edit, Delete)
- Link from dashboard

### 3. Shuffle Frontend
Frontend page: /recipes/shuffle
- Filter form (number input, tag selectors)
- Display shuffled results
- "Shuffle again" button

### 4. Recipe List Page
Frontend page: /recipes
- Grid/card layout for all recipes
- Search and filter
- Sort options

### 5. Component Styling
- Dashboard improvements
- RecipeForm enhancements (markdown preview)
- Navigation bar
- Loading states
- Empty states

### 6. Additional Authentication
- Email/password authentication
- GitHub OAuth
- Password reset flow

---

## Future Features

### Recipe Usage History
- RecipeUsage model in database
- Track usage dates
- Exclude recently used recipes from shuffle (7 days constraint)

### Meal Planning
- Weekly calendar view
- Assign recipes to specific days/meals
- Drag and drop interface

### Other Features
- Recipe collections/cookbooks
- Shopping list generation
- Recipe sharing (public/private)
- Recipe ratings/favorites
- Image upload
- Import/export recipes
- Mobile responsive design
- Dark mode

### DevOps
- Integration and E2E tests
- Error boundaries
- Logging and monitoring
- Production deployment (Neon/Supabase + Vercel)

---

## Technology Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Database: PostgreSQL + Prisma ORM
- Auth: NextAuth.js v4
- Validation: Zod
- Testing: Vitest
- Styling: Tailwind CSS
