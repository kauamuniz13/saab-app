const LOGO = 'assets/img/tlgd.jpg';

const USERS = [
  {id:"u1",name:"SAAB Admin",user:"admin",pass:"saab2024",role:"admin"},
  {id:"u2",name:"El Bohio",user:"elbohio",pass:"bohio123",role:"rest",clientId:"c1"}
];

const CLIENTS_DEFAULT = [
  {id:"c1",name:"El Bohio",contact:"Manager",phone:"(555)111-2222",address:"123 Main St",active:true},
  {id:"c2",name:"La Parrilla",contact:"Owner",phone:"(555)333-4444",address:"456 Oak Ave",active:true},
  {id:"c3",name:"Gaucho Grill",contact:"Chef",phone:"(555)555-6666",address:"789 Pine Rd",active:true}
];

const STOCK_DEFAULT = {
  s1:{name:"Câmara 1 – Bovinos",cold:true,items:[
    {id:"p101",name:"Picanha",unit:"kg",qty:45,min:10},
    {id:"p102",name:"Alcatra",unit:"kg",qty:38,min:8},
    {id:"p103",name:"Contrafilé",unit:"kg",qty:52,min:10},
    {id:"p104",name:"Filé Mignon",unit:"kg",qty:20,min:5},
    {id:"p105",name:"Costela",unit:"kg",qty:60,min:15},
    {id:"p106",name:"Acém",unit:"kg",qty:35,min:8},
    {id:"p107",name:"Patinho",unit:"kg",qty:42,min:10},
    {id:"p108",name:"Coxão Mole",unit:"kg",qty:30,min:8},
    {id:"p109",name:"Coxão Duro",unit:"kg",qty:28,min:8},
    {id:"p110",name:"Maminha",unit:"kg",qty:22,min:5},
    {id:"p111",name:"Fraldinha",unit:"kg",qty:18,min:5},
    {id:"p112",name:"T-Bone",unit:"kg",qty:15,min:4},
    {id:"p113",name:"Ancho",unit:"kg",qty:25,min:5},
    {id:"p114",name:"Bife de Chorizo",unit:"kg",qty:20,min:5}
  ]},
  s2:{name:"Câmara 2 – Suínos",cold:true,items:[
    {id:"p201",name:"Lombo Suíno",unit:"kg",qty:40,min:8},
    {id:"p202",name:"Pernil",unit:"kg",qty:35,min:8},
    {id:"p203",name:"Costela Suína",unit:"kg",qty:50,min:10},
    {id:"p204",name:"Barriga Suína",unit:"kg",qty:30,min:6},
    {id:"p205",name:"Paleta Suína",unit:"kg",qty:28,min:6},
    {id:"p206",name:"Linguiça Toscana",unit:"kg",qty:45,min:10},
    {id:"p207",name:"Linguiça Calabresa",unit:"kg",qty:40,min:10},
    {id:"p208",name:"Bacon",unit:"kg",qty:25,min:5}
  ]},
  s3:{name:"Câmara 3 – Aves",cold:true,items:[
    {id:"p301",name:"Frango Inteiro",unit:"kg",qty:80,min:20},
    {id:"p302",name:"Peito de Frango",unit:"kg",qty:60,min:15},
    {id:"p303",name:"Coxa e Sobrecoxa",unit:"kg",qty:55,min:12},
    {id:"p304",name:"Asa de Frango",unit:"kg",qty:40,min:10},
    {id:"p305",name:"Filé de Peru",unit:"kg",qty:20,min:5},
    {id:"p306",name:"Pato",unit:"kg",qty:10,min:3}
  ]},
  s4:{name:"Depósito – Secos",cold:false,items:[
    {id:"p401",name:"Arroz 5kg",unit:"pct",qty:100,min:20},
    {id:"p402",name:"Feijão Preto 1kg",unit:"pct",qty:80,min:15},
    {id:"p403",name:"Óleo de Soja 900ml",unit:"un",qty:60,min:12},
    {id:"p404",name:"Sal Refinado 1kg",unit:"pct",qty:50,min:10},
    {id:"p405",name:"Açúcar 1kg",unit:"pct",qty:45,min:10},
    {id:"p406",name:"Farinha de Trigo 5kg",unit:"pct",qty:30,min:8},
    {id:"p407",name:"Macarrão 500g",unit:"pct",qty:70,min:15},
    {id:"p408",name:"Molho de Tomate 340g",unit:"un",qty:90,min:20}
  ]},
  s5:{name:"Depósito – Bebidas",cold:false,items:[
    {id:"p501",name:"Água Mineral 500ml",unit:"cx",qty:30,min:6},
    {id:"p502",name:"Refrigerante 2L",unit:"un",qty:48,min:10},
    {id:"p503",name:"Suco de Laranja 1L",unit:"un",qty:24,min:6},
    {id:"p504",name:"Cerveja 350ml",unit:"cx",qty:20,min:4},
    {id:"p505",name:"Vinho Tinto 750ml",unit:"un",qty:15,min:3},
    {id:"p506",name:"Energético 473ml",unit:"un",qty:36,min:8}
  ]}
};

/* ── Storage keys ── */
const SK = {
  user:'saab_user', stock:'saab_stock', orders:'saab_orders',
  invoices:'saab_invoices', clients:'saab_clients', nextOrd:'saab_nextOrd'
};

const storage = window.Capacitor?.Plugins?.Storage || {
  get: k => Promise.resolve({value: localStorage.getItem(k.key)}),
  set: k => Promise.resolve(localStorage.setItem(k.key, k.value))
};

async function sg(k){ const r = await storage.get({key:k}); try{return JSON.parse(r.value)}catch{return r.value} }
async function ss(k,v){ await storage.set({key:k, value:JSON.stringify(v)}) }

function uid(){ return 'x'+Math.random().toString(36).slice(2,9) }
function today(){ return new Date().toISOString().slice(0,10) }

/* ── Theme ── */
const RED='#CC1F1F', BG='#111214', CARD='#1A1C1F', BOR='#252729',
      MUT='#6B6E75', GRN='#16a34a', AMB='#d97706', BLU='#2563eb', COL='#1E4D8C';

/* ── DOM builder ── */
function el(tag, props={}, ...children){
  const e = document.createElement(tag);
  for(const [k,v] of Object.entries(props)){
    if(k==='className') e.className=v;
    else if(k==='style'&&typeof v==='object') Object.assign(e.style,v);
    else if(k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(),v);
    else e.setAttribute(k,v);
  }
  for(const c of children.flat()){
    if(c==null||c===false) continue;
    e.appendChild(typeof c==='string'?document.createTextNode(c):c);
  }
  return e;
}

/* ── Global state ── */
let STATE = {
  view:'login', user:null, tab:'est',
  estSector:null, estItem:null, estImport:false,
  orderId:null, invoiceId:null,
  modal:null, flash:null,
  stock:{}, orders:[], invoices:[], clients:[]
};

function setState(patch){
  Object.assign(STATE, patch);
  render();
}

let _flashTimer = null;
function flash(msg, type='ok'){
  if(_flashTimer) clearTimeout(_flashTimer);
  setState({flash:{msg,type}});
  _flashTimer = setTimeout(()=>setState({flash:null}), 3000);
}

async function persist(){
  await ss(SK.stock, STATE.stock);
  await ss(SK.orders, STATE.orders);
  await ss(SK.invoices, STATE.invoices);
  await ss(SK.clients, STATE.clients);
}

async function init(){
  const [su, stock, orders, invoices, clients] = await Promise.all([
    sg(SK.user), sg(SK.stock), sg(SK.orders), sg(SK.invoices), sg(SK.clients)
  ]);
  const s = (stock && Object.keys(stock).length) ? stock : JSON.parse(JSON.stringify(STOCK_DEFAULT));
  const o = Array.isArray(orders) ? orders : [];
  const inv = Array.isArray(invoices) ? invoices : [];
  const cl = (Array.isArray(clients) && clients.length) ? clients : JSON.parse(JSON.stringify(CLIENTS_DEFAULT));
  if(su){
    STATE = {...STATE, user:su, view:'app', stock:s, orders:o, invoices:inv, clients:cl};
  } else {
    STATE = {...STATE, stock:s, orders:o, invoices:inv, clients:cl};
  }
  render();
}

function render(){
  const app = document.getElementById('app');
  app.innerHTML = '';
  if(STATE.view==='login') app.appendChild(renderLogin());
  else app.appendChild(renderApp());
}

/* ── LOGIN ── */
function renderLogin(){
  const wrap = el('div',{className:'login-bg'});
  const card = el('div',{className:'login-card'});

  const logoWrap = el('div',{className:'login-logo-wrap'});
  const logoRing = el('div',{className:'login-logo-ring'});
  const logoImg = el('img',{className:'login-logo-img', src:LOGO, alt:'SAAB'});
  logoRing.appendChild(logoImg);
  logoWrap.appendChild(logoRing);

  const brand = el('div',{className:'login-brand'});
  const brandName = el('div',{className:'login-brand-name'},'SAAB');
  const brandSub = el('div',{className:'login-brand-sub'},'Distribuidora');
  brand.appendChild(brandName);
  brand.appendChild(brandSub);

  const form = el('form',{className:'login-form', onSubmit: async e=>{
    e.preventDefault();
    const u = userInp.value.trim();
    const p = passInp.value.trim();
    const found = USERS.find(x=>x.user===u && x.pass===p);
    if(!found){ flash('Usuário ou senha inválidos','err'); return; }
    await ss(SK.user, found);
    setState({user:found, view:'app', tab: found.role==='rest' ? 'ord' : 'est'});
  }});

  const userGroup = el('div',{className:'login-field'});
  const userLabel = el('label',{className:'login-label', for:'inp-user'},'Usuário');
  const userInp = el('input',{
    className:'login-input', id:'inp-user', type:'text',
    placeholder:'Digite seu usuário', autocomplete:'username', required:''
  });
  userGroup.appendChild(userLabel);
  userGroup.appendChild(userInp);

  const passGroup = el('div',{className:'login-field'});
  const passLabel = el('label',{className:'login-label', for:'inp-pass'},'Senha');
  const passWrap = el('div',{className:'login-input-wrap'});
  const passInp = el('input',{
    className:'login-input has-toggle', id:'inp-pass', type:'password',
    placeholder:'Digite sua senha', autocomplete:'current-password', required:''
  });
  const eyeBtn = el('button',{
    type:'button', className:'login-eye-btn',
    onClick:()=>{
      passInp.type = passInp.type==='password' ? 'text' : 'password';
      eyeBtn.textContent = passInp.type==='password' ? '👁' : '🙈';
    }
  },'👁');
  passWrap.appendChild(passInp);
  passWrap.appendChild(eyeBtn);
  passGroup.appendChild(passLabel);
  passGroup.appendChild(passWrap);

  const submitBtn = el('button',{type:'submit', className:'login-btn'});
  const btnText = el('span',{className:'login-btn-text'},'Entrar');
  const btnArrow = el('span',{className:'login-btn-arrow'},'→');
  submitBtn.appendChild(btnText);
  submitBtn.appendChild(btnArrow);

  form.appendChild(userGroup);
  form.appendChild(passGroup);
  form.appendChild(submitBtn);

  card.appendChild(logoWrap);
  card.appendChild(brand);
  card.appendChild(form);

  if(STATE.flash){
    const fb = el('div',{className:`login-flash ${STATE.flash.type}`}, STATE.flash.msg);
    card.appendChild(fb);
  }

  wrap.appendChild(card);
  return wrap;
}

/* ── APP SHELL ── */
function renderApp(){
  const wrap = el('div',{className:'app-wrap'});
  wrap.appendChild(renderHeader());

  if(STATE.flash){
    const fb = el('div',{className:`app-flash ${STATE.flash.type}`}, STATE.flash.msg);
    wrap.appendChild(fb);
  }

  const body = el('div',{className:'app-body'});
  const u = STATE.user;

  if(STATE.tab==='est' && u.role==='admin'){
    if(STATE.estImport) body.appendChild(renderEstImport());
    else if(STATE.estItem) body.appendChild(renderEstItem());
    else if(STATE.estSector) body.appendChild(renderEstSector());
    else body.appendChild(renderEstMap());
  } else if(STATE.tab==='ord'){
    if(u.role==='admin'){
      if(STATE.orderId) body.appendChild(renderOrderDetail());
      else body.appendChild(renderAdminPedidos());
    } else {
      if(STATE.orderId) body.appendChild(renderOrderDetail());
      else body.appendChild(renderClientPedidos());
    }
  } else if(STATE.tab==='inv' && u.role==='admin'){
    if(STATE.invoiceId) body.appendChild(renderInvoiceDetail());
    else body.appendChild(renderInvoices());
  } else if(STATE.tab==='rot' && u.role==='admin'){
    body.appendChild(renderRotas());
  } else if(STATE.tab==='cfg'){
    body.appendChild(renderConfig());
  }

  wrap.appendChild(body);

  if(STATE.modal) wrap.appendChild(renderModal());
  return wrap;
}

/* ── HEADER ── */
function renderHeader(){
  const u = STATE.user;
  const hdr = el('div',{className:'app-header'});
  const inner = el('div',{className:'app-header-inner'});

  const logoWrap = el('div',{className:'app-header-logo'});
  const logoImg = el('img',{className:'app-header-logo-img', src:LOGO, alt:'SAAB'});
  logoWrap.appendChild(logoImg);

  const nameBlock = el('div',{className:'app-header-name-block'});
  const appName = el('div',{className:'app-header-name'},'SAAB');
  const appSub = el('div',{className:'app-header-sub'},'Distribuidora');
  nameBlock.appendChild(appName);
  nameBlock.appendChild(appSub);

  inner.appendChild(logoWrap);
  inner.appendChild(nameBlock);

  const nav = el('nav',{className:'app-header-nav'});
  const tabs = u.role==='admin'
    ? [{k:'est',l:'Estoque'},{k:'ord',l:'Pedidos'},{k:'inv',l:'Invoice'},{k:'rot',l:'Rotas'},{k:'cfg',l:'Config'}]
    : [{k:'ord',l:'Pedidos'},{k:'cfg',l:'Config'}];

  for(const t of tabs){
    const btn = el('button',{
      className:`tab-btn${STATE.tab===t.k?' active':''}`,
      onClick:()=>setState({tab:t.k, estSector:null, estItem:null, estImport:false, orderId:null, invoiceId:null})
    });
    btn.textContent = t.l;
    if(t.k==='ord' && u.role==='admin'){
      const pending = STATE.orders.filter(o=>o.status==='pending').length;
      if(pending>0){
        const badge = el('span',{className:'tab-badge'}, String(pending));
        btn.appendChild(badge);
      }
    }
    nav.appendChild(btn);
  }

  const logoutBtn = el('button',{
    className:'tab-logout',
    onClick: async ()=>{
      await ss(SK.user, null);
      setState({user:null, view:'login', tab:'est', estSector:null, estItem:null, estImport:false, orderId:null, invoiceId:null});
    }
  },'Sair');
  nav.appendChild(logoutBtn);

  inner.appendChild(nav);
  hdr.appendChild(inner);
  return hdr;
}

function secTitle(txt){
  return el('div',{className:'sec-title up'}, txt);
}

/* ── ESTOQUE MAP ── */
function renderEstMap(){
  const wrap = el('div',{className:'est-map up'});
  wrap.appendChild(secTitle('Estoque'));

  const importBtn = el('button',{
    className:'btn-ghost',
    style:{marginBottom:'16px'},
    onClick:()=>setState({estImport:true})
  },'Importar / Exportar');
  wrap.appendChild(importBtn);

  const grid = el('div',{className:'est-grid'});
  for(const [sid, sec] of Object.entries(STATE.stock)){
    const card = el('div',{
      className: sec.cold ? 'est-card-cold' : 'est-card',
      onClick:()=>setState({estSector:sid})
    });
    const cardName = el('div',{className:'est-card-name'}, sec.name);
    const cardCount = el('div',{className:'est-card-count'});
    const low = sec.items.filter(i=>i.qty<=i.min).length;
    cardCount.textContent = `${sec.items.length} itens`;
    if(low>0){
      const warn = el('span',{className:'est-card-warn'}, ` · ${low} baixo`);
      cardCount.appendChild(warn);
    }
    card.appendChild(cardName);
    card.appendChild(cardCount);
    grid.appendChild(card);
  }
  wrap.appendChild(grid);
  return wrap;
}

/* ── ESTOQUE SETOR ── */
function renderEstSector(){
  const sid = STATE.estSector;
  const sec = STATE.stock[sid];
  const wrap = el('div',{className:'est-sector up'});

  const topRow = el('div',{className:'sec-top-row'});
  const back = el('button',{className:'btn-back', onClick:()=>setState({estSector:null, estItem:null})}, '← Voltar');
  topRow.appendChild(back);
  topRow.appendChild(secTitle(sec.name));
  wrap.appendChild(topRow);

  const addBtn = el('button',{
    className:'btn-red',
    style:{marginBottom:'16px'},
    onClick:()=>{
      STATE.modal = {type:'addItem', sid};
      render();
    }
  },'+ Adicionar Item');
  wrap.appendChild(addBtn);

  const list = el('div',{className:'est-item-list'});
  for(const item of sec.items){
    const row = el('div',{
      className:`est-item-row${item.qty<=item.min?' low':''}`,
      onClick:()=>setState({estItem:{sid, iid:item.id}})
    });
    const rowName = el('span',{className:'est-item-name'}, item.name);
    const rowQty = el('span',{className:'est-item-qty'}, `${item.qty} ${item.unit}`);
    row.appendChild(rowName);
    row.appendChild(rowQty);
    list.appendChild(row);
  }
  wrap.appendChild(list);
  return wrap;
}

/* ── ESTOQUE ITEM ── */
function renderEstItem(){
  const {sid, iid} = STATE.estItem;
  const sec = STATE.stock[sid];
  const item = sec.items.find(i=>i.id===iid);
  const wrap = el('div',{className:'est-item-detail up'});

  const topRow = el('div',{className:'sec-top-row'});
  const back = el('button',{className:'btn-back', onClick:()=>setState({estItem:null})}, '← Voltar');
  topRow.appendChild(back);
  topRow.appendChild(secTitle(item.name));
  wrap.appendChild(topRow);

  const infoCard = el('div',{className:'detail-card'});
  infoCard.appendChild(el('div',{className:'detail-row'},
    el('span',{className:'detail-label'},'Quantidade:'),
    el('span',{className:'detail-val'}, `${item.qty} ${item.unit}`)
  ));
  infoCard.appendChild(el('div',{className:'detail-row'},
    el('span',{className:'detail-label'},'Mínimo:'),
    el('span',{className:`detail-val${item.qty<=item.min?' text-warn':''}`}, `${item.min} ${item.unit}`)
  ));
  wrap.appendChild(infoCard);

  const adjRow = el('div',{className:'adj-row'});
  const adjInp = el('input',{type:'number', className:'adj-input', placeholder:'Qtd', min:'0'});
  const addBtn = el('button',{
    className:'btn-green',
    onClick:async ()=>{
      const v = parseFloat(adjInp.value);
      if(!v||v<=0){ flash('Valor inválido','err'); return; }
      item.qty = Math.round((item.qty+v)*100)/100;
      adjInp.value='';
      await persist();
      flash(`+${v} ${item.unit} adicionado`);
      render();
    }
  },'Entrada');
  const remBtn = el('button',{
    className:'btn-danger',
    onClick:async ()=>{
      const v = parseFloat(adjInp.value);
      if(!v||v<=0){ flash('Valor inválido','err'); return; }
      if(v>item.qty){ flash('Estoque insuficiente','err'); return; }
      item.qty = Math.round((item.qty-v)*100)/100;
      adjInp.value='';
      await persist();
      flash(`-${v} ${item.unit} removido`);
      render();
    }
  },'Saída');
  adjRow.appendChild(adjInp);
  adjRow.appendChild(addBtn);
  adjRow.appendChild(remBtn);
  wrap.appendChild(adjRow);

  const delBtn = el('button',{
    className:'btn-danger',
    style:{marginTop:'24px'},
    onClick:()=>{
      STATE.modal = {type:'confirmDelete', sid, iid, name:item.name};
      render();
    }
  },'Excluir Item');
  wrap.appendChild(delBtn);

  return wrap;
}

/* ── ESTOQUE IMPORT/EXPORT ── */
function renderEstImport(){
  const wrap = el('div',{className:'est-import up'});

  const topRow = el('div',{className:'sec-top-row'});
  const back = el('button',{className:'btn-back', onClick:()=>setState({estImport:false})}, '← Voltar');
  topRow.appendChild(back);
  topRow.appendChild(secTitle('Importar / Exportar'));
  wrap.appendChild(topRow);

  const exportBtn = el('button',{
    className:'btn-ghost',
    style:{marginBottom:'12px'},
    onClick:()=>{
      const data = JSON.stringify(STATE.stock, null, 2);
      const blob = new Blob([data],{type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href=url; a.download='estoque.json'; a.click();
      URL.revokeObjectURL(url);
    }
  },'Exportar JSON');
  wrap.appendChild(exportBtn);

  const fileLabel = el('label',{className:'detail-label'}, 'Importar JSON:');
  const fileInp = el('input',{type:'file', accept:'.json', className:'adj-input', style:{marginTop:'8px'}});
  const importBtn = el('button',{
    className:'btn-red',
    style:{marginTop:'12px'},
    onClick:async ()=>{
      if(!fileInp.files[0]){ flash('Selecione um arquivo','err'); return; }
      try{
        const txt = await fileInp.files[0].text();
        const parsed = JSON.parse(txt);
        STATE.stock = parsed;
        await persist();
        flash('Estoque importado com sucesso');
        setState({estImport:false});
      }catch{
        flash('Arquivo inválido','err');
      }
    }
  },'Importar');

  wrap.appendChild(fileLabel);
  wrap.appendChild(fileInp);
  wrap.appendChild(importBtn);
  return wrap;
}

/* ── ADMIN PEDIDOS ── */
function renderAdminPedidos(){
  const wrap = el('div',{className:'pedidos-wrap up'});
  wrap.appendChild(secTitle('Pedidos'));

  const newBtn = el('button',{
    className:'btn-red',
    style:{marginBottom:'16px'},
    onClick:()=>{
      STATE.modal = {type:'newOrder'};
      render();
    }
  },'+ Novo Pedido');
  wrap.appendChild(newBtn);

  const filter = el('div',{className:'order-filter'});
  const statuses = ['todos','pending','approved','rejected','invoiced'];
  const labels   = ['Todos','Pendente','Aprovado','Rejeitado','Faturado'];
  let activeFilter = 'todos';

  const filterBtns = statuses.map((s,i)=>{
    const b = el('button',{
      className:`btn-filter${s===activeFilter?' active':''}`,
      onClick:()=>{
        activeFilter = s;
        list.innerHTML='';
        renderList();
        filterBtns.forEach((fb,fi)=>fb.className=`btn-filter${statuses[fi]===activeFilter?' active':''}`);
      }
    }, labels[i]);
    return b;
  });
  filterBtns.forEach(b=>filter.appendChild(b));
  wrap.appendChild(filter);

  const list = el('div',{className:'order-list'});

  function renderList(){
    const orders = activeFilter==='todos'
      ? STATE.orders
      : STATE.orders.filter(o=>o.status===activeFilter);
    if(!orders.length){
      list.appendChild(el('div',{className:'empty-msg'},'Nenhum pedido encontrado.'));
      return;
    }
    for(const o of [...orders].reverse()){
      const client = STATE.clients.find(c=>c.id===o.clientId);
      const card = el('div',{
        className:`order-card up ${o.status}`,
        onClick:()=>setState({orderId:o.id})
      });
      const cardTop = el('div',{className:'order-card-top'});
      const cardId = el('span',{className:'order-card-id'}, `#${o.num||o.id.slice(-4).toUpperCase()}`);
      const cardDate = el('span',{className:'order-card-date'}, o.date);
      cardTop.appendChild(cardId);
      cardTop.appendChild(cardDate);

      const cardClient = el('div',{className:'order-card-client'}, client?.name||'—');
      const cardStatus = el('div',{className:`order-card-status ${o.status}`}, statusLabel(o.status));
      const cardTotal = el('div',{className:'order-card-total'}, `R$ ${o.total?.toFixed(2)||'0.00'}`);

      card.appendChild(cardTop);
      card.appendChild(cardClient);
      card.appendChild(cardStatus);
      card.appendChild(cardTotal);
      list.appendChild(card);
    }
  }

  renderList();
  wrap.appendChild(list);
  return wrap;
}

function statusLabel(s){
  const m = {pending:'Pendente',approved:'Aprovado',rejected:'Rejeitado',invoiced:'Faturado'};
  return m[s]||s;
}

/* ── CLIENT PEDIDOS ── */
function renderClientPedidos(){
  const u = STATE.user;
  const wrap = el('div',{className:'pedidos-wrap up'});
  wrap.appendChild(secTitle('Meus Pedidos'));

  const newBtn = el('button',{
    className:'btn-red',
    style:{marginBottom:'16px'},
    onClick:()=>{
      STATE.modal = {type:'newOrder', clientId:u.clientId};
      render();
    }
  },'+ Novo Pedido');
  wrap.appendChild(newBtn);

  const myOrders = STATE.orders.filter(o=>o.clientId===u.clientId);
  if(!myOrders.length){
    wrap.appendChild(el('div',{className:'empty-msg'},'Nenhum pedido ainda.'));
    return wrap;
  }

  const list = el('div',{className:'order-list'});
  for(const o of [...myOrders].reverse()){
    const card = el('div',{
      className:`order-card up ${o.status}`,
      onClick:()=>setState({orderId:o.id})
    });
    const cardTop = el('div',{className:'order-card-top'});
    cardTop.appendChild(el('span',{className:'order-card-id'}, `#${o.num||o.id.slice(-4).toUpperCase()}`));
    cardTop.appendChild(el('span',{className:'order-card-date'}, o.date));
    card.appendChild(cardTop);
    card.appendChild(el('div',{className:`order-card-status ${o.status}`}, statusLabel(o.status)));
    card.appendChild(el('div',{className:'order-card-total'}, `R$ ${o.total?.toFixed(2)||'0.00'}`));
    list.appendChild(card);
  }
  wrap.appendChild(list);
  return wrap;
}

/* ── ORDER DETAIL ── */
function renderOrderDetail(){
  const o = STATE.orders.find(x=>x.id===STATE.orderId);
  if(!o) return el('div',{},'Pedido não encontrado.');
  const client = STATE.clients.find(c=>c.id===o.clientId);
  const isAdmin = STATE.user.role==='admin';

  const wrap = el('div',{className:'order-detail up'});
  const topRow = el('div',{className:'sec-top-row'});
  const back = el('button',{className:'btn-back', onClick:()=>setState({orderId:null})}, '← Voltar');
  topRow.appendChild(back);
  topRow.appendChild(secTitle(`Pedido #${o.num||o.id.slice(-4).toUpperCase()}`));
  wrap.appendChild(topRow);

  const infoCard = el('div',{className:'detail-card'});
  infoCard.appendChild(el('div',{className:'detail-row'},
    el('span',{className:'detail-label'},'Cliente:'),
    el('span',{className:'detail-val'}, client?.name||'—')
  ));
  infoCard.appendChild(el('div',{className:'detail-row'},
    el('span',{className:'detail-label'},'Data:'),
    el('span',{className:'detail-val'}, o.date)
  ));
  infoCard.appendChild(el('div',{className:'detail-row'},
    el('span',{className:'detail-label'},'Status:'),
    el('span',{className:`detail-val status-${o.status}`}, statusLabel(o.status))
  ));
  infoCard.appendChild(el('div',{className:'detail-row'},
    el('span',{className:'detail-label'},'Total:'),
    el('span',{className:'detail-val text-bold'}, `R$ ${o.total?.toFixed(2)||'0.00'}`)
  ));
  wrap.appendChild(infoCard);

  const itemsTitle = el('div',{className:'sec-subtitle'},'Itens do Pedido');
  wrap.appendChild(itemsTitle);

  const itemList = el('div',{className:'order-item-list'});
  for(const item of o.items||[]){
    const row = el('div',{className:'order-item-row'});
    row.appendChild(el('span',{className:'order-item-name'}, item.name));
    row.appendChild(el('span',{className:'order-item-qty'}, `${item.qty} ${item.unit}`));
    row.appendChild(el('span',{className:'order-item-price'}, `R$ ${(item.price*item.qty).toFixed(2)}`));
    itemList.appendChild(row);
  }
  wrap.appendChild(itemList);

  if(isAdmin && o.status==='pending'){
    const actions = el('div',{className:'order-actions'});
    const approveBtn = el('button',{
      className:'btn-green',
      onClick: async ()=>{
        o.status='approved';
        await persist();
        flash('Pedido aprovado');
        render();
      }
    },'Aprovar');
    const rejectBtn = el('button',{
      className:'btn-danger',
      onClick: async ()=>{
        o.status='rejected';
        await persist();
        flash('Pedido rejeitado','err');
        render();
      }
    },'Rejeitar');
    actions.appendChild(approveBtn);
    actions.appendChild(rejectBtn);
    wrap.appendChild(actions);
  }

  if(isAdmin && o.status==='approved'){
    const invBtn = el('button',{
      className:'btn-blue',
      style:{marginTop:'16px'},
      onClick: async ()=>{
        const inv = {
          id: uid(), orderId: o.id, clientId: o.clientId,
          date: today(), total: o.total, items: o.items, num: o.num
        };
        STATE.invoices.push(inv);
        o.status='invoiced';
        await persist();
        flash('Invoice gerada');
        setState({tab:'inv', orderId:null});
      }
    },'Gerar Invoice');
    wrap.appendChild(invBtn);
  }

  return wrap;
}

/* ── INVOICES LIST ── */
function renderInvoices(){
  const wrap = el('div',{className:'invoices-wrap up'});
  wrap.appendChild(secTitle('Invoices'));

  if(!STATE.invoices.length){
    wrap.appendChild(el('div',{className:'empty-msg'},'Nenhuma invoice ainda.'));
    return wrap;
  }

  const list = el('div',{className:'invoice-list'});
  for(const inv of [...STATE.invoices].reverse()){
    const client = STATE.clients.find(c=>c.id===inv.clientId);
    const row = el('div',{
      className:'invoice-row',
      onClick:()=>setState({invoiceId:inv.id})
    });
    row.appendChild(el('span',{className:'invoice-num'}, `#${inv.num||inv.id.slice(-4).toUpperCase()}`));
    row.appendChild(el('span',{className:'invoice-client'}, client?.name||'—'));
    row.appendChild(el('span',{className:'invoice-date'}, inv.date));
    row.appendChild(el('span',{className:'invoice-total'}, `R$ ${inv.total?.toFixed(2)||'0.00'}`));
    list.appendChild(row);
  }
  wrap.appendChild(list);
  return wrap;
}

/* ── INVOICE DETAIL ── */
function renderInvoiceDetail(){
  const inv = STATE.invoices.find(x=>x.id===STATE.invoiceId);
  if(!inv) return el('div',{},'Invoice não encontrada.');
  const client = STATE.clients.find(c=>c.id===inv.clientId);

  const wrap = el('div',{className:'invoice-detail up'});
  const topRow = el('div',{className:'sec-top-row'});
  const back = el('button',{className:'btn-back', onClick:()=>setState({invoiceId:null})}, '← Voltar');
  topRow.appendChild(back);
  topRow.appendChild(secTitle(`Invoice #${inv.num||inv.id.slice(-4).toUpperCase()}`));
  wrap.appendChild(topRow);

  const infoCard = el('div',{className:'detail-card'});
  infoCard.appendChild(el('div',{className:'detail-row'},
    el('span',{className:'detail-label'},'Cliente:'),
    el('span',{className:'detail-val'}, client?.name||'—')
  ));
  infoCard.appendChild(el('div',{className:'detail-row'},
    el('span',{className:'detail-label'},'Data:'),
    el('span',{className:'detail-val'}, inv.date)
  ));
  infoCard.appendChild(el('div',{className:'detail-row'},
    el('span',{className:'detail-label'},'Total:'),
    el('span',{className:'detail-val text-bold'}, `R$ ${inv.total?.toFixed(2)||'0.00'}`)
  ));
  wrap.appendChild(infoCard);

  const itemsTitle = el('div',{className:'sec-subtitle'},'Itens');
  wrap.appendChild(itemsTitle);

  const itemList = el('div',{className:'order-item-list'});
  for(const item of inv.items||[]){
    const row = el('div',{className:'order-item-row'});
    row.appendChild(el('span',{className:'order-item-name'}, item.name));
    row.appendChild(el('span',{className:'order-item-qty'}, `${item.qty} ${item.unit}`));
    row.appendChild(el('span',{className:'order-item-price'}, `R$ ${(item.price*item.qty).toFixed(2)}`));
    itemList.appendChild(row);
  }
  wrap.appendChild(itemList);

  const printBtn = el('button',{
    className:'btn-ghost',
    style:{marginTop:'16px'},
    onClick:()=>window.print()
  },'Imprimir / PDF');
  wrap.appendChild(printBtn);

  return wrap;
}

/* ── ROTAS ── */
function renderRotas(){
  const wrap = el('div',{className:'rotas-wrap up'});
  wrap.appendChild(secTitle('Rotas de Entrega'));

  const approved = STATE.orders.filter(o=>o.status==='approved'||o.status==='invoiced');
  if(!approved.length){
    wrap.appendChild(el('div',{className:'empty-msg'},'Nenhum pedido aprovado para roteirizar.'));
    return wrap;
  }

  const list = el('div',{className:'rota-list'});
  for(const o of approved){
    const client = STATE.clients.find(c=>c.id===o.clientId);
    const row = el('div',{className:'rota-row'});
    row.appendChild(el('span',{className:'rota-num'}, `#${o.num||o.id.slice(-4).toUpperCase()}`));
    row.appendChild(el('span',{className:'rota-client'}, client?.name||'—'));
    row.appendChild(el('span',{className:'rota-addr'}, client?.address||'—'));
    row.appendChild(el('span',{className:`rota-status ${o.status}`}, statusLabel(o.status)));
    list.appendChild(row);
  }
  wrap.appendChild(list);
  return wrap;
}

/* ── CONFIG ── */
function renderConfig(){
  const u = STATE.user;
  const wrap = el('div',{className:'config-wrap up'});
  wrap.appendChild(secTitle('Configurações'));

  const profileCard = el('div',{className:'detail-card'});
  profileCard.appendChild(el('div',{className:'detail-row'},
    el('span',{className:'detail-label'},'Nome:'),
    el('span',{className:'detail-val'}, u.name)
  ));
  profileCard.appendChild(el('div',{className:'detail-row'},
    el('span',{className:'detail-label'},'Usuário:'),
    el('span',{className:'detail-val'}, u.user)
  ));
  profileCard.appendChild(el('div',{className:'detail-row'},
    el('span',{className:'detail-label'},'Perfil:'),
    el('span',{className:'detail-val'}, u.role==='admin'?'Administrador':'Restaurante')
  ));
  wrap.appendChild(profileCard);

  if(u.role==='admin'){
    wrap.appendChild(el('div',{className:'sec-subtitle', style:{marginTop:'24px'}},'Clientes'));
    const clientList = el('div',{className:'client-list'});
    for(const c of STATE.clients){
      const row = el('div',{className:'client-row'});
      row.appendChild(el('span',{className:'client-name'}, c.name));
      row.appendChild(el('span',{className:'client-phone'}, c.phone));
      clientList.appendChild(row);
    }
    wrap.appendChild(clientList);

    const addClientBtn = el('button',{
      className:'btn-red',
      style:{marginTop:'12px'},
      onClick:()=>{
        STATE.modal = {type:'addClient'};
        render();
      }
    },'+ Adicionar Cliente');
    wrap.appendChild(addClientBtn);
  }

  const logoutBtn = el('button',{
    className:'btn-danger',
    style:{marginTop:'32px'},
    onClick: async ()=>{
      await ss(SK.user, null);
      setState({user:null, view:'login', tab:'est', estSector:null, estItem:null, estImport:false, orderId:null, invoiceId:null});
    }
  },'Sair da Conta');
  wrap.appendChild(logoutBtn);

  return wrap;
}

/* ── MODAL ── */
function renderModal(){
  const m = STATE.modal;
  const overlay = el('div',{
    className:'modal-overlay',
    onClick: e=>{ if(e.target===overlay){ STATE.modal=null; render(); } }
  });
  const box = el('div',{className:'modal-box'});

  if(m.type==='confirmDelete'){
    box.appendChild(el('div',{className:'modal-title'},`Excluir "${m.name}"?`));
    box.appendChild(el('div',{className:'modal-body'},'Esta ação não pode ser desfeita.'));
    const actions = el('div',{className:'modal-actions'});
    actions.appendChild(el('button',{
      className:'btn-ghost',
      onClick:()=>{ STATE.modal=null; render(); }
    },'Cancelar'));
    actions.appendChild(el('button',{
      className:'btn-danger',
      onClick: async ()=>{
        const sec = STATE.stock[m.sid];
        sec.items = sec.items.filter(i=>i.id!==m.iid);
        await persist();
        STATE.modal=null;
        flash('Item excluído');
        setState({estItem:null});
      }
    },'Excluir'));
    box.appendChild(actions);
  }

  else if(m.type==='addItem'){
    box.appendChild(el('div',{className:'modal-title'},'Novo Item'));
    const nameInp = el('input',{type:'text', className:'modal-input', placeholder:'Nome do item'});
    const unitInp = el('input',{type:'text', className:'modal-input', placeholder:'Unidade (kg, un, pct...)'});
    const qtyInp  = el('input',{type:'number', className:'modal-input', placeholder:'Quantidade inicial', min:'0'});
    const minInp  = el('input',{type:'number', className:'modal-input', placeholder:'Estoque mínimo', min:'0'});
    box.appendChild(nameInp); box.appendChild(unitInp);
    box.appendChild(qtyInp);  box.appendChild(minInp);
    const actions = el('div',{className:'modal-actions'});
    actions.appendChild(el('button',{
      className:'btn-ghost',
      onClick:()=>{ STATE.modal=null; render(); }
    },'Cancelar'));
    actions.appendChild(el('button',{
      className:'btn-red',
      onClick: async ()=>{
        const name=nameInp.value.trim(), unit=unitInp.value.trim(),
              qty=parseFloat(qtyInp.value)||0, min=parseFloat(minInp.value)||0;
        if(!name||!unit){ flash('Preencha nome e unidade','err'); return; }
        STATE.stock[m.sid].items.push({id:uid(), name, unit, qty, min});
        await persist();
        STATE.modal=null;
        flash('Item adicionado');
        render();
      }
    },'Adicionar'));
    box.appendChild(actions);
  }

  else if(m.type==='newOrder'){
    box.appendChild(el('div',{className:'modal-title'},'Novo Pedido'));
    const clients = m.clientId
      ? STATE.clients.filter(c=>c.id===m.clientId)
      : STATE.clients.filter(c=>c.active);

    let selClientId = m.clientId || (clients[0]?.id||'');
    let orderItems = [];

    const clientSel = el('select',{className:'modal-input',
      onChange: e=>{ selClientId=e.target.value; }
    });
    for(const c of clients){
      const opt = el('option',{value:c.id}, c.name);
      if(c.id===selClientId) opt.setAttribute('selected','');
      clientSel.appendChild(opt);
    }
    if(!m.clientId) box.appendChild(clientSel);

    const allItems = Object.values(STATE.stock).flatMap(s=>s.items.map(i=>({...i})));
    const itemSel = el('select',{className:'modal-input'});
    for(const i of allItems){
      itemSel.appendChild(el('option',{value:i.id}, `${i.name} (${i.qty} ${i.unit})`));
    }
    const qtyInp = el('input',{type:'number', className:'modal-input', placeholder:'Quantidade', min:'0.1', step:'0.1'});
    const priceInp = el('input',{type:'number', className:'modal-input', placeholder:'Preço unitário (R$)', min:'0', step:'0.01'});

    const addItemBtn = el('button',{
      className:'btn-ghost',
      style:{marginBottom:'8px'},
      onClick:()=>{
        const iid=itemSel.value;
        const qty=parseFloat(qtyInp.value);
        const price=parseFloat(priceInp.value);
        const item=allItems.find(i=>i.id===iid);
        if(!item||!qty||qty<=0||!price||price<=0){ flash('Dados inválidos','err'); return; }
        const existing=orderItems.find(x=>x.id===iid);
        if(existing){ existing.qty+=qty; }
        else { orderItems.push({...item, qty, price}); }
        qtyInp.value=''; priceInp.value='';
        refreshItemList();
      }
    },'+ Adicionar Item');

    const itemListDiv = el('div',{className:'modal-item-list'});
    function refreshItemList(){
      itemListDiv.innerHTML='';
      let total=0;
      for(const oi of orderItems){
        const row = el('div',{className:'modal-item-row'});
        row.appendChild(el('span',{},`${oi.name} × ${oi.qty} ${oi.unit}`));
        const sub=oi.price*oi.qty;
        total+=sub;
        row.appendChild(el('span',{className:'text-bold'},`R$ ${sub.toFixed(2)}`));
        row.appendChild(el('button',{
          className:'btn-danger',
          style:{padding:'2px 8px', fontSize:'12px'},
          onClick:()=>{ orderItems=orderItems.filter(x=>x.id!==oi.id); refreshItemList(); }
        },'×'));
        itemListDiv.appendChild(row);
      }
      if(orderItems.length) itemListDiv.appendChild(el('div',{className:'modal-total'},`Total: R$ ${total.toFixed(2)}`));
    }

    box.appendChild(itemSel);
    box.appendChild(qtyInp);
    box.appendChild(priceInp);
    box.appendChild(addItemBtn);
    box.appendChild(itemListDiv);

    const actions = el('div',{className:'modal-actions'});
    actions.appendChild(el('button',{
      className:'btn-ghost',
      onClick:()=>{ STATE.modal=null; render(); }
    },'Cancelar'));
    actions.appendChild(el('button',{
      className:'btn-red',
      onClick: async ()=>{
        if(!orderItems.length){ flash('Adicione ao menos um item','err'); return; }
        const total=orderItems.reduce((a,i)=>a+i.price*i.qty,0);
        const nextNum = (await sg(SK.nextOrd)||100)+1;
        await ss(SK.nextOrd, nextNum);
        const order = {
          id:uid(), num:nextNum, clientId:selClientId,
          date:today(), status:'pending', items:orderItems, total
        };
        STATE.orders.push(order);
        await persist();
        STATE.modal=null;
        flash('Pedido criado');
        render();
      }
    },'Criar Pedido'));
    box.appendChild(actions);
  }

  else if(m.type==='addClient'){
    box.appendChild(el('div',{className:'modal-title'},'Novo Cliente'));
    const nameInp    = el('input',{type:'text',  className:'modal-input', placeholder:'Nome'});
    const contactInp = el('input',{type:'text',  className:'modal-input', placeholder:'Contato'});
    const phoneInp   = el('input',{type:'tel',   className:'modal-input', placeholder:'Telefone'});
    const addrInp    = el('input',{type:'text',  className:'modal-input', placeholder:'Endereço'});
    box.appendChild(nameInp); box.appendChild(contactInp);
    box.appendChild(phoneInp); box.appendChild(addrInp);
    const actions = el('div',{className:'modal-actions'});
    actions.appendChild(el('button',{
      className:'btn-ghost',
      onClick:()=>{ STATE.modal=null; render(); }
    },'Cancelar'));
    actions.appendChild(el('button',{
      className:'btn-red',
      onClick: async ()=>{
        const name=nameInp.value.trim();
        if(!name){ flash('Nome obrigatório','err'); return; }
        STATE.clients.push({
          id:uid(), name, contact:contactInp.value.trim(),
          phone:phoneInp.value.trim(), address:addrInp.value.trim(), active:true
        });
        await persist();
        STATE.modal=null;
        flash('Cliente adicionado');
        render();
      }
    },'Adicionar'));
    box.appendChild(actions);
  }

  overlay.appendChild(box);
  return overlay;
}

init();
