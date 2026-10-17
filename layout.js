'use strict';
globalThis.WorksheetLayout = {
  // Keep a phrase's model, tracing, and blank rows together when they fit.
  // Larger groups continue across pages without dropping any rows.
  paginate(rows,capacity) {
    if(!Number.isInteger(capacity)||capacity<1)throw new RangeError('Invalid page capacity');
    const groups=[];
    for(const row of rows){
      const previous=groups[groups.length-1];
      if(previous && row.phrase!==undefined && previous[0].phrase===row.phrase)previous.push(row);
      else groups.push([row]);
    }
    const pages=[];let page=[];
    const flush=()=>{if(page.length){pages.push(page);page=[];}};
    for(const group of groups){
      if(group.length<=capacity && page.length+group.length>capacity)flush();
      for(const row of group){if(page.length===capacity)flush();page.push(row);}
    }
    flush();return pages;
  }
};
