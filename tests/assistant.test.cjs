const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {answerQuestion}=require('../assistant.js');
test('price intent is useful without claiming live stock or prices',()=>{const a=answerQuestion('How much do Clusia plants cost?');assert.equal(a[0].id,'price');assert.match(a[0].text,/no live price list/);});
test('accented Spanish uses the actual Spanish routes',()=>{assert.equal(answerQuestion('¿Cuánto cuesta una planta?','es')[0].href,'/es/contacto.html');assert.equal(answerQuestion('Dirección del vivero','es')[0].href,'/es/contacto.html');});
test('hedge advice avoids invented spacing and quantities',()=>{assert.match(answerQuestion('Clusia privacy hedge')[0].text,/site-specific/);});
test('unknown and hostile input cannot create external links or executable output',()=>{for(const q of ['bitcoin','<img src=x onerror=alert(1)>','javascript:alert(1)']){const a=answerQuestion(q,'es')[0];assert.equal(a.id,'fallback');assert.equal(a.href,'/es/contacto.html');assert.ok(!a.text.includes(q));}});
test('every answer URL and anchor exists in both language trees',()=>{for(const lang of ['en','es'])for(const q of ['price','stock','wholesale','locations','contact','delivery','hedge','gallery','care','plants'])for(const a of answerQuestion(q,lang)){const [p,hash]=a.href.split('#');assert.ok(fs.existsSync('.'+p),p);if(hash)assert.ok(fs.readFileSync('.'+p,'utf8').includes('id="'+hash+'"'),a.href);}});
