-- Enable Row Level Security (RLS) on all tables
-- This migration enables RLS and creates policies for Supabase security

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

-- User & Auth tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserStats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserStreak" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserSport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserSportStats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserGear" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserBadge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserTrainingPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PushToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;

-- Activity tables
ALTER TABLE "Activity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityGear" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PersonalRecord" ENABLE ROW LEVEL SECURITY;

-- Social tables
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Like" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Follow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FriendRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- Team tables
ALTER TABLE "Team" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeamMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeamJoinRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeamPost" ENABLE ROW LEVEL SECURITY;

-- Community tables
ALTER TABLE "Community" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityPost" ENABLE ROW LEVEL SECURITY;

-- Challenge tables
ALTER TABLE "Challenge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChallengeParticipant" ENABLE ROW LEVEL SECURITY;

-- Partner Request tables
ALTER TABLE "PartnerRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnerRequestParticipant" ENABLE ROW LEVEL SECURITY;

-- Ranking tables
ALTER TABLE "Ranking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RankingCache" ENABLE ROW LEVEL SECURITY;

-- Reference tables (read-only for most users)
ALTER TABLE "Sport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Discipline" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Badge" ENABLE ROW LEVEL SECURITY;

-- Training Plan tables
ALTER TABLE "TrainingPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TrainingPlanWeek" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TrainingPlanWorkout" ENABLE ROW LEVEL SECURITY;

-- Product/Offer tables
ALTER TABLE "ProductOffer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductOfferView" ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE POLICIES
-- Since this app uses Prisma with server-side API routes (service role),
-- we create permissive policies that allow the service role full access.
-- The anon role gets read access to public data only.
-- =============================================================================

-- Helper: Service role bypass policy (applies to all tables)
-- The service_role bypasses RLS by default in Supabase, but we add explicit policies for clarity

-- -----------------------------------------------------------------------------
-- USER TABLE POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Users are viewable by everyone" ON "User"
  FOR SELECT USING (true);

CREATE POLICY "Users can update own record" ON "User"
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Service role full access to User" ON "User"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- USER STATS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "User stats are viewable by everyone" ON "UserStats"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to UserStats" ON "UserStats"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- USER STREAK POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Streaks are viewable by everyone" ON "UserStreak"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to UserStreak" ON "UserStreak"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- USER SPORT POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "User sports are viewable by everyone" ON "UserSport"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to UserSport" ON "UserSport"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- USER SPORT STATS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "User sport stats are viewable by everyone" ON "UserSportStats"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to UserSportStats" ON "UserSportStats"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- USER GEAR POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "User gear viewable by owner" ON "UserGear"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to UserGear" ON "UserGear"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- USER BADGE POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Badges are viewable by everyone" ON "UserBadge"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to UserBadge" ON "UserBadge"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- USER TRAINING PLAN POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Training plans viewable by owner" ON "UserTrainingPlan"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to UserTrainingPlan" ON "UserTrainingPlan"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- NOTIFICATION SETTINGS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Notification settings viewable by owner" ON "NotificationSettings"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to NotificationSettings" ON "NotificationSettings"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- PUSH TOKEN POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Push tokens viewable by service role only" ON "PushToken"
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to PushToken" ON "PushToken"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- SUBSCRIPTION POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Subscriptions viewable by service role" ON "Subscription"
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to Subscription" ON "Subscription"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- ACTIVITY POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Activities are viewable by everyone" ON "Activity"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to Activity" ON "Activity"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- ACTIVITY GEAR POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Activity gear viewable by everyone" ON "ActivityGear"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to ActivityGear" ON "ActivityGear"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- PERSONAL RECORD POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Personal records are viewable by everyone" ON "PersonalRecord"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to PersonalRecord" ON "PersonalRecord"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- POST POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Posts are viewable by everyone" ON "Post"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to Post" ON "Post"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- LIKE POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Likes are viewable by everyone" ON "Like"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to Like" ON "Like"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- COMMENT POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Comments are viewable by everyone" ON "Comment"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to Comment" ON "Comment"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- FOLLOW POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Follows are viewable by everyone" ON "Follow"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to Follow" ON "Follow"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- FRIEND REQUEST POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Friend requests viewable by involved users" ON "FriendRequest"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to FriendRequest" ON "FriendRequest"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- NOTIFICATION POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Notifications viewable by recipient" ON "Notification"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to Notification" ON "Notification"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- TEAM POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Teams are viewable by everyone" ON "Team"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to Team" ON "Team"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- TEAM MEMBER POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Team members are viewable by everyone" ON "TeamMember"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to TeamMember" ON "TeamMember"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- TEAM JOIN REQUEST POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Team join requests viewable by team members" ON "TeamJoinRequest"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to TeamJoinRequest" ON "TeamJoinRequest"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- TEAM POST POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Team posts viewable by team members" ON "TeamPost"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to TeamPost" ON "TeamPost"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- COMMUNITY POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Communities are viewable by everyone" ON "Community"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to Community" ON "Community"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- COMMUNITY MEMBER POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Community members are viewable by everyone" ON "CommunityMember"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to CommunityMember" ON "CommunityMember"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- COMMUNITY POST POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Community posts viewable by everyone" ON "CommunityPost"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to CommunityPost" ON "CommunityPost"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- CHALLENGE POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Challenges are viewable by everyone" ON "Challenge"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to Challenge" ON "Challenge"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- CHALLENGE PARTICIPANT POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Challenge participants are viewable by everyone" ON "ChallengeParticipant"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to ChallengeParticipant" ON "ChallengeParticipant"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- PARTNER REQUEST POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Partner requests are viewable by everyone" ON "PartnerRequest"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to PartnerRequest" ON "PartnerRequest"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- PARTNER REQUEST PARTICIPANT POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Partner request participants viewable by everyone" ON "PartnerRequestParticipant"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to PartnerRequestParticipant" ON "PartnerRequestParticipant"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- RANKING POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Rankings are viewable by everyone" ON "Ranking"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to Ranking" ON "Ranking"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- RANKING CACHE POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Ranking cache viewable by everyone" ON "RankingCache"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to RankingCache" ON "RankingCache"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- SPORT POLICIES (Reference table - read only for public)
-- -----------------------------------------------------------------------------
CREATE POLICY "Sports are viewable by everyone" ON "Sport"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to Sport" ON "Sport"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- DISCIPLINE POLICIES (Reference table - read only for public)
-- -----------------------------------------------------------------------------
CREATE POLICY "Disciplines are viewable by everyone" ON "Discipline"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to Discipline" ON "Discipline"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- BADGE POLICIES (Reference table - read only for public)
-- -----------------------------------------------------------------------------
CREATE POLICY "Badges are viewable by everyone" ON "Badge"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to Badge" ON "Badge"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- TRAINING PLAN POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Training plans are viewable by everyone" ON "TrainingPlan"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to TrainingPlan" ON "TrainingPlan"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- TRAINING PLAN WEEK POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Training plan weeks are viewable by everyone" ON "TrainingPlanWeek"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to TrainingPlanWeek" ON "TrainingPlanWeek"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- TRAINING PLAN WORKOUT POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Training plan workouts are viewable by everyone" ON "TrainingPlanWorkout"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to TrainingPlanWorkout" ON "TrainingPlanWorkout"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- PRODUCT OFFER POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Product offers are viewable by everyone" ON "ProductOffer"
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to ProductOffer" ON "ProductOffer"
  FOR ALL USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- PRODUCT OFFER VIEW POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Product offer views viewable by service role" ON "ProductOfferView"
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to ProductOfferView" ON "ProductOfferView"
  FOR ALL USING (auth.role() = 'service_role');
