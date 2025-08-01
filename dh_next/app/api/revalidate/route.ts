import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ revalidated: true, now: Date.now() })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ revalidated: true, now: Date.now() })
}
