import { NextResponse } from 'next/server'

export function apiSuccess(data: unknown, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, message: message ?? 'Success' }, { status })
}

export function apiError(message: string, status = 400, errors?: unknown) {
  return NextResponse.json({ success: false, message, errors }, { status })
}

export function apiUnauthorized(message = 'Unauthorized') {
  return NextResponse.json({ success: false, message }, { status: 401 })
}

export function apiForbidden(message = 'Forbidden') {
  return NextResponse.json({ success: false, message }, { status: 403 })
}

export function apiNotFound(message = 'Resource not found') {
  return NextResponse.json({ success: false, message }, { status: 404 })
}
