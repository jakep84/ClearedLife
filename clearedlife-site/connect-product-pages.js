
(function(){
const map=[['.product-card.ready','ready.html','Explore Ready →'],['.product-card.vault','vault.html','Explore Vault →'],['.product-card.guard','guard.html','Explore Guard →'],['.product-card.jobs','jobs.html','Explore Jobs →']];
map.forEach(([s,h,l])=>{const c=document.querySelector(s);if(c&&!c.querySelector('.product-link')){const a=document.createElement('a');a.href=h;a.className='product-link';a.textContent=l;c.appendChild(a)}});
const e=document.querySelector('#employers .section-heading');if(e){const a=document.createElement('a');a.href='employers.html';a.className='product-link';a.textContent='Open ClearedLife for Employers →';e.appendChild(a)}
const p=document.querySelector('#pricing .section-heading');if(p){const d=document.createElement('div');d.style='display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px';d.innerHTML='<a class="button secondary" href="career.html">ClearedLife Career</a><a class="button secondary" href="legal.html">ClearedLife Legal</a>';p.appendChild(d)}
})();
