
// ClearedLife account handoff extension.
// Load AFTER results.js.
(function(){
  const email=document.getElementById('email');
  const form=document.getElementById('lead-form');
  const submit=document.getElementById('lead-submit');
  const status=document.getElementById('form-status');
  if(!form||!submit) return;

  const observer=new MutationObserver(()=>{
    if(submit.textContent.includes('Saved')){
      const value=email?.value?.trim();
      if(value) sessionStorage.setItem('clearedlifeLeadEmail',value);
      if(!document.getElementById('create-account-cta')){
        const a=document.createElement('a');
        a.id='create-account-cta';
        a.className='button secondary full';
        a.href='account.html';
        a.style.marginTop='8px';
        a.textContent='Create free account & keep my progress →';
        submit.insertAdjacentElement('afterend',a);
      }
    }
  });
  observer.observe(submit,{childList:true,characterData:true,subtree:true});
})();
