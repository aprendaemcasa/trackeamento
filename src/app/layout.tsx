import type {Metadata} from "next";import "./globals.css";
export const metadata:Metadata={title:"Tracker Pro | Tracking de vendas",description:"Painel próprio de rastreamento e atribuição."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>;}