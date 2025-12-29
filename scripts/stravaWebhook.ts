/**
 * Strava Webhook Subscription Management Script
 *
 * Usage:
 *   npx tsx scripts/stravaWebhook.ts create
 *   npx tsx scripts/stravaWebhook.ts list
 *   npx tsx scripts/stravaWebhook.ts delete <subscription_id>
 *
 * Environment variables required:
 *   AUTH_STRAVA_ID
 *   AUTH_STRAVA_SECRET
 *   STRAVA_WEBHOOK_VERIFY_TOKEN
 *   STRAVA_WEBHOOK_CALLBACK_URL (or NEXTAUTH_URL)
 */

const STRAVA_SUBSCRIPTION_URL = "https://www.strava.com/api/v3/push_subscriptions"

async function getCredentials() {
  const clientId = process.env.AUTH_STRAVA_ID
  const clientSecret = process.env.AUTH_STRAVA_SECRET
  const verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN
  const callbackUrl =
    process.env.STRAVA_WEBHOOK_CALLBACK_URL ||
    (process.env.NEXTAUTH_URL && `${process.env.NEXTAUTH_URL}/api/strava/webhook`)

  if (!clientId || !clientSecret) {
    throw new Error("Missing AUTH_STRAVA_ID or AUTH_STRAVA_SECRET")
  }

  if (!verifyToken) {
    throw new Error("Missing STRAVA_WEBHOOK_VERIFY_TOKEN")
  }

  if (!callbackUrl) {
    throw new Error("Missing STRAVA_WEBHOOK_CALLBACK_URL or NEXTAUTH_URL")
  }

  return { clientId, clientSecret, verifyToken, callbackUrl }
}

async function listSubscriptions() {
  const { clientId, clientSecret } = await getCredentials()

  const response = await fetch(
    `${STRAVA_SUBSCRIPTION_URL}?client_id=${clientId}&client_secret=${clientSecret}`
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to list subscriptions: ${error}`)
  }

  const subscriptions = await response.json()
  return subscriptions
}

async function createSubscription() {
  const { clientId, clientSecret, verifyToken, callbackUrl } = await getCredentials()

  console.log("Creating webhook subscription...")
  console.log(`  Callback URL: ${callbackUrl}`)
  console.log(`  Client ID: ${clientId}`)

  const response = await fetch(STRAVA_SUBSCRIPTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      callback_url: callbackUrl,
      verify_token: verifyToken,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create subscription: ${error}`)
  }

  const result = await response.json()
  return result
}

async function deleteSubscription(subscriptionId: string) {
  const { clientId, clientSecret } = await getCredentials()

  console.log(`Deleting subscription ${subscriptionId}...`)

  const response = await fetch(`${STRAVA_SUBSCRIPTION_URL}/${subscriptionId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to delete subscription: ${error}`)
  }

  return true
}

async function main() {
  const command = process.argv[2]

  try {
    switch (command) {
      case "list":
        console.log("Listing webhook subscriptions...\n")
        const subscriptions = await listSubscriptions()
        if (subscriptions.length === 0) {
          console.log("No subscriptions found.")
        } else {
          console.log("Subscriptions:")
          for (const sub of subscriptions) {
            console.log(`  ID: ${sub.id}`)
            console.log(`  Callback URL: ${sub.callback_url}`)
            console.log(`  Created: ${sub.created_at}`)
            console.log(`  Updated: ${sub.updated_at}`)
            console.log("")
          }
        }
        break

      case "create":
        const created = await createSubscription()
        console.log("\nSubscription created successfully!")
        console.log(`  ID: ${created.id}`)
        break

      case "delete":
        const subscriptionId = process.argv[3]
        if (!subscriptionId) {
          console.error("Usage: npx tsx scripts/stravaWebhook.ts delete <subscription_id>")
          process.exit(1)
        }
        await deleteSubscription(subscriptionId)
        console.log("Subscription deleted successfully!")
        break

      default:
        console.log("Strava Webhook Subscription Manager")
        console.log("")
        console.log("Commands:")
        console.log("  list                    List all webhook subscriptions")
        console.log("  create                  Create a new webhook subscription")
        console.log("  delete <subscription_id> Delete a webhook subscription")
        console.log("")
        console.log("Note: Strava only allows ONE webhook subscription per app.")
        break
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
