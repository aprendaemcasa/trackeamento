import {NextResponse} from "next/server";
import {z} from "zod";
import {addClick} from "@/lib/store";
const schema=z.object({eventId:z.string().min(8).max(100),url:z.string().max(2000).optional(),referrer:z.string().max(2000).optional(),source:z.string().max(300).optional(),medium:z.string().max(300).optional(),campaign:z.string().max(500).optional(),content:z.string().max(500).optional(),visitorId:z.string().max(100).optional(),adId:z.string().max(200).optional(),fbclid:z.string().max(500).optional()});
export async function POST(req:Request){try{const d=schema.parse(await req.json());await addClick(d);return NextResponse.json({ok:true});}catch{return NextResponse.json({ok:false,error:"Invalid tracking payload"},{status:400});}}
