/* panda-art.js */
/* FoamLab panda: one hand-drawn vector character shared by the home page, the
 * floating companion, the account collection and the small note icons.
 * Appearance is driven by attributes on any ancestor:
 *   data-form, data-outfit, data-decoration, data-action, data-quiet, data-facing
 * All parts are drawn once; panda-character.css shows, hides and animates them. */
'use strict';
(() => {
 const g = (cls, body, extra = '') => `<g class="${cls}"${extra}>${body}</g>`;

 /* ---------- scene decorations (behind the character) ---------- */
 const bamboo = (x, h, lean = 0) => `<g transform="rotate(${lean} ${x} 168)"><rect class="pa-bamboo" x="${x - 3.5}" y="${168 - h}" width="7" height="${h}" rx="3.5"/>${[0.3, 0.62].map(f => `<rect class="pa-bamboo-node" x="${x - 4.5}" y="${168 - h * f}" width="9" height="2.6" rx="1.3"/>`).join('')}<path class="pa-leaf" d="M${x} ${168 - h * 0.62}q12-9 22-6q-10 9-22 6z"/><path class="pa-leaf" d="M${x} ${168 - h * 0.86}q-13-8-22-4q10 8 22 4z"/><path class="pa-leaf" d="M${x} ${168 - h * 0.86}q10-12 20-11q-8 10-20 11z"/></g>`;
 const flower = (x, y, c = 'pa-petal') => `<g>${[0, 72, 144, 216, 288].map(a => `<ellipse class="${c}" cx="${x}" cy="${y - 4}" rx="2.6" ry="4" transform="rotate(${a} ${x} ${y})"/>`).join('')}<circle class="pa-gold" cx="${x}" cy="${y}" r="2.2"/></g>`;
 const scene = [
  g('pa-d pa-d-meadow', `<path class="pa-grass" d="M14 168c4-10 6-14 6-14l2 14m4 0c1-8 5-12 5-12l-1 12M132 168c2-9 6-13 6-13l0 13m6 0c2-7 4-10 4-10l-1 10"/>${flower(20, 150)}${flower(142, 146)}<path class="pa-stem" d="M20 152v16M142 148v20"/>`),
  g('pa-d pa-d-bamboo-grove', bamboo(18, 118, -4) + bamboo(144, 132, 5) + bamboo(30, 70, 3)),
  g('pa-d pa-d-pond', `<ellipse class="pa-water" cx="80" cy="168" rx="74" ry="11"/><path class="pa-ripple" d="M18 168h22M112 171h26M60 175h14"/><ellipse class="pa-pad" cx="136" cy="165" rx="12" ry="4.5"/><path class="pa-pad-cut" d="M136 165l9-3"/>${flower(28, 163, 'pa-lotus')}`),
  g('pa-d pa-d-blossom', `<path class="pa-branch" d="M160 22c-18 4-30 14-40 30m22-24c-4 8-4 14-2 20M126 40c-8-2-14 0-20 4"/>${flower(118, 50)}${flower(140, 46)}${flower(104, 44)}${flower(150, 26)}<ellipse class="pa-petal pa-fall" cx="20" cy="40" rx="2.4" ry="3.6"/><ellipse class="pa-petal pa-fall pa-fall-2" cx="44" cy="20" rx="2.4" ry="3.6"/>`),
  g('pa-d pa-d-lantern', `<path class="pa-post" d="M146 168V62m0 0h-16"/><path class="pa-cord" d="M131 62v6"/><ellipse class="pa-glow" cx="131" cy="84" rx="20" ry="20"/><rect class="pa-lantern" x="122" y="68" width="18" height="24" rx="8"/><path class="pa-lantern-rib" d="M131 68v24M124 72h14M124 88h14"/><path class="pa-cord" d="M131 92v6"/>`),
  g('pa-d pa-d-observatory', `<path class="pa-tripod" d="M22 168l8-26 8 26M30 142v26"/><rect class="pa-scope" x="14" y="122" width="34" height="9" rx="4.5" transform="rotate(-32 30 130)"/><circle class="pa-gold" cx="30" cy="139" r="3"/><path class="pa-star" d="M134 22l2.4 5 5.4.8-4 3.8 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.8 5.4-.8z"/><path class="pa-star pa-star-sm" d="M150 52l1.4 3 3.2.5-2.3 2.2.5 3.2-2.8-1.5-2.8 1.5.5-3.2-2.3-2.2 3.2-.5z"/><path class="pa-star pa-star-sm" d="M16 40l1.4 3 3.2.5-2.3 2.2.5 3.2-2.8-1.5-2.8 1.5.5-3.2-2.3-2.2 3.2-.5z"/>`)
 ].join('');

 /* ---------- character ---------- */
 const behind = [
  g('pa-o pa-o-backpack', `<rect class="pa-pack" x="30" y="102" width="100" height="50" rx="18"/><rect class="pa-pack-pocket" x="30" y="122" width="12" height="18" rx="4"/><rect class="pa-pack-pocket" x="118" y="122" width="12" height="18" rx="4"/>`),
  g('pa-f pa-f-astronaut', `<rect class="pa-suit-pack" x="36" y="100" width="88" height="44" rx="12"/>`)
 ].join('');

 const legs = `<g class="pa-leg pa-leg-l"><ellipse class="pk" cx="58" cy="153" rx="17" ry="14"/><ellipse class="pa-pad-paw" cx="56" cy="156" rx="7" ry="6"/><circle class="pa-pad-paw" cx="47" cy="148" r="2.6"/><circle class="pa-pad-paw" cx="53" cy="145" r="2.6"/><circle class="pa-pad-paw" cx="60" cy="145" r="2.6"/></g><g class="pa-leg pa-leg-r"><ellipse class="pk" cx="102" cy="153" rx="17" ry="14"/><ellipse class="pa-pad-paw" cx="104" cy="156" rx="7" ry="6"/><circle class="pa-pad-paw" cx="113" cy="148" r="2.6"/><circle class="pa-pad-paw" cx="107" cy="145" r="2.6"/><circle class="pa-pad-paw" cx="100" cy="145" r="2.6"/></g>`;

 const body = `<path class="pw pa-line" d="M80 96c-24 0-38 18-38 40 0 18 14 30 38 30s38-12 38-30c0-22-14-40-38-40z"/><path class="ps" d="M108 128c2 14-6 26-22 30 16 0 26-10 26-22 0-3-1-6-4-8z"/><ellipse class="pa-belly" cx="80" cy="136" rx="20" ry="18"/>`;

 const outfitsOnBody = [
  g('pa-o pa-o-coat', `<path class="pa-coat pa-line" d="M50 112c-6 10-8 20-8 28 0 12 6 20 14 24h48c8-4 14-12 14-24 0-8-2-18-8-28l-12 8-10 40h-16l-10-40z"/><path class="pa-coat-lapel" d="M62 108l8 22M98 108l-8 22"/><rect class="pa-coat-pocket" x="95" y="140" width="12" height="9" rx="2"/><rect class="pa-pen" x="99" y="134" width="2.6" height="10" rx="1"/>`),
  g('pa-o pa-o-raincoat', `<path class="pa-rain pa-line" d="M46 116c-4 8-5 16-5 22 0 14 12 26 39 26s39-12 39-26c0-6-1-14-5-22-8 6-20 8-34 8s-26-2-34-8z"/><path class="pa-rain-seam" d="M80 124v40"/><circle class="pa-rain-btn" cx="80" cy="134" r="2.2"/><circle class="pa-rain-btn" cx="80" cy="148" r="2.2"/>`),
  g('pa-o pa-o-spacesuit pa-f-astronaut', `<path class="pa-suit pa-line" d="M44 116c-3 8-4 15-4 21 0 16 14 28 40 28s40-12 40-28c0-6-1-13-4-21-10 6-22 9-36 9s-26-3-36-9z"/><rect class="pa-suit-panel" x="68" y="132" width="24" height="16" rx="4"/><circle class="pa-suit-led" cx="74" cy="140" r="2.4"/><circle class="pa-suit-led pa-led-2" cx="81" cy="140" r="2.4"/><rect class="pa-suit-flag" x="98" y="126" width="10" height="7" rx="1"/>`),
  g('pa-f pa-f-engineer', `<path class="pa-overall pa-line" d="M60 122h40v18c0 10-6 20-20 20s-20-10-20-20z"/><path class="pa-overall-strap" d="M60 122l-8-14M100 122l8-14"/><circle class="pa-gold" cx="64" cy="126" r="2.4"/><circle class="pa-gold" cx="96" cy="126" r="2.4"/><rect class="pa-overall-pocket" x="72" y="130" width="16" height="10" rx="2"/>`),
  g('pa-f pa-f-master', `<path class="pa-robe pa-line" d="M44 110c10 10 22 14 36 14s26-4 36-14l6 12c-10 14-26 20-42 20s-32-6-42-20z"/><path class="pa-robe-trim" d="M48 118c10 9 20 13 32 13s22-4 32-13"/><circle class="pa-gold" cx="80" cy="134" r="4.2"/>`),
  g('pa-f pa-f-explorer', `<path class="pa-strap" d="M60 104l62 30"/><path class="pa-leaf" d="M128 128q-2-14 8-20q2 12-8 20z"/><rect class="pa-satchel pa-line" x="112" y="126" width="28" height="22" rx="6"/><path class="pa-satchel-flap pa-line" d="M112 132c0-4 2-6 6-6h16c4 0 6 2 6 6v4h-28z"/><circle class="pa-gold" cx="126" cy="137" r="2.4"/>`),
  g('pa-o pa-o-backpack', `<path class="pa-pack-strap" d="M60 106c-4 14-4 26 0 36M100 106c4 14 4 26 0 36"/>`)
 ].join('');

 const scarf = (cls, color) => g(`pa-o pa-o-${cls}`, `<path class="${color} pa-line" d="M52 104c18 8 38 8 56 0l2 10c-20 9-40 9-60 0z"/><path class="${color} pa-line" d="M94 110l4 22 9-1-4-21z"/><path class="${color}-stripe" d="M96 120l8-1M97 126l8-1"/>`);

 const held = `<g class="pa-p pa-p-book"><path class="pa-book-cover pa-line" d="M50 124h60v34H50z"/><path class="pa-book-page" d="M53 127h25v28H53zM82 127h25v28H82z"/><path class="pa-book-text" d="M58 134h16M58 140h14M58 146h16M86 134h16M86 140h12M86 146h16"/></g>`;
 const arms = `<g class="pa-arm pa-arm-l"><ellipse class="pk" cx="52" cy="124" rx="10.5" ry="19" transform="rotate(16 52 124)"/>
  <g class="pa-p pa-carry"><path class="pa-bamboo-thin" d="M44 146l20-42"/><path class="pa-leaf" d="M58 116q10-10 18-8q-8 9-18 8z"/><path class="pa-leaf" d="M62 108q-10-8-16-4q8 7 16 4z"/></g>
  <g class="pa-p pa-p-fish"><path class="pa-rod" d="M46 140L14 34"/><path class="pa-fishline" d="M14 34q-4 50 2 112"/><g class="pa-bob"><circle class="pa-float" cx="16" cy="148" r="4"/><path class="pa-float-top" d="M12 148a4 4 0 0 1 8 0z"/></g></g>

  </g>
  <g class="pa-arm pa-arm-r"><ellipse class="pk" cx="108" cy="124" rx="10.5" ry="19" transform="rotate(-16 108 124)"/>
  <g class="pa-p pa-p-can"><path class="pa-can pa-line" d="M108 128h22v18h-22z"/><path class="pa-can-spout" d="M130 132l16-10"/><path class="pa-can-handle" d="M112 128c2-8 12-8 14 0"/></g>
  </g>`;

 const eyes = `<g class="pa-eyes pa-eyes-open"><g class="pa-pupils"><circle class="pa-eye-white" cx="62" cy="70" r="6.4"/><circle class="pa-pupil" cx="62.6" cy="70.6" r="4.6"/><circle class="pa-eye-glint" cx="64.4" cy="68.4" r="1.8"/><circle class="pa-eye-white" cx="98" cy="70" r="6.4"/><circle class="pa-pupil" cx="97.4" cy="70.6" r="4.6"/><circle class="pa-eye-glint" cx="99.2" cy="68.4" r="1.8"/></g></g>
  <g class="pa-eyes pa-eyes-happy"><path class="pa-eye-arc" d="M55 72q7-8 14 0M91 72q7-8 14 0"/></g>
  <g class="pa-eyes pa-eyes-closed"><path class="pa-eye-arc" d="M55 70q7 6 14 0M91 70q7 6 14 0"/></g>`;

 const head = `<g class="pa-head">
  <circle class="pk" cx="44" cy="40" r="15"/><circle class="pk" cx="116" cy="40" r="15"/><circle class="pa-ear-in" cx="45" cy="41" r="7"/><circle class="pa-ear-in" cx="115" cy="41" r="7"/>
  <g class="pa-o pa-o-headphones pa-hp-band"><path class="pa-hp" d="M38 64c0-34 84-34 84 0" fill="none"/></g>
  <path class="pw pa-line" d="M80 30c-30 0-48 18-48 42 0 22 20 36 48 36s48-14 48-36c0-24-18-42-48-42z"/>
  <path class="ps" d="M118 82c-4 14-18 22-38 22 24 4 44-6 46-22 0-4-2-6-8 0z"/>
  <path class="pk" d="M50 64c4-10 16-12 20-4 4 7 2 18-6 22-8 3-18-6-14-18z"/><path class="pk" d="M110 64c-4-10-16-12-20-4-4 7-2 18 6 22 8 3 18-6 14-18z"/>
  ${eyes}
  <ellipse class="pa-cheek" cx="50" cy="88" rx="7" ry="4.2"/><ellipse class="pa-cheek" cx="110" cy="88" rx="7" ry="4.2"/>
  <path class="pk" d="M74.5 81.5c0-2 2-3 5.5-3s5.5 1 5.5 3c0 2.5-3 4.6-5.5 4.6s-5.5-2.1-5.5-4.6z"/>
  <g class="pa-mouth pa-mouth-smile"><path class="pa-mouth-line" d="M80 86v2.6M73.5 88c2 3 5 3 6.5.6 1.5 2.4 4.5 2.4 6.5-.6"/></g>
  <g class="pa-mouth pa-mouth-open"><path class="pa-mouth-fill" d="M74 89c0 6 3 9 6 9s6-3 6-9c-3 1.6-9 1.6-12 0z"/><path class="pa-tongue" d="M76.6 95c1.6-1.6 5.2-1.6 6.8 0-1 1.6-2.2 2.2-3.4 2.2s-2.4-.6-3.4-2.2z"/></g>
  <g class="pa-f pa-f-master"><path class="pa-tuft" d="M72 34c0-9 10-13 16-8-6 1-8 4-6 9-4-4-7-3-10-1z"/><g class="pa-glasses"><circle cx="62" cy="71" r="11"/><circle cx="98" cy="71" r="11"/><path d="M73 70q7-4 14 0M51 68l-12-4M109 68l12-4"/></g></g>
  <g class="pa-o pa-o-goggles"><path class="pa-goggle-band" d="M33 50c30-10 64-10 94 0"/><circle class="pa-goggle pa-line" cx="66" cy="44" r="10"/><circle class="pa-goggle pa-line" cx="94" cy="44" r="10"/><path class="pa-goggle-glint" d="M61 40q3-3 7-2M89 40q3-3 7-2"/></g>
  <g class="pa-o pa-o-headphones"><rect class="pa-hp-cup" x="26" y="58" width="14" height="24" rx="7"/><rect class="pa-hp-cup" x="120" y="58" width="14" height="24" rx="7"/></g>
  <g class="pa-o pa-o-flower"><g transform="translate(112 30)">${[0, 72, 144, 216, 288].map(a => `<ellipse class="pa-petal" cx="0" cy="-5.5" rx="4" ry="5.5" transform="rotate(${a})"/>`).join('')}<circle class="pa-gold" r="3.4"/></g></g>
  <g class="pa-hat pa-f pa-f-engineer pa-hat-hard"><path class="pa-hardhat pa-line" d="M46 40c0-20 16-30 34-30s34 10 34 30z"/><rect class="pa-hardhat pa-line" x="40" y="37" width="80" height="7" rx="3.5"/><path class="pa-hardhat-ridge" d="M80 12v24"/></g>
  <g class="pa-hat pa-o pa-o-cap"><path class="pa-capbase pa-line" d="M56 34c0-8 48-8 48 0v8c-14-4-34-4-48 0z"/><path class="pa-capboard pa-line" d="M80 14l40 12-40 12-40-12z"/><path class="pa-tassel" d="M114 27v18"/><circle class="pa-gold" cx="114" cy="47" r="3"/></g>
  <g class="pa-hat pa-o pa-o-strawhat"><ellipse class="pa-straw pa-line" cx="80" cy="36" rx="50" ry="10"/><path class="pa-straw pa-line" d="M58 34c0-16 10-24 22-24s22 8 22 24c-14 3-30 3-44 0z"/><path class="pa-straw-band" d="M58 30c14 3 30 3 44 0"/></g>
  <g class="pa-hat pa-o pa-o-raincoat"><path class="pa-rain pa-line" d="M40 38c4-16 20-26 40-26s36 10 40 26c-24-6-56-6-80 0z"/><path class="pa-rain pa-line" d="M34 40c28-8 64-8 92 0l-4 6c-26-6-58-6-84 0z"/></g>
  <g class="pa-hat pa-o pa-o-wizard"><path class="pa-wizard pa-line" d="M54 36c8-12 16-28 34-34-4 10-2 20 18 34z"/><ellipse class="pa-wizard pa-line" cx="80" cy="37" rx="34" ry="6"/><path class="pa-gold" d="M84 16l2 4.4 4.8.6-3.5 3.3.9 4.8-4.2-2.3-4.2 2.3.9-4.8-3.5-3.3 4.8-.6z"/></g>
  </g>`;

 const front = [
  g('pa-helmet pa-o pa-o-spacesuit pa-f-astronaut', `<circle class="pa-glass" cx="80" cy="70" r="56"/><path class="pa-glass-glint" d="M42 50c6-14 18-22 32-24M40 62c0-3 1-6 2-8"/><path class="pa-collar" d="M42 108c22 12 54 12 76 0l2 8c-24 12-56 12-80 0z"/>`)
 ].join('');

 const fx = [
  g('pa-p pa-p-munch', `<g class="pa-munch-stick"><rect class="pa-bamboo" x="91" y="88" width="7" height="56" rx="3.5" transform="rotate(8 94 116)"/><rect class="pa-bamboo-node" x="90" y="112" width="9" height="2.6" rx="1.3" transform="rotate(8 94 116)"/><path class="pa-leaf" d="M98 90q12-10 22-6q-10 9-22 6z"/><path class="pa-leaf" d="M96 92q-2-14 6-20q2 12-6 20z"/></g>`),
  g('pa-p pa-p-mic', `<rect class="pa-mic-handle" x="89" y="108" width="6" height="34" rx="3" transform="rotate(6 92 125)"/><circle class="pa-mic-head" cx="90" cy="104" r="7.5"/><path class="pa-mic-grid" d="M84.5 102h11M84.5 106h11"/>`),
  g('pa-p pa-p-flask', `<path class="pa-flask pa-line" d="M128 92h8v10l9 18c2 4-1 8-5 8h-16c-4 0-7-4-5-8l9-18z"/><path class="pa-flask-liquid" d="M123 118h20l2 4c1 3-1 5-4 5h-16c-3 0-5-2-4-5z"/><path class="pa-flask-rim" d="M126 92h12"/>`),
  g('pa-p pa-p-notes', `<path class="pa-note pa-note-1" d="M128 54v-14l8-2v12"/><circle class="pa-note pa-note-1" cx="126" cy="54" r="3"/><circle class="pa-note pa-note-1" cx="134" cy="50" r="3"/><path class="pa-note pa-note-2" d="M26 40v-12"/><circle class="pa-note pa-note-2" cx="24" cy="40" r="3"/><path class="pa-note pa-note-2 pa-note-flag" d="M26 28q6 2 6 8"/>`),
  g('pa-p pa-p-zzz', `<text class="pa-z pa-z-1" x="118" y="40">z</text><text class="pa-z pa-z-2" x="128" y="28">z</text><text class="pa-z pa-z-3" x="140" y="16">Z</text>`),
  g('pa-p pa-p-stars', `<path class="pa-star pa-burst-1" d="M24 70l2.4 5 5.4.8-4 3.8 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.8 5.4-.8z"/><path class="pa-star pa-burst-2" d="M136 66l2.4 5 5.4.8-4 3.8 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.8 5.4-.8z"/><circle class="pa-spark pa-burst-3" cx="30" cy="30" r="2.5"/><circle class="pa-spark pa-burst-1" cx="132" cy="24" r="2.5"/>`),
  g('pa-p pa-p-drops', `<path class="pa-drop pa-drop-1" d="M146 132c2 3 3 5 3 6a3 3 0 0 1-6 0c0-1 1-3 3-6z"/><path class="pa-drop pa-drop-2" d="M152 140c2 3 3 5 3 6a3 3 0 0 1-6 0c0-1 1-3 3-6z"/><path class="pa-stem" d="M150 168v-12"/><path class="pa-leaf" d="M150 160q8-6 12-2q-6 5-12 2z"/>${flower(150, 154)}`),
  g('pa-p pa-p-pond', `<ellipse class="pa-water" cx="20" cy="164" rx="22" ry="7"/><path class="pa-ripple" d="M6 164h10M24 167h10"/>`),
  g('pa-p pa-p-bubbles', `<circle class="pa-bubble pa-bubble-1" cx="132" cy="112" r="2.6"/><circle class="pa-bubble pa-bubble-2" cx="136" cy="116" r="2"/><circle class="pa-bubble pa-bubble-3" cx="129" cy="118" r="2.2"/>`),
  g('pa-p pa-p-calm', `<ellipse class="pa-aura" cx="80" cy="110" rx="66" ry="62"/><path class="pa-leaf pa-calm-leaf" d="M26 92q8-6 14-2q-6 6-14 2z"/><path class="pa-leaf pa-calm-leaf pa-calm-2" d="M134 84q-8-6-14-2q6 6 14 2z"/>`)
 ].join('');

 const character = () => `<g class="pa-char">${window.foamTownPandaParts?.ride||''}${behind}${body}${outfitsOnBody}${window.foamTownPandaParts?.body||''}${legs}${scarf('scarf', 'pa-scarf')}${scarf('redscarf', 'pa-redscarf')}${held}${head}${window.foamTownPandaParts?.head||''}${arms}${front}${window.foamTownPandaParts?.props||''}</g>`;

 const full = (label) => `<svg class="panda-art" viewBox="0 0 160 180" role="img" aria-label="${label}" focusable="false"><g class="pa-scene">${scene}</g><ellipse class="pa-shadow" cx="80" cy="167" rx="40" ry="5"/><g class="pa-stage"><g class="pa-mover">${character()}</g></g><g class="pa-fx">${fx}</g></svg>`;
 const face = () => `<svg class="panda-art panda-face" viewBox="26 22 108 92" aria-hidden="true" focusable="false"><g class="pa-char">${head}</g></svg>`;

 window.foamPandaArt = (faceOnly = false, label = '熊猫') => faceOnly ? face() : full(label);
 const brand = () => document.querySelectorAll('.brand-mark').forEach(el => { if (!el.querySelector('.panda-face')) el.innerHTML = face(); });
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', brand); else brand();
})();

;
/* profile-avatars.js */
'use strict';
(() => {
 const A=window.foamAuth;if(!A)return;
 const presets=[
  ['bamboo','竹林伙伴','竹林日常','cub','scarf','#e2edda'],['breeze','清风团团','竹林日常','cub','none','#e0eeeb'],['music','听歌熊猫','竹林日常','cub','headphones','#e4e3f0'],['ribbon','礼服小客','竹林日常','cub','bowtie','#f3e5dc'],
  ['scholar','博学先生','学习伙伴','master','coat','#e3e9dd'],['engineer','网格工程师','学习伙伴','engineer','goggles','#e1e9ef'],['explorer','山野探索家','学习伙伴','explorer','backpack','#eae7d6'],['space','星空旅人','学习伙伴','astronaut','spacesuit','#e2e1f2'],
  ['spring','春日花花','四季小镇','cub','flower','#f2e2e7'],['summer','夏日草帽','四季小镇','cub','strawhat','#ecedcc'],['autumn','秋日围巾','四季小镇','cub','redscarf','#f3e4cc'],['winter','冬日暖帽','四季小镇','cub','beanie','#dceaf2']
 ];
 const records=new Map();let owner=null,loading=null,dialog=null;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fallback=id=>({user_id:id,avatar:'bamboo',photo_path:null});
 function photoURL(row){return row?.photo_path&&new RegExp('^'+row.user_id+'/[0-9a-f-]{36}\\.webp$').test(row.photo_path)?A.client?.storage.from('foamlab-avatars').getPublicUrl(row.photo_path).data.publicUrl:'';}
 function markup(row,compact=false){const photo=row?.avatar==='photo'?photoURL(row):'';if(photo)return `<img class="profile-avatar-photo" src="${esc(photo)}" alt="" loading="lazy">`;
  const p=presets.find(p=>p[0]===row?.avatar)||presets[0];return `<span class="profile-avatar-art" data-form="${p[3]}" data-outfit="${p[4]}" data-decoration="no-decor" data-quiet="true" style="--avatar-bg:${p[5]}">${window.foamPandaArt?.(compact)||''}</span>`;
 }
 function render(){document.querySelectorAll('[data-self-avatar],#account-avatar,#account-panel-avatar').forEach(el=>{el.innerHTML=A.user?markup(records.get(A.user.id)):'<span aria-hidden="true">F</span>';});document.querySelectorAll('[data-avatar-open]').forEach(b=>b.disabled=!A.user);}
 async function load(){const id=A.user?.id||null;if(owner===id)return loading;owner=id;if(!id){render();return;}
  render();loading=(async()=>{const {data,error}=await A.client.from('foamlab_avatars').select('user_id,avatar,photo_path').eq('user_id',id).maybeSingle();if(error){owner=null;return;}records.set(id,data||fallback(id));if(A.user?.id===id)render();})();return loading;
 }
 async function fetchMany(ids){const missing=[...new Set(ids)].filter(id=>id&&!records.has(id));if(!missing.length)return;const {data,error}=await A.client.from('foamlab_avatars').select('user_id,avatar,photo_path').in('user_id',missing);if(!error)for(const id of missing)records.set(id,(data||[]).find(x=>x.user_id===id)||fallback(id));}
 function close(){if(!dialog)return;dialog.close();dialog.remove();dialog=null;}
 async function open(){await A.ready;if(!A.user)return;await load();if(dialog)return;
  const id=A.user.id,current=records.get(id)||fallback(id);let selection=current.avatar,photoPath=current.photo_path,img=null,blobURL=null,dirtyPhoto=false,busy=false,zoom=1,pan={x:0,y:0},drag=null;
  const d=document.createElement('dialog');dialog=d;d.className='avatar-dialog';d.setAttribute('aria-labelledby','avatar-dialog-title');
  d.innerHTML=`<header><div><p class="eyebrow">我的头像</p><h2 id="avatar-dialog-title">选一个喜欢的自己</h2></div><button type="button" class="icon-button" data-avatar-close aria-label="关闭头像设置">×</button></header>
  <div class="avatar-editor-top"><div class="avatar-large" data-avatar-preview></div><div><strong>自定义照片</strong><p>上传 JPG、PNG 或 WebP 图片，拖动并缩放调整头像。</p><div class="avatar-upload-actions"><label class="button secondary avatar-upload">上传照片<input type="file" accept="image/jpeg,image/png,image/webp" data-avatar-file></label><button type="button" class="button secondary" data-avatar-edit ${photoPath?'':'hidden'}>调整已上传照片</button></div><small>支持 10 MB 以内的图片。</small></div></div>
  <section class="avatar-crop" hidden><canvas width="512" height="512" tabindex="0" aria-label="头像裁剪预览，拖动或用方向键调整位置"></canvas><label>缩放 <input type="range" min="1" max="3" step="0.01" value="1" data-avatar-zoom></label><p>拖动照片调整位置；键盘方向键也可微调。</p></section>
  <section class="avatar-presets" aria-label="默认熊猫头像">${[...new Set(presets.map(p=>p[2]))].map(group=>`<h3>${group}</h3><div class="avatar-preset-grid">${presets.filter(p=>p[2]===group).map(p=>`<button type="button" data-avatar-preset="${p[0]}" aria-pressed="${selection===p[0]}"><span class="avatar-choice-picture">${markup({avatar:p[0]})}</span><span>${p[1]}</span></button>`).join('')}</div>`).join('')}</section>
  <footer><p class="avatar-message" role="status"></p><div><button type="button" class="button secondary" data-avatar-close>取消</button><button type="button" class="button" data-avatar-save>保存头像</button></div></footer>`;
  (document.querySelector('#town-app')||document.body).append(d);d.showModal();
  const q=s=>d.querySelector(s),canvas=q('canvas'),ctx=canvas.getContext('2d'),crop=q('.avatar-crop'),message=q('.avatar-message');
  const preview=()=>{q('[data-avatar-preview]').innerHTML=selection==='photo'&&dirtyPhoto?`<img class="profile-avatar-photo" src="${canvas.toDataURL('image/webp',.8)}" alt="头像预览">`:markup({user_id:id,avatar:selection,photo_path:photoPath});d.querySelectorAll('[data-avatar-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.avatarPreset===selection)));};
  function paint(){if(!img)return;const scale=Math.max(512/img.width,512/img.height)*zoom,w=img.width*scale,h=img.height*scale;pan.x=Math.max(-(w-512)/2,Math.min((w-512)/2,pan.x));pan.y=Math.max(-(h-512)/2,Math.min((h-512)/2,pan.y));ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,512,512);ctx.drawImage(img,(512-w)/2+pan.x,(512-h)/2+pan.y,w,h);preview();}
  function cleanup(){if(blobURL)URL.revokeObjectURL(blobURL);if(dialog===d)dialog=null;d.remove();}
  d.addEventListener('close',cleanup,{once:true});d.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
  d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-avatar-close]')){if(!busy)d.close();}const b=e.target.closest('[data-avatar-preset]');if(b&&!busy){selection=b.dataset.avatarPreset;crop.hidden=true;preview();}});
  async function readPhoto(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('请选择 JPG、PNG 或 WebP 图片。');if(file.size>10*1024*1024)throw Error('图片超过 10 MB，请选择小一些的照片。');
   const url=URL.createObjectURL(file),next=new Image();try{next.src=url;await next.decode();if(!next.naturalWidth||!next.naturalHeight)throw Error();}catch{URL.revokeObjectURL(url);throw Error('这张图片无法读取，请换一张。');}
   if(!d.isConnected){URL.revokeObjectURL(url);return;}if(blobURL)URL.revokeObjectURL(blobURL);blobURL=url;img=next;selection='photo';dirtyPhoto=true;zoom=1;pan={x:0,y:0};q('[data-avatar-zoom]').value='1';q('[data-avatar-edit]').hidden=false;crop.hidden=false;message.textContent='';paint();
  }
  q('[data-avatar-file]').onchange=async e=>{const file=e.target.files[0];if(file)try{await readPhoto(file);}catch(error){message.textContent=error.message;}e.target.value='';};
  q('[data-avatar-edit]').onclick=async()=>{if(busy)return;if(img){selection='photo';crop.hidden=false;paint();return;}try{const res=await fetch(photoURL({user_id:id,photo_path:photoPath}));if(!res.ok)throw Error('照片暂时无法读取，请重试或重新上传。');await readPhoto(await res.blob());}catch(error){message.textContent=error.message;}};
  q('[data-avatar-zoom]').oninput=e=>{zoom=Number(e.target.value);paint();};
  canvas.onpointerdown=e=>{if(busy)return;canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};e.preventDefault();};
  canvas.onpointermove=e=>{if(!drag)return;const scale=512/canvas.getBoundingClientRect().width;pan={x:drag.px+(e.clientX-drag.x)*scale,y:drag.py+(e.clientY-drag.y)*scale};paint();};
  canvas.onpointerup=canvas.onpointercancel=()=>drag=null;
  canvas.onkeydown=e=>{const v={ArrowLeft:[-6,0],ArrowRight:[6,0],ArrowUp:[0,-6],ArrowDown:[0,6]}[e.key];if(v&&!busy){e.preventDefault();pan.x+=v[0];pan.y+=v[1];paint();}};
  q('[data-avatar-save]').onclick=async()=>{if(busy)return;busy=true;message.textContent='正在保存…';d.querySelectorAll('button,input').forEach(b=>b.disabled=true);let uploaded=null;
   try{if(A.user?.id!==id)throw Error('登录账号已变化，请重新打开头像设置。');
    if(selection==='photo'&&dirtyPhoto){const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.9));if(!blob)throw Error('照片处理失败，请重新选择。');uploaded=id+'/'+crypto.randomUUID()+'.webp';const {error}=await A.client.storage.from('foamlab-avatars').upload(uploaded,blob,{contentType:'image/webp',cacheControl:'31536000',upsert:false});if(error)throw error;photoPath=uploaded;}
    const row={user_id:id,avatar:selection,photo_path:photoPath};const {error}=await A.client.from('foamlab_avatars').upsert(row,{onConflict:'user_id'});if(error)throw error;
    records.set(id,row);render();window.dispatchEvent(new CustomEvent('foam-avatar-change',{detail:{userId:id}}));
    if(uploaded&&current.photo_path&&current.photo_path!==uploaded)A.client.storage.from('foamlab-avatars').remove([current.photo_path]).catch(()=>{});
    d.close();window.foamNotify?.('头像已保存。');
   }catch(error){if(uploaded)A.client.storage.from('foamlab-avatars').remove([uploaded]).catch(()=>{});photoPath=current.photo_path;message.textContent='保存失败，当前选择已保留，请重试。';busy=false;d.querySelectorAll('button,input').forEach(b=>b.disabled=false);}
  };preview();
 }
 window.FoamAvatar={open,render,load,fetchMany,markup,get:id=>records.get(id)};
 document.addEventListener('click',e=>{if(e.target.closest('[data-avatar-open]')){e.preventDefault();open();}});
 window.addEventListener('foam-auth-change',()=>{if(owner!==A.user?.id&&dialog)close();load();render();});
 const fields=document.querySelector('#profile-fields');if(fields)fields.insertAdjacentHTML('afterbegin','<div class="profile-avatar-setting"><span class="avatar-large" data-self-avatar></span><div><h3>个人头像</h3><p>上传自己的照片，或挑选一位熊猫伙伴。</p><button type="button" class="button secondary" data-avatar-open>修改头像</button></div></div>');
 A.ready.then(load);render();
})();

;
/* town/panda-expansion.js */
'use strict';
(() => {
 const part=(category,id,body,cls='')=>`<g class="pa-town-part pa-town-${id} ${cls}" data-collection="${category}" data-item="${id}">${body}</g>`;
 const path=(d,fill='#6c9c91',stroke='#435e56')=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>`;
 const circle=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
 const body=[
 part('form','sailor',path('M50 108h60l7 40H43z','#f1efe1')+path('M50 113h60m-63 10h66m-68 10h70','none','#688ca1')),
 part('form','pilot',path('M48 109q32-13 64 0l6 42H42z','#be9571')+path('M80 109v43m-17-35h13m9 0h12','none','#795c45')),
 part('form','polar',path('M44 107q36-18 72 0l6 48H38z','#a4c3d5')+path('M51 116h58m-61 14h65m-64 13h64M80 106v47','none','#6f94a9')),
 part('outfit','overalls',path('M53 110v-8h9v17h35v-17h9v8l7 43H46z','#74999b')+'<rect x="69" y="127" width="22" height="15" rx="3" fill="#a7c0b4"/>'+path('M83 131v-14m-4 2 4-5 4 5','none','#697a70')),
 part('outfit','bowtie',path('M79 114l-14-8v18l14-8 15 8v-18z','#b9786a')),
 part('outfit','stethoscope',path('M62 105v17q18 20 36 0v-17M80 137v8','none','#657782')+circle(80,147,6,'#b5c2c3')),
 part('outfit','badge-card','<path d="M66 105l14 23 14-23" stroke="#799d8c" stroke-width="3" fill="none"/><rect x="71" y="124" width="20" height="24" rx="4" fill="#f6e6bd" stroke="#798f80" stroke-width="2"/><path d="M75 139h12m-12 5h9" stroke="#799d8c" stroke-width="2"/>'),
 part('outfit','zongzi',path('M112 130l12 19-22-1z','#8cad78')+path('M105 141l15-5m-9-7 4 18','none','#dbe3ba')),
 ].join('');
 const head=[
 part('form','sailor',path('M51 32l9-18h40l9 18z','#f5f2df')+'<rect x="51" y="30" width="58" height="9" rx="4" fill="#7a9eb2"/>','pa-town-form-hat'),
 part('form','pilot',path('M41 45q4-35 39-35t39 35l-12-8q-27-14-54 0z','#af855d')+'<g fill="#bed9d9" stroke="#625b4d" stroke-width="3"><ellipse cx="66" cy="29" rx="13" ry="9"/><ellipse cx="94" cy="29" rx="13" ry="9"/></g>','pa-town-form-hat'),
 part('form','polar',path('M34 50q2-36 46-38t46 38l-10-9q-36-23-72 0z','#bdd4df')+'<path d="M36 44q44-40 88 0" stroke="#faf5e4" stroke-width="12" fill="none" stroke-linecap="round"/>','pa-town-form-hat'),
 part('outfit','beanie',path('M45 37q3-30 35-30t35 30z','#c99880')+'<rect x="44" y="32" width="72" height="10" rx="5" fill="#e7c3a1"/>'+circle(80,7,8,'#edc8a3'),'pa-town-outfit-hat'),
 part('outfit','sunglasses','<g fill="#405957" stroke="#aeba99" stroke-width="3"><circle cx="61" cy="68" r="13"/><circle cx="99" cy="68" r="13"/><path d="M74 66h12"/></g>'),
 ].join('');
 const props=[
 part('outfit','palette','<ellipse cx="121" cy="124" rx="16" ry="11" fill="#cdb48a" transform="rotate(-20 121 124)"/>'+circle(115,120,3,'#c88670')+circle(124,119,3,'#7b9eab')+circle(129,127,3,'#87a870')+path('M39 125l-7-30','none','#997b59')),
 part('outfit','scroll','<rect x="116" y="88" width="15" height="55" rx="7" fill="#e6d5ab" stroke="#9a8565" stroke-width="2"/><path d="M116 117h15" stroke="#a4705d" stroke-width="3"/>'),
 part('outfit','basket',path('M116 119l20-10 6 39-27 4z','#b7a174')+'<path d="M120 121l14-8m-14 16 16-8m-16 16 17-8" stroke="#806f51" stroke-width="2"/>'+path('M131 115l3-29m-8 26-4-26','none','#749961')),
 part('outfit','lantern-red','<path d="M122 114v18" stroke="#b28b56" stroke-width="3"/><ellipse cx="122" cy="145" rx="13" ry="16" fill="#c77764"/><path d="M111 138h22m-22 14h22m-11 9v8" stroke="#ead098" stroke-width="3"/>'),
 part('outfit','moon-lamp','<path d="M121 113v24" stroke="#a99870" stroke-width="3"/>'+path('M130 132c-30-4-28 34 0 30-17-5-19-24 0-30z','#efdba0')),
 '<g class="pa-town-prop pa-town-keyboard"><rect x="32" y="140" width="91" height="17" rx="5" fill="#abbeb5" stroke="#52776b" stroke-width="2"/><path d="M42 146h70m-61 6h45" stroke="#f7f6dd" stroke-width="4" stroke-dasharray="5 4"/></g>',
 '<g class="pa-town-prop pa-town-camera"><rect x="59" y="100" width="43" height="28" rx="6" fill="#567b73" stroke="#385c51" stroke-width="2"/>'+circle(81,114,10,'#bad6cf')+circle(81,114,5,'#4e797b')+'</g>',
 '<g class="pa-town-prop pa-town-kite"><path d="M108 126q36-29 16-96" fill="none" stroke="#bb9d75" stroke-width="2"/>'+path('M121-8l23 18-16 25-23-19z','#d4a679')+path('M121-8l7 43m-23-19 39-6','none','#f4e3b5')+'</g>',
 '<g class="pa-town-prop pa-town-bubbles"><path d="M44 123l-7-25" stroke="#8ab7a9" stroke-width="3"/><circle cx="34" cy="91" r="8" fill="none" stroke="#8ab7a9" stroke-width="3"/><g fill="#d9ebe4" fill-opacity=".35" stroke="#86b8bb" stroke-width="2"><circle class="pa-town-bubble" cx="28" cy="72" r="9"/><circle class="pa-town-bubble" cx="40" cy="48" r="6"/><circle class="pa-town-bubble" cx="14" cy="42" r="10"/></g></g>',
 '<g class="pa-town-prop pa-town-stream"><path d="M20 135q24-22 57-1t66-3M16 122q29-20 64-1t61-7M25 146q28-14 51 0t58-4" stroke="#73b1ad" stroke-width="3" fill="none" stroke-linecap="round"/></g>',
 '<g class="pa-town-prop pa-town-firework"><path d="M80 2v-14m-17 7-9-11m44 11 9-11m-60 29h-13m79 0h13m-73 17-9 10m55-10 9 10" stroke="#d9b36c" stroke-width="3" stroke-linecap="round"/></g>',
 ].join('');
 const ride=[
 part('ride','skateboard','<rect x="27" y="166" width="107" height="7" rx="4" fill="#bb9875"/><g fill="#586963"><circle cx="48" cy="176" r="5"/><circle cx="114" cy="176" r="5"/></g>'),
 part('ride','bicycle','<g fill="none" stroke="#678c85" stroke-width="3"><circle cx="31" cy="151" r="23"/><circle cx="133" cy="151" r="23"/><path d="m31 151 32-36 28 36H31m60 0 33-30-5-15h14m-10 13 10 32M63 115l-2-13h-9"/></g>'),
 part('ride','balloon','<path d="M117 123l14-99m-14 99 34-78m-34 78-15-101" fill="none" stroke="#b09f77" stroke-width="1.8"/><ellipse cx="129" cy="8" rx="16" ry="23" fill="#c2a5af"/><ellipse cx="151" cy="29" rx="14" ry="20" fill="#d8bd7d"/><ellipse cx="100" cy="5" rx="14" ry="20" fill="#8fb6a4"/>'),
 ].join('');
 window.foamTownPandaParts={body,head,props,ride};
 const style=document.createElement('style');style.textContent='.pa-town-part,.pa-town-prop{display:none}'+[...new Set([...body.matchAll(/data-collection="(.*?)" data-item="(.*?)"/g),...head.matchAll(/data-collection="(.*?)" data-item="(.*?)"/g),...props.matchAll(/data-collection="(.*?)" data-item="(.*?)"/g),...ride.matchAll(/data-collection="(.*?)" data-item="(.*?)"/g)].map(m=>`[data-${m[1]}="${m[2]}"] .pa-town-${m[2]}{display:block}`))].join('');document.head.append(style);
})();

