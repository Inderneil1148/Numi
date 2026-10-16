# Savings Targets & Recurring Subscriptions Hub

Empower users to define and fund dedicated savings targets without tag clutter, alongside a recurring subscription manager with monthly expense projections and one-tap renewal payment reminders.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during interactive clarification and form the foundation of this release:

- **Confirmed Decision 1 (Savings Target Hub)**: Savings goals and accumulated progress will be showcased via a dedicated **Savings Card** on the Overview dashboard, providing immediate visual feedback on goal completion rates.
- **Confirmed Decision 2 (Subscriptions Management)**: Subscriptions will have a dedicated **Subscriptions View** featuring a monthly expense run-rate total, renewal calendar, and active/paused management.
- **Confirmed Decision 3 (Renewal Reminders & Actions)**: When a recurring subscription reaches its monthly renewal day, an **in-app due banner** will appear on the dashboard with a one-tap **"Log Payment"** button that automatically records the transaction.
- **Confirmed Decision 4 (Zero-Tag Isolation for Savings)**: In accordance with your request, selecting "Savings" in the New Transaction modal will remove all tag inputs, presenting a clean saving goal selector and contribution amount.

---

## 1. Overview & Core Concept

### What It Does
1. **Savings Targets & Contributions**: Users can create multi-milestone savings targets (e.g. *Emergency Fund*, *New Laptop*, *Vacation Fund*, *Down Payment*) specifying target amounts and optional deadlines. When logging transactions, a new **"Savings"** option allows allocating funds directly into a chosen savings goal without distracting tag inputs.
2. **Recurring Subscriptions & Reminders**: Users can track monthly recurring obligations (e.g. streaming services, gym memberships, software licenses, utilities) with their billing day of the month. As renewal dates approach, an interactive banner reminds the user and lets them record the expense in a single tap.

### Target Audience & Persona
Personal finance users, freelancers, and budget-conscious individuals who want to compartmentalize long-term savings separately from daily expenses, while proactively monitoring recurring fixed costs before credit cards are billed.

### Key Value Delivered
- **Clarity on Capital Accumulation**: Distinguishes wealth-building deposits from ordinary expenditures.
- **Elimination of Forgotten Subscriptions**: Avoids surprise recurring debits through timely reminders and visibility into annualized subscription spend.

---

## 2. User Experience & Visual Design

### Key User Flows

#### Flow A: Creating and Funding a Savings Target
1. **Explore Goals**: The user scrolls down the Overview dashboard to find the **Savings Targets** card, displaying active goals, target amounts, saved totals, and progress bars.
2. **Create New Goal**: Clicking **"New Goal"** opens a lightweight sheet where the user names the goal (e.g. *"Tokyo Trip"*), specifies the target sum (e.g. `$2,500`), and picks an accent tone.
3. **Log a Contribution**: The user taps the floating **`+`** button (New Transaction). The type selector now features three options: `Expense`, `Income`, and `Savings`.
4. **Focused Savings Form**: Selecting `Savings` replaces category and tag pickers with a **"Select Saving Goal"** dropdown or chip selector. The user enters the amount and saves.
5. **Real-Time Progress**: The target's progress bar smoothly animates forward, and the total saved balance updates instantly.

#### Flow B: Managing Subscriptions & One-Tap Renewal Logging
1. **View Active Subscriptions**: Tapping the **Subscriptions** nav item or the dashboard widget opens the **Subscriptions View**, showing:
   - **Monthly Total Run-Rate** (e.g. `$74.99/mo` · `$899.88/yr`).
   - **Upcoming Renewal Timeline**: Subscriptions ordered chronologically by upcoming billing day.
2. **Add a Subscription**: User taps **"Add Subscription"**, enters the name (e.g. *"Spotify Family"*), monthly cost (`$16.99`), category (*Entertainment*), and billing day of month (`18th`).
3. **Due-Date In-App Banner**: On the 18th of the month, a subtle alert banner appears atop the dashboard:
   - *"Spotify Family ($16.99) is due today"*
   - User clicks **"Log Payment"** → Immediately creates an expense transaction timestamped for today, marks this month's renewal as logged, and triggers a subtle haptic confirmation.

### Visual Identity & Theme
- **Dominant Neutral Canvas**: Clean Apple-style background (`#F2F2F7` light / `#000000` dark) with refined contrast surfaces (`#FFFFFF` light / `#1C1C1E` dark).
- **Accent Hierarchy**:
  - **Savings Accent**: Signature Numi Lime (`#9EE42A`) and Emerald (`#30D158` / `#146C2E`) representing growth and capital accumulation.
  - **Subscriptions Accent**: Deep Indigo / Violet (`#5856D6` / `#AF52DE`) denoting recurring digital services.
  - **Expense / Income Accents**: Retains signature Crimson (`#FF3B30`) and Mint (`#34C759`).
- **Zero-Pill Discipline**: Metadata (renewal dates, billing days, target completion dates) rendered as clean unboxed text with typographic bullet separators (`·`).
- **Tabular Figures**: All financial numbers, target percentages, and subscription fees strictly enforce `tabular-nums` alignment.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Savings Representation in Ledger vs. Balance
- **Chosen Approach**: Logging a `Savings` entry is treated as a dedicated transfer into savings. It tracks as accumulated capital in the Savings Goal and can be viewed in the transaction history with a distinctive Savings badge (`+ Saved`), without distorting everyday discretionary expense categories.
- **Why**: Standard expense charts often mistakenly penalize users for saving money by treating savings deposits as "losses". Isolating Savings provides accurate discretionary spending metrics.

### Decision 2: Subscription Reminders as Actionable Banners
- **Chosen Approach**: Interactive in-app banners with a one-tap **"Log Payment"** action, rather than silent automatic charges.
- **Why**: Subscriptions can change prices, cancel mid-month, or pause. Prompting the user with a single tap maintains complete financial agency while eliminating manual data entry.

### Decision 3: Local-First Storage with Cloud Synchronization
- **Chosen Approach**: Persist savings goals, savings contributions, and recurring subscriptions in local storage with automatic Firestore cloud sync for signed-in users.
- **Why**: Ensures 100% offline availability, instant response times, and multi-device parity.

---

## 4. Technical Architecture & Data Strategy

### System & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                                App.tsx                                 │
│          State: transactions, savingsGoals, subscriptions, budget      │
└───────────────┬───────────────────────────┬────────────────────────────┘
                │                           │
  ┌─────────────▼─────────────┐ ┌───────────▼─────────────┐ ┌────────────▼────────────┐
  │      Dashboard View       │ │   Subscriptions View    │ │     Modals & Sheets     │
  ├───────────────────────────┤ ├─────────────────────────┤ ├─────────────────────────┤
  │ • Header (Nav & Filter)   │ │ • Monthly/Annual Total  │ │ • TransactionModal      │
  │ • SubscriptionDueBanner   │ │ • Renewal Timeline      │ │   (Expense/Income/Save) │
  │ • OverviewCard (Totals)   │ │ • SubscriptionList      │ │ • SavingsGoalModal      │
  │ • SavingsGoalsCard        │ │ • AddSubscriptionModal  │ │ • SubscriptionModal     │
  │ • TransactionList         │ └─────────────────────────┘ └─────────────────────────┘
  └───────────────────────────┘
                │
  ┌─────────────▼─────────────────────────────────────────┐
  │               Storage & Sync Layer                    │
  ├───────────────────────────────────────────────────────┤
  │ • storage.ts (localStorage backup & offline cache)    │
  │ • firestoreSync.ts (cloud collection listeners)       │
  └───────────────────────────────────────────────────────┘
```

### Data Entities & Schema Extensions

```typescript
// Savings Goal Entity
export interface SavingsGoal {
  id: string;
  name: string;             // e.g. "Emergency Fund"
  targetAmount: number;     // e.g. 5000
  currentAmount: number;    // Accumulated total
  targetDate?: string;      // YYYY-MM-DD (optional deadline)
  color?: string;           // Hex visual tint
  createdAt: number;
}

// Subscription Entity
export interface Subscription {
  id: string;
  name: string;             // e.g. "Netflix", "Spotify"
  amount: number;           // Recurring monthly cost
  category: string;         // e.g. "Entertainment"
  billingDay: number;       // 1 - 31 (day of month)
  status: 'active' | 'paused';
  lastLoggedDate?: string;  // YYYY-MM-DD (prevents duplicate logs)
  createdAt: number;
}

// Transaction Model Update
export type TransactionType = 'expense' | 'income' | 'savings';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  title: string;
  category: string;
  customTags: string[];     // Empty array when type === 'savings'
  savingsGoalId?: string;   // Associated goal if type === 'savings'
  date: string;
  time?: string;
  note?: string;
  createdAt: number;
}
```

### Interactive State Transitions
1. **Transaction Modal Type Switching**:
   - Tapping `Savings` sets `type = 'savings'`, disables/clears tag inputs, and reveals the `SavingsGoalPicker`.
   - Submitting updates both the transaction ledger and increments `currentAmount` on the target `SavingsGoal`.
2. **Renewal Trigger Calculation**:
   - On each render/day change, the app evaluates `subscriptions` against the current day of the month.
   - Any active subscription whose `billingDay` is today (or past due within the current month) and whose `lastLoggedDate` does not match the current billing cycle surfaces in `SubscriptionDueBanner`.
   - Clicking **"Log Payment"** logs the transaction, updates `lastLoggedDate`, and dismisses the banner.
