I need to build the "ResidentHub" (The Dashboard) for my MERN stack PG/Hostel management app. It must be built as a React functional component (`ResidentHub.jsx`) with a CSS Module (`ResidentHub.module.css`).

ARCHITECTURAL RULES:
1. Hub & Spoke Model: This is a mobile-first PWA experience. There is NO sidebar and NO navbar. This dashboard is the central hub, containing cards/buttons that will eventually link to other pages.
2. Responsive: It must be optimized for mobile (stacked cards), but expand into a clean "Bento-Box" grid on tablets and laptops without stretching awkwardly. Max container width on desktop should be around 600px-800px to keep it feeling like an app.

DESIGN SYSTEM (Emerald Glassmorphism):
1. Font: `Plus Jakarta Sans` for all headings, body text, and numbers.
2. Global Colors:
   - App Background: Soft mint `#f0fdf4`
   - Primary: Emerald Green `#10b981` (Hover: `#059669`)
   - Primary Light (Badges): `rgba(16, 185, 129, 0.1)`
   - Headings Text: `#0f172a`
   - Body Text: `#475569`
   - Status Red (On Leave): `#ef4444`
3. The Glass Card Recipe (Apply to all cards):
   - Background: `rgba(255, 255, 255, 0.7)`
   - Blur: `backdrop-filter: blur(16px) saturate(1.2); -webkit-backdrop-filter: blur(16px) saturate(1.2);`
   - Border: `1px solid rgba(255, 255, 255, 0.9)`
   - Border Radius: `20px`
   - Box Shadow: `0 8px 32px rgba(16, 185, 129, 0.08)`

UI COMPONENTS & DATA REQUIREMENTS (Use mock state for now):
1. Header: 
   - Subtitle: "{Role} Portal" (e.g., Resident or Guest).
   - Title: "Hi, {Name}".
   - Right side: User Avatar circle (Gradient emerald background, white initial).
2. Gate Pass & Status Card:
   - Shows Room Number badge.
   - Shows Status: Either "🟢 IN HOSTEL" (Green text) or "🔴 ON LEAVE" (Red text).
   - Top border of this card should be 4px solid (Green if in hostel, Red if on leave).
   - Below the status, a prominent 100% width button: "Scan QR at Gate" (Emerald gradient background).
3. Meal Toggles ("Am I Eating Tomorrow?"):
   - A grid/list of 3 items: Breakfast, Lunch, Dinner.
   - Each shows an icon, the meal name, and cut-off subtext. 
   - Subtexts: Breakfast (Cut-off: 3:30 AM), Lunch (Cut-off: 3:30 AM), Dinner (Cut-off: 3:30 PM).
   - Each has a custom UI toggle switch (ON/OFF).
   - AUTO-PAUSE LOGIC: If the user's status is "ON LEAVE", these toggles must be disabled, and a "Auto-Paused" badge should appear at the top of the card.
4. Financials (Bento Grid - 2 cards side-by-side):
   - Card A: "Total Spendings" showing a large currency amount (e.g., ₹45,500).
   - Card B: "Current Dues" showing a currency amount and a small "Pay Now" button.
5. Services (Bento Grid - 2 buttons side-by-side):
   - Button A: "Report Issue" (with a tool icon).
   - Button B: "Notice Board" (with a megaphone icon).
   - Both should use the glass card CSS but act as clickable buttons with hover states (transform scale/lift).

Please generate the complete React JSX and the accompanying CSS module based strictly on these rules. Do not use random colors or generic CSS.