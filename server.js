const http=require("http"), fs=require("fs"), path=require("path"), crypto=require("crypto"), querystring=require("querystring");
const ROOT=__dirname, DATA=path.join(ROOT,"data","store.json"), PUBLIC=path.join(ROOT,"public");
if(!fs.existsSync(DATA)) fs.writeFileSync(DATA,JSON.stringify({products:[],orders:[]},null,2));
function db(){return JSON.parse(fs.readFileSync(DATA,"utf8"))} function save(x){fs.writeFileSync(DATA,JSON.stringify(x,null,2))}
function send(res,code,type,body){res.writeHead(code,{"Content-Type":type});res.end(body)}
function json(res,code,obj){send(res,code,"application/json; charset=utf-8",JSON.stringify(obj))}
function parseBody(req){return new Promise((resolve,reject)=>{let b="";req.on("data",c=>b+=c);req.on("end",()=>{try{resolve(JSON.parse(b||"{}"))}catch(e){reject(e)}})})}
function id(){return crypto.randomBytes(6).toString("hex")}
const server=http.createServer(async(req,res)=>{
 try{
  if(req.method==="GET" && req.url==="/api/products") return json(res,200,db().products);
  if(req.method==="POST" && req.url==="/api/products"){
   const x=await parseBody(req), d=db(); x.id=id(); x.createdAt=Date.now(); d.products.unshift(x); save(d); return json(res,201,x);
  }
  if(req.method==="DELETE" && req.url.startsWith("/api/products/")){
   const id=req.url.split("/").pop(),d=db();d.products=d.products.filter(x=>x.id!==id);save(d);return json(res,200,{ok:true});
  }
  if(req.method==="PUT" && req.url.startsWith("/api/products/")){
   const id=req.url.split("/").pop(),x=await parseBody(req),d=db(),i=d.products.findIndex(p=>p.id===id);
   if(i<0)return json(res,404,{error:"Produit introuvable"});d.products[i]={...d.products[i],...x,id};save(d);return json(res,200,d.products[i]);
  }
  if(req.method==="GET" && req.url==="/api/orders") return json(res,200,db().orders);
  if(req.method==="POST" && req.url==="/api/orders"){
   const x=await parseBody(req),d=db();x.id="CMD-"+id().toUpperCase();x.createdAt=Date.now();x.status="Nouveau";d.orders.unshift(x);save(d);return json(res,201,x);
  }
  if(req.method==="PUT" && req.url.startsWith("/api/orders/")){
   const id=req.url.split("/").pop(),x=await parseBody(req),d=db(),o=d.orders.find(a=>a.id===id);
   if(!o)return json(res,404,{error:"Commande introuvable"});o.status=x.status||o.status;save(d);return json(res,200,o);
  }
  let p=req.url.split("?")[0]; if(p==="/")p="/index.html"; let f=path.join(PUBLIC,p);
  if(!f.startsWith(PUBLIC)||!fs.existsSync(f)||fs.statSync(f).isDirectory())return send(res,404,"text/plain","Not found");
  const ext=path.extname(f),types={".html":"text/html; charset=utf-8",".css":"text/css",".js":"application/javascript",".json":"application/json"};
  send(res,200,types[ext]||"application/octet-stream",fs.readFileSync(f));
 }catch(e){json(res,500,{error:e.message})}
});
server.listen(3000,()=>console.log("La Reine: http://localhost:3000"));
server.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log(`La Reine: http://0.0.0.0:${process.env.PORT || 3000}`);
});
