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
