/**
 * V6 Home Feed
 *
 * Wraps feed tabs with highlights and following content
 */

import { HomeFeedTabs } from "@/components/home/HomeFeedTabs"
import { HighlightsFeed } from "@/components/home/HighlightsFeed"
import { FollowingFeed } from "@/components/home/FollowingFeed"

interface HomeFeedProps {
  userId: string
}

export function HomeFeed({ userId }: HomeFeedProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Activity Feed</h2>

      <HomeFeedTabs
        highlightsContent={<HighlightsFeed userId={userId} />}
        followingContent={<FollowingFeed userId={userId} />}
      />
    </section>
  )
}
