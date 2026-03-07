import { randomUUID } from "crypto"
import { NextResponse } from "next/server"

export const REQUEST_ID_HEADER = "x-request-id"

export function getRequestIdFromRequest(request: Request): string {
  return request.headers.get(REQUEST_ID_HEADER) ?? randomUUID()
}

export function jsonWithRequestId(
  requestId: string,
  body: unknown,
  init?: { status?: number }
) {
  const response = NextResponse.json(body, init)
  response.headers.set(REQUEST_ID_HEADER, requestId)
  return response
}

export function errorWithRequestId(
  requestId: string,
  message: string,
  status: number
) {
  return jsonWithRequestId(requestId, { error: message, requestId }, { status })
}
