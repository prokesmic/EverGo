import { NextResponse } from 'next/server'
import { isDeprecated, FeatureKey } from './features'

/**
 * Returns a 410 Gone response for deprecated features.
 * Use in API routes to block access to deprecated functionality.
 *
 * @example
 * export async function GET(req: Request) {
 *   const deprecated = deprecatedFeatureResponse('paceBot')
 *   if (deprecated) return deprecated
 *   // ... rest of handler
 * }
 */
export function deprecatedFeatureResponse(feature: FeatureKey) {
  if (isDeprecated(feature)) {
    return NextResponse.json(
      {
        error: 'Feature deprecated',
        message: `The ${feature} feature has been deprecated in EverGo V5.`,
        code: 'FEATURE_DEPRECATED'
      },
      { status: 410 } // Gone
    )
  }
  return null
}

/**
 * Higher-order function to wrap entire route handlers with deprecation check
 *
 * @example
 * export const GET = withDeprecationCheck('paceBot', async (req) => {
 *   // ... handler code
 * })
 */
export function withDeprecationCheck<T extends (...args: unknown[]) => Promise<Response>>(
  feature: FeatureKey,
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const deprecated = deprecatedFeatureResponse(feature)
    if (deprecated) return deprecated
    return handler(...args)
  }) as T
}
