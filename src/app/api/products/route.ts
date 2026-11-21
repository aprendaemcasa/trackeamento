import {NextResponse} from "next/server";
import {z} from "zod";
import {createProduct,getProducts} from "@/lib/store";
const schema=z.object({name:z.string().min(2).max(160),price:z.number().nonnegative().finite().optional()});
export async function GET(){return NextResponse.json({items:await getProducts()});}
export async function POST(req:Request){try{const d=schema.parse(await req.json());const item=await createProduct(d);return NextResponse.json({ok:true,item},{status:201});}catch{return NextResponse.json({ok:false,error:"Confira o nome e o preço do produto."},{status:400});}}
