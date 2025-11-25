// dashboard.js

// protect page
const session = JSON.parse(localStorage.getItem('admin_logged')||'null');
if(!session){ window.location.href='admin.html'; }

// show admin
document.getElementById('admin-info').textContent = `Signed in as: ${session.username}`;

// helpers
function loadProducts(){ return JSON.parse(localStorage.getItem('ehsan_products_v1') || '[]'); }
function saveProducts(list){ localStorage.setItem('ehsan_products_v1', JSON.stringify(list)); }
function loadOrders(){ return JSON.parse(localStorage.getItem('ehsan_orders_v1') || '[]'); }
function saveOrders(list){ localStorage.setItem('ehsan_orders_v1', JSON.stringify(list)); }
function loadBanks(){ return JSON.parse(localStorage.getItem('ehsan_banks_v1') || '[]'); }
function saveBanks(list){ localStorage.setItem('ehsan_banks_v1', JSON.stringify(list)); }

// initialize product list with defaults if empty
if(!localStorage.getItem('ehsan_products_v1')){
  saveProducts([
    {id:'p1',title:'Classic Cotton Shirt',price:2499,image:'assets/product1.jpg',qty:10},
    {id:'p2',title:'Formal Men Watch',price:4999,image:'assets/product2.jpg',qty:5}
  ]);
}

function renderProducts(){
  const list = loadProducts(); const container=document.getElementById('product-list'); container.innerHTML='';
  list.forEach((p,idx)=>{
    const el=document.createElement('div'); el.className='p-2 border-b flex items-center justify-between';
    el.innerHTML = `<div style="display:flex;gap:10px;align-items:center">
      <img src="${p.image}" style="width:60px;height:60px;object-fit:cover;border-radius:8px" onerror="this.src='assets/product-placeholder.png'"/>
      <div><div style="font-weight:600">${p.title}</div><div class="text-sm">PKR ${p.price}</div><div class="text-sm">Stock: ${p.qty}</div></div>
    </div>
    <div>
      <button data-id="${p.id}" class="edit-product btn" style="margin-right:6px">Edit</button>
      <button data-id="${p.id}" class="del-product btn" style="background:#ef4444">Delete</button>
    </div>`;
    container.appendChild(el);
  });

  // handlers
  document.querySelectorAll('.edit-product').forEach(b=> b.addEventListener('click', ()=> openProductModal(b.getAttribute('data-id'))));
  document.querySelectorAll('.del-product').forEach(b=> b.addEventListener('click', ()=>{
    if(!confirm('Delete product?')) return;
    const id=b.getAttribute('data-id'); const products=loadProducts(); const idx=products.findIndex(x=>x.id===id); if(idx>-1){ products.splice(idx,1); saveProducts(products); renderProducts(); }
  }));
}

function openProductModal(id){
  const modal=document.getElementById('modal'); const content=document.getElementById('modal-content');
  let p = {id:'',title:'',price:0,image:'',qty:0};
  if(id){ const list=loadProducts(); p=list.find(x=>x.id===id) || p; }
  content.innerHTML = `
    <h3>${id? 'Edit Product': 'Add Product'}</h3>
    <div style="margin-top:8px"><input id="m-title" placeholder="Title" class="input" value="${p.title}"/></div>
    <div style="margin-top:8px"><input id="m-price" placeholder="Price" class="input" value="${p.price}"/></div>
    <div style="margin-top:8px"><input id="m-image" placeholder="Image path (assets/...)" class="input" value="${p.image}"/></div>
    <div style="margin-top:8px"><input id="m-qty" placeholder="Quantity" class="input" value="${p.qty}"/></div>
    <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end">
      <button id="m-cancel" class="btn" style="background:#9ca3af">Cancel</button>
      <button id="m-save" class="btn">Save</button>
    </div>
  `;
  modal.classList.remove('hidden');
  document.getElementById('m-cancel').addEventListener('click', ()=> modal.classList.add('hidden'));
  document.getElementById('m-save').addEventListener('click', ()=>{
    const title=document.getElementById('m-title').value.trim();
    const price=Number(document.getElementById('m-price').value.trim()||0);
    const image=document.getElementById('m-image').value.trim();
    const qty=Number(document.getElementById('m-qty').value.trim()||0);
    let list=loadProducts();
    if(id){ const obj=list.find(x=>x.id===id); if(obj){ obj.title=title; obj.price=price; obj.image=image; obj.qty=qty; } }
    else { const newId = 'p'+Date.now(); list.push({id:newId,title,price,image,qty}); }
    saveProducts(list); modal.classList.add('hidden'); renderProducts();
  });
}

document.getElementById('new-product').addEventListener('click', ()=> openProductModal(null));

// orders
function renderOrders(){
  const orders=loadOrders(); const container=document.getElementById('orders-list'); container.innerHTML='';
  if(orders.length===0) container.innerHTML='<div class="text-gray-600">No orders yet.</div>';
  orders.slice().reverse().forEach(o=>{
    const el=document.createElement('div'); el.className='p-2 border-b';
    el.innerHTML = `<div style="display:flex;justify-content:space-between"><div><b>${o.id}</b> - ${new Date(o.date).toLocaleString()}</div><div><b>PKR ${o.total}</b></div></div>
      <div>Name: ${o.name} | Phone: ${o.phone}</div>
      <div>Address: ${o.address}</div>
      <div>Tx: ${o.tx || 'N/A'}</div>
      <div style="margin-top:6px">Status: ${o.status} <button data-id="${o.id}" class="btn mark-done" style="margin-left:8px">Mark Complete</button></div>
    `;
    container.appendChild(el);
  });

  document.querySelectorAll('.mark-done').forEach(b=> b.addEventListener('click', ()=>{
    const id=b.getAttribute('data-id'); const orders=loadOrders(); const ord=orders.find(x=>x.id===id); if(ord){ ord.status='Completed'; saveOrders(orders); renderOrders(); }
  }));
}

// export orders CSV
function exportOrdersCSV(){
  const orders=loadOrders(); if(orders.length===0){ alert('No orders'); return; }
  let csv='OrderID,Date,Name,Phone,Address,Transaction,Total,Status\\n';
  orders.forEach(o=>{
    csv += `${o.id},${o.date},${o.name},${o.phone},"${o.address}",${o.tx || ''},${o.total},${o.status}\\n`;
  });
  const blob = new Blob([csv], {type:'text/csv'}); const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='orders_export.csv'; a.click(); URL.revokeObjectURL(url);
}

document.getElementById('export-orders').addEventListener('click', exportOrdersCSV);

// banks management
function renderBanks(){
  const banks=loadBanks(); const container=document.getElementById('bank-list'); container.innerHTML='';
  if(banks.length===0) container.innerHTML='<div class="text-gray-600">No banks added.</div>';
  banks.forEach((b,idx)=> {
    const el=document.createElement('div'); el.className='p-2 border-b flex justify-between';
    el.innerHTML = `<div><b>${b.bankName}</b><div>Account: ${b.accountNumber} | IBAN: ${b.iban || ''}</div></div>
      <div><button data-i="${idx}" class="btn edit-bank">Edit</button><button data-i="${idx}" class="btn" style="background:#ef4444">Delete</button></div>`;
    container.appendChild(el);
  });
  document.querySelectorAll('.edit-bank').forEach(x=> x.addEventListener('click', ()=> openBankModal(Number(x.getAttribute('data-i')))));
  document.querySelectorAll('#bank-list .btn[style*="background:#ef4444"]').forEach(x=> x.addEventListener('click', ()=>{
    const i=Number(x.getAttribute('data-i')); const banks=loadBanks(); banks.splice(i,1); saveBanks(banks); renderBanks();
  }));
}

function openBankModal(idx){
  const modal=document.getElementById('modal'); const content=document.getElementById('modal-content');
  let bank = {bankName:'',accountNumber:'',iban:''};
  if(typeof idx === 'number' && !isNaN(idx) && loadBanks()[idx]) bank = loadBanks()[idx];
  content.innerHTML = `<h3>${idx!=null ? 'Edit Bank' : 'Add Bank'}</h3>
    <div style="margin-top:8px"><input id="b-name" class="input" placeholder="Bank Name" value="${bank.bankName}"/></div>
    <div style="margin-top:8px"><input id="b-ac" class="input" placeholder="Account Number" value="${bank.accountNumber}"/></div>
    <div style="margin-top:8px"><input id="b-iban" class="input" placeholder="IBAN" value="${bank.iban}"/></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button id="b-cancel" class="btn" style="background:#9ca3af">Cancel</button><button id="b-save" class="btn">Save</button></div>`;
  modal.classList.remove('hidden');
  document.getElementById('b-cancel').addEventListener('click', ()=> modal.classList.add('hidden'));
  document.getElementById('b-save').addEventListener('click', ()=>{
    const nm=document.getElementById('b-name').value.trim(); const ac=document.getElementById('b-ac').value.trim(); const ib=document.getElementById('b-iban').value.trim();
    let banks = loadBanks();
    if(idx!=null && banks[idx]){ banks[idx]={bankName:nm,accountNumber:ac,iban:ib}; } else { banks.push({bankName:nm,accountNumber:ac,iban:ib}); }
    saveBanks(banks); modal.classList.add('hidden'); renderBanks();
  });
}

document.getElementById('add-bank').addEventListener('click', ()=> openBankModal(null));

// add admin modal
document.getElementById('add-admin-btn').addEventListener('click', ()=>{
  const modal=document.getElementById('modal'); const content=document.getElementById('modal-content');
  content.innerHTML = `<h3>Add Admin</h3>
    <div style="margin-top:8px"><input id="a-user" class="input" placeholder="Username"/></div>
    <div style="margin-top:8px"><input id="a-pass" class="input" placeholder="Password"/></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button id="a-cancel" class="btn" style="background:#9ca3af">Cancel</button><button id="a-save" class="btn">Save</button></div>`;
  modal.classList.remove('hidden');
  document.getElementById('a-cancel').addEventListener('click', ()=> modal.classList.add('hidden'));
  document.getElementById('a-save').addEventListener('click', ()=>{
    const u=document.getElementById('a-user').value.trim(); const p=document.getElementById('a-pass').value.trim();
    if(!u||!p) return;
    const admins = JSON.parse(localStorage.getItem('admin_users')||'[]'); admins.push({username:u,password:p,role:'admin'}); localStorage.setItem('admin_users', JSON.stringify(admins));
    modal.classList.add('hidden'); alert('Admin added');
  });
});

document.getElementById('logout-btn').addEventListener('click', ()=> { localStorage.removeItem('admin_logged'); window.location.href='admin.html'; });

// initial render
renderProducts(); renderOrders(); renderBanks();
