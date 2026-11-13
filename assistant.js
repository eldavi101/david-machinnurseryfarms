/* Machi: curated nursery knowledge, processed entirely in the visitor's browser. */
(() => {
  'use strict';
  const topics = [
    ['price', ['price','prices','pricing','cost','costs','cuanto','cuesta','precio','precios','presupuesto','budget'],
      ['Price and availability','Prices depend on species, pot size, plant size, quantity and any delivery or installation. There is no live price list. Send your plant list and preferred date for confirmation.','Prepare an availability enquiry','/contact.html'],
      ['Precio y disponibilidad','El precio depende de especie, tamaño de maceta y planta, cantidad y posibles trabajos de entrega o instalación. No hay una tarifa en tiempo real. Envíe su lista y fecha para confirmar.','Preparar una consulta','/es/contacto.html']],
    ['stock', ['stock','availability','available','inventory','disponible','disponibles','disponibilidad','existencias','inventario'],
      ['Confirm current stock','The plant pages and photographs show categories and reference plants, not live inventory. Confirm species, pot sizes and quantities before visiting or arranging an order.','Check plant options','/plants.html'],
      ['Confirmar existencias','Las páginas y fotografías muestran categorías y plantas de referencia, no inventario en tiempo real. Confirme especies, tamaños y cantidades antes de visitar o hacer un pedido.','Consultar opciones de plantas','/es/plantas.html']],
    ['wholesale', ['wholesale','bulk','contractor','contractors','landscaper','landscapers','volume','mayorista','mayoristas','mayoreo','volumen','contratista','contratistas'],
      ['Wholesale enquiries','We welcome enquiries from contractors and landscape teams. Include species, pot sizes, quantities and the date needed. Minimum order, trade terms and volume pricing need confirmation from the team.','Explore nursery services','/services.html#buying-guide'],
      ['Consultas mayoristas','Atendemos consultas de contratistas y equipos de jardinería. Indique especies, macetas, cantidades y fecha requerida. El pedido mínimo, las condiciones y los precios por volumen requieren confirmación del equipo.','Consultar servicios del vivero','/es/servicios.html#buying-guide']],
    ['locations', ['where','location','locations','address','addresses','homestead','hours','visit','open','direccion','direcciones','ubicacion','ubicaciones','donde','horario','horarios','visita'],
      ['Plan your visit','The site lists a retail location at 30760 SW 212 Ave, Homestead FL 33030 and a wholesale location at 26001 SW 162nd Ave, Homestead FL 33031. Confirm the right location, hours and availability before travelling.','See contact and directions','/contact.html'],
      ['Planificar su visita','El sitio indica venta minorista en 30760 SW 212 Ave, Homestead FL 33030 y mayorista en 26001 SW 162nd Ave, Homestead FL 33031. Confirme ubicación, horario y existencias antes de desplazarse.','Ver contacto e indicaciones','/es/contacto.html']],
    ['contact', ['contact','phone','call','email','whatsapp','human','person','send','contacto','telefono','llamar','correo','hablar','equipo','enviar','formulario'],
      ['Talk to the nursery','Call (786) 992-6153 for the retail location or (305) 248-8791 for wholesale. The enquiry form prepares a WhatsApp or email message; you must complete sending in that application.','Open the contact page','/contact.html'],
      ['Hablar con el vivero','Llame al (786) 992-6153 para venta minorista o al (305) 248-8791 para mayorista. El formulario prepara un mensaje de WhatsApp o correo; usted debe completar el envío en esa aplicación.','Abrir la página de contacto','/es/contacto.html']],
    ['delivery', ['delivery','deliver','shipping','installation','install','pickup','transport','entrega','envio','instalacion','instalar','recogida','recoger'],
      ['Delivery and installation','Ask about delivery or installation for your address and plant list. Confirm service area, access, fees and schedule before ordering. I cannot reserve stock or book a delivery.','Plan the service scope','/services.html#buying-guide'],
      ['Entrega e instalación','Consulte entrega o instalación para su dirección y lista de plantas. Confirme zona, acceso, costes y fecha antes de pedir. No puedo reservar existencias ni concertar entregas.','Planificar el servicio','/es/servicios.html#buying-guide']],
    ['hedges', ['hedge','hedges','privacy','screen','screening','clusia','podocarpus','cocoplum','seto','setos','privacidad','cerca'],
      ['Plan a privacy hedge','Clusia, Podocarpus and Cocoplum appear in the nursery catalogue. Choose with the team using sun exposure, drainage, available space and desired height. Spacing and quantities need a site-specific recommendation.','Compare plants for your project','/plants.html#plant-planning'],
      ['Planificar un seto','Clusia, Podocarpus y Cocoplum aparecen en el catálogo del vivero. Valore con el equipo sol, drenaje, espacio y altura deseada. La separación y cantidad requieren una recomendación para el lugar concreto.','Comparar plantas para su proyecto','/es/plantas.html#plant-planning']],
    ['gallery', ['photo','photos','picture','pictures','gallery','images','foto','fotos','galeria','imagenes'],
      ['Explore nursery photographs','View photographs of the nursery and reference plants. Images do not confirm that a specific size or quantity is currently available.','Open the gallery','/gallery.html'],
      ['Explorar fotografías','Vea fotografías del vivero y plantas de referencia. Las imágenes no confirman que un tamaño o cantidad concreta esté disponible actualmente.','Abrir la galería','/es/galeria.html']],
    ['care', ['care','water','watering','soil','sun','shade','disease','toxic','pet','cuidados','riego','regar','suelo','sol','sombra','enfermedad','toxica','mascota'],
      ['Ask for plant-specific guidance','Share the plant name and photos, sunlight, drainage and watering routine with the nursery. I cannot diagnose plant disease, certify toxicity or prescribe chemicals. For urgent exposure concerns, contact an appropriate professional.','Ask the nursery team','/contact.html'],
      ['Consultar cuidados concretos','Comparta nombre y fotos de la planta, sol, drenaje y rutina de riego con el vivero. No puedo diagnosticar enfermedades, certificar toxicidad ni indicar químicos. Para una exposición urgente, consulte a un profesional adecuado.','Consultar con el equipo','/es/contacto.html']],
    ['plants', ['plant','plants','tree','trees','tropical','flowers','palms','planta','plantas','arbol','arboles','flores','palmeras'],
      ['Explore plant categories','Browse privacy plants, tropical accent plants and ornamental trees. Confirm species, size, quantity and suitability with the team before purchasing.','Browse plants','/plants.html'],
      ['Explorar categorías de plantas','Consulte plantas de privacidad, acentos tropicales y árboles ornamentales. Confirme especie, tamaño, cantidad e idoneidad con el equipo antes de comprar.','Ver plantas','/es/plantas.html']],
  ];
  function answerQuestion(question, lang = 'en') {
    const words = new Set(String(question).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(' '));
    const matches = topics.map(row => ({row, score: row[1].reduce((s, term) => s + (words.has(term) ? 1 : 0),0)})).filter(x => x.score > 0).sort((a,b) => b.score-a.score).slice(0,2);
    if (!matches.length) return [{id:'fallback',text:lang==='es'?'Puedo orientar sobre plantas, fotos, ubicaciones, mayorista, precio o contacto. Para otras preguntas, consulte directamente al vivero.':'I can guide you to plants, photos, locations, wholesale, price factors or contact. Ask the nursery directly for other questions.',label:lang==='es'?'Hablar con el vivero':'Talk to the nursery',href:lang==='es'?'/es/contacto.html':'/contact.html'}];
    return matches.map(({row}) => { const [title,text,label,href]=row[lang==='es'?3:2]; return {id:row[0],title,text,label,href}; });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {answerQuestion};
  if (typeof document === 'undefined') return;
  const root=document.querySelector('[data-site-assistant]');
  if (!root) return;
  const launch=root.querySelector('[data-assistant-launch]'),panel=root.querySelector('dialog'),log=root.querySelector('[data-assistant-log]'),form=root.querySelector('[data-assistant-form]'),input=form.querySelector('input');
  const lang=root.dataset.lang==='es'?'es':'en';
  launch.hidden=false;
  launch.addEventListener('click',()=>{panel.showModal();launch.setAttribute('aria-expanded','true');input.focus();});
  root.querySelector('[data-assistant-close]').addEventListener('click',()=>panel.close());
  panel.addEventListener('close',()=>{launch.setAttribute('aria-expanded','false');launch.focus();});
  panel.addEventListener('click',event=>{if(event.target===panel){const b=panel.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)panel.close();}});
  function ask(value){
    const q=value.trim().slice(0,300);if(!q)return;
    const user=document.createElement('p');user.className='assistant-message assistant-user';user.textContent=q;log.append(user);
    const response=document.createElement('div');response.className='assistant-message';
    for(const answer of answerQuestion(q,lang)){const p=document.createElement('p');p.textContent=answer.text;const a=document.createElement('a');a.href=answer.href;a.textContent=answer.label;response.append(p,a);}
    log.append(response);while(log.children.length>21)log.firstElementChild.remove();log.scrollTop=log.scrollHeight;input.value='';input.focus();
  }
  form.addEventListener('submit',event=>{event.preventDefault();ask(input.value);});
  root.querySelectorAll('[data-assistant-suggestion]').forEach(button=>button.addEventListener('click',()=>ask(button.textContent)));
})();
