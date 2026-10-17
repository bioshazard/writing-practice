const assert = require('node:assert/strict');
require('./letters.js');
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
console.log('Layout checks passed: alphabet coverage, wrapping, both paper sizes, all writing sizes, footer clearance.');
