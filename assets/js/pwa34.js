(()=>{'use strict';
const button=document.getElementById('pwaInstallButton');
let installPrompt=null;
if('serviceWorker' in navigator){
 window.addEventListener('load',()=>{
  navigator.serviceWorker.register('./service-worker.js',{scope:'./'}).catch(()=>{});
 });
}
window.addEventListener('beforeinstallprompt',event=>{
 event.preventDefault();installPrompt=event;
 if(button)button.hidden=false;
});
button?.addEventListener('click',async()=>{
 if(!installPrompt)return;
 button.disabled=true;
 try{
  await installPrompt.prompt();
  const choice=await installPrompt.userChoice;
  if(choice&&choice.outcome==='accepted')button.hidden=true;
 }catch(_){}
 installPrompt=null;button.disabled=false;
});
window.addEventListener('appinstalled',()=>{
 if(button)button.hidden=true;
});
})();
