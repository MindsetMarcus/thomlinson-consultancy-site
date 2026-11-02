(function(){
  'use strict';
  try{
    var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if('IntersectionObserver' in window && !rm){
      document.documentElement.classList.add('js');
      var els=[].slice.call(document.querySelectorAll('.course,.tier,.quote,.cell,.pillar,.honour,.method > *,.pricecard,.portrait,.faq details,.comm-top,.shot-wrap'));
      els.forEach(function(e,i){e.classList.add('rv'); e.style.transitionDelay=((i%4)*70)+'ms';});
      var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.12,rootMargin:'0px 0px -5% 0px'});
      els.forEach(function(e){io.observe(e)});
    }
  }catch(x){}

  function wire(form){
    form.setAttribute('novalidate','');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var name=form.querySelector('input[name=name]'), email=form.querySelector('input[name=email]');
      var consent=form.querySelector('input[name=consent]');
      var err=form.querySelector('.form-error'), btn=form.querySelector('button[type=submit]');
      function fail(msg,el){ err.textContent=msg; err.hidden=false; if(el) el.focus(); }
      err.hidden=true;
      if(!name.value.trim()) return fail('Please add your first name.',name);
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) return fail('Please check your email address.',email);
      if(consent && !consent.checked) return fail('Please tick the box so we know you are happy to hear from us.',consent);
      var body={name:name.value.trim(),email:email.value.trim(),goal:'',source:form.getAttribute('data-source')||'website',
        consent:consent?consent.checked:true,company:(form.querySelector('input[name=company]')||{}).value||''};
      var label=btn.textContent; btn.disabled=true; btn.textContent='One moment...';
      fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
        .then(function(r){return r.json().catch(function(){return {}}).then(function(j){return {ok:r.ok,j:j}})})
        .then(function(res){
          if(!res.ok) throw new Error(res.j.message||'');
          var holder=form.closest('.wf-body')||form;
          var card=holder.parentNode, thanks=card.querySelector('.wf-thanks');
          var slot=thanks.querySelector('[data-name-slot]');
          if(slot) slot.textContent='Welcome aboard, '+body.name+'.';
          holder.hidden=true; thanks.hidden=false; thanks.setAttribute('tabindex','-1'); thanks.focus();
        })
        .catch(function(x){
          fail(x&&x.message?x.message:'Sorry, something went wrong on our side. Please try again in a moment.');
          btn.disabled=false; btn.textContent=label;
        });
    });
  }
  [].forEach.call(document.querySelectorAll('form[data-source]'),wire);
})();
