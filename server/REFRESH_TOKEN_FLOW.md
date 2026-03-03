# 🔐 REFRESH TOKEN SYSTEM - COMPLETE FLOW DOCUMENTATION

## 📊 COMPLETE USER JOURNEY

### **Timeline: User Login to Automatic Token Refresh**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INITIAL LOGIN (Day 1, 10:00 AM)                     │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: User Enters Credentials
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                                             │
│                                                                              │
│  User: ┌────────────────────────┐                                           │
│        │ Mobile: 9876543210     │                                           │
│        │ Password: password123  │                                           │
│        │      [Sign In]         │                                           │
│        └────────────────────────┘                                           │
│                ↓                                                             │
│        POST /api/auth/login                                                 │
│        Body: {                                                              │
│          "mobileNumber": "9876543210",                                       │
│          "password": "password123"                                           │
│        }                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 2: Server Finds User in MongoDB
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND (Node.js + MongoDB)                                                  │
│                                                                              │
│  const user = await User.findOne({ mobileNumber })                          │
│          ↓                                                                   │
│  Query MongoDB Users Collection                                              │
│          ↓                                                                   │
│  Returns:                                                                    │
│  {                                                                           │
│    _id: "507f1f77bcf86cd799439011",                                         │
│    name: "John Resident",                                                   │
│    mobileNumber: "9876543210",                                              │
│    email: "john@example.com",                                               │
│    password: "$2b$10$XPg8Fe4kfnncRlRGQGuYy.4GHh...",  (HASHED!)             │
│    role: "resident",                                                        │
│    createdAt: "2026-02-28T10:00:00Z"                                        │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 3: BCRYPTJS Compares Password (Security!)
┌─────────────────────────────────────────────────────────────────────────────┐
│ PASSWORD COMPARISON PROCESS                                                  │
│                                                                              │
│  Plain Password (from login form):                                           │
│  ┌──────────────────────────────────────────┐                               │
│  │ "password123"                            │                               │
│  └──────────────────────────────────────────┘                               │
│              ↓                                                               │
│  await user.comparePassword("password123")                                   │
│              ↓                                                               │
│  Hashed Password (from MongoDB):                                             │
│  ┌──────────────────────────────────────────┐                               │
│  │ "$2b$10$XPg8Fe4kfnncRlRGQGuYy..."       │                               │
│  │ (salt embedded in hash)                  │                               │
│  └──────────────────────────────────────────┘                               │
│              ↓                                                               │
│  bcryptjs.compare():                                                         │
│  1. Extract salt from stored hash                                            │
│  2. Hash plain password with that salt                                       │
│  3. Compare both hashes                                                      │
│              ↓                                                               │
│  Result: ✅ MATCH = true  OR  ❌ NO MATCH = false                            │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 4: Generate TWO Tokens (Key Innovation!)
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOKEN GENERATION                                                             │
│                                                                              │
│  ACCESS TOKEN (Short-lived: 15 minutes)                                      │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ jwt.sign(                                                          │    │
│  │   { id: "507f1f77bcf86cd799439011", role: "resident" },          │    │
│  │   JWT_SECRET,                                                      │    │
│  │   { expiresIn: "15m" }  ← Expires in 15 minutes                   │    │
│  │ )                                                                  │    │
│  │                                                                    │    │
│  │ Result: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...                  │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                            ↓↓↓                                               │
│  REFRESH TOKEN (Long-lived: 7 days)                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ jwt.sign(                                                          │    │
│  │   { id: "507f1f77bcf86cd799439011", role: "resident" },          │    │
│  │   REFRESH_SECRET,                                                  │    │
│  │   { expiresIn: "7d" }  ← Expires in 7 days                        │    │
│  │ )                                                                  │    │
│  │                                                                    │    │
│  │ Result: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...                  │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 5: Store in HttpOnly Cookies (Secure!)
┌─────────────────────────────────────────────────────────────────────────────┐
│ COOKIES IN RESPONSE HEADERS                                                  │
│                                                                              │
│  Set-Cookie: accessToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict;    │
│              Path=/; Max-Age=900                                             │
│                                (15 min = 900 seconds)                        │
│                                                                              │
│  Set-Cookie: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict;   │
│              Path=/; Max-Age=604800                                          │
│                               (7 days = 604800 seconds)                      │
│                                                                              │
│  Properties Explained:                                                       │
│  • HttpOnly: ✅ Cannot be accessed by JavaScript (prevents XSS)             │
│  • Secure: ✅ Only sent over HTTPS (prevents MITM)                          │
│  • SameSite=Strict: ✅ Not sent in cross-site requests (prevents CSRF)       │
│  • Path=/: ✅ Sent with all requests to any path                            │
│  • Max-Age: ⏱️  Automatically expires after this time                        │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 6: Frontend Stores User Data (NOT Token)
┌─────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND RESPONSE HANDLING (Login.jsx)                                       │
│                                                                              │
│  Response from API:                                                          │
│  {                                                                           │
│    "message": "Login successful",                                            │
│    "user": {                                                                 │
│      "id": "507f1f77bcf86cd799439011",                                      │
│      "name": "John Resident",                                               │
│      "mobileNumber": "9876543210",                                          │
│      "email": "john@example.com",                                           │
│      "role": "resident"                                                     │
│    }                                                                         │
│  }                                                                           │
│          ↓                                                                   │
│  Store in sessionStorage (NOT localStorage):                                 │
│  ┌────────────────────────────────────┐                                     │
│  │ sessionStorage.setItem('user',     │                                     │
│  │   JSON.stringify(userData)         │                                     │
│  │ )                                  │                                     │
│  └────────────────────────────────────┘                                     │
│          ↓                                                                   │
│  Tokens automatically in HttpOnly cookies (sent by browser)                  │
│  ✅ accessToken cookie                                                      │
│  ✅ refreshToken cookie                                                     │
│                                                                              │
│  Note: Tokens NOT in sessionStorage or localStorage!                         │
│        Browser sends them automatically with every request                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│              NORMAL USAGE (First 15 minutes: 10:00 - 10:15 AM)              │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 7: User Accesses Protected Route
┌─────────────────────────────────────────────────────────────────────────────┐
│ REQUEST TO /api/residents                                                    │
│                                                                              │
│  Frontend:                                                                   │
│  ┌──────────────────────────────────────┐                                   │
│  │ await API.get('/residents')          │                                   │
│  └──────────────────────────────────────┘                                   │
│              ↓                                                               │
│  Axios Interceptor adds headers:                                             │
│  Headers: {                                                                  │
│    'Content-Type': 'application/json',                                       │
│    Cookie: 'accessToken=eyJhbGc...'  ← Automatically sent!                  │
│  }                                                                           │
│              ↓                                                               │
│  GET /api/residents                                                          │
│  Cookie: accessToken=eyJhbGc...                                              │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 8: Middleware Verifies AccessToken
┌─────────────────────────────────────────────────────────────────────────────┐
│ MIDDLEWARE: verifyToken (residentRoutes.js)                                 │
│                                                                              │
│  router.get('/', verifyToken, getResidents)                                 │
│                  ↓                                                           │
│  // middleware/authMiddleware.js                                             │
│  const accessToken = req.cookies.accessToken                                │
│              ↓                                                               │
│  jwt.verify(accessToken, JWT_SECRET)                                        │
│              ↓                                                               │
│  Decoded Payload:                                                            │
│  {                                                                           │
│    id: "507f1f77bcf86cd799439011",                                          │
│    role: "resident",                                                        │
│    iat: 1740710400,   (issued at)                                            │
│    exp: 1740711300    (expires at: 15 min later)                             │
│  }                                                                           │
│              ↓                                                               │
│  ✅ Token valid! Attach to req.user                                          │
│  req.user = { id: "...", role: "resident" }                                 │
│              ↓                                                               │
│  next()  ← Continue to next middleware/route handler                         │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 9: Route Handler Executes
┌─────────────────────────────────────────────────────────────────────────────┐
│ ROUTE EXECUTION: getResidents                                                │
│                                                                              │
│  const residents = await Resident.find()                                     │
│  return res.json(residents)                                                  │
│  ✅ Success!                                                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│              TOKEN REFRESH (After 15 minutes: 10:15 AM)                     │
│               ✅ USER STILL ACTIVELY USING THE APP                          │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 10: Access Token Expires (15 minutes passed)
┌─────────────────────────────────────────────────────────────────────────────┐
│ USER MAKES REQUEST                                                           │
│                                                                              │
│  Frontend:                                                                   │
│  await API.post('/residents', residantData)                                  │
│              ↓                                                               │
│  Axios sends accessToken cookie                                              │
│  POST /api/residents                                                         │
│  Cookie: accessToken=eyJhbGc... (EXPIRED!)                                   │
│              ↓                                                               │
│  Backend - verifyToken middleware:                                           │
│  jwt.verify(accessToken, JWT_SECRET)                                        │
│              ↓                                                               │
│  ❌ TokenExpiredError!                                                       │
│              ↓                                                               │
│  Return 401 with code: 'TOKEN_EXPIRED'                                       │
│  {                                                                           │
│    "status": 401,                                                            │
│    "data": {                                                                 │
│      "message": "Token expired",                                             │
│      "code": "TOKEN_EXPIRED"                                                 │
│    }                                                                         │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 11: Frontend Response Interceptor Detects Expiry
┌─────────────────────────────────────────────────────────────────────────────┐
│ AXIOS INTERCEPTOR (API/axios.js)                                             │
│                                                                              │
│  API.interceptors.response.use(                                              │
│    (response) => response,                                                   │
│    async (error) => {                                                        │
│      if (error.response?.data?.code === 'TOKEN_EXPIRED') {                  │
│        // ✅ DETECTED! Try to refresh                                        │
│              ↓                                                               │
│        if (isRefreshing) {                                                   │
│          // Already refreshing, queue this request                           │
│          // and wait for refresh to complete                                 │
│        } else {                                                              │
│          return API.post('/auth/refresh')  ← Call refresh endpoint           │
│            .then(() => API(originalRequest))  ← Retry original request       │
│        }                                                                     │
│      }                                                                       │
│    }                                                                         │
│  )                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 12: Backend Issues New Access Token
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: /api/auth/refresh (authController.js)                              │
│                                                                              │
│  POST /api/auth/refresh                                                      │
│  Cookie: refreshToken=eyJhbGc... (STILL VALID! 7 days not expired)          │
│              ↓                                                               │
│  jwt.verify(refreshToken, REFRESH_SECRET)                                   │
│              ↓                                                               │
│  ✅ Valid! Decoded payload:                                                  │
│  {                                                                           │
│    id: "507f1f77bcf86cd799439011",                                          │
│    role: "resident"                                                         │
│  }                                                                           │
│              ↓                                                               │
│  Generate NEW access token:                                                  │
│  jwt.sign(                                                                   │
│    { id: "507f1f77bcf86cd799439011", role: "resident" },                   │
│    JWT_SECRET,                                                               │
│    { expiresIn: "15m" }  ← New 15 min timer!                                │
│  )                                                                           │
│              ↓                                                               │
│  Set new accessToken cookie:                                                 │
│  res.cookie('accessToken', newAccessToken, {                                │
│    httpOnly: true,                                                           │
│    secure: true,                                                             │
│    sameSite: 'strict',                                                       │
│    maxAge: 900  // 15 min again                                              │
│  })                                                                          │
│              ↓                                                               │
│  Return 200 OK                                                               │
│  { "message": "Token refreshed successfully" }                               │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 13: Frontend Automatically Retries Failed Request
┌─────────────────────────────────────────────────────────────────────────────┐
│ AXIOS INTERCEPTOR (continued)                                                │
│                                                                              │
│  .then(() => {                                                               │
│    // ✅ Refresh successful!                                                 │
│    // originalRequest already has new accessToken in cookie                  │
│    return API(originalRequest)  ← Retry the POST /api/residents              │
│  })                                                                          │
│              ↓                                                               │
│  POST /api/residents                                                         │
│  Cookie: accessToken=eyJhbGc... (NEW! Valid for 15 min)                     │
│  Body: { residantData }                                                      │
│              ↓                                                               │
│  ✅ Backend accepts! (req.user now valid)                                    │
│  Resident created successfully                                               │
│              ↓                                                               │
│  Frontend receives response with resident data                                │
│  User doesn't even know their token was refreshed! 🎉                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│         WHEN REFRESH TOKEN EXPIRES (After 7 days: Day 8 at 10:00 AM)        │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 14: Refresh Token Expired
┌─────────────────────────────────────────────────────────────────────────────┐
│ ACCESS TOKEN EXPIRES AGAIN                                                   │
│ (after 15 min, triggers refresh flow again)                                 │
│              ↓                                                               │
│ POST /api/auth/refresh                                                       │
│ Cookie: refreshToken=eyJhbGc... (EXPIRED! 7 days passed)                    │
│              ↓                                                               │
│ jwt.verify(refreshToken, REFRESH_SECRET)                                    │
│              ↓                                                               │
│ ❌ TokenExpiredError!                                                        │
│              ↓                                                               │
│ Response: 403                                                                │
│ {                                                                            │
│   "message": "Refresh token expired. Please login again.",                   │
│   "status": 403                                                              │
│ }                                                                            │
│              ↓                                                               │
│ Frontend interceptor catches 403:                                            │
│ sessionStorage.removeUser()                                                  │
│ window.location.href = '/login'                                              │
│              ↓                                                               │
│ ❌ USER MUST LOGIN AGAIN                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY FEATURES                                   │
└─────────────────────────────────────────────────────────────────────────────┘

1. ✅ HttpOnly Cookies
   • Tokens cannot be accessed by JavaScript
   • Protects against XSS attacks
   • Automatically sent with every request

2. ✅ Secure Flag (Production)
   • Cookies only sent over HTTPS
   • Protects against man-in-the-middle attacks

3. ✅ SameSite=Strict
   • Cookies never sent in cross-site requests
   • Prevents CSRF attacks

4. ✅ Short-lived Access Token (15 min)
   • If someone steals the token, limited damage
   • Requires frequent rotation

5. ✅ Long-lived Refresh Token (7 days)
   • User doesn't need to re-login every 15 min
   • Refresh token itself is also HttpOnly and Secure

6. ✅ Separate Secrets (JWT_SECRET vs REFRESH_SECRET)
   • If access token is compromised, refresh token still safe
   • Different issuing/verification logic possible

┌─────────────────────────────────────────────────────────────────────────────┐
│                         FILE CHANGES SUMMARY                                │
└─────────────────────────────────────────────────────────────────────────────┘

Backend Changes:
✅ authController.js
   - Removed: generateToken() - now generateAccessToken() + generateRefreshToken()
   - Added: refreshAccessToken() endpoint
   - Updated: loginUser() generates both tokens
   - Updated: logoutUser() clears both cookies
   - Added: setTokenCookies() helper

✅ middleware/authMiddleware.js
   - Updated: verifyToken() uses accessToken instead of token
   - Updated: Returns 401 with code 'TOKEN_EXPIRED' when token expires

✅ routes/authRoutes.js
   - Added: POST /api/auth/refresh

✅ .env
   - Added: REFRESH_SECRET
   - Added: ACCESS_TOKEN_EXPIRE=15m
   - Added: REFRESH_TOKEN_EXPIRE=7d

Frontend Changes:
✅ API/axios.js
   - Completely rewritten interceptor
   - Auto-detects 401 with TOKEN_EXPIRED
   - Automatically calls /auth/refresh
   - Queues failed requests until refresh completes
   - Retries original request with new token

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FLOWCHART                                       │
└─────────────────────────────────────────────────────────────────────────────┘

                          START
                            │
                            ▼
                    ┌───────────────┐
                    │ User Logs In  │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
    Find User          Check Password      Generate Tokens
    (MongoDB)          (bcryptjs)          (JWT)
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────▼───────┐
                    │  Set Cookies  │
                    │ accessToken   │
                    │ refreshToken  │
                    └───────┬───────┘
                            │
                    ┌───────▼────────┐
                    │ User Logged In │
                    │ (15 min timer) │
                    └───────┬────────┘
                            │
                    ┌───────▼─────────────┐
                    │ Make API Request    │
                    │ (accessToken sent)  │
                    └───────┬─────────────┘
                            │
                ┌───────────┴──────────────┐
                │                         │
        ┌───────▼────────┐       ┌────────▼─────────┐
        │ Token Valid?   │       │ Token Expired?   │
        │ (< 15 min)     │       │ (> 15 min)       │
        │ YES ✅         │       │ YES ❌           │
        └───────┬────────┘       └────────┬─────────┘
                │                         │
        ┌───────▼────────┐       ┌────────▼──────────┐
        │ Process Route  │       │ Call /refresh     │
        │ Normal Flow    │       │ (send refreshToken)
        └────────────────┘       └────────┬──────────┘
                                          │
                            ┌─────────────┴─────────────┐
                            │                         │
                    ┌───────▼────────┐       ┌────────▼─────────┐
                    │ Refresh Valid? │       │ Refresh Expired? │
                    │ (< 7 days)     │       │ (> 7 days)       │
                    │ YES ✅         │       │ YES ❌           │
                    └───────┬────────┘       └────────┬─────────┘
                            │                         │
                    ┌───────▼────────┐       ┌────────▼──────────┐
                    │ Issue New      │       │ Redirect to       │
                    │ Access Token   │       │ LOGIN PAGE        │
                    │ (15 min timer) │       │ (Session cleared) │
                    └───────┬────────┘       └───────────────────┘
                            │
                    ┌───────▼────────┐
                    │ Retry Original │
                    │ Request        │
                    │ ✅ Success!    │
                    └────────────────┘
