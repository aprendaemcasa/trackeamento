import {NextResponse} from "next/server";
import {z} from "zod";
import {createAdSpend,getAdSpend} from "@/lib/store";
const schema=z.object({platform:z.string().min(2).max(60).default("Meta Ads"),campaign:z.string().max(200).optional(),amount:z.number().positive().finite(),spendDate:z.string().min(10),notes:z.string().max(500).optional()});
export async function GET(){return NextResponse.json({items:await getAdSpend()});}
export async function POST(req:Request){try{const d=schema.parse(await req.json());const item=await createAdSpend({...d,spendDate:new Date(d.spendDate+"T12:00:00")});return NextResponse.json({ok:true,item},{status:201});}catch{return NextResponse.json({ok:false,error:"Confira os dados do investimento."},{status:400});}}
