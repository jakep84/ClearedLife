
(async function(){
  function addAccountLink(isSignedIn){
    const href = isSignedIn ? 'dashboard.html' : 'account.html?mode=signin';
    const label = isSignedIn ? 'My Dashboard' : 'Sign in';

    const mainNav = document.querySelector('.nav-links');
    if(mainNav && !document.getElementById('clearedlife-account-nav')){
      const a = document.createElement('a');
      a.id = 'clearedlife-account-nav';
      a.href = href;
      a.textContent = label;
      a.className = isSignedIn ? 'nav-cta account-active' : 'account-link';
      mainNav.insertBefore(a, mainNav.querySelector('.nav-cta'));
    }

    const productHeader = document.querySelector('.header');
    if(productHeader && !document.getElementById('clearedlife-account-header')){
      const existing = [...productHeader.children].find(el => el.tagName === 'A' && el.classList.contains('button'));
      const a = document.createElement('a');
      a.id = 'clearedlife-account-header';
      a.href = href;
      a.textContent = label;
      a.className = 'button';
      if(existing) productHeader.insertBefore(a, existing);
      else productHeader.appendChild(a);
    }

    const siteHeader = document.querySelector('.site-header');
    if(siteHeader && !document.getElementById('clearedlife-account-site-header')){
      const existing = siteHeader.querySelector('.nav-cta');
      const a = document.createElement('a');
      a.id = 'clearedlife-account-site-header';
      a.href = href;
      a.textContent = label;
      a.className = 'nav-cta';
      if(existing) siteHeader.insertBefore(a, existing);
      else siteHeader.appendChild(a);
    }
  }

  try {
    const configResponse = await fetch('/api/public-config');
    if(!configResponse.ok) {
      addAccountLink(false);
      return;
    }

    const cfg = await configResponse.json();
    if(!window.supabase?.createClient) {
      addAccountLink(false);
      return;
    }

    const client = window.supabase.createClient(cfg.url, cfg.key);
    const { data: { session } } = await client.auth.getSession();
    addAccountLink(Boolean(session));

    client.auth.onAuthStateChange((_event, session) => {
      const links = [
        document.getElementById('clearedlife-account-nav'),
        document.getElementById('clearedlife-account-header'),
        document.getElementById('clearedlife-account-site-header')
      ].filter(Boolean);

      links.forEach(link => {
        link.href = session ? 'dashboard.html' : 'account.html?mode=signin';
        link.textContent = session ? 'My Dashboard' : 'Sign in';
      });
    });
  } catch {
    addAccountLink(false);
  }
})();
