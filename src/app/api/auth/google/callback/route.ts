import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COUNTRY_FLAGS: Record<string, string> = {
  ID: "🇮🇩", US: "🇺🇸", GB: "🇬🇧", JP: "🇯🇵", KR: "🇰🇷",
  BR: "🇧🇷", DE: "🇩🇪", FR: "🇫🇷", CN: "🇨🇳", AU: "🇦🇺",
  IN: "🇮🇳", RU: "🇷🇺",
};

export async function GET(request: Request) {
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/?auth_error=google_denied`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/?auth_error=no_google_credentials`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return NextResponse.redirect(`${appUrl}/?auth_error=token_exchange_failed`);
    }

    // Fetch Google profile
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();

    const googleEmail: string = profile.email;
    const googleName: string = profile.given_name || profile.name || googleEmail.split("@")[0];
    const country = COUNTRY_FLAGS[profile.locale?.toUpperCase?.() ?? ""] ?? "🌍";

    // Sanitize username: lowercase, no spaces, max 20 chars
    const username = googleName.toLowerCase().replace(/\s+/g, "_").slice(0, 20);

    let user;
    try {
      user = await prisma.user.findUnique({ where: { email: googleEmail } });
      if (!user) {
        // Check if username exists, append number if so
        let finalUsername = username;
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) finalUsername = `${username}_${Math.floor(Math.random() * 9000 + 1000)}`;

        user = await prisma.user.create({
          data: {
            username: finalUsername,
            email: googleEmail,
            displayName: profile.name ?? googleName,
            country,
            avatarUrl: profile.picture ?? null,
          },
        });
      }
    } catch (_dbErr) {
      // DB not configured — create mock session with Google identity
      const mockId = `mock:${username}:${googleEmail}:${country}`;
      const response = NextResponse.redirect(`${appUrl}/dashboard/solo`);
      response.cookies.set("user_session", mockId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    const response = NextResponse.redirect(`${appUrl}/dashboard/solo`);
    response.cookies.set("user_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/?auth_error=unexpected`);
  }
}
