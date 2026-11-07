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

  // ---- enquiry form -> /api/enquiry
  var enq=document.getElementById('enquiry-form');
  if(enq){
    var t0=Date.now();
    enq.addEventListener('submit',function(e){
      e.preventDefault();
      var f=function(n){return enq.querySelector('[name='+n+']')};
      var err=enq.querySelector('.form-error'), btn=enq.querySelector('button[type=submit]');
      function fail(m,el){err.textContent=m;err.hidden=false;if(el)el.focus();}
      err.hidden=true;
      if(!f('name').value.trim()) return fail('Please add your name.',f('name'));
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f('email').value.trim())) return fail('Please check your email address.',f('email'));
      if(f('message').value.trim().length<5) return fail('Please add a short message.',f('message'));
      if(!f('consent').checked) return fail('Please tick the box so we know you are happy for us to reply.',f('consent'));
      var body={name:f('name').value.trim(),email:f('email').value.trim(),phone:f('phone').value.trim(),topic:f('topic').value,message:f('message').value.trim(),consent:true,company:f('company').value,elapsed:Date.now()-t0};
      var label=btn.textContent; btn.disabled=true; btn.textContent='Sending...';
      fetch('/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
        .then(function(r){return r.json().catch(function(){return {}}).then(function(j){return {ok:r.ok,j:j}})})
        .then(function(res){
          if(!res.ok) throw new Error(res.j.message||'');
          var th=document.getElementById('enqthanks');
          document.getElementById('enqbody').hidden=true; th.hidden=false; th.setAttribute('tabindex','-1'); th.focus();
        })
        .catch(function(x){fail(x&&x.message?x.message:'Sorry, something went wrong on our side. Please try again in a moment.');btn.disabled=false;btn.textContent=label;});
    });
  }
})();
