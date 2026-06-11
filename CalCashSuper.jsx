import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Home, Wallet, CreditCard, Utensils, TrendingUp, ShieldCheck,
  CheckCircle, XCircle, Clock, Camera, Bell, Target, DollarSign,
  Activity, Plus, Trash2, Copy, Sparkles, Lock, Settings, User,
  Key, Landmark, ArrowUpRight, ArrowDownLeft, Flame, ChevronRight,
  AlertTriangle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

// ============================================================
// CONSTANTS
// ============================================================
const ADMIN_PIN        = '140840';
const DEFAULT_USER_PIN = '000000';
const STORAGE_KEY      = 'calcash_super_v1';
const PROMPTPAY_NUMBER = '0822199910';
const ACCOUNT_NAME     = 'ภาณุวัฒน์ วันดี';
const INTEREST_RATE    = 20; // % per month flat

const THAI_BANKS = [
  { id:"KBANK", name:"กสิกรไทย",       color:"#00A950" },
  { id:"SCB",   name:"ไทยพาณิชย์",     color:"#4E2E7F" },
  { id:"BAY",   name:"กรุงศรีอยุธยา",  color:"#E8B800" },
  { id:"BBL",   name:"กรุงเทพ",        color:"#003399" },
  { id:"KTB",   name:"กรุงไทย",        color:"#00A2E5" },
  { id:"TTB",   name:"ทหารไทยธนชาต",  color:"#002D63" },
  { id:"GSB",   name:"ออมสิน",         color:"#EC068B" },
  { id:"BAAC",  name:"ธ.ก.ส.",         color:"#006432" },
  { id:"GHB",   name:"อาคารสงเคราะห์", color:"#F37021" },
  { id:"UOB",   name:"ยูโอบี",         color:"#003A70" },
  { id:"KKP",   name:"เกียรตินาคินภัทร",color:"#19335A"},
  { id:"TISCO", name:"ทิสโก้",         color:"#003399" },
  { id:"CIMBT", name:"ซีไอเอ็มบีไทย",  color:"#7C0010" },
  { id:"LH",    name:"แลนด์แอนด์เฮ้าส์",color:"#6C757D"},
  { id:"ICBC",  name:"ไอซีบีซี",       color:"#C8102E" },
  { id:"HSBC",  name:"ฮ่องกงและเซี่ยงไฮ้",color:"#DB0011"},
];

const FOOD_DB = {
  "🍚 ข้าวและอาหารหลัก": [
    {name:"ข้าวกะเพราหมู",cal:650},{name:"ข้าวมันไก่",cal:585},
    {name:"ผัดไทย",cal:550},{name:"ข้าวหมูกรอบ",cal:720},
    {name:"ข้าวสวย (ทัพพี)",cal:80},{name:"ข้าวผัด",cal:500},
    {name:"ก๋วยเตี๋ยวต้มยำ",cal:350},{name:"บะหมี่สำเร็จรูป",cal:350},
  ],
  "🍛 แกงและผัก": [
    {name:"แกงเขียวหวาน (ถ้วย)",cal:240},{name:"ต้มยำกุ้ง",cal:180},
    {name:"ส้มตำ",cal:120},{name:"ผัดกะเพรา (ทัพพี)",cal:180},
    {name:"แกงจืด (ถ้วย)",cal:80},{name:"ผักต้มผัด (ทัพพี)",cal:40},
  ],
  "🍎 ผลไม้": [
    {name:"กล้วยหอม",cal:90},{name:"แอปเปิล",cal:80},
    {name:"ทุเรียน (พู)",cal:160},{name:"มะม่วงสุก (พู)",cal:45},
    {name:"แตงโม (พู)",cal:25},{name:"มังคุด",cal:35},
  ],
  "☕ เครื่องดื่มร้อน": [
    {name:"ชาไทยร้อน",cal:120},{name:"กาแฟนมร้อน",cal:80},
    {name:"โกโก้ร้อน",cal:150},{name:"โอเลี้ยงร้อน",cal:60},
    {name:"กาแฟดำ (ไม่หวาน)",cal:5},{name:"ชาดำร้อน",cal:5},
  ],
  "🧊 เครื่องดื่มเย็น": [
    {name:"ชาไทยเย็น",cal:180},{name:"ชานมไข่มุก (เล็ก)",cal:250},
    {name:"ชานมไข่มุก (ใหญ่)",cal:400},{name:"กาแฟเย็น",cal:120},
    {name:"Coke (กระป๋อง)",cal:140},{name:"Coke Zero",cal:0},
    {name:"Pepsi",cal:150},{name:"M-150",cal:120},
    {name:"โออิชิชาเขียว",cal:90},{name:"น้ำมะพร้าว",cal:60},
    {name:"น้ำเปล่า",cal:0},{name:"สมูทตี้",cal:200},
  ],
  "🍰 ขนมและของว่าง": [
    {name:"เค้ก (ชิ้น)",cal:300},{name:"โดนัท",cal:250},
    {name:"ไก่ทอด",cal:220},{name:"ข้าวโพดต้ม",cal:130},
    {name:"ลูกชิ้นปิ้ง",cal:45},{name:"มันทอด (ทัพพี)",cal:200},
  ],
};

const MEALS = ["🌅 เช้า","☀️ กลางวัน","🌙 เย็น","🍎 ของว่าง"];
const INCOME_CATS  = ["💼 เงินเดือน","💰 ธุรกิจ","📈 ลงทุน","🎁 โบนัส","💸 รายได้พิเศษ","🏧 อื่น ๆ"];
const EXPENSE_CATS = ["🏠 ที่อยู่อาศัย","🍔 อาหาร","🚗 เดินทาง","💊 สุขภาพ","📚 การศึกษา","🛍️ ช้อปปิ้ง","💳 ชำระหนี้","🎮 บันเทิง","📦 อื่น ๆ"];
const LOAN_PURPOSES    = ["ชำระหนี้บัตรเครดิต","ทุนประกอบธุรกิจ","ค่าใช้จ่ายฉุกเฉิน","ปรับปรุงบ้าน","ค่าเล่าเรียน","อื่น ๆ"];
const LOAN_OCCUPATIONS = ["พนักงานบริษัทเอกชน","ข้าราชการ/รัฐวิสาหกิจ","ธุรกิจส่วนตัว","ฟรีแลนซ์","เกษตรกร","อื่น ๆ"];

// ============================================================
// STORAGE & HELPERS
// ============================================================
const db  = {
  get:  ()      => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } },
  set:  (patch) => { try { const d = db.get(); localStorage.setItem(STORAGE_KEY, JSON.stringify({...d,...patch})); } catch {} },
};
const fmt     = (n) => Number(n || 0).toLocaleString('th-TH');
const fmtM    = (n) => { const a=Math.abs(n); if(a>=1e6) return (n/1e6).toFixed(1)+'M'; if(a>=1e3) return (n/1e3).toFixed(1)+'K'; return fmt(n); };
const clamp   = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
const todayTH = () => new Date().toLocaleString('th-TH');

// ============================================================
// SHARED UI
// ============================================================
function Toast({ msg, color='#059669', onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed top-5 left-1/2 z-[999] -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-2xl"
      style={{ background: color, minWidth:220, textAlign:'center' }}>
      {msg}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, color='#059669') => {
    setToasts(t => [...t, { id: Date.now(), msg, color }]);
  }, []);
  const comp = (
    <>
      {toasts.map(t => (
        <Toast key={t.id} msg={t.msg} color={t.color} onDone={() => setToasts(ts => ts.filter(x => x.id !== t.id))}/>
      ))}
    </>
  );
  return [show, comp];
}

function Card({ children, className='', style={} }) {
  return <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm ${className}`} style={style}>{children}</div>;
}

const INP = "w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-3 text-sm outline-none focus:border-emerald-400 text-gray-700";

// progress bar component
function Progress({ pct, color='#10B981', height=10 }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ background:'#E2E8F0', height }}>
      <div className="rounded-full transition-all duration-700" style={{ width:`${clamp(pct,0,100)}%`, height, background:color }}/>
    </div>
  );
}

// ============================================================
// PIN UI
// ============================================================
function PinDots({ value, shake, error }) {
  return (
    <div className={`flex gap-3 justify-center transition-all ${shake ? 'scale-105' : ''}`}>
      {[0,1,2,3,4,5].map(i => (
        <div key={i} className="w-4 h-4 rounded-full border-2 transition-all"
          style={{ borderColor: i<value.length?(error?'#EF4444':'#10B981'):'#334155', background:i<value.length?(error?'#EF4444':'#10B981'):'transparent' }}/>
      ))}
    </div>
  );
}
function Keypad({ onTap, onDel }) {
  const keys = ['1','2','3','4','5','6','7','8','9','','0','X'];
  return (
    <div className="grid grid-cols-3 gap-3 w-72 mx-auto">
      {keys.map((k,i) => k===''?<div key={i}/>:(
        <button key={i} onClick={()=>k==='X'?onDel():onTap(k)}
          className="h-14 rounded-2xl font-bold text-xl transition active:scale-90"
          style={{ background:k==='X'?'rgba(239,68,68,0.15)':'rgba(255,255,255,0.08)', color:k==='X'?'#F87171':'#F1F5F9', border:'1px solid rgba(255,255,255,0.1)' }}>
          {k==='X'?'⌫':k}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// PIN LOGIN
// ============================================================
function PinLoginScreen({ onSuccess }) {
  const [pin,   setPin]   = useState('');
  const [shake, setShake] = useState(false);
  const [tries, setTries] = useState(0);
  const attempt = useCallback((p) => {
    const stored  = db.get();
    const userPin = stored.userPin || DEFAULT_USER_PIN;
    if (p===ADMIN_PIN) { onSuccess('admin'); return; }
    if (p===userPin)   { onSuccess('user');  return; }
    setShake(true); setTries(t=>t+1);
    setTimeout(() => { setShake(false); setPin(''); }, 700);
  }, [onSuccess]);
  useEffect(() => { if (pin.length===6) attempt(pin); }, [pin, attempt]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background:'linear-gradient(160deg,#0A0F1E 0%,#0D2137 100%)' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;font-family:'Inter',sans-serif}`}</style>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{ background:'linear-gradient(135deg,#10B981,#059669)' }}>
        <ShieldCheck size={36} color="white"/>
      </div>
      <h1 className="text-4xl font-black text-white mb-1 tracking-tight">Cal & Cash</h1>
      <p className="text-slate-500 text-sm mb-10">Super App · Finance & Health</p>
      <PinDots value={pin} shake={shake} error={shake}/>
      <p className="text-slate-600 text-xs mt-3 mb-8">{tries>0?`PIN ไม่ถูกต้อง (${tries}/3)`:'กรอกรหัส PIN 6 หลัก'}</p>
      <Keypad onTap={d=>setPin(p=>p.length<6?p+d:p)} onDel={()=>setPin(p=>p.slice(0,-1))}/>
      <p className="text-slate-700 text-xs mt-8">PIN เริ่มต้น: {DEFAULT_USER_PIN}</p>
    </div>
  );
}

// ============================================================
// CHANGE PIN
// ============================================================
function ChangePinScreen({ role, onDone, onBack }) {
  const [step,    setStep]    = useState('verify');
  const [verify,  setVerify]  = useState('');
  const [newPin,  setNewPin]  = useState('');
  const [confirm, setConfirm] = useState('');
  const [shake,   setShake]   = useState(false);
  const [err,     setErr]     = useState('');
  const userPin = db.get().userPin || DEFAULT_USER_PIN;
  const fail = (msg, setter) => { setShake(true); setErr(msg); setTimeout(()=>{ setShake(false); setErr(''); setter(''); },800); };
  const doVerify  = useCallback((p) => { if(p===(role==='admin'?ADMIN_PIN:userPin)){setStep('newpin');return;} fail('PIN ปัจจุบันไม่ถูกต้อง',setVerify); },[role,userPin]);
  const doNew     = useCallback((p) => { if(p===ADMIN_PIN&&role!=='admin'){fail('ไม่สามารถใช้ PIN นี้ได้',setNewPin);return;} setStep('confirm'); },[role]);
  const doConfirm = useCallback((p) => { if(p!==newPin){fail('PIN ไม่ตรงกัน',setConfirm);return;} db.set({userPin:newPin}); onDone(); },[newPin,onDone]);
  useEffect(()=>{ if(verify.length===6)  doVerify(verify);  },[verify,  doVerify]);
  useEffect(()=>{ if(newPin.length===6)  doNew(newPin);     },[newPin,  doNew]);
  useEffect(()=>{ if(confirm.length===6) doConfirm(confirm); },[confirm, doConfirm]);
  const labels = {verify:'ยืนยัน PIN ปัจจุบัน',newpin:'ตั้ง PIN ใหม่',confirm:'ยืนยัน PIN ใหม่อีกครั้ง'};
  const cur    = {verify,newpin:newPin,confirm}[step];
  const set    = {verify:setVerify,newpin:setNewPin,confirm:setConfirm};
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{background:'linear-gradient(160deg,#0A0F1E 0%,#0D2137 100%)'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;font-family:'Inter',sans-serif}`}</style>
      <h2 className="text-2xl font-black text-white mb-1">🔐 เปลี่ยน PIN</h2>
      <p className="text-slate-500 text-sm mb-8">{labels[step]}</p>
      <PinDots value={cur} shake={shake} error={shake}/>
      {err && <p className="text-red-400 text-xs mt-3">{err}</p>}
      <div className="mt-8"><Keypad onTap={d=>set[step](p=>p.length<6?p+d:p)} onDel={()=>set[step](p=>p.slice(0,-1))}/></div>
      <button onClick={onBack} className="text-slate-500 text-sm mt-8">← กลับ</button>
    </div>
  );
}

// ============================================================
// ADMIN OVERLAY
// ============================================================
function AdminOverlay({ onBack, onSuccess }) {
  const [pin,shake]=[useState(''),useState(false)];
  const setPin=pin[1]; const p=pin[0];
  const setShake=shake[1]; const sh=shake[0];
  useEffect(() => {
    if (p.length!==6) return;
    if (p===ADMIN_PIN){onSuccess();return;}
    setShake(true); setTimeout(()=>{ setShake(false); setPin(''); },700);
  },[p,onSuccess]);
  return (
    <div className="fixed inset-0 z-[900] flex flex-col items-center justify-center p-6" style={{background:'rgba(0,0,0,0.95)'}}>
      <p className="text-white font-black text-xl mb-2">Admin Login</p>
      <p className="text-slate-500 text-xs mb-8">รหัส Admin 6 หลัก</p>
      <PinDots value={p} shake={sh} error={sh}/>
      <div className="mt-8"><Keypad onTap={d=>setPin(x=>x.length<6?x+d:x)} onDel={()=>setPin(x=>x.slice(0,-1))}/></div>
      <button onClick={onBack} className="text-slate-500 text-sm mt-8">← กลับ</button>
    </div>
  );
}

// ============================================================
// BOTTOM NAV
// ============================================================
function BottomNav({ tab, setTab, isAdmin }) {
  const base = [
    {id:'home',  icon:<Home size={19}/>,       label:'หน้าแรก'},
    {id:'debt',  icon:<CreditCard size={19}/>, label:'สินเชื่อ'},
    {id:'money', icon:<Wallet size={19}/>,     label:'รายรับ-จ่าย'},
    {id:'food',  icon:<Utensils size={19}/>,   label:'แคลอรี'},
    {id:'settings',icon:<Settings size={19}/>,label:'ตั้งค่า'},
  ];
  const items = isAdmin ? [...base, {id:'admin',icon:<Lock size={19}/>,label:'Admin'}] : base;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100"
      style={{paddingBottom:'env(safe-area-inset-bottom,0px)'}}>
      <div className="flex max-w-2xl mx-auto overflow-x-auto">
        {items.map(it=>(
          <button key={it.id} onClick={()=>setTab(it.id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 min-w-0 transition"
            style={{color:tab===it.id?'#10B981':'#94A3B8'}}>
            <span style={{transform:tab===it.id?'scale(1.1)':'scale(1)',transition:'transform .15s'}}>{it.icon}</span>
            <span className="text-[9px] font-bold whitespace-nowrap">{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ============================================================
// HOME SCREEN
// ============================================================
function HomeScreen({ user, loans, txns, foods, debtPayments, setTab }) {
  const myApp      = loans.find(l=>l.userId===user.name);
  const loanAmount = myApp?.amount || 0;
  const interest   = Math.round(loanAmount * INTEREST_RATE / 100);
  const totalDebt  = loanAmount + interest;
  const paidAmount = (debtPayments[myApp?.id] || 0);
  const remaining  = Math.max(0, totalDebt - paidAmount);
  const debtPct    = totalDebt > 0 ? Math.round(paidAmount/totalDebt*100) : 0;
  const totalIn    = txns.filter(t=>t.type==='income').reduce((a,t)=>a+t.amount,0);
  const totalOut   = txns.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0);
  const balance    = totalIn - totalOut;
  const totalCal   = foods.reduce((a,f)=>a+f.cal,0);
  const targetCal  = user.targetCal || 2000;
  const calPct     = clamp(Math.round(totalCal/targetCal*100),0,100);

  // Risk engine
  const risk = totalIn === 0 ? 0 :
    totalOut > totalIn ? 80 :
    debtPct < 30 && totalDebt > 0 ? 55 :
    totalOut / totalIn > 0.7 ? 45 : 20;
  const riskLabel = risk >= 70 ? 'สูงมาก' : risk >= 50 ? 'สูง' : risk >= 35 ? 'ปานกลาง' : 'ต่ำ';
  const riskColor = risk >= 70 ? '#DC2626' : risk >= 50 ? '#F97316' : risk >= 35 ? '#EAB308' : '#059669';

  // Chart data
  const lineData = txns.slice(0,12).reverse().map((t,i) => ({
    name: i+1,
    value: t.amount,
    type: t.type,
  }));
  const pieData = [
    { name: 'รายรับ', value: totalIn   },
    { name: 'รายจ่าย', value: totalOut },
  ].filter(d => d.value > 0);
  const PIE_COLORS = ['#10B981','#EF4444'];

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="rounded-3xl p-6 text-white" style={{background:'linear-gradient(135deg,#064E3B,#10B981)'}}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest">ยินดีต้อนรับ</p>
            <p className="text-2xl font-black mt-0.5">{user.name}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/20">
            {user.img?<img src={user.img} className="w-full h-full object-cover" alt="avatar"/>
              :<div className="w-full h-full flex items-center justify-center"><User size={22} color="white"/></div>}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/20">
          <div><p className="text-[10px] opacity-60">ยอดสุทธิ</p><p className="text-lg font-black">{balance>=0?'+':''}{fmtM(balance)}</p></div>
          <div><p className="text-[10px] opacity-60">หนี้คงเหลือ</p><p className="text-lg font-black text-orange-300">{remaining>0?`฿${fmtM(remaining)}`:`หมด`}</p></div>
          <div><p className="text-[10px] opacity-60">แคลอรี</p><p className="text-lg font-black">{fmt(totalCal)} kcal</p></div>
        </div>
      </div>

      {/* Quick cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 cursor-pointer active:scale-95 transition" onClick={()=>setTab('money')}>
          <Wallet size={20} style={{color:'#10B981',marginBottom:8}}/>
          <p className="text-[10px] font-bold text-gray-400 uppercase">เงินคงเหลือ</p>
          <p className="text-xl font-black mt-1" style={{color:balance>=0?'#059669':'#DC2626'}}>{balance>=0?'+':''}{fmtM(balance)}</p>
        </Card>
        <Card className="p-4 cursor-pointer active:scale-95 transition" onClick={()=>setTab('debt')}>
          <CreditCard size={20} style={{color:'#F97316',marginBottom:8}}/>
          <p className="text-[10px] font-bold text-gray-400 uppercase">หนี้คงเหลือ</p>
          <p className="text-xl font-black mt-1 text-orange-500">{remaining>0?`฿${fmtM(remaining)}`:`ไม่มีหนี้ 🎉`}</p>
        </Card>
      </div>

      {/* Risk Meter */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} style={{color:riskColor}}/>
            <span className="text-sm font-black text-slate-700">ระดับความเสี่ยงทางการเงิน</span>
          </div>
          <span className="text-sm font-black px-2.5 py-1 rounded-xl"
            style={{background:riskColor+'20', color:riskColor}}>
            {riskLabel} ({risk})
          </span>
        </div>
        <Progress pct={risk} color={riskColor} height={10}/>
        <p className="text-[10px] text-slate-400 mt-1.5">
          {risk>=70?'รายจ่ายเกินรายรับ — ควรลดค่าใช้จ่ายด่วน':risk>=50?'มีความเสี่ยง — ตรวจสอบรายจ่าย':risk>=35?'ระมัดระวังพอสมควร':'การเงินอยู่ในเกณฑ์ดี ✓'}
        </p>
      </Card>

      {/* Dashboard Stats */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-2xl p-3 text-center" style={{background:'#F0FDF4'}}>
            <p className="text-[9px] font-bold text-gray-400 uppercase">รายรับ</p>
            <p className="text-sm font-black" style={{color:'#059669'}}>+{fmtM(totalIn)}</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{background:'#FFF5F5'}}>
            <p className="text-[9px] font-bold text-gray-400 uppercase">รายจ่าย</p>
            <p className="text-sm font-black" style={{color:'#DC2626'}}>-{fmtM(totalOut)}</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{background:riskColor+'15'}}>
            <p className="text-[9px] font-bold text-gray-400 uppercase">ความเสี่ยง</p>
            <p className="text-sm font-black" style={{color:riskColor}}>{risk}/100</p>
          </div>
        </div>

        {/* Line Chart */}
        {lineData.length > 1 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">รายการล่าสุด</p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={lineData}>
                <XAxis dataKey="name" tick={{fontSize:10}} />
                <YAxis tick={{fontSize:10}} width={40}/>
                <Tooltip
                  formatter={(v,n,p) => [`฿${fmt(v)}`, p.payload.type==='income'?'รายรับ':'รายจ่าย']}
                  contentStyle={{borderRadius:12,fontSize:12}}
                />
                <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} dot={{r:3,fill:'#10B981'}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">สัดส่วนรายรับ-จ่าย</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={(v) => `฿${fmt(v)}`} contentStyle={{borderRadius:12,fontSize:12}}/>
                <Legend iconType="circle" iconSize={10} formatter={(v)=><span style={{fontSize:11}}>{v}</span>}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Debt progress */}
      {myApp && (
        <Card className="p-5">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-slate-700">ความคืบหน้าชำระหนี้</span>
            <span className="text-sm font-black" style={{color:'#10B981'}}>{debtPct}%</span>
          </div>
          <Progress pct={debtPct} color="#10B981"/>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-400">ชำระแล้ว ฿{fmt(paidAmount)}</span>
            <span className="text-xs text-slate-400">รวม ฿{fmt(totalDebt)}</span>
          </div>
        </Card>
      )}

      {/* Calorie */}
      <Card className="p-5 cursor-pointer active:scale-95 transition" onClick={()=>setTab('food')}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2"><Flame size={16} style={{color:'#F97316'}}/><span className="text-sm font-black text-slate-700">แคลอรีวันนี้</span></div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-xl" style={{background:calPct>=100?'#FFF5F5':'#ECFDF5',color:calPct>=100?'#DC2626':'#059669'}}>{calPct}%</span>
        </div>
        <Progress pct={calPct} color={calPct>=100?'#EF4444':'#10B981'}/>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs font-bold" style={{color:'#10B981'}}>{fmt(totalCal)} kcal</span>
          <span className="text-xs text-slate-400">เป้า {fmt(targetCal)} kcal</span>
        </div>
      </Card>

      {/* AI Life Insight */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today Insight</p>
            <h3 className="text-sm font-black text-slate-800 mt-0.5">📊 AI วิเคราะห์พฤติกรรมวันนี้</h3>
          </div>
          <span className="text-lg">🤖</span>
        </div>
        <div className="space-y-2">
          {risk >= 70 && (
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{background:'#FFF5F5'}}>
              <span className="text-sm flex-shrink-0">⚠️</span>
              <p className="text-xs font-semibold text-red-700">คุณมีความเสี่ยงใช้เงินเกินปกติ ควรทบทวนรายจ่าย</p>
            </div>
          )}
          {risk >= 50 && risk < 70 && (
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{background:'#FFF7ED'}}>
              <span className="text-sm flex-shrink-0">🟠</span>
              <p className="text-xs font-semibold text-orange-700">รายจ่ายค่อนข้างสูง ลองวางแผนลดค่าใช้จ่ายที่ไม่จำเป็น</p>
            </div>
          )}
          {myApp && debtPct < 30 && (
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{background:'#FFFBEB'}}>
              <span className="text-sm flex-shrink-0">🧾</span>
              <p className="text-xs font-semibold text-amber-700">หนี้ยังชำระได้น้อย ({debtPct}%) — ควรเร่งจัดการก่อนดอกเบี้ยพอกพูน</p>
            </div>
          )}
          {totalCal > targetCal && (
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{background:'#FFF5F5'}}>
              <span className="text-sm flex-shrink-0">🍽️</span>
              <p className="text-xs font-semibold text-red-700">แคลอรีวันนี้เกินเป้าหมาย {fmt(totalCal - targetCal)} kcal</p>
            </div>
          )}
          {calPct >= 80 && calPct < 100 && (
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{background:'#FFFBEB'}}>
              <span className="text-sm flex-shrink-0">🔔</span>
              <p className="text-xs font-semibold text-amber-700">ใกล้ถึงเป้าแคลอรีแล้ว — ระวังของว่างช่วงเย็น</p>
            </div>
          )}
          {risk <= 30 && totalCal <= targetCal && (!myApp || debtPct >= 30) && (
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{background:'#F0FDF4'}}>
              <span className="text-sm flex-shrink-0">🟢</span>
              <p className="text-xs font-semibold text-emerald-700">พฤติกรรมวันนี้อยู่ในเกณฑ์ดี ทั้งการเงินและสุขภาพ ✓</p>
            </div>
          )}
          {txns.length === 0 && foods.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">เริ่มบันทึกข้อมูลเพื่อรับ Insight จาก AI</p>
          )}
        </div>
      </Card>

      {/* PromptPay */}
      <Card className="p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">ข้อมูลชำระเงิน</p>
        <div className="rounded-2xl p-4 text-white" style={{background:'linear-gradient(135deg,#0F2640,#1E3A5F)'}}>
          <p className="text-xs opacity-50 mb-0.5 uppercase tracking-wider">พร้อมเพย์</p>
          <p className="text-2xl font-black tracking-wider">{PROMPTPAY_NUMBER}</p>
          <div className="border-t border-white/10 mt-3 pt-3">
            <p className="text-xs opacity-50 mb-0.5">ชื่อบัญชี</p>
            <p className="font-black">{ACCOUNT_NAME}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
// ============================================================
// DEBT SCREEN — Multi-debt manager + Loan application
// ============================================================
function DebtScreen({ user, loans, setLoans, debtPayments, setDebtPayments, toast }) {
  const myApp = loans.find(l => l.userId === user.name);

  // ── Local debt tracker (independent from loan application) ──
  const [debts,         setDebts]         = useState(() => { try { return JSON.parse(localStorage.getItem('calcash_localDebts')||'[]'); } catch { return []; } });
  const [debtName,      setDebtName]      = useState('');
  const [debtAmount,    setDebtAmount]    = useState('');
  const [paymentInputs, setPaymentInputs] = useState({});

  const saveDebts = (d) => { setDebts(d); try { localStorage.setItem('calcash_localDebts', JSON.stringify(d)); } catch {} };

  const addDebt = () => {
    if (!debtName.trim() || !debtAmount || +debtAmount <= 0) { toast('กรอกชื่อและจำนวนหนี้ด้วย', '#DC2626'); return; }
    const nd = { id: Date.now(), name: debtName.trim(), total: +debtAmount, paid: 0 };
    saveDebts([...debts, nd]);
    setDebtName(''); setDebtAmount('');
    toast(`เพิ่มหนี้ "${nd.name}" แล้ว ✓`);
  };

  const payDebt = (id) => {
    const amt = +(paymentInputs[id] || 0);
    if (!amt || amt <= 0) { toast('กรอกยอดชำระด้วย', '#DC2626'); return; }
    const updated = debts.map(d => d.id === id
      ? { ...d, paid: Math.min(d.paid + amt, d.total) }
      : d
    );
    saveDebts(updated);
    setPaymentInputs(p => ({ ...p, [id]: '' }));
    toast(`ชำระ ฿${fmt(amt)} สำเร็จ ✓`);
  };

  const removeDebt = (id) => { saveDebts(debts.filter(d => d.id !== id)); };

  const debtTotal    = debts.reduce((a, d) => a + d.total, 0);
  const debtPaidSum  = debts.reduce((a, d) => a + d.paid,  0);
  const overallPct   = debtTotal > 0 ? Math.round(debtPaidSum / debtTotal * 100) : 0;

  // ── Loan application states ──
  const [showForm,   setShowForm]   = useState(false);
  const [loanName,   setLoanName]   = useState('');
  const [loanPmtInputs, setLoanPmtInputs] = useState({});
  const [form, setForm] = useState({ amount:'', bank:'KBANK', purpose:'', occupation:'', income:'', phone:'', idcard:'' });
  const sf = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const loanAmount = myApp?.amount || 0;
  const interest   = Math.round(loanAmount * INTEREST_RATE / 100);
  const totalLoan  = loanAmount + interest;
  const loanPaid   = debtPayments[myApp?.id] || 0;
  const loanRem    = Math.max(0, totalLoan - loanPaid);
  const loanPct    = totalLoan > 0 ? Math.round(loanPaid / totalLoan * 100) : 0;

  const copy = () => { navigator.clipboard.writeText(PROMPTPAY_NUMBER).catch(() => {}); toast('คัดลอกเลขพร้อมเพย์แล้ว ✓'); };

  const submitLoan = (e) => {
    e.preventDefault();
    const bank = THAI_BANKS.find(b => b.id === form.bank) || THAI_BANKS[0];
    const app = {
      id: Date.now(), userId: user.name, userName: user.name, userImg: user.img || null,
      debtName: loanName.trim() || null,
      amount: +form.amount, bankId: form.bank, bankName: bank.name,
      purpose: form.purpose, occupation: form.occupation, income: +form.income,
      phone: form.phone, idcard: form.idcard,
      interest: Math.round(+form.amount * INTEREST_RATE / 100),
      total: +form.amount + Math.round(+form.amount * INTEREST_RATE / 100),
      status: 'pending', submittedAt: todayTH(),
    };
    const up = [...loans, app];
    setLoans(up); db.set({ loans: up }); setShowForm(false); toast('ส่งใบสมัครสินเชื่อแล้ว ✓');
  };

  const sc = (s) => s==='approved'?'#059669':s==='rejected'?'#DC2626':'#D97706';
  const sb = (s) => s==='approved'?'#ECFDF5':s==='rejected'?'#FEF2F2':'#FFFBEB';
  const si = (s) => s==='approved'?<CheckCircle size={44} style={{color:'#059669'}}/>:s==='rejected'?<XCircle size={44} style={{color:'#DC2626'}}/>:<Clock size={44} style={{color:'#D97706'}}/>;
  const sl = (s) => s==='approved'?'🎉 อนุมัติแล้ว!':s==='rejected'?'ไม่ผ่านการอนุมัติ':'รอการพิจารณา 1–3 วัน';

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-black text-slate-900">🧾 ระบบหนี้</h2>

      {/* ── OVERALL SUMMARY ── */}
      {debts.length > 0 && (
        <Card className="p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-black text-slate-700">ภาพรวมหนี้ทั้งหมด</span>
            <span className="text-sm font-black" style={{color: overallPct>=100?'#059669':'#F97316'}}>{overallPct}%</span>
          </div>
          <Progress pct={overallPct} color={overallPct>=100?'#10B981':'#F97316'} height={10}/>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-400">ชำระแล้ว ฿{fmt(debtPaidSum)}</span>
            <span className="text-xs text-slate-400">รวม ฿{fmt(debtTotal)}</span>
          </div>
        </Card>
      )}

      {/* ── ADD DEBT ── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-slate-800">➕ เพิ่มรายการหนี้</h3>
          <span className="text-xs text-slate-400">Debt Manager</span>
        </div>
        <div className="space-y-2.5">
          <input
            value={debtName}
            onChange={e => setDebtName(e.target.value)}
            placeholder="ชื่อหนี้ เช่น บัตรเครดิต KTC, ผ่อนรถ"
            className={INP}
          />
          <input
            type="number"
            value={debtAmount}
            onChange={e => setDebtAmount(e.target.value)}
            placeholder="จำนวนหนี้ (บาท)"
            className={INP}
          />
          <button onClick={addDebt}
            className="w-full py-3 rounded-2xl font-black text-white active:scale-95 transition"
            style={{background:'linear-gradient(90deg,#F97316,#EA580C)'}}>
            ➕ เพิ่มหนี้
          </button>
        </div>
      </Card>

      {/* ── DEBT LIST ── */}
      {debts.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-sm text-gray-400">ยังไม่มีรายการหนี้สิน</p>
        </Card>
      ) : debts.map(d => {
        const pct = d.total > 0 ? (d.paid / d.total) * 100 : 0;
        return (
          <Card key={d.id} className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-black text-slate-800">{d.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">ชำระแล้ว ฿{fmt(d.paid)} / ฿{fmt(d.total)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xl font-black" style={{color:pct>=100?'#059669':'#F97316'}}>
                  {pct.toFixed(1)}%
                </span>
                <button onClick={() => removeDebt(d.id)} className="text-gray-300 active:text-red-400">
                  <Trash2 size={15}/>
                </button>
              </div>
            </div>
            <Progress pct={pct} color={pct>=100?'#10B981':'#F97316'} height={10}/>
            {pct < 100 && (
              <div className="flex gap-2 mt-3">
                <input
                  type="number"
                  placeholder="ยอดชำระ"
                  value={paymentInputs[d.id] || ''}
                  onChange={e => setPaymentInputs(p => ({...p, [d.id]: e.target.value}))}
                  className={INP}
                  onKeyDown={e => e.key === 'Enter' && payDebt(d.id)}
                />
                <button onClick={() => payDebt(d.id)}
                  className="px-5 py-2.5 rounded-2xl font-black text-white flex-shrink-0 active:scale-95"
                  style={{background:'#059669'}}>
                  💸 ชำระ
                </button>
              </div>
            )}
            {pct >= 100 && (
              <div className="mt-3 p-2 rounded-xl text-center bg-emerald-50">
                <span className="text-xs font-black text-emerald-600">🎉 ชำระครบแล้ว!</span>
              </div>
            )}
          </Card>
        );
      })}

      {/* ── LOAN APPLICATION SECTION ── */}
      <div className="flex items-center justify-between mt-2">
        <h3 className="text-base font-black text-slate-700">📋 ขอสินเชื่อจากระบบ</h3>
        {!myApp && (
          <button onClick={() => setShowForm(f => !f)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl text-white"
            style={{background: showForm?'#DC2626':'#059669'}}>
            {showForm ? 'ยกเลิก' : '+ สมัครสินเชื่อ'}
          </button>
        )}
      </div>

      {/* Loan status */}
      {myApp && (
        <div className="rounded-3xl p-5 text-center" style={{background:sb(myApp.status)}}>
          <div className="flex justify-center mb-2">{si(myApp.status)}</div>
          <p className="font-black text-base" style={{color:sc(myApp.status)}}>{sl(myApp.status)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {myApp.debtName && <span className="font-bold text-slate-700">"{myApp.debtName}" · </span>}
            วงเงิน ฿{fmt(myApp.amount)} · {myApp.bankName}
          </p>
          {myApp.status==='rejected'&&myApp.adminNote&&<p className="text-xs text-red-600 mt-2 font-bold">เหตุผล: {myApp.adminNote}</p>}
        </div>
      )}

      {/* Loan summary + payment */}
      {myApp?.status==='approved' && (
        <Card className="p-5">
          <h3 className="font-black text-slate-800 mb-4">📊 สรุปสินเชื่อ</h3>
          <div className="space-y-2 mb-4">
            {[['เงินต้น',`฿${fmt(myApp.amount)}`,'text-slate-700'],
              [`ดอกเบี้ย ${INTEREST_RATE}%`,`฿${fmt(interest)}`,'text-orange-500'],
              ['ยอดรวม',`฿${fmt(totalLoan)}`,'text-slate-900 font-black'],
              ['ชำระแล้ว',`฿${fmt(loanPaid)}`,'text-emerald-600'],
              ['คงเหลือ',`฿${fmt(loanRem)}`,loanRem<=0?'text-emerald-600':'text-orange-500'],
            ].map(([l,v,c]) => (
              <div key={l} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">{l}</span>
                <span className={`text-sm ${c}`}>{v}</span>
              </div>
            ))}
          </div>
          <Progress pct={loanPct} color={loanPct>=100?'#10B981':'#F97316'} height={12}/>
          {loanRem > 0 && (
            <div className="flex gap-2 mt-4">
              <input
                type="number"
                value={loanPmtInputs[myApp.id] || ''}
                onChange={e => setLoanPmtInputs(p => ({...p, [myApp.id]: e.target.value}))}
                placeholder="กรอกยอดชำระ (บาท)"
                className={INP}
              />
              <button
                onClick={() => {
                  const amt = +(loanPmtInputs[myApp.id] || 0);
                  if (!amt || amt <= 0) { toast('กรุณากรอกยอด','#DC2626'); return; }
                  if (amt > loanRem)   { toast('ยอดเกินหนี้คงเหลือ','#DC2626'); return; }
                  const updated = {...debtPayments, [myApp.id]: loanPaid + amt};
                  setDebtPayments(updated); db.set({debtPayments:updated});
                  setLoanPmtInputs(p => ({...p, [myApp.id]: ''}));
                  toast(`ชำระ ฿${fmt(amt)} สำเร็จ ✓`);
                }}
                className="px-5 py-2.5 rounded-2xl font-black text-white flex-shrink-0"
                style={{background:'#059669'}}>
                ชำระ
              </button>
            </div>
          )}
          {loanRem <= 0 && <div className="text-center p-3 rounded-2xl bg-emerald-50 mt-3"><p className="font-black text-emerald-600">🎉 ชำระหนี้ครบแล้ว!</p></div>}
        </Card>
      )}

      {/* PromptPay */}
      {myApp?.status==='approved' && (
        <Card className="p-5">
          <p className="text-sm text-slate-400 mb-3">ข้อมูลชำระเงิน</p>
          <div className="rounded-3xl p-6 text-white" style={{background:'linear-gradient(135deg,#1E3A8A,#1D4ED8)'}}>
            <p className="text-sm opacity-80">พร้อมเพย์</p>
            <h1 className="text-4xl font-black mt-2 tracking-wider">{PROMPTPAY_NUMBER}</h1>
            <div className="mt-6 border-t border-white/20 pt-4 flex justify-between items-end">
              <div>
                <p className="text-sm opacity-70">ชื่อบัญชี</p>
                <p className="text-xl font-bold mt-1">{ACCOUNT_NAME}</p>
              </div>
              <button onClick={copy} className="p-2.5 rounded-2xl active:scale-95 transition" style={{background:'rgba(255,255,255,0.15)'}}>
                <Copy size={18}/>
              </button>
            </div>
          </div>
          {loanRem>0&&<div className="p-4 rounded-2xl mt-4" style={{background:'#FFF7ED',border:'1px solid #FED7AA'}}>
            <p className="text-sm font-bold text-orange-700">ยอดคงเหลือ</p>
            <p className="text-3xl font-black text-orange-800 mt-1">฿{fmt(loanRem)}</p>
          </div>}
          <button onClick={copy} className="w-full py-3.5 rounded-2xl font-black text-white active:scale-95 transition mt-4" style={{background:'linear-gradient(90deg,#059669,#047857)'}}>คัดลอกเลขพร้อมเพย์</button>
        </Card>
      )}

      {/* Loan form */}
      {showForm && !myApp && (
        <form onSubmit={submitLoan} className="space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="font-black text-slate-800">กรอกใบสมัครสินเชื่อ</h3>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">ชื่อสินเชื่อ / ฉลากหนี้</label>
              <input type="text" value={loanName} onChange={e=>setLoanName(e.target.value)} placeholder="เช่น สินเชื่อฉุกเฉิน, ทุนธุรกิจ" className={INP}/>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">จำนวนเงินกู้ (บาท)</label>
              <input type="number" required value={form.amount} onChange={sf('amount')} placeholder="เช่น 10000" className={INP} style={{fontSize:22,fontWeight:900}}/>
              {form.amount>0&&(
                <div className="mt-2 p-3 rounded-xl" style={{background:'#FFFBEB',border:'1px solid #FEF08A'}}>
                  <p className="text-xs text-amber-700">ดอกเบี้ย {INTEREST_RATE}% = ฿{fmt(Math.round(+form.amount*INTEREST_RATE/100))} · รวม ฿{fmt(+form.amount+Math.round(+form.amount*INTEREST_RATE/100))}</p>
                </div>
              )}
            </div>
            <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">ธนาคารรับเงิน</label>
              <select required value={form.bank} onChange={sf('bank')} className={INP}>{THAI_BANKS.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">วัตถุประสงค์</label>
              <select required value={form.purpose} onChange={sf('purpose')} className={INP}><option value="">เลือก...</option>{LOAN_PURPOSES.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">อาชีพ</label>
              <select required value={form.occupation} onChange={sf('occupation')} className={INP}><option value="">เลือก...</option>{LOAN_OCCUPATIONS.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">รายได้ต่อเดือน (บาท)</label>
              <input type="number" required value={form.income} onChange={sf('income')} placeholder="20000" className={INP}/></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">เบอร์โทรศัพท์</label>
              <input type="tel" required maxLength={10} value={form.phone} onChange={sf('phone')} placeholder="0812345678" className={INP}/></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">เลขบัตรประชาชน (13 หลัก)</label>
              <input required maxLength={13} value={form.idcard} onChange={sf('idcard')} placeholder="1234567890123" className={INP}/></div>
          </Card>
          <button type="submit" className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-95 transition" style={{background:'linear-gradient(90deg,#059669,#047857)'}}>ยืนยันสมัครสินเชื่อ →</button>
        </form>
      )}
    </div>
  );
}

// ============================================================
// MONEY SCREEN
// ============================================================
function MoneyScreen({ txns, setTxns, toast }) {
  const [type,   setType]   = useState('expense');
  const [cat,    setCat]    = useState('');
  const [amount, setAmount] = useState('');
  const [note,   setNote]   = useState('');
  const cats   = type==='income'?INCOME_CATS:EXPENSE_CATS;
  const totalIn  = txns.filter(t=>t.type==='income').reduce((a,t)=>a+t.amount,0);
  const totalOut = txns.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0);
  const net = totalIn - totalOut;

  const add = () => {
    if (!cat||!amount||+amount<=0) return;
    const t = {id:Date.now(),type,cat,amount:+amount,note:note.trim(),date:todayTH()};
    const up=[t,...txns]; setTxns(up); db.set({txns:up}); setAmount(''); setNote(''); toast('บันทึกแล้ว ✓');
  };
  const del = (id) => { const up=txns.filter(t=>t.id!==id); setTxns(up); db.set({txns:up}); };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-slate-900">💰 รายรับ–รายจ่าย</h2>
      <div className="rounded-3xl p-5" style={{background:'linear-gradient(135deg,#064E3B,#10B981)'}}>
        <div className="grid grid-cols-3 gap-2 text-white">
          <div><p className="text-[9px] opacity-50 uppercase">รายรับ</p><p className="text-base font-black text-green-200">+{fmtM(totalIn)}</p></div>
          <div className="text-center"><p className="text-[9px] opacity-50 uppercase">สุทธิ</p><p className="text-base font-black">{net>=0?'+':''}{fmtM(net)}</p></div>
          <div className="text-right"><p className="text-[9px] opacity-50 uppercase">รายจ่าย</p><p className="text-base font-black text-red-300">-{fmtM(totalOut)}</p></div>
        </div>
      </div>
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[['income','💚 รายรับ'],['expense','💸 รายจ่าย']].map(([v,l])=>(
            <button key={v} onClick={()=>{setType(v);setCat('');}}
              className="py-2.5 rounded-2xl font-bold text-sm transition"
              style={{background:type===v?(v==='income'?'#DCFCE7':'#FFF1F2'):'#F8FAFC',color:type===v?(v==='income'?'#166534':'#9B2C2C'):'#94A3B8',border:`1.5px solid ${type===v?(v==='income'?'#86EFAC':'#FECDD3'):'transparent'}`}}>
              {l}
            </button>
          ))}
        </div>
        <div className="space-y-2.5">
          <select value={cat} onChange={e=>setCat(e.target.value)} className={INP}>
            <option value="">เลือกหมวดหมู่...</option>{cats.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="จำนวนเงิน (บาท)" className={INP}/>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="หมายเหตุ (ไม่บังคับ)" className={INP}/>
          <button onClick={add} className="w-full py-3 rounded-2xl font-bold text-white text-sm active:scale-95 transition"
            style={{background:type==='income'?'linear-gradient(90deg,#4ADE80,#166534)':'linear-gradient(90deg,#F87171,#9B2C2C)'}}>
            + บันทึก
          </button>
        </div>
      </Card>
      <div className="space-y-2">
        {txns.length===0
          ?<Card className="p-10 text-center"><p className="text-3xl mb-2">📊</p><p className="text-sm text-gray-400">ยังไม่มีรายการ</p></Card>
          :txns.map(t=>(
            <Card key={t.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-700 truncate">{t.note||t.cat}</p>
                <p className="text-[10px] text-slate-400">{t.cat} · {t.date}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <p className="text-sm font-black" style={{color:t.type==='income'?'#166534':'#9B2C2C'}}>{t.type==='income'?'+':'-'}฿{fmt(t.amount)}</p>
                <button onClick={()=>del(t.id)} className="text-gray-300 active:text-red-400"><Trash2 size={14}/></button>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

// ============================================================
// AI FOOD CALORIE DATABASE  (with type metadata)
// ============================================================
const FOOD_CALORIES = {
  'กะเพรา':         { kcal:650,  type:'อาหารจานเดียว' },
  'กะเพราไข่ดาว':   { kcal:750,  type:'อาหารจานเดียว' },
  'ข้าวผัด':        { kcal:700,  type:'อาหารจานเดียว' },
  'ข้าวมันไก่':     { kcal:585,  type:'อาหารจานเดียว' },
  'ข้าวหมูกรอบ':    { kcal:720,  type:'อาหารจานเดียว' },
  'ข้าวหมูแดง':     { kcal:650,  type:'อาหารจานเดียว' },
  'ข้าวไข่เจียว':   { kcal:500,  type:'อาหารจานเดียว' },
  'ข้าวคลุกกะปิ':   { kcal:680,  type:'อาหารจานเดียว' },
  'ข้าวขาหมู':      { kcal:760,  type:'อาหารจานเดียว' },
  'ข้าวหน้าเป็ด':   { kcal:700,  type:'อาหารจานเดียว' },
  'ข้าวกะเพรา':     { kcal:650,  type:'อาหารจานเดียว' },
  'ข้าวกะเพราหมู':  { kcal:650,  type:'อาหารจานเดียว' },
  'ผัดไทย':         { kcal:550,  type:'เส้น' },
  'สุกี้':          { kcal:420,  type:'เส้น' },
  'ราดหน้า':        { kcal:600,  type:'เส้น' },
  'ผัดซีอิ๊ว':      { kcal:700,  type:'เส้น' },
  'มาม่า':          { kcal:350,  type:'เส้น' },
  'ก๋วยเตี๋ยว':     { kcal:400,  type:'เส้น' },
  'เย็นตาโฟ':       { kcal:450,  type:'เส้น' },
  'บะหมี่':         { kcal:380,  type:'เส้น' },
  'แกงเขียวหวาน':   { kcal:240,  type:'แกง' },
  'แกงส้ม':         { kcal:180,  type:'แกง' },
  'แกงพะแนง':       { kcal:420,  type:'แกง' },
  'แกงมัสมั่น':     { kcal:550,  type:'แกง' },
  'ต้มยำ':          { kcal:180,  type:'แกง' },
  'ต้มข่าไก่':      { kcal:350,  type:'แกง' },
  'แกงป่า':         { kcal:280,  type:'แกง' },
  'แกงจืด':         { kcal:80,   type:'แกง' },
  'ส้มตำ':          { kcal:120,  type:'อาหารอีสาน' },
  'ลาบ':            { kcal:280,  type:'อาหารอีสาน' },
  'น้ำตก':          { kcal:300,  type:'อาหารอีสาน' },
  'ไก่ย่าง':        { kcal:250,  type:'อาหารอีสาน' },
  'หมูปิ้ง':        { kcal:300,  type:'อาหารอีสาน' },
  'ข้าวเหนียว':     { kcal:210,  type:'อาหารอีสาน' },
  'หมูกระทะ':       { kcal:900,  type:'บุฟเฟต์' },
  'ชาบู':           { kcal:700,  type:'บุฟเฟต์' },
  'ปิ้งย่าง':       { kcal:850,  type:'บุฟเฟต์' },
  'พิซซ่า':         { kcal:800,  type:'ฟาสต์ฟู้ด' },
  'เบอร์เกอร์':     { kcal:650,  type:'ฟาสต์ฟู้ด' },
  'เฟรนช์ฟรายส์':   { kcal:350,  type:'ฟาสต์ฟู้ด' },
  'ไก่ทอด':         { kcal:400,  type:'ฟาสต์ฟู้ด' },
  'นักเก็ต':        { kcal:320,  type:'ฟาสต์ฟู้ด' },
  'บิงซู':          { kcal:550,  type:'ของหวาน' },
  'ไอศกรีม':        { kcal:250,  type:'ของหวาน' },
  'เค้ก':           { kcal:450,  type:'ของหวาน' },
  'โดนัท':          { kcal:320,  type:'ของหวาน' },
  'โค้ก':           { kcal:140,  type:'น้ำอัดลม' },
  'โค้กซีโร่':      { kcal:0,    type:'น้ำอัดลม' },
  'coke zero':      { kcal:0,    type:'น้ำอัดลม' },
  'coke':           { kcal:140,  type:'น้ำอัดลม' },
  'เป๊ปซี่':        { kcal:150,  type:'น้ำอัดลม' },
  'pepsi':          { kcal:150,  type:'น้ำอัดลม' },
  'ชาไทย':          { kcal:240,  type:'เครื่องดื่ม' },
  'ชานม':           { kcal:350,  type:'เครื่องดื่ม' },
  'ชานมไข่มุก':     { kcal:450,  type:'เครื่องดื่ม' },
  'กาแฟ':           { kcal:120,  type:'เครื่องดื่ม' },
  'โกโก้':          { kcal:300,  type:'เครื่องดื่ม' },
  'โอวัลติน':       { kcal:280,  type:'เครื่องดื่ม' },
  'เอ็ม150':        { kcal:120,  type:'เครื่องดื่มชูกำลัง' },
  'm-150':          { kcal:120,  type:'เครื่องดื่มชูกำลัง' },
  'กระทิงแดง':      { kcal:150,  type:'เครื่องดื่มชูกำลัง' },
  'น้ำส้ม':         { kcal:180,  type:'เครื่องดื่ม' },
  'นมเย็น':         { kcal:250,  type:'เครื่องดื่ม' },
  'สมูทตี้':        { kcal:200,  type:'เครื่องดื่ม' },
  'น้ำมะพร้าว':     { kcal:60,   type:'เครื่องดื่ม' },
  'โออิชิ':         { kcal:90,   type:'เครื่องดื่ม' },
  'ชาเขียว':        { kcal:90,   type:'เครื่องดื่ม' },
  'น้ำเปล่า':       { kcal:0,    type:'เครื่องดื่ม' },
  'กล้วย':          { kcal:90,   type:'ผลไม้' },
  'แอปเปิล':        { kcal:80,   type:'ผลไม้' },
  'ทุเรียน':        { kcal:160,  type:'ผลไม้' },
  'มะม่วง':         { kcal:45,   type:'ผลไม้' },
  'แตงโม':          { kcal:25,   type:'ผลไม้' },
  'มังคุด':         { kcal:35,   type:'ผลไม้' },
};

// Smart rule-based fallback
function ruleBasedCal(input) {
  if (input.includes('ทอด'))  return { kcal:500, type:'อาหารทอด' };
  if (input.includes('ย่าง')) return { kcal:350, type:'อาหารปิ้งย่าง' };
  if (input.includes('ชา'))   return { kcal:250, type:'เครื่องดื่มชา' };
  if (input.includes('น้ำ'))  return { kcal:150, type:'เครื่องดื่ม' };
  if (input.includes('แกง'))  return { kcal:280, type:'แกงทั่วไป' };
  if (input.includes('ข้าว')) return { kcal:450, type:'อาหารข้าว' };
  return { kcal:300, type:'ไม่พบในฐานข้อมูล (ค่าประมาณ)' };
}

function analyzeInput(raw) {
  const input = raw.toLowerCase().trim();
  const matched = [];
  // longest key first to avoid partial override
  const keys = Object.keys(FOOD_CALORIES).sort((a,b) => b.length - a.length);
  const used = new Set();
  for (const key of keys) {
    if (input.includes(key.toLowerCase()) && !used.has(key)) {
      matched.push({ name: key, ...FOOD_CALORIES[key] });
      used.add(key);
    }
  }
  if (matched.length > 0) return { items: matched, fallback: false };
  const rule = ruleBasedCal(input);
  return { items: [{ name: raw.trim(), ...rule }], fallback: true };
}

// ============================================================
// FOOD SCREEN  — Multi-food AI Analyzer
// ============================================================
function FoodScreen({ user, foods, setFoods, toast }) {
  const [foodInput,  setFoodInput]  = useState('');
  const [calResult,  setCalResult]  = useState(null);  // { total, items, analysis, fallback }
  const [meal,       setMeal]       = useState('🌅 เช้า');
  const [analyzing,  setAnalyzing]  = useState(false);

  const target    = user.targetCal || 2000;
  const totalCal  = foods.reduce((a,f) => a + f.cal, 0);
  const calPct    = clamp(Math.round(totalCal / target * 100), 0, 100);
  const remaining = target - totalCal;

  const analyze = () => {
    if (!foodInput.trim()) { toast('กรุณาพิมพ์ชื่ออาหาร', '#DC2626'); return; }
    setAnalyzing(true);
    setTimeout(() => {
      const { items, fallback } = analyzeInput(foodInput);
      const total = items.reduce((a,it) => a + it.kcal, 0);
      const analysis = fallback
        ? `🤖 AI วิเคราะห์: ไม่พบในฐานข้อมูล (ค่าประมาณทั่วไป)`
        : '🤖 AI ตรวจพบอาหาร:\n' + items.map(f => `• ${f.name} (${f.type}) ~${f.kcal} kcal`).join('\n');
      setCalResult({ total, items, analysis, fallback });
      setAnalyzing(false);
      toast('AI วิเคราะห์เสร็จแล้ว ✓');
    }, 350);
  };

  const addToLog = () => {
    if (!calResult) return;
    const name = foodInput.trim() || calResult.items.map(i=>i.name).join(', ');
    const entry = { id:Date.now(), name, cal:calResult.total, meal, analysis:calResult.analysis, date:todayTH() };
    const up = [entry, ...foods];
    setFoods(up); db.set({ foods: up });
    setFoodInput(''); setCalResult(null);
    toast('บันทึกลงประวัติแล้ว ✓');
  };

  const del = (id) => { const up=foods.filter(f=>f.id!==id); setFoods(up); db.set({foods:up}); };

  const reset = () => { setFoods([]); db.set({foods:[]}); setCalResult(null); setFoodInput(''); toast('รีเซ็ตแล้ว'); };

  const HINTS = ['หมูกระทะกับโค้ก','ชานมไข่มุก','ข้าวกะเพราไข่ดาว','ส้มตำ + ข้าวเหนียว','ไก่ทอด','ชาบู'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900">🤖 AI คำนวณแคลอรี</h2>
        <button onClick={reset} className="text-xs font-bold px-3 py-1.5 rounded-xl text-white"
          style={{background:'#EF4444'}}>รีเซ็ต</button>
      </div>

      {/* Daily progress */}
      <Card className="p-5">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Flame size={16} style={{color:'#F97316'}}/>
            <span className="text-sm font-black text-slate-700">แคลอรีวันนี้</span>
          </div>
          <span className="text-sm font-black" style={{color:calPct>=100?'#DC2626':'#059669'}}>
            {fmt(totalCal)} / {fmt(target)}
          </span>
        </div>
        <Progress pct={calPct} color={calPct>=100?'#EF4444':'#10B981'} height={14}/>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-slate-400">เป้าหมาย {fmt(target)} kcal/วัน</span>
          <span className="text-[10px] font-bold" style={{color:remaining<0?'#DC2626':'#059669'}}>
            {remaining>=0?`เหลือ ${fmt(remaining)}`:`เกิน ${fmt(Math.abs(remaining))}`} kcal
          </span>
        </div>
      </Card>

      {/* AI Input */}
      <Card className="p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          พิมพ์อาหารได้หลายอย่างในครั้งเดียว
        </p>
        <div className="space-y-3">
          <select value={meal} onChange={e=>setMeal(e.target.value)} className={INP}>
            {MEALS.map(m=><option key={m} value={m}>{m}</option>)}
          </select>
          <textarea
            value={foodInput}
            onChange={e => { setFoodInput(e.target.value); setCalResult(null); }}
            onKeyDown={e => e.key==='Enter' && !e.shiftKey && (e.preventDefault(), analyze())}
            placeholder="เช่น: หมูกระทะกับโค้ก  /  ชานมไข่มุก  /  ข้าวกะเพราไข่ดาว"
            rows={3}
            className={INP + " resize-none text-base leading-relaxed"}
          />

          {/* Hint chips */}
          <div className="flex flex-wrap gap-1.5">
            {HINTS.map(h=>(
              <button key={h} onClick={()=>{ setFoodInput(h); setCalResult(null); }}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-xl transition active:scale-95"
                style={{background:'#F1F5F9',color:'#475569'}}>
                {h}
              </button>
            ))}
          </div>

          <button onClick={analyze} disabled={analyzing || !foodInput.trim()}
            className="w-full py-3.5 rounded-2xl font-black text-white text-base active:scale-95 transition"
            style={{background:analyzing||!foodInput.trim()?'#CBD5E0':'linear-gradient(90deg,#10B981,#059669)'}}>
            {analyzing ? '🤖 กำลังวิเคราะห์...' : '🤖 วิเคราะห์แคลอรี'}
          </button>
        </div>

        {/* Result */}
        {calResult !== null && (
          <div className="mt-4 rounded-2xl overflow-hidden" style={{border:'1px solid #A7F3D0'}}>
            <div className="p-5 text-center" style={{background:'#ECFDF5'}}>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">แคลอรีรวมทั้งหมด</p>
              <p className="text-6xl font-black" style={{color:'#059669'}}>{calResult.total}</p>
              <p className="text-base text-emerald-700 mt-1">kcal</p>
            </div>
            <div className="p-4 bg-white">
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{calResult.analysis}</p>
              {calResult.items.length > 1 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  {calResult.items.map((it,i) => (
                    <div key={i} className="flex justify-between items-center py-1">
                      <span className="text-xs text-slate-600">{it.name} ({it.type})</span>
                      <span className="text-xs font-black" style={{color:'#059669'}}>{it.kcal} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 bg-white border-t border-slate-100">
              <button onClick={addToLog}
                className="w-full py-3 rounded-2xl font-black text-white active:scale-95 transition"
                style={{background:'linear-gradient(90deg,#10B981,#059669)'}}>
                + บันทึกลงประวัติ
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* History */}
      <h3 className="text-base font-black text-slate-800">📜 ประวัติอาหาร</h3>
      {foods.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-3xl mb-2">🍽️</p>
          <p className="text-sm text-gray-400">ยังไม่มีรายการอาหาร</p>
        </Card>
      ) : foods.map(f => (
        <Card key={f.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-xl flex-shrink-0"
                  style={{background:'#ECFDF5',color:'#059669'}}>
                  {f.meal.split(' ')[1]}
                </span>
                <p className="text-sm font-bold text-slate-700 truncate">{f.name}</p>
              </div>
              {f.analysis && (
                <p className="text-[10px] text-slate-400 whitespace-pre-line leading-relaxed">{f.analysis}</p>
              )}
              <p className="text-[10px] text-slate-300 mt-0.5">{f.date}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <p className="text-sm font-black" style={{color:'#10B981'}}>{fmt(f.cal)} kcal</p>
              <button onClick={()=>del(f.id)} className="text-gray-300 active:text-red-400"><Trash2 size={14}/></button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============================================================
// ADMIN PANEL
// ============================================================
function AdminPanelScreen({ loans, setLoans, toast }) {
  const [filter, setFilter] = useState('pending');
  const [notes,  setNotes]  = useState({});
  const filtered = loans.filter(l=>filter==='all'||l.status===filter);
  const counts   = {pending:loans.filter(l=>l.status==='pending').length,approved:loans.filter(l=>l.status==='approved').length,rejected:loans.filter(l=>l.status==='rejected').length};
  const decide = (id, status) => {
    const up = loans.map(l=>l.id===id?{...l,status,adminNote:notes[id]||'',decidedAt:todayTH()}:l);
    setLoans(up); db.set({loans:up}); toast(status==='approved'?'อนุมัติสินเชื่อแล้ว ✓':'ปฏิเสธสินเชื่อแล้ว', status==='approved'?'#059669':'#DC2626');
  };
  const sc = (s) => s==='approved'?'#059669':s==='rejected'?'#DC2626':'#D97706';
  const sb = (s) => s==='approved'?'#ECFDF5':s==='rejected'?'#FEF2F2':'#FFFBEB';
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><Lock size={18} style={{color:'#1D4ED8'}}/><h2 className="text-xl font-black text-slate-900">Admin Panel</h2></div>
      <div className="grid grid-cols-3 gap-2">
        {[['รอ',counts.pending,'#FFFBEB','#D97706'],['อนุมัติ',counts.approved,'#ECFDF5','#059669'],['ปฏิเสธ',counts.rejected,'#FEF2F2','#DC2626']].map(([l,v,bg,c])=>(
          <div key={l} className="rounded-2xl p-3 text-center border border-slate-100" style={{background:bg}}>
            <p className="text-[10px] font-bold text-gray-400 uppercase">{l}</p>
            <p className="text-2xl font-black mt-0.5" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {[['all','ทั้งหมด'],['pending','รอ'],['approved','อนุมัติ'],['rejected','ปฏิเสธ']].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} className="px-3 py-1.5 rounded-xl text-xs font-bold transition"
            style={{background:filter===v?'#10B981':'#F1F5F9',color:filter===v?'#fff':'#64748B'}}>{l}</button>
        ))}
      </div>
      {filtered.length===0
        ?<Card className="p-10 text-center"><p className="text-3xl mb-2">📭</p><p className="text-sm text-gray-400">ไม่มีรายการ</p></Card>
        :filtered.map(l=>(
          <Card key={l.id} className="p-5">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                {l.userImg?<img src={l.userImg} className="w-full h-full object-cover" alt="u"/>:<div className="w-full h-full flex items-center justify-center"><User size={18} style={{color:'#94A3B8'}}/></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-800">{l.userName}</p>
                <p className="text-xs text-slate-400">{l.occupation} · รายได้ ฿{fmt(l.income)}/เดือน</p>
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-xl flex-shrink-0"
                style={{background:sb(l.status),color:sc(l.status)}}>
                {l.status==='approved'?'อนุมัติ':l.status==='rejected'?'ปฏิเสธ':'รอ'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-xs">
              {[['วงเงิน',`฿${fmt(l.amount)}`],['ยอดรวม+ดอกเบี้ย',`฿${fmt(l.total)}`],['ธนาคาร',l.bankName],['วัตถุประสงค์',l.purpose],['เบอร์โทร',l.phone],['บัตรประชาชน',(l.idcard||'').replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/,'$1-$2-$3-$4-$5')],['ยื่นสมัคร',l.submittedAt]].map(([k,v])=>(
                <div key={k}><p className="text-gray-400">{k}</p><p className="font-bold text-slate-700 truncate">{v}</p></div>
              ))}
            </div>
            {l.status==='pending'&&(
              <div className="space-y-2">
                <input value={notes[l.id]||''} onChange={e=>setNotes(n=>({...n,[l.id]:e.target.value}))} placeholder="หมายเหตุการตัดสินใจ" className={INP}/>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={()=>decide(l.id,'approved')} className="py-3 rounded-2xl text-sm font-black text-white active:scale-95" style={{background:'#059669'}}>✓ อนุมัติ</button>
                  <button onClick={()=>decide(l.id,'rejected')} className="py-3 rounded-2xl text-sm font-black text-white active:scale-95" style={{background:'#DC2626'}}>✕ ปฏิเสธ</button>
                </div>
              </div>
            )}
            {l.decidedAt&&<p className="text-[10px] text-gray-400 text-right mt-2">ตัดสินใจ: {l.decidedAt}</p>}
          </Card>
        ))}
    </div>
  );
}

// ============================================================
// SETTINGS SCREEN
// ============================================================
function SettingsScreen({ user, role, onChangePin, onLogout }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-900">⚙️ ตั้งค่า</h2>
      <Card className="p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
          {user.img?<img src={user.img} className="w-full h-full object-cover" alt="avatar"/>:<div className="w-full h-full flex items-center justify-center"><User size={24} style={{color:'#94A3B8'}}/></div>}
        </div>
        <div>
          <p className="font-black text-slate-800 text-base">{user.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{role==='admin'?'👑 ผู้ดูแลระบบ':'👤 ผู้ใช้งาน'}</p>
          <p className="text-xs text-slate-400">แคลอรีเป้าหมาย: {fmt(user.targetCal||2000)} kcal/วัน</p>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <button onClick={onChangePin} className="w-full flex items-center gap-3 p-4 border-b border-slate-100 active:bg-slate-50 transition">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50"><Key size={17} style={{color:'#059669'}}/></div>
          <div className="flex-1 text-left"><p className="text-sm font-bold text-slate-800">เปลี่ยน PIN</p><p className="text-xs text-slate-400">อัปเดตรหัสผ่าน</p></div>
          <span className="text-slate-300 text-lg">›</span>
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 active:bg-slate-50 transition">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50"><Lock size={17} style={{color:'#EF4444'}}/></div>
          <div className="flex-1 text-left"><p className="text-sm font-bold text-red-500">ออกจากระบบ</p><p className="text-xs text-slate-400">กลับสู่หน้าจอ PIN</p></div>
          <span className="text-slate-300 text-lg">›</span>
        </button>
      </Card>
      <Card className="p-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ข้อมูลระบบ</p>
        <p className="text-xs text-slate-500">Cal & Cash Super App</p>
        <p className="text-xs text-slate-400 mt-0.5">PromptPay: {PROMPTPAY_NUMBER} · {ACCOUNT_NAME}</p>
      </Card>
    </div>
  );
}

// ============================================================
// FIRST SETUP
// ============================================================
function FirstSetup({ onDone }) {
  const [img,  setImg]  = useState(null);
  const [name, setName] = useState('');
  const [ht,   setHt]   = useState('');
  const [wt,   setWt]   = useState('');
  const [age,  setAge]  = useState('');
  const [sex,  setSex]  = useState('male');
  const fileRef = useRef(null);
  const pickImg = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onloadend=()=>setImg(r.result); r.readAsDataURL(f);
  };
  const submit = (e) => {
    e.preventDefault();
    const bmr = sex==='male' ? 66+13.7*+wt+5*+ht-6.8*+age : 655+9.6*+wt+1.8*+ht-4.7*+age;
    onDone({name:name.trim(),img,targetCal:Math.round(bmr*1.2),ht,wt,age,sex});
  };
  const inp = "w-full rounded-2xl border border-white/15 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400";
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5" style={{background:'linear-gradient(160deg,#0A0F1E 0%,#0D2137 100%)'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;font-family:'Inter',sans-serif}`}</style>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{background:'linear-gradient(135deg,#10B981,#059669)'}}>
        <ShieldCheck size={36} color="white"/>
      </div>
      <h1 className="text-3xl font-black text-white mb-1 tracking-tight">Cal & Cash</h1>
      <p className="text-slate-500 text-xs mb-8 uppercase tracking-widest">ตั้งค่าบัญชีครั้งแรก</p>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <button type="button" onClick={()=>fileRef.current.click()}
            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center active:scale-95"
            style={{border:'3px solid #10B981',background:'#1E293B'}}>
            {img?<img src={img} className="w-full h-full object-cover" alt="avatar"/>
              :<div className="text-center"><User size={28} style={{color:'#64748B',display:'block',margin:'0 auto'}}/><p className="text-[9px] text-slate-500 mt-1">รูปภาพ</p></div>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImg}/>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="ชื่อเล่น" required className={inp} style={{background:'rgba(255,255,255,0.06)'}}/>
          <div className="grid grid-cols-3 gap-2">
            {[['ส่วนสูง(ซม.)',ht,setHt,'170'],['น้ำหนัก(กก.)',wt,setWt,'60'],['อายุ(ปี)',age,setAge,'25']].map(([l,v,s,ph])=>(
              <div key={l}>
                <p className="text-[9px] text-slate-500 mb-1 font-bold uppercase">{l}</p>
                <input type="number" value={v} onChange={e=>s(e.target.value)} placeholder={ph} required className={`${inp} text-center`} style={{background:'rgba(255,255,255,0.06)'}}/>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[['male','ชาย'],['female','หญิง']].map(([v,l])=>(
              <button key={v} type="button" onClick={()=>setSex(v)} className="py-2.5 rounded-2xl font-bold text-sm transition"
                style={{background:sex===v?'#10B981':'rgba(255,255,255,0.06)',color:sex===v?'#fff':'#64748B'}}>{l}</button>
            ))}
          </div>
          <button type="submit" disabled={!name.trim()||!ht||!wt||!age}
            className="w-full py-4 rounded-2xl font-black text-white text-sm transition"
            style={{background:'linear-gradient(90deg,#10B981,#059669)',opacity:(name.trim()&&ht&&wt&&age)?1:0.4}}>
            เริ่มใช้งาน →
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// ROOT APP
// ============================================================
export default function CalCashSuperApp() {
  const stored = db.get();
  const [user,           setUser]           = useState(stored.user  || null);
  const [authenticated,  setAuthenticated]  = useState(false);
  const [role,           setRole]           = useState('user');
  const [showChangePin,  setShowChangePin]  = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loans,          setLoans]          = useState(stored.loans  || []);
  const [txns,           setTxns]           = useState(stored.txns   || []);
  const [foods,          setFoods]          = useState(stored.foods  || []);
  const [debtPayments,   setDebtPayments]   = useState(stored.debtPayments || {});
  const [tab,            setTab]            = useState('home');
  const [darkMode,       setDarkMode]       = useState(false);
  const [showToast, toastComp]              = useToast();
  const isAdmin = role === 'admin';

  // ── AI Credit Score ────────────────────────────────────────
  const totalIn  = txns.filter(t=>t.type==='income').reduce((a,t)=>a+t.amount,0);
  const totalOut = txns.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0);
  const totalCal = foods.reduce((a,f)=>a+f.cal,0);
  const balance  = totalIn - totalOut;
  const creditScore = Math.min(100, Math.max(0,
    80
    + (balance > 5000  ?  10 : 0)
    - (totalOut > totalIn ? 25 : 0)
    - (balance < 0     ?  20 : 0)
    - (totalCal > 3000 ?   5 : 0)
  ));
  const creditLabel = creditScore >= 80 ? 'ดีเยี่ยม' : creditScore >= 60 ? 'ดี' : creditScore >= 40 ? 'พอใช้' : 'ต้องปรับปรุง';
  const creditColor = creditScore >= 80 ? '#10B981' : creditScore >= 60 ? '#3B82F6' : creditScore >= 40 ? '#F97316' : '#EF4444';

  // ── Theme tokens ──────────────────────────────────────────
  const themeBg     = darkMode ? '#09090B' : '#F1F5F9';
  const themeCard   = darkMode ? '#18181B' : '#FFFFFF';
  const themeBorder = darkMode ? '#27272A' : '#F1F5F9';
  const themeText   = darkMode ? '#F4F4F5' : '#0F172A';
  const themeSubText= darkMode ? '#A1A1AA' : '#64748B';

  if (!user) return <FirstSetup onDone={(u)=>{ db.set({user:u}); setUser(u); setAuthenticated(true); }}/>;
  if (showChangePin) return <ChangePinScreen role={role} onDone={()=>{ setShowChangePin(false); showToast('เปลี่ยน PIN สำเร็จ ✓'); }} onBack={()=>setShowChangePin(false)}/>;
  if (!authenticated) return <PinLoginScreen onSuccess={(r)=>{ setRole(r); setAuthenticated(true); }}/>;

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300"
      style={{ background: themeBg, fontFamily:"'Inter',sans-serif", color: themeText }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box}`}</style>
      {toastComp}
      {showAdminLogin && <AdminOverlay onBack={()=>setShowAdminLogin(false)} onSuccess={()=>{ setRole('admin'); setShowAdminLogin(false); setTab('admin'); }}/>}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b px-4 py-3 flex items-center justify-between shadow-sm transition-colors duration-300"
        style={{ background: themeCard, borderColor: themeBorder }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#10B981,#059669)'}}>
            <ShieldCheck size={18} color="white"/>
          </div>
          <div>
            <p className="text-sm font-black leading-none" style={{color:themeText}}>Cal & Cash</p>
            <p className="text-[9px]" style={{color:themeSubText}}>Super App</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(d => !d)}
            className="text-xs font-bold px-2.5 py-1 rounded-xl transition-colors"
            style={{ background: darkMode?'#27272A':'#F8FAFC', color: darkMode?'#FCD34D':'#475569', border:`1px solid ${themeBorder}` }}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          {isAdmin
            ? <span className="text-xs font-bold px-2.5 py-1 rounded-xl" style={{background:'#EFF6FF',color:'#1D4ED8'}}>👑 Admin</span>
            : <button onClick={()=>setShowAdminLogin(true)} className="text-xs font-bold px-2.5 py-1 rounded-xl" style={{background:themeCard,border:`1px solid ${themeBorder}`,color:themeSubText}}>Admin</button>}
          <button onClick={()=>setTab('settings')} className="w-9 h-9 rounded-full overflow-hidden border-2" style={{borderColor:themeBorder,background:darkMode?'#27272A':'#F1F5F9'}}>
            {user.img?<img src={user.img} className="w-full h-full object-cover" alt="avatar"/>
              :<div className="w-full h-full flex items-center justify-center"><User size={16} style={{color:themeSubText}}/></div>}
          </button>
        </div>
      </header>

      {/* Credit Score bar — always visible below header */}
      <div className="px-4 pt-3 max-w-2xl mx-auto">
        <div className="rounded-2xl p-4 mb-1 flex items-center gap-4 transition-colors duration-300"
          style={{ background: themeCard, border:`1px solid ${themeBorder}` }}>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{color:themeSubText}}>AI Credit Score</p>
              <span className="text-xs font-black px-2 py-0.5 rounded-xl" style={{background:creditColor+'20',color:creditColor}}>
                {creditLabel}
              </span>
            </div>
            <Progress pct={creditScore} color={creditColor} height={8}/>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-black leading-none" style={{color:creditColor}}>{creditScore}</p>
            <p className="text-[9px] mt-0.5" style={{color:themeSubText}}>/100</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-2 max-w-2xl mx-auto">
        {tab==='home'     && <HomeScreen     user={user} loans={loans} txns={txns} foods={foods} debtPayments={debtPayments} setTab={setTab} darkMode={darkMode} themeCard={themeCard} themeBorder={themeBorder} themeText={themeText} themeSubText={themeSubText}/>}
        {tab==='debt'     && <DebtScreen     user={user} loans={loans} setLoans={setLoans} debtPayments={debtPayments} setDebtPayments={setDebtPayments} toast={showToast}/>}
        {tab==='money'    && <MoneyScreen    txns={txns} setTxns={setTxns} toast={showToast}/>}
        {tab==='food'     && <FoodScreen     user={user} foods={foods} setFoods={setFoods} toast={showToast}/>}
        {tab==='admin'    && isAdmin && <AdminPanelScreen loans={loans} setLoans={setLoans} toast={showToast}/>}
        {tab==='settings' && <SettingsScreen user={user} role={role}
          onChangePin={()=>setShowChangePin(true)}
          onLogout={()=>{ setAuthenticated(false); setRole('user'); setTab('home'); }}/>}
      </div>

      <BottomNav tab={tab} setTab={setTab} isAdmin={isAdmin}/>
    </div>
  );
}
