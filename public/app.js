const $=s=>document.querySelector(s);
let products=[],orders=[];
async function api(u,o){let r=await fetch(u,o);return r.json()}
async function load(){products=await api("/api/products");orders=await api("/api/orders");renderStore();renderAdmin()}
function money(n){return Number(n).toLocaleString("fr-FR")+" TND"}
function renderStore(){
 $("#products").innerHTML=products.length?products.map(p=>`<article><div class="pic">${p.image?`<img src="${p.image}">`:`<span>${p.emoji||"👗"}</span>`}</div><h3>${esc(p.name)}</h3><p>${esc(p.category)} · ${esc(p.sizes||"")}</p><b>${money(p.price)}</b></article>`).join(""):`<div class="empty">Aucun produit pour le moment.</div>`;
}
function renderAdmin(){
 $("#productRows").innerHTML=products.map(p=>`<tr><td>${p.image?`<img class="thumb" src="${p.image}">`:"👗"}</td><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>${money(p.price)}</td><td>${esc(p.sizes||"")}</td><td><button onclick="editProduct('${p.id}')">Modifier</button> <button class="danger" onclick="delProduct('${p.id}')">Supprimer</button></td></tr>`).join("");
 $("#orderRows").innerHTML=orders.map(o=>`<tr><td>${o.id}</td><td>${esc(o.name)}</td><td>${esc(o.phone)}</td><td>${esc(o.address)}</td><td>${money(o.total)}</td><td><select onchange="status('${o.id}',this.value)">${["Nouveau","Confirmé","Expédié","Livré","Annulé"].map(s=>`<option ${s===o.status?"selected":""}>${s}</option>`).join("")}</select></td></tr>`).join("");
 $("#statProducts").textContent=products.length;$("#statOrders").textContent=orders.length;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function openAdmin(){if(sessionStorage.getItem("admin")!=="1")return $("#login").classList.add("show");$("#admin").classList.add("show")}
function login(){if($("#user").value==="admin"&&$("#pass").value==="admin123"){sessionStorage.setItem("admin","1");$("#login").classList.remove("show");$("#admin").classList.add("show");}else alert("Identifiants incorrects")}
function logout(){sessionStorage.removeItem("admin");$("#admin").classList.remove("show")}
function addProduct(){const f=$("#image").files[0];let p={name:$("#name").value,category:$("#category").value,price:Number($("#price").value),sizes:$("#sizes").value,description:$("#description").value,emoji:"👗"};if(!p.name||!p.price)return alert("Nom et prix obligatoires");const done=()=>api("/api/products",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)}).then(()=>{resetForm();load()});if(f){const r=new FileReader();r.onload=()=>{p.image=r.result;done()};r.readAsDataURL(f)}else done()}
function resetForm(){["name","price","sizes","description","image"].forEach(x=>{if($("#"+x))$("#"+x).value=""})}
async function delProduct(id){if(!confirm("Supprimer ce produit ?"))return;await api("/api/products/"+id,{method:"DELETE"});load()}
function editProduct(id){const p=products.find(x=>x.id===id);$("#editId").value=id;$("#name").value=p.name;$("#category").value=p.category;$("#price").value=p.price;$("#sizes").value=p.sizes||"";$("#description").value=p.description||"";$("#saveEdit").style.display="inline-block";$("#cancelEdit").style.display="inline-block";window.scrollTo({top:0,behavior:"smooth"})}
async function saveEdit(){const id=$("#editId").value,p=products.find(x=>x.id===id),f=$("#image").files[0],x={name:$("#name").value,category:$("#category").value,price:Number($("#price").value),sizes:$("#sizes").value,description:$("#description").value};if(f){const r=new FileReader();r.onload=async()=>{x.image=r.result;await api("/api/products/"+id,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(x)});cancelEdit();load()};r.readAsDataURL(f)}else{if(p.image)x.image=p.image;await api("/api/products/"+id,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(x)});cancelEdit();load()}}
function cancelEdit(){$("#editId").value="";resetForm();$("#saveEdit").style.display="none";$("#cancelEdit").style.display="none"}
async function status(id,v){await api("/api/orders/"+id,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:v})});load()}
function search(){let q=$("#search").value.toLowerCase();document.querySelectorAll("#products article").forEach(a=>a.style.display=a.textContent.toLowerCase().includes(q)?"":"none")}
async function orderDemo(){if(!products.length)return alert("Ajoutez d'abord un produit.");let p=products[0];await api("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:"Client Démo",phone:"+216 00 000 000",address:"Tunis",total:p.price,items:[{id:p.id,name:p.name,qty:1}]})});load();alert("Commande démo ajoutée. Ouvrez Admin pour la gérer.")}
load();
