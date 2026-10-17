(() => {
  'use strict';
  const $=id=>document.getElementById(id), key='little-letters-v1', SVG='http://www.w3.org/2000/svg';
  const id=()=>globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+Math.random().toString(36).slice(2);
  const defaults=()=>({id:id(),title:'My little letters',text:'Aa Bb Cc\nI can do it.',size:'16',paper:'letter',traces:'1',blanks:'1',guides:'4',style:'dotted',repeat:false,model:true,mono:false});
  const options={size:['12','16','22','28'],paper:['letter','A4'],traces:['1','2','3','4'],blanks:['0','1','2','3'],guides:['0','2','3','4'],style:['dotted','light','solid']};
  const booleans=['repeat','model','mono'];
  function clean(value){
    if(!value || typeof value!=='object' || typeof value.text!=='string')throw Error('Invalid worksheet');
    const sheet=defaults();sheet.title=typeof value.title==='string'?value.title.slice(0,60):sheet.title;sheet.text=value.text.slice(0,3000);
    for(const [k,values] of Object.entries(options))if(values.includes(value[k]))sheet[k]=value[k];
    for(const k of booleans)sheet[k]=value[k]===true;
    return sheet;
  }
  let state={sheets:[defaults()],active:''};state.active=state.sheets[0].id;
  try{const data=JSON.parse(localStorage.getItem(key));if(data?.version===1 && Array.isArray(data.sheets) && data.sheets.length){
    const activeIndex=data.sheets.findIndex(s=>s.id===data.active);state.sheets=data.sheets.map(clean);state.active=state.sheets[Math.max(0,activeIndex)].id;
  }}catch{}
  const current=()=>state.sheets.find(s=>s.id===state.active)||state.sheets[0];
  function save(message='Saved in this browser.'){
    try{localStorage.setItem(key,JSON.stringify({version:1,...state}));$('status').textContent=message;}catch{$('status').textContent='Storage unavailable. Export worksheets before closing.';}
  }
  function sync(){
    const sheet=current();$('sheet-select').replaceChildren(...state.sheets.map(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.title||'Untitled worksheet';return o;}));
    $('sheet-select').value=sheet.id;$('delete').disabled=state.sheets.length===1;
    for(const field of ['title','text',...Object.keys(options)])$(field).value=sheet[field];
    for(const field of booleans)$(field).checked=sheet[field];
    render();
  }
  function el(tag,attrs={},text){const node=document.createElementNS(SVG,tag);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);if(text!==undefined)node.textContent=text;return node;}
  function rowsFor(sheet,width){
    const scale=Number(sheet.size)/60,maxWidth=(width-2)/scale,rows=[];
    if(!sheet.text.trim())return {rows:[],scale,unsupported:[]};
    const normalized=sheet.text.normalize('NFC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/\t/g,' ');
    const unsupported=[...new Set([...normalized].filter(c=>!Letters.paths[c]&&!/\s/.test(c)))];
    for(const phrase of normalized.split('\n')){
      if(!phrase.trim()){rows.push({text:'',solid:false});continue;}
      const parts=Letters.wrap(phrase,maxWidth);
      const addRows=solid=>{for(let text of parts){if(sheet.repeat && text && Letters.measure(text+' '+text)<=maxWidth){const original=text;while(Letters.measure(text+' '+original)<=maxWidth)text+=' '+original;}rows.push({text,solid});}};
      if(sheet.model)addRows(true);
      for(let i=0;i<Number(sheet.traces);i++)addRows(false);
      for(let i=0;i<Number(sheet.blanks);i++)rows.push({text:'',solid:false});
    }
    return {rows,scale,unsupported};
  }
  function render(){
    const sheet=current(),[w,h]=sheet.paper==='A4'?[210,297]:[215.9,279.4],margin=15,usable=w-2*margin;
    const layout=rowsFor(sheet,usable),pitch=layout.scale*110,perPage=Math.floor((h-65)/pitch);
    let rows=layout.rows;
    if(!rows.length)rows=Array.from({length:perPage},()=>({text:'',solid:false}));
    const total=Math.ceil(rows.length/perPage);$('pages').replaceChildren();
    for(let page=0;page<total;page++){
      const paper=document.createElement('div');paper.className='sheet';paper.style.width='100%';paper.style.maxWidth=w+'mm';paper.style.aspectRatio=`${w} / ${h}`;
      const svg=el('svg',{viewBox:`0 0 ${w} ${h}`,role:'img','aria-label':`${sheet.title||'Writing practice'}, page ${page+1} of ${total}`});
      svg.append(el('rect',{width:w,height:h,fill:'white'}));
      svg.append(el('text',{x:margin,y:20,'font-family':'system-ui, sans-serif','font-size':5,'font-weight':650,fill:'#293c33'},sheet.title||'Writing practice'));
      svg.append(el('text',{x:margin,y:29,'font-family':'system-ui, sans-serif','font-size':2.7,fill:'#65736c'},'Name: ____________________________'));
      svg.append(el('text',{x:w-margin,y:29,'text-anchor':'end','font-family':'system-ui, sans-serif','font-size':2.7,fill:'#65736c'},'Date: ______________'));
      rows.slice(page*perPage,(page+1)*perPage).forEach((row,index)=>{
        const top=37+index*pitch,s=layout.scale;
        const line=(position,color,dashed=false,weight=.25)=>svg.append(el('line',{x1:margin,y1:top+position*s,x2:w-margin,y2:top+position*s,stroke:sheet.mono?'#777':color,'stroke-width':weight,...(dashed?{'stroke-dasharray':'1.1 1.1'}:{})}));
        if(sheet.guides!=='0'){
          line(10,'#97afa0');if(Number(sheet.guides)>=3)line(40,'#bdc9bf',true);
          line(70,'#a67d6f',false,.35);if(sheet.guides==='4')line(90,'#c7cec7');
        }
        const group=el('g',{transform:`translate(${margin+1} ${top}) scale(${s})`,fill:'none',stroke:row.solid||sheet.style==='solid'?'#34483d':sheet.style==='light'?'#b4b4b4':'#858585','stroke-width':sheet.style==='dotted'&&!row.solid?'2.8':'2.2','stroke-linecap':'round','stroke-linejoin':'round'});
        let x=0;for(const char of row.text){const d=Letters.paths[char];if(d)group.append(el('path',{d,transform:`translate(${x} 0)`,...(!row.solid&&sheet.style==='dotted'?{'stroke-dasharray':'.1 6.2'}:{})}));else if(char!==' '){group.append(el('text',{x,y:70,fill:'#777',stroke:'none','font-size':65,'font-family':'sans-serif'},char));}x+=Letters.advance(char);}
        svg.append(group);
      });
      svg.append(el('text',{x:margin,y:h-10,'font-family':'system-ui, sans-serif','font-size':2.4,fill:'#8a948b'},'little letters · a little practice, a little progress'));
      svg.append(el('text',{x:w-margin,y:h-10,'text-anchor':'end','font-family':'system-ui, sans-serif','font-size':2.4,fill:'#8a948b'},`${page+1} / ${total}`));
      paper.append(svg);$('pages').append(paper);
    }
    $('page-count').textContent=total+' page'+(total===1?'':'s')+' · '+(sheet.paper==='letter'?'Letter':'A4');
    $('text-note').textContent=layout.unsupported.length?'Solid fallback characters (no dotted shapes): '+layout.unsupported.join(' '):'A–Z, a–z, numbers & everyday punctuation. Long phrases wrap automatically.';
    document.documentElement.style.setProperty('--paper-width',w+'mm');document.documentElement.style.setProperty('--paper-height',h+'mm');
    $('print-size').textContent=`@page{size:${w}mm ${h}mm;margin:0}`;
  }
  for(const field of ['title','text',...Object.keys(options),...booleans])$(field).addEventListener(field==='text'||field==='title'?'input':'change',()=>{
    current()[field]=booleans.includes(field)?$(field).checked:$(field).value;save();render();
    if(field==='title')$('sheet-select').selectedOptions[0].textContent=current().title||'Untitled worksheet';
  });
  $('sheet-select').addEventListener('change',()=>{state.active=$('sheet-select').value;save();sync();});
  $('new').addEventListener('click',()=>{const sheet=defaults();sheet.title='New worksheet';sheet.text='';state.sheets.push(sheet);state.active=sheet.id;save();sync();$('title').focus();$('title').select();});
  $('duplicate').addEventListener('click',()=>{const sheet={...current(),id:id(),title:(current().title+' copy').slice(0,60)};state.sheets.push(sheet);state.active=sheet.id;save();sync();});
  let pendingAction=null;
  function confirmAction(title,message,action){pendingAction=action;$('confirm-title').textContent=title;$('confirm-message').textContent=message;$('confirm-dialog').showModal();}
  $('confirm-dialog').addEventListener('close',()=>{if($('confirm-dialog').returnValue==='confirm')pendingAction?.();pendingAction=null;});
  $('delete').addEventListener('click',()=>{if(state.sheets.length<2)return;const target=current();confirmAction('Delete worksheet?',`“${target.title||'Untitled worksheet'}” will be removed from this browser.`,()=>{state.sheets=state.sheets.filter(s=>s.id!==target.id);state.active=state.sheets[0].id;save('Worksheet deleted.');sync();});});
  const presets={alphabet:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c=>c+c.toLowerCase()).join('\n'),numbers:'0 1 2 3 4\n5 6 7 8 9',words:'sun\ncat\ndog\nlove\nI can write.',blank:''};
  document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{const apply=()=>{current().text=presets[button.dataset.preset];save();sync();};if(current().text.trim())confirmAction('Replace practice text?','This starter replaces the text on the current worksheet. Duplicate it first to keep a copy.',apply);else apply();}));
  $('print').addEventListener('click',()=>window.print());
  $('export').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,sheets:state.sheets},null,2)],{type:'application/json'})),a=document.createElement('a');
    a.href=url;a.download='little-letters-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('status').textContent='Worksheets exported.';
  });
  $('import').addEventListener('click',()=>$('file').click());
  $('file').addEventListener('change',async()=>{
    const file=$('file').files[0];if(!file)return;
    try{
      if(file.size>2000000)throw Error();const data=JSON.parse(await file.text());
      if(data?.version!==1||!Array.isArray(data.sheets)||!data.sheets.length)throw Error();
      const imported=data.sheets.map(clean);state.sheets.push(...imported);state.active=imported[0].id;save(`Imported ${imported.length} worksheet(s).`);sync();
    }catch{$('status').textContent='Could not import. Choose a Little Letters JSON backup (up to 2 MB).';}finally{$('file').value='';}
  });
  sync();
})();
