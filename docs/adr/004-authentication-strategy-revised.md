# ADR 4: Authentication Strategy (Revised)

## Status

Revised (supersedes original ADR 4)

## Context

The original ADR proposed a guest-only authentication system. However, our monetization strategy requires:

- **Payment tracking**: Need to track who has paid for multiplayer hosting
- **Game limits**: Enforce the number of games a host can create
- **Fraud prevention**: Prevent abuse of free trials
- **Account continuity**: Allow users to access their purchase history

### Revised Requirements

1. **Players**: Zero-friction guest access (no change from original)
2. **Hosts**: Must authenticate to create any multiplayer game
3. **Payment flow**: Seamless upgrade from free to paid after first game
4. **Account management**: Support for password reset, account recovery

## Decision

We will implement a **Hybrid Authentication System**:

### For Players (joining games)

- Pure guest authentication
- No email or registration required
- Session-based identity
- Zero friction to join games

### For Hosts (creating multiplayer games)

- **Authentication required** from the start
- First game is free after authentication
- Subsequent games require payment
- Multiple auth methods supported

### Auth Provider Options

#### 1. Clerk (Recommended)

- **Auth Methods**:
  - Email/password
  - Google OAuth (one-click setup)
  - Magic links
  - Social providers (20+ available)
- **Account Management**:
  - Built-in password reset flow
  - Email verification
  - Account recovery via email
  - Multi-factor authentication
- **Integration Benefits**:
  - Pre-built React components
  - Stripe integration ready
  - User metadata for subscription tracking
- **Cost**: Free up to 5,000 MAU, then $25/mo
- **Why Recommended**: Best balance of features, ease of use, and pricing

#### 2. Auth0

- **Auth Methods**: All major providers including Google
- **Account Management**: Comprehensive but complex to configure
- **Password Recovery**: Customizable flows but requires setup
- **Cost**: Limited free tier (7,000 MAU), expensive at scale
- **Verdict**: Overkill for our simple use case

#### 3. Supabase Auth

- **Auth Methods**: Google OAuth, email/password, magic links
- **Account Management**: Basic password reset via email
- **Integration**: Tight coupling with Supabase database
- **Cost**: Generous free tier
- **Verdict**: Good if using Supabase for everything

#### 4. Firebase Auth

- **Auth Methods**: Google OAuth native, email/password
- **Account Management**: Google-managed password reset
- **Integration**: Excellent with Google services
- **Cost**: Very generous free tier
- **Verdict**: Good option but creates Google dependency

## Implementation Approach

### Authentication Flow

```typescript
// Authentication states
interface AuthState {
  mode: "guest" | "authenticated";
  guestId: string; // Always present for session tracking
  userId?: string; // Only for authenticated users
  email?: string;
  authMethod?: "google" | "email" | "magic_link";
  subscription?: {
    freeGameUsed: boolean;
    gamesRemaining: number;
    unlimited: boolean;
    expiresAt?: Date;
  };
}

// Player joins game - no auth needed
async function joinGame(gameCode: string) {
  const guestId = getOrCreateGuestId();
  return gameService.join(gameCode, guestId);
}

// Host creates game - auth required
async function createGame() {
  const user = await authService.getCurrentUser();

  if (!user) {
    // Show auth modal with Google and email options
    return authModal.show({
      title: "Sign in to create games",
      message: "Your first game is free!",
      providers: ["google", "email"],
      onSuccess: () => createGame(), // Retry after auth
    });
  }

  // Check if eligible for free game
  if (!user.subscription.freeGameUsed) {
    const game = await gameService.create(user.id);
    await userService.markFreeGameUsed(user.id);

    // Prepare for seamless payment after game
    await preparePaymentFlow(user.id);
    return game;
  }

  // Requires payment
  if (!user.subscription.gamesRemaining) {
    return showSeamlessPayment();
  }

  return gameService.create(user.id);
}
```

### Seamless Payment Flow

```typescript
// After first game ends
async function onGameEnd(gameId: string) {
  const user = await authService.getCurrentUser();
  const game = await gameService.getGame(gameId);

  if (game.hostId === user?.id && user.subscription.freeGameUsed) {
    // Show inline payment prompt
    showPaymentPrompt({
      message: "Want to keep playing? Get 10 games for €6.99",
      cta: "Continue Playing",
      oneClick: true, // Use saved payment method if available
      onSuccess: async () => {
        // Immediately create next game
        const newGame = await gameService.create(user.id);
        // Auto-redirect to new game with same players
        redirectToGame(newGame.id, { invitePlayers: game.players });
      },
    });
  }
}

// One-click payment for returning users
async function showSeamlessPayment() {
  const user = await authService.getCurrentUser();
  const hasPaymentMethod = await stripe.hasPaymentMethod(user.id);

  if (hasPaymentMethod) {
    // One-click purchase
    return showQuickBuy({
      amount: "€6.99",
      description: "10 Tombola games",
      confirmButton: "Buy & Start Game",
      onSuccess: () => createGame(),
    });
  } else {
    // Standard Stripe checkout
    return stripe.checkout({
      priceId: "price_10_games",
      successUrl: "/game/create?paid=true",
    });
  }
}
```

### Account Management with Clerk

```typescript
// Using Clerk's pre-built components
import {
  SignIn,
  SignUp,
  UserButton,
  useUser,
  useAuth
} from '@clerk/clerk-react';

// Sign-in component with Google OAuth
export function SignInModal({ onSuccess }: { onSuccess: () => void }) {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "shadow-xl"
        }
      }}
      redirectUrl={window.location.href}
      afterSignInUrl={window.location.href}
      routing="virtual"
      socialButtonsVariant="iconButton"
      // Google OAuth is prominent
      socialButtonsPlacement="top"
    />
  );
}

// User profile with account management
export function UserProfile() {
  const { user } = useUser();

  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: "w-10 h-10"
        }
      }}
      // Includes built-in:
      // - Change password
      // - Manage email addresses
      // - Security settings
      // - Sign out
    />
  );
}

// Password reset handled by Clerk automatically
// Users receive email with reset link
// No custom implementation needed
```

## Password Recovery & Account Management

### How Each Provider Handles Recovery

#### Clerk (Recommended)

- **Password Reset**: Automated email flow with customizable templates
- **Google Auth Issues**: Falls back to email recovery
- **Account Recovery**: Support for multiple email addresses
- **Security**: 2FA, device management, session control
- **User Experience**: Pre-built UI components, no custom code needed

#### Auth0

- **Password Reset**: Requires custom email templates and flows
- **Account Recovery**: Powerful but complex rules engine
- **Implementation**: More setup work required

#### Firebase

- **Password Reset**: Simple but limited customization
- **Google Auth**: Seamless if user has Google account
- **Limitation**: Tied to Google's UX patterns

#### Supabase

- **Password Reset**: Basic email flow
- **Customization**: Limited without self-hosting
- **Recovery**: Standard email-based only

### UX Optimization for Seamless Payment

```typescript
// Optimized payment flow after first game
interface PaymentPromptConfig {
  // Timing: Show during game wrap-up, not abruptly after
  showDuringGameEnd: true;

  // Visual: Non-blocking overlay
  displayMode: "overlay" | "inline";

  // Message: Positive framing
  messaging: {
    header: "That was fun! 🎉";
    subtext: "Keep the party going with 10 more games";
    cta: "Continue for €6.99";
    dismiss: "Maybe later";
  };

  // Behavior: Smart persistence
  persistence: {
    dismissable: true;
    showAgainAfter: "24h";
    maxDismissals: 3;
  };
}

// Reduce clicks to payment
const paymentFlow = {
  authenticated: {
    newUser: 2, // Click "Continue" → Stripe checkout
    returningUser: 1, // Click "Continue" with saved card
  },
  notAuthenticated: 0, // Can't create game without auth
};
```

## Consequences

### Positive

- **Zero friction for players**: Join games without any barriers
- **Controlled monetization**: Every host tracked from the start
- **Better fraud prevention**: No anonymous game creation abuse
- **Account continuity**: Users can access purchase history
- **Professional UX**: Leverages tested auth patterns
- **Multiple auth options**: Google OAuth reduces friction

### Negative

- **Initial friction for hosts**: Must sign up to create first game
- **Auth provider dependency**: Relying on third-party service
- **Complexity**: More moving parts than pure guest system
- **Privacy concerns**: Some users resist creating accounts

### Mitigation Strategies

- **Clear value proposition**: "First game free" messaging
- **Social proof**: "Join 50,000 families playing Tombola"
- **Guest player emphasis**: Highlight that players don't need accounts
- **Progressive disclosure**: Only ask for auth when creating game

## Security Considerations

### With Clerk Implementation

- **Password Requirements**: Configurable strength rules
- **Session Security**: Automatic session invalidation
- **OAuth Security**: Handled by provider (Google)
- **Data Protection**: GDPR-compliant by default
- **Account Takeover**: Built-in protections and alerts

## References

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Google OAuth Setup](https://clerk.com/docs/authentication/social-connections/google)
- [Stripe Checkout Integration](https://stripe.com/docs/checkout)
- [Auth Provider Comparison](https://github.com/supertokens/awesome-auth)
