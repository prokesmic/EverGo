# EverGo Section 7: Monetization Layer

## Overview
Implement monetization features including premium subscriptions, strategic ad placements, product recommendations based on user activity, and sponsored challenges.

---

## Database Schema

### Subscriptions
```prisma
model Subscription {
  id              String            @id @default(cuid())
  userId          String            @unique
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  plan            SubscriptionPlan
  status          SubscriptionStatus
  
  // Billing
  stripeCustomerId    String?
  stripeSubscriptionId String?
  
  // Period
  currentPeriodStart  DateTime
  currentPeriodEnd    DateTime
  
  // Trial
  trialEndsAt     DateTime?
  
  canceledAt      DateTime?
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}

enum SubscriptionPlan {
  FREE
  PRO           // Monthly premium
  PRO_ANNUAL    // Annual premium (discounted)
}

enum SubscriptionStatus {
  ACTIVE
  TRIALING
  PAST_DUE
  CANCELED
  EXPIRED
}
```

### User Gear (for product recommendations)
```prisma
model UserGear {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Gear details
  gearType        GearType
  brand           String
  model           String
  nickname        String?
  
  // Purchase info
  purchaseDate    DateTime?
  purchasePrice   Float?
  
  // Usage tracking
  totalDistance   Float     @default(0)  // meters
  totalDuration   Int       @default(0)  // seconds
  activityCount   Int       @default(0)
  
  // Condition
  isRetired       Boolean   @default(false)
  retiredAt       DateTime?
  retiredReason   String?
  
  // For shoes: recommended replacement at ~500-800km
  maxRecommendedDistance Float?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  activities      ActivityGear[]
  
  @@index([userId, gearType])
}

enum GearType {
  RUNNING_SHOES
  CYCLING_SHOES
  BIKE
  HELMET
  WATCH
  HEART_RATE_MONITOR
  GOLF_CLUBS
  TENNIS_RACKET
  SWIM_GOGGLES
  OTHER
}

model ActivityGear {
  id          String    @id @default(cuid())
  activityId  String
  activity    Activity  @relation(fields: [activityId], references: [id], onDelete: Cascade)
  gearId      String
  gear        UserGear  @relation(fields: [gearId], references: [id], onDelete: Cascade)
  
  @@unique([activityId, gearId])
}
```

### Product Offers
```prisma
model ProductOffer {
  id              String    @id @default(cuid())
  
  // Product info
  title           String
  description     String
  brand           String
  productUrl      String
  imageUrl        String
  
  // Pricing
  originalPrice   Float
  salePrice       Float?
  discountCode    String?
  
  // Targeting
  targetGearType  GearType?
  targetSportId   String?
  minGearAge      Int?      // Days since purchase
  minGearDistance Float?    // Meters used
  
  // Campaign
  startDate       DateTime
  endDate         DateTime
  isActive        Boolean   @default(true)
  
  // Tracking
  impressions     Int       @default(0)
  clicks          Int       @default(0)
  
  createdAt       DateTime  @default(now())
}

model ProductOfferView {
  id          String        @id @default(cuid())
  offerId     String
  offer       ProductOffer  @relation(fields: [offerId], references: [id])
  userId      String
  
  viewedAt    DateTime      @default(now())
  clickedAt   DateTime?
  dismissed   Boolean       @default(false)
  
  @@unique([offerId, userId])
}
```

---

## Premium Features Definition

```typescript
const PREMIUM_FEATURES = {
  // Free tier
  FREE: {
    maxSports: 3,
    maxTeams: 1,
    rankingScopes: ['city', 'country'],
    activityHistory: 90, // days
    exportData: false,
    advancedAnalytics: false,
    customChallenges: false,
    prioritySupport: false,
    adFree: false,
  },
  
  // Pro tier
  PRO: {
    maxSports: 'unlimited',
    maxTeams: 'unlimited',
    rankingScopes: ['city', 'country', 'global', 'friends'],
    activityHistory: 'unlimited',
    exportData: true,
    advancedAnalytics: true,
    customChallenges: true,
    prioritySupport: true,
    adFree: true,
  }
};

const PRICING = {
  PRO: {
    monthly: 9.99,
    annual: 79.99, // ~33% discount
    currency: 'USD'
  }
};
```

---

## API Endpoints

### Subscriptions
```typescript
// GET /api/subscription
// Get current user's subscription status
interface SubscriptionResponse {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  features: typeof PREMIUM_FEATURES.PRO;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// POST /api/subscription/checkout
// Create Stripe checkout session
interface CheckoutRequest {
  plan: 'PRO' | 'PRO_ANNUAL';
  successUrl: string;
  cancelUrl: string;
}

// POST /api/subscription/portal
// Create Stripe customer portal session for managing subscription

// POST /api/subscription/cancel
// Cancel subscription at period end
```

### Gear
```typescript
// GET /api/gear
// List user's gear

// POST /api/gear
interface CreateGearRequest {
  gearType: GearType;
  brand: string;
  model: string;
  nickname?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  maxRecommendedDistance?: number;
}

// PUT /api/gear/:id
// Update gear details

// DELETE /api/gear/:id
// Retire gear

// POST /api/activities/:id/gear
// Assign gear to activity
interface AssignGearRequest {
  gearIds: string[];
}
```

### Product Offers
```typescript
// GET /api/offers
// Get personalized product offers for current user

// POST /api/offers/:id/click
// Track offer click

// POST /api/offers/:id/dismiss
// Dismiss an offer
```

---

## UI Components

### Premium Upgrade Banner

```jsx
function UpgradeBanner({ feature }) {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-4 text-white">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-white/20 rounded-lg">
          <Star className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Unlock {feature}</h3>
          <p className="text-sm text-white/80 mb-3">
            Upgrade to EverGo Pro for advanced features, unlimited history, and ad-free experience.
          </p>
          <a
            href="/settings/subscription"
            className="inline-block px-4 py-2 bg-white text-purple-600 font-medium rounded-lg hover:bg-white/90"
          >
            Upgrade to Pro
          </a>
        </div>
      </div>
    </div>
  );
}
```

### Subscription Page

```jsx
function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUpgrade = async (plan) => {
    setIsLoading(true);
    const { checkoutUrl } = await createCheckoutSession({
      plan,
      successUrl: `${window.location.origin}/settings/subscription?success=true`,
      cancelUrl: `${window.location.origin}/settings/subscription`
    });
    window.location.href = checkoutUrl;
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Subscription</h1>
      <p className="text-gray-600 mb-8">Unlock the full EverGo experience</p>
      
      {/* Current Plan */}
      {subscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-blue-800">
                Current Plan: {subscription.plan === 'FREE' ? 'Free' : 'Pro'}
              </div>
              {subscription.plan !== 'FREE' && (
                <div className="text-sm text-blue-600">
                  Renews on {formatDate(subscription.currentPeriodEnd)}
                </div>
              )}
            </div>
            {subscription.plan !== 'FREE' && (
              <button 
                onClick={openCustomerPortal}
                className="text-blue-600 hover:underline text-sm"
              >
                Manage subscription
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Plans Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Free</h2>
          <div className="text-3xl font-bold text-gray-800 mb-4">
            $0<span className="text-base font-normal text-gray-500">/month</span>
          </div>
          
          <ul className="space-y-3 mb-6">
            <FeatureItem included>Track up to 3 sports</FeatureItem>
            <FeatureItem included>City & Country rankings</FeatureItem>
            <FeatureItem included>Join 1 team</FeatureItem>
            <FeatureItem included>90-day activity history</FeatureItem>
            <FeatureItem included>Badges & challenges</FeatureItem>
            <FeatureItem>Global rankings</FeatureItem>
            <FeatureItem>Advanced analytics</FeatureItem>
            <FeatureItem>Data export</FeatureItem>
            <FeatureItem>Ad-free experience</FeatureItem>
          </ul>
          
          <button 
            disabled
            className="w-full py-3 border border-gray-300 text-gray-500 rounded-lg font-medium"
          >
            Current Plan
          </button>
        </div>
        
        {/* Pro Plan */}
        <div className="bg-white rounded-xl border-2 border-blue-500 p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
            Most Popular
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">Pro</h2>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            $9.99<span className="text-base font-normal text-gray-500">/month</span>
          </div>
          <div className="text-sm text-green-600 mb-4">
            or $79.99/year (save 33%)
          </div>
          
          <ul className="space-y-3 mb-6">
            <FeatureItem included>Unlimited sports</FeatureItem>
            <FeatureItem included>All ranking scopes</FeatureItem>
            <FeatureItem included>Unlimited teams</FeatureItem>
            <FeatureItem included>Full activity history</FeatureItem>
            <FeatureItem included>All badges & challenges</FeatureItem>
            <FeatureItem included>Global rankings</FeatureItem>
            <FeatureItem included>Advanced analytics</FeatureItem>
            <FeatureItem included>Data export (CSV, GPX)</FeatureItem>
            <FeatureItem included>Ad-free experience</FeatureItem>
            <FeatureItem included>Priority support</FeatureItem>
          </ul>
          
          <div className="space-y-2">
            <button 
              onClick={() => handleUpgrade('PRO')}
              disabled={isLoading}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Upgrade Monthly'}
            </button>
            <button 
              onClick={() => handleUpgrade('PRO_ANNUAL')}
              disabled={isLoading}
              className="w-full py-3 border border-blue-500 text-blue-600 rounded-lg font-medium hover:bg-blue-50"
            >
              Upgrade Annually (Save 33%)
            </button>
          </div>
        </div>
      </div>
      
      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <FaqItem 
            question="Can I cancel anytime?"
            answer="Yes, you can cancel your subscription at any time. You'll continue to have Pro access until the end of your billing period."
          />
          <FaqItem 
            question="Is there a free trial?"
            answer="Yes! New users get a 7-day free trial of Pro features. No credit card required."
          />
          <FaqItem 
            question="What payment methods do you accept?"
            answer="We accept all major credit cards, Apple Pay, and Google Pay through our secure payment processor, Stripe."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ children, included = false }) {
  return (
    <li className={`flex items-center gap-2 ${included ? 'text-gray-800' : 'text-gray-400'}`}>
      {included ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <X className="w-5 h-5 text-gray-300" />
      )}
      <span>{children}</span>
    </li>
  );
}
```

### Gear Manager

```jsx
function GearManager() {
  const [gear, setGear] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Gear</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
        >
          + Add Gear
        </button>
      </div>
      
      {/* Active Gear */}
      <div className="space-y-4">
        {gear.filter(g => !g.isRetired).map((item) => (
          <GearCard key={item.id} gear={item} />
        ))}
      </div>
      
      {/* Retired Gear */}
      {gear.some(g => g.isRetired) && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Retired Gear</h2>
          <div className="space-y-4 opacity-60">
            {gear.filter(g => g.isRetired).map((item) => (
              <GearCard key={item.id} gear={item} />
            ))}
          </div>
        </div>
      )}
      
      {showAddModal && (
        <AddGearModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function GearCard({ gear }) {
  const usagePercent = gear.maxRecommendedDistance 
    ? Math.min(100, (gear.totalDistance / gear.maxRecommendedDistance) * 100)
    : null;
  
  const needsReplacement = usagePercent && usagePercent >= 80;
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${needsReplacement ? 'border-l-4 border-orange-500' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gray-100 rounded-lg">
          <GearIcon type={gear.gearType} className="w-8 h-8 text-gray-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">
                {gear.nickname || `${gear.brand} ${gear.model}`}
              </h3>
              <p className="text-sm text-gray-500">
                {gear.brand} {gear.model}
              </p>
            </div>
            
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          
          {/* Usage Stats */}
          <div className="mt-3 flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-500">Distance:</span>
              <span className="ml-1 font-medium text-gray-800">
                {(gear.totalDistance / 1000).toFixed(0)} km
              </span>
            </div>
            <div>
              <span className="text-gray-500">Activities:</span>
              <span className="ml-1 font-medium text-gray-800">{gear.activityCount}</span>
            </div>
            {gear.purchaseDate && (
              <div>
                <span className="text-gray-500">Age:</span>
                <span className="ml-1 font-medium text-gray-800">
                  {formatAge(gear.purchaseDate)}
                </span>
              </div>
            )}
          </div>
          
          {/* Usage Bar (for items with recommended max) */}
          {usagePercent !== null && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Usage</span>
                <span className={needsReplacement ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                  {(gear.totalDistance / 1000).toFixed(0)} / {(gear.maxRecommendedDistance / 1000).toFixed(0)} km
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    usagePercent >= 100 ? 'bg-red-500' :
                    usagePercent >= 80 ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, usagePercent)}%` }}
                />
              </div>
              {needsReplacement && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ Consider replacing soon
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Product Offer Card (In Feed)

```jsx
function ProductOfferCard({ offer }) {
  const handleClick = async () => {
    await trackOfferClick(offer.id);
    window.open(offer.productUrl, '_blank');
  };
  
  const handleDismiss = async () => {
    await dismissOffer(offer.id);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      {/* Sponsored Label */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">Sponsored</span>
        <button 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex gap-4">
          <img 
            src={offer.imageUrl} 
            alt={offer.title}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {offer.brand}
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{offer.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{offer.description}</p>
            
            {/* Price */}
            <div className="mt-2 flex items-center gap-2">
              {offer.salePrice ? (
                <>
                  <span className="font-bold text-green-600">${offer.salePrice}</span>
                  <span className="text-sm text-gray-400 line-through">${offer.originalPrice}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    {Math.round((1 - offer.salePrice / offer.originalPrice) * 100)}% off
                  </span>
                </>
              ) : (
                <span className="font-bold text-gray-800">${offer.originalPrice}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <button
          onClick={handleClick}
          className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
        >
          View Deal
        </button>
      </div>
    </div>
  );
}
```

### Gear Replacement Suggestion

```jsx
function GearReplacementSuggestion({ gear, offer }) {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-orange-100 rounded-full">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1">
            Time for new {gear.gearType.toLowerCase().replace('_', ' ')}?
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Your {gear.brand} {gear.model} has {(gear.totalDistance / 1000).toFixed(0)}km on it. 
            Most experts recommend replacing after {(gear.maxRecommendedDistance / 1000).toFixed(0)}km.
          </p>
          
          {offer && (
            <div className="bg-white rounded-lg p-3 flex items-center gap-3">
              <img 
                src={offer.imageUrl} 
                alt={offer.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">{offer.title}</div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600">${offer.salePrice}</span>
                  {offer.discountCode && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      Code: {offer.discountCode}
                    </span>
                  )}
                </div>
              </div>
              <a 
                href={offer.productUrl}
                target="_blank"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
              >
                Shop
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Feature Gating Logic

```typescript
// Middleware to check premium access
function requirePremium(feature: string) {
  return async (req, res, next) => {
    const userId = req.user.id;
    const subscription = await db.subscription.findUnique({ where: { userId } });
    
    const isPremium = subscription && 
      ['ACTIVE', 'TRIALING'].includes(subscription.status) &&
      subscription.plan !== 'FREE';
    
    if (!isPremium) {
      return res.status(403).json({
        error: 'PREMIUM_REQUIRED',
        message: `${feature} requires a Pro subscription`,
        upgradeUrl: '/settings/subscription'
      });
    }
    
    next();
  };
}

// Check feature access on frontend
function canAccessFeature(user, feature) {
  const plan = user.subscription?.plan || 'FREE';
  const features = PREMIUM_FEATURES[plan];
  
  switch (feature) {
    case 'global_rankings':
      return features.rankingScopes.includes('global');
    case 'advanced_analytics':
      return features.advancedAnalytics;
    case 'data_export':
      return features.exportData;
    case 'unlimited_sports':
      return features.maxSports === 'unlimited';
    case 'unlimited_teams':
      return features.maxTeams === 'unlimited';
    default:
      return true;
  }
}
```

---

## Product Recommendation Engine

```typescript
async function getPersonalizedOffers(userId: string): Promise<ProductOffer[]> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      gear: { where: { isRetired: false } },
      stats: true,
      sportStats: true,
      activities: {
        take: 50,
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  
  const offers: ProductOffer[] = [];
  
  // 1. Gear replacement offers
  for (const gear of user.gear) {
    if (gear.maxRecommendedDistance && gear.totalDistance >= gear.maxRecommendedDistance * 0.8) {
      const offer = await db.productOffer.findFirst({
        where: {
          targetGearType: gear.gearType,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() }
        },
        orderBy: { salePrice: 'asc' }
      });
      
      if (offer) {
        offers.push({ ...offer, reason: 'gear_replacement', gearId: gear.id });
      }
    }
  }
  
  // 2. Sport-specific offers based on activity
  const activeSports = user.sportStats
    .filter(s => s.totalActivities >= 5)
    .map(s => s.sportId);
  
  const sportOffers = await db.productOffer.findMany({
    where: {
      targetSportId: { in: activeSports },
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() }
    },
    take: 3
  });
  
  offers.push(...sportOffers.map(o => ({ ...o, reason: 'sport_match' })));
  
  // 3. Filter out already viewed/dismissed
  const viewedOfferIds = await db.productOfferView.findMany({
    where: { userId },
    select: { offerId: true }
  }).then(views => new Set(views.map(v => v.offerId)));
  
  return offers.filter(o => !viewedOfferIds.has(o.id)).slice(0, 5);
}

// Track gear usage when activity is logged
async function updateGearUsage(activityId: string) {
  const activity = await db.activity.findUnique({
    where: { id: activityId },
    include: { gearItems: { include: { gear: true } } }
  });
  
  for (const { gear } of activity.gearItems) {
    await db.userGear.update({
      where: { id: gear.id },
      data: {
        totalDistance: { increment: activity.distanceMeters || 0 },
        totalDuration: { increment: activity.durationSeconds || 0 },
        activityCount: { increment: 1 }
      }
    });
    
    // Check if gear needs replacement notification
    const updated = await db.userGear.findUnique({ where: { id: gear.id } });
    if (updated.maxRecommendedDistance && 
        updated.totalDistance >= updated.maxRecommendedDistance * 0.9 &&
        !updated.isRetired) {
      await createNotification(activity.userId, {
        type: 'GEAR_REPLACEMENT',
        title: 'Gear Check',
        message: `Your ${gear.brand} ${gear.model} has ${(updated.totalDistance / 1000).toFixed(0)}km. Consider replacing soon!`,
        data: { gearId: gear.id }
      });
    }
  }
}
```

---

## Stripe Integration

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session
async function createCheckoutSession(userId: string, plan: 'PRO' | 'PRO_ANNUAL', urls: { success: string; cancel: string }) {
  const user = await db.user.findUnique({ where: { id: userId } });
  
  // Get or create Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId }
    });
    customerId = customer.id;
    await db.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId }
    });
  }
  
  const priceId = plan === 'PRO' 
    ? process.env.STRIPE_PRO_MONTHLY_PRICE_ID
    : process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
  
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: urls.success,
    cancel_url: urls.cancel,
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId, plan }
    }
  });
  
  return { checkoutUrl: session.url };
}

// Webhook handler
async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      await db.subscription.upsert({
        where: { userId: subscription.metadata.userId },
        create: {
          userId: subscription.metadata.userId,
          plan: subscription.metadata.plan as SubscriptionPlan,
          status: subscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
        },
        update: {
          plan: subscription.metadata.plan as SubscriptionPlan,
          status: subscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        }
      });
      break;
    }
    
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      const statusMap = {
        'active': 'ACTIVE',
        'trialing': 'TRIALING',
        'past_due': 'PAST_DUE',
        'canceled': 'CANCELED',
        'unpaid': 'EXPIRED'
      };
      
      await db.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: statusMap[subscription.status] || 'CANCELED',
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null
        }
      });
      break;
    }
  }
}
```

---

## Ad Placement Guidelines

```typescript
// Where to show ads (for free users only)
const AD_PLACEMENTS = {
  // Feed: Show ad after every 5 posts
  FEED_INTERVAL: 5,
  
  // Dashboard: One banner in sidebar
  DASHBOARD_SIDEBAR: true,
  
  // Activity detail: Banner at bottom
  ACTIVITY_DETAIL: true,
  
  // Rankings: Banner between sections
  RANKINGS_PAGE: true,
  
  // Never show ads:
  // - During activity logging
  // - On profile pages
  // - In team/community pages
  // - In settings
};

// Check if should show ads
function shouldShowAds(user) {
  const subscription = user.subscription;
  if (!subscription) return true;
  if (subscription.status === 'ACTIVE' && subscription.plan !== 'FREE') return false;
  return true;
}
```
