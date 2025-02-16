import { NextResponse } from 'next/server';

export function middleware(request: any) {
  const url = request.nextUrl.clone();
  if (url.pathname === '/') {
    url.pathname = '/Inicio';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
