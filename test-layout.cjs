const assert = require('node:assert/strict');
require('./letters.js');
require('./layout.js');
const {wrap,measure,paths} = globalThis.Letters;
const samples = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz','0123456789','I can do it.','Supercalifragilisticexpialidocious','a  few   words'];
for (const paper of [[215.9,279.4],[210,297]]) {
  for (const size of [12,16,22,28]) {
    const scale=size/60, width=(paper[0]-32)/scale;
    for (const sample of samples) {
      const rows=wrap(sample,width);
      assert(rows.every(row=>measure(row)<=width),`Overflow: ${sample}, ${size}mm`);
      assert.equal(rows.join('').replace(/\s/g,''),sample.replace(/\s/g,''),'Wrapping lost text');
    }
    const pitch=scale*110, count=Math.floor((paper[1]-65)/pitch);
    assert(count>0);
    assert(37+(count-1)*pitch+90*scale<paper[1]-15,'Descenders collide with footer');
  }
}
for (const char of 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') assert(paths[char],`Missing glyph ${char}`);
assert.deepEqual(wrap('',300),['']);
assert.equal(wrap('I can do it.',(215.9-32)/(16/60)).length,1,'Starter should fit one row');
const {paginate}=globalThis.WorksheetLayout;
const group=(phrase,count)=>Array.from({length:count},(_,i)=>({phrase,text:phrase+'-'+i}));
const input=[...group('a',4),...group('b',4),...group('c',3)];
const pages=paginate(input,7);
assert.deepEqual(pages.map(p=>p.length),[4,7],'Keep a complete practice set together');
assert.deepEqual(pages.flat(),input,'Pagination must preserve every row and its order');
const longInput=[...group('a',2),...group('b',15),...group('c',2)];
const longPages=paginate(longInput,4);
assert(longPages.every(p=>p.length<=4));
assert.deepEqual(longPages.flat(),longInput,'Long groups must continue without losing rows');
assert.deepEqual(paginate([],4),[]);
assert.throws(()=>paginate(input,0),RangeError);
for(const char of 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'){
  const point=Letters.start(char);
  assert(point && point.x>=0 && point.x<=60 && point.y>=10 && point.y<=70,`Invalid first-stroke dot: ${char}`);
}
assert.equal(Letters.start(' '),null);
assert.equal(Letters.start('.'),null);
assert.deepEqual(Letters.start('A'),{x:30,y:10},'A should begin at its apex');
assert.equal(Letters.start('4').y,10,'4 should start at the top');
for(const char of 'BDFHMNPRmnpr')assert(Letters.start(char).y<=40,`Start ${char} at the top`);
console.log('Layout checks passed: wrapping, page geometry, grouped pagination, alphabet coverage, first-stroke dots.');
