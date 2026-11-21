import {NextRequest,NextResponse} from "next/server";
import {verifySessionToken} from "@/lib/session-token";
const publicPaths=["/login","/api/auth/login","/api/health","/api/tracking","/api/webhooks","/go/whatsapp","/tracking.js"];
export async function middleware(req:NextRequest){const path=req.nextUrl.pathname;if(publicPaths.some(p=>path===p||path.startsWith(p+"/")))return NextResponse.next();const token=req.cookies.get("tracker_session")?.value;if(await verifySessionToken(token))return NextResponse.next();if(path.startsWith("/api/"))return NextResponse.json({ok:false,error:"Não autenticado."},{status:401});const url=req.nextUrl.clone();url.pathname="/login";url.searchParams.set("next",path);return NextResponse.redirect(url);}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)"]};
