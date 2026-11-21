import Link from "next/link";
import {Shell,Header} from "@/components/shell";
import {getSales,getClicks,getLeads,getAdSpend} from "@/lib/store";
import {metrics,brl} from "@/lib/metrics";
export const dynamic="force-dynamic";
export default async function Home(){
 const [sales,clicks,leads,spends]=await Promise.all([getSales(),getClicks(),getLeads(),getAdSpend()]);
 const totalSpend=spends.reduce((a,x)=>a+x.amount,0);
 const m=metrics(sales,totalSpend);
 const approved=sales.filter(s=>s.status==="APPROVED");
 const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(6-i));return d;});
 const bars=days.map(d=>{const next=new Date(d);next.setDate(next.getDate()+1);const n=approved.filter(s=>new Date(s.createdAt)>=d&&new Date(s.createdAt)<next).reduce((a,s)=>a+s.amount,0);return{label:d.toLocaleDateString("pt-BR",{weekday:"short"}).replace(".",""),n};});
 const max=Math.max(1,...bars.map(x=>x.n));
 const pending=leads.filter(l=>!["PAID","LOST"].includes(l.status)).length;
 const recent=sales.slice(0,7);
 return <Shell><Header tag="CENTRAL DE PERFORMANCE" title="Dashboard" desc="Uma visão clara do que está acontecendo nas suas vendas e campanhas."/>
 <section className="cards">
  {[["Faturamento aprovado",brl(m.revenue),"Vendas com status aprovado"],["Investimento em anúncios",brl(totalSpend),spends.length+" lançamentos de investimento"],["Lucro após anúncios",brl(m.profit),"Faturamento menos investimento"],["ROAS",m.roas.toFixed(2)+"x","Retorno sobre o investimento"]].map((x,i)=><article className="card metric" key={x[0]}><div className="klabel">{x[0]}</div><div className="kvalue">{x[1]}</div><div className="metric-note">{x[2]}</div></article>)}
 </section>
 <section className="cards" style={{marginTop:13}}>
  {[["Vendas aprovadas",String(m.sales),"Pagamentos confirmados"],["Leads WhatsApp",String(leads.length),"Contatos rastreados"],["Em atendimento",String(pending),"Leads ainda em andamento"],["Visitas rastreadas",String(clicks),"Eventos de página recebidos"]].map(x=><article className="card" key={x[0]}><div className="klabel">{x[0]}</div><div className="kvalue" style={{fontSize:22}}>{x[1]}</div><div className="metric-note">{x[2]}</div></article>)}
 </section>
 <section className="sections">
  <article className="card"><div className="section-title">Faturamento · últimos 7 dias</div><div className="section-sub">Somente pagamentos aprovados</div><div className="chart">{bars.map(b=><div className="barcol" key={b.label}><div className="bar" style={{height:Math.max(3,b.n/max*100)+"%"}} title={brl(b.n)}/><small>{b.label}</small></div>)}</div></article>
  <article className="card"><div className="section-title">Acesso rápido</div><div className="section-sub">Atalhos para as áreas mais usadas</div><div className="list">{[["/leads","◉","Ver leads do WhatsApp"],["/sales","▤","Consultar vendas"],["/tracking","⌁","Criar link rastreável"],["/campaigns","▥","Analisar campanhas"],["/products","□","Gerenciar produtos"]].map(x=><Link href={x[0]} className="listrow" key={x[0]}><i className="dot"/>{x[2]}<span className="grow">Abrir →</span></Link>)}</div><div className="notice warn">O ROAS e o lucro só ficam completos depois de cadastrar os gastos de anúncios. A integração com Meta Ads ainda precisa de credenciais.</div></article>
 </section>
 <section className="card tablewrap"><div className="tablehead"><div><div className="section-title">Últimas vendas</div><div className="section-sub">Movimentações mais recentes recebidas pelo sistema</div></div><Link className="tag" href="/sales">Ver todas →</Link></div><div className="table-scroll"><table><thead><tr><th>Pedido</th><th>Produto</th><th>Origem</th><th>Campanha</th><th>Valor</th><th>Status</th></tr></thead><tbody>{recent.map(s=><tr key={s.id}><td>{s.externalId}</td><td>{s.product}</td><td>{s.source??"Direto"}</td><td>{s.campaign??"—"}</td><td>{brl(s.amount)}</td><td><span className={"status "+(s.status==="PENDING"?"pending":s.status!=="APPROVED"?"lost":"")}>{s.status}</span></td></tr>)}{!recent.length&&<tr><td colSpan={6} className="empty">Nenhuma venda registrada até agora.</td></tr>}</tbody></table></div></section>
 </Shell>;
}