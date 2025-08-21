# MVP Implementation Checklist

## Pre-Development Setup

- [ ] Install Docker Desktop
- [ ] Install Node.js 18+
- [ ] Install pnpm globally
- [ ] Create Clerk account
- [ ] Set up Clerk application with Google OAuth
- [ ] Copy Clerk API keys

## Stage 1: Local Environment (Day 1)

- [ ] Create docker-compose.yml with Redis
- [ ] Set up environment files (.env)
- [ ] Configure pnpm workspace scripts
- [ ] Start Docker services
- [ ] Verify Redis connection
- [ ] Test all services are running

## Stage 2: WebSocket Infrastructure (Day 2)

- [ ] Install Socket.io dependencies
- [ ] Create typed event interfaces in shared package
- [ ] Set up Socket.io server with CORS
- [ ] Create Socket.io client service
- [ ] Test basic ping/pong connection
- [ ] Add connection status UI component

## Stage 3: Authentication (Day 3)

- [ ] Install Clerk SDKs (frontend + backend)
- [ ] Configure ClerkProvider in React
- [ ] Create authentication UI components
- [ ] Add JWT verification middleware
- [ ] Test Google OAuth flow
- [ ] Implement user metadata for game tracking

## Stage 4: Redis Sessions (Day 4)

- [ ] Create Redis service wrapper
- [ ] Implement session manager
- [ ] Add session creation/validation
- [ ] Test session persistence
- [ ] Add session cleanup logic
- [ ] Verify guest session creation

## Stage 5: Game Logic + Host Approval (Days 5-6)

- [ ] Create game manager service
- [ ] Implement game creation (auth required)
- [ ] Add game code generation
- [ ] Build join request system
- [ ] Create approval/rejection handlers
- [ ] Add waiting room functionality
- [ ] Test complete approval flow
- [ ] Implement game state persistence

## Stage 6: Frontend UI (Days 7-8)

- [ ] Create game creation page with auth
- [ ] Build host dashboard with approval UI
- [ ] Design guest join page
- [ ] Add waiting room UI for guests
- [ ] Implement real-time updates
- [ ] Create game lobby component
- [ ] Add player list with status
- [ ] Style all components

## Stage 7: Testing & Validation (Day 9)

- [ ] Test first-time host free game
- [ ] Verify guest join with approval
- [ ] Test guest rejection flow
- [ ] Validate payment required message
- [ ] Check reconnection handling
- [ ] Test multiple concurrent games
- [ ] Verify all error messages
- [ ] Document any issues found

## MVP Completion Criteria

- [ ] Host can create game with authentication
- [ ] Game generates shareable 6-character code
- [ ] Guests can request to join without auth
- [ ] Host sees join requests in real-time
- [ ] Host can approve/reject requests
- [ ] Approved guests join immediately
- [ ] Rejected guests see appropriate message
- [ ] Game shows all connected players
- [ ] Free trial properly tracked
- [ ] Payment prompt appears after free game

## Bonus Features (If Time Permits)

- [ ] Copy game code to clipboard
- [ ] QR code for easy sharing
- [ ] Sound notifications for join requests
- [ ] Auto-reconnection with state recovery
- [ ] Basic game statistics
- [ ] Player connection indicators

## Known Issues to Address Later

- [ ] Rate limiting implementation
- [ ] Comprehensive error handling
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Automated testing
- [ ] Production deployment config

## Post-MVP Next Steps

1. Complete game mechanics (drawing, marking, prizes)
2. Integrate Stripe for payments
3. Add comprehensive testing
4. Deploy to staging environment
5. Security audit
6. Performance testing
7. Production deployment
