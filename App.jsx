import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPA_URL = "https://fmpjuqcvqtiujyfvvdmg.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcGp1cWN2cXRpdWp5ZnZ2ZG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMzQ0NDAsImV4cCI6MjA4NzkxMDQ0MH0.btw88qY_-2SZhfvppGWJ7dilZ3zihiIfIu1Jx_N4S34";
const sb = createClient(SUPA_URL, SUPA_KEY);

const SUPPLIERS = ["Compomax","Shinhua","TRI-FUSION","KEIEMU","OKAMURA","RS UNITECH","EASTERN","NMP","MAKOTO"];
const ITEM_TYPES = ["Assy","Stock","Reuse","Machining"];
const RFQ_QTYS = [1,2,3,4,5,6,7,8,9,10,16,"20+"];

const genId = () => Math.random().toString(36).slice(2,10);
const today = () => new Date().toISOString().split("T")[0];
const genPurNo = (supplier, seq) => `${today().replace(/-/g,"")}${supplier.replace(/[\s-]/g,"").slice(0,4).toUpperCase()}-${String(seq).padStart(3,"0")}`;
const genRfqNo = seq => `RFQ-${today().replace(/-/g,"")}-${String(seq).padStart(3,"0")}`;

const TYPE_META = {
  Assy:     { color:"#2568FB", bg:"rgba(37,104,251,0.12)",  border:"rgba(37,104,251,0.3)" },
  Stock:    { color:"#22d3a0", bg:"rgba(34,211,160,0.12)",  border:"rgba(34,211,160,0.3)" },
  Reuse:    { color:"#a78bfa", bg:"rgba(167,139,250,0.12)", border:"rgba(167,139,250,0.3)" },
  Machining:{ color:"#fb923c", bg:"rgba(251,146,60,0.12)",  border:"rgba(251,146,60,0.3)" },
};
const ROLE_COLOR  = { admin:"#a78bfa", engineering:"#2568FB", purchasing:"#22d3a0", supplier:"#FECD45", logistics:"#2dd4bf" };
const ROLE_BG     = { admin:"rgba(167,139,250,0.18)", engineering:"rgba(37,104,251,0.18)", purchasing:"rgba(34,211,160,0.18)", supplier:"rgba(254,205,69,0.18)", logistics:"rgba(45,212,191,0.18)" };

// ─── Icons ────────────────────────────────────────────────────────────────────
const ICONS = {
  home:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  po:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
  bell:"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",
  plus:"M12 5v14M5 12h14",
  trash:"M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  edit:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
  check:"M20 6L9 17l-5-5",
  x:"M18 6L6 18M6 6l12 12",
  file:"M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z",
  clip:"M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
  eye:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",
  logout:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  layers:"M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  rfq:"M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
  send:"M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",
  award:"M12 15l-3 6 3-1 3 1-3-6zM12 2a7 7 0 1 1 0 14A7 7 0 0 1 12 2z",
  truck:"M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  pkg:"M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  users:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
  triage:"M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M12 12h.01M12 16h.01",
  cart:"M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z",
};
const ICON_EXTRA = {
  users:"M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 0 0-7.75",
  bell:"M13.73 21a2 2 0 0 1-3.46 0",
  po:"M14 2v6h6", file:"M13 2v6h6",
  eye:"M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
  edit:"M15.5 3.5l5 5L7 22H2v-5L15.5 3.5z",
};
const Icon = ({ name, size=15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={ICONS[name]||""}/>
    {ICON_EXTRA[name]&&<path d={ICON_EXTRA[name]}/>}
  </svg>
);

// ─── Global Styles ────────────────────────────────────────────────────────────
function useGlobalStyles() {
  useEffect(() => {
    const existing = document.getElementById("pf-styles");
    if (existing) existing.remove();
    const el = document.createElement("style");
    el.id = "pf-styles";
    el.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Mono',monospace;background:#0a1535;color:#e2e8f0;min-height:100vh}
::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:#111827}::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
.app{min-height:100vh;background:linear-gradient(135deg,#071030,#102060 50%,#071030)}
.layout{display:flex;min-height:100vh}
.sidebar{width:252px;min-width:252px;background:rgba(4,10,32,1);border-right:1px solid rgba(37,104,251,0.15);display:flex;flex-direction:column}
.slogo{padding:26px 22px 18px;font-family:'Syne',sans-serif;font-weight:800;font-size:17px;letter-spacing:-0.5px;background:linear-gradient(135deg,#2568FB,#FECD45);-webkit-background-clip:text;-webkit-text-fill-color:transparent;border-bottom:1px solid rgba(148,163,184,0.07)}
.ssec{padding:14px 12px 6px;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#3d4f63}
.nitem{display:flex;align-items:center;gap:9px;padding:9px 14px;margin:2px 8px;border-radius:7px;cursor:pointer;transition:background .15s,color .15s;color:#64748b;font-size:12.5px}
.nitem:hover{background:rgba(148,163,184,0.07);color:#cbd5e1}.nitem.active{background:rgba(37,104,251,0.1);color:#2568FB}
.sfooter{margin-top:auto;padding:14px;border-top:1px solid rgba(148,163,184,0.07)}
.uchip{display:flex;align-items:center;gap:9px;padding:9px;border-radius:8px;background:rgba(12,28,65,0.5)}
.uavatar{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;flex-shrink:0}
.uname{font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.urole{font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:1px;margin-top:1px}
.lbtn{background:none;border:none;color:#475569;cursor:pointer;padding:3px;display:flex}.lbtn:hover{color:#f56565}
.main{flex:1;overflow:hidden;display:flex;flex-direction:column;min-width:0}
.page{flex:1;overflow-y:auto;padding:28px 32px}
.card{background:rgba(12,28,80,0.8);border:1px solid rgba(37,104,251,0.25);border-radius:12px;padding:22px;margin-bottom:18px}
.ctitle{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;margin-bottom:18px;display:flex;align-items:center;gap:8px}
.ctitle .sub{opacity:.45;font-weight:400;font-size:12px}
.fgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
.fgroup{display:flex;flex-direction:column;gap:5px}
.flabel{font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:#64748b}
.btn{padding:8px 16px;border-radius:7px;font-family:'DM Mono',monospace;font-size:12px;cursor:pointer;border:none;transition:all .15s;display:inline-flex;align-items:center;gap:5px;font-weight:500;white-space:nowrap}
.btn-xs{padding:4px 10px;font-size:11px}.btn-sm{padding:6px 11px;font-size:12px}
.b-blue{background:rgba(37,104,251,0.12);color:#FECD45;border:1px solid rgba(37,104,251,0.22)}.b-blue:hover{background:rgba(37,104,251,0.22)}
.b-green{background:rgba(34,211,160,0.12);color:#22d3a0;border:1px solid rgba(34,211,160,0.22)}.b-green:hover{background:rgba(34,211,160,0.22)}
.b-red{background:rgba(245,101,101,0.12);color:#f56565;border:1px solid rgba(245,101,101,0.22)}.b-red:hover{background:rgba(245,101,101,0.22)}
.b-purple{background:rgba(167,139,250,0.12);color:#a78bfa;border:1px solid rgba(167,139,250,0.22)}.b-purple:hover{background:rgba(167,139,250,0.22)}
.b-orange{background:rgba(251,146,60,0.12);color:#fb923c;border:1px solid rgba(251,146,60,0.22)}.b-orange:hover{background:rgba(251,146,60,0.22)}
.b-gray{background:rgba(100,116,139,0.12);color:#94a3b8;border:1px solid rgba(100,116,139,0.18)}.b-gray:hover{background:rgba(100,116,139,0.22)}
.b-yellow{background:rgba(254,205,69,0.12);color:#FECD45;border:1px solid rgba(254,205,69,0.22)}.b-yellow:hover{background:rgba(254,205,69,0.22)}
.b-teal{background:rgba(20,184,166,0.12);color:#2dd4bf;border:1px solid rgba(20,184,166,0.22)}.b-teal:hover{background:rgba(20,184,166,0.22)}
.tw{overflow-x:auto;-webkit-overflow-scrolling:touch}
table{width:100%;border-collapse:collapse;font-size:12px}
th{padding:9px 12px;text-align:left;font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:#475569;border-bottom:1px solid rgba(148,163,184,0.08);white-space:nowrap}
td{padding:10px 12px;border-bottom:1px solid rgba(148,163,184,0.05);vertical-align:middle}
tr:hover td{background:rgba(148,163,184,0.02)}
.badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:9.5px;letter-spacing:1px;text-transform:uppercase;font-weight:600;white-space:nowrap}
.bblue{background:rgba(37,104,251,0.1);color:#2568FB;border:1px solid rgba(37,104,251,0.2)}
.bgreen{background:rgba(34,211,160,0.1);color:#22d3a0;border:1px solid rgba(34,211,160,0.2)}
.byellow{background:rgba(254,205,69,0.1);color:#FECD45;border:1px solid rgba(254,205,69,0.2)}
.bpurple{background:rgba(167,139,250,0.1);color:#a78bfa;border:1px solid rgba(167,139,250,0.2)}
.bred{background:rgba(245,101,101,0.1);color:#f56565;border:1px solid rgba(245,101,101,0.2)}
.borange{background:rgba(251,146,60,0.1);color:#fb923c;border:1px solid rgba(251,146,60,0.2)}
.bteal{background:rgba(20,184,166,0.1);color:#2dd4bf;border:1px solid rgba(20,184,166,0.2)}
.ndot{width:7px;height:7px;background:#f56565;border-radius:50%;display:inline-block}
.moverlay{position:fixed;inset:0;background:rgba(0,0,0,0.72);z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(5px)}
.modal{background:#0a1535;border:1px solid rgba(148,163,184,0.13);border-radius:14px;padding:28px;width:90%;max-width:700px;max-height:88vh;overflow-y:auto;position:relative}
.mtitle{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;margin-bottom:22px}
.mclose{position:absolute;top:18px;right:18px;background:none;border:none;color:#475569;cursor:pointer;display:flex}.mclose:hover{color:#e2e8f0}
.sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;margin-bottom:24px}
.scard{background:rgba(12,28,80,0.8);border:1px solid rgba(37,104,251,0.25);border-radius:11px;padding:18px}
.sval{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;line-height:1}
.slbl{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#475569;margin-top:5px}
.fi{background:rgba(8,22,60,0.8);border:1px solid rgba(37,104,251,0.12);border-radius:7px;padding:8px 11px;color:#e2e8f0;font-family:'DM Mono',monospace;font-size:12px;width:100%;outline:none;transition:border .15s}
.fi:focus{border-color:rgba(37,104,251,0.35)}
.fi-admin{background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.2);border-radius:6px;padding:5px 8px;color:#e2e8f0;font-family:'DM Mono',monospace;font-size:11px;width:100%;outline:none}
.fi-admin:focus{border-color:rgba(167,139,250,0.5)}
select.fi,select.fi-admin{appearance:none;cursor:pointer}
.tab-bar{display:flex;gap:0;border-bottom:2px solid rgba(148,163,184,0.08);margin-bottom:22px}
.tab-item{padding:9px 18px;font-size:12px;font-family:'DM Mono',monospace;cursor:pointer;color:#475569;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .15s;white-space:nowrap}
.tab-item.active{color:#2568FB;border-bottom-color:#FECD45}
.tab-item:hover:not(.active){color:#94a3b8}
.empty{color:#3d4f63;font-size:12px;text-align:center;padding:36px}
.flow-steps{display:flex;overflow-x:auto;margin-bottom:24px;gap:0}
.flow-step{display:flex;align-items:center;gap:6px;padding:7px 14px;background:rgba(12,28,80,0.55);border:1px solid rgba(148,163,184,0.08);font-size:11px;color:#475569;white-space:nowrap}
.flow-step:first-child{border-radius:8px 0 0 8px}.flow-step:last-child{border-radius:0 8px 8px 0}
.flow-step.active{background:rgba(37,104,251,0.1);border-color:rgba(254,205,69,0.4);color:#FECD45}
.flow-step.done{background:rgba(34,211,160,0.08);border-color:rgba(34,211,160,0.2);color:#22d3a0}
.flow-arrow{color:#334155;font-size:13px;padding:0 2px;align-self:center;flex-shrink:0}
.rfq-price-table{border-collapse:collapse;width:100%}
.rfq-price-table th{background:rgba(12,28,65,0.8);padding:7px 10px;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#475569;border:1px solid rgba(148,163,184,0.08);text-align:center}
.rfq-price-table td{border:1px solid rgba(148,163,184,0.06);padding:5px 8px;text-align:center}
.rfq-price-input{background:rgba(8,22,60,0.8);border:1px solid rgba(37,104,251,0.1);border-radius:5px;padding:5px 7px;color:#e2e8f0;font-family:'DM Mono',monospace;font-size:11px;width:80px;outline:none;text-align:center}
.rfq-price-input:focus{border-color:rgba(37,104,251,0.35)}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.mob-menu-btn{display:none;position:fixed;top:14px;left:14px;z-index:300;background:rgba(4,10,32,1);border:1px solid rgba(37,104,251,0.25);border-radius:9px;padding:9px;cursor:pointer;color:#2568FB}
.mob-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:150}
.mob-overlay.open{display:block}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:140;background:rgba(4,10,32,1);border-top:1px solid rgba(148,163,184,0.1);padding:6px 4px}
.bnav-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 8px;border-radius:8px;cursor:pointer;color:#475569;font-size:8px;letter-spacing:.5px;text-transform:uppercase;flex:1;position:relative}
.bnav-item.active{color:#2568FB}
.bnav-dot{position:absolute;top:3px;right:6px;width:6px;height:6px;background:#f56565;border-radius:50%;border:1px solid #0a1628}
@media(max-width:768px){
.mob-menu-btn{display:flex}.sidebar{position:fixed;top:0;left:0;bottom:0;z-index:160;transform:translateX(-100%);width:240px;min-width:240px;box-shadow:4px 0 24px rgba(0,0,0,0.5)}
.sidebar.open{transform:translateX(0)}.layout{flex-direction:column}.main{width:100%}
.page{padding:64px 14px 90px}.sgrid{grid-template-columns:repeat(2,1fr)}.fgrid{grid-template-columns:1fr}
.card{padding:14px}.tw{margin:0 -14px;padding:0 14px}table{min-width:580px}
.moverlay{align-items:flex-end}.modal{width:100%;max-width:100%;border-radius:18px 18px 0 0;max-height:92vh;padding:20px 16px 32px}
.bottom-nav{display:flex;justify-content:space-around}}`;
    document.head.appendChild(el);
  }, []);
}

// ─── Flow Banner ──────────────────────────────────────────────────────────────
const FLOW_STEPS = [
  { id:"s1", label:"① Engineering" },
  { id:"s2", label:"② Admin Qty" },
  { id:"s3", label:"③ Fwd Purchasing" },
  { id:"s4a", label:"④ Triage" },
  { id:"s4b", label:"④ RFQ" },
  { id:"s4c", label:"④ Ordering" },
  { id:"s5", label:"⑤ Supplier" },
  { id:"s6", label:"⑥ Confirmation" },
  { id:"s7", label:"⑦ Arrived" },
];
function FlowBanner({ active, role }) {
  if (role==="supplier"||role==="logistics") return null;
  return (
    <div className="flow-steps">
      {FLOW_STEPS.map((s,i) => (
        <div key={s.id} style={{display:"flex",alignItems:"center"}}>
          <div className={`flow-step${active===s.id?" active":""}`}>{s.label}</div>
          {i<FLOW_STEPS.length-1&&<div className="flow-arrow">›</div>}
        </div>
      ))}
    </div>
  );
}

// ─── DB helpers ───────────────────────────────────────────────────────────────
const fromDB = {
  po: r=>({ id:r.id, poNo:r.po_no, assemblyPartNo:r.assembly_part_no, drawingNo:r.drawing_no, items:r.items||[], createdBy:r.created_by, createdAt:r.created_at, poQty:r.po_qty||1, status:r.status||"pending" }),
  pitem: r=>({ id:r.id, poNo:r.po_no, purchasingNo:r.purchasing_no, supplier:r.supplier, price:r.price, partNumber:r.part_number, drawingNumber:r.drawing_number, description:r.description, material:r.material, customerRDD:r.customer_rdd, ptd:r.ptd, neededQty:r.needed_qty||1, itemType:r.item_type||"", fromRfq:r.from_rfq||false, consolidatedInto:r.consolidated_into||null, noPurchase:r.no_purchase||false, supplierConfirmation:r.supplier_confirmation||"", supplierConfirmationLocked:r.supplier_confirmation_locked||false, supplierRemarks:r.supplier_remarks||"", purchasingRemarks:r.purchasing_remarks||"", status:r.status||"pending", deliveredDate:r.delivered_date||"", invoiceAttachment:r.invoice_attachment||null, awbAttachment:r.awb_attachment||null, createdAt:r.created_at }),
  citem: r=>({ id:r.id, consolidatedPurNo:r.consolidated_pur_no, drawingNumber:r.drawing_number, supplier:r.supplier, totalQty:r.total_qty||0, sourceItems:r.source_items||[], type:r.type||"Stock", status:r.status||"pending", supplierConfirmation:r.supplier_confirmation||"", createdAt:r.created_at }),
  notif: r=>({ id:r.id, to:r.to_role, msg:r.msg, read:r.read||false, date:r.date }),
  user: r=>({ id:r.id, username:r.username, password:r.password, role:r.role, name:r.name, supplier:r.supplier||null }),
  quotRow: r=>({ id:r.id, poId:r.po_id, poNo:r.po_no, bomItemId:r.bom_item_id, drawingNumber:r.drawing_number, partNumber:r.part_number, description:r.description, material:r.material, qtyPc:r.qty_pc||1, neededQty:r.needed_qty||1, itemType:r.item_type||"", isNewPart:r.is_new_part!==false, orderMode:r.order_mode||"pending", rfqId:r.rfq_id||null, fromRfq:r.from_rfq||false, triaged:r.triaged||false, createdAt:r.created_at }),
  rfqHeader: r=>({ id:r.id, poId:r.po_id, poNo:r.po_no, rfqNo:r.rfq_no, invitedSuppliers:r.invited_suppliers||[], status:r.status||"open", createdBy:r.created_by, createdAt:r.created_at }),
  rfqItem: r=>({ id:r.id, rfqId:r.rfq_id, bomItemId:r.bom_item_id||r.quotation_row_id, drawingNumber:r.drawing_number, partNumber:r.part_number, description:r.description, material:r.material, neededQty:r.needed_qty||1 }),
  rfqResponse: r=>({ id:r.id, rfqId:r.rfq_id, rfqItemId:r.rfq_item_id, supplier:r.supplier, priceBreaks:r.price_breaks||{}, etd:r.etd||"", remarks:r.remarks||"", status:r.status||"pending", submittedAt:r.submitted_at||"" }),
  rfqAward: r=>({ id:r.id, rfqId:r.rfq_id, rfqItemId:r.rfq_item_id, bomItemId:r.bom_item_id||r.quotation_row_id, winnerSupplier:r.winner_supplier, winnerResponseId:r.winner_response_id, awardedQty:r.awarded_qty, awardedPrice:r.awarded_price, awardedAt:r.awarded_at }),
  confReq: r=>({ id:r.id, itemId:r.item_id, purchasingNo:r.purchasing_no, supplier:r.supplier, requestedDate:r.requested_date, reason:r.reason, status:r.status||"pending", type:r.type||"supplier_change", createdAt:r.created_at }),
  approval: r=>({ id:r.id, itemId:r.item_id, purchasingNo:r.purchasing_no, supplier:r.supplier, newDate:r.new_date, reason:r.reason, status:r.status }),
  seqRow: r=>({ supplier:r.supplier, seq:r.seq }),
};

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  useGlobalStyles();
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [pos, setPOs] = useState([]);
  const [purchasingItems, setPurchasingItems] = useState([]);
  const [consolidatedItems, setConsolidatedItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [partHistory, setPartHistory] = useState({});
  const [users, setUsers] = useState([]);
  const [quotRows, setQuotRows] = useState([]);
  const [rfqHeaders, setRfqHeaders] = useState([]);
  const [rfqItems, setRfqItems] = useState([]);
  const [rfqResponses, setRfqResponses] = useState([]);
  const [rfqAwards, setRfqAwards] = useState([]);
  const [confRequests, setConfRequests] = useState([]);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [seqMap, setSeqMap] = useState({});
  const [loginForm, setLoginForm] = useState({ username:"", password:"" });
  const [loginErr, setLoginErr] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);
  const [dbError, setDbError] = useState(null);

  const safeFetch = async (query) => {
    try { const r = await query; return r.error ? [] : (r.data||[]); }
    catch(e) { return []; }
  };

  const loadAll = useCallback(async () => {
    try {
      // Core tables that must exist
      const posR = await sb.from("purchase_orders").select("*").order("created_at",{ascending:false});
      if (posR.error) throw posR.error;
      const usersR = await sb.from("users").select("*");
      if (usersR.error) throw usersR.error;

      setPOs((posR.data||[]).map(fromDB.po));
      setUsers((usersR.data||[]).map(fromDB.user));

      // Optional tables — gracefully skip if missing
      const [pitemsD,citemsD,notifsD,histD,seqD,quotD,rfqHD,rfqID,rfqRD,rfqAD,confD,appD] = await Promise.all([
        safeFetch(sb.from("purchasing_items").select("*").order("created_at",{ascending:false})),
        safeFetch(sb.from("consolidated_items").select("*").order("created_at",{ascending:false})),
        safeFetch(sb.from("notifications").select("*").order("date",{ascending:false})),
        safeFetch(sb.from("part_history").select("*")),
        safeFetch(sb.from("seq_map").select("*")),
        safeFetch(sb.from("quotation_rows").select("*").order("created_at",{ascending:false})),
        safeFetch(sb.from("rfq_headers").select("*").order("created_at",{ascending:false})),
        safeFetch(sb.from("rfq_items").select("*")),
        safeFetch(sb.from("rfq_responses").select("*")),
        safeFetch(sb.from("rfq_awards").select("*")),
        safeFetch(sb.from("confirmation_requests").select("*").order("created_at",{ascending:false})),
        safeFetch(sb.from("approval_requests").select("*")),
      ]);

      setPurchasingItems(pitemsD.map(fromDB.pitem));
      setConsolidatedItems(citemsD.map(fromDB.citem));
      setNotifications(notifsD.map(fromDB.notif));
      const hist={};histD.forEach(r=>{hist[r.drawing_number]={partNumber:r.part_number,material:r.material,attachment:r.attachment};});
      setPartHistory(hist);
      const seq={};seqD.forEach(r=>{seq[r.supplier]=r.seq;});setSeqMap(seq);
      setQuotRows(quotD.map(fromDB.quotRow));
      setRfqHeaders(rfqHD.map(fromDB.rfqHeader));
      setRfqItems(rfqID.map(fromDB.rfqItem));
      setRfqResponses(rfqRD.map(fromDB.rfqResponse));
      setRfqAwards(rfqAD.map(fromDB.rfqAward));
      setConfRequests(confD.map(fromDB.confReq));
      setApprovalRequests(appD.map(fromDB.approval));
      setInitialLoad(false);
    } catch(e) { console.error('loadAll error:', e); setDbError(String(e?.message||e)); setInitialLoad(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => {
    const tables = ["purchase_orders","purchasing_items","consolidated_items","notifications","rfq_headers","rfq_items","rfq_responses","rfq_awards","confirmation_requests","approval_requests"];
    const channels = tables.map(t => sb.channel(`${t}-ch`).on("postgres_changes",{event:"*",schema:"public",table:t},loadAll).subscribe());
    return () => channels.forEach(c => sb.removeChannel(c));
  }, [loadAll]);

  const nextSeq = async (supplier) => {
    const cur = seqMap[supplier]||0; const newSeq = cur+1;
    await sb.from("seq_map").upsert({ supplier, seq:newSeq });
    setSeqMap(m=>({...m,[supplier]:newSeq}));
    return newSeq;
  };
  const addNotif = async (to, msg) => { await sb.from("notifications").insert({ id:genId(), to_role:to, msg, read:false, date:today() }); };
  const login = async () => {
    const u = users.find(u=>u.username===loginForm.username&&u.password===loginForm.password);
    if (u) { setCurrentUser(u); setLoginErr(""); setPage("dashboard"); } else setLoginErr("Invalid credentials.");
  };
  const logout = () => { setCurrentUser(null); setPage("dashboard"); setLoginForm({username:"",password:""}); };
  const markNotifRead = async id => { await sb.from("notifications").update({read:true}).eq("id",id); setNotifications(n=>n.map(x=>x.id===id?{...x,read:true}:x)); };
  const markAllRead = async ids => { await sb.from("notifications").update({read:true}).in("id",ids); setNotifications(n=>n.map(x=>ids.includes(x.id)?{...x,read:true}:x)); };

  if (initialLoad) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#071030",flexDirection:"column",gap:16}}>
      <div style={{fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,background:"linear-gradient(135deg,#2568FB,#FECD45)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>ProcurementFlow</div>
      <div style={{fontSize:11,color:"#334155",letterSpacing:"2px",textTransform:"uppercase"}}>Connecting…</div>
    </div>
  );
  if (dbError) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#071030",color:"#f56565",fontFamily:"monospace",flexDirection:"column",gap:16}}>
      <div style={{fontSize:18,fontWeight:700}}>⚠ Database Error</div>
      <div style={{fontSize:13,color:"#64748b",maxWidth:500,textAlign:"center"}}>{dbError}</div>
      <button onClick={()=>{setInitialLoad(true);loadAll();}} style={{padding:"8px 20px",background:"rgba(37,104,251,0.15)",border:"1px solid rgba(37,104,251,0.3)",borderRadius:8,color:"#2568FB",cursor:"pointer",fontFamily:"monospace"}}>Retry</button>
    </div>
  );
  if (!currentUser) return <LoginScreen form={loginForm} setForm={setLoginForm} onLogin={login} err={loginErr}/>;

  const myNotifs = notifications.filter(n=>n.to===currentUser.role||n.to===currentUser.id||(currentUser.role==="supplier"&&n.to===currentUser.supplier));
  const unread = myNotifs.filter(n=>!n.read).length;
  const pages = getPages(currentUser.role);
  const shared = { pos, setPOs, purchasingItems, setPurchasingItems, consolidatedItems, setConsolidatedItems, partHistory, setPartHistory, approvalRequests, setApprovalRequests, confRequests, setConfRequests, addNotif, seqMap, nextSeq, loadAll, quotRows, setQuotRows, rfqHeaders, rfqItems, rfqResponses, rfqAwards, users };

  return (
    <div className="app">
      <div className="layout">
        <Sidebar pages={pages} page={page} setPage={setPage} user={currentUser} onLogout={logout} unread={unread}/>
        <div className="main">
          {page==="dashboard"    && <Dashboard user={currentUser} pos={pos} purchasingItems={purchasingItems} notifications={myNotifs} markNotifRead={markNotifRead} markAllRead={markAllRead}/>}
          {page==="create-po"    && <CreatePO user={currentUser} {...shared}/>}
          {page==="view-pos"     && <ViewPOs user={currentUser} {...shared}/>}
          {page==="triage"       && <TriageView user={currentUser} {...shared}/>}
          {page==="rfq-sheet"    && <RFQSheet user={currentUser} {...shared}/>}
          {page==="ordering"     && <OrderingView user={currentUser} {...shared}/>}
          {page==="confirmation" && <ConfirmationView user={currentUser} {...shared}/>}
          {page==="logistics"    && <LogisticsView user={currentUser} {...shared}/>}
          {page==="sup-dashboard"&& <SupDashboard user={currentUser} {...shared}/>}
          {page==="sup-rfq"      && <SupRFQSheet user={currentUser} pos={pos} {...shared}/>}
          {page==="sup-orders"   && <SupOrderSheet user={currentUser} {...shared}/>}
          {page==="notifications"&& <NotificationsPage notifs={myNotifs} markNotifRead={markNotifRead} markAllRead={markAllRead}/>}
          {page==="admin-users"  && <AdminUsers users={users} loadAll={loadAll}/>}
          {page==="admin-pos"    && <AdminPOs {...shared}/>}
        </div>
      </div>
    </div>
  );
}

function getPages(role) {
  const base = [{ id:"dashboard", label:"Dashboard", icon:"home" }, { id:"notifications", label:"Notifications", icon:"bell" }];
  if (role==="engineering"||role==="admin") base.push({ id:"create-po", label:"Create PO", icon:"plus" }, { id:"view-pos", label:"My POs", icon:"po" });
  if (role==="purchasing"||role==="admin") base.push({ id:"triage", label:"④ BOM Triage", icon:"triage" }, { id:"rfq-sheet", label:"④ RFQ Sheet", icon:"rfq" }, { id:"ordering", label:"④ Ordering", icon:"cart" }, { id:"confirmation", label:"⑥ Confirmation", icon:"check" });
  if (role==="logistics"||role==="admin") base.push({ id:"logistics", label:"⑦ Logistics", icon:"truck" });
  if (role==="supplier") base.push({ id:"sup-dashboard", label:"Dashboard", icon:"home" }, { id:"sup-rfq", label:"RFQ Sheet", icon:"rfq" }, { id:"sup-orders", label:"My Orders", icon:"pkg" });
  if (role==="admin") base.push({ id:"admin-pos", label:"All POs", icon:"file" }, { id:"admin-users", label:"Users", icon:"users" });
  return base;
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ form, setForm, onLogin, err }) {
  const demos = [
    {label:"Admin",u:"admin",p:"admin123",color:"#a78bfa"},
    {label:"Engineering",u:"engineering",p:"eng123",color:"#2568FB"},
    {label:"Purchasing",u:"purchasing",p:"pur123",color:"#22d3a0"},
    {label:"Logistics",u:"logistics",p:"log123",color:"#2dd4bf"},
    {label:"Compomax",u:"compomax",p:"compomax123",color:"#FECD45"},
    {label:"Shinhua",u:"shinhua",p:"shinhua123",color:"#FECD45"},
  ];
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#071030,#102060)",padding:"20px"}}>
      <div style={{width:"100%",maxWidth:420,background:"rgba(8,20,60,0.95)",border:"1px solid rgba(37,104,251,0.15)",borderRadius:16,padding:"36px 32px"}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,background:"linear-gradient(135deg,#2568FB,#FECD45)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:6}}>ProcurementFlow</div>
        <div style={{fontSize:11,color:"#334155",marginBottom:30,letterSpacing:"1px"}}>PROCUREMENT MANAGEMENT SYSTEM</div>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:10,letterSpacing:"2px",textTransform:"uppercase",color:"#475569",marginBottom:7}}>Username</label>
          <input style={{width:"100%",background:"rgba(6,18,50,0.9)",border:"1px solid rgba(37,104,251,0.2)",borderRadius:8,padding:"11px 14px",color:"#e2e8f0",fontFamily:"'DM Mono',monospace",fontSize:13,outline:"none"}} value={form.username} onChange={e=>setForm({...form,username:e.target.value})} onKeyDown={e=>e.key==="Enter"&&onLogin()} placeholder="Username"/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:10,letterSpacing:"2px",textTransform:"uppercase",color:"#475569",marginBottom:7}}>Password</label>
          <input style={{width:"100%",background:"rgba(6,18,50,0.9)",border:"1px solid rgba(37,104,251,0.2)",borderRadius:8,padding:"11px 14px",color:"#e2e8f0",fontFamily:"'DM Mono',monospace",fontSize:13,outline:"none"}} type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&onLogin()} placeholder="Password"/>
        </div>
        <button style={{width:"100%",padding:"13px",background:"linear-gradient(135deg,#2568FB,#1a4fd4)",border:"none",borderRadius:9,color:"#fff",fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,cursor:"pointer"}} onClick={onLogin}>Sign In →</button>
        {err&&<div style={{marginTop:12,padding:"9px 13px",background:"rgba(245,101,101,0.08)",border:"1px solid rgba(245,101,101,0.2)",borderRadius:7,color:"#f56565",fontSize:12}}>{err}</div>}
        <div style={{marginTop:24,paddingTop:18,borderTop:"1px solid rgba(37,104,251,0.07)"}}>
          <div style={{fontSize:9.5,letterSpacing:"2px",textTransform:"uppercase",color:"#334155",marginBottom:10}}>Quick Demo</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {demos.map(d=><button key={d.u} style={{padding:"4px 11px",borderRadius:6,fontSize:10.5,fontFamily:"'DM Mono',monospace",cursor:"pointer",border:`1px solid ${form.username===d.u?d.color+"55":"rgba(37,104,251,0.1)"}`,background:form.username===d.u?d.color+"14":"rgba(7,16,45,0.6)",color:form.username===d.u?d.color:"#475569"}} onClick={()=>setForm({username:d.u,password:d.p})}>{d.label}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ pages, page, setPage, user, onLogout, unread }) {
  const [open, setOpen] = useState(false);
  const initials = user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const nav = id => { setPage(id); setOpen(false); };
  return (
    <>
      <button className="mob-menu-btn" onClick={()=>setOpen(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <div className={`mob-overlay${open?" open":""}`} onClick={()=>setOpen(false)}/>
      <div className={`sidebar${open?" open":""}`}>
        <div className="slogo">ProcurementFlow</div>
        <div className="ssec">Navigation</div>
        {pages.map(p=>(
          <div key={p.id} className={`nitem${page===p.id?" active":""}`} onClick={()=>nav(p.id)}>
            <Icon name={p.icon} size={14}/><span style={{flex:1}}>{p.label}</span>
            {p.id==="notifications"&&unread>0&&<span className="ndot"/>}
          </div>
        ))}
        <div className="sfooter">
          <div className="uchip">
            <div className="uavatar" style={{background:ROLE_BG[user.role],color:ROLE_COLOR[user.role]}}>{initials}</div>
            <div style={{flex:1,minWidth:0}}><div className="uname">{user.name}</div><div className="urole">{user.role}{user.supplier?` · ${user.supplier}`:""}</div></div>
            <button className="lbtn" onClick={onLogout}><Icon name="logout" size={15}/></button>
          </div>
        </div>
      </div>
      <nav className="bottom-nav">
        {pages.slice(0,5).map(p=>(
          <div key={p.id} className={`bnav-item${page===p.id?" active":""}`} onClick={()=>setPage(p.id)}>
            {p.id==="notifications"&&unread>0&&<span className="bnav-dot"/>}
            <Icon name={p.icon} size={19}/><span>{p.label.split(" ")[0]}</span>
          </div>
        ))}
      </nav>
    </>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ user, pos, purchasingItems, notifications, markNotifRead, markAllRead }) {
  const unread = notifications.filter(n=>!n.read);
  const arrived = purchasingItems.filter(i=>i.status==="arrived").length;
  const pending = purchasingItems.filter(i=>i.status==="pending").length;
  return (
    <div className="page">
      <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800,marginBottom:22}}>Dashboard <span style={{color:"#3d4f63",fontWeight:400,fontSize:14}}>/ {user.name}</span></div>
      <FlowBanner active={null} role={user?.role||""}/>
      <div className="sgrid">
        <div className="scard"><div className="sval" style={{color:"#2568FB"}}>{pos.length}</div><div className="slbl">Total POs</div></div>
        <div className="scard"><div className="sval" style={{color:"#22d3a0"}}>{purchasingItems.length}</div><div className="slbl">Purchasing Items</div></div>
        <div className="scard"><div className="sval" style={{color:"#2dd4bf"}}>{arrived}</div><div className="slbl">Arrived</div></div>
        <div className="scard"><div className="sval" style={{color:"#f56565"}}>{unread.length}</div><div className="slbl">Unread Alerts</div></div>
        <div className="scard"><div className="sval" style={{color:"#FECD45"}}>{pending}</div><div className="slbl">Pending Orders</div></div>
      </div>
      {unread.length>0&&(
        <div className="card">
          <div className="ctitle"><Icon name="bell"/>Notifications <span className="sub">{unread.length} unread</span></div>
          {unread.slice(0,5).map(n=>(
            <div key={n.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:"1px solid rgba(148,163,184,0.05)"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"#f56565",marginTop:4,flexShrink:0}}/>
              <div style={{flex:1}}><div style={{fontSize:12.5}}>{n.msg}</div><div style={{fontSize:10,color:"#475569",marginTop:2}}>{n.date}</div></div>
              <button className="btn b-gray btn-xs" onClick={()=>markNotifRead(n.id)}>Dismiss</button>
            </div>
          ))}
        </div>
      )}
      <div className="card">
        <div className="ctitle">7-Step Procurement Flow</div>
        <div style={{display:"grid",gap:8}}>
          {[
            ["①","Engineering","Creates PO with assembly details and BOM items","#2568FB"],
            ["②","Admin","Sets PO quantity — required before purchasing proceeds","#a78bfa"],
            ["③","Forward to Purchasing","Full BOM becomes visible to purchasing team","#64748b"],
            ["④a","BOM Triage","Purchasing sets Item Type (Assy/Stock/Reuse/Machining) and New/Repeat per line","#22d3a0"],
            ["④b","RFQ (New items only)","Purchasing invites suppliers; suppliers fill fixed price table (1–20+pcs) + ETD; winner selected","#FECD45"],
            ["④c","Ordering","Individual or Consolidated (by D/N across POs); saves assign Purchasing Item #","#fb923c"],
            ["⑤","Supplier","Confirms delivery date, updates remarks, attaches invoice/AWB on actual delivery","#FECD45"],
            ["⑥","Confirmation Review","Purchasing/Admin: Approve / Deny (cancel item) / Request new date (negotiation loop)","#22d3a0"],
            ["⑦","Arrived","Logistics/Admin/Purchasing marks item arrived; BOM updated","#2dd4bf"],
          ].map(([num,title,desc,color])=>(
            <div key={num} style={{display:"flex",gap:12,padding:"10px 14px",background:"rgba(12,28,80,0.5)",borderRadius:8,alignItems:"flex-start"}}>
              <div style={{minWidth:28,height:28,borderRadius:"50%",background:`${color}1a`,border:`1px solid ${color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color,fontWeight:700,flexShrink:0}}>{num}</div>
              <div><div style={{fontSize:12,fontWeight:600,color:"#cbd5e1"}}>{title}</div><div style={{fontSize:11,color:"#475569",marginTop:2}}>{desc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Create PO ────────────────────────────────────────────────────────
function CreatePO({ user, partHistory, addNotif, loadAll }) {
  const [poNo, setPoNo] = useState("");
  const [asmPart, setAsmPart] = useState("");
  const [drawNo, setDrawNo] = useState("");
  const [items, setItems] = useState([]);
  const [saved, setSaved] = useState(false);
  const newItem = () => ({ id:genId(), drawingNumber:"", partNumber:"", description:"", material:"", qtyPc:1, attachment:null });
  const addItem = () => setItems(p=>[...p,newItem()]);
  const removeItem = id => setItems(p=>p.filter(i=>i.id!==id));
  const updateItem = (id, field, val) => setItems(p=>p.map(it=>{
    if (it.id!==id) return it;
    const u={...it,[field]:val};
    if (field==="drawingNumber"&&partHistory[val]) { u.partNumber=partHistory[val].partNumber||u.partNumber; u.material=partHistory[val].material||u.material; }
    return u;
  }));
  const submit = async () => {
    if (!poNo.trim()) return alert("PO # required");
    if (!items.length) return alert("Add at least one BOM item");
    const { error } = await sb.from("purchase_orders").insert({ id:genId(), po_no:poNo, assembly_part_no:asmPart, drawing_no:drawNo, items, created_by:user.id, created_at:today(), po_qty:1, status:"pending" });
    if (error) return alert("Error: "+error.message);
    await addNotif("admin", `New PO #${poNo} created — please set PO Qty.`);
    await addNotif("purchasing", `New PO #${poNo} submitted — awaiting Admin to set PO Qty.`);
    setSaved(true); setPoNo(""); setAsmPart(""); setDrawNo(""); setItems([]);
    setTimeout(()=>setSaved(false),3500); loadAll();
  };
  return (
    <div className="page">
      <FlowBanner active="s1" role={user?.role||""}/>
      <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800,marginBottom:6}}>Create Purchase Order</div>
      <div style={{color:"#475569",fontSize:12,marginBottom:22}}>Step ① — Engineering encodes PO header and BOM items.</div>
      {saved&&<div style={{padding:"10px 14px",background:"rgba(34,211,160,0.08)",border:"1px solid rgba(34,211,160,0.2)",borderRadius:8,marginBottom:18,color:"#22d3a0",fontSize:12}}>✓ PO submitted. Admin has been notified to set PO Qty.</div>}
      <div className="card">
        <div className="ctitle"><Icon name="po"/>PO Header</div>
        <div className="fgrid">
          <div className="fgroup"><label className="flabel">PO #</label><input className="fi" value={poNo} onChange={e=>setPoNo(e.target.value)} placeholder="e.g. PO-2024-001"/></div>
          <div className="fgroup"><label className="flabel">Assembly Part Number</label><input className="fi" value={asmPart} onChange={e=>setAsmPart(e.target.value)}/></div>
          <div className="fgroup"><label className="flabel">Drawing Number</label><input className="fi" value={drawNo} onChange={e=>setDrawNo(e.target.value)}/></div>
        </div>
      </div>
      <div className="card">
        <div className="ctitle" style={{justifyContent:"space-between"}}>
          <span><Icon name="file"/>BOM Items <span className="sub">{items.length} item{items.length!==1?"s":""}</span></span>
          <button className="btn b-blue btn-sm" onClick={addItem}><Icon name="plus" size={13}/>Add Item</button>
        </div>
        {!items.length&&<div className="empty">No items yet — click "Add Item".</div>}
        {items.length>0&&(
          <div className="tw"><table>
            <thead><tr><th>#</th><th>Drawing No.</th><th>Part Number</th><th>Description</th><th>Material</th><th>Qty/PC</th><th></th></tr></thead>
            <tbody>{items.map((it,idx)=>(
              <tr key={it.id}>
                <td style={{color:"#3d4f63",fontSize:11,textAlign:"center"}}>{idx+1}</td>
                <td><input className="fi" style={{padding:"5px 8px",fontSize:12}} value={it.drawingNumber} onChange={e=>updateItem(it.id,"drawingNumber",e.target.value)} placeholder="DWG-001"/>
                  {it.drawingNumber&&partHistory[it.drawingNumber]&&<div style={{fontSize:9,color:"#22d3a0",marginTop:2}}>✓ auto-filled</div>}
                </td>
                <td><input className="fi" style={{padding:"5px 8px",fontSize:12}} value={it.partNumber} onChange={e=>updateItem(it.id,"partNumber",e.target.value)}/></td>
                <td><input className="fi" style={{padding:"5px 8px",fontSize:12}} value={it.description} onChange={e=>updateItem(it.id,"description",e.target.value)}/></td>
                <td><input className="fi" style={{padding:"5px 8px",fontSize:12}} value={it.material} onChange={e=>updateItem(it.id,"material",e.target.value)}/></td>
                <td><input className="fi" style={{padding:"5px 8px",fontSize:12,width:68}} type="number" min="1" value={it.qtyPc} onChange={e=>updateItem(it.id,"qtyPc",Number(e.target.value))}/></td>
                <td><button className="btn b-red btn-xs" onClick={()=>removeItem(it.id)}><Icon name="trash" size={12}/></button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
      {items.length>0&&<div style={{display:"flex",justifyContent:"flex-end"}}><button className="btn b-green" onClick={submit}><Icon name="check"/>Submit PO</button></div>}
    </div>
  );
}

// ─── View POs ─────────────────────────────────────────────────────────────────
function ViewPOs({ user, pos, purchasingItems }) {
  const myPos = user.role==="admin"?pos:pos.filter(p=>p.createdBy===user.id);
  const [sel, setSel] = useState(null);
  const selPo = sel?pos.find(p=>p.id===sel):null;
  return (
    <div className="page">
      <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800,marginBottom:22}}>My Purchase Orders</div>
      <div className="card">
        {!myPos.length?<div className="empty">No POs yet.</div>:(
          <div className="tw"><table>
            <thead><tr><th>PO #</th><th>Assembly Part #</th><th>Items</th><th>PO Qty</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>{myPos.map(po=>(
              <tr key={po.id}>
                <td style={{color:"#2568FB",fontWeight:600}}>{po.poNo}</td>
                <td>{po.assemblyPartNo||"—"}</td>
                <td>{po.items.length}</td>
                <td>{po.poQty>1?<span style={{color:"#22d3a0",fontWeight:700}}>{po.poQty}</span>:<span className="badge byellow" style={{fontSize:8}}>Pending Admin</span>}</td>
                <td><span className={`badge ${po.status==="pending"?"byellow":"bblue"}`}>{po.status}</span></td>
                <td style={{color:"#475569"}}>{po.createdAt}</td>
                <td><button className="btn b-blue btn-xs" onClick={()=>setSel(po.id)}>BOM</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
      {selPo&&<BOMModal po={selPo} onClose={()=>setSel(null)}/>}
    </div>
  );
}

function BOMModal({ po, onClose }) {
  const poQty = po.poQty||1;
  return (
    <div className="moverlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:900}}>
        <button className="mclose" onClick={onClose}><Icon name="x"/></button>
        <div className="mtitle">BOM — {po.poNo}</div>
        <div style={{display:"flex",gap:20,marginBottom:16,fontSize:12,color:"#64748b",flexWrap:"wrap"}}>
          <span>Assembly: <b style={{color:"#e2e8f0"}}>{po.assemblyPartNo||"—"}</b></span>
          <span>PO Qty: <b style={{color:"#2568FB"}}>{poQty}</b></span>
        </div>
        <div className="tw"><table>
          <thead><tr><th>#</th><th>Drawing #</th><th>Part #</th><th>Description</th><th>Material</th><th>Qty/PC</th><th>Needed Qty</th></tr></thead>
          <tbody>{po.items.map((it,i)=>(
            <tr key={it.id||i}>
              <td style={{color:"#3d4f63"}}>{i+1}</td>
              <td>{it.drawingNumber||"—"}</td><td>{it.partNumber||"—"}</td>
              <td>{it.description||"—"}</td><td>{it.material||"—"}</td>
              <td>{it.qtyPc}</td>
              <td style={{color:"#22d3a0",fontWeight:600}}>{(it.qtyPc||1)*poQty}</td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
    </div>
  );
}

// ─── Step 4.1: BOM Triage ─────────────────────────────────────────────────────
// Saves triage data directly into purchase_orders.items JSON — no extra table needed
function TriageView({ user, pos, loadAll }) {
  const [selPoId, setSelPoId] = useState("");
  const [localItems, setLocalItems] = useState([]);
  const [saving, setSaving] = useState({});

  const selPo = pos.find(p=>p.id===selPoId)||null;
  const poQty = selPo?.poQty||1;
  const items = localItems.map(it=>({...it, neededQty:(it.qtyPc||1)*poQty}));
  const untriaged = items.filter(it=>!it.triaged);
  const triaged   = items.filter(it=>it.triaged);

  const handleSelect = (poId) => {
    if (poId===selPoId) { setSelPoId(""); setLocalItems([]); return; }
    setSelPoId(poId);
    const po = pos.find(p=>p.id===poId);
    setLocalItems((po?.items||[]).map(it=>({
      ...it,
      itemType:  it.itemType||"",
      isNewPart: it.isNewPart!==false,
      triaged:   it.triaged||false,
    })));
  };

  const persist = async (updatedItems) => {
    const { error } = await sb.from("purchase_orders")
      .update({ items: updatedItems })
      .eq("id", selPoId);
    if (error) alert("Save error: "+error.message);
    else loadAll();
  };

  const markReady = async (itemId, itemType, isNewPart) => {
    setSaving(s=>({...s,[itemId]:true}));
    const updated = localItems.map(it=>it.id===itemId?{...it,itemType,isNewPart,triaged:true}:it);
    setLocalItems(updated);
    await persist(updated);
    setSaving(s=>({...s,[itemId]:false}));
  };

  const undoTriage = async (itemId) => {
    const updated = localItems.map(it=>it.id===itemId?{...it,triaged:false}:it);
    setLocalItems(updated);
    await persist(updated);
  };

  const setField = (itemId, fields) =>
    setLocalItems(prev=>prev.map(it=>it.id===itemId?{...it,...fields}:it));

  return (
    <div className="page">
      <FlowBanner active="s4a" role={user?.role||""}/>
      <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800,marginBottom:6}}>BOM Triage</div>
      <div style={{color:"#475569",fontSize:12,marginBottom:22}}>Step ④a — Set Item Type and New/Repeat for each BOM line.</div>

      <div className="card">
        <div className="ctitle"><Icon name="po"/>Select PO</div>
        {!pos.length
          ? <div style={{color:"#FECD45",fontSize:12}}>No POs yet.</div>
          : <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {pos.map(po=>(
                <button key={po.id}
                  className={`btn ${selPoId===po.id?"b-blue":"b-gray"}`}
                  style={{fontSize:11}}
                  onClick={()=>handleSelect(po.id)}>
                  {po.poNo}
                  <span style={{opacity:.6,fontSize:10,marginLeft:4}}>qty:{po.poQty||1}</span>
                  {selPoId===po.id&&<span style={{marginLeft:4}}>✓</span>}
                </button>
              ))}
            </div>
        }
      </div>

      {selPo && (
        <div className="card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:18}}>
            <div>
              <div style={{fontFamily:"Syne",fontSize:15,fontWeight:700,color:"#2568FB"}}>{selPo.poNo}</div>
              <div style={{fontSize:11,color:"#475569",marginTop:2}}>
                Assembly: {selPo.assemblyPartNo||"—"} · PO Qty: <b style={{color:"#22d3a0"}}>{poQty}</b>
                {" · "}<span style={{color:triaged.length===items.length&&items.length>0?"#22d3a0":"#FECD45"}}>{triaged.length}/{items.length} triaged</span>
              </div>
            </div>
          </div>

          {!items.length && (
            <div style={{color:"#64748b",fontSize:12,padding:"12px 0"}}>
              This PO has no BOM items. Go back and add items when creating the PO.
            </div>
          )}

          {untriaged.length>0 && (
            <>
              <div style={{fontSize:10,letterSpacing:"2px",textTransform:"uppercase",color:"#475569",marginBottom:12}}>
                Pending — {untriaged.length} item{untriaged.length!==1?"s":""}
              </div>
              {untriaged.map(it=>(
                <TriageRow
                  key={it.id}
                  row={it}
                  idx={items.indexOf(it)+1}
                  isSaving={!!saving[it.id]}
                  onTypeChange={v=>setField(it.id,{itemType:v})}
                  onNewChange={v=>setField(it.id,{isNewPart:v})}
                  onMarkReady={(type,isNew)=>markReady(it.id,type,isNew)}
                />
              ))}
            </>
          )}

          {triaged.length>0 && (
            <>
              <div style={{fontSize:10,letterSpacing:"2px",textTransform:"uppercase",color:"#22d3a0",marginBottom:12,marginTop:untriaged.length?24:0}}>
                Triaged ✓ — {triaged.length}
              </div>
              {triaged.map(it=>{
                const tm=it.itemType?TYPE_META[it.itemType]:null;
                return(
                  <div key={it.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(34,211,160,0.04)",border:"1px solid rgba(34,211,160,0.15)",borderRadius:8,marginBottom:6,flexWrap:"wrap"}}>
                    <span style={{color:"#22d3a0"}}>✓</span>
                    <span style={{color:"#2568FB",fontWeight:600,fontSize:12}}>{it.drawingNumber||"—"}</span>
                    <span style={{color:"#64748b",fontSize:11,flex:1}}>{it.description||it.partNumber||"—"}</span>
                    {tm&&<span className="badge" style={{background:tm.bg,color:tm.color,border:`1px solid ${tm.border}`}}>{it.itemType}</span>}
                    {it.itemType!=="Reuse"&&<span className={`badge ${it.isNewPart?"bblue":"bgreen"}`} style={{fontSize:8}}>{it.isNewPart?"NEW":"REPEAT"}</span>}
                    {it.itemType==="Reuse"&&<span className="badge bpurple" style={{fontSize:8}}>No Purchase</span>}
                    <span style={{color:"#22d3a0",fontSize:11}}>Qty: {it.neededQty}</span>
                    <button className="btn b-gray btn-xs" onClick={()=>undoTriage(it.id)}>Undo</button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}


function TriageRow({ row, idx, isSaving, onTypeChange, onNewChange, onMarkReady }) {
  const [type, setType] = useState(row.itemType||"");
  const [isNew, setIsNew] = useState(row.isNewPart!==false);
  useEffect(()=>{ setType(row.itemType||""); },[row.itemType]);
  useEffect(()=>{ setIsNew(row.isNewPart!==false); },[row.isNewPart]);
  const tm = type ? TYPE_META[type] : null;
  return (
    <div style={{padding:"16px",background:"rgba(12,28,80,0.8)",border:`2px solid ${tm?tm.border:"rgba(148,163,184,0.1)"}`,borderRadius:10,marginBottom:10,opacity:isSaving?0.7:1,transition:"border-color .2s"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flex:1,flexWrap:"wrap"}}>
          <span style={{color:"#3d4f63",fontSize:11,fontWeight:600,minWidth:22}}>#{idx}</span>
          <div>
            <div style={{color:"#2568FB",fontWeight:700,fontSize:13}}>{row.drawingNumber||"—"}</div>
            <div style={{color:"#64748b",fontSize:11,marginTop:2}}>{row.partNumber||""}{row.description?" · "+row.description:""}</div>
          </div>
          {row.material&&<span style={{padding:"2px 8px",background:"rgba(100,116,139,0.1)",border:"1px solid rgba(100,116,139,0.15)",borderRadius:5,fontSize:10,color:"#64748b"}}>{row.material}</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"#22d3a0",fontWeight:700,fontSize:13}}>Qty: {row.neededQty}</span>
          {isSaving&&<span style={{fontSize:10,color:"#FECD45"}}>saving…</span>}
        </div>
      </div>

      <div style={{marginBottom:14}}>
        <div className="flabel" style={{marginBottom:8}}>① Item Type</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {ITEM_TYPES.map(t=>{
            const m=TYPE_META[t]; const a=type===t;
            return(
              <button key={t} disabled={isSaving}
                onClick={()=>{ const v=a?"":t; setType(v); onTypeChange(v); }}
                style={{padding:"8px 20px",borderRadius:8,fontSize:12,fontFamily:"'DM Mono',monospace",fontWeight:700,cursor:"pointer",
                  border:`2px solid ${a?m.color:"rgba(148,163,184,0.12)"}`,
                  background:a?m.bg:"rgba(10,24,60,0.6)",
                  color:a?m.color:"#475569",transition:"all .15s"}}>
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {type&&type!=="Reuse"&&(
        <div style={{marginBottom:14}}>
          <div className="flabel" style={{marginBottom:8}}>② New or Repeat?</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[["New Part",true,"#2568FB"],["Repeat / Known Supplier",false,"#22d3a0"]].map(([label,flag,col])=>(
              <button key={label} disabled={isSaving}
                onClick={()=>{ setIsNew(flag); onNewChange(flag); }}
                style={{padding:"7px 16px",borderRadius:7,fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer",
                  border:`2px solid ${isNew===flag?col:"rgba(148,163,184,0.12)"}`,
                  background:isNew===flag?col+"22":"rgba(10,24,60,0.6)",
                  color:isNew===flag?col:"#475569",transition:"all .15s"}}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {type==="Reuse"&&(
        <div style={{marginBottom:14,padding:"8px 12px",background:"rgba(167,139,250,0.07)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:7,fontSize:11,color:"#a78bfa"}}>
          ⊘ Reuse — no purchase needed.
        </div>
      )}

      <div style={{display:"flex",justifyContent:"flex-end"}}>
        {type
          ? <button className={`btn ${type==="Reuse"?"b-purple":"b-green"}`}
              onClick={()=>onMarkReady(type,isNew)} disabled={isSaving}>
              <Icon name="check" size={13}/>{isSaving?"Saving…":type==="Reuse"?"Confirm No-Purchase":"Mark Ready"}
            </button>
          : <span style={{fontSize:11,color:"#3d4f63"}}>← Select an Item Type to continue</span>
        }
      </div>
    </div>
  );
}

// ─── Step 4.2: RFQ Sheet ──────────────────────────────────────────────────────
// Fully PO-items-based — no rfq_headers/rfq_items tables needed
// Data model per BOM item when in RFQ:
//   it.rfqId, it.rfqNo, it.rfqStatus ("open"|"awarded")
//   it.rfqSuppliers: ["Compomax","Shinhua",...]
//   it.rfqResponse: { [supplier]: { priceBreaks:{1:x,2:x,...}, etd, remarks, submittedAt } }
//   it.rfqWinner: { supplier, priceBreaks, etd, awardedAt }
function RFQSheet({ user, pos, addNotif, nextSeq, loadAll }) {
  const [selPoId, setSelPoId] = useState("");
  const [tab, setTab] = useState("launch");
  const [rfqModal, setRfqModal] = useState(null);
  const [selRfqId, setSelRfqId] = useState("");
  const [saving, setSaving] = useState(false);

  const selPo = pos.find(p=>p.id===selPoId)||null;
  const poQty = selPo?.poQty||1;

  // All NEW triaged items from a PO
  const getNewItems = (po) => (po?.items||[])
    .filter(it=>it.triaged&&it.isNewPart&&it.itemType&&it.itemType!=="Reuse")
    .map(it=>({...it, neededQty:(it.qtyPc||1)*(po.poQty||1), poId:po.id, poNo:po.poNo}));

  const poNewItems = getNewItems(selPo);
  const pendingItems = poNewItems.filter(it=>!it.rfqId); // not yet in any RFQ
  const posWithNewItems = pos.filter(p=>getNewItems(p).length>0);

  // All active RFQs across all POs (grouped by rfqId)
  const allRfqGroups = Object.values(
    pos.flatMap(po=>(po.items||[])
      .filter(it=>it.rfqId)
      .map(it=>({...it, neededQty:(it.qtyPc||1)*(po.poQty||1), poId:po.id, poNo:po.poNo}))
    ).reduce((acc,it)=>{
      if (!acc[it.rfqId]) acc[it.rfqId]={rfqId:it.rfqId,rfqNo:it.rfqNo,poNo:it.poNo,poId:it.poId,items:[]};
      acc[it.rfqId].items.push(it);
      return acc;
    },{})
  );

  const selGroup = allRfqGroups.find(g=>g.rfqId===selRfqId)||null;

  // Launch RFQ — tag BOM items in PO
  const launchRFQ = async (selectedItemIds, invitedSuppliers) => {
    setSaving(true);
    const rfqId = genId();
    const rfqNo = `RFQ-${today().replace(/-/g,"")}-${String(allRfqGroups.length+1).padStart(3,"0")}`;
    const updatedItems = (selPo.items||[]).map(it=>
      selectedItemIds.includes(it.id)
        ? {...it, rfqId, rfqNo, rfqSuppliers:invitedSuppliers, rfqStatus:"open", rfqResponse:{}, orderMode:"rfq"}
        : it
    );
    await sb.from("purchase_orders").update({items:updatedItems}).eq("id",selPoId);
    for (const sup of invitedSuppliers)
      await addNotif(sup, `📋 RFQ ${rfqNo} — fill price table for ${selectedItemIds.length} item(s) · PO ${selPo.poNo}`);
    await addNotif("purchasing", `RFQ ${rfqNo} launched to ${invitedSuppliers.length} supplier(s)`);
    setSaving(false);
    setRfqModal(null);
    loadAll();
  };

  // Update invited suppliers for an existing RFQ group
  const updateRFQSuppliers = async (group, newSuppliers) => {
    const po = pos.find(p=>p.id===group.poId);
    if (!po) return;
    const updatedItems = (po.items||[]).map(it=>
      it.rfqId===group.rfqId ? {...it, rfqSuppliers:newSuppliers} : it
    );
    await sb.from("purchase_orders").update({items:updatedItems}).eq("id",po.id);
    // Notify newly added suppliers
    const existing = group.items[0]?.rfqSuppliers||[];
    const added = newSuppliers.filter(s=>!existing.includes(s));
    for (const sup of added)
      await addNotif(sup, `📋 RFQ ${group.rfqNo} — you've been invited to quote · PO ${group.poNo}`);
    loadAll();
  };

  // Approve supplier's edit request
  const approveEditRequest = async (bomItem, supplier, editReq) => {
    const po = pos.find(p=>p.id===bomItem.poId);
    if (!po) return;
    const updatedItems = (po.items||[]).map(it=>
      it.id===bomItem.id
        ? {...it, rfqResponse:{...(it.rfqResponse||{}), [supplier]:{...(it.rfqResponse||{})[supplier], editRequest:{status:"approved"}}}}
        : it
    );
    await sb.from("purchase_orders").update({items:updatedItems}).eq("id",po.id);
    await addNotif(supplier, `✓ Your edit request for ${bomItem.drawingNumber} has been approved. You can now update your prices.`);
    loadAll();
  };

  const denyEditRequest = async (bomItem, supplier) => {
    const po = pos.find(p=>p.id===bomItem.poId);
    if (!po) return;
    const updatedItems = (po.items||[]).map(it=>
      it.id===bomItem.id
        ? {...it, rfqResponse:{...(it.rfqResponse||{}), [supplier]:{...(it.rfqResponse||{})[supplier], editRequest:{status:"denied"}}}}
        : it
    );
    await sb.from("purchase_orders").update({items:updatedItems}).eq("id",po.id);
    await addNotif(supplier, `✗ Your edit request for ${bomItem.drawingNumber} was denied.`);
    loadAll();
  };

  // Award winner — saves to PO item, creates purchasing_item
  const awardItem = async (bomItem, supplier) => {
    if (!confirm(`Award ${bomItem.drawingNumber} to ${supplier}?`)) return;
    setSaving(true);
    try {
      const resp = (bomItem.rfqResponse||{})[supplier]||{};
      const breaks = resp.priceBreaks||{};
      // Use price at needed qty, fallback to 1pc price
      const neededQty = bomItem.neededQty||1;
      const awardedPrice = breaks[String(neededQty)] || breaks["1"] || null;
      const seq = await nextSeq(supplier);
      const purNo = genPurNo(supplier, seq);
      const po = pos.find(p=>p.id===bomItem.poId);
      if (!po) throw new Error("PO not found: "+bomItem.poId);

      // 1. Mark BOM item as awarded in PO
      const updatedItems = (po.items||[]).map(it=>
        it.id===bomItem.id
          ? {...it,
              rfqStatus:"awarded",
              rfqWinner:{ supplier, priceBreaks:breaks, etd:resp.etd||"", awardedAt:today(), purNo },
              orderMode:"ordering"
            }
          : it
      );
      const poUpdate = await sb.from("purchase_orders").update({items:updatedItems}).eq("id",po.id);
      if (poUpdate.error) throw poUpdate.error;

      // 2. Insert purchasing_item — only original schema columns (safe for all DB versions)
      const ins = await sb.from("purchasing_items").insert({
        id:             genId(),
        po_no:          bomItem.poNo||po.poNo,
        purchasing_no:  purNo,
        supplier:       supplier,
        price:          awardedPrice,
        part_number:    bomItem.partNumber||"",
        drawing_number: bomItem.drawingNumber||"",
        description:    bomItem.description||"",
        material:       bomItem.material||"",
        ptd:            resp.etd||null,
        created_at:     today(),
      });
      if (ins.error) throw ins.error;

      await addNotif(supplier, `🏆 You won the RFQ! ${bomItem.drawingNumber} · Pur# ${purNo} · PO ${bomItem.poNo}`);
      await addNotif("purchasing", `✓ Awarded: ${bomItem.drawingNumber} → ${supplier} · Pur# ${purNo}`);
    } catch(e) {
      console.error("awardItem error:", e);
      alert("Award failed: "+e.message);
    }
    setSaving(false);
    loadAll();
  };

  const statusColor = { open:"#FECD45", awarded:"#22d3a0" };

  return (
    <div className="page">
      <FlowBanner active="s4b" role={user?.role||""}/>
      <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800,marginBottom:6}}>RFQ Sheet</div>
      <div style={{color:"#475569",fontSize:12,marginBottom:22}}>Step ④b — Launch RFQs for NEW items, compare responses, award winner.</div>
      <div className="tab-bar">
        <div className={`tab-item${tab==="launch"?" active":""}`} onClick={()=>setTab("launch")}>Launch RFQ</div>
        <div className={`tab-item${tab==="compare"?" active":""}`} onClick={()=>setTab("compare")}>Compare & Award ({allRfqGroups.length})</div>
      </div>

      {/* ── Launch tab ── */}
      {tab==="launch"&&(<>
        <div className="card">
          <div className="ctitle">Select PO (new items only)</div>
          {!posWithNewItems.length
            ?<div style={{color:"#FECD45",fontSize:12}}>No POs with triaged NEW items. Complete BOM Triage first.</div>
            :<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {posWithNewItems.map(po=>(
                <button key={po.id} className={`btn ${selPoId===po.id?"b-blue":"b-gray"}`} style={{fontSize:11}}
                  onClick={()=>setSelPoId(po.id===selPoId?"":po.id)}>{po.poNo}
                </button>
              ))}
            </div>
          }
        </div>
        {selPo&&(<div className="card">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:18}}>
            <div style={{fontFamily:"Syne",fontSize:15,fontWeight:700,color:"#2568FB"}}>{selPo.poNo}</div>
            {pendingItems.length>0&&(
              <button className="btn b-teal btn-sm" disabled={saving} onClick={()=>setRfqModal({items:pendingItems})}>
                <Icon name="send" size={13}/>Launch RFQ ({pendingItems.length} items)
              </button>
            )}
          </div>
          <div className="tw"><table>
            <thead><tr><th>#</th><th>Drawing #</th><th>Description</th><th>Qty</th><th>Type</th><th>RFQ</th><th>Suppliers</th></tr></thead>
            <tbody>{poNewItems.map((it,idx)=>{
              const tm=it.itemType?TYPE_META[it.itemType]:null;
              const sups=it.rfqSuppliers||[];
              const responses=Object.keys(it.rfqResponse||{});
              return(<tr key={it.id}>
                <td style={{color:"#3d4f63"}}>{idx+1}</td>
                <td style={{color:"#2568FB",fontWeight:600}}>{it.drawingNumber||"—"}</td>
                <td>{it.description||it.partNumber||"—"}</td>
                <td style={{color:"#22d3a0",fontWeight:700}}>{it.neededQty}</td>
                <td>{tm&&<span className="badge" style={{background:tm.bg,color:tm.color,border:`1px solid ${tm.border}`}}>{it.itemType}</span>}</td>
                <td>
                  {it.rfqStatus==="awarded"
                    ?<span className="badge bgreen" style={{fontSize:8}}>✓ Awarded</span>
                    :it.rfqId
                      ?<span className="badge byellow" style={{fontSize:8}}>In RFQ · {responses.length}/{sups.length} responded</span>
                      :<span className="badge" style={{background:"rgba(100,116,139,0.1)",color:"#64748b",border:"1px solid rgba(100,116,139,0.15)"}}>Pending</span>
                  }
                </td>
                <td>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                    {sups.map(s=>{
                      const hasResp=responses.includes(s);
                      return <span key={s} className="badge" style={{fontSize:8,background:hasResp?"rgba(34,211,160,0.1)":"rgba(100,116,139,0.1)",color:hasResp?"#22d3a0":"#64748b",border:`1px solid ${hasResp?"rgba(34,211,160,0.2)":"rgba(100,116,139,0.15)"}`}}>{s}{hasResp?" ✓":""}</span>;
                    })}
                  </div>
                </td>
              </tr>);
            })}</tbody>
          </table></div>
        </div>)}
      </>)}

      {/* ── Compare & Award tab ── */}
      {tab==="compare"&&(<>
        <div className="card">
          <div className="ctitle"><Icon name="rfq"/>Active RFQs <span className="sub">({allRfqGroups.length})</span></div>
          {!allRfqGroups.length?<div className="empty">No RFQs launched yet.</div>:(
            <div className="tw"><table>
              <thead><tr><th>RFQ #</th><th>PO #</th><th>Items</th><th>Responses</th><th>Status</th><th>Edit Suppliers</th><th></th></tr></thead>
              <tbody>{allRfqGroups.map(g=>{
                const totalSups=g.items[0]?.rfqSuppliers?.length||0;
                const respondedSups=new Set(g.items.flatMap(it=>Object.keys(it.rfqResponse||{}))).size;
                const awarded=g.items.every(it=>it.rfqStatus==="awarded");
                const st=awarded?"awarded":"open";
                return(<tr key={g.rfqId}>
                  <td style={{color:"#2dd4bf",fontWeight:600}}>{g.rfqNo}</td>
                  <td style={{color:"#2568FB"}}>{g.poNo}</td>
                  <td>{g.items.length}</td>
                  <td><span style={{color:respondedSups===totalSups&&totalSups>0?"#22d3a0":"#FECD45",fontWeight:600}}>{respondedSups}/{totalSups}</span><span style={{color:"#475569",fontSize:10}}> suppliers</span></td>
                  <td><span className="badge" style={{background:`${statusColor[st]}15`,color:statusColor[st],border:`1px solid ${statusColor[st]}33`}}>{st}</span></td>
                  <td><RFQEditSuppliers group={g} onSave={updateRFQSuppliers}/></td>
                  <td><button className="btn b-teal btn-xs" onClick={()=>setSelRfqId(g.rfqId===selRfqId?"":g.rfqId)}>{g.rfqId===selRfqId?"Close":"Compare"}</button></td>
                </tr>);
              })}</tbody>
            </table></div>
          )}
        </div>

        {selGroup&&(<div className="card">
          <div style={{fontFamily:"Syne",fontSize:15,fontWeight:700,color:"#2dd4bf",marginBottom:6}}>{selGroup.rfqNo} — Compare & Award</div>
          <div style={{fontSize:11,color:"#475569",marginBottom:18}}>PO: {selGroup.poNo} · Only suppliers who submitted responses are shown per item.</div>
          {selGroup.items.map(bomItem=>{
            // Only show suppliers who actually submitted (have entry in rfqResponse)
            const submittedEntries = Object.entries(bomItem.rfqResponse||{}).filter(([sup,r])=>r&&r.priceBreaks);
            const winner = bomItem.rfqWinner;
            const tm = bomItem.itemType?TYPE_META[bomItem.itemType]:null;
            return(
              <div key={bomItem.id} style={{marginBottom:28,padding:"18px",background:"rgba(8,20,55,0.7)",borderRadius:12,border:`1px solid ${winner?"rgba(34,211,160,0.25)":"rgba(37,104,251,0.15)"}`}}>
                {/* Item header */}
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,flexWrap:"wrap",paddingBottom:12,borderBottom:"1px solid rgba(148,163,184,0.08)"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <span style={{color:"#2568FB",fontWeight:700,fontSize:14}}>{bomItem.drawingNumber||"—"}</span>
                      {bomItem.partNumber&&<span style={{color:"#64748b",fontSize:11}}>· {bomItem.partNumber}</span>}
                      {tm&&<span className="badge" style={{background:tm.bg,color:tm.color,border:`1px solid ${tm.border}`,fontSize:8}}>{bomItem.itemType}</span>}
                    </div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{bomItem.description||"—"} {bomItem.material?"· "+bomItem.material:""}</div>
                  </div>
                  <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{color:"#22d3a0",fontSize:13,fontWeight:700}}>Need: {bomItem.neededQty}</span>
                    {winner&&<span className="badge bgreen" style={{fontSize:9}}>✓ Awarded → {winner.supplier}</span>}
                    {!submittedEntries.length&&<span className="badge byellow" style={{fontSize:9}}>Awaiting responses</span>}
                  </div>
                </div>

                {/* Invited but not yet responded */}
                {(()=>{
                  const pending=(bomItem.rfqSuppliers||[]).filter(s=>!submittedEntries.find(([sup])=>sup===s));
                  if (!pending.length) return null;
                  return <div style={{fontSize:10,color:"#475569",marginBottom:10}}>Awaiting: {pending.map(s=><span key={s} style={{marginRight:6,color:"#64748b"}}>{s}</span>)}</div>;
                })()}

                {submittedEntries.length>0&&(
                  <div className="tw"><table>
                    <thead>
                      <tr>
                        <th style={{minWidth:100}}>Supplier</th>
                        {RFQ_QTYS.map(q=><th key={q} style={{minWidth:64,textAlign:"center"}}>{q}pc</th>)}
                        <th style={{minWidth:90}}>ETD</th>
                        <th style={{minWidth:100}}>Remarks</th>
                        <th style={{minWidth:80}}>Submitted</th>
                        <th style={{minWidth:80}}>Edit Status</th>
                        <th style={{minWidth:80}}>Award</th>
                      </tr>
                    </thead>
                    <tbody>{submittedEntries.map(([sup,resp])=>{
                      const isWinner=winner?.supplier===sup;
                      const editReq=resp.editRequest;
                      return(<tr key={sup} style={{background:isWinner?"rgba(34,211,160,0.05)":"transparent"}}>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            {isWinner&&<span style={{color:"#FECD45",fontSize:13}}>★</span>}
                            <span style={{color:"#FECD45",fontWeight:600,fontSize:12}}>{sup}</span>
                          </div>
                        </td>
                        {RFQ_QTYS.map(q=><td key={q} style={{color:"#22d3a0",fontSize:11,textAlign:"center",fontWeight:resp.priceBreaks?.[String(q)]?600:400}}>{resp.priceBreaks?.[String(q)]?`$${Number(resp.priceBreaks[String(q)]).toFixed(2)}`:"—"}</td>)}
                        <td style={{color:"#2568FB",fontSize:11}}>{resp.etd||"—"}</td>
                        <td style={{fontSize:11,color:"#64748b",maxWidth:120}}>{resp.remarks||"—"}</td>
                        <td style={{fontSize:10,color:"#475569"}}>{resp.submittedAt||"—"}</td>
                        <td>
                          {editReq?.status==="pending"
                            ?<div style={{display:"flex",gap:4}}>
                                <button className="btn b-green btn-xs" onClick={()=>approveEditRequest(bomItem,sup,editReq)}>✓ Allow</button>
                                <button className="btn b-red btn-xs" onClick={()=>denyEditRequest(bomItem,sup)}>✗ Deny</button>
                              </div>
                            :editReq?.status==="approved"
                              ?<span className="badge bgreen" style={{fontSize:8}}>Edit allowed</span>
                              :<span style={{fontSize:10,color:"#3d4f63"}}>Locked</span>
                          }
                        </td>
                        <td>
                          {isWinner
                            ?<span className="badge bgreen" style={{fontSize:9}}>✓ Winner</span>
                            :winner
                              ?<button className="btn b-orange btn-xs" disabled={saving} onClick={()=>awardItem(bomItem,sup)}>Replace</button>
                              :<button className="btn b-green btn-xs" disabled={saving} onClick={()=>awardItem(bomItem,sup)}><Icon name="award" size={11}/>Award</button>
                          }
                        </td>
                      </tr>);
                    })}</tbody>
                  </table></div>
                )}
              </div>
            );
          })}
        </div>)}
      </>)}
      {rfqModal&&<RFQLaunchModal items={rfqModal.items} onLaunch={launchRFQ} onClose={()=>setRfqModal(null)}/>}
    </div>
  );
}

// Edit suppliers for an existing RFQ
function RFQEditSuppliers({ group, onSave }) {
  const [open, setOpen] = useState(false);
  const [sups, setSups] = useState(group.items[0]?.rfqSuppliers||[]);
  const toggle = s => setSups(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);
  if (!open) return <button className="btn b-gray btn-xs" onClick={()=>setOpen(true)}><Icon name="edit" size={11}/>Edit Suppliers</button>;
  return(
    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
      {SUPPLIERS.map(s=>(
        <button key={s} onClick={()=>toggle(s)} style={{padding:"3px 9px",borderRadius:5,fontSize:10,fontFamily:"'DM Mono',monospace",cursor:"pointer",border:`1px solid ${sups.includes(s)?"#FECD45":"rgba(148,163,184,0.15)"}`,background:sups.includes(s)?"rgba(254,205,69,0.1)":"transparent",color:sups.includes(s)?"#FECD45":"#64748b"}}>{s}</button>
      ))}
      <button className="btn b-green btn-xs" onClick={async()=>{await onSave(group,sups);setOpen(false);}}>Save</button>
      <button className="btn b-gray btn-xs" onClick={()=>setOpen(false)}>Cancel</button>
    </div>
  );
}

function RFQLaunchModal({ items, onLaunch, onClose }) {
  const [selItems, setSelItems] = useState(items.map(it=>it.id));
  const [selSups, setSelSups] = useState([]);
  const toggle = (arr,setArr,v) => setArr(a=>a.includes(v)?a.filter(x=>x!==v):[...a,v]);
  return(
    <div className="moverlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <button className="mclose" onClick={onClose}><Icon name="x"/></button>
        <div className="mtitle"><Icon name="send" size={18}/>Launch RFQ</div>
        <div style={{marginBottom:20}}>
          <div className="flabel" style={{marginBottom:10}}>Items ({selItems.length} selected)</div>
          {items.map(it=>(
            <div key={it.id} onClick={()=>toggle(selItems,setSelItems,it.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:selItems.includes(it.id)?"rgba(254,205,69,0.07)":"rgba(12,28,80,0.6)",border:`1px solid ${selItems.includes(it.id)?"rgba(254,205,69,0.3)":"rgba(148,163,184,0.08)"}`,borderRadius:8,marginBottom:5,cursor:"pointer"}}>
              <div style={{width:15,height:15,border:`2px solid ${selItems.includes(it.id)?"#FECD45":"#334155"}`,borderRadius:3,background:selItems.includes(it.id)?"rgba(254,205,69,0.15)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {selItems.includes(it.id)&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#FECD45" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
              </div>
              <div style={{flex:1}}><span style={{color:"#e2e8f0",fontSize:12}}>{it.drawingNumber||"—"}</span><span style={{color:"#64748b",fontSize:11,marginLeft:10}}>{it.description||"—"}</span></div>
              <span style={{fontSize:11,color:"#22d3a0"}}>Qty: {it.neededQty}</span>
            </div>
          ))}
        </div>
        <div style={{marginBottom:20}}>
          <div className="flabel" style={{marginBottom:10}}>Invite Suppliers ({selSups.length} selected)</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:6}}>
            {SUPPLIERS.map(s=>(
              <div key={s} onClick={()=>toggle(selSups,setSelSups,s)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:8,border:`1px solid ${selSups.includes(s)?"rgba(254,205,69,0.4)":"rgba(148,163,184,0.1)"}`,background:selSups.includes(s)?"rgba(254,205,69,0.06)":"rgba(12,28,80,0.6)",cursor:"pointer"}}>
                <div style={{width:14,height:14,border:`2px solid ${selSups.includes(s)?"#FECD45":"#334155"}`,borderRadius:3,background:selSups.includes(s)?"rgba(254,205,69,0.15)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {selSups.includes(s)&&<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#FECD45" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
                <span style={{fontSize:11.5,color:selSups.includes(s)?"#FECD45":"#64748b"}}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button className="btn b-gray" onClick={onClose}>Cancel</button>
          <button className="btn b-teal" disabled={!selItems.length||!selSups.length} style={{opacity:selItems.length&&selSups.length?1:.4}} onClick={()=>onLaunch(selItems,selSups)}>
            <Icon name="send" size={13}/>Launch to {selSups.length} Supplier{selSups.length!==1?"s":""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4.3: Ordering ───────────────────────────────────────────────────────
// Reads from purchase_orders.items — no quotation_rows table needed
function OrderingView({ user, pos, purchasingItems, addNotif, nextSeq, loadAll }) {
  const [selPoId, setSelPoId]   = useState("");
  const [orderTypes, setOrderTypes] = useState({});
  const [supSel, setSupSel]     = useState({});
  const [saving, setSaving]     = useState({});

  const selPo  = pos.find(p=>p.id===selPoId)||null;
  const poQty  = selPo?.poQty||1;

  // Item is ready for ordering if:
  //  - triaged, not Reuse
  //  - REPEAT: always ready
  //  - NEW: must have rfqStatus==="awarded" (winner selected in RFQ step)
  const getReadyItems = (po) =>
    (po?.items||[]).filter(it=>{
      if (!it.triaged || !it.itemType || it.itemType==="Reuse") return false;
      if (it.isNewPart) return it.rfqStatus==="awarded";
      return true; // repeat item
    }).map(it=>({
      ...it,
      neededQty: (it.qtyPc||1)*(po.poQty||1),
      poId: po.id,
      poNo: po.poNo,
    }));

  // Already has a purchasing item created?
  const alreadyOrdered = (it) =>
    purchasingItems.some(p=>p.drawingNumber===it.drawingNumber && p.poNo===it.poNo && !p.noPurchase);

  const selReadyItems = getReadyItems(selPo);
  const unordered     = selReadyItems.filter(it=>!alreadyOrdered(it));
  const ordered       = selReadyItems.filter(it=>alreadyOrdered(it));

  // Consolidation: same D/N across ALL POs, not yet ordered
  const getConsolidationCandidates = (drawingNumber) =>
    pos.flatMap(po=>
      getReadyItems(po)
        .filter(it=>it.drawingNumber===drawingNumber && !alreadyOrdered(it))
    );

  // POs that have at least one item ready
  const posWithReadyItems = pos.filter(p=>getReadyItems(p).length>0);

  const getOrderType = (itemId) => orderTypes[itemId]||"individual";
  const setOrderType = (itemId, type) => setOrderTypes(o=>({...o,[itemId]:type}));

  const placeIndividualOrder = async (it, supplier) => {
    if (!supplier) return alert("Select a supplier");
    setSaving(s=>({...s,[it.id]:true}));
    try {
      const seq   = await nextSeq(supplier);
      const purNo = genPurNo(supplier, seq);
      // Insert purchasing item
      // Use only columns guaranteed to exist in the original purchasing_items table
      const ins = await sb.from("purchasing_items").insert({
        id:             genId(),
        po_no:          it.poNo,
        purchasing_no:  purNo,
        supplier:       supplier,
        price:          it.rfqWinner?.priceBreaks?.["1"]||null,
        part_number:    it.partNumber||"",
        drawing_number: it.drawingNumber||"",
        description:    it.description||"",
        material:       it.material||"",
        ptd:            it.rfqWinner?.etd||null,
        created_at:     today(),
      });
      if (ins.error) throw ins.error;
      // Mark BOM item as ordered in PO
      const po = pos.find(p=>p.id===it.poId);
      if (po) {
        const updatedItems = (po.items||[]).map(x=>
          x.id===it.id ? {...x, ordered:true, purNo, orderMode:"ordering"} : x
        );
        await sb.from("purchase_orders").update({items:updatedItems}).eq("id",po.id);
      }
      await addNotif(supplier, `📦 New order: ${it.drawingNumber} · Pur# ${purNo} · PO ${it.poNo}`);
      await addNotif("purchasing", `Order placed: ${it.drawingNumber} → ${supplier} · ${purNo}`);
    } catch(e) {
      console.error("placeIndividualOrder error:", e);
      alert("Failed: "+e.message);
    }
    setSaving(s=>({...s,[it.id]:false}));
    loadAll();
  };

  const placeConsolidatedOrder = async (drawingNumber, supplier, candidates) => {
    if (!supplier) return alert("Select a supplier");
    const purNo    = `CONS-${today().replace(/-/g,"")}-${drawingNumber.replace(/\W/g,"").slice(0,6)}`;
    const totalQty = candidates.reduce((s,c)=>s+(c.neededQty||0),0);
    try {
      const ins = await sb.from("consolidated_items").insert({
        id: genId(), consolidated_pur_no: purNo, drawing_number: drawingNumber,
        supplier, total_qty: totalQty,
        source_items: candidates.map(c=>({poNo:c.poNo,drawingNumber:c.drawingNumber,neededQty:c.neededQty})),
        type: "Stock", status: "pending", supplier_confirmation: "", created_at: today(),
      });
      if (ins.error) throw ins.error;
      // Mark all candidate BOM items as ordered
      for (const c of candidates) {
        const po = pos.find(p=>p.id===c.poId);
        if (po) {
          const updatedItems = (po.items||[]).map(x=>
            x.id===c.id ? {...x, ordered:true, consolidatedPurNo:purNo, orderMode:"ordering"} : x
          );
          await sb.from("purchase_orders").update({items:updatedItems}).eq("id",po.id);
        }
      }
      await addNotif(supplier, `📦 Consolidated order: ${drawingNumber} · ${purNo} · Total Qty: ${totalQty}`);
    } catch(e) {
      console.error("placeConsolidatedOrder error:", e);
      alert("Failed: "+e.message);
    }
    loadAll();
  };

  return (
    <div className="page">
      <FlowBanner active="s4c" role={user?.role||""}/>
      <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800,marginBottom:6}}>Ordering</div>
      <div style={{color:"#475569",fontSize:12,marginBottom:22}}>
        Step ④c — Place individual or consolidated orders. Repeat items appear directly. New items appear after RFQ award.
      </div>

      <div className="card">
        <div className="ctitle">Select PO</div>
        {!posWithReadyItems.length
          ? <div style={{color:"#FECD45",fontSize:12}}>
              No POs with items ready for ordering yet.<br/>
              <span style={{color:"#475569",fontSize:11}}>Repeat items appear after triage. New items appear after RFQ award.</span>
            </div>
          : <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {posWithReadyItems.map(po=>{
                const ri = getReadyItems(po);
                const done = ri.filter(it=>alreadyOrdered(it)).length;
                return (
                  <button key={po.id} className={`btn ${selPoId===po.id?"b-blue":"b-gray"}`} style={{fontSize:11}}
                    onClick={()=>setSelPoId(po.id===selPoId?"":po.id)}>
                    {po.poNo}
                    <span style={{opacity:.6,fontSize:10,marginLeft:4}}>{done}/{ri.length}</span>
                  </button>
                );
              })}
            </div>
        }
      </div>

      {selPo&&(
        <div className="card">
          <div style={{fontFamily:"Syne",fontSize:15,fontWeight:700,color:"#2568FB",marginBottom:4}}>{selPo.poNo}</div>
          <div style={{fontSize:11,color:"#475569",marginBottom:18}}>
            {unordered.length} pending · {ordered.length} ordered
          </div>

          {/* ── Unordered items ── */}
          {!unordered.length && (
            <div style={{color:"#22d3a0",fontSize:12,marginBottom:16}}>✓ All ready items have been ordered.</div>
          )}
          {unordered.map(it=>{
            const type       = getOrderType(it.id);
            const sup        = supSel[it.id]||"";
            const candidates = getConsolidationCandidates(it.drawingNumber);
            const tm         = it.itemType?TYPE_META[it.itemType]:null;
            return(
              <div key={it.id} style={{padding:"16px",background:"rgba(12,28,80,0.85)",border:"1px solid rgba(37,104,251,0.2)",borderRadius:10,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:14,flexWrap:"wrap"}}>
                  <div>
                    <div style={{color:"#2568FB",fontWeight:700,fontSize:13}}>{it.drawingNumber||"—"}</div>
                    <div style={{color:"#64748b",fontSize:11,marginTop:2}}>{it.partNumber||""}{it.description?" · "+it.description:""}</div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                    {tm&&<span className="badge" style={{background:tm.bg,color:tm.color,border:`1px solid ${tm.border}`}}>{it.itemType}</span>}
                    {it.rfqWinner&&<span className="badge bblue" style={{fontSize:8}}>RFQ AWARDED · {it.rfqWinner.supplier}</span>}
                    {!it.isNewPart&&<span className="badge bgreen" style={{fontSize:8}}>REPEAT</span>}
                    <span style={{color:"#22d3a0",fontWeight:700}}>Qty: {it.neededQty}</span>
                  </div>
                </div>

                {/* RFQ winner info if available */}
                {it.rfqWinner&&(
                  <div style={{marginBottom:12,padding:"8px 12px",background:"rgba(34,211,160,0.05)",border:"1px solid rgba(34,211,160,0.15)",borderRadius:7,fontSize:11}}>
                    <span style={{color:"#22d3a0",fontWeight:600}}>RFQ Winner: {it.rfqWinner.supplier}</span>
                    <span style={{color:"#64748b",marginLeft:12}}>ETD: {it.rfqWinner.etd||"—"}</span>
                    <span style={{color:"#64748b",marginLeft:12}}>1pc: ${it.rfqWinner.priceBreaks?.["1"]||"—"}</span>
                  </div>
                )}

                {/* Order type */}
                <div style={{marginBottom:12}}>
                  <div className="flabel" style={{marginBottom:6}}>Order Type</div>
                  <div style={{display:"flex",gap:8}}>
                    {[["individual","Individual"],["consolidated","Consolidated"]].map(([val,label])=>(
                      <button key={val} onClick={()=>setOrderType(it.id,val)}
                        style={{padding:"6px 14px",borderRadius:7,fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer",
                          border:`2px solid ${type===val?"#2568FB":"rgba(148,163,184,0.12)"}`,
                          background:type===val?"rgba(37,104,251,0.12)":"rgba(10,24,60,0.6)",
                          color:type===val?"#2568FB":"#475569",transition:"all .15s"}}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consolidated preview */}
                {type==="consolidated"&&(
                  <div style={{marginBottom:12,padding:"10px 12px",background:"rgba(37,104,251,0.04)",border:"1px solid rgba(37,104,251,0.12)",borderRadius:8}}>
                    <div style={{fontSize:10,color:"#475569",letterSpacing:"1px",textTransform:"uppercase",marginBottom:8}}>
                      Same D/N across POs ({candidates.length} item{candidates.length!==1?"s":""})
                    </div>
                    {candidates.map((c,ci)=>(
                      <div key={c.id||ci} style={{display:"flex",gap:12,padding:"5px 8px",background:"rgba(12,28,80,0.5)",borderRadius:5,marginBottom:3,fontSize:11,alignItems:"center"}}>
                        <span style={{color:"#3d4f63",minWidth:18}}>{ci+1}.</span>
                        <span style={{color:"#2568FB",fontWeight:600}}>{c.poNo}</span>
                        <span style={{color:"#64748b"}}>{c.drawingNumber}</span>
                        <span style={{color:"#22d3a0",marginLeft:"auto"}}>Qty: {c.neededQty}</span>
                      </div>
                    ))}
                    <div style={{marginTop:6,fontSize:11,color:"#FECD45",fontWeight:600}}>
                      Total Qty: {candidates.reduce((s,c)=>s+(c.neededQty||0),0)}
                    </div>
                  </div>
                )}

                {/* Supplier — prefill with RFQ winner */}
                <div style={{marginBottom:12}}>
                  <div className="flabel" style={{marginBottom:6}}>Supplier</div>
                  <select className="fi" style={{maxWidth:240}}
                    value={sup||it.rfqWinner?.supplier||""}
                    onChange={e=>setSupSel(o=>({...o,[it.id]:e.target.value}))}>
                    <option value="">Select supplier…</option>
                    {SUPPLIERS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  {type==="individual"
                    ?<button className="btn b-green" disabled={!(sup||it.rfqWinner?.supplier)||saving[it.id]}
                        onClick={()=>placeIndividualOrder(it, sup||it.rfqWinner?.supplier||"")}>
                        <Icon name="check" size={13}/>{saving[it.id]?"Saving…":"Place Order"}
                      </button>
                    :<button className="btn b-blue" disabled={!(sup||it.rfqWinner?.supplier)||saving[it.id]}
                        onClick={()=>placeConsolidatedOrder(it.drawingNumber, sup||it.rfqWinner?.supplier||"", candidates)}>
                        <Icon name="layers" size={13}/>{saving[it.id]?"Saving…":"Place Consolidated"}
                      </button>
                  }
                </div>
              </div>
            );
          })}

          {/* ── Already ordered ── */}
          {ordered.length>0&&(
            <>
              <div style={{fontSize:10,letterSpacing:"2px",textTransform:"uppercase",color:"#22d3a0",marginTop:24,marginBottom:12}}>
                Already Ordered — {ordered.length}
              </div>
              {ordered.map(it=>{
                const purItem = purchasingItems.find(p=>p.drawingNumber===it.drawingNumber&&p.poNo===it.poNo);
                const tm = it.itemType?TYPE_META[it.itemType]:null;
                return(
                  <div key={it.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(34,211,160,0.04)",border:"1px solid rgba(34,211,160,0.15)",borderRadius:8,marginBottom:6,flexWrap:"wrap"}}>
                    <span style={{color:"#22d3a0",fontSize:13}}>✓</span>
                    <span style={{color:"#2568FB",fontWeight:600,fontSize:12}}>{it.drawingNumber||"—"}</span>
                    <span style={{color:"#64748b",fontSize:11,flex:1}}>{it.description||it.partNumber||"—"}</span>
                    {tm&&<span className="badge" style={{background:tm.bg,color:tm.color,border:`1px solid ${tm.border}`,fontSize:8}}>{it.itemType}</span>}
                    {purItem&&<span style={{color:"#FECD45",fontSize:11,fontWeight:600}}>{purItem.purchasingNo}</span>}
                    {purItem&&<span className="badge byellow" style={{fontSize:9}}>{purItem.supplier}</span>}
                    <span style={{color:"#22d3a0",fontSize:11}}>Qty: {it.neededQty}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step 6: Confirmation Review (Purchasing/Admin) ─────────────────────────
function ConfirmationView({ user, purchasingItems, confRequests, addNotif, loadAll }) {
  // ALL hooks must be declared first — before any derived state or logic
  const [acting, setActing]           = useState({});
  const [reqDateForm, setReqDateForm] = useState({});
  const [decisions, setDecisions]     = useState({});
  const [editMode, setEditMode]       = useState({});

  // Derive status: local override → DB status → locked flag → pending
  const getStatus = (i) => decisions[i.id] || i.status || (i.supplierConfirmationLocked?"confirmed":"pending");

  const allItems     = purchasingItems.filter(i => getStatus(i) !== "cancelled");
  const awaitingConf = allItems.filter(i => !i.supplierConfirmation);
  const hasConf      = allItems.filter(i =>  i.supplierConfirmation);
  const confirmed    = allItems.filter(i => getStatus(i) === "confirmed");
  const supplierResponded = confRequests.filter(r =>
    r.type==="purchaser_request" &&
    (r.status==="supplier_approved" || r.status==="supplier_denied")
  );

  const saveDecision = async (item, decision) => {
    // 1. Always save locally so UI updates immediately
    setDecisions(d=>({...d,[item.id]:decision}));
    // 2. Try all possible column combos, ignore errors
    const updates = [
      {status:decision, supplier_confirmation_locked:true},
      {status:decision},
      {supplier_confirmation_locked:decision==="confirmed"},
    ];
    for (const upd of updates) {
      const r = await sb.from("purchasing_items").update(upd).eq("id",item.id);
      if (!r.error) break; // stop on first success
    }
  };

  const approve = async (item) => {
    setActing(a=>({...a,[item.id]:"approving"}));
    await saveDecision(item, "confirmed");
    await addNotif(item.supplier, `✓ Confirmation approved for ${item.purchasingNo}.`);
    setActing(a=>({...a,[item.id]:null}));
    loadAll();
  };

  const deny = async (item) => {
    if (!confirm(`Cancel order ${item.purchasingNo}? This cannot be undone.`)) return;
    setActing(a=>({...a,[item.id]:"denying"}));
    await saveDecision(item, "cancelled");
    await addNotif(item.supplier, `✗ Order ${item.purchasingNo} has been cancelled.`);
    setActing(a=>({...a,[item.id]:null}));
    loadAll();
  };

  const requestDate = async (item) => {
    const date = reqDateForm[item.id];
    if (!date) return alert("Enter a requested date");
    setActing(a=>({...a,[item.id]:"requesting"}));
    await sb.from("confirmation_requests").insert({
      id:genId(), item_id:item.id, purchasing_no:item.purchasingNo,
      supplier:item.supplier, requested_date:date,
      reason:"Purchaser requests new delivery date",
      status:"pending", type:"purchaser_request", created_at:today()
    });
    await addNotif(item.supplier,
      `📅 Purchasing requests delivery date ${date} for ${item.purchasingNo}. Please approve or deny.`);
    setReqDateForm(f=>({...f,[item.id]:""}));
    setActing(a=>({...a,[item.id]:null}));
    loadAll();
  };

  const handleSupplierResponse = async (req, accepted) => {
    if (accepted) {
      let r = await sb.from("purchasing_items")
        .update({supplier_confirmation:req.requestedDate, status:"confirmed", supplier_confirmation_locked:true})
        .eq("id", req.itemId);
      if (r.error) {
        await sb.from("purchasing_items")
          .update({supplier_confirmation:req.requestedDate, supplier_confirmation_locked:true})
          .eq("id", req.itemId);
      }
      await addNotif(req.supplier, `✓ Date ${req.requestedDate} accepted for ${req.purchasingNo}.`);
    }
    await sb.from("confirmation_requests").update({status:"resolved"}).eq("id", req.id);
    loadAll();
  };

  const saveEdit = async (item, newStatus) => {
    // Allow re-approving, re-denying, or re-requesting from edit mode
    setEditMode(e=>({...e,[item.id]:false}));
    if (newStatus==="approve") await approve(item);
    else if (newStatus==="deny")    await deny(item);
  };

  const ItemRow = ({ item, showActions }) => {
    const isActing  = !!acting[item.id];
    const pendingReq = confRequests.find(r=>r.itemId===item.id&&r.status==="pending"&&r.type==="purchaser_request");
    // Derive status: local decisions override, then DB status, then locked flag, then pending
    const rawSt = item.status||"";
    const st = decisions[item.id] || rawSt || (item.supplierConfirmationLocked ? "confirmed" : "pending");
    const isEditing = !!editMode[item.id];
    const isDone = (st==="confirmed"||st==="cancelled") && !isEditing;
    const stColor = { confirmed:"#22d3a0", cancelled:"#f56565", pending:"#FECD45" };

    return (
      <tr style={{background:st==="confirmed"?"rgba(34,211,160,0.03)":st==="cancelled"?"rgba(245,101,101,0.03)":"transparent"}}>
        <td style={{color:"#2568FB",fontWeight:600,fontSize:11}}>{item.purchasingNo||"—"}</td>
        <td style={{fontSize:11}}>{item.poNo||"—"}</td>
        <td><span className="badge byellow" style={{fontSize:9}}>{item.supplier||"—"}</span></td>
        <td style={{fontSize:11}}>{item.drawingNumber||"—"}</td>
        <td style={{fontSize:11}}>{item.partNumber||"—"}</td>
        <td style={{color:"#22d3a0",fontWeight:600}}>{item.neededQty||"—"}</td>
        <td style={{color:"#2568FB",fontSize:11}}>{item.ptd||"—"}</td>
        <td>
          {item.supplierConfirmation
            ?<span style={{color:"#22d3a0",fontWeight:700}}>{item.supplierConfirmation}</span>
            :<span style={{color:"#3d4f63",fontSize:10}}>Not set</span>
          }
        </td>
        <td>
          <span className="badge" style={{background:`${stColor[st]||"#FECD45"}18`,color:stColor[st]||"#FECD45",border:`1px solid ${stColor[st]||"#FECD45"}33`,fontSize:8}}>
            {st}
          </span>
        </td>
        {showActions&&<td>
          {/* Done state — show result + Edit button */}
          {isDone ? (
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span className="badge" style={{background:`${stColor[st]}18`,color:stColor[st],border:`1px solid ${stColor[st]}33`,fontSize:8}}>
                {st==="confirmed"?"✓ Approved":"✗ Denied"}
              </span>
              <button className="btn b-gray btn-xs" onClick={()=>setEditMode(e=>({...e,[item.id]:true}))}>
                <Icon name="edit" size={10}/>Edit
              </button>
            </div>
          ) : pendingReq ? (
            <span className="badge byellow" style={{fontSize:8}}>Awaiting supplier</span>
          ) : item.supplierConfirmation ? (
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              <button className="btn b-green btn-xs" disabled={isActing} onClick={()=>approve(item)}>
                <Icon name="check" size={10}/>Approve
              </button>
              <button className="btn b-red btn-xs" disabled={isActing} onClick={()=>deny(item)}>
                <Icon name="x" size={10}/>Deny
              </button>
            </div>
          ) : (
            <span style={{fontSize:10,color:"#3d4f63"}}>Awaiting conf. date</span>
          )}
        </td>}
        {showActions&&<td>
          {/* Request date — show when not confirmed/cancelled OR when editing */}
          {(!isDone||isEditing) && !pendingReq && (
            <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
              <input className="fi" type="date" style={{padding:"3px 6px",fontSize:10,width:120}}
                value={reqDateForm[item.id]||""}
                onChange={e=>setReqDateForm(f=>({...f,[item.id]:e.target.value}))}/>
              <button className="btn b-purple btn-xs" disabled={isActing} onClick={()=>{
                requestDate(item);
                setEditMode(e=>({...e,[item.id]:false}));
              }}>Request</button>
              {isEditing&&item.supplierConfirmation&&(
                <>
                  <button className="btn b-green btn-xs" disabled={isActing} onClick={()=>saveEdit(item,"approve")}>
                    <Icon name="check" size={10}/>Re-approve
                  </button>
                  <button className="btn b-red btn-xs" disabled={isActing} onClick={()=>saveEdit(item,"deny")}>
                    <Icon name="x" size={10}/>Re-deny
                  </button>
                  <button className="btn b-gray btn-xs" onClick={()=>setEditMode(e=>({...e,[item.id]:false}))}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </td>}
      </tr>
    );
  };

  const tableHead = (showActions) => (
    <thead><tr>
      <th>Pur. #</th><th>PO #</th><th>Supplier</th><th>Drawing #</th><th>Part #</th>
      <th>Qty</th><th>PTD</th><th>Conf. Date</th><th>Status</th>
      {showActions&&<><th>Decision</th><th>Request / Edit</th></>}
    </tr></thead>
  );

  return (
    <div className="page">
      <FlowBanner active="s6" role={user?.role||""}/>
      <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800,marginBottom:6}}>Confirmation Review</div>
      <div style={{color:"#475569",fontSize:12,marginBottom:22}}>
        Step ⑥ — Review supplier confirmation dates. Approve, Deny (cancel), or Request a different date.
      </div>

      {/* Supplier responded to purchaser's date request */}
      {supplierResponded.length>0&&(
        <div className="card">
          <div className="ctitle"><Icon name="bell" size={14}/>Supplier responded to your date requests</div>
          {supplierResponded.map(req=>(
            <div key={req.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"rgba(254,205,69,0.04)",border:"1px solid rgba(254,205,69,0.15)",borderRadius:8,marginBottom:8,flexWrap:"wrap"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:"#FECD45"}}>{req.purchasingNo}</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:2}}>
                  Supplier: {req.supplier} · Requested date: <b style={{color:"#e2e8f0"}}>{req.requestedDate}</b>
                </div>
                <div style={{fontSize:11,marginTop:2,color:req.status==="supplier_approved"?"#22d3a0":"#f56565"}}>
                  {req.status==="supplier_approved"?"✓ Supplier APPROVED":"✗ Supplier DENIED — decide again"}
                </div>
              </div>
              {req.status==="supplier_approved"
                ?<button className="btn b-green btn-xs" onClick={()=>handleSupplierResponse(req,true)}>Apply Date</button>
                :<button className="btn b-gray btn-xs" onClick={()=>handleSupplierResponse(req,false)}>Acknowledge</button>
              }
            </div>
          ))}
        </div>
      )}

      {/* All ordered items — awaiting supplier confirmation */}
      <div className="card">
        <div className="ctitle"><Icon name="check" size={14}/>All Ordered Items
          <span className="sub">({allItems.length} total)</span>
        </div>
        {!allItems.length
          ? <div className="empty">No purchasing items yet. Complete the Ordering step first.</div>
          : <div className="tw"><table>
              {tableHead(true)}
              <tbody>
                {awaitingConf.length>0&&(
                  <tr><td colSpan={11} style={{padding:"8px 12px",fontSize:9,letterSpacing:"2px",textTransform:"uppercase",color:"#FECD45",background:"rgba(254,205,69,0.04)"}}>
                    Awaiting supplier confirmation — {awaitingConf.length}
                  </td></tr>
                )}
                {awaitingConf.map(item=><ItemRow key={item.id} item={item} showActions={true}/>)}

                {hasConf.length>0&&(
                  <tr><td colSpan={11} style={{padding:"8px 12px",fontSize:9,letterSpacing:"2px",textTransform:"uppercase",color:"#22d3a0",background:"rgba(34,211,160,0.04)"}}>
                    Supplier confirmed — {hasConf.length}
                  </td></tr>
                )}
                {hasConf.map(item=><ItemRow key={item.id} item={item} showActions={true}/>)}
              </tbody>
            </table></div>
        }
      </div>

      {/* Approved / confirmed section */}
      {confirmed.length>0&&(
        <div className="card">
          <div className="ctitle" style={{color:"#22d3a0"}}><Icon name="check" size={14}/>Approved Orders
            <span className="sub">({confirmed.length})</span>
          </div>
          <div className="tw"><table>
            {tableHead(false)}
            <tbody>{confirmed.map(item=><ItemRow key={item.id} item={item} showActions={false}/>)}</tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}

// ─── Step 7: Logistics ────────────────────────────────────────────────────────
function LogisticsView({ user, purchasingItems, pos, addNotif, loadAll }) {
  const [arriving, setArriving] = useState({});
  const [delivDate, setDelivDate] = useState({});

  const confirmedItems = purchasingItems.filter(i=>i.status==="confirmed"||i.status==="arrived");
  const markArrived = async (item) => {
    const date = delivDate[item.id]||today();
    setArriving(a=>({...a,[item.id]:true}));
    await sb.from("purchasing_items").update({status:"arrived",delivered_date:date}).eq("id",item.id);
    // Update BOM item status in parent PO
    const po = pos.find(p=>p.poNo===item.poNo);
    if (po) {
      const updatedItems = po.items.map(bi=>bi.drawingNumber===item.drawingNumber?{...bi,status:"arrived"}:bi);
      await sb.from("purchase_orders").update({items:updatedItems}).eq("id",po.id);
    }
    await addNotif("purchasing", `✓ ${item.drawingNumber} (${item.purchasingNo}) marked as ARRIVED by logistics.`);
    await addNotif("engineering", `✓ ${item.drawingNumber} has arrived — PO ${item.poNo} updated.`);
    setArriving(a=>({...a,[item.id]:false}));
    loadAll();
  };

  const handleInvoice = (itemId, file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = async e => {
      await sb.from("purchasing_items").update({invoice_attachment:{name:file.name,data:e.target.result}}).eq("id",itemId);
      loadAll();
    };
    r.readAsDataURL(file);
  };
  const handleAWB = (itemId, file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = async e => {
      await sb.from("purchasing_items").update({awb_attachment:{name:file.name,data:e.target.result}}).eq("id",itemId);
      loadAll();
    };
    r.readAsDataURL(file);
  };

  return (
    <div className="page">
      <FlowBanner active="s7" role={user?.role||""}/>
      <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800,marginBottom:6}}>Logistics — Arrivals</div>
      <div style={{color:"#475569",fontSize:12,marginBottom:22}}>Step ⑦ — Mark items as arrived, attach invoices and AWB documents.</div>
      <div className="card">
        <div className="ctitle"><Icon name="truck"/>Confirmed Orders <span className="sub">({confirmedItems.length})</span></div>
        {!confirmedItems.length?<div className="empty">No confirmed orders yet.</div>:(
          <div className="tw"><table>
            <thead><tr><th>Pur. #</th><th>PO #</th><th>Supplier</th><th>Drawing #</th><th>Description</th><th>Qty</th><th>Conf. Date</th><th>Actual Delivery</th><th>Invoice</th><th>AWB</th><th>Status</th></tr></thead>
            <tbody>{confirmedItems.map(item=>(
              <tr key={item.id}>
                <td style={{color:"#2568FB",fontWeight:600,fontSize:11}}>{item.purchasingNo}</td>
                <td style={{fontSize:11}}>{item.poNo}</td>
                <td><span className="badge byellow" style={{fontSize:9}}>{item.supplier}</span></td>
                <td>{item.drawingNumber||"—"}</td>
                <td style={{fontSize:11}}>{item.description||"—"}</td>
                <td style={{color:"#22d3a0",fontWeight:700}}>{item.neededQty}</td>
                <td style={{color:"#2568FB",fontSize:11}}>{item.supplierConfirmation||"—"}</td>
                <td>
                  {item.status==="arrived"
                    ?<span style={{color:"#22d3a0",fontSize:11,fontWeight:600}}>✓ {item.deliveredDate}</span>
                    :<div style={{display:"flex",gap:5,alignItems:"center"}}>
                      <input className="fi" type="date" style={{padding:"4px 6px",fontSize:11,width:130}} value={delivDate[item.id]||today()} onChange={e=>setDelivDate(d=>({...d,[item.id]:e.target.value}))}/>
                      <button className="btn b-green btn-xs" disabled={arriving[item.id]} onClick={()=>markArrived(item)}>Mark Arrived</button>
                    </div>
                  }
                </td>
                <td>
                  {item.invoiceAttachment
                    ?<a href={item.invoiceAttachment.data} download={item.invoiceAttachment.name} style={{color:"#2568FB",fontSize:11,textDecoration:"none"}}><Icon name="file" size={12}/> {item.invoiceAttachment.name.slice(0,12)}</a>
                    :<label style={{cursor:"pointer"}}><span className="btn b-gray btn-xs"><Icon name="clip" size={11}/>Attach</span><input type="file" style={{display:"none"}} accept=".pdf,.png,.jpg,.jpeg" onChange={e=>handleInvoice(item.id,e.target.files[0])}/></label>
                  }
                </td>
                <td>
                  {item.awbAttachment
                    ?<a href={item.awbAttachment.data} download={item.awbAttachment.name} style={{color:"#2568FB",fontSize:11,textDecoration:"none"}}><Icon name="file" size={12}/> {item.awbAttachment.name.slice(0,12)}</a>
                    :<label style={{cursor:"pointer"}}><span className="btn b-gray btn-xs"><Icon name="clip" size={11}/>Attach</span><input type="file" style={{display:"none"}} accept=".pdf,.png,.jpg,.jpeg" onChange={e=>handleAWB(item.id,e.target.files[0])}/></label>
                  }
                </td>
                <td><span className={`badge ${item.status==="arrived"?"bgreen":"byellow"}`}>{item.status==="arrived"?"Arrived":"Confirmed"}</span></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}

// ─── Supplier: Dashboard ──────────────────────────────────────────────────────
function SupDashboard({ user, purchasingItems, rfqHeaders, rfqItems, rfqResponses }) {
  const myItems = purchasingItems.filter(i=>i.supplier===user.supplier);
  const myRfqs = rfqHeaders.filter(h=>h.invitedSuppliers.includes(user.supplier));
  const pending = myItems.filter(i=>!i.supplierConfirmation).length;
  const confirmed = myItems.filter(i=>i.supplierConfirmation).length;
  const arrived = myItems.filter(i=>i.status==="arrived").length;
  return (
    <div className="page">
      <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800,marginBottom:6}}>Dashboard</div>
      <div style={{color:"#FECD45",fontSize:12,marginBottom:22}}>Supplier: {user.supplier}</div>
      <div className="sgrid">
        <div className="scard"><div className="sval" style={{color:"#FECD45"}}>{myRfqs.length}</div><div className="slbl">RFQ Requests</div></div>
        <div className="scard"><div className="sval" style={{color:"#2568FB"}}>{myItems.length}</div><div className="slbl">My Orders</div></div>
        <div className="scard"><div className="sval" style={{color:"#f56565"}}>{pending}</div><div className="slbl">Awaiting Confirmation</div></div>
        <div className="scard"><div className="sval" style={{color:"#22d3a0"}}>{confirmed}</div><div className="slbl">Confirmed</div></div>
        <div className="scard"><div className="sval" style={{color:"#2dd4bf"}}>{arrived}</div><div className="slbl">Arrived</div></div>
      </div>
      <div className="card">
        <div className="ctitle">Your Role</div>
        <div style={{fontSize:12,color:"#64748b",lineHeight:2}}>
          <b style={{color:"#FECD45"}}>RFQ Sheet</b> — Fill in your price table (1pc to 20+pcs) and estimated delivery date for each requested item.<br/>
          <b style={{color:"#FECD45"}}>My Orders</b> — View awarded/ordered items. Set your confirmation date. Update remarks. Attach invoice and AWB when item is delivered.
        </div>
      </div>
    </div>
  );
}

// ─── Supplier: RFQ Sheet (fixed price table) ──────────────────────────────────
function SupRFQSheet({ user, pos, addNotif, loadAll }) {
  // Read RFQ items from PO items where supplier is invited
  const myRfqItems = pos.flatMap(po=>
    (po.items||[])
      .filter(it=>{
        const sups = it.rfqSuppliers||[];
        return Array.isArray(sups) && sups.includes(user.supplier) && it.rfqId;
      })
      .map(it=>({...it, poNo:po.poNo, poId:po.id, neededQty:(it.qtyPc||1)*(po.poQty||1)}))
  );

  // Group by rfqId
  const myRfqGroups = Object.values(
    myRfqItems.reduce((acc,it)=>{
      if (!acc[it.rfqId]) acc[it.rfqId]={rfqId:it.rfqId, rfqNo:it.rfqNo||"RFQ", poNo:it.poNo, poId:it.poId, items:[]};
      acc[it.rfqId].items.push(it);
      return acc;
    },{})
  );

  const [selRfqId, setSelRfqId] = useState("");
  const [priceData, setPriceData] = useState({});
  const [etdData, setEtdData] = useState({});
  const [remarksData, setRemarksData] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [editMode, setEditMode] = useState({});

  const selGroup = myRfqGroups.find(g=>g.rfqId===selRfqId)||null;

  const setPrice = (itemId,qty,val) => setPriceData(d=>({...d,[itemId]:{...(d[itemId]||{}),[String(qty)]:val}}));
  const getPrice = (itemId,qty) => priceData[itemId]?.[String(qty)]||"";

  const loadForEdit = (bomItem) => {
    const existing = (bomItem.rfqResponse||{})[user.supplier];
    if (existing) {
      setPriceData(d=>({...d,[bomItem.id]:{...existing.priceBreaks}}));
      setEtdData(d=>({...d,[bomItem.id]:existing.etd||""}));
      setRemarksData(d=>({...d,[bomItem.id]:existing.remarks||""}));
    }
    setEditMode(e=>({...e,[bomItem.id]:true}));
  };

  const requestEdit = async (bomItem) => {
    const po = pos.find(p=>p.id===bomItem.poId);
    if (!po) return;
    const updatedItems = (po.items||[]).map(it=>
      it.id===bomItem.id
        ? {...it, rfqResponse:{...(it.rfqResponse||{}), [user.supplier]:{...(it.rfqResponse||{})[user.supplier], editRequest:{status:"pending",requestedAt:today()}}}}
        : it
    );
    await sb.from("purchase_orders").update({items:updatedItems}).eq("id",po.id);
    await addNotif("purchasing", `${user.supplier} is requesting to edit prices for ${bomItem.drawingNumber} (${selGroup?.rfqNo})`);
    loadAll();
  };

  const submitItem = async (bomItem) => {
    const breaks = priceData[bomItem.id]||{};
    if (!etdData[bomItem.id]) return alert("Set ETD date");
    setSubmitting(s=>({...s,[bomItem.id]:true}));
    const po = pos.find(p=>p.id===bomItem.poId);
    if (po) {
      const existing = (bomItem.rfqResponse||{})[user.supplier]||{};
      const updatedItems = (po.items||[]).map(it=>
        it.id===bomItem.id
          ? {...it, rfqResponse:{...(it.rfqResponse||{}), [user.supplier]:{
              priceBreaks:breaks,
              etd:etdData[bomItem.id]||"",
              remarks:remarksData[bomItem.id]||"",
              submittedAt:today(),
              editRequest:null, // clear edit request after saving
              editCount:(existing.editCount||0)+1
            }}}
          : it
      );
      await sb.from("purchase_orders").update({items:updatedItems}).eq("id",po.id);
    }
    await addNotif("purchasing", `${user.supplier} ${(bomItem.rfqResponse||{})[user.supplier]?"updated":"submitted"} prices for ${bomItem.drawingNumber} (${selGroup?.rfqNo})`);
    setSubmitting(s=>({...s,[bomItem.id]:false}));
    setEditMode(e=>({...e,[bomItem.id]:false}));
    loadAll();
  };

  const statusColor = { open:"#FECD45", awarded:"#22d3a0" };

  return (
    <div className="page">
      <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800,marginBottom:6}}>RFQ Sheet</div>
      <div style={{color:"#FECD45",fontSize:12,marginBottom:22}}>Supplier: <b>{user.supplier}</b> — Fill in price per quantity break + ETD</div>

      {!myRfqGroups.length
        ?<div className="card">
          <div className="empty">No RFQ requests yet.</div>
          <div style={{fontSize:10,color:"#334155",textAlign:"center",paddingBottom:16}}>
            Waiting for purchasing to send RFQ invitations to <b style={{color:"#FECD45"}}>{user.supplier}</b>
          </div>
        </div>
        :<div className="card">
          <div className="ctitle"><Icon name="rfq"/>My RFQ Invitations</div>
          <div className="tw"><table>
            <thead><tr><th>RFQ #</th><th>PO #</th><th>Items</th><th>My Responses</th><th>Status</th><th></th></tr></thead>
            <tbody>{myRfqGroups.map(g=>{
              const myR=g.items.filter(it=>(it.rfqResponse||{})[user.supplier]);
              const st=g.items.some(it=>it.rfqStatus==="awarded")?"awarded":"open";
              return(<tr key={g.rfqId}>
                <td style={{color:"#2dd4bf",fontWeight:600}}>{g.rfqNo}</td>
                <td style={{color:"#2568FB"}}>{g.poNo}</td>
                <td>{g.items.length}</td>
                <td><span style={{color:myR.length===g.items.length?"#22d3a0":"#FECD45",fontWeight:600}}>{myR.length}</span><span style={{color:"#475569",fontSize:10}}> / {g.items.length}</span></td>
                <td><span className="badge" style={{background:`${statusColor[st]}15`,color:statusColor[st],border:`1px solid ${statusColor[st]}33`}}>{st}</span></td>
                <td><button className="btn b-yellow btn-xs" onClick={()=>setSelRfqId(g.rfqId===selRfqId?"":g.rfqId)}>{g.rfqId===selRfqId?"Close":"Fill Prices"}</button></td>
              </tr>);
            })}</tbody>
          </table></div>
        </div>
      }

      {selGroup&&(
        <div className="card">
          <div className="ctitle"><Icon name="rfq"/>{selGroup.rfqNo} — Price Table</div>
          <div style={{fontSize:11,color:"#64748b",marginBottom:18}}>Fill in unit price (USD) for each quantity break. All columns required.</div>
          {selGroup.items.map(bomItem=>{
            const myResp=(bomItem.rfqResponse||{})[user.supplier];
            const submitted=!!myResp;
            const isEditing=!!editMode[bomItem.id];
            const isAwarded=bomItem.rfqStatus==="awarded";
            const iWon=bomItem.rfqWinner?.supplier===user.supplier;
            return(
              <div key={bomItem.id} style={{marginBottom:24,padding:"16px",background:"rgba(8,20,55,0.6)",borderRadius:10,border:`1px solid ${iWon?"rgba(34,211,160,0.3)":submitted?"rgba(37,104,251,0.25)":"rgba(148,163,184,0.09)"}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
                  <span style={{color:"#2568FB",fontWeight:700,fontSize:13}}>{bomItem.drawingNumber||"—"}</span>
                  <span style={{color:"#64748b",fontSize:11}}>{bomItem.description||bomItem.partNumber||"—"} · {bomItem.material||"—"}</span>
                  <span style={{color:"#22d3a0",fontSize:12,fontWeight:700,marginLeft:"auto"}}>Required: {bomItem.neededQty}</span>
                  {iWon&&<span className="badge bgreen" style={{fontSize:9}}>🏆 You won!</span>}
                  {submitted&&!iWon&&!isEditing&&<span className="badge bblue" style={{fontSize:9}}>✓ Submitted</span>}
                </div>

                {/* Show submitted response summary when not editing */}
                {submitted&&!isEditing&&(
                  <div style={{background:"rgba(37,104,251,0.06)",border:"1px solid rgba(37,104,251,0.15)",borderRadius:8,padding:"12px",marginBottom:12}}>
                    <div style={{fontSize:10,letterSpacing:"1px",textTransform:"uppercase",color:"#475569",marginBottom:8}}>Your submitted prices</div>
                    <div style={{overflowX:"auto",marginBottom:8}}>
                      <table className="rfq-price-table">
                        <thead><tr><th>Qty</th>{RFQ_QTYS.map(q=><th key={q}>{q}pc</th>)}</tr></thead>
                        <tbody><tr>
                          <td style={{color:"#64748b",fontSize:10}}>Price $</td>
                          {RFQ_QTYS.map(q=><td key={q} style={{color:"#22d3a0",fontWeight:600}}>{myResp.priceBreaks?.[String(q)]?`$${Number(myResp.priceBreaks[String(q)]).toFixed(2)}`:"—"}</td>)}
                        </tr></tbody>
                      </table>
                    </div>
                    <div style={{display:"flex",gap:16,fontSize:11,color:"#64748b",flexWrap:"wrap"}}>
                      <span>ETD: <b style={{color:"#2568FB"}}>{myResp.etd||"—"}</b></span>
                      {myResp.remarks&&<span>Remarks: <b style={{color:"#e2e8f0"}}>{myResp.remarks}</b></span>}
                      <span style={{marginLeft:"auto",fontSize:10,color:"#3d4f63"}}>Submitted: {myResp.submittedAt}</span>
                    </div>
                    {!isAwarded&&(()=>{
                      const editReq=myResp.editRequest;
                      if (editReq?.status==="pending") return <span className="badge byellow" style={{marginTop:10,display:"inline-flex"}}>Edit request pending approval…</span>;
                      if (editReq?.status==="denied") return <span className="badge bred" style={{marginTop:10,display:"inline-flex"}}>Edit request denied</span>;
                      if (editReq?.status==="approved") return <button className="btn b-yellow btn-xs" style={{marginTop:10}} onClick={()=>loadForEdit(bomItem)}><Icon name="edit" size={11}/>Edit Now (Approved)</button>;
                      // First time: can edit freely. After first submission, must request
                      if ((myResp.editCount||0)===0) return <button className="btn b-yellow btn-xs" style={{marginTop:10}} onClick={()=>loadForEdit(bomItem)}><Icon name="edit" size={11}/>Edit Response</button>;
                      return <button className="btn b-gray btn-xs" style={{marginTop:10}} onClick={()=>requestEdit(bomItem)}><Icon name="send" size={11}/>Request Edit Approval</button>;
                    })()}
                  </div>
                )}

                {/* Price input form */}
                {(!submitted||isEditing)&&(
                  <>
                    <div style={{overflowX:"auto",marginBottom:14}}>
                      <table className="rfq-price-table">
                        <thead><tr><th>Qty</th>{RFQ_QTYS.map(q=><th key={q}>{q}pc</th>)}</tr></thead>
                        <tbody><tr>
                          <td style={{color:"#64748b",fontSize:10,whiteSpace:"nowrap"}}>Unit Price $</td>
                          {RFQ_QTYS.map(q=>(
                            <td key={q}><input className="rfq-price-input" type="number" min="0" step="0.01" value={getPrice(bomItem.id,q)} onChange={e=>setPrice(bomItem.id,q,e.target.value)} placeholder="0.00"/></td>
                          ))}
                        </tr></tbody>
                      </table>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                      <div className="fgroup">
                        <label className="flabel">ETD *</label>
                        <input className="fi" type="date" value={etdData[bomItem.id]||""} onChange={e=>setEtdData(d=>({...d,[bomItem.id]:e.target.value}))}/>
                      </div>
                      <div className="fgroup">
                        <label className="flabel">Remarks</label>
                        <input className="fi" value={remarksData[bomItem.id]||""} onChange={e=>setRemarksData(d=>({...d,[bomItem.id]:e.target.value}))} placeholder="Lead time, conditions…"/>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                      {isEditing&&<button className="btn b-gray btn-xs" onClick={()=>setEditMode(e=>({...e,[bomItem.id]:false}))}>Cancel</button>}
                      <button className="btn b-green" disabled={submitting[bomItem.id]} onClick={()=>submitItem(bomItem)}>
                        <Icon name="send" size={13}/>{submitting[bomItem.id]?"Saving…":isEditing?"Save Changes":"Submit Prices"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Supplier: Order Sheet (Step 5) ───────────────────────────────────────────
function SupOrderSheet({ user, purchasingItems, confRequests, addNotif, loadAll }) {
  const myItems = purchasingItems.filter(i=>i.supplier===user.supplier&&!i.noPurchase&&i.status!=="cancelled");
  const [editConf, setEditConf] = useState({});
  const [confVal, setConfVal] = useState({});
  const [remarks, setRemarks] = useState({});
  const [saving, setSaving] = useState({});
  const [reqForm, setReqForm] = useState({});

  // Pending purchaser date requests to me
  const myDateRequests = confRequests.filter(r=>r.supplier===user.supplier&&r.status==="pending"&&r.type==="purchaser_request");

  const saveConf = async (item) => {
    const date = confVal[item.id];
    if (!date) return alert("Set confirmation date");
    setSaving(s=>({...s,[item.id]:true}));
    await sb.from("purchasing_items").update({supplier_confirmation:date,supplier_remarks:remarks[item.id]||item.supplierRemarks||"",supplier_confirmation_locked:false}).eq("id",item.id);
    await addNotif("purchasing",`${user.supplier} set confirmation for ${item.purchasingNo}: ${date}`);
    setEditConf(e=>({...e,[item.id]:false}));
    setSaving(s=>({...s,[item.id]:false}));
    loadAll();
  };

  const saveRemarks = async (item) => {
    await sb.from("purchasing_items").update({supplier_remarks:remarks[item.id]||""}).eq("id",item.id);
    loadAll();
  };

  const requestChange = async (item) => {
    const date = reqForm[item.id]?.date;
    const reason = reqForm[item.id]?.reason||"";
    if (!date) return alert("Enter new requested date");
    await sb.from("confirmation_requests").insert({ id:genId(), item_id:item.id, purchasing_no:item.purchasingNo, supplier:user.supplier, requested_date:date, reason, status:"pending", type:"supplier_change", created_at:today() });
    await addNotif("purchasing",`${user.supplier} requests confirmation change for ${item.purchasingNo}: ${date}`);
    setReqForm(f=>({...f,[item.id]:null}));
    loadAll();
  };

  const respondToDateRequest = async (req, approved) => {
    await sb.from("confirmation_requests").update({status:approved?"supplier_approved":"supplier_denied"}).eq("id",req.id);
    await addNotif("purchasing",`${user.supplier} ${approved?"APPROVED":"DENIED"} your date request for ${req.purchasingNo}`);
    loadAll();
  };

  const handleInvoice = (itemId, file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = async e => { await sb.from("purchasing_items").update({invoice_attachment:{name:file.name,data:e.target.result}}).eq("id",itemId); loadAll(); };
    r.readAsDataURL(file);
  };
  const handleAWB = (itemId, file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = async e => { await sb.from("purchasing_items").update({awb_attachment:{name:file.name,data:e.target.result}}).eq("id",itemId); loadAll(); };
    r.readAsDataURL(file);
  };

  const tm_colors = { Assy:"#2568FB", Stock:"#22d3a0", Reuse:"#a78bfa", Machining:"#fb923c" };

  return (
    <div className="page">
      <FlowBanner active="s5" role={user?.role||""}/>
      <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800,marginBottom:6}}>My Orders</div>
      <div style={{color:"#FECD45",fontSize:12,marginBottom:22}}>Supplier: {user.supplier}</div>

      {/* Purchaser date requests */}
      {myDateRequests.length>0&&(
        <div className="card">
          <div className="ctitle" style={{color:"#FECD45"}}><Icon name="bell"/>Purchasing is requesting a new delivery date</div>
          {myDateRequests.map(req=>(
            <div key={req.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"rgba(254,205,69,0.04)",border:"1px solid rgba(254,205,69,0.2)",borderRadius:8,marginBottom:8,flexWrap:"wrap"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:"#FECD45"}}>{req.purchasingNo}</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:2}}>Requested delivery date: <b style={{color:"#e2e8f0"}}>{req.requestedDate}</b></div>
                {req.reason&&<div style={{fontSize:11,color:"#64748b",marginTop:1}}>Reason: {req.reason}</div>}
              </div>
              <button className="btn b-green btn-xs" onClick={()=>respondToDateRequest(req,true)}><Icon name="check" size={11}/>Approve</button>
              <button className="btn b-red btn-xs" onClick={()=>respondToDateRequest(req,false)}><Icon name="x" size={11}/>Deny</button>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="ctitle"><Icon name="pkg"/>Ordered Items <span className="sub">({myItems.length})</span></div>
        {!myItems.length?<div className="empty">No orders assigned yet.</div>:(
          myItems.map(item=>{
            const tm=item.itemType?TYPE_META[item.itemType]:null;
            const hasConf=!!item.supplierConfirmation;
            const isEditing=editConf[item.id];
            const pendingChangeReq=confRequests.find(r=>r.itemId===item.id&&r.status==="pending"&&r.type==="supplier_change");
            const showReqForm=reqForm[item.id]!==undefined&&reqForm[item.id]!==null;
            return(
              <div key={item.id} style={{padding:"16px",background:"rgba(12,28,80,0.8)",border:"1px solid rgba(148,163,184,0.09)",borderRadius:10,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:14,flexWrap:"wrap"}}>
                  <div>
                    <div style={{color:"#2568FB",fontWeight:700,fontSize:13}}>{item.drawingNumber||"—"}</div>
                    <div style={{color:"#64748b",fontSize:11,marginTop:2}}>{item.purchasingNo} · PO {item.poNo}</div>
                    <div style={{color:"#64748b",fontSize:11,marginTop:1}}>{item.partNumber||""}{item.description?" · "+item.description:""}</div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                    {tm&&<span className="badge" style={{background:tm.bg,color:tm.color,border:`1px solid ${tm.border}`}}>{item.itemType}</span>}
                    {item.fromRfq&&<span className="badge bblue" style={{fontSize:8}}>FROM RFQ</span>}
                    <span style={{color:"#22d3a0",fontWeight:700,fontSize:12}}>Qty: {item.neededQty}</span>
                    <span className={`badge ${item.status==="arrived"?"bgreen":item.status==="confirmed"?"bteal":"byellow"}`}>{item.status}</span>
                  </div>
                </div>

                {/* Confirmation date */}
                <div style={{background:"rgba(10,16,30,0.5)",borderRadius:8,padding:"12px",marginBottom:12}}>
                  <div className="flabel" style={{marginBottom:8}}>Delivery Confirmation Date</div>
                  {hasConf&&!isEditing?(
                    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                      <span style={{color:"#22d3a0",fontWeight:700}}>{item.supplierConfirmation}</span>
                      {item.status!=="arrived"&&!pendingChangeReq&&<button className="btn b-yellow btn-xs" onClick={()=>setReqForm(f=>({...f,[item.id]:{date:"",reason:""}}))}>Request Change</button>}
                      {pendingChangeReq&&<span className="badge byellow" style={{fontSize:9}}>Change pending review</span>}
                    </div>
                  ):(
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      <input className="fi" type="date" style={{maxWidth:160}} value={confVal[item.id]||""} onChange={e=>setConfVal(v=>({...v,[item.id]:e.target.value}))}/>
                      <button className="btn b-green btn-xs" disabled={saving[item.id]} onClick={()=>saveConf(item)}><Icon name="check" size={11}/>{saving[item.id]?"Saving…":"Confirm"}</button>
                      {isEditing&&<button className="btn b-gray btn-xs" onClick={()=>setEditConf(e=>({...e,[item.id]:false}))}>Cancel</button>}
                    </div>
                  )}
                </div>

                {/* Request change form */}
                {showReqForm&&(
                  <div style={{background:"rgba(254,205,69,0.04)",border:"1px solid rgba(254,205,69,0.15)",borderRadius:8,padding:"12px",marginBottom:12}}>
                    <div className="flabel" style={{marginBottom:8,color:"#FECD45"}}>Request New Delivery Date</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <input className="fi" type="date" value={reqForm[item.id]?.date||""} onChange={e=>setReqForm(f=>({...f,[item.id]:{...f[item.id],date:e.target.value}}))} placeholder="New date"/>
                      <input className="fi" value={reqForm[item.id]?.reason||""} onChange={e=>setReqForm(f=>({...f,[item.id]:{...f[item.id],reason:e.target.value}}))} placeholder="Reason (optional)"/>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn b-yellow btn-xs" onClick={()=>requestChange(item)}>Submit Request</button>
                      <button className="btn b-gray btn-xs" onClick={()=>setReqForm(f=>({...f,[item.id]:null}))}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Remarks */}
                <div style={{marginBottom:12}}>
                  <div className="flabel" style={{marginBottom:6}}>Item Status Remarks</div>
                  <div style={{display:"flex",gap:8}}>
                    <input className="fi" value={remarks[item.id]!==undefined?remarks[item.id]:item.supplierRemarks||""} onChange={e=>setRemarks(r=>({...r,[item.id]:e.target.value}))} placeholder="Update item status, notes…"/>
                    <button className="btn b-blue btn-xs" onClick={()=>saveRemarks(item)}>Save</button>
                  </div>
                </div>

                {/* Actual delivery + attachments */}
                {item.status==="arrived"&&(
                  <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center",padding:"10px 12px",background:"rgba(34,211,160,0.04)",border:"1px solid rgba(34,211,160,0.15)",borderRadius:8}}>
                    <span style={{color:"#22d3a0",fontSize:12}}>✓ Arrived: {item.deliveredDate}</span>
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      <div>
                        <div className="flabel" style={{marginBottom:4}}>Invoice</div>
                        {item.invoiceAttachment
                          ?<a href={item.invoiceAttachment.data} download={item.invoiceAttachment.name} style={{color:"#2568FB",fontSize:11}}><Icon name="file" size={12}/> {item.invoiceAttachment.name.slice(0,14)}</a>
                          :<label style={{cursor:"pointer"}}><span className="btn b-gray btn-xs"><Icon name="clip" size={11}/>Attach Invoice</span><input type="file" style={{display:"none"}} accept=".pdf,.png,.jpg,.jpeg" onChange={e=>handleInvoice(item.id,e.target.files[0])}/></label>
                        }
                      </div>
                      <div>
                        <div className="flabel" style={{marginBottom:4}}>AWB</div>
                        {item.awbAttachment
                          ?<a href={item.awbAttachment.data} download={item.awbAttachment.name} style={{color:"#2568FB",fontSize:11}}><Icon name="file" size={12}/> {item.awbAttachment.name.slice(0,14)}</a>
                          :<label style={{cursor:"pointer"}}><span className="btn b-gray btn-xs"><Icon name="clip" size={11}/>Attach AWB</span><input type="file" style={{display:"none"}} accept=".pdf,.png,.jpg,.jpeg" onChange={e=>handleAWB(item.id,e.target.files[0])}/></label>
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
function NotificationsPage({ notifs, markNotifRead, markAllRead }) {
  const unreadIds = notifs.filter(n=>!n.read).map(n=>n.id);
  return (
    <div className="page">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
        <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800}}>Notifications</div>
        {unreadIds.length>0&&<button className="btn b-gray btn-sm" onClick={()=>markAllRead(unreadIds)}>Mark all read</button>}
      </div>
      <div className="card">
        {!notifs.length?<div className="empty">No notifications.</div>:notifs.map(n=>(
          <div key={n.id} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid rgba(148,163,184,0.05)"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:n.read?"#1e293b":"#f56565",marginTop:4,flexShrink:0,border:n.read?"1px solid #334155":"none"}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12.5,color:n.read?"#64748b":"#e2e8f0"}}>{n.msg}</div>
              <div style={{fontSize:10.5,color:"#3d4f63",marginTop:2}}>{n.date}</div>
            </div>
            {!n.read&&<button className="btn b-gray btn-xs" onClick={()=>markNotifRead(n.id)}>Dismiss</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Admin: All POs ───────────────────────────────────────────────────────────
function AdminPOs({ pos, purchasingItems, consolidatedItems, quotRows, addNotif, loadAll }) {
  const [editQty, setEditQty] = useState({});
  const [saving, setSaving] = useState({});
  const [sel, setSel] = useState(null);
  const saveQty = async (po) => {
    const qty = Number(editQty[po.id]);
    if (!qty||qty<1) return alert("Enter valid quantity");
    setSaving(s=>({...s,[po.id]:true}));
    await sb.from("purchase_orders").update({po_qty:qty}).eq("id",po.id);
    const rows = quotRows.filter(r=>r.poId===po.id);
    await Promise.all(rows.map(r=>sb.from("quotation_rows").update({needed_qty:(r.qtyPc||1)*qty}).eq("id",r.id)));
    await addNotif("purchasing",`Admin set PO Qty for ${po.poNo} → ${qty}. BOM triage can now begin.`);
    setSaving(s=>{const n={...s};delete n[po.id];return n;});
    setEditQty(e=>{const n={...e};delete n[po.id];return n;});
    loadAll();
  };
  return (
    <div className="page">
      <FlowBanner active="s2" role={user?.role||""}/>
      <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800,marginBottom:6}}>All POs <span style={{fontSize:13,color:"#3d4f63",fontWeight:400}}>(Admin)</span></div>
      <div style={{color:"#475569",fontSize:12,marginBottom:22}}>Step ② — Set PO Quantity for each order before purchasing can triage.</div>
      <div className="card">
        <div className="ctitle"><Icon name="po"/>Purchase Orders</div>
        <div className="tw"><table>
          <thead><tr><th>PO #</th><th>Assembly #</th><th>BOM Items</th><th>Status</th><th>Date</th><th style={{background:"rgba(167,139,250,0.05)",borderLeft:"2px solid rgba(167,139,250,0.2)"}}>② PO Quantity</th><th style={{background:"rgba(167,139,250,0.05)"}}>Set</th><th></th></tr></thead>
          <tbody>{pos.map(po=>{
            const hasQty=(po.poQty||1)>1;
            return(<tr key={po.id}>
              <td style={{color:"#2568FB",fontWeight:600}}>{po.poNo}</td>
              <td>{po.assemblyPartNo||"—"}</td>
              <td>{po.items.length}</td>
              <td><span className={`badge ${po.status==="pending"?"byellow":"bblue"}`}>{po.status}</span></td>
              <td style={{color:"#475569"}}>{po.createdAt}</td>
              <td style={{background:"rgba(167,139,250,0.03)",borderLeft:"2px solid rgba(167,139,250,0.15)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {hasQty&&<span style={{color:"#22d3a0",fontWeight:700,fontSize:14}}>{po.poQty}</span>}
                  {!hasQty&&<span className="badge byellow" style={{fontSize:8}}>Not set</span>}
                  <input className="fi-admin" type="number" min="1" style={{width:90,padding:"4px 8px",fontSize:11}} placeholder="Enter qty…" value={editQty[po.id]||""} onChange={e=>setEditQty(q=>({...q,[po.id]:e.target.value}))}/>
                </div>
              </td>
              <td style={{background:"rgba(167,139,250,0.03)"}}>
                {editQty[po.id]?<button className="btn b-purple btn-xs" disabled={saving[po.id]} onClick={()=>saveQty(po)}>{saving[po.id]?"…":<><Icon name="check" size={11}/>{hasQty?"Update":"Set"}</>}</button>:<span style={{color:"#1e3a5f",fontSize:10}}>—</span>}
              </td>
              <td>
                <div style={{display:"flex",gap:4}}>
                  <button className="btn b-blue btn-xs" onClick={()=>setSel(sel===po.id?null:po.id)}>BOM</button>
                  <button className="btn b-red btn-xs" onClick={async()=>{if(confirm("Delete PO "+po.poNo+"?"))await sb.from("purchase_orders").delete().eq("id",po.id);loadAll();}}><Icon name="trash" size={11}/></button>
                </div>
              </td>
            </tr>);
          })}</tbody>
        </table></div>
        {sel&&(()=>{const po=pos.find(p=>p.id===sel);return po?<div style={{marginTop:16}}><BOMModal po={po} onClose={()=>setSel(null)}/></div>:null;})()}
      </div>
      {purchasingItems.length>0&&(
        <div className="card">
          <div className="ctitle"><Icon name="cart"/>All Purchasing Items</div>
          <div className="tw"><table>
            <thead><tr><th>Pur. #</th><th>PO #</th><th>Type</th><th>Supplier</th><th>Drawing #</th><th>Qty</th><th>Price</th><th>Conf. Date</th><th>Status</th><th>Source</th></tr></thead>
            <tbody>{purchasingItems.map(i=>{
              const tm=i.itemType?TYPE_META[i.itemType]:null;
              return(<tr key={i.id}>
                <td style={{color:"#2568FB",fontSize:11}}>{i.purchasingNo}</td>
                <td style={{fontSize:11}}>{i.poNo}</td>
                <td>{tm?<span className="badge" style={{background:tm.bg,color:tm.color,border:`1px solid ${tm.border}`}}>{i.itemType}</span>:"—"}</td>
                <td><span className="badge byellow" style={{fontSize:9}}>{i.supplier||"—"}</span></td>
                <td>{i.drawingNumber||"—"}</td>
                <td style={{color:"#22d3a0",fontWeight:600}}>{i.neededQty}</td>
                <td>{i.price?`$${i.price}`:"—"}</td>
                <td style={{color:"#22d3a0",fontSize:11}}>{i.supplierConfirmation||"—"}</td>
                <td><span className={`badge ${i.status==="arrived"?"bgreen":i.status==="confirmed"?"bteal":i.status==="cancelled"?"bred":"byellow"}`}>{i.status}</span></td>
                <td>{i.fromRfq?<span className="badge bblue" style={{fontSize:8}}>RFQ</span>:"—"}</td>
              </tr>);
            })}</tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}

// ─── Admin Users ──────────────────────────────────────────────────────────────
function AdminUsers({ users, loadAll }) {
  const [show, setShow] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editBuf, setEditBuf] = useState({});
  const [form, setForm] = useState({ username:"", password:"", role:"engineering", name:"", supplier:"" });
  const deleteUser = async id => { if(!confirm("Delete?"))return; await sb.from("users").delete().eq("id",id); loadAll(); };
  const saveEdit = async () => {
    const update = { username:editBuf.username, name:editBuf.name, role:editBuf.role, supplier:editBuf.supplier||null };
    if (editBuf.password) update.password = editBuf.password;
    await sb.from("users").update(update).eq("id",editUser);
    setEditUser(null); loadAll();
  };
  const add = async () => {
    if (!form.username||!form.password||!form.name) return alert("Fill required fields");
    await sb.from("users").insert({ id:genId(), username:form.username, password:form.password, role:form.role, name:form.name, supplier:form.supplier||null });
    setShow(false); setForm({username:"",password:"",role:"engineering",name:"",supplier:""}); loadAll();
  };
  return (
    <div className="page">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
        <div style={{fontFamily:"Syne",fontSize:21,fontWeight:800}}>User Management</div>
        <button className="btn b-green" onClick={()=>setShow(true)}><Icon name="plus" size={13}/>New Account</button>
      </div>
      <div className="card">
        <div className="tw"><table>
          <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Supplier</th><th>Actions</th></tr></thead>
          <tbody>{users.map(u=>(
            <tr key={u.id}>
              <td style={{fontWeight:500}}>{u.name}</td>
              <td style={{color:"#475569"}}>{u.username}</td>
              <td><span className="badge" style={{background:ROLE_BG[u.role],color:ROLE_COLOR[u.role]}}>{u.role}</span></td>
              <td style={{fontSize:11}}>{u.supplier||"—"}</td>
              <td><div style={{display:"flex",gap:5}}>
                <button className="btn b-purple btn-xs" onClick={()=>{setEditUser(u.id);setEditBuf({username:u.username,password:"",name:u.name,role:u.role,supplier:u.supplier||""}); }}><Icon name="edit" size={11}/>Edit</button>
                {u.id!=="admin1"&&<button className="btn b-red btn-xs" onClick={()=>deleteUser(u.id)}><Icon name="trash" size={12}/></button>}
              </div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
      {editUser&&(
        <div className="moverlay" onClick={e=>e.target===e.currentTarget&&setEditUser(null)}>
          <div className="modal" style={{maxWidth:460}}>
            <button className="mclose" onClick={()=>setEditUser(null)}><Icon name="x"/></button>
            <div className="mtitle">Edit User</div>
            <div className="fgrid">
              <div className="fgroup"><label className="flabel">Full Name</label><input className="fi-admin" value={editBuf.name} onChange={e=>setEditBuf(b=>({...b,name:e.target.value}))}/></div>
              <div className="fgroup"><label className="flabel">Username</label><input className="fi-admin" value={editBuf.username} onChange={e=>setEditBuf(b=>({...b,username:e.target.value}))}/></div>
              <div className="fgroup"><label className="flabel">New Password</label><input className="fi-admin" type="password" value={editBuf.password} onChange={e=>setEditBuf(b=>({...b,password:e.target.value}))} placeholder="Leave blank to keep"/></div>
              <div className="fgroup"><label className="flabel">Role</label><select className="fi-admin" value={editBuf.role} onChange={e=>setEditBuf(b=>({...b,role:e.target.value}))}>{["engineering","purchasing","supplier","admin","logistics"].map(r=><option key={r}>{r}</option>)}</select></div>
              {editBuf.role==="supplier"&&<div className="fgroup"><label className="flabel">Supplier</label><select className="fi-admin" value={editBuf.supplier} onChange={e=>setEditBuf(b=>({...b,supplier:e.target.value}))}><option value="">Select…</option>{SUPPLIERS.map(s=><option key={s}>{s}</option>)}</select></div>}
            </div>
            <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}>
              <button className="btn b-gray" onClick={()=>setEditUser(null)}>Cancel</button>
              <button className="btn b-purple" onClick={saveEdit}><Icon name="check" size={13}/>Save</button>
            </div>
          </div>
        </div>
      )}
      {show&&(
        <div className="moverlay" onClick={e=>e.target===e.currentTarget&&setShow(false)}>
          <div className="modal" style={{maxWidth:460}}>
            <button className="mclose" onClick={()=>setShow(false)}><Icon name="x"/></button>
            <div className="mtitle">Create Account</div>
            <div className="fgrid">
              <div className="fgroup"><label className="flabel">Full Name *</label><input className="fi" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
              <div className="fgroup"><label className="flabel">Username *</label><input className="fi" value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))}/></div>
              <div className="fgroup"><label className="flabel">Password *</label><input className="fi" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/></div>
              <div className="fgroup"><label className="flabel">Role</label><select className="fi" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>{["engineering","purchasing","supplier","admin","logistics"].map(r=><option key={r}>{r}</option>)}</select></div>
              {form.role==="supplier"&&<div className="fgroup"><label className="flabel">Supplier</label><select className="fi" value={form.supplier} onChange={e=>setForm(f=>({...f,supplier:e.target.value}))}><option value="">Select…</option>{SUPPLIERS.map(s=><option key={s}>{s}</option>)}</select></div>}
            </div>
            <div style={{display:"flex",gap:8,marginTop:20,justifyContent:"flex-end"}}>
              <button className="btn b-gray" onClick={()=>setShow(false)}>Cancel</button>
              <button className="btn b-green" onClick={add}><Icon name="plus" size={13}/>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
