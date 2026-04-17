# Student Side-Hustle Platform (Solution Reference)

This is the solution repository for the student side-hustle platform. All caching and unreliable data issues have been resolved.

## Fixed Issues & Why They Matter

1. **Proper Cache Invalidation on DELETE and POST**:
   - **Fix**: The cache for the entire tasks list and specific task details are now deleted when a modification occurs.
   - **Why**: This ensures students always see the most up-to-date information. In the broken version, deleted tasks would still appear because the cache was never told they were gone.

2. **Namespaced Keys**:
   - **Fix**: Keys are now generated properly as `tasks:list` and `task:ID`.
   - **Why**: Using a single global key for multiple types of data leads to "mixed data" bugs where one request overwrites data for another.

3. **Time-to-Live (TTL)**:
   - **Fix**: Added a 1-minute TTL to all cache entries.
   - **Why**: This prevents memory leaks. In-memory maps grow indefinitely unless old data is removed. TTL ensures that even if invalidation is missed somewhere, the data eventually cleans itself up.

4. **Correct Async Handling**:
   - **Fix**: Correctly awaiting Prisma calls before storing results in the cache.
   - **Why**: Storing a pending Promise instead of the resolved data will cause future requests to fail or return unexpected objects.

5. **Proper HTTP Status Codes**:
   - **Fix**: Returns `201 Created`, `204 No Content` (for deletes), `404 Not Found`, and `500 Server Error`.
   - **Why**: Using `200` for every response makes it impossible for the frontend to distinguish success from errors or different states easily.

## Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL
- **ORM**: Prisma (Latest)

## Setup Instructions

### 1. Prerequisites
Ensure you have Node.js and PostgreSQL installed.

### 2. Backend Setup
<pre>
cd backend
npm install
# Setup .env (DATABASE_URL required)
npx prisma migrate dev --name init
npm run dev
</pre>

### 3. Frontend Setup
<pre>
cd frontend
npm install
npm run dev
</pre>

---
**Goal**: Provide a clean, predictable, and high-performance caching implementation.
