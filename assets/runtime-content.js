/* vendor/purify.min.js */
/*! @license DOMPurify 3.4.16 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.16/LICENSE */
(function(e,t){typeof exports==`object`&&typeof module<`u`?module.exports=t():typeof define==`function`&&define.amd?define([],t):(e=typeof globalThis<`u`?globalThis:e||self,e.DOMPurify=t())})(this,function(){"use strict";function e(e,t){this.v=e,this.k=t}function t(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}function n(e){if(Array.isArray(e))return e}function r(e,t){var n=e==null?null:typeof Symbol<`u`&&e[Symbol.iterator]||e[`@@iterator`];if(n!=null){var r,i,a,o,s=[],c=!0,l=!1;try{if(a=(n=n.call(e)).next,t===0){if(Object(n)!==n)return;c=!1}else for(;!(c=(r=a.call(n)).done)&&(s.push(r.value),s.length!==t);c=!0);}catch(e){l=!0,i=e}finally{try{if(!c&&n.return!=null&&(o=n.return(),Object(o)!==o))return}finally{if(l)throw i}}return s}}function i(){throw TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}
/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
function a(e,t){return n(e)||r(e,t)||o(e,t)||i()}function o(e,n){if(e){if(typeof e==`string`)return t(e,n);var r={}.toString.call(e).slice(8,-1);return r===`Object`&&e.constructor&&(r=e.constructor.name),r===`Map`||r===`Set`?Array.from(e):r===`Arguments`||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?t(e,n):void 0}}function s(t){var n,r;function i(n,r){try{var o=t[n](r),s=o.value,c=s instanceof e;Promise.resolve(c?s.v:s).then(function(e){if(c){var r=n===`return`&&s.k?n:`next`;if(!s.k||e.done)return i(r,e);e=t[r](e).value}a(!!o.done,e)},function(e){i(`throw`,e)})}catch(e){a(2,e)}}function a(e,t){e===2?n.reject(t):n.resolve({value:t,done:e}),(n=n.next)?i(n.key,n.arg):r=null}this._invoke=function(e,t){return new Promise(function(a,o){var s={key:e,arg:t,resolve:a,reject:o,next:null};r?r=r.next=s:(n=r=s,i(e,t))})},typeof t.return!=`function`&&(this.return=void 0)}s.prototype[typeof Symbol==`function`&&Symbol.asyncIterator||`@@asyncIterator`]=function(){return this},s.prototype.next=function(e){return this._invoke(`next`,e)},s.prototype.throw=function(e){return this._invoke(`throw`,e)},s.prototype.return=function(e){return this._invoke(`return`,e)};let c=Object.entries,l=Object.setPrototypeOf,u=Object.isFrozen,d=Object.getPrototypeOf,f=Object.getOwnPropertyDescriptor,p=Object.freeze,m=Object.seal,h=Object.create,ee=typeof Reflect<`u`&&Reflect,g=ee.apply,te=ee.construct;p||(p=function(e){return e}),m||(m=function(e){return e}),g||(g=function(e,t){var n=[...arguments].slice(2);return e.apply(t,n)}),te||(te=function(e){return new e(...[...arguments].slice(1))});let _=T(Array.prototype.forEach);Array.prototype.indexOf;let ne=T(Array.prototype.lastIndexOf),re=T(Array.prototype.pop),ie=T(Array.prototype.push);Array.prototype.slice;let ae=T(Array.prototype.splice),v=Array.isArray,oe=T(String.prototype.toLowerCase),se=T(String.prototype.toString),ce=T(String.prototype.match),le=T(String.prototype.replace),ue=T(String.prototype.indexOf),de=T(String.prototype.trim),fe=T(Number.prototype.toString),y=T(Boolean.prototype.toString),b=typeof BigInt>`u`?null:T(BigInt.prototype.toString),pe=typeof Symbol>`u`?null:T(Symbol.prototype.toString),x=T(Object.prototype.hasOwnProperty),S=T(Object.prototype.toString),C=T(RegExp.prototype.test),w=E(TypeError);function T(e){return function(t){t instanceof RegExp&&(t.lastIndex=0);var n=[...arguments].slice(1);return g(e,t,n)}}function E(e){return function(){return te(e,[...arguments])}}function D(e,t){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:oe;if(l&&l(e,null),!v(t))return e;let r=t.length;for(;r--;){let i=t[r];if(typeof i==`string`){let e=n(i);e!==i&&(u(t)||(t[r]=e),i=e)}e[i]=!0}return e}function me(e){for(let t=0;t<e.length;t++)x(e,t)||(e[t]=null);return e}function O(e){let t=h(null);for(let r of c(e)){var n=a(r,2);let i=n[0],o=n[1];x(e,i)&&(t[i]=v(o)?me(o):o&&typeof o==`object`&&o.constructor===Object?O(o):o)}return t}function he(e){switch(typeof e){case`string`:return e;case`number`:return fe(e);case`boolean`:return y(e);case`bigint`:return b?b(e):`0`;case`symbol`:return pe?pe(e):`Symbol()`;case`undefined`:return S(e);case`function`:case`object`:{if(e===null)return S(e);let t=e,n=k(t,`toString`);if(typeof n==`function`){let e=n(t);return typeof e==`string`?e:S(e)}return S(e)}default:return S(e)}}function k(e,t){for(;e!==null;){let n=f(e,t);if(n){if(n.get)return T(n.get);if(typeof n.value==`function`)return T(n.value)}e=d(e)}function n(){return null}return n}function ge(e){try{return C(e,``),!0}catch(e){return!1}}let _e=p(/* @__PURE__ */ `a.abbr.acronym.address.area.article.aside.audio.b.bdi.bdo.big.blink.blockquote.body.br.button.canvas.caption.center.cite.code.col.colgroup.content.data.datalist.dd.decorator.del.details.dfn.dialog.dir.div.dl.dt.element.em.fieldset.figcaption.figure.font.footer.form.h1.h2.h3.h4.h5.h6.head.header.hgroup.hr.html.i.img.input.ins.kbd.label.legend.li.main.map.mark.marquee.menu.menuitem.meter.nav.nobr.ol.optgroup.option.output.p.picture.pre.progress.q.rp.rt.ruby.s.samp.search.section.select.shadow.slot.small.source.spacer.span.strike.strong.style.sub.summary.sup.table.tbody.td.template.textarea.tfoot.th.thead.time.tr.track.tt.u.ul.var.video.wbr`.split(`.`)),ve=p(/* @__PURE__ */ `svg.a.altglyph.altglyphdef.altglyphitem.animatecolor.animatemotion.animatetransform.circle.clippath.defs.desc.ellipse.enterkeyhint.exportparts.filter.font.g.glyph.glyphref.hkern.image.inputmode.line.lineargradient.marker.mask.metadata.mpath.part.path.pattern.polygon.polyline.radialgradient.rect.stop.style.switch.symbol.text.textpath.title.tref.tspan.view.vkern`.split(`.`)),ye=p([`feBlend`,`feColorMatrix`,`feComponentTransfer`,`feComposite`,`feConvolveMatrix`,`feDiffuseLighting`,`feDisplacementMap`,`feDistantLight`,`feDropShadow`,`feFlood`,`feFuncA`,`feFuncB`,`feFuncG`,`feFuncR`,`feGaussianBlur`,`feImage`,`feMerge`,`feMergeNode`,`feMorphology`,`feOffset`,`fePointLight`,`feSpecularLighting`,`feSpotLight`,`feTile`,`feTurbulence`]),be=p([`animate`,`color-profile`,`cursor`,`discard`,`font-face`,`font-face-format`,`font-face-name`,`font-face-src`,`font-face-uri`,`foreignobject`,`hatch`,`hatchpath`,`mesh`,`meshgradient`,`meshpatch`,`meshrow`,`missing-glyph`,`script`,`set`,`solidcolor`,`unknown`,`use`]),xe=p(/* @__PURE__ */ `math.menclose.merror.mfenced.mfrac.mglyph.mi.mlabeledtr.mmultiscripts.mn.mo.mover.mpadded.mphantom.mroot.mrow.ms.mspace.msqrt.mstyle.msub.msup.msubsup.mtable.mtd.mtext.mtr.munder.munderover.mprescripts`.split(`.`)),Se=p([`maction`,`maligngroup`,`malignmark`,`mlongdiv`,`mscarries`,`mscarry`,`msgroup`,`mstack`,`msline`,`msrow`,`semantics`,`annotation`,`annotation-xml`,`mprescripts`,`none`]),Ce=p([`#text`]),we=p(/* @__PURE__ */ `accept.action.align.alt.autocapitalize.autocomplete.autopictureinpicture.autoplay.background.bgcolor.border.capture.cellpadding.cellspacing.checked.cite.class.clear.color.cols.colspan.command.commandfor.controls.controlslist.coords.crossorigin.datetime.decoding.default.dir.disabled.disablepictureinpicture.disableremoteplayback.download.draggable.enctype.enterkeyhint.exportparts.face.for.headers.height.hidden.high.href.hreflang.id.inert.inputmode.integrity.ismap.kind.label.lang.list.loading.loop.low.max.maxlength.media.method.min.minlength.multiple.muted.name.nonce.noshade.novalidate.nowrap.open.optimum.part.pattern.placeholder.playsinline.popover.popovertarget.popovertargetaction.poster.preload.pubdate.radiogroup.readonly.rel.required.rev.reversed.role.rows.rowspan.spellcheck.scope.selected.shape.size.sizes.slot.span.srclang.start.src.srcset.step.style.summary.tabindex.title.translate.type.usemap.valign.value.width.wrap.xmlns`.split(`.`)),Te=p(/* @__PURE__ */ `accent-height.accumulate.additive.alignment-baseline.amplitude.ascent.attributename.attributetype.azimuth.basefrequency.baseline-shift.begin.bias.by.class.clip.clippathunits.clip-path.clip-rule.color.color-interpolation.color-interpolation-filters.color-profile.color-rendering.cx.cy.d.dx.dy.diffuseconstant.direction.display.divisor.dominant-baseline.dur.edgemode.elevation.end.exponent.fill.fill-opacity.fill-rule.filter.filterunits.flood-color.flood-opacity.font-family.font-size.font-size-adjust.font-stretch.font-style.font-variant.font-weight.fx.fy.g1.g2.glyph-name.glyphref.gradientunits.gradienttransform.height.href.id.image-rendering.in.in2.intercept.k.k1.k2.k3.k4.kerning.keypoints.keysplines.keytimes.lang.lengthadjust.letter-spacing.kernelmatrix.kernelunitlength.lighting-color.local.marker-end.marker-mid.marker-start.markerheight.markerunits.markerwidth.maskcontentunits.maskunits.max.mask.mask-type.media.method.mode.min.name.numoctaves.offset.operator.opacity.order.orient.orientation.origin.overflow.paint-order.path.pathlength.patterncontentunits.patterntransform.patternunits.pointer-events.points.preservealpha.preserveaspectratio.primitiveunits.r.rx.ry.radius.refx.refy.repeatcount.repeatdur.restart.result.rotate.scale.seed.shape-rendering.slope.specularconstant.specularexponent.spreadmethod.startoffset.stddeviation.stitchtiles.stop-color.stop-opacity.stroke-dasharray.stroke-dashoffset.stroke-linecap.stroke-linejoin.stroke-miterlimit.stroke-opacity.stroke.stroke-width.style.surfacescale.systemlanguage.tabindex.tablevalues.targetx.targety.transform.transform-origin.text-anchor.text-decoration.text-orientation.text-rendering.textlength.type.u1.u2.unicode.values.vector-effect.viewbox.visibility.version.vert-adv-y.vert-origin-x.vert-origin-y.width.word-spacing.wrap.writing-mode.xchannelselector.ychannelselector.x.x1.x2.xmlns.y.y1.y2.z.zoomandpan`.split(`.`)),Ee=p(/* @__PURE__ */ `accent.accentunder.align.bevelled.close.columnalign.columnlines.columnspacing.columnspan.denomalign.depth.dir.display.displaystyle.encoding.fence.frame.height.href.id.largeop.length.linethickness.lquote.lspace.mathbackground.mathcolor.mathsize.mathvariant.maxsize.minsize.movablelimits.notation.numalign.open.rowalign.rowlines.rowspacing.rowspan.rspace.rquote.scriptlevel.scriptminsize.scriptsizemultiplier.selection.separator.separators.stretchy.subscriptshift.supscriptshift.symmetric.voffset.width.xmlns`.split(`.`)),De=p([`xlink:href`,`xml:id`,`xlink:title`,`xml:space`,`xmlns:xlink`]),Oe=m(/{{[\w\W]*|^[\w\W]*}}/g),ke=m(/<%[\w\W]*|^[\w\W]*%>/g),Ae=m(/\${[\w\W]*/g),je=m(/^data-[\-\w.\u00B7-\uFFFF]+$/),Me=m(/^aria-[\-\w]+$/),Ne=m(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),Pe=m(/^(?:\w+script|data):/i),Fe=m(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),Ie=m(/^html$/i),Le=m(/^[a-z][.\w]*(-[.\w]+)+$/i),Re=m(/<[/\w!]/g),ze=m(/<[/\w]/g),Be=m(/<\/no(script|embed|frames)/i),Ve=m(/\/>/i),A={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,processingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},j=[`style`,`script`,`xmp`,`iframe`,`noembed`,`noframes`,`plaintext`,`noscript`],He=p(D({},j)),Ue=function(){let e={};return _(j,t=>{e[t]=m(RegExp(`</`+t+`(?=[\\t\\n\\f\\r />])`,`i`))}),p(e)}(),We=function(){return typeof window>`u`?null:window},Ge=function(e,t){if(typeof e!=`object`||typeof e.createPolicy!=`function`)return null;let n=null,r=`data-tt-policy-suffix`;t&&t.hasAttribute(r)&&(n=t.getAttribute(r));let i=`dompurify`+(n?`#`+n:``);try{return e.createPolicy(i,{createHTML(e){return e},createScriptURL(e){return e}})}catch(e){return console.warn(`TrustedTypes policy `+i+` could not be created.`),null}},Ke=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}},M=function(e,t,n,r){return x(e,t)&&v(e[t])?D(r.base?O(r.base):{},e[t],r.transform):n},qe=function(e,t,n){let r=x(e,t)?e[t]:void 0;return r&&typeof r==`object`?O(r):n()};function Je(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:We(),t=e=>Je(e);if(t.version=`3.4.16`,t.removed=[],!e||!e.document||e.document.nodeType!==A.document||!e.Element)return t.isSupported=!1,t;let n=e.document,r=n,i=r.currentScript;e.DocumentFragment;let a=e.HTMLTemplateElement,o=e.Node,s=e.Element,l=e.NodeFilter;e.NamedNodeMap===void 0&&(e.NamedNodeMap||e.MozNamedAttrMap),e.HTMLFormElement;let u=e.DOMParser,d=e.trustedTypes,f=s.prototype,ee=k(f,`cloneNode`),g=k(f,`remove`),te=k(f,`removeAttributeNode`),fe=k(f,`nextSibling`),y=k(f,`childNodes`),b=k(f,`parentNode`),pe=k(f,`shadowRoot`),S=k(f,`attributes`),T=o&&o.prototype?k(o.prototype,`nodeType`):null,E=o&&o.prototype?k(o.prototype,`nodeName`):null,me=o&&o.prototype?k(o.prototype,`ownerDocument`):null,j=function(e){return T?T(e):e.nodeType},Ye=function(e){return E?E(e):e.nodeName};if(typeof a==`function`){let e=n.createElement(`template`);e.content&&e.content.ownerDocument&&(n=e.content.ownerDocument)}let N,P=``,Xe,Ze=!1,Qe=0,$e=function(){if(Qe>0)throw w(`A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.`)},F=function(e){$e(),Qe++;try{return N.createHTML(e)}finally{Qe--}},et=function(e){$e(),Qe++;try{return N.createScriptURL(e)}finally{Qe--}},tt=function(){return Ze||(Xe=Ge(d,i),Ze=!0),Xe},nt=n,rt=nt.implementation,it=nt.createNodeIterator,at=nt.createDocumentFragment,ot=nt.getElementsByTagName,st=r.importNode,I=Ke();t.isSupported=typeof c==`function`&&typeof b==`function`&&rt&&rt.createHTMLDocument!==void 0;let ct=Oe,lt=ke,ut=Ae,dt=je,ft=Me,pt=Pe,mt=Fe,ht=Le,gt=Ne,L=null,_t=D({},[..._e,...ve,...ye,...xe,...Ce]),R=null,vt=D({},[...we,...Te,...Ee,...De]),z=Object.seal(h(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),yt=null,bt=null,B=Object.seal(h(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}})),xt=!0,St=!0,Ct=!1,wt=!0,V=!1,H=!0,U=!1,Tt=!1,Et=null,Dt=null,Ot=!1,W=!1,kt=!1,At=!1,jt=!0,Mt=!1,Nt=`user-content-`,Pt=!0,Ft=!1,G={},K=null,It=D({},/* @__PURE__ */ `annotation-xml.audio.colgroup.desc.foreignobject.head.iframe.math.mi.mn.mo.ms.mtext.noembed.noframes.noscript.plaintext.script.selectedcontent.style.svg.template.thead.title.video.xmp`.split(`.`)),Lt=null,Rt=D({},[`audio`,`video`,`img`,`source`,`image`,`track`]),zt=null,Bt=D({},[`alt`,`class`,`for`,`id`,`label`,`name`,`pattern`,`placeholder`,`role`,`summary`,`title`,`value`,`style`,`xmlns`]),Vt=`http://www.w3.org/1998/Math/MathML`,Ht=`http://www.w3.org/2000/svg`,q=`http://www.w3.org/1999/xhtml`,J=q,Ut=!1,Wt=null,Gt=D({},[Vt,Ht,q],se),Kt=p([`mi`,`mo`,`mn`,`ms`,`mtext`]),qt=D({},Kt),Jt=p([`annotation-xml`]),Yt=D({},Jt),Xt=D({},[`title`,`style`,`font`,`a`,`script`]),Zt=null,Qt=[`application/xhtml+xml`,`text/html`],Y=null,$t=null,en=n.createElement(`form`),tn=function(e){return e instanceof RegExp||e instanceof Function},nn=function(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if($t&&$t===e)return;(!e||typeof e!=`object`)&&(e={}),e=O(e),Zt=Qt.indexOf(e.PARSER_MEDIA_TYPE)===-1?`text/html`:e.PARSER_MEDIA_TYPE,Y=Zt===`application/xhtml+xml`?se:oe,L=M(e,`ALLOWED_TAGS`,_t,{transform:Y}),R=M(e,`ALLOWED_ATTR`,vt,{transform:Y}),Wt=M(e,`ALLOWED_NAMESPACES`,Gt,{transform:se}),zt=M(e,`ADD_URI_SAFE_ATTR`,Bt,{transform:Y,base:Bt}),Lt=M(e,`ADD_DATA_URI_TAGS`,Rt,{transform:Y,base:Rt}),K=M(e,`FORBID_CONTENTS`,It,{transform:Y}),yt=M(e,`FORBID_TAGS`,O({}),{transform:Y}),bt=M(e,`FORBID_ATTR`,O({}),{transform:Y}),G=x(e,`USE_PROFILES`)?e.USE_PROFILES&&typeof e.USE_PROFILES==`object`?O(e.USE_PROFILES):e.USE_PROFILES:!1,xt=e.ALLOW_ARIA_ATTR!==!1,St=e.ALLOW_DATA_ATTR!==!1,Ct=e.ALLOW_UNKNOWN_PROTOCOLS||!1,wt=e.ALLOW_SELF_CLOSE_IN_ATTR!==!1,V=e.SAFE_FOR_TEMPLATES||!1,H=e.SAFE_FOR_XML!==!1,U=e.WHOLE_DOCUMENT||!1,W=e.RETURN_DOM||!1,kt=e.RETURN_DOM_FRAGMENT||!1,At=e.RETURN_TRUSTED_TYPE||!1,Ot=e.FORCE_BODY||!1,jt=e.SANITIZE_DOM!==!1,Mt=e.SANITIZE_NAMED_PROPS||!1,Pt=e.KEEP_CONTENT!==!1,Ft=e.IN_PLACE||!1,gt=ge(e.ALLOWED_URI_REGEXP)?e.ALLOWED_URI_REGEXP:Ne,J=typeof e.NAMESPACE==`string`?e.NAMESPACE:q,qt=qe(e,`MATHML_TEXT_INTEGRATION_POINTS`,()=>D({},Kt)),Yt=qe(e,`HTML_INTEGRATION_POINTS`,()=>D({},Jt));let t=qe(e,`CUSTOM_ELEMENT_HANDLING`,()=>h(null));if(z=h(null),x(t,`tagNameCheck`)&&tn(t.tagNameCheck)&&(z.tagNameCheck=t.tagNameCheck),x(t,`attributeNameCheck`)&&tn(t.attributeNameCheck)&&(z.attributeNameCheck=t.attributeNameCheck),x(t,`allowCustomizedBuiltInElements`)&&typeof t.allowCustomizedBuiltInElements==`boolean`&&(z.allowCustomizedBuiltInElements=t.allowCustomizedBuiltInElements),m(z),V&&(St=!1),kt&&(W=!0),G&&(L=D({},Ce),R=h(null),G.html===!0&&(D(L,_e),D(R,we)),G.svg===!0&&(D(L,ve),D(R,Te),D(R,De)),G.svgFilters===!0&&(D(L,ye),D(R,Te),D(R,De)),G.mathMl===!0&&(D(L,xe),D(R,Ee),D(R,De))),B.tagCheck=null,B.attributeCheck=null,x(e,`ADD_TAGS`)&&(typeof e.ADD_TAGS==`function`?B.tagCheck=e.ADD_TAGS:v(e.ADD_TAGS)&&(L===_t&&(L=O(L)),D(L,e.ADD_TAGS,Y))),x(e,`ADD_ATTR`)&&(typeof e.ADD_ATTR==`function`?B.attributeCheck=e.ADD_ATTR:v(e.ADD_ATTR)&&(R===vt&&(R=O(R)),D(R,e.ADD_ATTR,Y))),x(e,`ADD_FORBID_CONTENTS`)&&v(e.ADD_FORBID_CONTENTS)&&(K===It&&(K=O(K)),D(K,e.ADD_FORBID_CONTENTS,Y)),Pt&&(L[`#text`]=!0),U&&D(L,[`html`,`head`,`body`]),L.table&&(D(L,[`tbody`]),delete yt.tbody),e.TRUSTED_TYPES_POLICY){if(typeof e.TRUSTED_TYPES_POLICY.createHTML!=`function`)throw w(`TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.`);if(typeof e.TRUSTED_TYPES_POLICY.createScriptURL!=`function`)throw w(`TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.`);let t=N;N=e.TRUSTED_TYPES_POLICY;try{P=F(``)}catch(e){throw N=t,e}}else e.TRUSTED_TYPES_POLICY===null?(N=void 0,P=``):(N===void 0&&(N=tt()),N&&typeof P==`string`&&(P=F(``)));p&&p(e),$t=e},rn=D({},[...ve,...ye,...be]),an=D({},[...xe,...Se]),on=function(e,t,n){return t.namespaceURI===q?e===`svg`:t.namespaceURI===Vt?e===`svg`&&(n===`annotation-xml`||qt[n]):!!rn[e]},sn=function(e,t,n){return t.namespaceURI===q?e===`math`:t.namespaceURI===Ht?e===`math`&&Yt[n]:!!an[e]},cn=function(e,t,n){return t.namespaceURI===Ht&&!Yt[n]||t.namespaceURI===Vt&&!qt[n]?!1:!an[e]&&(Xt[e]||!rn[e])},ln=function(e){let t=b(e);(!t||!t.tagName)&&(t={namespaceURI:J,tagName:`template`});let n=oe(e.tagName),r=oe(t.tagName);return Wt[e.namespaceURI]?e.namespaceURI===Ht?on(n,t,r):e.namespaceURI===Vt?sn(n,t,r):e.namespaceURI===q?cn(n,t,r):!!(Zt===`application/xhtml+xml`&&Wt[e.namespaceURI]):!1},X=function(e){ie(t.removed,{element:e});try{b(e).removeChild(e)}catch(t){if(g(e),!b(e))throw w(`a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place`)}},un=function(e,t,n){try{te(e,t)}catch(t){try{e.removeAttribute(n)}catch(e){}}},dn=function(e){pn(e);let t=y(e);if(t){let e=[];_(t,t=>{ie(e,t)}),_(e,e=>{try{g(e)}catch(e){}})}let n=S(e);if(n)for(let t=n.length-1;t>=0;--t){let r=n[t],i=r&&r.name;typeof i==`string`&&un(e,r,i)}},Z=function(e,n,r){if(!r)try{r=n.getAttributeNode(e)}catch(e){r=null}ie(t.removed,{attribute:r||null,from:n});try{r?te(n,r):n.removeAttribute(e)}catch(t){try{n.removeAttribute(e)}catch(e){}}if(e===`is`){if(W||kt)try{X(n)}catch(e){}else try{n.setAttribute(e,``)}catch(e){}}},fn=function(e){let t=S(e);if(t)for(let n=t.length-1;n>=0;--n){let r=t[n],i=r&&r.name;typeof i!=`string`||R[Y(i)]||un(e,r,i)}},pn=function(e){let t=[e];for(;t.length>0;){let e=t.pop();j(e)===A.element&&fn(e);let n=y(e);if(n)for(let e=n.length-1;e>=0;--e)t.push(n[e])}},mn=function(e,t){return H?e===`patchsrc`||e===`for`&&t!==`label`&&t!==`output`:!1},hn=function(e){if(!H)return;let t=[e];for(;t.length>0;){let e=t.pop(),n=j(e);if(n===A.processingInstruction||n===A.comment&&C(ze,e.data)){try{g(e)}catch(e){}continue}if(n===A.element){let t=e,n=Y(Ye(e));try{t.hasAttribute&&t.hasAttribute(`patchsrc`)&&t.removeAttribute(`patchsrc`),t.hasAttribute&&t.hasAttribute(`for`)&&mn(`for`,n)&&t.removeAttribute(`for`)}catch(e){}}let r=y(e);if(r)for(let e=r.length-1;e>=0;--e)t.push(r[e])}},gn=function(e){let t=null,r=null;if(Ot)e=`<remove></remove>`+e;else{let t=ce(e,/^[\r\n\t ]+/);r=t&&t[0]}Zt===`application/xhtml+xml`&&J===q&&(e=`<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>`+e+`</body></html>`);let i=N?F(e):e;if(J===q)try{t=new u().parseFromString(i,Zt)}catch(e){}if(!t||!t.documentElement){t=rt.createDocument(J,`template`,null);try{t.documentElement.innerHTML=Ut?P:i}catch(e){}}let a=t.body||t.documentElement;return e&&r&&a.insertBefore(n.createTextNode(r),a.childNodes[0]||null),J===q?ot.call(t,U?`html`:`body`)[0]:U?t.documentElement:a},_n=function(e){let t=me?me(e):e.ownerDocument;return it.call(t||e,e,l.SHOW_ELEMENT|l.SHOW_COMMENT|l.SHOW_TEXT|l.SHOW_PROCESSING_INSTRUCTION|l.SHOW_CDATA_SECTION,null)},vn=function(e){return e=le(e,ct,` `),e=le(e,lt,` `),e=le(e,ut,` `),e},yn=function(e){var t;e.normalize();let n=me?me(e):e.ownerDocument,r=it.call(n||e,e,l.SHOW_TEXT|l.SHOW_COMMENT|l.SHOW_CDATA_SECTION|l.SHOW_PROCESSING_INSTRUCTION,null),i=r.nextNode();for(;i;)i.data=vn(i.data),i=r.nextNode();let a=(t=e.querySelectorAll)==null?void 0:t.call(e,`template`);a&&_(a,e=>{xn(e.content)&&yn(e.content)})},bn=function(e){let t=E?E(e):null;return typeof t!=`string`||Y(t)!==`form`?!1:typeof e.nodeName!=`string`||typeof e.textContent!=`string`||typeof e.removeChild!=`function`||e.attributes!==S(e)||typeof e.removeAttribute!=`function`||typeof e.removeAttributeNode!=`function`||typeof e.getAttributeNode!=`function`||typeof e.setAttribute!=`function`||typeof e.namespaceURI!=`string`||typeof e.insertBefore!=`function`||typeof e.hasChildNodes!=`function`||e.nodeType!==T(e)||e.childNodes!==y(e)},xn=function(e){if(!T||typeof e!=`object`||!e)return!1;try{return T(e)===A.documentFragment}catch(e){return!1}},Sn=function(e){if(!T||typeof e!=`object`||!e)return!1;try{return typeof T(e)==`number`}catch(e){return!1}};function Q(e,n,r){e.length!==0&&_(e,e=>{e.call(t,n,r,$t)})}let Cn=function(e,t){return!!(H&&e.hasChildNodes()&&!Sn(e.firstElementChild)&&C(Re,e.textContent)&&C(Re,e.innerHTML)||H&&e.namespaceURI===q&&He[t]&&(Sn(e.firstElementChild)||typeof e.textContent==`string`&&C(Ue[t],e.textContent))||e.nodeType===A.processingInstruction||H&&e.nodeType===A.comment&&C(ze,e.data))},wn=function(e,t){return e instanceof RegExp?C(e,t):e instanceof Function&&!!e(t,...[...arguments].slice(2))},Tn=function(e,t,n){if(!yt[t]&&An(t)&&wn(z.tagNameCheck,t))return!1;if(Pt&&!K[t]){let t=b(e),r=y(e);if(r&&t){let i=r.length;for(let a=i-1;a>=0;--a){let i=e===n?ee(r[a],!0):r[a];t.insertBefore(i,fe(e))}}}return X(e),!0},En=function(e,t,n,r){return e.length===0?t:t===n||t===r?O(t):t},$=function(e,t){return e===t||b(e)!==null?!1:(Ft&&pn(e),!0)},Dn=function(e,n){if(Q(I.beforeSanitizeElements,e,null),$(e,n))return!0;if(bn(e))return X(e),!0;let r=Y(Ye(e));if(L=En(I.uponSanitizeElement,L,_t,Et),Q(I.uponSanitizeElement,e,{tagName:r,allowedTags:L}),$(e,n))return!0;if(Cn(e,r))return X(e),!0;if(yt[r]||!(B.tagCheck instanceof Function&&B.tagCheck(r))&&!L[r]){let t=Tn(e,r,n);return t===!1&&(Q(I.afterSanitizeElements,e,null),$(e,n))?!0:t}if(j(e)===A.element&&!ln(e)||(r===`noscript`||r===`noembed`||r===`noframes`)&&C(Be,e.innerHTML))return X(e),!0;if(V&&e.nodeType===A.text){let n=vn(e.textContent);e.textContent!==n&&(ie(t.removed,{element:e.cloneNode()}),e.textContent=n)}return Q(I.afterSanitizeElements,e,null),$(e,n)},On=function(e,t,r){if(bt[t]||mn(t,e)||jt&&(t===`id`||t===`name`)&&(r in n||r in en))return!1;let i=R[t]||B.attributeCheck instanceof Function&&B.attributeCheck(t,e);return St&&C(dt,t)||xt&&C(ft,t)?!0:i?zt[t]||C(gt,le(r,mt,``))||(t===`src`||t===`xlink:href`||t===`href`)&&e!==`script`&&ue(r,`data:`)===0&&Lt[e]||Ct&&!C(pt,le(r,mt,``))?!0:!r:An(e)&&wn(z.tagNameCheck,e)&&wn(z.attributeNameCheck,t,e)||t===`is`&&z.allowCustomizedBuiltInElements&&wn(z.tagNameCheck,r)},kn=D({},[`annotation-xml`,`color-profile`,`font-face`,`font-face-format`,`font-face-name`,`font-face-src`,`font-face-uri`,`missing-glyph`]),An=function(e){return!kn[oe(e)]&&C(ht,e)},jn=function(e,t,n,r){if(N&&typeof d==`object`&&typeof d.getAttributeType==`function`&&!n)switch(d.getAttributeType(e,t)){case`TrustedHTML`:return F(r);case`TrustedScriptURL`:return et(r)}return r},Mn=function(e,t,n,r){try{return n?e.setAttributeNS(n,t,r):e.setAttribute(t,r),!bn(e)||(X(e),!1)}catch(n){return Z(t,e),!1}},Nn=function(e,n){if(Q(I.beforeSanitizeAttributes,e,null),$(e,n))return;let r=e.attributes;if(!r||bn(e))return;R=En(I.uponSanitizeAttribute,R,vt,Dt);let i={attrName:``,attrValue:``,keepAttr:!0,allowedAttributes:R,forceKeepAttr:void 0},a=r.length,o=Y(e.nodeName);for(;a--;){let n=r[a],s=n.name,c=n.namespaceURI,l=n.value,u=Y(s),d=l,f=s===`value`?d:de(d),p=!1;if(i.attrName=u,i.attrValue=f,i.keepAttr=!0,i.forceKeepAttr=void 0,Q(I.uponSanitizeAttribute,e,i),f=i.attrValue,Mt&&(u===`id`||u===`name`)&&ue(f,Nt)!==0&&(Z(s,e,n),f=Nt+f,p=!0),H&&C(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,f)){Z(s,e,n);continue}if(u===`attributename`&&ce(f,`href`)){Z(s,e,n);continue}if(!i.forceKeepAttr){if(!i.keepAttr){Z(s,e,n);continue}if(!wt&&C(Ve,f)){Z(s,e,n);continue}if(V&&(f=vn(f)),!On(o,u,f)){Z(s,e,n);continue}f=jn(o,u,c,f),f!==d&&Mn(e,s,c,f)&&p&&re(t.removed)}}Q(I.afterSanitizeAttributes,e,null),$(e,n)},Pn=function(e){let t=null,n=_n(e);for(Q(I.beforeSanitizeShadowDOM,e,null);t=n.nextNode();)if(Q(I.uponSanitizeShadowNode,t,null),Dn(t,e),Nn(t,e),xn(t.content)&&Pn(t.content),j(t)===A.element){let e=pe(t);xn(e)&&(Fn(e),Pn(e))}Q(I.afterSanitizeShadowDOM,e,null)},Fn=function(e){let t=[{node:e,shadow:null}];for(;t.length>0;){let e=t.pop();if(e.shadow){Pn(e.shadow);continue}let n=e.node,r=j(n)===A.element,i=y(n);if(i)for(let e=i.length-1;e>=0;--e)t.push({node:i[e],shadow:null});if(r){let e=E?E(n):null;if(typeof e==`string`&&Y(e)===`template`){let e=n.content;xn(e)&&t.push({node:e,shadow:null})}}if(r){let e=pe(n);xn(e)&&t.push({node:null,shadow:e},{node:e,shadow:null})}}};return t.sanitize=function(e){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},i=null,a=null,o=null,s=null;if(Ut=!e,Ut&&(e=`<!-->`),typeof e!=`string`&&!Sn(e)&&(e=he(e),typeof e!=`string`))throw w(`dirty is not a string, aborting`);if(!t.isSupported)return e;Tt?(L=Et,R=Dt):nn(n),(I.uponSanitizeElement.length>0||I.uponSanitizeAttribute.length>0)&&(L=O(L)),I.uponSanitizeAttribute.length>0&&(R=O(R)),t.removed=[];let c=Ft&&typeof e!=`string`&&Sn(e);if(c){hn(e);let t=Ye(e);if(typeof t==`string`){let n=Y(t);if(!L[n]||yt[n])throw dn(e),w(`root node is forbidden and cannot be sanitized in-place`)}if(bn(e))throw dn(e),w(`root node is clobbered and cannot be sanitized in-place`);try{Fn(e)}catch(t){throw dn(e),t}}else if(Sn(e))i=gn(`<!---->`),a=i.ownerDocument.importNode(e,!0),a.nodeType===A.element&&a.nodeName===`BODY`||a.nodeName===`HTML`?i=a:i.appendChild(a),Fn(i);else{if(!W&&!V&&!U&&e.indexOf(`<`)===-1)return N&&At?F(e):e;if(i=gn(e),!i)return W?null:At?P:``}i&&Ot&&X(i.firstChild);let l=c?e:i;try{let e=_n(l);for(;o=e.nextNode();)Dn(o,l),Nn(o,l),xn(o.content)&&Pn(o.content)}catch(n){throw c&&(dn(e),_(t.removed,e=>{e.element&&pn(e.element)})),n}if(c){let n=!1;if(_(t.removed,t=>{t.element&&(t.element===e&&(n=!0),pn(t.element))}),n)throw w(`a node selected for removal could not be safely returned; refusing to sanitize in place`);return V&&yn(e),e}if(W){if(V&&yn(i),kt)for(s=at.call(i.ownerDocument);i.firstChild;)s.appendChild(i.firstChild);else s=i;return(R.shadowroot||R.shadowrootmode)&&(s=st.call(r,s,!0)),s}let u=U?i.outerHTML:i.innerHTML;return U&&L[`!doctype`]&&i.ownerDocument&&i.ownerDocument.doctype&&i.ownerDocument.doctype.name&&C(Ie,i.ownerDocument.doctype.name)&&(u=`<!DOCTYPE `+i.ownerDocument.doctype.name+`>
`+u),V&&(u=vn(u)),N&&At?F(u):u},t.setConfig=function(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};nn(e),Tt=!0,Et=L,Dt=R},t.clearConfig=function(){$t=null,Tt=!1,Et=null,Dt=null,N=Xe,P=``},t.isValidAttribute=function(e,t,n){$t||nn({});let r=Y(e),i=Y(t);return On(r,i,n)},t.addHook=function(e,t){typeof t==`function`&&x(I,e)&&ie(I[e],t)},t.removeHook=function(e,t){if(x(I,e)){if(t!==void 0){let n=ne(I[e],t);return n===-1?void 0:ae(I[e],n,1)[0]}return re(I[e])}},t.removeHooks=function(e){x(I,e)&&(I[e]=[])},t.removeAllHooks=function(){I=Ke()},t}return Je()});
//# sourceMappingURL=purify.min.js.map
;
/* vendor/marked.js */
/**
 * marked v15.0.12 - a markdown parser
 * Copyright (c) 2011-2025, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */

/**
 * DO NOT EDIT THIS FILE
 * The code in this file is generated from files in ./src/
 */
(function(g,f){if(typeof exports=="object"&&typeof module<"u"){module.exports=f()}else if("function"==typeof define && define.amd){define("marked",f)}else {g["marked"]=f()}}(typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : this,function(){var exports={};var __exports=exports;var module={exports};
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/marked.ts
var marked_exports = {};
__export(marked_exports, {
  Hooks: () => _Hooks,
  Lexer: () => _Lexer,
  Marked: () => Marked,
  Parser: () => _Parser,
  Renderer: () => _Renderer,
  TextRenderer: () => _TextRenderer,
  Tokenizer: () => _Tokenizer,
  defaults: () => _defaults,
  getDefaults: () => _getDefaults,
  lexer: () => lexer,
  marked: () => marked,
  options: () => options,
  parse: () => parse,
  parseInline: () => parseInline,
  parser: () => parser,
  setOptions: () => setOptions,
  use: () => use,
  walkTokens: () => walkTokens
});
module.exports = __toCommonJS(marked_exports);

// src/defaults.ts
function _getDefaults() {
  return {
    async: false,
    breaks: false,
    extensions: null,
    gfm: true,
    hooks: null,
    pedantic: false,
    renderer: null,
    silent: false,
    tokenizer: null,
    walkTokens: null
  };
}
var _defaults = _getDefaults();
function changeDefaults(newDefaults) {
  _defaults = newDefaults;
}

// src/rules.ts
var noopTest = { exec: () => null };
function edit(regex, opt = "") {
  let source = typeof regex === "string" ? regex : regex.source;
  const obj = {
    replace: (name, val) => {
      let valSource = typeof val === "string" ? val : val.source;
      valSource = valSource.replace(other.caret, "$1");
      source = source.replace(name, valSource);
      return obj;
    },
    getRegex: () => {
      return new RegExp(source, opt);
    }
  };
  return obj;
}
var other = {
  codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
  outputLinkReplace: /\\([\[\]])/g,
  indentCodeCompensation: /^(\s+)(?:```)/,
  beginningSpace: /^\s+/,
  endingHash: /#$/,
  startingSpaceChar: /^ /,
  endingSpaceChar: / $/,
  nonSpaceChar: /[^ ]/,
  newLineCharGlobal: /\n/g,
  tabCharGlobal: /\t/g,
  multipleSpaceGlobal: /\s+/g,
  blankLine: /^[ \t]*$/,
  doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
  blockquoteStart: /^ {0,3}>/,
  blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
  blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
  listReplaceTabs: /^\t+/,
  listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
  listIsTask: /^\[[ xX]\] /,
  listReplaceTask: /^\[[ xX]\] +/,
  anyLine: /\n.*\n/,
  hrefBrackets: /^<(.*)>$/,
  tableDelimiter: /[:|]/,
  tableAlignChars: /^\||\| *$/g,
  tableRowBlankLine: /\n[ \t]*$/,
  tableAlignRight: /^ *-+: *$/,
  tableAlignCenter: /^ *:-+: *$/,
  tableAlignLeft: /^ *:-+ *$/,
  startATag: /^<a /i,
  endATag: /^<\/a>/i,
  startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
  endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
  startAngleBracket: /^</,
  endAngleBracket: />$/,
  pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
  unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
  escapeTest: /[&<>"']/,
  escapeReplace: /[&<>"']/g,
  escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
  escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
  unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,
  caret: /(^|[^\[])\^/g,
  percentDecode: /%25/g,
  findPipe: /\|/g,
  splitPipe: / \|/,
  slashPipe: /\\\|/g,
  carriageReturn: /\r\n|\r/g,
  spaceLine: /^ +$/gm,
  notSpaceStart: /^\S*/,
  endingNewline: /\n$/,
  listItemRegex: (bull) => new RegExp(`^( {0,3}${bull})((?:[	 ][^\\n]*)?(?:\\n|$))`),
  nextBulletRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),
  hrRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),
  fencesBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`),
  headingBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`),
  htmlBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}<(?:[a-z].*>|!--)`, "i")
};
var newline = /^(?:[ \t]*(?:\n|$))+/;
var blockCode = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var fences = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var hr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var heading = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var bullet = /(?:[*+-]|\d{1,9}[.)])/;
var lheadingCore = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
var lheading = edit(lheadingCore).replace(/bull/g, bullet).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var lheadingGfm = edit(lheadingCore).replace(/bull/g, bullet).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var _paragraph = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
var blockText = /^[^\n]+/;
var _blockLabel = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
var def = edit(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", _blockLabel).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var list = edit(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, bullet).getRegex();
var _tag = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var _comment = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var html = edit(
  "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))",
  "i"
).replace("comment", _comment).replace("tag", _tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var paragraph = edit(_paragraph).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex();
var blockquote = edit(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", paragraph).getRegex();
var blockNormal = {
  blockquote,
  code: blockCode,
  def,
  fences,
  heading,
  hr,
  html,
  lheading,
  list,
  newline,
  paragraph,
  table: noopTest,
  text: blockText
};
var gfmTable = edit(
  "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex();
var blockGfm = {
  ...blockNormal,
  lheading: lheadingGfm,
  table: gfmTable,
  paragraph: edit(_paragraph).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", gfmTable).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex()
};
var blockPedantic = {
  ...blockNormal,
  html: edit(
    `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`
  ).replace("comment", _comment).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: noopTest,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: edit(_paragraph).replace("hr", hr).replace("heading", " *#{1,6} *[^\n]").replace("lheading", lheading).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
};
var escape = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var inlineCode = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var br = /^( {2,}|\\)\n(?!\s*$)/;
var inlineText = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var _punctuation = /[\p{P}\p{S}]/u;
var _punctuationOrSpace = /[\s\p{P}\p{S}]/u;
var _notPunctuationOrSpace = /[^\s\p{P}\p{S}]/u;
var punctuation = edit(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, _punctuationOrSpace).getRegex();
var _punctuationGfmStrongEm = /(?!~)[\p{P}\p{S}]/u;
var _punctuationOrSpaceGfmStrongEm = /(?!~)[\s\p{P}\p{S}]/u;
var _notPunctuationOrSpaceGfmStrongEm = /(?:[^\s\p{P}\p{S}]|~)/u;
var blockSkip = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g;
var emStrongLDelimCore = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/;
var emStrongLDelim = edit(emStrongLDelimCore, "u").replace(/punct/g, _punctuation).getRegex();
var emStrongLDelimGfm = edit(emStrongLDelimCore, "u").replace(/punct/g, _punctuationGfmStrongEm).getRegex();
var emStrongRDelimAstCore = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var emStrongRDelimAst = edit(emStrongRDelimAstCore, "gu").replace(/notPunctSpace/g, _notPunctuationOrSpace).replace(/punctSpace/g, _punctuationOrSpace).replace(/punct/g, _punctuation).getRegex();
var emStrongRDelimAstGfm = edit(emStrongRDelimAstCore, "gu").replace(/notPunctSpace/g, _notPunctuationOrSpaceGfmStrongEm).replace(/punctSpace/g, _punctuationOrSpaceGfmStrongEm).replace(/punct/g, _punctuationGfmStrongEm).getRegex();
var emStrongRDelimUnd = edit(
  "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)",
  "gu"
).replace(/notPunctSpace/g, _notPunctuationOrSpace).replace(/punctSpace/g, _punctuationOrSpace).replace(/punct/g, _punctuation).getRegex();
var anyPunctuation = edit(/\\(punct)/, "gu").replace(/punct/g, _punctuation).getRegex();
var autolink = edit(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var _inlineComment = edit(_comment).replace("(?:-->|$)", "-->").getRegex();
var tag = edit(
  "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>"
).replace("comment", _inlineComment).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var _inlineLabel = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
var link = edit(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", _inlineLabel).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var reflink = edit(/^!?\[(label)\]\[(ref)\]/).replace("label", _inlineLabel).replace("ref", _blockLabel).getRegex();
var nolink = edit(/^!?\[(ref)\](?:\[\])?/).replace("ref", _blockLabel).getRegex();
var reflinkSearch = edit("reflink|nolink(?!\\()", "g").replace("reflink", reflink).replace("nolink", nolink).getRegex();
var inlineNormal = {
  _backpedal: noopTest,
  // only used for GFM url
  anyPunctuation,
  autolink,
  blockSkip,
  br,
  code: inlineCode,
  del: noopTest,
  emStrongLDelim,
  emStrongRDelimAst,
  emStrongRDelimUnd,
  escape,
  link,
  nolink,
  punctuation,
  reflink,
  reflinkSearch,
  tag,
  text: inlineText,
  url: noopTest
};
var inlinePedantic = {
  ...inlineNormal,
  link: edit(/^!?\[(label)\]\((.*?)\)/).replace("label", _inlineLabel).getRegex(),
  reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", _inlineLabel).getRegex()
};
var inlineGfm = {
  ...inlineNormal,
  emStrongRDelimAst: emStrongRDelimAstGfm,
  emStrongLDelim: emStrongLDelimGfm,
  url: edit(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
};
var inlineBreaks = {
  ...inlineGfm,
  br: edit(br).replace("{2,}", "*").getRegex(),
  text: edit(inlineGfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
};
var block = {
  normal: blockNormal,
  gfm: blockGfm,
  pedantic: blockPedantic
};
var inline = {
  normal: inlineNormal,
  gfm: inlineGfm,
  breaks: inlineBreaks,
  pedantic: inlinePedantic
};

// src/helpers.ts
var escapeReplacements = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var getEscapeReplacement = (ch) => escapeReplacements[ch];
function escape2(html2, encode) {
  if (encode) {
    if (other.escapeTest.test(html2)) {
      return html2.replace(other.escapeReplace, getEscapeReplacement);
    }
  } else {
    if (other.escapeTestNoEncode.test(html2)) {
      return html2.replace(other.escapeReplaceNoEncode, getEscapeReplacement);
    }
  }
  return html2;
}
function cleanUrl(href) {
  try {
    href = encodeURI(href).replace(other.percentDecode, "%");
  } catch {
    return null;
  }
  return href;
}
function splitCells(tableRow, count) {
  const row = tableRow.replace(other.findPipe, (match, offset, str) => {
    let escaped = false;
    let curr = offset;
    while (--curr >= 0 && str[curr] === "\\") escaped = !escaped;
    if (escaped) {
      return "|";
    } else {
      return " |";
    }
  }), cells = row.split(other.splitPipe);
  let i = 0;
  if (!cells[0].trim()) {
    cells.shift();
  }
  if (cells.length > 0 && !cells.at(-1)?.trim()) {
    cells.pop();
  }
  if (count) {
    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count) cells.push("");
    }
  }
  for (; i < cells.length; i++) {
    cells[i] = cells[i].trim().replace(other.slashPipe, "|");
  }
  return cells;
}
function rtrim(str, c, invert) {
  const l = str.length;
  if (l === 0) {
    return "";
  }
  let suffLen = 0;
  while (suffLen < l) {
    const currChar = str.charAt(l - suffLen - 1);
    if (currChar === c && !invert) {
      suffLen++;
    } else if (currChar !== c && invert) {
      suffLen++;
    } else {
      break;
    }
  }
  return str.slice(0, l - suffLen);
}
function findClosingBracket(str, b) {
  if (str.indexOf(b[1]) === -1) {
    return -1;
  }
  let level = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "\\") {
      i++;
    } else if (str[i] === b[0]) {
      level++;
    } else if (str[i] === b[1]) {
      level--;
      if (level < 0) {
        return i;
      }
    }
  }
  if (level > 0) {
    return -2;
  }
  return -1;
}

// src/Tokenizer.ts
function outputLink(cap, link2, raw, lexer2, rules) {
  const href = link2.href;
  const title = link2.title || null;
  const text = cap[1].replace(rules.other.outputLinkReplace, "$1");
  lexer2.state.inLink = true;
  const token = {
    type: cap[0].charAt(0) === "!" ? "image" : "link",
    raw,
    href,
    title,
    text,
    tokens: lexer2.inlineTokens(text)
  };
  lexer2.state.inLink = false;
  return token;
}
function indentCodeCompensation(raw, text, rules) {
  const matchIndentToCode = raw.match(rules.other.indentCodeCompensation);
  if (matchIndentToCode === null) {
    return text;
  }
  const indentToCode = matchIndentToCode[1];
  return text.split("\n").map((node) => {
    const matchIndentInNode = node.match(rules.other.beginningSpace);
    if (matchIndentInNode === null) {
      return node;
    }
    const [indentInNode] = matchIndentInNode;
    if (indentInNode.length >= indentToCode.length) {
      return node.slice(indentToCode.length);
    }
    return node;
  }).join("\n");
}
var _Tokenizer = class {
  options;
  rules;
  // set by the lexer
  lexer;
  // set by the lexer
  constructor(options2) {
    this.options = options2 || _defaults;
  }
  space(src) {
    const cap = this.rules.block.newline.exec(src);
    if (cap && cap[0].length > 0) {
      return {
        type: "space",
        raw: cap[0]
      };
    }
  }
  code(src) {
    const cap = this.rules.block.code.exec(src);
    if (cap) {
      const text = cap[0].replace(this.rules.other.codeRemoveIndent, "");
      return {
        type: "code",
        raw: cap[0],
        codeBlockStyle: "indented",
        text: !this.options.pedantic ? rtrim(text, "\n") : text
      };
    }
  }
  fences(src) {
    const cap = this.rules.block.fences.exec(src);
    if (cap) {
      const raw = cap[0];
      const text = indentCodeCompensation(raw, cap[3] || "", this.rules);
      return {
        type: "code",
        raw,
        lang: cap[2] ? cap[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : cap[2],
        text
      };
    }
  }
  heading(src) {
    const cap = this.rules.block.heading.exec(src);
    if (cap) {
      let text = cap[2].trim();
      if (this.rules.other.endingHash.test(text)) {
        const trimmed = rtrim(text, "#");
        if (this.options.pedantic) {
          text = trimmed.trim();
        } else if (!trimmed || this.rules.other.endingSpaceChar.test(trimmed)) {
          text = trimmed.trim();
        }
      }
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[1].length,
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  hr(src) {
    const cap = this.rules.block.hr.exec(src);
    if (cap) {
      return {
        type: "hr",
        raw: rtrim(cap[0], "\n")
      };
    }
  }
  blockquote(src) {
    const cap = this.rules.block.blockquote.exec(src);
    if (cap) {
      let lines = rtrim(cap[0], "\n").split("\n");
      let raw = "";
      let text = "";
      const tokens = [];
      while (lines.length > 0) {
        let inBlockquote = false;
        const currentLines = [];
        let i;
        for (i = 0; i < lines.length; i++) {
          if (this.rules.other.blockquoteStart.test(lines[i])) {
            currentLines.push(lines[i]);
            inBlockquote = true;
          } else if (!inBlockquote) {
            currentLines.push(lines[i]);
          } else {
            break;
          }
        }
        lines = lines.slice(i);
        const currentRaw = currentLines.join("\n");
        const currentText = currentRaw.replace(this.rules.other.blockquoteSetextReplace, "\n    $1").replace(this.rules.other.blockquoteSetextReplace2, "");
        raw = raw ? `${raw}
${currentRaw}` : currentRaw;
        text = text ? `${text}
${currentText}` : currentText;
        const top = this.lexer.state.top;
        this.lexer.state.top = true;
        this.lexer.blockTokens(currentText, tokens, true);
        this.lexer.state.top = top;
        if (lines.length === 0) {
          break;
        }
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "code") {
          break;
        } else if (lastToken?.type === "blockquote") {
          const oldToken = lastToken;
          const newText = oldToken.raw + "\n" + lines.join("\n");
          const newToken = this.blockquote(newText);
          tokens[tokens.length - 1] = newToken;
          raw = raw.substring(0, raw.length - oldToken.raw.length) + newToken.raw;
          text = text.substring(0, text.length - oldToken.text.length) + newToken.text;
          break;
        } else if (lastToken?.type === "list") {
          const oldToken = lastToken;
          const newText = oldToken.raw + "\n" + lines.join("\n");
          const newToken = this.list(newText);
          tokens[tokens.length - 1] = newToken;
          raw = raw.substring(0, raw.length - lastToken.raw.length) + newToken.raw;
          text = text.substring(0, text.length - oldToken.raw.length) + newToken.raw;
          lines = newText.substring(tokens.at(-1).raw.length).split("\n");
          continue;
        }
      }
      return {
        type: "blockquote",
        raw,
        tokens,
        text
      };
    }
  }
  list(src) {
    let cap = this.rules.block.list.exec(src);
    if (cap) {
      let bull = cap[1].trim();
      const isordered = bull.length > 1;
      const list2 = {
        type: "list",
        raw: "",
        ordered: isordered,
        start: isordered ? +bull.slice(0, -1) : "",
        loose: false,
        items: []
      };
      bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
      if (this.options.pedantic) {
        bull = isordered ? bull : "[*+-]";
      }
      const itemRegex = this.rules.other.listItemRegex(bull);
      let endsWithBlankLine = false;
      while (src) {
        let endEarly = false;
        let raw = "";
        let itemContents = "";
        if (!(cap = itemRegex.exec(src))) {
          break;
        }
        if (this.rules.block.hr.test(src)) {
          break;
        }
        raw = cap[0];
        src = src.substring(raw.length);
        let line = cap[2].split("\n", 1)[0].replace(this.rules.other.listReplaceTabs, (t) => " ".repeat(3 * t.length));
        let nextLine = src.split("\n", 1)[0];
        let blankLine = !line.trim();
        let indent = 0;
        if (this.options.pedantic) {
          indent = 2;
          itemContents = line.trimStart();
        } else if (blankLine) {
          indent = cap[1].length + 1;
        } else {
          indent = cap[2].search(this.rules.other.nonSpaceChar);
          indent = indent > 4 ? 1 : indent;
          itemContents = line.slice(indent);
          indent += cap[1].length;
        }
        if (blankLine && this.rules.other.blankLine.test(nextLine)) {
          raw += nextLine + "\n";
          src = src.substring(nextLine.length + 1);
          endEarly = true;
        }
        if (!endEarly) {
          const nextBulletRegex = this.rules.other.nextBulletRegex(indent);
          const hrRegex = this.rules.other.hrRegex(indent);
          const fencesBeginRegex = this.rules.other.fencesBeginRegex(indent);
          const headingBeginRegex = this.rules.other.headingBeginRegex(indent);
          const htmlBeginRegex = this.rules.other.htmlBeginRegex(indent);
          while (src) {
            const rawLine = src.split("\n", 1)[0];
            let nextLineWithoutTabs;
            nextLine = rawLine;
            if (this.options.pedantic) {
              nextLine = nextLine.replace(this.rules.other.listReplaceNesting, "  ");
              nextLineWithoutTabs = nextLine;
            } else {
              nextLineWithoutTabs = nextLine.replace(this.rules.other.tabCharGlobal, "    ");
            }
            if (fencesBeginRegex.test(nextLine)) {
              break;
            }
            if (headingBeginRegex.test(nextLine)) {
              break;
            }
            if (htmlBeginRegex.test(nextLine)) {
              break;
            }
            if (nextBulletRegex.test(nextLine)) {
              break;
            }
            if (hrRegex.test(nextLine)) {
              break;
            }
            if (nextLineWithoutTabs.search(this.rules.other.nonSpaceChar) >= indent || !nextLine.trim()) {
              itemContents += "\n" + nextLineWithoutTabs.slice(indent);
            } else {
              if (blankLine) {
                break;
              }
              if (line.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4) {
                break;
              }
              if (fencesBeginRegex.test(line)) {
                break;
              }
              if (headingBeginRegex.test(line)) {
                break;
              }
              if (hrRegex.test(line)) {
                break;
              }
              itemContents += "\n" + nextLine;
            }
            if (!blankLine && !nextLine.trim()) {
              blankLine = true;
            }
            raw += rawLine + "\n";
            src = src.substring(rawLine.length + 1);
            line = nextLineWithoutTabs.slice(indent);
          }
        }
        if (!list2.loose) {
          if (endsWithBlankLine) {
            list2.loose = true;
          } else if (this.rules.other.doubleBlankLine.test(raw)) {
            endsWithBlankLine = true;
          }
        }
        let istask = null;
        let ischecked;
        if (this.options.gfm) {
          istask = this.rules.other.listIsTask.exec(itemContents);
          if (istask) {
            ischecked = istask[0] !== "[ ] ";
            itemContents = itemContents.replace(this.rules.other.listReplaceTask, "");
          }
        }
        list2.items.push({
          type: "list_item",
          raw,
          task: !!istask,
          checked: ischecked,
          loose: false,
          text: itemContents,
          tokens: []
        });
        list2.raw += raw;
      }
      const lastItem = list2.items.at(-1);
      if (lastItem) {
        lastItem.raw = lastItem.raw.trimEnd();
        lastItem.text = lastItem.text.trimEnd();
      } else {
        return;
      }
      list2.raw = list2.raw.trimEnd();
      for (let i = 0; i < list2.items.length; i++) {
        this.lexer.state.top = false;
        list2.items[i].tokens = this.lexer.blockTokens(list2.items[i].text, []);
        if (!list2.loose) {
          const spacers = list2.items[i].tokens.filter((t) => t.type === "space");
          const hasMultipleLineBreaks = spacers.length > 0 && spacers.some((t) => this.rules.other.anyLine.test(t.raw));
          list2.loose = hasMultipleLineBreaks;
        }
      }
      if (list2.loose) {
        for (let i = 0; i < list2.items.length; i++) {
          list2.items[i].loose = true;
        }
      }
      return list2;
    }
  }
  html(src) {
    const cap = this.rules.block.html.exec(src);
    if (cap) {
      const token = {
        type: "html",
        block: true,
        raw: cap[0],
        pre: cap[1] === "pre" || cap[1] === "script" || cap[1] === "style",
        text: cap[0]
      };
      return token;
    }
  }
  def(src) {
    const cap = this.rules.block.def.exec(src);
    if (cap) {
      const tag2 = cap[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " ");
      const href = cap[2] ? cap[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "";
      const title = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : cap[3];
      return {
        type: "def",
        tag: tag2,
        raw: cap[0],
        href,
        title
      };
    }
  }
  table(src) {
    const cap = this.rules.block.table.exec(src);
    if (!cap) {
      return;
    }
    if (!this.rules.other.tableDelimiter.test(cap[2])) {
      return;
    }
    const headers = splitCells(cap[1]);
    const aligns = cap[2].replace(this.rules.other.tableAlignChars, "").split("|");
    const rows = cap[3]?.trim() ? cap[3].replace(this.rules.other.tableRowBlankLine, "").split("\n") : [];
    const item = {
      type: "table",
      raw: cap[0],
      header: [],
      align: [],
      rows: []
    };
    if (headers.length !== aligns.length) {
      return;
    }
    for (const align of aligns) {
      if (this.rules.other.tableAlignRight.test(align)) {
        item.align.push("right");
      } else if (this.rules.other.tableAlignCenter.test(align)) {
        item.align.push("center");
      } else if (this.rules.other.tableAlignLeft.test(align)) {
        item.align.push("left");
      } else {
        item.align.push(null);
      }
    }
    for (let i = 0; i < headers.length; i++) {
      item.header.push({
        text: headers[i],
        tokens: this.lexer.inline(headers[i]),
        header: true,
        align: item.align[i]
      });
    }
    for (const row of rows) {
      item.rows.push(splitCells(row, item.header.length).map((cell, i) => {
        return {
          text: cell,
          tokens: this.lexer.inline(cell),
          header: false,
          align: item.align[i]
        };
      }));
    }
    return item;
  }
  lheading(src) {
    const cap = this.rules.block.lheading.exec(src);
    if (cap) {
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[2].charAt(0) === "=" ? 1 : 2,
        text: cap[1],
        tokens: this.lexer.inline(cap[1])
      };
    }
  }
  paragraph(src) {
    const cap = this.rules.block.paragraph.exec(src);
    if (cap) {
      const text = cap[1].charAt(cap[1].length - 1) === "\n" ? cap[1].slice(0, -1) : cap[1];
      return {
        type: "paragraph",
        raw: cap[0],
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  text(src) {
    const cap = this.rules.block.text.exec(src);
    if (cap) {
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        tokens: this.lexer.inline(cap[0])
      };
    }
  }
  escape(src) {
    const cap = this.rules.inline.escape.exec(src);
    if (cap) {
      return {
        type: "escape",
        raw: cap[0],
        text: cap[1]
      };
    }
  }
  tag(src) {
    const cap = this.rules.inline.tag.exec(src);
    if (cap) {
      if (!this.lexer.state.inLink && this.rules.other.startATag.test(cap[0])) {
        this.lexer.state.inLink = true;
      } else if (this.lexer.state.inLink && this.rules.other.endATag.test(cap[0])) {
        this.lexer.state.inLink = false;
      }
      if (!this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(cap[0])) {
        this.lexer.state.inRawBlock = true;
      } else if (this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(cap[0])) {
        this.lexer.state.inRawBlock = false;
      }
      return {
        type: "html",
        raw: cap[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        block: false,
        text: cap[0]
      };
    }
  }
  link(src) {
    const cap = this.rules.inline.link.exec(src);
    if (cap) {
      const trimmedUrl = cap[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(trimmedUrl)) {
        if (!this.rules.other.endAngleBracket.test(trimmedUrl)) {
          return;
        }
        const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), "\\");
        if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
          return;
        }
      } else {
        const lastParenIndex = findClosingBracket(cap[2], "()");
        if (lastParenIndex === -2) {
          return;
        }
        if (lastParenIndex > -1) {
          const start = cap[0].indexOf("!") === 0 ? 5 : 4;
          const linkLen = start + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = "";
        }
      }
      let href = cap[2];
      let title = "";
      if (this.options.pedantic) {
        const link2 = this.rules.other.pedanticHrefTitle.exec(href);
        if (link2) {
          href = link2[1];
          title = link2[3];
        }
      } else {
        title = cap[3] ? cap[3].slice(1, -1) : "";
      }
      href = href.trim();
      if (this.rules.other.startAngleBracket.test(href)) {
        if (this.options.pedantic && !this.rules.other.endAngleBracket.test(trimmedUrl)) {
          href = href.slice(1);
        } else {
          href = href.slice(1, -1);
        }
      }
      return outputLink(cap, {
        href: href ? href.replace(this.rules.inline.anyPunctuation, "$1") : href,
        title: title ? title.replace(this.rules.inline.anyPunctuation, "$1") : title
      }, cap[0], this.lexer, this.rules);
    }
  }
  reflink(src, links) {
    let cap;
    if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
      const linkString = (cap[2] || cap[1]).replace(this.rules.other.multipleSpaceGlobal, " ");
      const link2 = links[linkString.toLowerCase()];
      if (!link2) {
        const text = cap[0].charAt(0);
        return {
          type: "text",
          raw: text,
          text
        };
      }
      return outputLink(cap, link2, cap[0], this.lexer, this.rules);
    }
  }
  emStrong(src, maskedSrc, prevChar = "") {
    let match = this.rules.inline.emStrongLDelim.exec(src);
    if (!match) return;
    if (match[3] && prevChar.match(this.rules.other.unicodeAlphaNumeric)) return;
    const nextChar = match[1] || match[2] || "";
    if (!nextChar || !prevChar || this.rules.inline.punctuation.exec(prevChar)) {
      const lLength = [...match[0]].length - 1;
      let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
      const endReg = match[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      endReg.lastIndex = 0;
      maskedSrc = maskedSrc.slice(-1 * src.length + lLength);
      while ((match = endReg.exec(maskedSrc)) != null) {
        rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
        if (!rDelim) continue;
        rLength = [...rDelim].length;
        if (match[3] || match[4]) {
          delimTotal += rLength;
          continue;
        } else if (match[5] || match[6]) {
          if (lLength % 3 && !((lLength + rLength) % 3)) {
            midDelimTotal += rLength;
            continue;
          }
        }
        delimTotal -= rLength;
        if (delimTotal > 0) continue;
        rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
        const lastCharLength = [...match[0]][0].length;
        const raw = src.slice(0, lLength + match.index + lastCharLength + rLength);
        if (Math.min(lLength, rLength) % 2) {
          const text2 = raw.slice(1, -1);
          return {
            type: "em",
            raw,
            text: text2,
            tokens: this.lexer.inlineTokens(text2)
          };
        }
        const text = raw.slice(2, -2);
        return {
          type: "strong",
          raw,
          text,
          tokens: this.lexer.inlineTokens(text)
        };
      }
    }
  }
  codespan(src) {
    const cap = this.rules.inline.code.exec(src);
    if (cap) {
      let text = cap[2].replace(this.rules.other.newLineCharGlobal, " ");
      const hasNonSpaceChars = this.rules.other.nonSpaceChar.test(text);
      const hasSpaceCharsOnBothEnds = this.rules.other.startingSpaceChar.test(text) && this.rules.other.endingSpaceChar.test(text);
      if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
        text = text.substring(1, text.length - 1);
      }
      return {
        type: "codespan",
        raw: cap[0],
        text
      };
    }
  }
  br(src) {
    const cap = this.rules.inline.br.exec(src);
    if (cap) {
      return {
        type: "br",
        raw: cap[0]
      };
    }
  }
  del(src) {
    const cap = this.rules.inline.del.exec(src);
    if (cap) {
      return {
        type: "del",
        raw: cap[0],
        text: cap[2],
        tokens: this.lexer.inlineTokens(cap[2])
      };
    }
  }
  autolink(src) {
    const cap = this.rules.inline.autolink.exec(src);
    if (cap) {
      let text, href;
      if (cap[2] === "@") {
        text = cap[1];
        href = "mailto:" + text;
      } else {
        text = cap[1];
        href = text;
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  url(src) {
    let cap;
    if (cap = this.rules.inline.url.exec(src)) {
      let text, href;
      if (cap[2] === "@") {
        text = cap[0];
        href = "mailto:" + text;
      } else {
        let prevCapZero;
        do {
          prevCapZero = cap[0];
          cap[0] = this.rules.inline._backpedal.exec(cap[0])?.[0] ?? "";
        } while (prevCapZero !== cap[0]);
        text = cap[0];
        if (cap[1] === "www.") {
          href = "http://" + cap[0];
        } else {
          href = cap[0];
        }
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  inlineText(src) {
    const cap = this.rules.inline.text.exec(src);
    if (cap) {
      const escaped = this.lexer.state.inRawBlock;
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        escaped
      };
    }
  }
};

// src/Lexer.ts
var _Lexer = class __Lexer {
  tokens;
  options;
  state;
  tokenizer;
  inlineQueue;
  constructor(options2) {
    this.tokens = [];
    this.tokens.links = /* @__PURE__ */ Object.create(null);
    this.options = options2 || _defaults;
    this.options.tokenizer = this.options.tokenizer || new _Tokenizer();
    this.tokenizer = this.options.tokenizer;
    this.tokenizer.options = this.options;
    this.tokenizer.lexer = this;
    this.inlineQueue = [];
    this.state = {
      inLink: false,
      inRawBlock: false,
      top: true
    };
    const rules = {
      other,
      block: block.normal,
      inline: inline.normal
    };
    if (this.options.pedantic) {
      rules.block = block.pedantic;
      rules.inline = inline.pedantic;
    } else if (this.options.gfm) {
      rules.block = block.gfm;
      if (this.options.breaks) {
        rules.inline = inline.breaks;
      } else {
        rules.inline = inline.gfm;
      }
    }
    this.tokenizer.rules = rules;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block,
      inline
    };
  }
  /**
   * Static Lex Method
   */
  static lex(src, options2) {
    const lexer2 = new __Lexer(options2);
    return lexer2.lex(src);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(src, options2) {
    const lexer2 = new __Lexer(options2);
    return lexer2.inlineTokens(src);
  }
  /**
   * Preprocessing
   */
  lex(src) {
    src = src.replace(other.carriageReturn, "\n");
    this.blockTokens(src, this.tokens);
    for (let i = 0; i < this.inlineQueue.length; i++) {
      const next = this.inlineQueue[i];
      this.inlineTokens(next.src, next.tokens);
    }
    this.inlineQueue = [];
    return this.tokens;
  }
  blockTokens(src, tokens = [], lastParagraphClipped = false) {
    if (this.options.pedantic) {
      src = src.replace(other.tabCharGlobal, "    ").replace(other.spaceLine, "");
    }
    while (src) {
      let token;
      if (this.options.extensions?.block?.some((extTokenizer) => {
        if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.space(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (token.raw.length === 1 && lastToken !== void 0) {
          lastToken.raw += "\n";
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.code(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "paragraph" || lastToken?.type === "text") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.fences(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.heading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.hr(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.blockquote(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.list(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.html(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.def(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "paragraph" || lastToken?.type === "text") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.raw;
          this.inlineQueue.at(-1).src = lastToken.text;
        } else if (!this.tokens.links[token.tag]) {
          this.tokens.links[token.tag] = {
            href: token.href,
            title: token.title
          };
        }
        continue;
      }
      if (token = this.tokenizer.table(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.lheading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      let cutSrc = src;
      if (this.options.extensions?.startBlock) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startBlock.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
        const lastToken = tokens.at(-1);
        if (lastParagraphClipped && lastToken?.type === "paragraph") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.pop();
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens.push(token);
        }
        lastParagraphClipped = cutSrc.length !== src.length;
        src = src.substring(token.raw.length);
        continue;
      }
      if (token = this.tokenizer.text(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "text") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.pop();
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    this.state.top = true;
    return tokens;
  }
  inline(src, tokens = []) {
    this.inlineQueue.push({ src, tokens });
    return tokens;
  }
  /**
   * Lexing/Compiling
   */
  inlineTokens(src, tokens = []) {
    let maskedSrc = src;
    let match = null;
    if (this.tokens.links) {
      const links = Object.keys(this.tokens.links);
      if (links.length > 0) {
        while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
          if (links.includes(match[0].slice(match[0].lastIndexOf("[") + 1, -1))) {
            maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
          }
        }
      }
    }
    while ((match = this.tokenizer.rules.inline.anyPunctuation.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "++" + maskedSrc.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    }
    while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    }
    let keepPrevChar = false;
    let prevChar = "";
    while (src) {
      if (!keepPrevChar) {
        prevChar = "";
      }
      keepPrevChar = false;
      let token;
      if (this.options.extensions?.inline?.some((extTokenizer) => {
        if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.escape(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.tag(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.link(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.reflink(src, this.tokens.links)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (token.type === "text" && lastToken?.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.codespan(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.br(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.del(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.autolink(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (!this.state.inLink && (token = this.tokenizer.url(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      let cutSrc = src;
      if (this.options.extensions?.startInline) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startInline.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (token = this.tokenizer.inlineText(cutSrc)) {
        src = src.substring(token.raw.length);
        if (token.raw.slice(-1) !== "_") {
          prevChar = token.raw.slice(-1);
        }
        keepPrevChar = true;
        const lastToken = tokens.at(-1);
        if (lastToken?.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    return tokens;
  }
};

// src/Renderer.ts
var _Renderer = class {
  options;
  parser;
  // set by the parser
  constructor(options2) {
    this.options = options2 || _defaults;
  }
  space(token) {
    return "";
  }
  code({ text, lang, escaped }) {
    const langString = (lang || "").match(other.notSpaceStart)?.[0];
    const code = text.replace(other.endingNewline, "") + "\n";
    if (!langString) {
      return "<pre><code>" + (escaped ? code : escape2(code, true)) + "</code></pre>\n";
    }
    return '<pre><code class="language-' + escape2(langString) + '">' + (escaped ? code : escape2(code, true)) + "</code></pre>\n";
  }
  blockquote({ tokens }) {
    const body = this.parser.parse(tokens);
    return `<blockquote>
${body}</blockquote>
`;
  }
  html({ text }) {
    return text;
  }
  heading({ tokens, depth }) {
    return `<h${depth}>${this.parser.parseInline(tokens)}</h${depth}>
`;
  }
  hr(token) {
    return "<hr>\n";
  }
  list(token) {
    const ordered = token.ordered;
    const start = token.start;
    let body = "";
    for (let j = 0; j < token.items.length; j++) {
      const item = token.items[j];
      body += this.listitem(item);
    }
    const type = ordered ? "ol" : "ul";
    const startAttr = ordered && start !== 1 ? ' start="' + start + '"' : "";
    return "<" + type + startAttr + ">\n" + body + "</" + type + ">\n";
  }
  listitem(item) {
    let itemBody = "";
    if (item.task) {
      const checkbox = this.checkbox({ checked: !!item.checked });
      if (item.loose) {
        if (item.tokens[0]?.type === "paragraph") {
          item.tokens[0].text = checkbox + " " + item.tokens[0].text;
          if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === "text") {
            item.tokens[0].tokens[0].text = checkbox + " " + escape2(item.tokens[0].tokens[0].text);
            item.tokens[0].tokens[0].escaped = true;
          }
        } else {
          item.tokens.unshift({
            type: "text",
            raw: checkbox + " ",
            text: checkbox + " ",
            escaped: true
          });
        }
      } else {
        itemBody += checkbox + " ";
      }
    }
    itemBody += this.parser.parse(item.tokens, !!item.loose);
    return `<li>${itemBody}</li>
`;
  }
  checkbox({ checked }) {
    return "<input " + (checked ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph({ tokens }) {
    return `<p>${this.parser.parseInline(tokens)}</p>
`;
  }
  table(token) {
    let header = "";
    let cell = "";
    for (let j = 0; j < token.header.length; j++) {
      cell += this.tablecell(token.header[j]);
    }
    header += this.tablerow({ text: cell });
    let body = "";
    for (let j = 0; j < token.rows.length; j++) {
      const row = token.rows[j];
      cell = "";
      for (let k = 0; k < row.length; k++) {
        cell += this.tablecell(row[k]);
      }
      body += this.tablerow({ text: cell });
    }
    if (body) body = `<tbody>${body}</tbody>`;
    return "<table>\n<thead>\n" + header + "</thead>\n" + body + "</table>\n";
  }
  tablerow({ text }) {
    return `<tr>
${text}</tr>
`;
  }
  tablecell(token) {
    const content = this.parser.parseInline(token.tokens);
    const type = token.header ? "th" : "td";
    const tag2 = token.align ? `<${type} align="${token.align}">` : `<${type}>`;
    return tag2 + content + `</${type}>
`;
  }
  /**
   * span level renderer
   */
  strong({ tokens }) {
    return `<strong>${this.parser.parseInline(tokens)}</strong>`;
  }
  em({ tokens }) {
    return `<em>${this.parser.parseInline(tokens)}</em>`;
  }
  codespan({ text }) {
    return `<code>${escape2(text, true)}</code>`;
  }
  br(token) {
    return "<br>";
  }
  del({ tokens }) {
    return `<del>${this.parser.parseInline(tokens)}</del>`;
  }
  link({ href, title, tokens }) {
    const text = this.parser.parseInline(tokens);
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return text;
    }
    href = cleanHref;
    let out = '<a href="' + href + '"';
    if (title) {
      out += ' title="' + escape2(title) + '"';
    }
    out += ">" + text + "</a>";
    return out;
  }
  image({ href, title, text, tokens }) {
    if (tokens) {
      text = this.parser.parseInline(tokens, this.parser.textRenderer);
    }
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return escape2(text);
    }
    href = cleanHref;
    let out = `<img src="${href}" alt="${text}"`;
    if (title) {
      out += ` title="${escape2(title)}"`;
    }
    out += ">";
    return out;
  }
  text(token) {
    return "tokens" in token && token.tokens ? this.parser.parseInline(token.tokens) : "escaped" in token && token.escaped ? token.text : escape2(token.text);
  }
};

// src/TextRenderer.ts
var _TextRenderer = class {
  // no need for block level renderers
  strong({ text }) {
    return text;
  }
  em({ text }) {
    return text;
  }
  codespan({ text }) {
    return text;
  }
  del({ text }) {
    return text;
  }
  html({ text }) {
    return text;
  }
  text({ text }) {
    return text;
  }
  link({ text }) {
    return "" + text;
  }
  image({ text }) {
    return "" + text;
  }
  br() {
    return "";
  }
};

// src/Parser.ts
var _Parser = class __Parser {
  options;
  renderer;
  textRenderer;
  constructor(options2) {
    this.options = options2 || _defaults;
    this.options.renderer = this.options.renderer || new _Renderer();
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.renderer.parser = this;
    this.textRenderer = new _TextRenderer();
  }
  /**
   * Static Parse Method
   */
  static parse(tokens, options2) {
    const parser2 = new __Parser(options2);
    return parser2.parse(tokens);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(tokens, options2) {
    const parser2 = new __Parser(options2);
    return parser2.parseInline(tokens);
  }
  /**
   * Parse Loop
   */
  parse(tokens, top = true) {
    let out = "";
    for (let i = 0; i < tokens.length; i++) {
      const anyToken = tokens[i];
      if (this.options.extensions?.renderers?.[anyToken.type]) {
        const genericToken = anyToken;
        const ret = this.options.extensions.renderers[genericToken.type].call({ parser: this }, genericToken);
        if (ret !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(genericToken.type)) {
          out += ret || "";
          continue;
        }
      }
      const token = anyToken;
      switch (token.type) {
        case "space": {
          out += this.renderer.space(token);
          continue;
        }
        case "hr": {
          out += this.renderer.hr(token);
          continue;
        }
        case "heading": {
          out += this.renderer.heading(token);
          continue;
        }
        case "code": {
          out += this.renderer.code(token);
          continue;
        }
        case "table": {
          out += this.renderer.table(token);
          continue;
        }
        case "blockquote": {
          out += this.renderer.blockquote(token);
          continue;
        }
        case "list": {
          out += this.renderer.list(token);
          continue;
        }
        case "html": {
          out += this.renderer.html(token);
          continue;
        }
        case "paragraph": {
          out += this.renderer.paragraph(token);
          continue;
        }
        case "text": {
          let textToken = token;
          let body = this.renderer.text(textToken);
          while (i + 1 < tokens.length && tokens[i + 1].type === "text") {
            textToken = tokens[++i];
            body += "\n" + this.renderer.text(textToken);
          }
          if (top) {
            out += this.renderer.paragraph({
              type: "paragraph",
              raw: body,
              text: body,
              tokens: [{ type: "text", raw: body, text: body, escaped: true }]
            });
          } else {
            out += body;
          }
          continue;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
  /**
   * Parse Inline Tokens
   */
  parseInline(tokens, renderer = this.renderer) {
    let out = "";
    for (let i = 0; i < tokens.length; i++) {
      const anyToken = tokens[i];
      if (this.options.extensions?.renderers?.[anyToken.type]) {
        const ret = this.options.extensions.renderers[anyToken.type].call({ parser: this }, anyToken);
        if (ret !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(anyToken.type)) {
          out += ret || "";
          continue;
        }
      }
      const token = anyToken;
      switch (token.type) {
        case "escape": {
          out += renderer.text(token);
          break;
        }
        case "html": {
          out += renderer.html(token);
          break;
        }
        case "link": {
          out += renderer.link(token);
          break;
        }
        case "image": {
          out += renderer.image(token);
          break;
        }
        case "strong": {
          out += renderer.strong(token);
          break;
        }
        case "em": {
          out += renderer.em(token);
          break;
        }
        case "codespan": {
          out += renderer.codespan(token);
          break;
        }
        case "br": {
          out += renderer.br(token);
          break;
        }
        case "del": {
          out += renderer.del(token);
          break;
        }
        case "text": {
          out += renderer.text(token);
          break;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
};

// src/Hooks.ts
var _Hooks = class {
  options;
  block;
  constructor(options2) {
    this.options = options2 || _defaults;
  }
  static passThroughHooks = /* @__PURE__ */ new Set([
    "preprocess",
    "postprocess",
    "processAllTokens"
  ]);
  /**
   * Process markdown before marked
   */
  preprocess(markdown) {
    return markdown;
  }
  /**
   * Process HTML after marked is finished
   */
  postprocess(html2) {
    return html2;
  }
  /**
   * Process all tokens before walk tokens
   */
  processAllTokens(tokens) {
    return tokens;
  }
  /**
   * Provide function to tokenize markdown
   */
  provideLexer() {
    return this.block ? _Lexer.lex : _Lexer.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? _Parser.parse : _Parser.parseInline;
  }
};

// src/Instance.ts
var Marked = class {
  defaults = _getDefaults();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = _Parser;
  Renderer = _Renderer;
  TextRenderer = _TextRenderer;
  Lexer = _Lexer;
  Tokenizer = _Tokenizer;
  Hooks = _Hooks;
  constructor(...args) {
    this.use(...args);
  }
  /**
   * Run callback for every token
   */
  walkTokens(tokens, callback) {
    let values = [];
    for (const token of tokens) {
      values = values.concat(callback.call(this, token));
      switch (token.type) {
        case "table": {
          const tableToken = token;
          for (const cell of tableToken.header) {
            values = values.concat(this.walkTokens(cell.tokens, callback));
          }
          for (const row of tableToken.rows) {
            for (const cell of row) {
              values = values.concat(this.walkTokens(cell.tokens, callback));
            }
          }
          break;
        }
        case "list": {
          const listToken = token;
          values = values.concat(this.walkTokens(listToken.items, callback));
          break;
        }
        default: {
          const genericToken = token;
          if (this.defaults.extensions?.childTokens?.[genericToken.type]) {
            this.defaults.extensions.childTokens[genericToken.type].forEach((childTokens) => {
              const tokens2 = genericToken[childTokens].flat(Infinity);
              values = values.concat(this.walkTokens(tokens2, callback));
            });
          } else if (genericToken.tokens) {
            values = values.concat(this.walkTokens(genericToken.tokens, callback));
          }
        }
      }
    }
    return values;
  }
  use(...args) {
    const extensions = this.defaults.extensions || { renderers: {}, childTokens: {} };
    args.forEach((pack) => {
      const opts = { ...pack };
      opts.async = this.defaults.async || opts.async || false;
      if (pack.extensions) {
        pack.extensions.forEach((ext) => {
          if (!ext.name) {
            throw new Error("extension name required");
          }
          if ("renderer" in ext) {
            const prevRenderer = extensions.renderers[ext.name];
            if (prevRenderer) {
              extensions.renderers[ext.name] = function(...args2) {
                let ret = ext.renderer.apply(this, args2);
                if (ret === false) {
                  ret = prevRenderer.apply(this, args2);
                }
                return ret;
              };
            } else {
              extensions.renderers[ext.name] = ext.renderer;
            }
          }
          if ("tokenizer" in ext) {
            if (!ext.level || ext.level !== "block" && ext.level !== "inline") {
              throw new Error("extension level must be 'block' or 'inline'");
            }
            const extLevel = extensions[ext.level];
            if (extLevel) {
              extLevel.unshift(ext.tokenizer);
            } else {
              extensions[ext.level] = [ext.tokenizer];
            }
            if (ext.start) {
              if (ext.level === "block") {
                if (extensions.startBlock) {
                  extensions.startBlock.push(ext.start);
                } else {
                  extensions.startBlock = [ext.start];
                }
              } else if (ext.level === "inline") {
                if (extensions.startInline) {
                  extensions.startInline.push(ext.start);
                } else {
                  extensions.startInline = [ext.start];
                }
              }
            }
          }
          if ("childTokens" in ext && ext.childTokens) {
            extensions.childTokens[ext.name] = ext.childTokens;
          }
        });
        opts.extensions = extensions;
      }
      if (pack.renderer) {
        const renderer = this.defaults.renderer || new _Renderer(this.defaults);
        for (const prop in pack.renderer) {
          if (!(prop in renderer)) {
            throw new Error(`renderer '${prop}' does not exist`);
          }
          if (["options", "parser"].includes(prop)) {
            continue;
          }
          const rendererProp = prop;
          const rendererFunc = pack.renderer[rendererProp];
          const prevRenderer = renderer[rendererProp];
          renderer[rendererProp] = (...args2) => {
            let ret = rendererFunc.apply(renderer, args2);
            if (ret === false) {
              ret = prevRenderer.apply(renderer, args2);
            }
            return ret || "";
          };
        }
        opts.renderer = renderer;
      }
      if (pack.tokenizer) {
        const tokenizer = this.defaults.tokenizer || new _Tokenizer(this.defaults);
        for (const prop in pack.tokenizer) {
          if (!(prop in tokenizer)) {
            throw new Error(`tokenizer '${prop}' does not exist`);
          }
          if (["options", "rules", "lexer"].includes(prop)) {
            continue;
          }
          const tokenizerProp = prop;
          const tokenizerFunc = pack.tokenizer[tokenizerProp];
          const prevTokenizer = tokenizer[tokenizerProp];
          tokenizer[tokenizerProp] = (...args2) => {
            let ret = tokenizerFunc.apply(tokenizer, args2);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args2);
            }
            return ret;
          };
        }
        opts.tokenizer = tokenizer;
      }
      if (pack.hooks) {
        const hooks = this.defaults.hooks || new _Hooks();
        for (const prop in pack.hooks) {
          if (!(prop in hooks)) {
            throw new Error(`hook '${prop}' does not exist`);
          }
          if (["options", "block"].includes(prop)) {
            continue;
          }
          const hooksProp = prop;
          const hooksFunc = pack.hooks[hooksProp];
          const prevHook = hooks[hooksProp];
          if (_Hooks.passThroughHooks.has(prop)) {
            hooks[hooksProp] = (arg) => {
              if (this.defaults.async) {
                return Promise.resolve(hooksFunc.call(hooks, arg)).then((ret2) => {
                  return prevHook.call(hooks, ret2);
                });
              }
              const ret = hooksFunc.call(hooks, arg);
              return prevHook.call(hooks, ret);
            };
          } else {
            hooks[hooksProp] = (...args2) => {
              let ret = hooksFunc.apply(hooks, args2);
              if (ret === false) {
                ret = prevHook.apply(hooks, args2);
              }
              return ret;
            };
          }
        }
        opts.hooks = hooks;
      }
      if (pack.walkTokens) {
        const walkTokens2 = this.defaults.walkTokens;
        const packWalktokens = pack.walkTokens;
        opts.walkTokens = function(token) {
          let values = [];
          values.push(packWalktokens.call(this, token));
          if (walkTokens2) {
            values = values.concat(walkTokens2.call(this, token));
          }
          return values;
        };
      }
      this.defaults = { ...this.defaults, ...opts };
    });
    return this;
  }
  setOptions(opt) {
    this.defaults = { ...this.defaults, ...opt };
    return this;
  }
  lexer(src, options2) {
    return _Lexer.lex(src, options2 ?? this.defaults);
  }
  parser(tokens, options2) {
    return _Parser.parse(tokens, options2 ?? this.defaults);
  }
  parseMarkdown(blockType) {
    const parse2 = (src, options2) => {
      const origOpt = { ...options2 };
      const opt = { ...this.defaults, ...origOpt };
      const throwError = this.onError(!!opt.silent, !!opt.async);
      if (this.defaults.async === true && origOpt.async === false) {
        return throwError(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      }
      if (typeof src === "undefined" || src === null) {
        return throwError(new Error("marked(): input parameter is undefined or null"));
      }
      if (typeof src !== "string") {
        return throwError(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(src) + ", string expected"));
      }
      if (opt.hooks) {
        opt.hooks.options = opt;
        opt.hooks.block = blockType;
      }
      const lexer2 = opt.hooks ? opt.hooks.provideLexer() : blockType ? _Lexer.lex : _Lexer.lexInline;
      const parser2 = opt.hooks ? opt.hooks.provideParser() : blockType ? _Parser.parse : _Parser.parseInline;
      if (opt.async) {
        return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src) : src).then((src2) => lexer2(src2, opt)).then((tokens) => opt.hooks ? opt.hooks.processAllTokens(tokens) : tokens).then((tokens) => opt.walkTokens ? Promise.all(this.walkTokens(tokens, opt.walkTokens)).then(() => tokens) : tokens).then((tokens) => parser2(tokens, opt)).then((html2) => opt.hooks ? opt.hooks.postprocess(html2) : html2).catch(throwError);
      }
      try {
        if (opt.hooks) {
          src = opt.hooks.preprocess(src);
        }
        let tokens = lexer2(src, opt);
        if (opt.hooks) {
          tokens = opt.hooks.processAllTokens(tokens);
        }
        if (opt.walkTokens) {
          this.walkTokens(tokens, opt.walkTokens);
        }
        let html2 = parser2(tokens, opt);
        if (opt.hooks) {
          html2 = opt.hooks.postprocess(html2);
        }
        return html2;
      } catch (e) {
        return throwError(e);
      }
    };
    return parse2;
  }
  onError(silent, async) {
    return (e) => {
      e.message += "\nPlease report this to https://github.com/markedjs/marked.";
      if (silent) {
        const msg = "<p>An error occurred:</p><pre>" + escape2(e.message + "", true) + "</pre>";
        if (async) {
          return Promise.resolve(msg);
        }
        return msg;
      }
      if (async) {
        return Promise.reject(e);
      }
      throw e;
    };
  }
};

// src/marked.ts
var markedInstance = new Marked();
function marked(src, opt) {
  return markedInstance.parse(src, opt);
}
marked.options = marked.setOptions = function(options2) {
  markedInstance.setOptions(options2);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.getDefaults = _getDefaults;
marked.defaults = _defaults;
marked.use = function(...args) {
  markedInstance.use(...args);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.walkTokens = function(tokens, callback) {
  return markedInstance.walkTokens(tokens, callback);
};
marked.parseInline = markedInstance.parseInline;
marked.Parser = _Parser;
marked.parser = _Parser.parse;
marked.Renderer = _Renderer;
marked.TextRenderer = _TextRenderer;
marked.Lexer = _Lexer;
marked.lexer = _Lexer.lex;
marked.Tokenizer = _Tokenizer;
marked.Hooks = _Hooks;
marked.parse = marked;
var options = marked.options;
var setOptions = marked.setOptions;
var use = marked.use;
var walkTokens = marked.walkTokens;
var parseInline = marked.parseInline;
var parse = marked;
var parser = _Parser.parse;
var lexer = _Lexer.lex;

if(__exports != exports)module.exports = exports;return module.exports}));
//# sourceMappingURL=marked.umd.js.map

;
/* inline-terms.js */
/* Generated by tools/build-inline-terms.cjs. */
(function(root){const terms=["AMI1","AMI2","AMIWeights","ATCModel","AUTO_WRITE","Allclean","Allmake","Allrun","Allwmake","AoA","Ar","Aref","As","B","BLMXiEqCoeffs","BLMcoeffs","BLMgMaXiEq","BLMgMaXiEqCoeffs","BinaryCollisionModel","BirdCarreauCoeffs","BirdCorrection","Bjs","Block","BorrvallPetersson","C","C/value","C1","C2","C7H16","CEDC","CH4","CH4___ANHARMONIC","CO","CO2","COxidationKineticDiffusionLimitedRate","COxidationKineticDiffusionLimitedRateCoeffs","Cannot","Cb","Cbag","Cbl","Cd","CelikEtaIndex","CelikNuIndex","Cell","Centerline","Cf","Ck","Cl","Cm","Cmu","Cn","Cnu","Co","Co1","Co2","Coeffs","Coeffs.injectionRateSuSp","Coeffs.overlapPercent","Coeffs.selectionMode","Coeffs.sources","Coeffs.volumeMode","CofR","Comega","Contour","ControlDict","CourantNo","Cp","Cp0","CpInf","Cpfi","CpfiCross","CpfiDot","CrankNicolson","CrossPowerLaw","CrossPowerLawCoeffs","Cs","Cs0","Csk","Cstrip","Csu","Ctrl","Cu","Curle","CuthillMcKee","Cxpe1","Cxpe2","Cxpe3","Cxpe4","D","DESField","DESModelRegions","DIC","DICGaussSeidel","DILU","DIR","DMD","DMDModel","DPMDyMFoam","DPMFoam","DT","DarcyForchheimer","DarcyForchheimerCoeffs.coordinateSystem","DarcyForchheimerCoeffs.d","Data","Debug","DebugSwitches","Ds","E","E/value","E15","EDM","EOF","EPREFIX","EQreactions","EQreactions.emplace_back","EXE","EXE_INC","EXE_LIBS","Ea","Ejs","Ek","Esc","Euler","EulerImplicit","F","FILE","FOAM_ABORT","FOAM_API","FOAM_APP","FOAM_APPBIN","FOAM_CASE","FOAM_CASENAME","FOAM_CODE_TEMPLATES","FOAM_CONFIG_ETC","FOAM_ETC","FOAM_FILEHANDLER","FOAM_JOB_DIR","FOAM_LIBBIN","FOAM_MPI","FOAM_MPI_LIBBIN","FOAM_RUN","FOAM_SETNAN","FOAM_SETTINGS","FOAM_SIGFPE","FOAM_SITE_APPBIN","FOAM_SITE_LIBBIN","FOAM_SOLVERS","FOAM_SRC","FOAM_TOTORIAL","FOAM_TUTORIALS","FOAM_USER_APPBIN","FOAM_USER_LIBBIN","FOAM_UTILITIES","Filters","Foam","FoamFile","FreeStream","FreeStreamCoeffs","FreeStreamCoeffs/numberDensities","G","GAMG","GEtaCoef","GEtaExp","GIn","GInFade","GInMult","GName","Gauss","GaussSeidel","Gulder","GulderCoeffs","GulderCoeffs.XiEqCoef","H","H2","H2O","HULL.obj","Hanning","HanningCoeffs","HdotGradH","HeatTransferCoeff","Hf","I","IBM1","IBM2","IBMProperties","InflowBoundaryModel","Info","Inlet","JensenEtAl2014","JensenEtAl2014Coeffs","JensenEtAl2014Coeffs.alpha","K.in","KC","KTS","KTSCoeffs","KTSCoeffs.GEtaCoef","L","L1","L2","LD_LIBRARY_PATH","LDevol","LES","LESIndex","LIB","LIB_LIBS","LOCAL_HSFC","LOverCw","LUST","LambVector","Lambda2","LarsenBorgnakkeVariableHardSphere","LarsenBorgnakkeVariableHardSphereCoeffs","LarsenBorgnakkeVariableHardSphereCoeffs.relaxationCollisionNumber","LaunderSharmaKE","Lee","List","Lp","M","M2","MAJ","MODE","MPI_ARCH_PATH","MPPICDyMFoam","MPPICFoam","MPPICInterFoam","MRF","MRF1","MRFProperties","MRFSource","MRF_REGION","MRF_region.obj","MULESCorr","MUST_READ","Ma","Ma5","MachNo","Make","Make/files","Make/options","Maximum","MaxwellianThermal","N","N2","NAME","NO_WRITE","NUM","NUMBER","Newmark","Newtonian","No","NusseltNumber","O","O2","OH","OMP_NUM_THREADS","ORDER_METHOD","Omega","OptimisationSwitches","Outlet","P","P1","PATH","PBiCGStab","PCG","PDRDragModel","PDRFoam","PDRMesh","PDRMeshDict","PDRProperties","PDRblockMesh","PDRblockMeshDict","PDRsetFields","PDRsetFieldsDict","PID","PIMPLE","PIMPLE/nOuterCorrectors","PISO","PISO/nCorrectors","PLATFORM","PREFIX","Pe","PecletNo","PecletNoField","Phi","Point","PopeIndex","Pr","Prt","PtLosses","Q","Q1","R","RANSLESIndicator","RAS","RASModel","RASProperties","READ_IF_PRESENT","Radial_075","Radial_15","Radial_30","Radial_45","Radial_60","Radial_75","RanzMarshall","RanzMarshallCoeffs","RanzMarshallCoeffs.BirdCorrection","ReitzDiwakar","ReitzDiwakarCoeffs","ReitzDiwakarCoeffs.Cbag","ReitzKHRTCoeffs","ReynoldsAnalogy","ReynoldsNumber","RosinRammler","RosinRammlerDistribution","RosinRammlerDistribution.minValue","SCOPEBlend","SCOPEBlendCoeffs","SCOPEXiEq","SCOPEXiEqCoeffs","SCOPEXiEqCoeffs.XiEqCoef","SEP","SIMPLE","SIMPLE/consistent","SOI","SOURCE","SPDP","SPLweighting","SRFModel","SRFPimpleFoam","SRFProperties","SRFSimpleFoam","SRFSimpleFoam/mixer","SRFVelocity","STDMD","Sb","SchillerNaumann","SetFieldsDict","SpalartAllmaras","SpecularReflection","StSmoothCoef","T","T.liquid","T0","TABCoeffs","TABCoeffs.y0","TDevol","TRef","TSat","TYPE","Ta","Tactivate","Tcommon","TestTools","Tgauge","Thigh","Tlow","Trad","Tref","Ts","U","U0","UBlendingFactor","UFinal","UInf","UMean","UName","UNear","UPrime2Mean","URef","Ua","Ubar","Uf_film","Unknown","UrMax","Uref","Urel","Us","UzMean","V","VC_1","VER","VariableHardSphere","VariableHardSphereCoeffs","VariableHardSphereCoeffs.Tref","VollerPrakash","Volume1_v_CPU","Volume3_v_fins","WALE","WM_ARCH","WM_ARCH_OPTION","WM_COMPILER","WM_COMPILER_TYPE","WM_COMPILE_OPTION","WM_DIR","WM_LABEL_OPTION","WM_LABEL_SIZE","WM_MPLIB","WM_NCOMPPROCS","WM_OPTIONS","WM_PRECISION_OPTION","WM_PROJECT","WM_PROJECT_DIR","WM_PROJECT_SITE","WM_PROJECT_USER_DIR","WM_PROJECT_VERSION","WM_THIRD_PARTY_DIR","WallInteractionModel","WeCrit","WeberNumber","X","XiDyMFoam","XiEngineFoam","XiEqCoef","XiEqExp","XiEqIn","XiEqInFade","XiEqModel","XiEqModelH","XiEqModelL","XiFoam","XiFoam.C","XiGModel","XiModel","XiReactionRate","XiShapeCoef","XpEqModel","XpGModel","XpShapeCoef","Y","YGasTot0","YH2O","YLiquidTot0","YSolidTot0","Yi","Z","Zero","_match.obj","_to_.*","_value1","_volFieldValue","a","aRef","aachenBomb","abaqusMesh","abaqusMeshSet","abort","absProximity","absolute","absorb","absorptionEmissionModel","absorptivity","abszissaType","acceptanceAngle","acousticFoam","action","actions","active","activeAbsorption","activeLiquids","adaptMesh","adaptiveLinear","adaptiveLinearCoeffs","adaptiveLinearCoeffs.relaxationStart","add","addLayers","addLayersControls","addLayersControls.maxFaceThicknessRatio","addLayersControls.maxThicknessToMedialRatio","addLayersControls.minMedialAxisAngle","addLayersControls.nSmoothSurfaceNormals","addLayersControls.nSmoothThickness","addRegion","addZones","additionalFeatures","addr2line","addresses","addressing","adiabatic","adiabaticFlameT","adios","adjManager1","adjointLaminar","adjointManagers","adjointOptimisationFoam","adjointRASModel","adjointRASProperties","adjointShapeOptimizationFoam","adjointSimple","adjointSolvers","adjointSpalartAllmaras","adjointTurbulence","adjointTurbulenceProperties","adjointkOmegaSST","adjustTimeStep","adjustable","adjustableRunTime","advective","aerofoil","age","air","algebraicCoeffs","aliases","alignmentAcceptanceAngle","all","allAreas","allGeometry","allRegions","allTopology","allowEarlyCollapseCoeff","allowEarlyCollapseToPoint","allowFreeStandingZoneFaces","allowRestart","alpha","alpha.air","alpha.liquid","alpha.solid","alpha.water","alpha.water.*","alpha/value","alpha1","alphaAxis","alphaCoefN","alphaCoefP","alphaContactAngle","alphaD","alphaDt","alphaEps","alphaEta","alphaNu","alphaThreshold","alphaVol","alphaVol/type","alphat","alphatWallFunction","am1","amplitude","analytical","anchor","and","angle","animate","animationInfo","animationInfo.colour","ansysToFoam","anyWrite","api","app","appDir","appName","append","application","applyBoundaryLayer","applyDistributionMassTotal","appnum","apps","apt","arc","arch","archOption","area","areaAverage","areaIntegrate","areaWrite","areas","argument","array","arraySet","as1","ascii","ash","at","atmosphere","atmosphere/inletOutlet","atmosphericModels","atomizationModel","attachMesh","auto","autoDensity","autoDensityCoeffs","autoPatch","autoWrite","autowrite","aux","average","avgOutlets","awk","axis","axisVec","b","back","backgroundMeshDecomposition","backgroundMeshDecomposition.spanScale","backup","backward","baffleCyclic_half0","baffleFaces","baffleWall","baffles","barotropicCompressibilityModel","base","baseCase","baseCase/0.1","baseCase/system/controlDict","basename","basenames","basic","basic/chtMultiRegionFoam/2DImplicitCyclic","basic/laplacianFoam/flange","basic/overLaplacianDyMFoam/heatTransfer","basic/overPotentialFoam/cylinder/cylinderAndBackground","basic/potentialFoam/cylinder","basic/scalarTransportFoam/movingSource","basic/simpleFoam/implicitAMI","basicCoeffs","basicSchCoeffs","basicSubGrid","basicSubGridCoeffs","basicSubGridG","basicSubGridGCoeffs","basicSubGridGCoeffs.k1","batch","bear","beta","beta1","betaCoefN","betaCoefP","bfdname","bg","bidirectional","bin","bin/sh","binData","binData.cumulative","binData.direction","binData.min","binData.minMax","binData.nBin","binField","binModel","binModels","binWidth","binary","bindir","bison","bladeForces","blades","blended","blending","blendingFactor","blob","blob.stl","block","blockCoeffs","blockMesh","blockMeshDict","blockedCells","blockedCellsSet","blockedFaces","blockedFacesSet","blocks","body","bool","boost","both","bothSides","bottom","bottomAir_to_heater","bottomHtc","bottomWall","bottomWater","boundBox","boundary","boundary/type","boundaryAndFaceZones","boundaryCellSize","boundaryCellSizeRefinementThickness","boundaryConditions","boundaryFaces","boundaryField","boundaryFoam","boundaryLayers","boundaryLayers.patchBoundaryLayers","boundaryRadiationProperties","boundaryToFace","bounded","bounded01","bounds","box","box/type","boxToCell","boxToFace","boxToPoint","boxTurb","boxTurbDict","boxes","break","breakupModel","brew","broadcast","bubbles","build","buildings.obj","bulkVelocity","bump","buoyantBoussinesqPimpleFoam","buoyantBoussinesqSimpleFoam","buoyantPimpleFoam","buoyantPimpleFoam/hotRoom","buoyantSimpleFoam","burntGas","by","c","c.component","c0","c1","cAlpha","cabin","cache","cacheAgglomeration","calc","calcFrequency","calculateCells","calculated","canCompile","cannot","cartesianMesh","case","caseA","caseB","caseC","caseDicts/mesh/generation/meshQualityDict.cfg","caseDicts/meshQualityDict","caseDicts/setConstraintTypes","caseDicts/surface/surfaceFeatureExtractDict.cfg","caseInfo","caseProperties","case_dir","castellatedMesh","castellatedMeshControls","castellatedMeshControls.maxLoadUnbalance","castellatedMeshControls.useTopologicalSnapDetection","cat","category","cavitatingDyMFoam","cavitatingFoam","ccm26ToFoam","ccmToFoam","cd","ceiling","ceilingHtc","cell","cellCentre","cellCentreDistCoeff","cellCentreSet","cellCentres","cellData","cellDist","cellId","cellLimited","cellPoint","cellSet","cellSizeAndAlignmentGrid","cellSizeFunction","cellToCell","cellToFace","cellType","cellValueSourceCorrection","cellVolumeWeight","cellWidth","cellWidthFactor","cellZone","cellZoneAndDirection","cellZoneInside","cellZoneSet","cellZones","cellZonesFileOnly","cellZonesOnly","cellsToRefine","centre","centreLine","cfg","cflags","cfx4ToFoam","cgal","changeDictionary","changeDictionaryDict","check","checkAMI","checkDimensions","checkFaMesh","checkGeometry","checkMesh","checkSelfIntersection","chemFoam","chemFoam.out","chemistry","chemistryProperties","chemistryType","chemistryType/solver","chemkinToFoam","chmod","chosenPoints","chown","chtMultiRegionFoam","chtMultiRegionSimpleFoam","chtMultiRegionTwoPhaseEulerFoam","circle","circleAxis","circleSet","circulateEdges","clang","class","clean","cleanAdiosOutput","cleanApplication","cleanAuxiliary","cleanCase","cleanCase0","cleanDynamicCode","cleanFaMesh","cleanOptimisation","cleanPolyMesh","cleanPostProcessing","cleanSamples","cleanSnappyFiles","cleanTimeDirectories","cleanUcomponents","clear","clip","clockTime","cloneCase","cloneParallelCase","closedTriSurfaceMesh","clothing","cloud","cloudFunctions","cloudFunctions/particleDose1","cloudInfo","cloudName","cloudSet","clouds","cmake","cmd","cmp","coalChemistryFoam","coalCloud1","coalCloud1Positions","coalCloud1Properties","coarse","coarseMesh","code","codeContext","codeData","codeEnd","codeExecute","codeInclude","codeLibs","codeOptions","codeRead","codeStream","codeWrite","coded","codedFixedValue","coeffC","coeffE","coefficient","coefficients","coeffs","coldEngineFoam","collapseDict","collapseEdges","collapseEdgesCoeffs","collapseEdgesCoeffs.minimumEdgeLength","collapseFaceSet","collapseFaces","collapseFacesCoeffs","collapseFacesCoeffs.allowEarlyCollapseToPoint","collapseFacesCoeffs.guardFraction","collate","collateTimes","collated","collect","collector","collisionModel","colour","colourField","columnAverage","combinePatchFaces","combineZones","combustion/PDRFoam/flamePropagationWithObstacles","combustion/XiDyMFoam/annularCombustorTurbine","combustion/XiEngineFoam/kivaTest","combustion/XiFoam/RAS/moriyoshiHomogeneous","combustion/coldEngineFoam/freePiston","combustion/fireFoam/LES/compartmentFire","combustion/reactingFoam/RAS/DLR_A_LTS","combustion/rhoReactingFoam/groundAbsorption","combustionModel","combustionProperties","combustionProperties/EDMCoeffs","comfort","comm","command","commit","commsDir","commsType","comp","compartmentFire","compat","compile","compileApplication","compiler","component","componentColumns","components","composedFunction","compositionModel","compress","compressible","compressible/acousticFoam/obliqueAirJet/main","compressible/overRhoPimpleDyMFoam/twoSimpleRotors","compressible/overRhoSimpleFoam/hotCylinder/cylinderAndBackground","compressible/rhoCentralFoam/LadenburgJet60psi","compressible/rhoPimpleAdiabaticFoam/rutlandVortex2D","compressible/rhoPimpleFoam/LES/pitzDaily","compressible/rhoPorousSimpleFoam/angledDuct/explicit","compressible/rhoSimpleFoam/aerofoilNACA0012","compressible/sonicDyMFoam/movingCone","compressible/sonicFoam/RAS/nacaAirfoil","compressible/sonicLiquidFoam/decompressionTank","compressibleInterDyMFoam","compressibleInterFilmFoam","compressibleInterFoam","compressibleInterIsoFoam","compressibleMultiphaseInterFoam","compression","computeSensitivities","concaveAngle","concaveMultiCells","condensatingVessel","conditions","coneNozzleInjection","coneNozzleInjection.injectionMethod","config","conformalVoronoi2DMesh","conformalVoronoiMesh","conformationControls","conformationOnly","consecutive","consistent","const","constIso","constant","constant/MRFProperties","constant/PDRProperties","constant/RASProperties","constant/SRFProperties","constant/adjointRASProperties","constant/air/viewFactorsDict","constant/boundaryRadiationProperties","constant/boxTurbDict","constant/chemistryProperties","constant/coalCloud1Properties","constant/combustionProperties","constant/createBoxTurbDict","constant/dsmcProperties","constant/dynamicMeshDict","constant/financialProperties","constant/fvOptions","constant/g","constant/gravitationalProperties","constant/initialConditions","constant/interfacialProperties","constant/kinematicCloudProperties","constant/limestoneCloud1Properties","constant/mechanicalProperties","constant/moleculeProperties","constant/motionProperties","constant/parcelInjectionProperties","constant/particleTrackDict","constant/particleTrackProperties","constant/phaseChangeProperties","constant/physicalProperties","constant/polyMesh/boundary","constant/porosityProperties","constant/postChannelDict","constant/radiationProperties","constant/reactingCloud1Properties","constant/regionFaIBMProperties","constant/regionProperties","constant/sprayCloudProperties","constant/surfaceFilmProperties","constant/thermalProperties","constant/thermodynamicProperties","constant/thermophysicalProperties","constant/transportProperties","constant/turbulenceProperties","constant/water/phaseProperties","constant/waveProperties","constantAbsorptionEmission","constantAlphaContactAngle","constantCoeffs","constantEmissivity","constantProperties","constantProperties.LDevol","constantProperties.constantVolume","constantProperties.epsilon0","constantProperties.rho0","constantProperties/volumeUpdateMethod","constantRateDevolatilisation","constantRateDevolatilisationCoeffs","constantRho","constantVolume","constants","constraints","constructFrom","content","continuityError","controlDict","controlDict.adjustTimeStep","controlMeshQuality","controlMeshQualityCoeffs","controlMeshQualityCoeffs.maxPointErrorCount","controlMeshQualityCoeffs.maximumIterations","controlMode","convective","convertToMeters","coordinateSystem","copyUniform","copyZero","core","correctFluxes","corrected","count","counterFlowFlame2DLTS","coupled","coupledFaces","coupledFacesSet","cp","cpuTime","create","createBaffles","createBafflesDict","createBlockMesh","createBoxTurb","createBoxTurbDict","createCode","createExternalCoupledPatchGeometry","createMingwRuntime","createPatch","createPatchDict","createPatchMap","createROMfields","createViewFactors","createZeroDirectory","csh","csv","cube","cubeRootVol","cubic","cubit","cumulativeDisplacement","curl","curr","current","cut","cuttingPatches","cuttingPlane","cv2DControls","cvControls","cxx","cxxflags","cyclic","cyclicAMI","cyclicLeft","cyclicMasterPatch","cyclicMasterPatchName","cylToCart","cylinder","cylinderToCell","cylindrical","d","d50","dBRef","dPlusRef","dTheta","dampedCoulomb","dampedCoulombCoeffs","dampedCoulombCoeffs.alpha","dashes","datToFoam","data","dataCloud","dataFile","date","db","dd","ddt","ddt2","ddtP","ddtSchemes","ddtSchemes.default","ddtSchemes/default","ddtU","debian","debug","debugKeys","debugValues","decomp","decompose","decomposePar","decomposeParDict","decomposePatchValues","decomposition","decompositionMethod","decompositionMethods","decompressionTank","default","defaultCIn","defaultCellSize","defaultFaces","defaultFaces/empty","defaultFieldValues","defaultPatch","defaultPatch.name","defaultPriority","defaultValue","defined","defines","deformedGeom","deg","degToRad","degrees","delta","deltaT","deltaTCoeff","deltaWet","demangle","demo.sh","demoA","demoB","density","depthFirst","derived","derivedFields","designVariables","detail","detect","detectOnly","detected","dev/null","devolatilisationModel","df","diagonal","diameter","dict","dictNames","dictionaries","dictionary","dictionaryReplacement","dictionaryValue","diff","diffusion","diffusivity","dimensions","dims","dir","dir1","dirN","dirToString","directForceDensity","direction","directionVec","directions","directories","directory","dirname","dirs","disableFunctionEntries","disablePatchGroups","disc","discreteMethods/dsmcFoam/freeSpacePeriodic","discreteMethods/molecularDynamics/mdEquilibrationFoam/periodicCubeArgon","discreteMethods/molecularDynamics/mdFoam/nanoNozzle","dispersedPhase","dispersionModel","displacementLaplacian","displacementLaplacianCoeffs","distance","distanceCellSizeCoeff","distanceCoeff","distanceSurface","div","divSchemes","divSchemes/default","divide","divisions","divisor","divisorField","dmdt.liquidToGas","dmdt.liquidToOxide","dnsFoam","doNotPreserveFaceZones","doPostProcess","doc","domain0","domains","done","doubleSigmoid","doubleSigmoidCoeffs","doubleSigmoidCoeffs.shift1","doxyFilter","dr","drag","dragDir","dragModel1","dragModel1/2","dragModel2","dragPhase","drawGrid","driftFluxFoam","drippingChair","dry","dsmcFields","dsmcFoam","dsmcInitialise","dsmcInitialiseDict","dsmcProperties","dst","dt2","du","dummy","dump","dumpLevel","dumpRays","dup","duration","dynamicAlphaContactAngle","dynamicAlphaContactAngle.uTheta","dynamicAlphaContactAngleFvPatchScalarField","dynamicFvMesh","dynamicMeshDict","dynamicMotionSolverFvMesh","dynamicOversetFvMesh","dynamicRefineFvMesh","dynamicRefineFvMeshCoeffs","dynamicRefineFvMeshCoeffs.field","e","e0","e1","e11","e12","e15","e2","e20","e3","e5","e6","e7","e9","eMesh","echo","edgeAiming","edgeAttachedToBoundaryFactor","edgeGrading","edgeReductionFactor","edgeSearchDistCoeff","edges","electricField","electricPotential","electromagnetics/electrostaticFoam/chargedWire","electromagnetics/mhdFoam/hartmann","electrostatic","electrostaticFoam","ellipsoidImplicitFunction","embeddedPoints","embeddedPointsDict","emissivity","empty","enableFunctionEntries","enabled","end","endCalls","endTime","energy","energyScalingFunction","energySpectrum","energyTransport","engineCompRatio","engineFoam","engineSwirl","enoughTime","ensight","ensightCloud","ensightToFoam","ensightWrite","enstrophy","enthalpyDifference","enthalpyTransfer","entries","entry","entry.txt","env","environmentVariable","epsilon","epsilon0","epsilonWallFunction","epsilonr","equal","equalBinWidth","equationCut","equationInitialResidual","equationMaxIter","equationOfState","equations","equilibrium","equilibriumCO","equilibriumCOStudy","equilibriumFlameT","error","errorOnPointNotFound","errorReduction","errors","etc","eulerianParticleCloud","eval","evaporationMultiComponent","exceeded","exclude","excludeFields","excludePatches","excludeProcPatches","exe","exec","executable","executeCalls","executeControl","executeInterval","exit","expand","expansionRatio","explicit","explicitFeatureSnap","explicitPorositySource","export","exposedPatchName","expr","exprField","expression","expressions","ext","extWork","extended","extendedFeatureEdgeMesh","external","external.gravity","externalCoupled","externalCoupledTemperature","externalWallHeatFluxTemperature","extra","extractEulerianParticles","extractFromFile","extractFromFileCoeffs","extractFromFileCoeffs.featureEdgeFile","extractFromSurface","extractFromSurfaceCoeffs","extractFromSurfaceCoeffs.includedAngle","extractZonePoints","extractionMethod","extrapolateProfile","extras","extrema","extrude","extrude2DMesh","extrude2DMeshDict","extrudeMesh","extrudeMeshDict","extrudeModel","extrudeToRegionMesh","extrudeToRegionMeshDict","extrusion","f","f0","f0Zone","fD","fMax","fMin","face","faceAgglomerate","faceAreaRatioCoeff","faceId","faceOnlySet","faceReductionFactor","faceSet","faceSetDict","faceWeight","faceZone","faceZoneAndDirection","faceZoneNaming","faceZoneReferenceTemperature","faceZoneSet","faceZones","faces","facesToBeRemoved","factor","failed","false","featureAngle","featureEdgeExclusionDistanceCoeff","featureEdgeFile","featureMethod","featurePointControls","featurePointExclusionDistanceCoeff","features","fftWriteInterval","fftw","fg","field","fieldAverage","fieldAverage1","fieldCoordinateSystemTransform","fieldExtents","fieldFunctionObjects","fieldMask","fieldMinMax","fieldStatistics","fieldStats","fieldToCell","fieldValues","fields","fields/volume","fieldsExpression","fieldsInterval","file","fileHandler","fileName","fileRegEx","fileToUpdate","fileType","files","filmThermoModel","filmViscosityModel","filter","filterEdges","filterFaces","finalLayerThickness","final_","financialFoam","financialProperties","find","findEmptyMake","fine","finite","finiteArea/liquidFilmFoam/cylinder","finiteArea/sphereSurfactantFoam/sphereTransport","finiteArea/surfactantFoam/planeTransport","fireFoam","fireToFoam","firstLayerThickness","firstSnapshot","fixed","fixed.obj","fixed.obj/regions","fixedCoeffs","fixedFluxPressure","fixedGradient","fixedLocations","fixedReferenceTemperature","fixedValue","fixedVelocity","fixedWall","fixedWalls","fixedWalls/noSlip","flame","flattenMesh","flipNormals","floatingObject","floor","flowRateAndDischarge","flowRateInletVelocity","flowRateProfile","flowSpecification","flowType","flowVelocity","fluent3DMeshToFoam","fluentMeshToFoam","fluid","fluid/T","fluid1","fluid2","fluidThermo","flux","fluxRequired","fluxSummary","foam","foamCalc","foamCheckJobs","foamCleanFaMesh","foamCleanPath","foamCleanPolyMesh","foamCleanTutorials","foamCloneCase","foamConfigurePaths","foamCopySettings","foamCreateCompletionCache","foamCreateManpage","foamCreateModuleInclude","foamCreateVideo","foamDataToFluent","foamDataToFluentDict","foamDictionary","foamEndJob","foamEtcFile","foamExec","foamExprParserInfo","foamFormatConvert","foamGet","foamGetDict","foamGrepExeTargets","foamGrepLibTargets","foamHasLibrary","foamHelp","foamInstall","foamInstallationTest","foamJob","foamListRegions","foamListTimes","foamLog","foamMeshToFluent","foamMonitor","foamNew","foamNewApp","foamNewBC","foamNewCase","foamNewFunctionObject","foamPV","foamPackRelease","foamPrintJobs","foamPwd","foamReport","foamRestoreFields","foamRunTutorials","foamSearch","foamSequenceVTKFiles","foamSolverSweeps","foamSystemCheck","foamTestTutorial","foamToCcm","foamToEnsight","foamToFireMesh","foamToGMV","foamToStarMesh","foamToSurface","foamToTetDualMesh","foamToVTK","foamUpdateCaseFileHeader","foamUpgradeCyclics","foamUpgradeFiniteArea","foamVersion","foamyHexMesh","foamyHexMeshBackgroundMesh","foamyHexMeshDict","foamyHexMeshSurfaceSimplify","foamyMesh","foamyQuadMesh","foamyQuadMeshDict","for","forAll","force","forceCoeff","forceCoeffs","forceCoeffs1","forces","format","formatOptions","forward","found","fps","frame","free","freeSpacePeriodic","freeSpaceStream","freeSurf","freeSurf/type","freestreamPressure","freestreamVelocity","freezeFraction","frequency","from","front","frontAndBack","frontAndBack/empty","frontAndBack/type","frontWidth","fu","full","fullMatch","func","funcs","function","functionObject","functionObjectValue","functionObjects","functionType","functions","functions/probes","fvMesh","fvModels","fvMotionSolvers","fvOptions","fvPatch","fvSchemes","fvSolution","fvSolution/SIMPLE/residualControl","fvc","fvm","g","g0123","gMaCoef","gMaCoef1","gambitToFoam","gamma","gamma_p","gapLevel","gapMode","gas","gcc","general","generated","geometricCut","geometricVelocity","geometricVoF","geometry","geometry/obstaclesDict","geometryOrder","geometryToConformTo","getApplication","getNumberOfPatchFaces","getNumberOfProcessors","gg","gh","ghf","git","gitbase","global","globalCoeffs","globalCoeffs.tan1","globalFaceFaces","gltf","gmp","gmshToFoam","gnuplot","going","grad","gradSchemes","gradU","gradient","grading","grammar","graphFormat","graphFunctionObject","gravitationalProperties","gravity","greater","grep","grid","ground","group","groupID","gt","guardFeaturePoints","guardFraction","gulderCoef","gz","gzip","h","hConst","hRef","hRetentionCoeff","handler","has","hdf5","hePsiThermo","heRhoThermo","heSolidThermo","head","header","heatTransfer","heatTransfer/buoyantBoussinesqPimpleFoam/BenardCells","heatTransfer/buoyantBoussinesqSimpleFoam/hotRoom","heatTransfer/buoyantPimpleFoam/hotRoom","heatTransfer/buoyantSimpleFoam/buoyantCavity","heatTransfer/chtMultiRegionSimpleFoam/cpuCabinet","heatTransfer/chtMultiRegionTwoPhaseEulerFoam/solidQuenching2D","heatTransfer/overBuoyantPimpleDyMFoam/movingBox","heatTransfer/solidFoam/movingCone","heatTransferCoeff","heatTransferCoeffModels","heatTransferModel","heatTransferModel1","heatTransferModel1/2","heatTransferModel2","heatedWall","heater","heaterCells","height","help","hex","hf_film","hierarchical","hierarchicalCoeffs","hierarchicalCoeffs.n","highCpCoeffs","highReynolds","histogram","histogramModels","history","homebrew","hook","host1","hostN","hostRoots","htc","htcModel","htcRefTemperature","htop","hull","hydrophilic","hydrostaticMode","hydrostaticPressure","i","icoFoam","icoReactingMultiphaseInterFoam","icoUncoupledKinematicCloud","icoUncoupledKinematicParcelDyMFoam","icoUncoupledKinematicParcelFoam","ideasUnvToFoam","idle","ids","if","ifRequired","ignore","ignoreCellGroups","ignoreFaceGroups","ill","image","implicitFeatureSnap","implicitFunction","in","inGroups","include","includeCut","includeEtc","includeFunc","includeIfPresent","includeKnum","includeOutOfBounds","includedAngle","includes","incompatible","incompressible","incompressible/SRFPimpleFoam/rotor2D","incompressible/SRFSimpleFoam/mixer","incompressible/adjointOptimisationFoam/sensitivityMaps/motorBike","incompressible/adjointShapeOptimizationFoam/pitzDaily","incompressible/nonNewtonianIcoFoam/offsetCylinder","incompressible/overPimpleDyMFoam/rotatingSquare","incompressible/overSimpleFoam/aeroFoil/aeroFoil_overset","incompressible/pimpleFoam/LES/NACA4412","incompressible/pisoFoam/LES/pitzDaily","incompressible/porousSimpleFoam/straightDuctImplicit","incompressible/shallowWaterFoam/squareBump","index","info","initByExternal","initialChemicalTimeStep","initialConditions","initialFaceLengthFactor","initialPoints","initialPoints.initialPointsMethod","initialPointsMethod","initialisationFunctionObjects","initialiseEpsilon","initialiseK","initialiseOmega","initialiseR","initialiseU","initialiseUBCs","injectedParticleDistributionInjection","injectedParticleDistributionInjection.binWidth","injectedParticleInjection","injectedParticleInjection.cloud","injectionMethod","injectionModels","injectionRateSuSp","inlet","inlet/fixedValue","inlet1","inletCellZone","inletOutlet","inletValue","inlines","innerDiameter","innerx","innery","innerz","input","inputMode","insertSurfaceNearPointPairs","insertSurfaceNearestPointPairs","inside","insideCells","insideOutsideCheck","insidePoint","insidePoints","instability","instability2GCoeffs","instability2XiEqCoeffs","instabilityCoeffs","instabilityCoeffs.XiEqIn","instabilityG","instabilityGCoeffs","install","instance","int","int32","int64","integer","integral","integrationSchemes","intensity","interCondensatingEvaporatingFoam","interFoam","interIsoFoam","interMixingFoam","interPhaseChangeDyMFoam","interPhaseChangeFoam","interactionType","interface","interfaceCompression","interfaceHeatResistance","interfaceHeight","interfacePorous","interfaceZone","interfacialProperties","intermediate","internal","internalDegreesOfFreedom","internalFacesOnly","internalField","interpolate","interpolationField","interpolationScheme","interpolationSchemes","interpolationSchemes/default","interpolationType","interval","invariant","invert","invertedSpace","is","isParallel","isTest","isTrue","isoField","isoMethod","isoPlanes","isoQ","isoSurface","isoSurfaceCell","isoSurfacePoint","isoSurfaceTopo","isoValue","isoValues","iteration","iterationToInitialHitRatioLimit","iterations","iters","j","j8","jN","jaggedBoundary","jaggedBoundary.stl","janaf","jobs","jouleHeatingSource:V","jouleHeatingSource:sigma","json","k","k/value","k0","k1","k3Coeffs","k3Obs","k3Open","kEpsilon","kOmegaSST","kT","kaCoef","kahip","kappa","kappaLayers","kappaMethod","kb1","keep","keepHandedness","keepIds","keepNonMapped","keepOrientation","keepPatches","keyword","keywords","kg","kill","kinematicCloud","kinematicCloudProperties","kinematicParcelFoam","kinematicSurfaceFilm","kinematicSurfaceFilmCoeffs","kineticEnergy","kivaToFoam","kouZhang","kqRWallFunction","l","lCoef","lRef","label","labelToCell","labelToFace","labelToPoint","lagrangian","lagrangian/DPMFoam/Goldschmidt","lagrangian/MPPICDyMFoam/column","lagrangian/MPPICFoam/Goldschmidt","lagrangian/coalChemistryFoam/simplifiedSiwek","lagrangian/icoUncoupledKinematicParcelDyMFoam/mixerVesselAMI2D","lagrangian/icoUncoupledKinematicParcelFoam/hopper/hopperEmptying","lagrangian/kinematicParcelFoam/drippingChair","lagrangian/reactingHeterogenousParcelFoam/rectangularDuct","lagrangian/reactingParcelFoam/counterFlowFlame2DLTS","lagrangian/simpleReactingParcelFoam/verticalChannel","lagrangian/sprayFoam/aachenBomb","lagrangian/uncoupledKinematicParcelDyMFoam/rotor2DAMI","lagrangianFields","lagrangianFunctionObjects","lambda","lambdaIn","laminar","laminarCoeffs","laminarCoeffs.Cf","language","laplacianFoam","laplacianMotionSolver","laplacianMotionSolverCoeffs","laplacianSchemes","laplacianSchemes/default","largestOnly","largestRegion","lastMatch","latestTime","latticeCellShape","latticeIds","latticePositions","layerFields","layerParameters","layerSets","layers","leastSquares","left","leftSolid","lefthand","legacy","lemon","len","length","lennardJones","lennardJonesCoeffs","lennardJonesCoeffs.sigma","less","letters","level","levels","lib","libMyModel","libX.so","libdir","libfoamLabPulsedInlet.so","libraries","libs","libso","lid","lifetime","liftDir","limestoneCloud1Properties","limestonePositions","limit","limitFields","limited","limitedLinear","limitedLinear01","limitedLinearV","line","line1","lineCell","lineFace","linear","linearDirection","linearDirectionCoeffs","linearDirectionCoeffs.direction","linearDistance","linearDistanceCoeffs","linearNormal","linearNormalCoeffs","linearNormalCoeffs.thickness","linearUpwind","lines","lines/*.obj","link","liquid","liquidCoeffs","liquidEvaporation","liquidEvaporationBoil","liquidEvaporationBoilCoeffs","liquidEvaporationCoeffs","liquidFilmFoam","liquidHtc","list","listFunctionObjects","listFvOptions","listRegisteredSwitches","listScalarBCs","listSwitches","listTurbulenceModels","listUnsetSwitches","listVectorBCs","lists","literalRE","llvm","ln","lnInclude","load","loading","local","localCode","localDB","localEuler","localPoints","localReferenceTemperature","location","locationInMesh","locations","log","log.*","log.restart","logScaleX","logScaleY","logic","logk","logs","logscale","lookup","lookupMode","loop","losses","lowCpCoeffs","lowK0","lowK1","lowK2","lowKg","lowReCorrection","lower","lowerLimit","lowerRefineLevel","lowerSurfaceModels","lowerSurfaceModels.heatTransferModel","lowerWall","ls","lscpu","lumpedPointForces","lumpedPointMovement","lumpedPointZones","m","maLim","maLim1","mag","mag.drag","mag.thrust","magPerturbation","magSf","magSqr","magUInf","magneticFoam","magnitude","main.C","maitlandSmith","maitlandSmithCoeffs","maitlandSmithCoeffs.m","make","makeCellZones","makeDepend","makeFaMesh","makeFiles","makeOptions","makeParser","makeTargetDir","man","manual","manualCoeffs","manualCoeffs.dataFile","manualInjection","mapFields","mapFieldsDict","mapFieldsPar","mapMethod","mapRegion","mapped","maps","markLeakPath","mask","mass","massDensity","massFlowRate","massFlux","massTotal","massTransferModel","massTransferMultiphaseSystem","master","masterPatch","masterRegion","match","matchSeparator","matchTolerance","max","maxAlphaCo","maxAlphaDdt","maxAlphaRate","maxBoundaryConformingIter","maxBoundarySkewness","maxCellSize","maxCellWeightCoeff","maxCells","maxClothIter","maxCo","maxCollapseFaceToPointSideLengthCoeff","maxConcave","maxD","maxDeltaT","maxDi","maxDiameter","maxDist","maxDistance","maxDownstream","maxDuration","maxDynListLength","maxFaceThicknessRatio","maxFaceWeight","maxFreq","maxGlobalCells","maxGradCc","maxInitChange","maxInternalSkewness","maxIter","maxIterations","maxIters","maxLoadUnbalance","maxLocalCells","maxMergeAngle","maxNonOrtho","maxNonOrthogonality","maxNotchLenCoeff","maxPointErrorCount","maxPoints","maxPositions","maxQuadAngle","maxRank","maxRefinement","maxRefinementIterations","maxResidual","maxSchFac","maxSizeRatio","maxSkewness","maxSmoothingIterations","maxSurfaceProtrusionCoeff","maxThicknessToMedialRatio","maxValue","maxZ","maximumIterations","maximumMergeAngle","maximumSmoothingIterations","mdEquilibrationDict","mdEquilibrationFoam","mdFoam","mdFoam.C","mdInitialise","mdInitialiseDict","mean","meanVelocity","meanVelocityForce","mech_test.obj","mechanicalProperties","medium","memInfo","membrane","membranePipe","membraneSleeve","merge","mergeFaces","mergeMeshes","mergeOrSplitBaffles","mergePatchPairs","mergeRegions","mergeSeparators","mergeTol","mergeTolerance","mergingFaces","mesa","mesh","meshDict","meshQuality","meshQualityControls","meshQualityControls.nSmoothScale","meshQualityDict","meshReport","meshWave","meshedSurface","meshedSurfaceNormal","meshedSurfaceOutput","meta","metabolicRate","metalSheet","metalSheet/omegaWallFunction","methane.in","methaneAir","method","metis","mhdFoam","midPlane","midPoint","midPointAndFace","midPointAndFaceSet","midPointSet","min","minArea","minBasis","minCellSize","minDeterminant","minDiameter","minDist","minEVal","minEdgeLen","minEdgeLenCoeff","minFaceWeight","minFreq","minGradCc","minInterfaceAlpha","minIter","minLevels","minMax","minMedialAxisAngle","minNearPointDistCoeff","minNonOrthogonality","minRefinementCells","minSet","minSkewness","minTetQuality","minThickness","minTimeStep","minTriangleTwist","minTwist","minValue","minVol","minVolRatio","minX","minZ","minimum","minimumCellSizeCoeff","minimumEdgeLength","mirrorMesh","mirrorMeshDict","mirrorPoints","mismatch","mixed","mixedFeaturePointPPDistanceCoeff","mixerVessel2D","mixingLength","mixture","mixture.in","mixture.specie.molWeight","mixture.thermodynamics","mixture.transport","mixtureAdiabaticFlameT","mkdir","mode","modeSorter","model","model.C","model1","models/transport","models/turbulence","modifyMesh","module","modules","molWeight","moleculeProperties","momSource","momentOrder","momentum","momentumError","momentumPredictor","momentumSource","momentumTransport","motion","motionControl","motionControl.alignmentAcceptanceAngle","motionControl.defaultCellSize","motionControl.minCellSize","motionControl.objOutput","motionControl.pointInsertionCriteria","motionControl.pointRemovalCriteria.cellCentreDistCoeff","motionControl.relaxationModel","motionControl.shapeControlFunctions","motionProperties","motionSolver","motionSolverLibs","motorBike","motorBike.*","motorBike.eMesh","motorBike.obj","motorBikeGroup","motorbike","moveDynamicMesh","moveEngineMesh","moveMesh","moving","movingFvMesh","movingInjectorBox","movingPoints","movingWall","movingWall/fixedValue","movingWallVelocity","mpfr","mpi","mpicc","mpirunDebug","mshToFoam","mu","muc","multiComponentMovingPhaseModel","multiFieldValue","multiLevel","multiRegion","multiRegionFeatureSnap","multiphase/MPPICInterFoam/twoPhasePachuka","multiphase/cavitatingFoam/LES/throttle","multiphase/compressibleInterDyMFoam/laminar/sloshingTank2D","multiphase/compressibleInterFoam/laminar/climbingRod","multiphase/compressibleInterIsoFoam/laminar/climbingRod","multiphase/compressibleMultiphaseInterFoam/laminar/damBreak4phase","multiphase/driftFluxFoam/RAS/dahl","multiphase/icoReactingMultiphaseInterFoam/evaporationMultiComponent","multiphase/interCondensatingEvaporatingFoam/condensatingVessel","multiphase/interFoam/LES/nozzleFlow2D","multiphase/interIsoFoam/damBreak","multiphase/interMixingFoam/laminar/damBreak","multiphase/interPhaseChangeDyMFoam/propeller","multiphase/interPhaseChangeFoam/cavitatingBullet","multiphase/multiphaseEulerFoam/bubbleColumn","multiphase/multiphaseInterFoam/laminar/damBreak4phase","multiphase/overCompressibleInterDyMFoam/compressibleTwoSimpleRotors","multiphase/overInterDyMFoam/simpleRotor","multiphase/overInterPhaseChangeDyMFoam/twoSimpleRotors","multiphase/potentialFreeSurfaceDyMFoam/oscillatingBox","multiphase/potentialFreeSurfaceFoam/oscillatingBox","multiphase/reactingMultiphaseEulerFoam/RAS/wallBoiling1D_2phase","multiphase/reactingTwoPhaseEulerFoam/LES/bubbleColumn","multiphase/twoLiquidMixingFoam/lockExchange","multiphase/twoPhaseEulerFoam/LES/bubbleColumn","multiphaseEulerFoam","multiphaseInterFoam","multiphaseInterHtcModel","multiphaseSystem","multiply","mv","myFront","myTurbulence","n","nAgglomerationProcs","nAlphaCorr","nAlphaSubCycles","nBin","nBins","nBufferCellsNoExtrude","nBufferLayers","nCells","nCellsBetweenLevels","nCellsInCoarsestLevel","nCorr","nCorrectors","nDownstreamBins","nEquivalentParticles","nFacesInCoarsestLevel","nFeatureSnapIter","nGramSchmidt","nGrow","nHeaderLine","nIterStartUp","nIters","nLayerIter","nLayers","nLimiterIter","nLocations","nModes","nNonOrthogonalCorrectors","nOuterCorrectors","nPaddle","nParticle","nPoints","nRadial","nRelaxIter","nRelaxedIter","nSmooth","nSmoothNormals","nSmoothPatch","nSmoothScale","nSmoothSurfaceNormals","nSmoothThickness","nSolveIter","nStepsToStartTimeChange","nSubCycle","nSurfaceLayers","nSweeps","nTheta","nWindow","nWriteStep","name","name1","nameN","nameVsBinWidth","names","nanValue","nanoNozzle","nearCellValue","nearWallAlignedDist","nearWallFields","nearestPatchFace","nearestPoints","negY","negative","neighbourPatch","netgenNeutralToFoam","new","newCutBoundary","newFormat","newTimes","nextWrite","nice","no","noB","noBlank","noBnd","noChemistrySolver","noConstant","noFaceFile","noFlipMap","noFunctionObjects","noH","noOrdering","noPatches","noScaling","noSlip","noSync","noTopology","noVTK","noWriteNow","noZero","nodeValues","nohup","noise","noise.C","noiseDict","noiseModel","noiseModels","non","nonNewtonianIcoFoam","nonOrthogonality","nonRotatingPatches","none","nonuniform","noprofile","norc","norm","normBasicSubGrid","normBasicSubGridCoeffs","normBasicSubGridG","normBasicSubGridGCoeffs","norm_U_L1","normal","normalToFace","normalise","normalisedU","normalisedU3","normalize","not","notTest","note","notes","now","np","nproc","nr","nrCoef","nrExp","nrExp2","nu","nu/value","nu0","nuInf","nuTilda","number","numberDensities","numberDensities/Ar","numberDensity","numberOfSubdomains","nut","nut/nu","nutLowReWallFunction","nutUSpaldingWallFunction","nutUWallFunction","nutkWallFunction","o","obj","objOutput","objToVTK","object","objectiveNames","objectives","objectives.objectiveNames","objects","obsFileDir","obsFileNames","observerPositions","obstaclesDict","of","off","offset","offsetMode","offsets","oil","old","omega","omegaWallFunction","on","on/off","onEnd","one","oneD","oneDPolyPatchType","only","op1","open","opencfd_box.stl","opencfd_text.stl","openfoam","openmp","openmpi","operation","opt","optimisation","optimisation.designVariables","optimisation.updateMethod.method","optimisationDict","optimisationDict.alternative","optimisationManager","optional","options","or","order","orientFaceZone","orientationAngles","origin","originOffset","originVec","orthogonal","out","outFile","outer","outerDiameter","outerWall","outerx","outery","outerz","outlet","outlet/fixedValue","outlet/zeroGradient","outlet2","outletInlet","output","outputName","outputTemperature","outputThreshold","outside","outsidePoints","overBuoyantPimpleDyMFoam","overCompressibleInterDyMFoam","overInterDyMFoam","overInterPhaseChangeDyMFoam","overLaplacianDyMFoam","overPimpleDyMFoam","overPotentialFoam","overRhoPimpleDyMFoam","overRhoSimpleFoam","overSimpleFoam","overlapPercent","overset","oversetPatch","overwrite","p","p.Cf","p0","p1","p2","pFace","pFinal","pInf","pMean","pMin","pName","pPa","pRef","pRefCell","pRefCell/pRefValue","pRefValue","pSat","pTotal","pWater","p_rgh","p_rghFinal","pair","pairPotential","pairPotentialSiteIds","panel","panelRegion","parProfiling","paraFoam","parabolicInlet","paraboloid","parallel","parallelCuts","parallelSource","parallelTarget","paraview","parcelBasisType","parcelInjectionProperties","parcelTypeId","parcelsPerInjector","parcelsPerSecond","parser","parser.yy","partial","particleDistribution","particleDose","particleDose1","particleForces","particleTrackDict","particleTrackProperties","particleTracks","patch","patch0","patch1","patch2","patchAgglomeration","patchAgglomeration/viewFactorWall","patchBoundaryLayers","patchCloud","patchCloudSet","patchEdge","patchEdgeSet","patchEdges","patchFaces","patchField","patchInfo","patchInfo.inGroups","patchInfo.type","patchInfo/type","patchInjection","patchInteractionModel","patchInternalField","patchLocal","patchLocalCoeffs","patchLocalCoeffs.patch","patchMap","patchMapMethod","patchN","patchNames","patchProbes","patchSeed","patchSeedSet","patchSummary","patchToFace","patchType","patches","path","pattern","pdf","pdfPlot","pending","perTimeStep","perfect","perfectGas","periodicCubeArgon","periodicCubeWater","periodicRestart","perturb","petsc","pf_film","pgrep","ph_rgh","phase","phaseChangeModel","phaseChangeProperties","phaseChangeTwoPhaseModel","phaseForces","phaseFunctionObjects","phasePhiCompressed","phaseProperties","phaseSystems","phaseThermos","phases","phi","phirb","physicalProperties","pimpleFoam","pimpleFoam/laminar/mixerVesselAMI2D","pisoFoam","pitchAxis","pitzDaily","pkg","plane","planeEquation","planeEquationDict","planeStress","planeTolerance","planeType","platform","plot3dToFoam","plugin","plugins","point","point1","point2","point3","pointAndNormal","pointAndNormalDict","pointAndNormalDict/point","pointDisplacement","pointFile","pointFileCoeffs","pointId","pointInsertionCriteria","pointNoise","pointNoiseCoeffs","pointNoiseCoeffs.nHeaderLine","pointNoiseCoeffs.separator","pointPairDistanceCoeff","pointRemovalCriteria","pointSet","pointSync","pointVectorField","points","pointsDensity","poly","polyDualMesh","polyLine","polyLineSet","polyMesh","polyMeshFiltering","polyMeshFiltering.filterEdges","polyMeshFiltering.meshQualityControls","polynomial","populationBalance","porosity","porosity1","porosityEnabled","porosityModel","porosityProperties","porous","porousBlockage","porousSimpleFoam","porousZone","pos","posY","posYR","position","positionOffset","positionsFile","postChannel","postChannelDict","postOperation","postProcess","postProcessing/bodyCoefficients","postProcessing/bodyForces","postProcessing/cavityProbes","postProcessing/centreline","postProcessing/linearSolvers","postProcessing/midPlane","postProcessing/solverHistory","postProcessing/waterVolume","postProcessingDict","potentialDict","potentialEnergyLimit","potentialFoam","potentialFreeSurfaceDyMFoam","potentialFreeSurfaceFoam","pow","power","powk","pre","preProcessing","precision","preconditioner","prefix","prefixRegion","prefs","preload","preserveBaffles","preserveFaceZones","preservePatches","pressure","pressureHistogram","pressureHistory","pressureInletOutletVelocity","pressureInletVelocity","pressurePa","pressureSummary","pretty","prghPressure","prghTotalPressure","primalSolver","primalSolvers","prime2Mean","primitiveEntry","primitiveShapes","print","printCoeffs","printVertexInfo","printenv","printf","priority","probeLocations","probeNormals","probes","probes.cfg","probesDict","probesFins","probesFins/region","probesFluid","probesFluid/region","proc","procField","procMapMethod","procMatch","processor","processorField","processorField1","processors","profiling","profilingSummary","project","projectName","propeller","propeller.*","propeller/patches","propellerInfo","propellerInfo1","proudmanAcousticPower","proximityFaces","proximityRegions","prune","ps","psi","psil","psiv","pureMixture","pureMovingPhaseModel","pureStaticSolidPhaseModel","purgeWrite","pwd","q","qin","qr","qrRadiation","qrRelaxation","qt","quenchCoef","quenchExp","quenchM","quenchRate1","quenchRate2","query","queue","quick","quiet","r","r/radius","r1","r2","rCut","rMin","rR","radiation","radiationField","radiationModel","radiationModels","radiationProperties","radiative","radiometerProbes","radius","rampTime","rampedTemperature","random","randomAligned.stl","randomPerturbation","randomPerturbationCoeff","randomProcesses","randomProcessesFunctionObjects","randomise","randomiseInitialGrid","range","ranges","ratios","raw","re","reInitialise","react","reactingCloud1","reactingCloud1Properties","reactingCloud1Tracks","reactingEulerHtcModel","reactingFoam","reactingHeterogenousParcelFoam","reactingMultiphaseEulerFoam","reactingParcelFoam","reactingTwoPhaseEulerFoam","read","readFields","readLevel","readOnStart","reader","readline","realizableKE","realpath","rebound","receive","recentre","reconstruct","reconstructPar","reconstructParMesh","rectangularChannel","rectangularDuct","recurse","redistributePar","reduce","refColumn","refDir","refValue","reference","referenceFaceZone","referencePoint","referencePosition","referenceRegion","refineHexMesh","refineInterval","refineMesh","refineMeshDict","refineWallLayer","refinementBox","refinementLevel","refinementParameters","refinementRegions","refinementSurfaces","refresh","region","region0","regionFaIBMProperties","regionProperties","regionSizeDistribution","regionType","regions","regularPoints","regularise","relHumidity","relTol","relative","relativeSizes","relaxation","relaxationCollisionNumber","relaxationEnd","relaxationFactors","relaxationFactors/equations","relaxationFactors/fields","relaxationModel","relaxationStart","remote","removalOrder","remove","remove0DirFields","removeCase","removeFaces","removeLock","removeRegisteredObject","renumber","renumberMesh","renumberMeshDict","renumberMethod","reportTime","resampleSize","resetOnRestart","resetOnStartUp","residual","residualCoeff","residualControl","residualPhaseFraction","residualSlip","residuals","resolutionIndex","resolutionIndexModels","resolveFeatureAngle","restartOnOutput","restartOnRestart","restartPeriod","restartTime","restore0Dir","restrainedHarmonicSpring","restrainedHarmonicSpringCoeffs","result","resultFields","resultTime","returnFlow","reverse","reverseTime","rg","rho","rho/value","rho0","rhoCentralFoam","rhoConst","rhoFlux","rhoInf","rhoInlet","rhoMin","rhoName","rhoPhi","rhoPimpleAdiabaticFoam","rhoPimpleFoam","rhoPorousSimpleFoam","rhoReactingBuoyantFoam","rhoReactingFoam","rhoRef","rhoSimpleFoam","rhoU","rholSat","right","rightSolid","rightwall","rivuletPanel","rm","rmdir","rodas23","rollAxis","rollPitchYaw","root","roots","rotate","rotateFields","rotateMesh","rotatedBoxToCell","rotating","rotatingMotion","rotatingWallVelocity","rotatingZone","rotation","rotationMode","rotor","rotor2DAMI","rpm","rpmCoeffs","rpmCoeffs/rpm","rsync","run","runApplication","runParallel","runTime","runTimeControl","runTimeModifiable","s","s/const","sample","sample.aerofoil","sample.bottomWall","sample.lines","sample1","sampleDict","sampleDisk","sampleDisk.errorOnPointNotFound","sampleFreq","sampleFrequency","sampleGeometry","sampleMode","sampleOnExecute","sampleResolution","sampleScheme","sampleSurfaces","sampledCuttingPlane","sampledCuttingSurface","sampledDistanceSurface","sampledFaceZone","sampledIsoSurface","sampledMeshedSurface","sampledMeshedSurfaceNormal","sampledNone","sampledPatch","sampledPatchInternalField","sampledPlane","sampledSet","sampledSurface","sampledSurfaceDict","sampledThresholdCellFaces","sampling","satisfiedAction","scalar","scalarLevels","scalarSemiImplicitSource","scalarTransport","scalarTransportFoam","scale","scale1","scale2","scaleFactor","scanner","scatterModel","scheduler","schelkin","schemes","schemesField","scientific","scotch","scp","screen","searchableBox","searchableCylinder","searchablePlane","searchableSphere","searchableSurface","searchableSurfaceControl","section","sectionA","sectionB","sectionC","sectionSeparator","sectorCoeffs","sectorCoeffs.point","sed","seedSampleSet","selectCells","selection","selectionMode","self","semiAxis","semiImplicit","semiImplicitSource","sensibleEnthalpy","sensibleInternalEnergy","sensitivityType","sep","separator","serial","set","setAlphaField","setAlphaFieldDict","setConstraintTypes","setExprBoundaryFields","setExprBoundaryFieldsDict","setExprFields","setExprFieldsDict","setFields","setFieldsDict","setFlow","setFormat","setSet","setTimeStep","setTimeStepFunctionObject","setToCell","setToCellZone","setToPointZone","setTrigger","setTurbulenceFields","setTurbulenceFieldsDict","sets","sets/line1","setsToFaceZone","setsToZones","settingA","settingB","settings","sh","sha256sum","shallowWaterAbsorption","shallowWaterFoam","shape","shapeControlFunctions","shapeFI","shapeType","shared","shellProperties","shift1","shift2","shiftedForce","shortEdgeFilter","shortEdgeFilter.edgeAttachedToBoundaryFactor","shortEdgeFilterFactor","shortestPath","shortestPathSet","show","side","sideA","sideB","sideDir","sides","sides/fixedValue","sigfpe","sigma","signed","silent","simple","simpleCoalParcelFoam","simpleCoeffs","simpleCoeffs.n","simpleFoam","simpleFoam/mixerVessel2D","simpleFoam/pitzDaily","simpleGrading","simpleReactingParcelFoam","simpleSprayFoam","simpleSubMesh","simplifiedSiwek","simulationType","sin","sine","single","singleBlock","singleCellMesh","singleDirectionUniformBin","singleMixtureFraction","singleMixtureFractionCoeffs","singlePhaseMixture","singlePhaseMixtureCoeffs","singlePhaseTransportModel","singleProcessorFaceSets","singleRun","siteCharges","siteIds","siteMasses","siteReferencePositions","sixDoFRigidBodyMotion","sizeDistribution","skewness","sky","slave","slavePatch","sleep","slip","slipFeatureAngle","slipWall","sloppyCellZones","smallPoolFire3D","smallResidual","smapToFoam","smoothSolver","smoothSurfaceData","smoother","smoothing","snGrad","snGradSchemes","snGradSchemes/default","snap","snapControls","snapControls.implicitFeatureSnap","snapControls.multiRegionFeatureSnap","snapFeaturePoints","snappyHexMesh","snappyHexMeshDict","snappyHexMeshDriver","snappyRefineMesh","so","sol","solid","solid/T","solidBlock","solidBody","solidBodyMotionFunction","solidDisplacementFoam","solidEquilibriumDisplacementFoam","solidFoam","solidMelting2D","solidPhase","solids","solution","solution.active","solution.cellValueSourceCorrection","solution.integrationSchemes","solution.interpolationSchemes","solution.sourceTerms.schemes","solution/active","solutionControls","solveOscillationEq","solver","solverFreq","solverFunctionObjects","solverInfo","solverInfo.cfg","solver_pid","solvers","solvers.p.solver","something","sonicDyMFoam","sonicFoam","sonicLiquidFoam","sootModel","sort","sortCoupledFaceCells","sortLimiter","source","sourceCase","sourceDecomposeParDict","sourceFaceZones","sourceInfo","sourceInlet","sourceOutlet","sourcePatches","sourceRegion","sourceTerms","sourceTime","span","spanBox","spanScale","spawn","spdp","specialiseFeaturePoints","specie","species","specific","specified","speed","sphere","sphereDrag","sphereSurfactantFoam","sphereToCell","splashPanel","spline","split","splitAllFaces","splitCells","splitMesh","splitMeshRegions","splitNonManifold","sprayCloud","sprayCloudProperties","sprayDyMFoam","sprayFoam","spread","springCoeffs","springCoeffs.maxCo","springCoeffs/maxCo","springConstant","src","srcDoc","ssh","stabilityBlendingFactor","standard","standardWallInteraction","standardWallInteractionCoeffs","standardWallInteractionCoeffs.type","star4ToFoam","starToFoam","start","startFrom","startIter","startPoint","startTime","starting","stat","static","staticCoeff","staticFvMesh","stationary","stationaryWall","statistics","stator","statusDone","steadyOptimisation","steadyParticleTracks","steadyState","steepestDescent","steps","stitchMesh","stitchMeshDict","stochasticCollisionModel","stochasticDispersionRAS","stopAfterDuration","stopAt","stopWhenBoth","store","streamFunction","streamLine","streamlines","stressAnalysis/solidDisplacementFoam/plateHole","stressAnalysis/solidEquilibriumDisplacementFoam/beamEndLoad","strict","strictRegionSnap","stride","strike","string","strip","strokeWidth","structured","structuredCoeffs","structuredCoeffs.patches","style","subDict","subGridSchelkin","subModels","subModels.injectionModels","subRegion","subSonic","subdir","subset","subsetDict","subsetFeatures","subsetMesh","substitutions","subtract","such","sudo","sum","sumDirection","supersonicCorner","surf1Baffle","surf2Baffle","surface","surface1","surfaceA","surfaceAdd","surfaceAndDirection","surfaceBooleanFeatures","surfaceCellSizeCoeff","surfaceCellSizeFunction","surfaceCheck","surfaceClean","surfaceCoarsen","surfaceConformation","surfaceConformation.conformationControls.edgeSearchDistCoeff","surfaceConformation.conformationControls.maxIterations","surfaceConformation.conformationControls.surfacePtExclusionDistanceCoeff","surfaceConformation.featurePointControls.snapFeaturePoints","surfaceConformation.featurePointControls.specialiseFeaturePoints","surfaceConformation.featurePointExclusionDistanceCoeff","surfaceConformation.geometryToConformTo","surfaceConformation.insertSurfaceNearestPointPairs","surfaceConformation.maxBoundaryConformingIter","surfaceConformation.maxQuadAngle","surfaceConformation.minEdgeLenCoeff","surfaceConformation.pointPairDistanceCoeff","surfaceConformation.randomiseInitialGrid","surfaceConformation.surfaceSearchDistanceCoeff","surfaceConformationRebuildFrequency","surfaceConvert","surfaceCut","surfaceDistance","surfaceFeatureConvert","surfaceFeatureExtract","surfaceFeatureExtractDict","surfaceFieldValue","surfaceFieldValue1","surfaceFields","surfaceFile","surfaceFilmModel","surfaceFilmProperties","surfaceFind","surfaceFormat","surfaceHookUp","surfaceInertia","surfaceInflate","surfaceInterpolate","surfaceLambdaMuSmooth","surfaceMeshConvert","surfaceMeshExport","surfaceMeshExtract","surfaceMeshImport","surfaceMeshInfo","surfaceMeshTriangulate","surfaceN","surfaceName","surfaceNoise","surfaceNoiseCoeffs","surfaceNoiseCoeffs.commsType","surfaceNoiseCoeffs.fftWriteInterval","surfaceNoiseCoeffs.reader","surfaceOffsetCoeff","surfaceOffsetLinearDistance","surfaceOffsetLinearDistanceCoeffs","surfaceOffsetLinearDistanceCoeffs.surfaceOffsetCoeff","surfaceOrient","surfacePatch","surfacePointMerge","surfacePoints","surfacePtExclusionDistanceCoeff","surfacePtReplaceDistCoeff","surfaceReactionModel","surfaceRedistributePar","surfaceRefineRedGreen","surfaceSampleResolution","surfaceScalarField","surfaceSearchDistanceCoeff","surfaceSimplify","surfaceSplitByPatch","surfaceSplitByTopology","surfaceSplitNonManifolds","surfaceSubset","surfaceTension","surfaceToCell","surfaceToPatch","surfaceToPoint","surfaceTransformPoints","surfaceType","surfaceWriter","surfaces","surfaces/type","surfactantFoam","sutherland","sweeps","swirlFlowRateInletVelocity","switch","switchCo","switchFaceWeight","switchGradCc","switchNonOrtho","switchResiduals","switchSkewness","symGaussSeidel","symmetric","symmetry","symmetryPlane","syncObjects","sys","system","system/PDRMeshDict","system/PDRblockMeshDict","system/PDRsetFieldsDict","system/blockMeshDict","system/caseProperties","system/changeDictionaryDict","system/collapseDict","system/controlDict","system/controlDict/functions","system/createBafflesDict","system/createPatchDict","system/decomposeParDict","system/decomposeParDict.*","system/dsmcInitialiseDict","system/extrude2DMeshDict","system/extrudeMeshDict","system/extrudeToRegionMeshDict","system/faceSetDict","system/foamDataToFluentDict","system/foamyHexMeshDict","system/foamyQuadMeshDict","system/fvOptions","system/fvSchemes","system/fvSolution","system/mapFieldsDict","system/mdEquilibrationDict","system/mdInitialiseDict","system/meshDict","system/meshQualityDict","system/mirrorMeshDict","system/noiseDict","system/optimisationDict","system/postProcessingDict","system/potentialDict","system/probesDict","system/refineMeshDict","system/renumberMeshDict","system/sampleDict","system/setAlphaFieldDict","system/setExprBoundaryFieldsDict","system/setExprFieldsDict","system/setFieldsDict","system/setTurbulenceFieldsDict","system/snappyHexMeshDict","system/stitchMeshDict","system/surfaceFeatureExtractDict","system/topoSetDict","systemCall","t","t0","t1","t2","tStartAvg","table","tableFile","tag","tagField","tail","tan1","tan2","tangentialVelocity","tar","target","targetDecomposeParDict","targetRegion","targetTemperature","tcl","tee","tempK","temperature","template","templateDir","temporalInterpolate","temporaryGradient","temporarySpeed","terrain","test","testbin","tetgenToFoam","tether","tetherPotential","tetherSiteIds","tgz","the","thermal","thermalCoupled","thermalCoupledWalls","thermalProperties","thermalStress","thermalWalls","thermo","thermo:mu","thermoCoupleProbes","thermoFoam","thermoSingleLayer","thermoSingleLayerCoeffs","thermoType","thermocapillary","thermodynamicProperties","thermophysicalProperties","theta0","thetaA","thetaInner","thetaOuter","thetaR","thickness","thicknessLayers","thicknessRatio","third","this","threads","threePointCut","threshold","thresholdCellFaces","throttle","time","timeActivatedFileUpdate","timeAndTrigger","timeChecks","timeControl","timeControlFunctionObject","timeEnd","timeFormat","timeInfo","timeOrTrigger","timeOut","timePrecision","timeStart","timeStep","timeVaryingMappedFixedValue","timeVsFile","title","tmp","tmpdir","tmux","to","token","tol","tolerance","toleranceDict","tool","top","topAir","topOSource","topWall","topo","topoSet","topoSetDict","topoSetSources","topology","total","totalDistanceCoeff","totalIter","totalPressure","totalTemperature","totalTime","touch","tr","tracer0","tracerCloud","trackForward","trackLength","trailingspace","transform","transformPoints","transient","translate","translatingWallVelocity","transport","transportCoeffs","transportFourEqsCoeffs","transportModel","transportModels","transportOneEqObsCoeffs","transportProperties","transportProperties/drag","transportThreeEqsCoeffs","transportTwoEqsCoeffs","transportXp","tree","tri","triSurface","triSurfaceMesh","triSurfaceMeshPointSet","trial1","trial2","triangulate","trigger","triggerEnd","triggerStart","trim","trimFeatures","true","true/false","turbulence","turbulenceFields","turbulenceModelSchemes","turbulenceProperties","turbulentDFSEMInlet","turbulentIntensityKineticEnergyInlet","turbulentMixingLengthDissipationRateInlet","turbulentMixingLengthFrequencyInlet","turbulentTemperatureCoupledBaffleMixed","tut","tutorial","tutorials","twoLiquidMixingFoam","twoPhaseEulerFoam","twoPhaseProperties","type","typeIdList","u","uMean","uPrimeCoef","uRef","uTheta","uapp","ufoam","umask","uncorrected","uncoupledKinematicParcelDyMFoam","uncoupledKinematicParcelFoam","undefined","unequalBinWidth","uniform","uniformBin","uniformCoeffs","uniformDimensionedVectorField","uniformDistribution","uniformFixedValue","uniformSet","uniformValue","uniformValueCoeffs","uniq","unit_cube.stl","unrefineLevel","unset","unzip","update","updateBCs","updateMethod","upper","upperLimit","upperRefineLevel","upperSurfaceModels","upperSurfaceModels.heatTransferModel","upperWall","upwind","useFaceZones","useHexTopology","useNamePrefix","usePierceTest","useReferenceValues","useSet","useTopologicalSnapDetection","useUserTime","useWallFunction","user","userCoeffs","userValue","usol","usr/lib/openfoam/openfoam2512/etc/bashrc","util","utilityFunctionObjects","uutil","v","v1","v2","v2512","v_CPU","v_MRF","v_fins","val","valgrind","value","valueAverage","valueOutput","values","vanLeer","vapour","vapour.gas","variable","variables","variance","vector","vectorA","vectorB","vectorField","vectorSemiImplicitSource","velocity","velocityHistory","velocitySummary","verbose","version","versions","vertices","viewFactor","viewFactorHeatFlux","viewFactorWall","viewFactorsDict","viewFactorsGen","viscousDissipation","visual","vofToLagrangian","volAverage","volFieldValue","volIntegrate","volScalarField","volScalarFieldValue","volSymmTensorField","volVectorField","volVectorFieldValue","volatileData","volume","volumeMode","volumeType","volumeUpdateMethod","volumetricBSplines","volumetricFlowRate","vorticity","vorticity1","vscode","vtk","vtkCloud","vtkUnstructuredToFoam","vtkWrite","vtp","vtu","w","wait","waitInterval","wall","wall/fixedValue","wall/zeroGradient","wallA","wallB","wallBoundedParticleTracks","wallBoundedStreamLine","wallData","wallDist","wallDist.method","wallDist/method","wallFaces","wallFilmFaces","wallFilmRegion","wallFunction","wallFunctionTable","wallHTC","wallHeatFlux","wallHeatTransfer","wallPatch","wallPatchName","wallShearStress","wallShearStressMean","wall_4","walls","walls/compressible","walls/fixedFluxPressure","walls/kqRWallFunction","walls/zeroGradient","warn","water","water2","waterInterface","water_to_solid","waveAngle","waveHeight","waveLength","waveModel","wavePeriod","waveProperties","waveTransmissive","wavesProperties","wc","wclean","wcleanLnIncludeAll","wcleanObjects","wdep","webm","wedge","wedge15Ma5","weight","weightField","weightFields","weightedAverage","weightedVolAverage","wget","which","while","width","windPowerDensity","window","windowFieldNames","windowModel","windowName","windowTimes","windowType","windshield","wing","with","withFunctionObjects","withZero","wmDP","wmInt32","wmInt64","wmRefresh","wmSP","wmSPDP","wmSchedOff","wmSchedOn","wmSet","wmUnset","wmake","wmakeCollect","wmakeFilesAndOptions","wmakeLnInclude","wmakeLnIncludeAll","wmakeWindowsDlOpenLibs","word","wordList","wordRes","workflowDict","world","wrap","write","writeAllFields","writeAllSurfaceFields","writeArea","writeBackgroundMeshDecomposition","writeCalls","writeCellCentres","writeCellShapeControlMesh","writeCellVolumes","writeChecks","writeCompression","writeControl","writeCyclicMatch","writeDerivedFields","writeDictionary","writeF","writeFacesAgglomeration","writeFields","writeFlags","writeFormat","writeIds","writeInterval","writeMaps","writeMesh","writeMeshObj","writeMomentum","writeMorpherCPs","writeNow","writeOBJ","writeObj","writeObjects","writeOctaves","writeOption","writeOptions","writeOptions.ensight.collateTimes","writeOptions.writePrmsf","writePSD","writePSDf","writePatchViewFactors","writePhi","writePosition","writePrecision","writePrmsf","writePropellerPerformance","writeResidualFields","writeSPL","writeSets","writeTables","writeTetDualMesh","writeTime","writeToFile","writeTurbulenceFields","writeVelocity","writeViewFactorMatrix","writeVolume","writeWakeFields","writeZones","writep","writephi","writer","wrmdep","wrmo","x","x.stl","xLabel","xMax","xMin","xargs","xbyc0.65","xbyc0.66","xbyc0.68","xbyc0.73","xbyc0.79","xbyc0.80","xbyc0.84","xbyc0.90","xbyc0.95","xbyc1.00","xbyc1.10","xbyc1.20","xbyc1.30","xlabel","xlog","xml","xrange","xvalgrind","xxx","xxx.H","xyz","xz","y","y0","yDot0","yLabel","yMax","yMin","yPlus","yawAxis","yawPitchRoll","ybl","yes","yes/no","ylabel","yrange","z","zHeadMin","zNormal","zNormal/cuttingPlane","zeroDimensionalMesh","zeroGradient","zip","zipUpMesh","zoltanCoeffs","zoltanCoeffs.ORDER_METHOD","zone","zone/set/value","zoneA","zoneB","zoneID","zoneName","zoneToCell","zones","zstd"];if(typeof module==='object'&&module.exports)module.exports=terms;else root.FoamInlineTerms=terms;})(typeof window==='object'?window:globalThis);

;
/* inline-code.js */
/* Shared by static articles and the live CMS renderer. */
(function(root){
 'use strict';
 const terms=new Set(typeof module==='object'&&module.exports?require('./inline-terms.js'):root.FoamInlineTerms||[]);
 const skip='a,code,pre,kbd,script,style,textarea,button,h1,h2,h3,h4,h5,h6,svg,math,.katex,.math-formula,.tex-source,[data-foam-math]';
 const prose='p,td,th,li,dd,dt,figcaption,summary';
 // Ambiguous unit symbols use ordinary prose; explicit code and parameter cells
 // still identify a configuration entry with the same spelling.
 const units=new Set(['m','s','ms','kg','g','mm','cm','km','K','N','Pa','kPa','MPa','W','kW','Hz','kHz','MHz','rad','rpm','deg','mol','J','kJ']);
 // Accented Latin letters and combining marks remain part of a word, so a
 // field such as P must not be extracted from Péclet. Chinese prose can still
 // sit directly beside an OpenFOAM keyword without surrounding spaces.
 const wordBoundary=/[\w@.\/\-\u2010-\u2015\p{Script=Latin}\p{M}]/u;
 function parts(text,parameter=false){
  const result=[];let offset=0;
  const pattern=/\$[A-Za-z_][\w]*(?:\/[\w.*-]+)*|--?[A-Za-z][\w-]*|[A-Za-z_][\w]*(?:(?:[.:/]|::)[\w*]+)*/g;
  for(const match of text.matchAll(pattern)){
   const token=match[0],before=text[match.index-1]||'',after=text[match.index+token.length]||'';
   if(wordBoundary.test(before)||wordBoundary.test(after))continue;
   if(!parameter&&units.has(token))continue;
   if(!parameter&&!terms.has(token)&&!/^\$|^--?[A-Za-z]|^(?:system|constant)\//.test(token))continue;
   if(match.index>offset)result.push({text:text.slice(offset,match.index),code:false});
   result.push({text:token,code:true});offset=match.index+token.length;
  }
  if(offset<text.length)result.push({text:text.slice(offset),code:false});
  return result;
 }
 function isParameterHeader(header){return /^(?:参数(?:或结构)?|选项|命令(?:或函数)?|函数|别名|名称|词缀|写法|修正方式|字段|条目|变量|属性|关键字|键|值|取值|类型|边界条件(?:类型)?|边界类型|场|字典|求解器|壁面函数|插值格式|预处理\/光顺器|模型(?:或功能)?|class|type|method)$/.test(String(header||'').trim());}
 function parameterCell(cell){return !!cell&&cell.cellIndex===0&&isParameterHeader(cell.closest('table')?.querySelector('tr')?.cells[0]?.textContent);}
 function decorate(holder){
  const nodes=[],walker=document.createTreeWalker(holder,NodeFilter.SHOW_TEXT);
  while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){const parent=node.parentElement;if(!parent||parent.closest(skip)||!parent.closest(prose))continue;
   const split=parts(node.textContent,parameterCell(parent.closest('td')));if(!split.some(p=>p.code))continue;
   const fragment=document.createDocumentFragment();for(const part of split){const el=part.code?document.createElement('code'):document.createTextNode(part.text);if(part.code)el.textContent=part.text;fragment.append(el);}node.replaceWith(fragment);
  }
 }
 const api={parts,decorate,isParameterHeader,skip,prose};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.FoamInlineCode=api;
})(typeof window==='object'?window:globalThis);

;
/* math-source.js */
/* Keep formula delimiters intact before Markdown interprets their contents. */
(function(root){
 'use strict';
 // A comparison may contain angle brackets, but a formula cannot cross an
 // HTML closing tag into the next cell or paragraph (for example shell $?).
 const source=/(`{3,}|~{3,})[^\n]*\n[\s\S]*?\1|`+[^`]*`+|<pre\b[^>]*>[\s\S]*?<\/pre>|<code\b[^>]*>[\s\S]*?<\/code>|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|(?<![\\\w])\$(?=\()(?:(?!<\/[A-Za-z])[^$\n"\u3400-\u9fff])+?(?<!\s)\$(?!\w)|(?<![\\\w])\$(?![\s{(])(?:(?!<\/[A-Za-z]|<[A-Za-z][^<>$\n]*=)[^$\n])+?(?<!\s)\$(?!\w)/g;
 const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
 function decode(tex){
  return tex.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(whole,key)=>{
   if(key[0]!=='#')return entities[key.toLowerCase()]||whole;
   const point=key[1].toLowerCase()==='x'?parseInt(key.slice(2),16):Number(key.slice(1));
   return point>0&&point<=0x10ffff&&!(point>=0xd800&&point<=0xdfff)?String.fromCodePoint(point):whole;
  });
 }
 function transform(markdown,render){
  markdown=String(markdown||'').replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi,part=>part.replace(/\r?\n/g,'&#10;'));
  return markdown.replace(source,part=>{
   if(/^(?:`|~|<pre|<code)/.test(part))return part;
   const display=part.startsWith('\\[')||part.startsWith('$$'),n=part.startsWith('$')&&!display?1:2;
   return render({tex:decode(part.slice(n,-n)),display});
  });
 }
 const api={transform};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.FoamMathSource=api;
})(typeof window==='object'?window:globalThis);

;
/* math-loader.js */
'use strict';
(() => {
 const source=document.querySelector('script[data-math-runtime]')?.dataset.mathRuntime;
 let pending=null,watcher=null;
 function ready(){
  if(window.katex)return Promise.resolve();
  if(pending)return pending;
  pending=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src=source||'/assets/runtime-math.js';script.async=true;
   const timer=setTimeout(()=>fail(),15000);
   function fail(){clearTimeout(timer);script.remove();pending=null;reject(Error('公式组件暂时无法加载，请重试。'));}
   script.onerror=fail;script.onload=()=>{if(!window.katex)return fail();clearTimeout(timer);resolve();};
   document.head.append(script);
  });
  return pending;
 }
 function render(element,tex,display){
  element.classList.remove('math-pending');for(const name of ['data-math-display','title','role','tabindex'])element.removeAttribute(name);
  try{window.katex.render(tex,element,{displayMode:display,throwOnError:true,trust:false,maxExpand:1000});}
  catch{element.className='math-error';element.textContent=tex;}
 }
 function flush(){
  if(!window.katex)return;
  for(const element of document.querySelectorAll('.math-pending'))render(element,element.textContent,element.dataset.mathDisplay==='true');
 }
 function observe(){
  if(watcher)return;
  watcher=new MutationObserver(records=>{
   if(!window.katex)return;
   for(const record of records)for(const node of record.addedNodes){
    if(node.nodeType!==1)continue;
    const elements=node.matches('.math-pending')?[node]:node.querySelectorAll('.math-pending');
    for(const element of elements)render(element,element.textContent,element.dataset.mathDisplay==='true');
   }
  });watcher.observe(document.body,{childList:true,subtree:true});
 }
 function enhance(){
  // Previews retain the synchronous Markdown API. Render their formula nodes
  // after the returned markup is inserted; plain-text pages need no KaTeX.
  observe();ready().then(flush).catch(()=>{
   for(const element of document.querySelectorAll('.math-pending')){
    element.title='公式组件暂时无法加载，点击重试';element.setAttribute('role','button');element.tabIndex=0;
   }
  });
 }
 document.addEventListener('click',e=>{if(e.target.closest('.math-pending'))enhance();});
 document.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.matches('.math-pending')){e.preventDefault();enhance();}});
 window.FoamMathRenderer={ready,render,enhance};
 // Start the small independent request alongside authentication and the body
 // read, without holding up directory initialization or other page controls.
 if(document.querySelector('#live-article,.article[data-cms-slug]:not([data-cms-slug=""])'))void ready().catch(()=>{});
})();

;
/* foam-format.js */
/* Shared by the static renderer and live articles. Only dictionary whitespace
 * is changed; strings, directives and embedded source remain opaque tokens. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FoamDictionaryFormat=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const languages=new Set(['foam','openfoam','dict']);
 function tokens(source){
  const result=[];let i=0,gap='';
  function quoted(start){const quote=source[start];let end=start+1;while(end<source.length){if(source[end]==='\\'){end+=2;continue;}if(source[end++]===quote)break;}return end;}
  function balanced(start,open,close){let end=start,depth=0;while(end<source.length){if(source[end]==='"'||source[end]==="'"){end=quoted(end);continue;}if(source.startsWith('//',end)){const n=source.indexOf('\n',end);end=n<0?source.length:n;continue;}if(source.startsWith('/*',end)){const n=source.indexOf('*/',end+2);end=n<0?source.length:n+2;continue;}if(source[end]===open)depth++;if(source[end++]===close&&!--depth)return end;}return end;}
  while(i<source.length){
   if(/\s/.test(source[i])){gap+=source[i++];continue;}
   const start=i;let type='word';
   if(source.startsWith('//',i)){const n=source.indexOf('\n',i);i=n<0?source.length:n;type='line-comment';}
   else if(source.startsWith('/*',i)){const n=source.indexOf('*/',i+2);i=n<0?source.length:n+2;type='comment';}
   else if(source.startsWith('#{',i)){const n=source.indexOf('#}',i+2);i=n<0?source.length:n+2;type='verbatim';}
   else if(source[i]==='"'||source[i]==="'"){i=quoted(i);}
   else if(source.startsWith('${',i)){i=balanced(i+1,'{','}');}
   else if(source[i]==='['){i=balanced(i,'[',']');}
   else if(/^#(?:eval|calc)\s*\{/.test(source.slice(i))){const n=source.indexOf('{',i);i=balanced(n,'{','}');}
   else if(/^#(?:include\w*|inputMode|remove)\b/.test(source.slice(i))){const n=source.indexOf('\n',i);i=n<0?source.length:n;type='directive';}
   else if('{}();'.includes(source[i])){type=source[i++];}
   else {while(i<source.length&&!/[\s{}();\[\]]/.test(source[i]))i++;
    // Function-style scheme keys and expressions, e.g. div(phi,U), are words.
    if(i>start&&source[i]==='('&&/^[A-Za-z_$][\w.$]*$/.test(source.slice(start,i)))i=balanced(i,'(',')');
    if(i===start)i++;
   }
   result.push({text:source.slice(start,i),type,gap,start,end:i});gap='';
  }
  return result;
 }
 function isDictionary(source,language){
  const lang=String(language||'').toLowerCase();if(languages.has(lang))return true;
  if(lang&&!['text','plaintext','txt','cpp','c++'].includes(lang))return false;
  if(/\b(?:fvm::|fvc::|forAll\s*\(|std::|int\s+main|const\s+(?:scalar|vector))|#include\s*[<"]/.test(source))return false;
  return /\b(?:FoamFile|boundaryField|internalField|ddtSchemes)\b/.test(source)||/\b(?:transportModel|simulationType|nCorrectors|convertToMeters)\s+[^;\n]+;/.test(source)||/\btype\s+\w+\s*;/.test(source)&&/[{}]/.test(source);
 }
 function format(source,language){
  source=String(source);if(!isDictionary(source,language))return source;
  const ts=tokens(source),stack=[];
  for(let i=0;i<ts.length;i++){
   if(ts[i].type==='(')stack.push(i);
   else if(ts[i].type===')'&&stack.length){const start=stack.pop(),inner=ts.slice(start+1,i);ts[start].close=i;
    ts[start].multiline=inner.some(t=>['{','(','line-comment','directive'].includes(t.type))||inner.some(t=>t.gap.includes('\n'));
   }
  }
  const lines=[];let line='',depth=0;const groups=[];
  function flush(){if(line.trim()){lines.push('    '.repeat(Math.max(0,depth))+line.trimEnd());line='';}}
  function append(text,space=true){if(line&&space&&!/\s$/.test(line))line+=' ';line+=text;}
  for(let i=0;i<ts.length;i++){
   const t=ts[i],next=ts[i+1];
   if(t.type==='('&&!t.multiline&&t.close!==undefined){
    if(groups.at(-1)==='('&&/^\(/.test(line))flush();
    append(source.slice(t.start,ts[t.close].end).replace(/\s*\n\s*/g,' '),!!t.gap);i=t.close;continue;
   }
   if(t.type==='{'){flush();append('{');flush();depth++;groups.push('{');}
   else if(t.type==='}'){flush();if(groups.at(-1)==='{')groups.pop();depth=Math.max(0,depth-1);append('}');if(next?.type!==';')flush();}
   else if(t.type==='('){flush();append('(');flush();depth++;groups.push('(');}
   else if(t.type===')'){flush();if(groups.at(-1)==='(')groups.pop();depth=Math.max(0,depth-1);append(')');if(next?.type!==';')flush();}
   else if(t.type===';'){append(';',false);if(!(next&&['line-comment','comment'].includes(next.type)&&!next.gap.includes('\n')))flush();}
   else if(t.type==='line-comment'){if(t.gap.includes('\n'))flush();append(t.text);flush();}
   else if(t.type==='directive'){flush();append(t.text);flush();}
   else if(t.type==='comment'||t.type==='verbatim'){
    if(t.gap.includes('\n'))flush();append(t.text);if(t.type==='comment'&&(ts[i-1]?.type===';'||t.text.includes('\n')||next?.gap.includes('\n')))flush();
   }
   else {
    if(t.gap.includes('\n'))flush();
    // Multiple blockMesh hex entries are separate list items.
    if(groups.at(-1)==='('&&t.text==='hex'&&/^hex\b/.test(line))flush();
    append(t.text,!!t.gap);
   }
  }
  flush();return lines.join('\n')+(/\r?\n$/.test(source)?'\n':'');
 }
 return {format,isDictionary,tokens};
});

;
/* community-replies.js */
'use strict';
(() => {
 const mounts=new WeakMap();
 async function mount(host,parent,canReply=true){
  mounts.get(host)?.();
  const lab=window.FoamLab,{esc}=lab,[key,id]=Object.entries(parent)[0];
  host.querySelectorAll('.lab-message-list,.lab-reply-form,.lab-message-more').forEach(n=>n.remove());
  const list=document.createElement('div');list.className='lab-message-list';host.append(list);
  const more=document.createElement('button');more.type='button';more.className='button secondary lab-message-more';more.textContent='加载更多回复';more.hidden=true;host.append(more);
  const form=document.createElement('form');form.className='lab-reply-form';
  const allowed=canReply&&lab.role!=='blocked';
  const owns=row=>!!lab.user&&lab.role!=='blocked'&&row.author_id===lab.user.id;
  const canDelete=row=>!!lab.user&&(owns(row)||['admin','editor','moderator'].includes(lab.role));
  form.innerHTML=lab.role==='blocked'?'<p class="lab-evidence">此账号的发言权限已停用，仍可阅读公开讨论。</p>':!canReply?'<p class="lab-evidence">此讨论已关闭回复。</p>':!lab.user?'<p>使用 GitHub 账号登录后，可以发表评论和回答问题。</p><button type="button" class="button secondary" data-lab-login>使用 GitHub 登录</button>':'<div class="reply-composer-target" hidden><div><strong data-reply-recipient></strong><p data-reply-excerpt></p></div><button type="button" class="text-button" data-cancel-reply>取消回复</button></div><label class="form-field"><span>公开回复 · 支持 Markdown、TeX 和代码块</span><textarea name="body" rows="6" minlength="2" maxlength="30000" required placeholder="写下你的回复…"></textarea></label><div class="admin-actions"><button class="button" type="submit">发布回复</button><button type="button" class="button secondary" data-preview-reply>预览</button></div><div class="prose lab-preview" hidden></div><p class="form-status" role="status"></p>';
  host.append(form);
  const PAGE_SIZE=5,ROOT_BATCH=200;
  let names={},replyTarget=null,live=true,renderVersion=0,rootLimit=ROOT_BATCH;
  const records=new Map(),index=new Map(),parents=new Map(),threadRoots=new Map(),children=new Map(),threadStates=new Map();let roots=[];
  const outbox=new Map();let activeSend=null,profileSync=null;
  const findRow=id=>records.get(id);
  const state=id=>{if(!threadStates.has(id))threadStates.set(id,{expanded:true,page:0});return threadStates.get(id);};
  function rebuildTree(){
   const ordered=[...index.values()].sort((a,b)=>a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id));
   parents.clear();threadRoots.clear();children.clear();roots=[];
   for(const row of ordered)parents.set(row.id,index.has(row.reply_to_id)&&row.reply_to_id!==row.id?row.reply_to_id:null);
   // Break malformed cycles once, keeping every comment reachable.
   const done=new Set();for(const row of ordered){let cursor=row.id;const path=new Set();while(cursor&&!done.has(cursor)){if(path.has(cursor)){parents.set(cursor,null);break;}path.add(cursor);cursor=parents.get(cursor);}for(const id of path)done.add(id);}
   for(const row of ordered){let cursor=row.id;const path=[];while(!threadRoots.has(cursor)&&parents.get(cursor)){path.push(cursor);cursor=parents.get(cursor);}const root=threadRoots.get(cursor)||cursor;threadRoots.set(cursor,root);for(const id of path)threadRoots.set(id,root);if(root===row.id)roots.push(row.id);else{if(!children.has(root))children.set(root,[]);children.get(root).push(row.id);}}
  }
  async function loadIndex(){
   // Only relationship metadata is scanned; full Markdown is fetched for visible pages.
   for(let start=0;live;start+=1000){const page=lab.check(await lab.client.from('foamlab_messages').select('id,reply_to_id,created_at').eq(key,id).eq('status','visible').order('created_at').order('id').range(start,start+999));if(!live)return;for(const row of page)index.set(row.id,row);if(page.length<1000)break;}rebuildTree();
  }
  function visibleIds(){
   const result=[],stack=roots.slice(0,rootLimit).reverse();while(stack.length){const id=stack.pop();result.push(id);const replies=children.get(id)||[],s=state(id);s.page=Math.min(s.page,Math.max(0,Math.ceil(replies.length/PAGE_SIZE)-1));if(s.expanded)stack.push(...replies.slice(s.page*PAGE_SIZE,(s.page+1)*PAGE_SIZE).reverse());}return result;
  }
  function threadControls(id){
   const replies=children.get(id)||[];if(!replies.length)return '';const s=state(id),pages=Math.ceil(replies.length/PAGE_SIZE),target='comment-replies-'+id;
   return '<div class="lab-reply-thread-toolbar"><button type="button" class="text-button lab-reply-toggle" data-toggle-replies="'+esc(id)+'" aria-expanded="'+s.expanded+'" aria-controls="'+esc(target)+'"><span aria-hidden="true">'+(s.expanded?'▾':'▸')+'</span> '+(s.expanded?'收起回复':'展开回复')+' <span class="lab-reply-total">'+replies.length+'</span></button>'+(s.expanded&&pages>1?'<nav class="lab-reply-pager" aria-label="这条评论的回复分页"><button type="button" class="text-button" data-page-replies="'+esc(id)+'" data-page="'+(s.page-1)+'"'+(s.page===0?' disabled':'')+'>上一页</button><span aria-live="polite">'+(s.page+1)+' / '+pages+'</span><button type="button" class="text-button" data-page-replies="'+esc(id)+'" data-page="'+(s.page+1)+'"'+(s.page===pages-1?' disabled':'')+'>下一页</button></nav>':'')+'</div><div id="'+esc(target)+'" class="lab-message-replies" aria-label="这条评论的回复"'+(!s.expanded?' hidden':'')+'></div>';
  }
  function placeComposer(){const card=replyTarget&&document.getElementById('comment-'+replyTarget.id);if(card&&list.contains(card))card.querySelector(':scope > .community-post-actions').after(form);else host.append(form);}
  const snippet=text=>String(text||'').replace(/\s+/g,' ').slice(0,160);
  function messageMarkup(r,delivery=null){
   const target=findRow(r.reply_to_id),quoted=target&&parents.get(target.id);
   const quote=r.reply_to_id?'<div class="reply-context'+(quoted?'':' reply-context-inline')+'"'+(target?' data-quote-id="'+esc(target.id)+'"':'')+'>'+(target?'<a href="#comment-'+esc(target.id)+'">回复 '+esc(names[target.author_id]||'社区成员')+'</a>'+(quoted?'<p>'+esc(snippet(target.body))+'</p>':''):'<span>原评论已不可见</span>')+'</div>':'';
   const pending=delivery&&delivery.status!=='sent';
   const actions=pending?'<span class="reply-delivery-status" role="status">'+(delivery.status==='sending'?'发送中…':'尚未确认发布：'+esc(delivery.error||'请重试'))+'</span>'+(delivery.status==='failed'?'<button type="button" class="text-button" data-retry-message="'+esc(r.id)+'"'+(activeSend?' disabled':'')+'>重试发布</button>':''):lab.likeButton('comment',r.id)+(allowed?'<button type="button" class="text-button" data-reply-message="'+esc(r.id)+'">回复</button>':'')+(owns(r)?'<button type="button" class="text-button" data-edit-message="'+esc(r.id)+'">编辑</button>':'')+(canDelete(r)?'<button type="button" class="text-button danger" data-delete-message="'+esc(r.id)+'">'+(owns(r)?'删除我的回复':'删除回复')+'</button>':'');
   return '<article class="lab-message" id="comment-'+esc(r.id)+'" tabindex="-1" data-message-id="'+esc(r.id)+'" data-author-id="'+esc(r.author_id)+'"'+(pending?' data-delivery="'+delivery.status+'"':'')+'><div class="lab-message-meta community-byline">'+lab.authorMeta(r)+'</div>'+quote+'<div class="prose" data-message-body>'+lab.markdown(r.body)+'</div><div class="community-post-actions">'+actions+'</div>'+threadControls(r.id)+'</article>';
  }
  function paintOutbox(){
   // Local deliveries remain visible under their root even when its older replies are paged/collapsed.
   for(const entry of outbox.values()){
    const existing=list.querySelector('[data-message-id="'+entry.row.id+'"]');
    if(existing&&!existing.hasAttribute('data-delivery')){outbox.delete(entry.row.id);continue;}
    existing?.remove();
    const root=threadRoots.get(entry.row.reply_to_id),card=root&&list.querySelector('[data-message-id="'+root+'"]');let container=list;
    if(card){container=card.querySelector(':scope > .lab-reply-outbox');if(!container){container=document.createElement('div');container.className='lab-message-replies lab-reply-outbox';container.setAttribute('aria-label','刚发布的回复');card.append(container);}}
    else list.querySelector(':scope > .muted')?.remove();
    container.insertAdjacentHTML('beforeend',messageMarkup(entry.row,entry));
   }
   list.querySelectorAll('.lab-reply-outbox:empty').forEach(node=>node.remove());
  }
  async function render(){
   const version=++renderVersion,visible=visibleIds(),needed=[...new Set([...visible,...visible.map(id=>index.get(id)?.reply_to_id).filter(id=>index.has(id))])],missing=needed.filter(id=>!records.has(id));
   for(let start=0;start<missing.length;start+=100){const page=lab.check(await lab.client.from('foamlab_messages').select('*').eq(key,id).eq('status','visible').in('id',missing.slice(start,start+100)));if(!live||version!==renderVersion)return;for(const row of page)records.set(row.id,row);}
   const ordered=visible.map(findRow).filter(Boolean);names=await lab.names(needed.map(findRow).filter(Boolean).map(r=>r.author_id));if(!live||version!==renderVersion)return;
   if(list.contains(form))host.append(form);
   list.innerHTML=ordered.map(r=>messageMarkup(r)).join('')||'<p class="muted">还没有回复，来聊聊你的想法吧。</p>';
   // Nest the existing cards without recursion. Invalid/cyclic references remain readable.
   const cards=new Map([...list.children].filter(n=>n.dataset.messageId).map(n=>[n.dataset.messageId,n]));
   for(const row of ordered){const card=cards.get(row.id),root=threadRoots.get(row.id),parentCard=root!==row.id&&cards.get(root);if(parentCard)parentCard.querySelector(':scope > .lab-message-replies').append(card);}
   paintOutbox();placeComposer();more.hidden=rootLimit>=roots.length;more.textContent='加载更多评论';
   window.dispatchEvent(new Event('foamlab:messages'));
  }
  async function locate(){
   const target=location.hash.match(/^#comment-([a-zA-Z0-9-]+)$/)?.[1];if(!target||!live)return;
   if(!index.has(target))return;
   const root=threadRoots.get(target);if(root!==target){const s=state(root);s.expanded=true;s.page=Math.floor(children.get(root).indexOf(target)/PAGE_SIZE);}
   rootLimit=Math.max(rootLimit,roots.indexOf(root)+1);await render();
   if(!live)return;const node=document.getElementById('comment-'+target);node?.scrollIntoView({block:'center',behavior:'instant'});node?.focus({preventScroll:true});
  }
  const onHash=()=>void locate().catch(()=>{});addEventListener('hashchange',onHash);mounts.set(host,()=>{live=false;removeEventListener('hashchange',onHash);});
  more.onclick=async()=>{more.disabled=true;try{rootLimit+=ROOT_BATCH;await render();}catch(e){window.foamNotify?.(e.message);}finally{more.disabled=false;}};
  list.onclick=async e=>{
   const retry=e.target.closest('[data-retry-message]');if(retry){const entry=outbox.get(retry.dataset.retryMessage);if(entry&&!activeSend)void send(entry);return;}
   const toggle=e.target.closest('[data-toggle-replies]'),page=e.target.closest('[data-page-replies]');
   if(toggle||page){const button=toggle||page;if(button.disabled)return;const id=toggle?.dataset.toggleReplies||page.dataset.pageReplies,s=state(id),before={...s},toolbar=button.closest('.lab-reply-thread-toolbar'),top=toolbar.getBoundingClientRect().top;button.disabled=true;if(toggle)s.expanded=!s.expanded;else s.page=Number(page.dataset.page);try{await render();const next=document.querySelector('[data-toggle-replies="'+id+'"]');if(next){scrollBy({top:next.closest('.lab-reply-thread-toolbar').getBoundingClientRect().top-top,behavior:'instant'});next.focus({preventScroll:true});}}catch(err){Object.assign(s,before);button.disabled=false;window.foamNotify?.(err.message);}return;}
   const edit=e.target.closest('[data-edit-message]');
   if(edit){
    const row=findRow(edit.dataset.editMessage),card=edit.closest('.lab-message');
    if(!row||!owns(row))return;
    if(card.querySelector(':scope > .lab-message-editor')){card.querySelector(':scope > .lab-message-editor textarea').focus();return;}
    const editor=document.createElement('form');editor.className='lab-message-editor';
    editor.innerHTML='<label class="form-field"><span>编辑我的回复 · 支持 Markdown、TeX 和代码块</span><textarea rows="6" minlength="2" maxlength="30000" required aria-label="编辑我的回复"></textarea></label><div class="admin-actions"><button class="button" type="submit">保存修改</button><button type="button" class="button secondary" data-edit-preview>预览</button><button type="button" class="text-button" data-edit-cancel>取消</button></div><div class="prose lab-preview" hidden></div><p class="form-status" role="status"></p>';
    card.querySelector('[data-message-body]').hidden=true;card.querySelector('.community-post-actions').hidden=true;card.querySelector('.community-post-actions').after(editor);
    const input=editor.querySelector('textarea');input.value=row.body;editor.scrollIntoView({block:'nearest',behavior:'instant'});input.focus({preventScroll:true});
    const close=()=>{editor.remove();card.querySelector('[data-message-body]').hidden=false;card.querySelector('.community-post-actions').hidden=false;edit.focus({preventScroll:true});};
    editor.querySelector('[data-edit-cancel]').onclick=close;
    editor.querySelector('[data-edit-preview]').onclick=()=>{const preview=editor.querySelector('.lab-preview');preview.innerHTML=lab.markdown(input.value);preview.hidden=!preview.hidden;};
    editor.onsubmit=async event=>{
     event.preventDefault();const button=editor.querySelector('[type=submit]');if(button.disabled)return;
     button.disabled=true;editor.querySelector('[data-edit-cancel]').disabled=true;
     try{
      const body=input.value.trim();if(body.length<2)throw Error('回复至少需要 2 个有效字符。');
      let query=lab.client.from('foamlab_messages').update({body}).eq('id',row.id).eq('author_id',lab.user.id);
      if(row.updated_at)query=query.eq('updated_at',row.updated_at);
      const saved=lab.check(await query.select('*'));
      if(!saved.length)throw Error('回复已被修改、删除或不可编辑。请保留当前文字，刷新后重试。');
      Object.assign(row,saved[0]);card.querySelector('[data-message-body]').innerHTML=lab.markdown(row.body);close();
      for(const quote of list.querySelectorAll('[data-quote-id]'))if(quote.dataset.quoteId===row.id&&quote.querySelector('p'))quote.querySelector('p').textContent=snippet(row.body);
      if(replyTarget?.id===row.id)form.querySelector('[data-reply-excerpt]').textContent=snippet(row.body);
      window.dispatchEvent(new Event('foamlab:messages'));window.foamNotify?.('回复已更新。');
     }catch(err){editor.querySelector('.form-status').textContent=err.message;}
     finally{button.disabled=false;editor.querySelector('[data-edit-cancel]').disabled=false;}
    };return;
   }
   const reply=e.target.closest('[data-reply-message]');
   if(reply){if(!lab.user){await lab.login();return;}replyTarget=findRow(reply.dataset.replyMessage);if(!replyTarget)return;form.querySelector('[data-reply-recipient]').textContent='回复 '+(names[replyTarget.author_id]||'社区成员');form.querySelector('[data-reply-excerpt]').textContent=snippet(replyTarget.body);form.querySelector('.reply-composer-target').hidden=false;placeComposer();form.scrollIntoView({block:'center',behavior:'instant'});form.elements.body.focus({preventScroll:true});return;}
   const del=e.target.closest('[data-delete-message]');if(!del||del.disabled)return;
   const row=findRow(del.dataset.deleteMessage);if(!row||!canDelete(row)||!confirm('删除这条回复？'))return;
   del.disabled=true;
   try{
    let query=lab.client.from('foamlab_messages').delete().eq('id',row.id);if(row.updated_at)query=query.eq('updated_at',row.updated_at);
    const removed=lab.check(await query.select('id'));if(!removed.length)throw Error('回复状态已变化或当前账号无权删除，请刷新后重试。');
    records.delete(row.id);index.delete(row.id);rebuildTree();
    if(replyTarget?.id===row.id){replyTarget=null;form.querySelector('.reply-composer-target').hidden=true;}
    await render();
    window.dispatchEvent(new Event('foamlab:activity'));window.foamNotify?.('回复已删除。');
   }catch(err){window.foamNotify?.(err.message);del.disabled=false;}
  };
  async function send(entry){
   if(activeSend||!live)return;
   activeSend=entry;entry.status='sending';const button=form.querySelector('[type=submit]'),status=form.querySelector('.form-status');button.disabled=true;status.textContent='发送中…';paintOutbox();
   try{
    if(!allowed||!lab.user||lab.user.id!==entry.row.author_id||lab.role==='blocked')throw Error('当前账号无法发布，请保留文字并重新登录。');
    // Public display-name synchronization is independent of the protected message insert.
    if(!profileSync)profileSync=lab.ensureProfile().catch(()=>{profileSync=null;});
    let posted=null;
    // A previous request may have committed even if its response was lost. Reuse its UUID.
    if(entry.attempted)posted=lab.check(await lab.client.from('foamlab_messages').select('*').eq(key,id).eq('id',entry.row.id).eq('author_id',entry.row.author_id).maybeSingle());
    if(!posted){entry.attempted=true;posted=lab.check(await lab.client.from('foamlab_messages').insert(entry.payload).select('*').single());}
    if(!posted||posted.id!==entry.row.id||posted.status!=='visible')throw Error('回复状态暂时无法确认，请重试。');
    if(!live)return;
    entry.row={...entry.row,...posted};entry.status='sent';records.set(posted.id,entry.row);index.set(posted.id,entry.row);rebuildTree();
    // Do not clear a newer draft or a different reply target while this request was in flight.
    if(form.elements.body.value.trim()===entry.payload.body&&(replyTarget?.id||null)===entry.payload.reply_to_id){form.elements.body.value='';replyTarget=null;form.querySelector('.reply-composer-target').hidden=true;form.querySelector('.lab-preview').hidden=true;placeComposer();}
    paintOutbox();status.textContent='回复已发布。';history.replaceState(history.state,'','#comment-'+posted.id);
    const root=threadRoots.get(posted.id);rootLimit=Math.max(rootLimit,roots.indexOf(root)+1);
    if(root!==posted.id){const s=state(root);s.expanded=true;s.page=Math.floor(children.get(root).indexOf(posted.id)/PAGE_SIZE);}
    // Refresh only the displayed page from cached rows and the insert response; never remount the conversation.
    void render().catch(()=>{if(live)window.foamNotify?.('回复已发布，其他评论暂时未能刷新。');});
    window.dispatchEvent(new Event('foamlab:messages'));window.dispatchEvent(new Event('foamlab:activity'));window.foamNotify?.('回复已发布。');
   }catch(err){if(live){entry.status='failed';entry.error=err.message||'网络异常，请重试';status.textContent=entry.error;}}
   finally{activeSend=null;if(live){button.disabled=false;paintOutbox();}}
  }
  if(lab.user&&allowed){
   form.querySelector('[data-cancel-reply]').onclick=()=>{replyTarget=null;form.querySelector('.reply-composer-target').hidden=true;placeComposer();form.scrollIntoView({block:'nearest',behavior:'instant'});form.elements.body.focus({preventScroll:true});};
   form.querySelector('[data-preview-reply]').onclick=()=>{const preview=form.querySelector('.lab-preview');preview.innerHTML=lab.markdown(form.elements.body.value);preview.hidden=!preview.hidden;};
   form.onsubmit=e=>{e.preventDefault();if(activeSend)return;
    const body=form.elements.body.value.trim(),reply_to_id=replyTarget?.id||null;
    if(body.length<2||body.length>30000){form.querySelector('.form-status').textContent='回复需要 2 至 30000 个有效字符。';return;}
    let entry=[...outbox.values()].find(item=>item.status==='failed'&&item.payload.body===body&&item.payload.reply_to_id===reply_to_id);
    if(!entry){const payload={...parent,id:crypto.randomUUID(),reply_to_id,author_id:lab.user.id,body};entry={payload,row:{...payload,created_at:new Date().toISOString(),author_name:window.foamAuth?.profile?.display_name||lab.user.user_metadata?.user_name||'我'},status:'sending',attempted:false};outbox.set(payload.id,entry);}
    void send(entry);
   };
  }
  await loadIndex();await render();await locate();
 }
 window.FoamReplies={mount};
})();

;
/* resources-hub.js */
'use strict';
// 资料中心：按“读者想做什么”分组展示，替代原先 61 项混排的分页卡片墙。
// 有搜索词时仍回退到原来的卡片列表；目录结构仍由后台的目录树决定。
(() => {
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const H=window.FoamResourcesHub={};
 const svg=p=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>';
 // 每个子目录的入口说明（按目录 key 匹配；后台新增的目录会使用目录名和简介）
 const INFO={
  resource:{ask:'下载算例与源码',when:'编程实例、算例包与使用说明。',icon:svg('<path d="M12 3v12m0 0-5-5m5 5 5-5M4 20h16"/>')},
  recommendation:{ask:'查找文档、工具与文献',when:'官方文档、工具教程、论文、专著与社区资源。',icon:svg('<path d="M10 14 21 3m0 0h-7m7 0v7M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>')}
 };
 const OTHER_ICON=svg('<path d="M4 6h16M4 12h16M4 18h10"/>');
 // 分组顺序：先给入门最常用的，再到进阶与社区
 const TRACK_ORDER=['源码与算例','站点与实践','官方文档','教程与课程','论文与专著','源码与开发','几何网格','可视化与数据','学术社区'];
 const TRACK_NOTE={
  '源码与算例':'编程实例与算例包，附使用说明。',
  '论文与专著':'经典文献原件与章节导读。',
  '站点与实践':'本站资料的出处与版本说明。',
  '官方文档':'版本说明、用户手册与编程接口。',
  '教程与课程':'官方算例库与系统的入门培训资料。',
  '源码与开发':'源码浏览、C++ API 查询与工作流辅助工具。',
  '几何网格':'几何建模与网格生成工具。',
  '可视化与数据':'后处理出图与 Python 数据分析。',
  '学术社区':'论坛、Wiki 与期刊，适合查经验和提问。'
 };
 const SERIES_ORDER=['主题参考手册','配置与命令综述','站点手册'];
 const SERIES_NOTE={
  '主题参考手册':'按主题逐项展开命令、字典与边界条件，遇到具体问题时查这里。',
  '配置与命令综述':'篇幅较短的总览，适合入门后从头读一遍，建立整体印象。'
 };
 const rank=(order,k)=>{const i=order.indexOf(k);return i<0?order.length:i;};
 const groupBy=(rows,key,order)=>{const m=new Map();for(const r of rows){const k=r[key]||'其他';if(!m.has(k))m.set(k,[]);m.get(k).push(r);}return [...m.entries()].sort((a,b)=>rank(order,a[0])-rank(order,b[0]));};
 const url=r=>{const p=r.metadata?.canonical_path;return typeof p==='string'&&p.startsWith('/')&&!p.startsWith('//')?p:'/read/?slug='+encodeURIComponent(r.slug);};
 const files=r=>{try{return window.FoamLab?.courseDownloads?.(r)||[];}catch{return [];}};
 const item=r=>{const n=files(r).length;return '<li><a href="'+esc(url(r))+'"><strong>'+esc(r.title)+'</strong>'+(r.summary?'<span>'+esc(r.summary)+'</span>':'')+'</a>'+(n?'<em class="rh-badge">含 '+n+' 个下载</em>':'')+'</li>';};
 const groups=rows=>'<div class="rh-groups">'+groupBy(rows,'track',TRACK_ORDER).map(([t,list])=>'<div class="rh-group"><h3>'+esc(t)+' <span>'+list.length+'</span></h3>'+(TRACK_NOTE[t]?'<p>'+esc(TRACK_NOTE[t])+'</p>':'')+'<ul class="rh-list">'+list.map(item).join('')+'</ul></div>').join('')+'</div>';
 const manuals=rows=>'<div class="rh-manuals">'+groupBy(rows,'series',SERIES_ORDER).map(([s,list])=>list.length===1
  ?'<a class="rh-single" href="'+esc(url(list[0]))+'"><strong>'+esc(list[0].title)+'</strong><span>'+esc(list[0].summary||'')+'</span></a>'
  :'<details class="rh-manual"><summary><span class="rh-manual-title"><strong>'+esc(s)+'</strong><em>'+list.length+' 章</em></span>'+(SERIES_NOTE[s]?'<small>'+esc(SERIES_NOTE[s])+'</small>':'')+'</summary><ul>'+list.map(r=>'<li><a href="'+esc(url(r))+'">'+esc(r.title)+'</a></li>').join('')+'</ul></details>').join('')+'</div>';
 const body=rows=>rows.length&&rows.every(r=>r.kind==='reference')?manuals(rows):groups(rows);
 const anchor=s=>'rh-'+String(s.key||'other').replace(/[^\w-]/g,'');
 function sectionsFor(rows,D){
  if(D?.available){
   const node=D.current()||D.nodes.find(n=>n.key==='resources');if(!node)return null;
   const kids=D.children(node.id).filter(D.isVisible);if(!kids.length)return null;
   const used=new Set(),out=kids.map(n=>{const ids=new Set(D.descendants(n.id)),list=rows.filter(r=>!used.has(r.id)&&(r.section_ids||[]).some(id=>ids.has(id)));list.forEach(r=>used.add(r.id));return {key:n.key,name:n.name,desc:n.description,url:D.url(n),rows:list};});
   const rest=rows.filter(r=>!used.has(r.id));if(rest.length)out.push({key:'other',name:'其他资料',url:'',rows:rest});
   return out.filter(s=>s.rows.length);
  }
  return [['resource','算例与源码'],['recommendation','资源推荐']].map(([key,name])=>({key,name,url:'/resources/?kind='+key,rows:rows.filter(r=>r.kind===key)})).filter(s=>s.rows.length);
 }
 H.render=({listing,rows,words,filtered,mode,D})=>{
  if(mode!=='resources')return false;
  const wrap=listing.closest('.page-wrap'),pager=listing.nextElementSibling,count=document.querySelector('#catalog-count');
  if(words.length){listing.classList.remove('rh-mode');return false;}
  listing.classList.add('rh-mode');if(pager?.classList.contains('list-pagination'))pager.innerHTML='';
  const sections=filtered?null:sectionsFor(rows,D);
  if(!sections){listing.innerHTML=rows.length?body(rows):'<div class="lab-empty">目前没有符合条件的内容。</div>';if(count)count.textContent=rows.length+' 项内容';return true;}
  // 入口与当前目录树一致。
  wrap?.querySelector('.directory-children')?.remove();
  let guide=wrap?.querySelector('.rh-guide');if(!guide&&wrap){guide=document.createElement('nav');guide.className='rh-guide';guide.setAttribute('aria-label','按需求选择资料类型');wrap.querySelector('.catalog-search')?.before(guide);}
  if(guide)guide.innerHTML=sections.map(s=>{const info=INFO[s.key]||{};return '<a href="#'+anchor(s)+'">'+(info.icon||OTHER_ICON)+'<div><strong>'+esc(info.ask||s.name)+'</strong><span>'+esc(s.name)+' · <em>'+s.rows.length+' 项</em></span></div></a>';}).join('');
  listing.innerHTML=sections.map(s=>{const info=INFO[s.key]||{},isRef=s.rows.every(r=>r.kind==='reference');return '<section class="rh-section" id="'+anchor(s)+'"><header><div><h2>'+esc(s.name)+'</h2><p>'+esc(s.desc||info.when||'')+'</p></div>'+(s.url?'<a href="'+esc(s.url)+'">'+(isRef?'打开参考手册目录':'只看这一类')+' →</a>':'')+'</header>'+body(s.rows)+'</section>';}).join('');
  if(count)count.textContent='共 '+rows.length+' 项资料，分为 '+sections.length+' 类；也可以直接搜索。';
  return true;
 };
})();

;
/* article-aliases.js */
// Generated from the reviewed section consolidation map.
window.foamArticleAliases=Object.freeze({"kolev-2-01-02-02":{"slug":"kolev-2-01-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-2-01-03-01-02":{"slug":"kolev-2-01-03-01-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8","section-4":"section-9"}},"kolev-2-01-03-02-02":{"slug":"kolev-2-01-03-02-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8","section-4":"section-9"}},"kolev-2-01-03-03-02":{"slug":"kolev-2-01-03-03-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8"}},"kolev-2-01-03-03-03":{"slug":"kolev-2-01-03-03-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12","section-3":"section-13","section-4":"section-14","section-5":"section-15"}},"kolev-2-02-01-02-02":{"slug":"kolev-2-02-01-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-02-01-02-03":{"slug":"kolev-2-02-01-02-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-2-02-01-03-02":{"slug":"kolev-2-02-01-03-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8"}},"kolev-2-02-01-05-02-02":{"slug":"kolev-2-02-01-05-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-2-02-01-05-03-02":{"slug":"kolev-2-02-01-05-03-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7","section-2":"section-8"}},"kolev-2-02-01-05-03-03":{"slug":"kolev-2-02-01-05-03-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11"}},"kolev-2-02-01-06-02":{"slug":"kolev-2-02-01-06-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8"}},"kolev-2-02-01-06-03":{"slug":"kolev-2-02-01-06-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12","section-3":"section-13"}},"kolev-2-02-01-06-04":{"slug":"kolev-2-02-01-06-01","hash":"section-14","fragments":{"section-0":"section-15","section-1":"section-16","section-2":"section-17"}},"kolev-2-02-01-06-05":{"slug":"kolev-2-02-01-06-01","hash":"section-18","fragments":{"section-0":"section-19","section-1":"section-20","section-2":"section-21","section-3":"section-22"}},"kolev-2-02-01-08-02":{"slug":"kolev-2-02-01-08-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6"}},"kolev-2-02-01-09-02":{"slug":"kolev-2-02-01-09-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8"}},"kolev-2-02-02-02":{"slug":"kolev-2-02-02-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8"}},"kolev-2-02-02-03":{"slug":"kolev-2-02-02-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12"}},"kolev-2-02-03-02":{"slug":"kolev-2-02-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7","section-4":"section-8"}},"kolev-2-03-02-01-02":{"slug":"kolev-2-03-02-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-03-02-03-02":{"slug":"kolev-2-03-02-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-03-02-04-03":{"slug":"kolev-2-03-02-04-02","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-03-02-05-02":{"slug":"kolev-2-03-02-05-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-2-03-02-06-02":{"slug":"kolev-2-03-02-06-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-03-03-02":{"slug":"kolev-2-03-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-03-03-03":{"slug":"kolev-2-03-03-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9"}},"kolev-2-03-03-04":{"slug":"kolev-2-03-03-01","hash":"section-10","fragments":{"section-0":"section-11","section-1":"section-12","section-2":"section-13"}},"kolev-2-03-04-02":{"slug":"kolev-2-03-04-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-03-05-02":{"slug":"kolev-2-03-05-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5","section-3":"section-6"}},"kolev-2-04-02-01-02":{"slug":"kolev-2-04-02-01-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7"}},"kolev-2-04-02-01-03":{"slug":"kolev-2-04-02-01-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11"}},"kolev-2-04-03-01-02":{"slug":"kolev-2-04-03-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-04-03-01-03":{"slug":"kolev-2-04-03-01-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-2-04-03-02-02":{"slug":"kolev-2-04-03-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5","section-3":"section-6"}},"kolev-2-04-03-03-03-02":{"slug":"kolev-2-04-03-03-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-04-03-03-03-03":{"slug":"kolev-2-04-03-03-03-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10","section-3":"section-11"}},"kolev-2-04-03-03-05-02":{"slug":"kolev-2-04-03-03-05-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-04-03-03-09-02":{"slug":"kolev-2-04-03-03-09-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-2-04-03-03-09-03":{"slug":"kolev-2-04-03-03-09-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11","section-3":"section-12"}},"kolev-2-04-03-03-09-04":{"slug":"kolev-2-04-03-03-09-01","hash":"section-13","fragments":{"section-0":"section-14","section-1":"section-15","section-2":"section-16","section-3":"section-17","section-4":"section-18"}},"kolev-2-04-03-03-09-05":{"slug":"kolev-2-04-03-03-09-01","hash":"section-19","fragments":{"section-0":"section-20","section-1":"section-21","section-2":"section-22","section-3":"section-23"}},"kolev-2-04-03-03-09-06":{"slug":"kolev-2-04-03-03-09-01","hash":"section-24","fragments":{"section-0":"section-25","section-1":"section-26","section-2":"section-27"}},"kolev-2-04-05-02":{"slug":"kolev-2-04-05-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-04-06-02":{"slug":"kolev-2-04-06-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-04-06-03":{"slug":"kolev-2-04-06-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10","section-3":"section-11","section-4":"section-12"}},"kolev-2-04-03-04-02":{"slug":"kolev-2-04-03-04-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-2-04-04-02":{"slug":"kolev-2-04-04-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-04-04-03":{"slug":"kolev-2-04-04-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-2-05-02-02":{"slug":"kolev-2-05-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-05-03-02":{"slug":"kolev-2-05-03-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8","section-4":"section-9"}},"kolev-2-05-03-03":{"slug":"kolev-2-05-03-01","hash":"section-10","fragments":{"section-0":"section-11","section-1":"section-12","section-2":"section-13","section-3":"section-14"}},"kolev-2-05-03-04":{"slug":"kolev-2-05-03-01","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17","section-2":"section-18","section-3":"section-19"}},"kolev-2-05-03-05":{"slug":"kolev-2-05-03-01","hash":"section-20","fragments":{"section-0":"section-21","section-1":"section-22"}},"kolev-2-05-03-06":{"slug":"kolev-2-05-03-01","hash":"section-23","fragments":{"section-0":"section-24","section-1":"section-25","section-2":"section-26","section-3":"section-27"}},"kolev-2-05-03-07":{"slug":"kolev-2-05-03-01","hash":"section-28","fragments":{"section-0":"section-29","section-1":"section-30","section-2":"section-31"}},"kolev-2-05-07-02":{"slug":"kolev-2-05-07-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7"}},"kolev-2-05-07-03":{"slug":"kolev-2-05-07-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11","section-3":"section-12"}},"kolev-2-06-03-01-02":{"slug":"kolev-2-06-03-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-06-03-01-03":{"slug":"kolev-2-06-03-01-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-2-06-03-03-02":{"slug":"kolev-2-06-03-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-06-05-02":{"slug":"kolev-2-06-05-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-06-05-03":{"slug":"kolev-2-06-05-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-2-06-05-04":{"slug":"kolev-2-06-05-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13","section-2":"section-14"}},"kolev-2-06-06-02":{"slug":"kolev-2-06-06-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8"}},"kolev-2-07-01-02":{"slug":"kolev-2-07-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-07-03-02-02":{"slug":"kolev-2-07-03-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-2-07-03-02-03":{"slug":"kolev-2-07-03-02-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11"}},"kolev-2-07-03-02-04":{"slug":"kolev-2-07-03-02-01","hash":"section-12","fragments":{"section-0":"section-13","section-1":"section-14","section-2":"section-15"}},"kolev-2-07-06-02":{"slug":"kolev-2-07-06-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-07-06-03":{"slug":"kolev-2-07-06-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-2-07-06-04":{"slug":"kolev-2-07-06-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13","section-2":"section-14","section-3":"section-15"}},"kolev-2-08-01-02":{"slug":"kolev-2-08-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-08-01-03":{"slug":"kolev-2-08-01-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-2-08-01-04":{"slug":"kolev-2-08-01-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13","section-2":"section-14"}},"kolev-2-08-01-05":{"slug":"kolev-2-08-01-01","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17","section-2":"section-18","section-3":"section-19"}},"kolev-2-08-02-02":{"slug":"kolev-2-08-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-08-03-02":{"slug":"kolev-2-08-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-2-08-04-02":{"slug":"kolev-2-08-04-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8"}},"kolev-2-08-04-03":{"slug":"kolev-2-08-04-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12"}},"kolev-2-08-05-04-04":{"slug":"kolev-2-08-05-04-03","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-08-06-02":{"slug":"kolev-2-08-06-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-2-08-07-02":{"slug":"kolev-2-08-07-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-2-08-07-03":{"slug":"kolev-2-08-07-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10"}},"kolev-2-09-01-02":{"slug":"kolev-2-09-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-09-01-03":{"slug":"kolev-2-09-01-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8"}},"kolev-2-09-04-02":{"slug":"kolev-2-09-04-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-2-09-04-03":{"slug":"kolev-2-09-04-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11","section-3":"section-12"}},"kolev-2-09-07-02":{"slug":"kolev-2-09-07-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-09-07-03":{"slug":"kolev-2-09-07-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10","section-3":"section-11"}},"kolev-2-09-08-02":{"slug":"kolev-2-09-08-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-2-09-08-03":{"slug":"kolev-2-09-08-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8"}},"kolev-2-10-01-02":{"slug":"kolev-2-10-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-2-10-02-02":{"slug":"kolev-2-10-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-2-10-03-02":{"slug":"kolev-2-10-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-10-04-02-02":{"slug":"kolev-2-10-04-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-10-04-03-02":{"slug":"kolev-2-10-04-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-10-05-02":{"slug":"kolev-2-10-05-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6"}},"kolev-2-10-06-02":{"slug":"kolev-2-10-06-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6"}},"kolev-2-10-08-02":{"slug":"kolev-2-10-08-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-10-08-03":{"slug":"kolev-2-10-08-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9"}},"kolev-2-10-08-04":{"slug":"kolev-2-10-08-01","hash":"section-10","fragments":{"section-0":"section-11","section-1":"section-12"}},"kolev-2-11-02-02":{"slug":"kolev-2-11-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-11-04-03-01-02":{"slug":"kolev-2-11-04-03-01-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8"}},"kolev-2-11-04-03-03-03":{"slug":"kolev-2-11-04-03-03-02","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-11-04-03-03-04":{"slug":"kolev-2-11-04-03-03-02","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9"}},"kolev-2-11-05-02":{"slug":"kolev-2-11-05-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-11-06-02":{"slug":"kolev-2-11-06-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-11-09-05":{"slug":"kolev-2-11-09-04","hash":"section-1","fragments":{"section-0":"section-2","section-1":"section-3","section-2":"section-4"}},"kolev-2-12-02-02":{"slug":"kolev-2-12-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-12-03-02":{"slug":"kolev-2-12-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-12-04-02":{"slug":"kolev-2-12-04-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-12-04-03":{"slug":"kolev-2-12-04-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9"}},"kolev-2-12-05-01-02":{"slug":"kolev-2-12-05-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-12-05-02-01-02":{"slug":"kolev-2-12-05-02-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-12-05-02-01-03":{"slug":"kolev-2-12-05-02-01-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-2-12-05-02-02-02":{"slug":"kolev-2-12-05-02-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-12-05-02-02-03":{"slug":"kolev-2-12-05-02-02-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8","section-2":"section-9","section-3":"section-10"}},"kolev-2-12-06-02":{"slug":"kolev-2-12-06-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-12-06-03":{"slug":"kolev-2-12-06-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8"}},"kolev-2-12-06-04":{"slug":"kolev-2-12-06-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11"}},"kolev-2-12-06-05":{"slug":"kolev-2-12-06-01","hash":"section-12","fragments":{"section-0":"section-13","section-1":"section-14"}},"kolev-2-12-08-02":{"slug":"kolev-2-12-08-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-12-08-03":{"slug":"kolev-2-12-08-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7","section-2":"section-8"}},"kolev-2-12-09-02":{"slug":"kolev-2-12-09-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-12-09-03":{"slug":"kolev-2-12-09-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8","section-2":"section-9"}},"kolev-2-12-09-04":{"slug":"kolev-2-12-09-01","hash":"section-10","fragments":{"section-0":"section-11","section-1":"section-12","section-2":"section-13"}},"kolev-2-12-09-05":{"slug":"kolev-2-12-09-01","hash":"section-14","fragments":{"section-0":"section-15","section-1":"section-16"}},"kolev-2-12-09-06":{"slug":"kolev-2-12-09-01","hash":"section-17","fragments":{"section-0":"section-18","section-1":"section-19"}},"kolev-2-12-09-07":{"slug":"kolev-2-12-09-01","hash":"section-20","fragments":{"section-0":"section-21","section-1":"section-22","section-2":"section-23"}},"kolev-2-12-10-02":{"slug":"kolev-2-12-10-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6"}},"kolev-2-13-02-02":{"slug":"kolev-2-13-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-13-02-03":{"slug":"kolev-2-13-02-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-2-13-03-02":{"slug":"kolev-2-13-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-13-03-03":{"slug":"kolev-2-13-03-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8","section-2":"section-9"}},"kolev-2-13-04-03":{"slug":"kolev-2-13-04-02","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-13-06-02":{"slug":"kolev-2-13-06-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-13-a1-02":{"slug":"kolev-2-13-a1-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-13-a1-03":{"slug":"kolev-2-13-a1-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9"}},"kolev-2-13-a1-04":{"slug":"kolev-2-13-a1-01","hash":"section-10","fragments":{"section-0":"section-11","section-1":"section-12","section-2":"section-13"}},"kolev-2-13-a1-05":{"slug":"kolev-2-13-a1-01","hash":"section-14","fragments":{"section-0":"section-15","section-1":"section-16","section-2":"section-17"}},"kolev-2-13-a1-06":{"slug":"kolev-2-13-a1-01","hash":"section-18","fragments":{"section-0":"section-19","section-1":"section-20"}},"kolev-2-14-02-02":{"slug":"kolev-2-14-02-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6"}},"kolev-2-14-03-02":{"slug":"kolev-2-14-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-14-03-03":{"slug":"kolev-2-14-03-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8","section-2":"section-9"}},"kolev-2-14-03-04":{"slug":"kolev-2-14-03-01","hash":"section-10","fragments":{"section-0":"section-11","section-1":"section-12","section-2":"section-13"}},"kolev-2-14-03-05":{"slug":"kolev-2-14-03-01","hash":"section-14","fragments":{"section-0":"section-15","section-1":"section-16","section-2":"section-17"}},"kolev-2-14-03-06":{"slug":"kolev-2-14-03-01","hash":"section-18","fragments":{"section-0":"section-19","section-1":"section-20","section-2":"section-21"}},"kolev-2-14-05-02":{"slug":"kolev-2-14-05-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-14-06-02":{"slug":"kolev-2-14-06-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-2-14-07-02":{"slug":"kolev-2-14-07-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-14-07-03":{"slug":"kolev-2-14-07-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7"}},"kolev-2-14-08-02-02":{"slug":"kolev-2-14-08-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-14-08-02-03":{"slug":"kolev-2-14-08-02-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7"}},"kolev-2-15-01-02":{"slug":"kolev-2-15-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-15-02-02":{"slug":"kolev-2-15-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-2-15-02-03":{"slug":"kolev-2-15-02-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8"}},"kolev-2-15-02-04":{"slug":"kolev-2-15-02-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11"}},"kolev-2-15-02-05":{"slug":"kolev-2-15-02-01","hash":"section-12","fragments":{"section-0":"section-13","section-1":"section-14"}},"kolev-2-15-02-06":{"slug":"kolev-2-15-02-01","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17"}},"kolev-2-15-02-07":{"slug":"kolev-2-15-02-01","hash":"section-18","fragments":{"section-0":"section-19","section-1":"section-20"}},"kolev-2-15-02-08":{"slug":"kolev-2-15-02-01","hash":"section-21","fragments":{"section-0":"section-22","section-1":"section-23"}},"kolev-2-15-02-09":{"slug":"kolev-2-15-02-01","hash":"section-24","fragments":{"section-0":"section-25","section-1":"section-26","section-2":"section-27"}},"kolev-2-15-03-02":{"slug":"kolev-2-15-03-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-15-03-03":{"slug":"kolev-2-15-03-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7"}},"kolev-2-15-03-04":{"slug":"kolev-2-15-03-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10"}},"kolev-2-15-06-02":{"slug":"kolev-2-15-06-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-15-06-03":{"slug":"kolev-2-15-06-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7"}},"kolev-2-15-06-04":{"slug":"kolev-2-15-06-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10"}},"kolev-2-15-07-02":{"slug":"kolev-2-15-07-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-16-01-02":{"slug":"kolev-2-16-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-2-16-01-03":{"slug":"kolev-2-16-01-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8"}},"kolev-2-16-01-04":{"slug":"kolev-2-16-01-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12"}},"kolev-2-16-01-05":{"slug":"kolev-2-16-01-01","hash":"section-13","fragments":{"section-0":"section-14","section-1":"section-15"}},"kolev-2-16-02-01-02":{"slug":"kolev-2-16-02-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-16-02-01-03":{"slug":"kolev-2-16-02-01-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8"}},"kolev-2-16-02-02-02":{"slug":"kolev-2-16-02-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-16-02-02-03":{"slug":"kolev-2-16-02-02-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7"}},"kolev-2-16-02-02-04":{"slug":"kolev-2-16-02-02-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10"}},"kolev-2-16-03-02":{"slug":"kolev-2-16-03-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-16-03-03":{"slug":"kolev-2-16-03-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7","section-2":"section-8"}},"kolev-2-16-03-01-02":{"slug":"kolev-2-16-03-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-16-06-02":{"slug":"kolev-2-16-06-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-16-07-02":{"slug":"kolev-2-16-07-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-16-07-03":{"slug":"kolev-2-16-07-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7"}},"kolev-2-16-a1-02":{"slug":"kolev-2-16-a1-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-16-a1-03":{"slug":"kolev-2-16-a1-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7"}},"kolev-2-16-a1-04":{"slug":"kolev-2-16-a1-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11"}},"kolev-2-16-a1-05":{"slug":"kolev-2-16-a1-01","hash":"section-12","fragments":{"section-0":"section-13","section-1":"section-14"}},"kolev-2-16-a1-06":{"slug":"kolev-2-16-a1-01","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17","section-2":"section-18"}},"kolev-2-16-a1-07":{"slug":"kolev-2-16-a1-01","hash":"section-19","fragments":{"section-0":"section-20","section-1":"section-21"}},"kolev-2-16-a1-08":{"slug":"kolev-2-16-a1-01","hash":"section-22","fragments":{"section-0":"section-23","section-1":"section-24"}},"kolev-2-16-a1-09":{"slug":"kolev-2-16-a1-01","hash":"section-25","fragments":{"section-0":"section-26","section-1":"section-27","section-2":"section-28"}},"kolev-2-16-a1-10":{"slug":"kolev-2-16-a1-01","hash":"section-29","fragments":{"section-0":"section-30","section-1":"section-31","section-2":"section-32","section-3":"section-33"}},"kolev-2-16-a1-11":{"slug":"kolev-2-16-a1-01","hash":"section-34","fragments":{"section-0":"section-35","section-1":"section-36"}},"kolev-2-17-01-02":{"slug":"kolev-2-17-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-17-02-02":{"slug":"kolev-2-17-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-17-03-02":{"slug":"kolev-2-17-03-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-17-04-02":{"slug":"kolev-2-17-04-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-17-04-03":{"slug":"kolev-2-17-04-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7"}},"kolev-2-17-05-02":{"slug":"kolev-2-17-05-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-17-06-02":{"slug":"kolev-2-17-06-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-17-06-03":{"slug":"kolev-2-17-06-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7"}},"kolev-2-17-06-04":{"slug":"kolev-2-17-06-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11"}},"kolev-2-17-06-05":{"slug":"kolev-2-17-06-01","hash":"section-12","fragments":{"section-0":"section-13","section-1":"section-14"}},"kolev-2-17-06-06":{"slug":"kolev-2-17-06-01","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17","section-2":"section-18"}},"kolev-2-17-06-07":{"slug":"kolev-2-17-06-01","hash":"section-19","fragments":{"section-0":"section-20","section-1":"section-21"}},"kolev-2-17-09-02":{"slug":"kolev-2-17-09-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-18-01-02":{"slug":"kolev-2-18-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-18-02-02":{"slug":"kolev-2-18-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-18-02-03":{"slug":"kolev-2-18-02-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7"}},"kolev-2-18-02-04":{"slug":"kolev-2-18-02-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10"}},"kolev-2-18-02-05":{"slug":"kolev-2-18-02-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13","section-2":"section-14"}},"kolev-2-18-03-01-02":{"slug":"kolev-2-18-03-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-2-18-03-01-03":{"slug":"kolev-2-18-03-01-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8"}},"kolev-2-18-03-01-04":{"slug":"kolev-2-18-03-01-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11"}},"kolev-2-18-03-02-02":{"slug":"kolev-2-18-03-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-18-03-02-03":{"slug":"kolev-2-18-03-02-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7","section-2":"section-8"}},"kolev-2-18-03-02-04":{"slug":"kolev-2-18-03-02-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11"}},"kolev-2-18-03-02-05":{"slug":"kolev-2-18-03-02-01","hash":"section-12","fragments":{"section-0":"section-13","section-1":"section-14","section-2":"section-15"}},"kolev-2-18-03-02-06":{"slug":"kolev-2-18-03-02-01","hash":"section-16","fragments":{"section-0":"section-17","section-1":"section-18","section-2":"section-19"}},"kolev-2-18-03-02-07":{"slug":"kolev-2-18-03-02-01","hash":"section-20","fragments":{"section-0":"section-21","section-1":"section-22","section-2":"section-23"}},"kolev-2-18-03-02-08":{"slug":"kolev-2-18-03-02-01","hash":"section-24","fragments":{"section-0":"section-25"}},"kolev-2-18-03-02-09":{"slug":"kolev-2-18-03-02-01","hash":"section-26","fragments":{"section-0":"section-27","section-1":"section-28"}},"kolev-2-19-01-02":{"slug":"kolev-2-19-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-2-19-01-03":{"slug":"kolev-2-19-01-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8"}},"kolev-2-19-02-02":{"slug":"kolev-2-19-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-2-19-02-03":{"slug":"kolev-2-19-02-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8"}},"kolev-2-19-02-04":{"slug":"kolev-2-19-02-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11"}},"kolev-2-19-03-02":{"slug":"kolev-2-19-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-19-04-02":{"slug":"kolev-2-19-04-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-19-04-03":{"slug":"kolev-2-19-04-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7","section-2":"section-8"}},"kolev-2-19-04-04":{"slug":"kolev-2-19-04-01","hash":"section-9","fragments":{"section-0":"section-10"}},"kolev-2-19-04-05":{"slug":"kolev-2-19-04-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13"}},"kolev-2-20-01-02":{"slug":"kolev-2-20-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-20-01-03":{"slug":"kolev-2-20-01-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7","section-2":"section-8"}},"kolev-2-20-02-01-02":{"slug":"kolev-2-20-02-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-2-20-02-01-03":{"slug":"kolev-2-20-02-01-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8"}},"kolev-2-20-02-02-02":{"slug":"kolev-2-20-02-02-01","hash":"section-2","fragments":{"section-0":"section-3"}},"kolev-2-20-03-02":{"slug":"kolev-2-20-03-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-2-20-03-03":{"slug":"kolev-2-20-03-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8"}},"kolev-2-20-04-01-02":{"slug":"kolev-2-20-04-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-20-04-01-03":{"slug":"kolev-2-20-04-01-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7","section-2":"section-8"}},"kolev-2-20-04-02-02":{"slug":"kolev-2-20-04-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-2-20-04-02-03":{"slug":"kolev-2-20-04-02-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9"}},"kolev-2-20-04-02-04":{"slug":"kolev-2-20-04-02-01","hash":"section-10","fragments":{"section-0":"section-11","section-1":"section-12","section-2":"section-13"}},"kolev-2-20-04-03-02":{"slug":"kolev-2-20-04-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7","section-4":"section-8"}},"kolev-2-20-04-03-03":{"slug":"kolev-2-20-04-03-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12","section-3":"section-13"}},"kolev-2-20-04-03-04":{"slug":"kolev-2-20-04-03-01","hash":"section-14","fragments":{"section-0":"section-15","section-1":"section-16","section-2":"section-17"}},"kolev-2-20-04-03-05":{"slug":"kolev-2-20-04-03-01","hash":"section-18","fragments":{"section-0":"section-19","section-1":"section-20"}},"kolev-2-20-04-03-06":{"slug":"kolev-2-20-04-03-01","hash":"section-21","fragments":{"section-0":"section-22","section-1":"section-23","section-2":"section-24"}},"kolev-2-20-04-03-07":{"slug":"kolev-2-20-04-03-01","hash":"section-25","fragments":{"section-0":"section-26","section-1":"section-27","section-2":"section-28","section-3":"section-29"}},"kolev-2-20-04-03-08":{"slug":"kolev-2-20-04-03-01","hash":"section-30","fragments":{"section-0":"section-31","section-1":"section-32","section-2":"section-33"}},"kolev-2-21-01-04-02":{"slug":"kolev-2-21-01-04-01","hash":"section-0","fragments":{}},"kolev-2-21-01-04-03":{"slug":"kolev-2-21-01-04-01","hash":"section-1","fragments":{}},"kolev-2-21-01-05-02":{"slug":"kolev-2-21-01-05-01","hash":"section-0","fragments":{"section-0":"section-1"}},"kolev-2-21-01-05-03":{"slug":"kolev-2-21-01-05-01","hash":"section-2","fragments":{"section-0":"section-3"}},"kolev-2-21-01-06-02":{"slug":"kolev-2-21-01-06-01","hash":"section-1","fragments":{}},"kolev-2-21-01-06-03":{"slug":"kolev-2-21-01-06-01","hash":"section-2","fragments":{"section-0":"section-3"}},"kolev-2-21-01-07-02":{"slug":"kolev-2-21-01-07-01","hash":"section-0","fragments":{"section-0":"section-1"}},"kolev-2-21-01-09-02":{"slug":"kolev-2-21-01-09-01","hash":"section-0","fragments":{}},"kolev-2-21-02-04-01-02":{"slug":"kolev-2-21-02-04-01-01","hash":"section-1","fragments":{}},"kolev-2-21-02-04-03-01-02":{"slug":"kolev-2-21-02-04-03-01-01","hash":"section-1","fragments":{}},"kolev-2-21-02-04-03-04-02":{"slug":"kolev-2-21-02-04-03-04-01","hash":"section-0","fragments":{}},"kolev-2-21-02-04-03-05-02":{"slug":"kolev-2-21-02-04-03-05-01","hash":"section-0","fragments":{"section-0":"section-1","section-1":"section-2"}},"kolev-2-21-02-05-02":{"slug":"kolev-2-21-02-05-01","hash":"section-0","fragments":{}},"kolev-2-21-02-05-03":{"slug":"kolev-2-21-02-05-01","hash":"section-1","fragments":{}},"kolev-2-21-02-05-04":{"slug":"kolev-2-21-02-05-01","hash":"section-2","fragments":{}},"kolev-2-21-a2-02":{"slug":"kolev-2-21-a2-01","hash":"section-0","fragments":{"section-0":"section-1","section-1":"section-2"}},"kolev-2-21-a2-03":{"slug":"kolev-2-21-a2-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-22-01-01-02":{"slug":"kolev-2-22-01-01-01","hash":"section-2","fragments":{"section-0":"section-3"}},"kolev-2-22-01-02-02":{"slug":"kolev-2-22-01-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-22-01-03-02":{"slug":"kolev-2-22-01-03-01","hash":"section-1","fragments":{"section-0":"section-2","section-1":"section-3"}},"kolev-2-22-02-02":{"slug":"kolev-2-22-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-22-02-03":{"slug":"kolev-2-22-02-01","hash":"section-5","fragments":{"section-0":"section-6"}},"kolev-2-22-02-04":{"slug":"kolev-2-22-02-01","hash":"section-7","fragments":{"section-0":"section-8"}},"kolev-2-22-02-05":{"slug":"kolev-2-22-02-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12"}},"kolev-2-22-02-06":{"slug":"kolev-2-22-02-01","hash":"section-13","fragments":{"section-0":"section-14","section-1":"section-15"}},"kolev-2-22-02-07":{"slug":"kolev-2-22-02-01","hash":"section-16","fragments":{}},"kolev-2-22-02-08":{"slug":"kolev-2-22-02-01","hash":"section-17","fragments":{"section-0":"section-18"}},"kolev-2-22-03-02":{"slug":"kolev-2-22-03-01","hash":"section-1","fragments":{"section-0":"section-2"}},"kolev-2-22-04-02":{"slug":"kolev-2-22-04-01","hash":"section-2","fragments":{"section-0":"section-3"}},"kolev-2-22-04-03":{"slug":"kolev-2-22-04-01","hash":"section-4","fragments":{"section-0":"section-5"}},"kolev-2-22-04-04":{"slug":"kolev-2-22-04-01","hash":"section-6","fragments":{}},"kolev-2-22-04-05":{"slug":"kolev-2-22-04-01","hash":"section-7","fragments":{"section-0":"section-8"}},"kolev-2-22-05-02":{"slug":"kolev-2-22-05-01","hash":"section-0","fragments":{"section-0":"section-1","section-1":"section-2"}},"kolev-2-22-05-03":{"slug":"kolev-2-22-05-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-22-05-04":{"slug":"kolev-2-22-05-01","hash":"section-6","fragments":{}},"kolev-2-22-06-02":{"slug":"kolev-2-22-06-01","hash":"section-1","fragments":{"section-0":"section-2"}},"kolev-2-22-06-03":{"slug":"kolev-2-22-06-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-22-06-04":{"slug":"kolev-2-22-06-01","hash":"section-6","fragments":{"section-0":"section-7"}},"kolev-2-22-06-05":{"slug":"kolev-2-22-06-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10"}},"kolev-2-22-06-06":{"slug":"kolev-2-22-06-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13","section-2":"section-14"}},"kolev-2-22-06-07":{"slug":"kolev-2-22-06-01","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17"}},"kolev-2-22-06-08":{"slug":"kolev-2-22-06-01","hash":"section-18","fragments":{"section-0":"section-19","section-1":"section-20"}},"kolev-2-22-06-09":{"slug":"kolev-2-22-06-01","hash":"section-21","fragments":{"section-0":"section-22"}},"kolev-2-22-06-10":{"slug":"kolev-2-22-06-01","hash":"section-23","fragments":{"section-0":"section-24","section-1":"section-25"}},"kolev-2-23-01-02":{"slug":"kolev-2-23-01-01","hash":"section-1","fragments":{"section-0":"section-2"}},"kolev-2-23-01-03":{"slug":"kolev-2-23-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-23-02-01-02":{"slug":"kolev-2-23-02-01-01","hash":"section-1","fragments":{"section-0":"section-2"}},"kolev-2-23-02-01-03":{"slug":"kolev-2-23-02-01-01","hash":"section-3","fragments":{}},"kolev-2-23-02-01-04":{"slug":"kolev-2-23-02-01-01","hash":"section-4","fragments":{}},"kolev-2-23-02-02-02":{"slug":"kolev-2-23-02-02-01","hash":"section-1","fragments":{"section-0":"section-2"}},"kolev-2-23-02-03-03-02":{"slug":"kolev-2-23-02-03-03-01","hash":"section-1","fragments":{"section-0":"section-2","section-1":"section-3"}},"kolev-2-23-02-03-03-03":{"slug":"kolev-2-23-02-03-03-01","hash":"section-4","fragments":{"section-0":"section-5"}},"kolev-2-23-02-03-03-04":{"slug":"kolev-2-23-02-03-03-01","hash":"section-6","fragments":{"section-0":"section-7"}},"kolev-2-23-02-03-03-05":{"slug":"kolev-2-23-02-03-03-01","hash":"section-8","fragments":{"section-0":"section-9"}},"kolev-2-23-04-02":{"slug":"kolev-2-23-04-01","hash":"section-1","fragments":{"section-0":"section-2","section-1":"section-3"}},"kolev-2-23-05-02":{"slug":"kolev-2-23-05-01","hash":"section-0","fragments":{"section-0":"section-1"}},"kolev-2-23-06-02":{"slug":"kolev-2-23-06-01","hash":"section-1","fragments":{"section-0":"section-2"}},"kolev-2-23-06-03":{"slug":"kolev-2-23-06-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-23-06-04":{"slug":"kolev-2-23-06-01","hash":"section-6","fragments":{}},"kolev-2-23-06-05":{"slug":"kolev-2-23-06-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9"}},"kolev-2-24-01-02-02-02":{"slug":"kolev-2-24-01-02-02-01","hash":"section-0","fragments":{}},"kolev-2-24-01-02-03-02":{"slug":"kolev-2-24-01-02-03-01","hash":"section-0","fragments":{}},"kolev-2-24-01-02-03-03":{"slug":"kolev-2-24-01-02-03-01","hash":"section-1","fragments":{}},"kolev-2-24-01-02-03-04":{"slug":"kolev-2-24-01-02-03-01","hash":"section-2","fragments":{}},"kolev-2-24-01-02-03-05":{"slug":"kolev-2-24-01-02-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-2-24-01-02-03-06":{"slug":"kolev-2-24-01-02-03-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8","section-2":"section-9"}},"kolev-2-24-01-02-03-07":{"slug":"kolev-2-24-01-02-03-01","hash":"section-10","fragments":{"section-0":"section-11","section-1":"section-12"}},"kolev-2-24-03-02":{"slug":"kolev-2-24-03-01","hash":"section-0","fragments":{}},"kolev-2-24-03-03":{"slug":"kolev-2-24-03-01","hash":"section-1","fragments":{}},"kolev-2-24-03-01-03-02":{"slug":"kolev-2-24-03-01-03-01","hash":"section-0","fragments":{}},"kolev-2-24-03-02-01":{"slug":"kolev-2-24-03-01-03-01","hash":"section-1","fragments":{}},"kolev-2-24-03-02-02":{"slug":"kolev-2-24-03-01-03-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-2-25-02-02-02":{"slug":"kolev-2-25-02-02-01","hash":"section-0","fragments":{}},"kolev-2-25-02-02-03":{"slug":"kolev-2-25-02-02-01","hash":"section-1","fragments":{}},"kolev-2-25-02-02-04":{"slug":"kolev-2-25-02-02-01","hash":"section-2","fragments":{}},"kolev-2-25-02-02-05":{"slug":"kolev-2-25-02-02-01","hash":"section-3","fragments":{}},"kolev-2-25-02-03-02":{"slug":"kolev-2-25-02-03-01","hash":"section-0","fragments":{}},"kolev-2-25-03-01-02":{"slug":"kolev-2-25-03-01-01","hash":"section-0","fragments":{}},"kolev-2-25-03-02-02":{"slug":"kolev-2-25-03-02-01","hash":"section-0","fragments":{}},"kolev-2-25-03-02-03":{"slug":"kolev-2-25-03-02-01","hash":"section-1","fragments":{}},"kolev-2-25-03-02-04":{"slug":"kolev-2-25-03-02-01","hash":"section-2","fragments":{}},"kolev-2-25-04-02-02":{"slug":"kolev-2-25-04-02-01","hash":"section-0","fragments":{}},"kolev-2-25-04-02-03":{"slug":"kolev-2-25-04-02-01","hash":"section-1","fragments":{}},"kolev-2-25-04-02-04":{"slug":"kolev-2-25-04-02-01","hash":"section-2","fragments":{}},"kolev-2-25-04-03-01-02-02":{"slug":"kolev-2-25-04-03-01-02-01","hash":"section-0","fragments":{}},"kolev-2-25-04-03-01-02-03":{"slug":"kolev-2-25-04-03-01-02-01","hash":"section-1","fragments":{}},"kolev-2-25-04-03-02-01-02":{"slug":"kolev-2-25-04-03-02-01-01","hash":"section-0","fragments":{}},"kolev-2-25-04-03-02-02-02":{"slug":"kolev-2-25-04-03-02-02-01","hash":"section-0","fragments":{}},"kolev-2-25-04-03-02-03-02":{"slug":"kolev-2-25-04-03-02-03-01","hash":"section-0","fragments":{}},"kolev-2-25-04-03-02-03-03":{"slug":"kolev-2-25-04-03-02-03-01","hash":"section-1","fragments":{}},"kolev-2-25-04-03-02-03-04":{"slug":"kolev-2-25-04-03-02-03-01","hash":"section-2","fragments":{}},"kolev-2-25-04-03-02-03-05":{"slug":"kolev-2-25-04-03-02-03-01","hash":"section-3","fragments":{}},"kolev-2-25-04-03-02-03-06":{"slug":"kolev-2-25-04-03-02-03-01","hash":"section-4","fragments":{}},"kolev-2-25-04-04-02":{"slug":"kolev-2-25-04-04-01","hash":"section-0","fragments":{}},"kolev-2-25-04-04-03":{"slug":"kolev-2-25-04-04-01","hash":"section-1","fragments":{}},"kolev-2-25-04-05-02":{"slug":"kolev-2-25-04-05-01","hash":"section-0","fragments":{}},"kolev-2-25-04-05-03":{"slug":"kolev-2-25-04-05-01","hash":"section-1","fragments":{}},"kolev-2-25-04-05-04":{"slug":"kolev-2-25-04-05-01","hash":"section-2","fragments":{"section-0":"section-3"}},"kolev-3-01-01-01-02":{"slug":"kolev-3-01-01-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-3-01-01-02-02":{"slug":"kolev-3-01-01-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-3-01-02-01-03-02":{"slug":"kolev-3-01-02-01-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-3-01-02-01-03-03":{"slug":"kolev-3-01-02-01-03-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9"}},"kolev-3-01-02-01-03-04":{"slug":"kolev-3-01-02-01-03-01","hash":"section-10","fragments":{"section-0":"section-11","section-1":"section-12","section-2":"section-13"}},"kolev-3-01-02-01-03-05":{"slug":"kolev-3-01-02-01-03-01","hash":"section-14","fragments":{"section-0":"section-15","section-1":"section-16","section-2":"section-17"}},"kolev-3-01-02-04-01-02":{"slug":"kolev-3-01-02-04-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-3-01-02-04-02-02":{"slug":"kolev-3-01-02-04-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-3-01-02-04-02-03":{"slug":"kolev-3-01-02-04-02-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8","section-2":"section-9"}},"kolev-3-01-02-04-02-04":{"slug":"kolev-3-01-02-04-02-01","hash":"section-10","fragments":{"section-0":"section-11"}},"kolev-3-01-03-02":{"slug":"kolev-3-01-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-3-02-01-02":{"slug":"kolev-3-02-01-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7"}},"kolev-3-02-01-03":{"slug":"kolev-3-02-01-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11"}},"kolev-3-02-01-04":{"slug":"kolev-3-02-01-01","hash":"section-12","fragments":{"section-0":"section-13","section-1":"section-14"}},"kolev-3-02-01-05":{"slug":"kolev-3-02-01-01","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17","section-2":"section-18","section-3":"section-19"}},"kolev-3-02-01-06":{"slug":"kolev-3-02-01-01","hash":"section-20","fragments":{"section-0":"section-21","section-1":"section-22"}},"kolev-3-02-01-07":{"slug":"kolev-3-02-01-01","hash":"section-23","fragments":{"section-0":"section-24","section-1":"section-25","section-2":"section-26"}},"kolev-3-02-02-02":{"slug":"kolev-3-02-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-3-02-04-02":{"slug":"kolev-3-02-04-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-3-02-04-03":{"slug":"kolev-3-02-04-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11"}},"kolev-3-02-04-04":{"slug":"kolev-3-02-04-01","hash":"section-12","fragments":{"section-0":"section-13","section-1":"section-14"}},"kolev-3-02-04-05":{"slug":"kolev-3-02-04-01","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17","section-2":"section-18"}},"kolev-3-03-01-04-02":{"slug":"kolev-3-03-01-04-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-3-03-01-04-03":{"slug":"kolev-3-03-01-04-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-3-03-01-04-04":{"slug":"kolev-3-03-01-04-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13"}},"kolev-3-03-03-02":{"slug":"kolev-3-03-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-3-03-03-03":{"slug":"kolev-3-03-03-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11"}},"kolev-3-04-01-01-02":{"slug":"kolev-3-04-01-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-3-04-01-01-03":{"slug":"kolev-3-04-01-01-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7"}},"kolev-3-04-01-02-02":{"slug":"kolev-3-04-01-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-3-04-02-02-02":{"slug":"kolev-3-04-02-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-3-04-02-04-02":{"slug":"kolev-3-04-02-04-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-3-05-02-02":{"slug":"kolev-3-05-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-3-05-02-03":{"slug":"kolev-3-05-02-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7"}},"kolev-3-05-02-04":{"slug":"kolev-3-05-02-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11"}},"kolev-3-05-02-05":{"slug":"kolev-3-05-02-01","hash":"section-12","fragments":{"section-0":"section-13","section-1":"section-14","section-2":"section-15"}},"kolev-3-05-02-06":{"slug":"kolev-3-05-02-01","hash":"section-16","fragments":{"section-0":"section-17","section-1":"section-18"}},"kolev-3-05-03-02":{"slug":"kolev-3-05-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-3-05-04-02-02-02":{"slug":"kolev-3-05-04-02-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-3-05-04-02-02-03":{"slug":"kolev-3-05-04-02-02-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8","section-2":"section-9"}},"kolev-3-05-04-02-02-04":{"slug":"kolev-3-05-04-02-02-01","hash":"section-10","fragments":{"section-0":"section-11","section-1":"section-12","section-2":"section-13","section-3":"section-14"}},"kolev-3-06-02-01-02":{"slug":"kolev-3-06-02-01-01","hash":"section-1","fragments":{"section-0":"section-2","section-1":"section-3"}},"kolev-3-06-02-01-03":{"slug":"kolev-3-06-02-01-01","hash":"section-4","fragments":{"section-0":"section-5"}},"kolev-3-06-03-02":{"slug":"kolev-3-06-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-3-06-03-03":{"slug":"kolev-3-06-03-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8","section-2":"section-9","section-3":"section-10"}},"kolev-3-07-01-02":{"slug":"kolev-3-07-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-3-07-02-02":{"slug":"kolev-3-07-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-3-07-02-03":{"slug":"kolev-3-07-02-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8","section-2":"section-9"}},"kolev-3-08-02-02":{"slug":"kolev-3-08-02-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8"}},"kolev-3-08-02-03":{"slug":"kolev-3-08-02-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12"}},"kolev-3-08-02-04":{"slug":"kolev-3-08-02-01","hash":"section-13","fragments":{"section-0":"section-14","section-1":"section-15","section-2":"section-16"}},"kolev-3-08-02-05":{"slug":"kolev-3-08-02-01","hash":"section-17","fragments":{"section-0":"section-18","section-1":"section-19","section-2":"section-20"}},"kolev-3-08-02-06":{"slug":"kolev-3-08-02-01","hash":"section-21","fragments":{"section-0":"section-22","section-1":"section-23","section-2":"section-24"}},"kolev-3-08-02-07":{"slug":"kolev-3-08-02-01","hash":"section-25","fragments":{"section-0":"section-26","section-1":"section-27","section-2":"section-28"}},"kolev-3-08-02-08":{"slug":"kolev-3-08-02-01","hash":"section-29","fragments":{"section-0":"section-30","section-1":"section-31","section-2":"section-32"}},"kolev-3-08-02-09":{"slug":"kolev-3-08-02-01","hash":"section-33","fragments":{"section-0":"section-34","section-1":"section-35","section-2":"section-36"}},"kolev-3-08-02-10":{"slug":"kolev-3-08-02-01","hash":"section-37","fragments":{"section-0":"section-38","section-1":"section-39","section-2":"section-40","section-3":"section-41"}},"kolev-3-08-02-11":{"slug":"kolev-3-08-02-01","hash":"section-42","fragments":{"section-0":"section-43","section-1":"section-44","section-2":"section-45"}},"kolev-3-08-03-02":{"slug":"kolev-3-08-03-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7"}},"kolev-3-09-01-02-02":{"slug":"kolev-3-09-01-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-3-09-01-02-03":{"slug":"kolev-3-09-01-02-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9"}},"kolev-3-09-02-01-02":{"slug":"kolev-3-09-02-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-3-09-02-01-03":{"slug":"kolev-3-09-02-01-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8","section-2":"section-9"}},"kolev-3-09-02-01-04":{"slug":"kolev-3-09-02-01-01","hash":"section-10","fragments":{"section-0":"section-11","section-1":"section-12","section-2":"section-13","section-3":"section-14"}},"kolev-3-09-02-01-05":{"slug":"kolev-3-09-02-01-01","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17","section-2":"section-18"}},"kolev-3-09-02-02-02":{"slug":"kolev-3-09-02-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-3-09-02-02-03":{"slug":"kolev-3-09-02-02-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-3-09-02-02-04":{"slug":"kolev-3-09-02-02-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13","section-2":"section-14"}},"kolev-3-09-02-02-05":{"slug":"kolev-3-09-02-02-01","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17","section-2":"section-18","section-3":"section-19"}},"kolev-3-09-02-03-02":{"slug":"kolev-3-09-02-03-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5","section-3":"section-6"}},"kolev-3-09-02-03-03":{"slug":"kolev-3-09-02-03-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-3-09-02-03-04":{"slug":"kolev-3-09-02-03-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13","section-2":"section-14"}},"kolev-3-09-02-03-05":{"slug":"kolev-3-09-02-03-01","hash":"section-15","fragments":{}},"kolev-3-09-02-03-06":{"slug":"kolev-3-09-02-03-01","hash":"section-16","fragments":{}},"kolev-3-10-02-02":{"slug":"kolev-3-10-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-3-10-02-03":{"slug":"kolev-3-10-02-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10","section-3":"section-11"}},"kolev-3-10-03-02":{"slug":"kolev-3-10-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-3-10-03-03":{"slug":"kolev-3-10-03-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-3-10-03-04":{"slug":"kolev-3-10-03-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13","section-2":"section-14"}},"kolev-3-10-03-05":{"slug":"kolev-3-10-03-01","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17","section-2":"section-18"}},"kolev-3-10-03-06":{"slug":"kolev-3-10-03-01","hash":"section-19","fragments":{"section-0":"section-20","section-1":"section-21","section-2":"section-22","section-3":"section-23"}},"kolev-3-11-01-02":{"slug":"kolev-3-11-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-3-11-01-03":{"slug":"kolev-3-11-01-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10"}},"kolev-3-11-01-04":{"slug":"kolev-3-11-01-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13","section-2":"section-14"}},"kolev-3-11-01-05":{"slug":"kolev-3-11-01-01","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17","section-2":"section-18"}},"kolev-3-11-01-06":{"slug":"kolev-3-11-01-01","hash":"section-19","fragments":{"section-0":"section-20","section-1":"section-21","section-2":"section-22","section-3":"section-23"}},"kolev-3-11-02-02":{"slug":"kolev-3-11-02-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-3-11-02-03":{"slug":"kolev-3-11-02-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8"}},"kolev-3-11-02-04":{"slug":"kolev-3-11-02-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12"}},"kolev-3-11-03-02":{"slug":"kolev-3-11-03-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-3-11-03-03":{"slug":"kolev-3-11-03-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7"}},"kolev-3-11-03-04":{"slug":"kolev-3-11-03-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10"}},"kolev-3-11-03-05":{"slug":"kolev-3-11-03-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13","section-2":"section-14"}},"kolev-3-11-03-07":{"slug":"kolev-3-11-03-06","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-3-11-03-08":{"slug":"kolev-3-11-03-06","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7"}},"kolev-3-11-04-02":{"slug":"kolev-3-11-04-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-3-11-04-03":{"slug":"kolev-3-11-04-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9"}},"kolev-3-11-05-02":{"slug":"kolev-3-11-05-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-3-11-06-02":{"slug":"kolev-3-11-06-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8"}},"kolev-3-12-01-02":{"slug":"kolev-3-12-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-3-12-01-03":{"slug":"kolev-3-12-01-01","hash":"section-5","fragments":{}},"kolev-3-12-01-03-02":{"slug":"kolev-3-12-01-03-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-3-12-01-03-03":{"slug":"kolev-3-12-01-03-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7","section-2":"section-8"}},"kolev-3-12-01-04-01-02":{"slug":"kolev-3-12-01-04-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4"}},"kolev-3-12-01-04-01-03":{"slug":"kolev-3-12-01-04-01-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7","section-2":"section-8","section-3":"section-9"}},"kolev-3-12-01-04-02-02":{"slug":"kolev-3-12-01-04-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5"}},"kolev-3-12-01-04-02-03":{"slug":"kolev-3-12-01-04-02-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8"}},"kolev-3-12-01-04-02-04":{"slug":"kolev-3-12-01-04-02-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12"}},"kolev-3-12-01-04-02-05":{"slug":"kolev-3-12-01-04-02-01","hash":"section-13","fragments":{"section-0":"section-14","section-1":"section-15","section-2":"section-16"}},"kolev-3-12-01-04-02-06":{"slug":"kolev-3-12-01-04-02-01","hash":"section-17","fragments":{"section-0":"section-18","section-1":"section-19","section-2":"section-20","section-3":"section-21"}},"kolev-3-12-02-01-02":{"slug":"kolev-3-12-02-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-3-12-02-01-03":{"slug":"kolev-3-12-02-01-01","hash":"section-6","fragments":{"section-0":"section-7","section-1":"section-8","section-2":"section-9"}},"kolev-3-12-02-02-02":{"slug":"kolev-3-12-02-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-3-12-02-02-03":{"slug":"kolev-3-12-02-02-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11"}},"kolev-3-12-03-01-02":{"slug":"kolev-3-12-03-01-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-3-12-03-03-03-02":{"slug":"kolev-3-12-03-03-03-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5","section-3":"section-6"}},"kolev-3-12-03-03-03-03":{"slug":"kolev-3-12-03-03-03-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-3-12-03-03-03-04":{"slug":"kolev-3-12-03-03-03-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13","section-2":"section-14"}},"kolev-3-12-03-03-03-05":{"slug":"kolev-3-12-03-03-03-01","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17","section-2":"section-18"}},"kolev-3-13-02-02":{"slug":"kolev-3-13-02-01","hash":"section-0","fragments":{"section-0":"section-1","section-1":"section-2"}},"kolev-3-13-07-02":{"slug":"kolev-3-13-07-01","hash":"section-0","fragments":{"section-0":"section-1","section-1":"section-2"}},"kolev-3-13-07-03":{"slug":"kolev-3-13-07-01","hash":"section-3","fragments":{"section-0":"section-4"}},"kolev-3-13-11-02":{"slug":"kolev-3-13-11-01","hash":"section-1","fragments":{"section-0":"section-2"}},"kolev-3-13-12-02":{"slug":"kolev-3-13-12-01","hash":"section-1","fragments":{}},"kolev-3-13-13-02":{"slug":"kolev-3-13-13-01","hash":"section-1","fragments":{"section-0":"section-2","section-1":"section-3"}},"kolev-3-13-18-02":{"slug":"kolev-3-13-18-01","hash":"section-1","fragments":{}},"kolev-1-02-07-01-02":{"slug":"kolev-1-02-07-01-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-1-02-07-01-03":{"slug":"kolev-1-02-07-01-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11","section-3":"section-12","section-4":"section-13"}},"kolev-1-02-07-02-01":{"slug":"kolev-1-02-07-01-01","hash":"section-14","fragments":{"section-0":"section-15","section-1":"section-16","section-2":"section-17"}},"kolev-1-02-07-02-02":{"slug":"kolev-1-02-07-01-01","hash":"section-18","fragments":{"section-0":"section-19","section-1":"section-20","section-2":"section-21","section-3":"section-22"}},"kolev-1-02-07-02-03":{"slug":"kolev-1-02-07-01-01","hash":"section-23","fragments":{"section-0":"section-24","section-1":"section-25","section-2":"section-26","section-3":"section-27"}},"kolev-1-02-07-02-04":{"slug":"kolev-1-02-07-01-01","hash":"section-28","fragments":{"section-0":"section-29","section-1":"section-30","section-2":"section-31","section-3":"section-32","section-4":"section-33"}},"kolev-1-02-07-02-05":{"slug":"kolev-1-02-07-01-01","hash":"section-34","fragments":{"section-0":"section-35","section-1":"section-36"}},"kolev-1-02-07-02-06":{"slug":"kolev-1-02-07-01-01","hash":"section-37","fragments":{"section-0":"section-38","section-1":"section-39"}},"kolev-1-02-07-02-07":{"slug":"kolev-1-02-07-01-01","hash":"section-40","fragments":{"section-0":"section-41","section-1":"section-42","section-2":"section-43"}},"kolev-1-02-07-02-08":{"slug":"kolev-1-02-07-01-01","hash":"section-44","fragments":{"section-0":"section-45","section-1":"section-46"}},"kolev-1-03-02-01":{"slug":"kolev-1-03-02","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-1-03-02-02":{"slug":"kolev-1-03-02","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11","section-3":"section-12","section-4":"section-13"}},"kolev-1-03-02-03":{"slug":"kolev-1-03-02","hash":"section-14","fragments":{"section-0":"section-15","section-1":"section-16","section-2":"section-17","section-3":"section-18","section-4":"section-19","section-5":"section-20"}},"kolev-1-03-02-04-01":{"slug":"kolev-1-03-02","hash":"section-21","fragments":{"section-0":"section-22","section-1":"section-23"}},"kolev-1-03-02-04-02":{"slug":"kolev-1-03-02","hash":"section-24","fragments":{"section-0":"section-25","section-1":"section-26","section-2":"section-27","section-3":"section-28"}},"kolev-1-03-02-04-03":{"slug":"kolev-1-03-02","hash":"section-29","fragments":{"section-0":"section-30","section-1":"section-31","section-2":"section-32","section-3":"section-33"}},"kolev-1-03-02-04-04":{"slug":"kolev-1-03-02","hash":"section-34","fragments":{"section-0":"section-35","section-1":"section-36","section-2":"section-37","section-3":"section-38"}},"kolev-1-03-02-04-05":{"slug":"kolev-1-03-02","hash":"section-39","fragments":{"section-0":"section-40","section-1":"section-41","section-2":"section-42"}},"kolev-1-03-02-05":{"slug":"kolev-1-03-02","hash":"section-43","fragments":{"section-0":"section-44","section-1":"section-45","section-2":"section-46","section-3":"section-47"}},"kolev-1-03-03-02":{"slug":"kolev-1-03-03-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5"}},"kolev-1-03-04-01":{"slug":"kolev-1-03-04","hash":"section-1","fragments":{"section-0":"section-2","section-1":"section-3"}},"kolev-1-03-04-02-01":{"slug":"kolev-1-03-04","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8"}},"kolev-1-03-04-02-02":{"slug":"kolev-1-03-04","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12","section-3":"section-13","section-4":"section-14"}},"kolev-1-03-04-02-03":{"slug":"kolev-1-03-04","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17","section-2":"section-18"}},"kolev-1-03-04-02-04":{"slug":"kolev-1-03-04","hash":"section-19","fragments":{"section-0":"section-20","section-1":"section-21","section-2":"section-22"}},"kolev-1-03-04-03":{"slug":"kolev-1-03-04","hash":"section-23","fragments":{"section-0":"section-24","section-1":"section-25","section-2":"section-26","section-3":"section-27"}},"kolev-1-03-04-04":{"slug":"kolev-1-03-04","hash":"section-28","fragments":{"section-0":"section-29"}},"kolev-1-03-04-05":{"slug":"kolev-1-03-04","hash":"section-30","fragments":{}},"kolev-1-04-06-02":{"slug":"kolev-1-04-06-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-1-04-10-02":{"slug":"kolev-1-04-10-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7","section-2":"section-8","section-3":"section-9","section-4":"section-10","section-5":"section-11"}},"kolev-1-06-07-02":{"slug":"kolev-1-06-07-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8","section-4":"section-9"}},"kolev-1-06-07-03":{"slug":"kolev-1-06-07-01","hash":"section-10","fragments":{"section-0":"section-11","section-1":"section-12"}},"kolev-1-06-07-04":{"slug":"kolev-1-06-07-01","hash":"section-13","fragments":{"section-0":"section-14","section-1":"section-15","section-2":"section-16","section-3":"section-17","section-4":"section-18"}},"kolev-1-06-07-05":{"slug":"kolev-1-06-07-01","hash":"section-19","fragments":{"section-0":"section-20","section-1":"section-21","section-2":"section-22","section-3":"section-23","section-4":"section-24","section-5":"section-25","section-6":"section-26","section-7":"section-27"}},"kolev-1-06-07-06":{"slug":"kolev-1-06-07-01","hash":"section-28","fragments":{"section-0":"section-29","section-1":"section-30","section-2":"section-31","section-3":"section-32","section-4":"section-33"}},"kolev-1-06-07-07":{"slug":"kolev-1-06-07-01","hash":"section-34","fragments":{"section-0":"section-35","section-1":"section-36","section-2":"section-37","section-3":"section-38","section-4":"section-39","section-5":"section-40","section-6":"section-41"}},"kolev-1-07-03-02":{"slug":"kolev-1-07-03-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8"}},"kolev-1-07-03-03":{"slug":"kolev-1-07-03-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12","section-3":"section-13"}},"kolev-1-07-03-04":{"slug":"kolev-1-07-03-01","hash":"section-14","fragments":{"section-0":"section-15","section-1":"section-16","section-2":"section-17","section-3":"section-18"}},"kolev-1-08-02-02":{"slug":"kolev-1-08-02-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-1-08-08-02":{"slug":"kolev-1-08-08-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5","section-3":"section-6"}},"kolev-1-08-08-03":{"slug":"kolev-1-08-08-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10","section-3":"section-11","section-4":"section-12"}},"kolev-1-08-08-04":{"slug":"kolev-1-08-08-01","hash":"section-13","fragments":{"section-0":"section-14","section-1":"section-15","section-2":"section-16","section-3":"section-17"}},"kolev-1-08-08-05":{"slug":"kolev-1-08-08-01","hash":"section-18","fragments":{"section-0":"section-19","section-1":"section-20","section-2":"section-21","section-3":"section-22"}},"kolev-1-08-08-06":{"slug":"kolev-1-08-08-01","hash":"section-23","fragments":{"section-0":"section-24","section-1":"section-25","section-2":"section-26","section-3":"section-27","section-4":"section-28"}},"kolev-1-08-08-07":{"slug":"kolev-1-08-08-01","hash":"section-29","fragments":{"section-0":"section-30","section-1":"section-31","section-2":"section-32","section-3":"section-33","section-4":"section-34"}},"kolev-1-08-08-08":{"slug":"kolev-1-08-08-01","hash":"section-35","fragments":{"section-0":"section-36","section-1":"section-37","section-2":"section-38","section-3":"section-39","section-4":"section-40","section-5":"section-41","section-6":"section-42","section-7":"section-43","section-8":"section-44"}},"kolev-1-08-08-09":{"slug":"kolev-1-08-08-01","hash":"section-45","fragments":{"section-0":"section-46","section-1":"section-47","section-2":"section-48"}},"kolev-1-08-09-02":{"slug":"kolev-1-08-09-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7","section-2":"section-8","section-3":"section-9","section-4":"section-10","section-5":"section-11","section-6":"section-12"}},"kolev-1-08-09-03":{"slug":"kolev-1-08-09-01","hash":"section-13","fragments":{"section-0":"section-14","section-1":"section-15","section-2":"section-16","section-3":"section-17","section-4":"section-18"}},"kolev-1-08-09-04":{"slug":"kolev-1-08-09-01","hash":"section-19","fragments":{"section-0":"section-20","section-1":"section-21","section-2":"section-22","section-3":"section-23","section-4":"section-24"}},"kolev-1-08-09-05":{"slug":"kolev-1-08-09-01","hash":"section-25","fragments":{"section-0":"section-26","section-1":"section-27","section-2":"section-28","section-3":"section-29"}},"kolev-1-08-09-06":{"slug":"kolev-1-08-09-01","hash":"section-30","fragments":{"section-0":"section-31","section-1":"section-32","section-2":"section-33","section-3":"section-34","section-4":"section-35"}},"kolev-1-09-02-02":{"slug":"kolev-1-09-02-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8","section-4":"section-9","section-5":"section-10"}},"kolev-1-09-02-03":{"slug":"kolev-1-09-02-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13","section-2":"section-14","section-3":"section-15"}},"kolev-1-09-02-04":{"slug":"kolev-1-09-02-01","hash":"section-16","fragments":{"section-0":"section-17","section-1":"section-18","section-2":"section-19","section-3":"section-20"}},"kolev-1-09-03-02":{"slug":"kolev-1-09-03-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6","section-3":"section-7"}},"kolev-1-09-03-03":{"slug":"kolev-1-09-03-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11","section-3":"section-12","section-4":"section-13","section-5":"section-14"}},"kolev-1-09-03-04":{"slug":"kolev-1-09-03-01","hash":"section-15","fragments":{"section-0":"section-16","section-1":"section-17","section-2":"section-18"}},"kolev-1-09-03-05":{"slug":"kolev-1-09-03-01","hash":"section-19","fragments":{"section-0":"section-20","section-1":"section-21","section-2":"section-22","section-3":"section-23"}},"kolev-1-09-04-02":{"slug":"kolev-1-09-04-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7","section-2":"section-8","section-3":"section-9","section-4":"section-10"}},"kolev-1-09-04-03":{"slug":"kolev-1-09-04-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13","section-2":"section-14","section-3":"section-15"}},"kolev-1-10-12-02":{"slug":"kolev-1-10-12-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-1-10-12-03":{"slug":"kolev-1-10-12-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-1-10-12-04":{"slug":"kolev-1-10-12-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"section-13","section-2":"section-14","section-3":"section-15"}},"kolev-1-10-12-05":{"slug":"kolev-1-10-12-01","hash":"section-16","fragments":{"section-0":"section-17","section-1":"section-18","section-2":"section-19"}},"kolev-1-10-12-06":{"slug":"kolev-1-10-12-01","hash":"section-20","fragments":{"section-0":"section-21","section-1":"section-22","section-2":"section-23"}},"kolev-1-11-02-02":{"slug":"kolev-1-11-02-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8"}},"kolev-1-11-02-03":{"slug":"kolev-1-11-02-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12","section-3":"section-13"}},"kolev-1-12-15-02":{"slug":"kolev-1-12-15-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8"}},"kolev-1-12-15-03-01":{"slug":"kolev-1-12-15-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12"}},"kolev-1-12-15-03-02":{"slug":"kolev-1-12-15-01","hash":"section-13","fragments":{"section-0":"section-14","section-1":"section-15","section-2":"section-16"}},"kolev-1-12-15-03-03":{"slug":"kolev-1-12-15-01","hash":"section-17","fragments":{"section-0":"section-18","section-1":"section-19","section-2":"section-20"}},"kolev-1-12-15-03-04":{"slug":"kolev-1-12-15-01","hash":"section-21","fragments":{"section-0":"section-22","section-1":"section-23","section-2":"section-24"}},"kolev-1-12-16-02":{"slug":"kolev-1-12-16-01","hash":"section-2","fragments":{"section-0":"section-3","section-1":"section-4","section-2":"section-5","section-3":"section-6"}},"kolev-1-12-16-03":{"slug":"kolev-1-12-16-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9","section-2":"section-10"}},"kolev-1-12-16-04-01":{"slug":"kolev-1-12-16-01","hash":"section-11","fragments":{"section-0":"section-12","section-1":"detail-0","section-2":"section-13","section-3":"detail-1","section-4":"section-14","section-5":"detail-2","section-6":"section-15","section-7":"detail-3"}},"kolev-1-12-16-04-02":{"slug":"kolev-1-12-16-01","hash":"section-16","fragments":{"section-0":"section-17","section-1":"detail-4","section-2":"section-18","section-3":"detail-5","section-4":"section-19","section-5":"detail-6","section-6":"detail-7","section-7":"section-20","section-8":"detail-8","section-9":"detail-9"}},"kolev-1-12-16-04-03":{"slug":"kolev-1-12-16-01","hash":"section-21","fragments":{"section-0":"section-22","section-1":"detail-10","section-2":"section-23","section-3":"detail-11","section-4":"section-24","section-5":"detail-12","section-6":"section-25","section-7":"detail-13","section-8":"section-26","section-9":"detail-14"}},"kolev-1-12-16-04-04":{"slug":"kolev-1-12-16-01","hash":"section-27","fragments":{"section-0":"section-28","section-1":"detail-15","section-2":"section-29","section-3":"detail-16","section-4":"section-30","section-5":"detail-17"}},"kolev-1-12-17-02":{"slug":"kolev-1-12-17-01","hash":"section-3","fragments":{"section-0":"section-4","section-1":"section-5","section-2":"section-6"}},"kolev-1-12-17-03":{"slug":"kolev-1-12-17-01","hash":"section-7","fragments":{"section-0":"section-8","section-1":"section-9"}},"kolev-1-12-17-04":{"slug":"kolev-1-12-17-01","hash":"section-10","fragments":{"section-0":"section-11","section-1":"section-12"}},"kolev-1-12-17-05":{"slug":"kolev-1-12-17-01","hash":"section-13","fragments":{"section-0":"section-14","section-1":"section-15"}},"kolev-1-12-17-06":{"slug":"kolev-1-12-17-01","hash":"section-16","fragments":{"section-0":"section-17","section-1":"section-18"}},"kolev-1-12-17-07":{"slug":"kolev-1-12-17-01","hash":"section-19","fragments":{"section-0":"section-20","section-1":"section-21"}},"kolev-1-12-17-08":{"slug":"kolev-1-12-17-01","hash":"section-22","fragments":{"section-0":"section-23","section-1":"section-24","section-2":"section-25"}},"kolev-1-12-17-09":{"slug":"kolev-1-12-17-01","hash":"section-26","fragments":{"section-0":"section-27","section-1":"section-28","section-2":"section-29","section-3":"section-30"}},"kolev-1-13-04-02":{"slug":"kolev-1-13-04-01","hash":"section-5","fragments":{"section-0":"section-6","section-1":"section-7","section-2":"section-8"}},"kolev-1-13-04-03":{"slug":"kolev-1-13-04-01","hash":"section-9","fragments":{"section-0":"section-10","section-1":"section-11","section-2":"section-12","section-3":"section-13"}},"kolev-1-13-04-04-01":{"slug":"kolev-1-13-04-01","hash":"section-14","fragments":{"section-0":"section-15","section-1":"section-16","section-2":"section-17"}},"kolev-1-13-04-04-02":{"slug":"kolev-1-13-04-01","hash":"section-18","fragments":{"section-0":"section-19","section-1":"section-20","section-2":"section-21"}},"kolev-1-13-04-04-03":{"slug":"kolev-1-13-04-01","hash":"section-22","fragments":{"section-0":"section-23","section-1":"section-24","section-2":"section-25","section-3":"section-26"}},"kolev-1-13-04-04-04":{"slug":"kolev-1-13-04-01","hash":"section-27","fragments":{"section-0":"section-28","section-1":"section-29","section-2":"section-30","section-3":"section-31"}},"kolev-1-13-11-02":{"slug":"kolev-1-13-11-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8","section-4":"section-9"}},"kolev-1-13-12-02":{"slug":"kolev-1-13-12-01","hash":"section-4","fragments":{"section-0":"section-5","section-1":"section-6","section-2":"section-7","section-3":"section-8","section-4":"section-9"}},"kolev-1-13-12-03":{"slug":"kolev-1-13-12-01","hash":"section-10","fragments":{"section-0":"section-11","section-1":"section-12","section-2":"section-13","section-3":"section-14","section-4":"section-15"}},"kolev-1-14-01-02":{"slug":"kolev-1-14-01-01","hash":"section-8","fragments":{"section-0":"section-9","section-1":"section-10","section-2":"section-11","section-3":"detail-0","section-4":"detail-1","section-5":"detail-2","section-6":"section-12","section-7":"section-13"}},"kolev-1-14-01-03":{"slug":"kolev-1-14-01-01","hash":"section-14","fragments":{"section-0":"section-15","section-1":"section-16","section-2":"section-17","section-3":"detail-3","section-4":"detail-4","section-5":"detail-5","section-6":"section-18","section-7":"section-19"}},"kolev-1-14-01-04":{"slug":"kolev-1-14-01-01","hash":"section-20","fragments":{"section-0":"section-21","section-1":"section-22","section-2":"section-23","section-3":"section-24"}},"kolev-1-14-01-05":{"slug":"kolev-1-14-01-01","hash":"section-25","fragments":{"section-0":"section-26","section-1":"section-27"}},"kolev-1-14-01-06":{"slug":"kolev-1-14-01-01","hash":"section-28","fragments":{"section-0":"section-29","section-1":"section-30","section-2":"section-31"}}});

;
/* lab.js */
'use strict';
(() => {
 const $=(s,r=document)=>r.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const lab=window.FoamLab={esc,$,client:null,user:null,role:null};
 // A warm auth session may resolve before the next deferred script executes.
 // Wait for directory registration; keep the fallback if its script fails.
 lab.directoryReady=new Promise(resolve=>{
  document.addEventListener('foamlab:directory-init',()=>resolve(window.FoamDirectory.ready),{once:true});
  document.addEventListener('DOMContentLoaded',()=>resolve(window.FoamDirectory?.ready),{once:true});
 });
 const safeURL=s=>{if(typeof s!=='string'||!s.trim())return '';try{const u=new URL(s.trim(),location.origin);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}};lab.safeURL=safeURL;
 lab.date=s=>new Date(s).toLocaleDateString('zh-CN');
 const rememberedParent=url=>{try{const remembered=sessionStorage.getItem('foamlab.returnTo:'+url);if(!remembered)return url;const saved=new URL(remembered,location.origin);return saved.origin===location.origin&&saved.pathname===url?saved.pathname+saved.search+saved.hash:url;}catch{return url;}};
 const setParentLinks=parent=>{try{if(parent.url!=='/admin/'){const raw=sessionStorage.getItem('foamlab.returnFor:'+location.pathname+location.search),saved=raw?new URL(raw,location.origin):null,labels={'/courses/':'课程目录','/topics/':'专题学习','/commands/':'命令速查','/dictionaries/':'配置与字典速查','/function-objects/':'functionObject 速查','/linux/':'Linux 入门','/cpp/':'C++ 入门','/programming/':'OpenFOAM 编程','/topics/finite-volume/':'有限体积法','/tools/':'工具生态','/resources/':'资料中心','/recommendations/':'资料中心','/sharing/':'实践与分享','/authors/':'实践与分享','/announcements/':'网站公告','/assignments/':'作业与实践'};if(saved&&saved.origin===location.origin&&Object.hasOwn(labels,saved.pathname))parent={url:saved.pathname+saved.search+saved.hash,label:labels[saved.pathname]};}}catch{}const url=rememberedParent(parent.url),link=$('#breadcrumb-parent'),back=$('#page-back-link');if(link){link.href=url;link.textContent=parent.label;}if(back){back.href=url;back.textContent='← 返回'+parent.label;}};
 const initialParent=$('#breadcrumb-parent');if(initialParent)setParentLinks({url:new URL(initialParent.href,location.origin).pathname,label:initialParent.textContent});

 lab.headingTitle=item=>String(item.slug||'').startsWith('command-')?item.title.split(' · ')[0]:item.title;
 lab.updateBreadcrumb=item=>{let parent={url:'/',label:'学习概览'};const track=String(item.track||''),canonical=String(item.metadata?.canonical_path||'');
  if(item.metadata?.admin_only)parent={url:'/admin/',label:'管理平台'};
  else if(item.metadata?.kolev_book)parent={url:'/theory/multiphase-'+([1,2,3].includes(Number(item.metadata.kolev_book.volume))?Number(item.metadata.kolev_book.volume):1)+'/',label:item.track||'多相流动力学'};
  else if(item.metadata?.heat_transfer_book)parent={url:'/theory/heat-mass-transfer/',label:'传热与传质基础'};
  else if(item.metadata?.turbulence_book)parent={url:'/theory/turbulence/',label:'湍流理论'};
  else if(item.metadata?.fvm_book)parent={url:'/fvm/',label:'OpenFOAM中的有限体积法'};
  else if(canonical==='/start/')parent={url:'/',label:'学习概览'};
  else if(canonical.startsWith('/dictionaries/')||String(item.slug).startsWith('dictionary-'))parent={url:'/dictionaries/',label:'配置与字典速查'};
  else if(String(item.slug).startsWith('command-'))parent={url:'/commands/',label:'命令速查'};
  else if(canonical.startsWith('/function-objects/'))parent={url:'/function-objects/',label:'functionObject 速查'};
  else if(['lesson','course'].includes(item.kind)){parent=/C\+\+/.test(track)?{url:'/cpp/',label:'C++ 入门'}:/Linux/.test(track)?{url:'/linux/',label:'Linux 入门'}:/OpenFOAM 编程/.test(track)?{url:'/programming/',label:'OpenFOAM 编程'}:track==='数值方法与理论'?{url:'/topics/finite-volume/',label:'有限体积法'}:{url:'/courses/',label:'课程目录'};}
  else {const map={module:['topics','专题学习'],tool:['tools','工具生态'],resource:['resources','资料中心'],recommendation:['resources','资料中心'],article:['sharing','实践与分享'],log:['sharing','实践与分享'],announcement:['announcements','网站公告'],assignment:['assignments','作业与实践'],reference:['reference','参考资料']};const entry=map[item.kind];if(entry)parent={url:'/'+entry[0]+'/',label:entry[1]};}
  setParentLinks(parent);
  window.foamCurrentContent=item;
  document.dispatchEvent(new CustomEvent('foamlab:content-ready',{detail:item}));
 };

 lab.error=(host,e)=>{host.innerHTML='<div class="lab-empty" role="alert"><strong>暂时无法完成请求</strong><p>'+esc(e.message||'请稍后重试。')+'</p><button class="button secondary" onclick="location.reload()">刷新页面</button></div>';};
 lab.reveal=host=>{const page=host?.closest('[data-page-state]');if(page)page.dataset.pageState='ready';};
 lab.check=r=>{if(r.error)throw Error(r.error.message);return r.data;};
 lab.markdown=body=>{
  const math=[];
  body=window.FoamMathSource.transform(body,({tex,display})=>{
   const i=math.push({tex,display})-1;return '<span data-foam-math="'+i+'"></span>';
  });
  const holder=document.createElement('div');holder.innerHTML=DOMPurify.sanitize(marked.parse(body,{gfm:true,breaks:false}),{USE_PROFILES:{html:true},ALLOW_DATA_ATTR:false,ADD_ATTR:['data-foam-math'],FORBID_TAGS:['style','form','input','button','textarea','select','option','label','iframe','object','embed','video','audio'],FORBID_ATTR:['style','id']});
  holder.querySelectorAll('a').forEach(a=>{const u=safeURL(a.getAttribute('href'));if(!u)a.removeAttribute('href');else{a.href=u;if(new URL(u).origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer';}}});
  holder.querySelectorAll('img').forEach(img=>{const u=safeURL(img.getAttribute('src'));if(!u)img.remove();else{img.src=u;img.loading='lazy';}});
  holder.querySelectorAll('pre > code').forEach(code=>{const lang=code.className.match(/language-([\w+-]+)/)?.[1];if(window.FoamDictionaryFormat?.isDictionary(code.textContent,lang)){code.textContent=window.FoamDictionaryFormat.format(code.textContent,lang);code.className='language-openfoam';}});
  holder.querySelectorAll('pre').forEach(pre=>{pre.classList.add('lab-code');pre.tabIndex=0;const panel=document.createElement('div');panel.className='code-panel';pre.replaceWith(panel);const tools=document.createElement('div');tools.className='code-toolbar';const lang=pre.querySelector('code')?.className.match(/language-([\w+-]+)/)?.[1]||'text',label=({foam:'OpenFOAM 字典',openfoam:'OpenFOAM 字典',dict:'OpenFOAM 字典',cpp:'C++',bash:'Bash / 终端',python:'Python',text:'文本 / 日志',plaintext:'文本 / 日志',prompt:'提示词'})[lang]||lang,lines=Math.max(1,pre.textContent.replace(/\n$/,'').split('\n').length);if(lang==='prompt')panel.classList.add('wrap-lines');pre.setAttribute('aria-label',lang==='prompt'?'可复制的提示词':label+'代码');tools.innerHTML='<span class="code-language">'+esc(label)+'</span><span class="code-lines">'+lines+' 行</span><button type="button" data-lab-wrap aria-pressed="'+(lang==='prompt'?'true':'false')+'">自动换行</button><button type="button" data-lab-copy>'+ (lang==='prompt'?'复制提示词':'复制代码')+'</button>';panel.append(tools,pre);});
  holder.querySelectorAll('table').forEach(table=>{if(table.parentElement.classList.contains('table-scroll'))return;const scroll=document.createElement('div');scroll.className='table-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label','表格，可横向滚动');table.replaceWith(scroll);scroll.append(table);});
  window.FoamInlineCode?.decorate(holder);
  holder.querySelectorAll('h2,h3').forEach((h,i)=>h.id='section-'+i);
  holder.querySelectorAll('h4,h5,h6').forEach((h,i)=>h.id='detail-'+i);
  // Decorate prose and code before expanding formulas into thousands of DOM
  // nodes. Repeated symbols share markup only within this rendering operation.
  const mathMarkup=new Map();
  holder.querySelectorAll('[data-foam-math]').forEach(el=>{const item=math[Number(el.dataset.foamMath)];if(!item){el.remove();return;}if(window.katex){try{const key=String(item.display)+':'+item.tex;if(mathMarkup.has(key))el.replaceChildren(...mathMarkup.get(key).map(node=>node.cloneNode(true)));else{katex.render(item.tex,el,{displayMode:item.display,throwOnError:true,trust:false,maxExpand:1000});mathMarkup.set(key,[...el.childNodes].map(node=>node.cloneNode(true)));}}catch{el.className='math-error';el.textContent=item.tex;}}else{el.className='math-pending';el.dataset.mathDisplay=String(item.display);el.textContent=item.tex;}});
  if(math.length&&!window.katex)window.FoamMathRenderer.enhance();
  return holder.innerHTML;
 };
 document.addEventListener('click',async e=>{const wrap=e.target.closest('[data-lab-wrap]');if(wrap){const on=wrap.closest('.code-panel').classList.toggle('wrap-lines');wrap.setAttribute('aria-pressed',String(on));return;}const b=e.target.closest('[data-lab-copy]');if(b){try{await navigator.clipboard.writeText(b.closest('.code-panel').querySelector('pre').textContent);window.dispatchEvent(new Event('foamlab:code-copied'));b.textContent='已复制';setTimeout(()=>b.textContent='复制代码',1300);}catch{window.foamNotify?.('请选中代码后复制。');}}});
 let authInitialized=false;
 // Published content can load while member/administrator permissions are checked.
 lab.contentReady=(async()=>{await window.foamAuth.ready;lab.client=window.foamAuth.client;lab.user=window.foamAuth.user;if(!lab.client)throw Error('内容服务未连接，请刷新重试。');return lab;})();
 lab.ready=(async()=>{await lab.contentReady;if(lab.user){const id=lab.user.id,r=await lab.client.from('foamlab_roles').select('role').eq('user_id',id).maybeSingle();if(window.foamAuth.user?.id===id)lab.role=r.data?.role||'member';else{lab.user=window.foamAuth.user;lab.role=null;}}authInitialized=true;return lab;})();
 window.addEventListener('foam-auth-change',e=>{
  if(window.foamAuth.loading)return;
  if(!window.foamAuth.user||window.foamAuth.user.is_anonymous){document.querySelectorAll('.article[data-cms-slug]:not([data-cms-slug=""]),#live-article').forEach(host=>lab.lockArticle?.(host));document.querySelectorAll('.topic-introduction').forEach(e=>e.remove());}
  if(!authInitialized)return;
  if(lab.user?.id===window.foamAuth.user?.id){if(e.detail?.accountUpdated&&!e.detail?.profileSaved)void lab.refreshAccountProgress();return;}
  lab.user=window.foamAuth.user;lab.role=null;
  document.querySelectorAll('[data-management-link],#profile-admin-link').forEach(link=>link.hidden=true);
  // Rebuild member/admin controls with the new identity, including changes
  // received from other tabs. Token refresh and progress updates do not reload.
  location.reload();
 });
 lab.ready.catch(()=>{});
 lab.ready.then(()=>{document.querySelectorAll('[data-management-link],#profile-admin-link').forEach(link=>link.hidden=lab.role!=='admin');}).catch(()=>{});
 lab.refreshAccountProgress=async()=>{await window.foamAuth.profileReady;if(!lab.user||!$('.account-page')||window.foamAuth.dataError)return;try{const lessons=[];for(let offset=0;;offset+=500){const batch=lab.check(await lab.client.from('foamlab_content').select('id').eq('status','published').eq('kind','lesson').order('id').range(offset,offset+499));lessons.push(...batch);if(batch.length<500)break;}const completed=new Set(window.foamAuth.progress||[]),count=lessons.filter(item=>completed.has(item.id)).length,total=lessons.length;window.foamAuth.totalLessons=total;window.foamAuth.visibleCompleted=count;const number=$('#account-completed'),state=$('#account-progress-state'),bar=$('#account-progress-bar');if(number)number.textContent=String(count);if(state)state.textContent='已完成 '+count+' / '+total+' 节课程。';if(bar)bar.style.width=(total?Math.min(100,count/total*100):0)+'%';}catch{const state=$('#account-progress-state'),bar=$('#account-progress-bar');if(state)state.textContent='账号记录已读取，课程目录暂时无法同步；请刷新后查看当前进度。';if(bar)bar.style.width='0%';}};
 lab.recordCompletion=async(contentId,completed)=>{await lab.ready;if(!lab.user)throw Error('请先登录。');if(typeof contentId!=='string'||!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(contentId))throw Error('新版课程使用独立内容 ID，不能使用旧讲次编号。');lab.check(await lab.client.from('foamlab_learning_progress').upsert({user_id:lab.user.id,content_id:contentId,completed,updated_at:new Date().toISOString()},{onConflict:'user_id,content_id'}));const progress=new Set(window.foamAuth.progress||[]);if(completed)progress.add(contentId);else progress.delete(contentId);window.foamAuth.progress=[...progress];window.dispatchEvent(new CustomEvent('foam-auth-change',{detail:{user:lab.user,progress:[...progress]}}));await lab.refreshAccountProgress();};
 lab.settingsReady=lab.ready.then(async()=>{
  const r=await lab.client.from('foamlab_settings').select('value').eq('key','site').maybeSingle();const cfg=r.data?.value||{};lab.settings=cfg;
  if(cfg.name){const brand=document.querySelector('.brand>span:last-child');if(brand&&cfg.name!=='FoamLab')brand.firstChild.textContent=cfg.name;}
  for(const [path,label] of Object.entries(cfg.nav||{})){const a=[...document.querySelectorAll('.sidebar nav a')].find(x=>x.getAttribute('href')===path);if(a){const span=a.querySelector('span');if(span)span.textContent=label;}}
  if(lab.user&&document.querySelector('.account-page')){
   const admin=document.querySelector('#profile-admin-link');if(admin)admin.hidden=lab.role!=='admin';
   await lab.refreshAccountProgress();
  }
  return cfg;
 }).catch(()=>({}));
 lab.login=async()=>{try{await window.foamAuth.signIn({returnTo:location.pathname+location.search+location.hash});}catch(e){window.foamNotify?.(e.message||'登录暂时无法发起，请稍后重试。');}};
 document.addEventListener('click',e=>{if(e.target.closest('[data-lab-login]'))lab.login();});
 lab.ensureProfile=async()=>{const meta=lab.user?.user_metadata||{};const display=(window.foamAuth.profile?.display_name||meta.user_name||meta.full_name||'学习者').slice(0,60);lab.check(await lab.client.from('foamlab_public_profiles').upsert({user_id:lab.user.id,display_name:display},{onConflict:'user_id'}));};
 const authorProfiles=new Map(),authorReads=new Map(),authorReadAt=new Map();
 lab.dateTime=s=>{const date=new Date(s);return Number.isNaN(date.getTime())?'—':date.toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});};
 lab.names=async ids=>{
  const unique=[...new Set(ids.filter(Boolean))],missing=unique.filter(id=>!authorReads.has(id)&&Date.now()-(authorReadAt.get(id)||0)>60000);
  for(let i=0;i<missing.length;i+=100){const batch=missing.slice(i,i+100);
   const pending=(async()=>{const [profiles,levels]=await Promise.all([lab.client.from('foamlab_public_profiles').select('user_id,display_name').in('user_id',batch),lab.client.from('foamlab_author_levels').select('user_id,level').in('user_id',batch),window.FoamAvatar?.fetchMany(batch)]);
    const profileById=new Map((profiles.data||[]).map(r=>[r.user_id,r])),levelById=new Map((levels.data||[]).map(r=>[r.user_id,r]));
    for(const id of batch){const previous=authorProfiles.get(id)||{},profile=profileById.get(id),level=levelById.get(id);authorProfiles.set(id,{name:profile?.display_name||previous.name||'',level:level?.level??(levels.error?previous.level:1)});if(!profiles.error&&!levels.error)authorReadAt.set(id,Date.now());}
   })().finally(()=>{for(const id of batch)authorReads.delete(id);});
   for(const id of batch)authorReads.set(id,pending);
  }
  await Promise.all([...new Set(unique.map(id=>authorReads.get(id)).filter(Boolean))]);
  return Object.fromEntries(unique.map(id=>[id,authorProfiles.get(id)?.name]).filter(([,name])=>name));
 };
 window.addEventListener('foam-avatar-change',e=>authorReadAt.delete(e.detail?.userId));
 lab.authorMeta=(item,fallback='社区成员')=>{const author=authorProfiles.get(item.author_id),name=author?.name||item.author_name||fallback,published=item.published_at||item.created_at,modified=item.updated_at||published;const time=(label,value)=>'<span>'+label+' <time datetime="'+esc(value||'')+'">'+esc(lab.dateTime(value))+'</time></span>';return '<span class="author-identity">'+(item.author_id&&window.FoamAvatar?'<span class="author-avatar" role="button" tabindex="0" data-social-profile="'+esc(item.author_id)+'" aria-label="查看'+esc(name)+'的资料">'+window.FoamAvatar.markup(window.FoamAvatar.get(item.author_id),true)+'</span>':'')+'<strong'+(item.author_id?' role="button" tabindex="0" data-social-profile="'+esc(item.author_id)+'"':'')+'>'+esc(name)+'</strong>'+(item.author_id?'<span class="author-level" aria-label="作者等级">Lv.'+esc(author?.level??'—')+'</span>':'')+'</span>'+time('发布于',published)+time('修改于',modified);};
 lab.topicLabels={'finite-volume':'有限体积法',turbulence:'湍流',multiphase:'多相流','heat-transfer':'传热与传质','electrochemistry':'电化学','porous-media':'渗流与多孔介质',aerodynamics:'可压缩流动',reacting:'化学反应流动',meshing:'网格划分','dynamic-mesh':'动网格','function-objects':'functionObject',engineering:'实际工程应用'};
 lab.courseDownloads=item=>(Array.isArray(item.metadata?.downloads)?item.metadata.downloads:[]).filter(d=>d&&typeof d==='object'&&safeURL(d.url)).slice(0,20).map(d=>({...d,url:safeURL(d.url),label:String(d.label||'下载案例')}));
 lab.fileSize=n=>Number.isFinite(Number(n))&&Number(n)>0?(n>=1048576?(n/1048576).toFixed(1)+' MB':Math.ceil(n/1024)+' KB'):'';
 lab.downloadLink=(d,cls='')=>'<a class="'+cls+'" href="'+esc(d.url)+'" '+(new URL(d.url).origin===location.origin?'download':'target="_blank" rel="noopener noreferrer"')+'><span>↓ '+esc(d.label)+'</span><span>'+esc(lab.fileSize(d.size_bytes))+'</span></a>';
 lab.topicLinks=item=>{const D=window.FoamDirectory;if(D?.available){const nodes=(item.section_ids||[]).map(D.get).filter(n=>n&&D.isVisible(n));return nodes.length?'<nav class="lesson-topic-links" aria-label="所在目录">'+nodes.map(n=>'<a href="'+esc(D.url(n))+'">'+esc(D.path(n.id))+' →</a>').join('')+'</nav>':'';}const keys=Array.isArray(item.metadata?.topics)?item.metadata.topics:[];return keys.some(x=>lab.topicLabels[x])?'<nav class="lesson-topic-links" aria-label="相关专题">'+keys.filter(x=>lab.topicLabels[x]).map(key=>'<a href="/topics/'+key+'/">'+esc(lab.topicLabels[key])+'专题 →</a>').join('')+'</nav>':'';};
 lab.downloadPanel=item=>{const files=lab.courseDownloads(item);if(!files.length)return '';return '<section class="lesson-downloads" id="lesson-downloads" aria-label="对应案例下载"><header><h2>'+(item.kind==='lesson'?'本课案例与附件':'附件下载')+'</h2><span>OpenFOAM v2512 · '+files.length+' 个附件</span></header>'+files.map(d=>'<div class="lesson-download-row">'+lab.downloadLink(d)+'<p>'+esc(d.description||'下载后先阅读包内说明，再进入相应算例目录。')+'</p></div>').join('')+'</section>';};
 lab.likeButton=(kind,id)=>'<button type="button" class="community-like" data-like-kind="'+esc(kind)+'" data-like-id="'+esc(id)+'" aria-pressed="false" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v11H3V10h4Zm0 0 5-7c2 0 3 1 2 5h5a2 2 0 0 1 2 2l-2 9a2 2 0 0 1-2 2H7"/></svg><span data-like-label>点赞</span><span data-like-count>…</span></button>';
 lab.card=item=>{const files=lab.courseDownloads(item),url=esc(safeURL(item.metadata?.canonical_path)||'/read/?slug='+encodeURIComponent(item.slug));return '<article class="lab-card"><a class="lab-card-main" href="'+url+'">'+(safeURL(item.cover_url)?'<img src="'+esc(safeURL(item.cover_url))+'" alt="'+esc(item.title)+'主题配图" loading="lazy">':'<div class="lab-card-mark">'+esc(item.track||item.kind)+'</div>')+'<div class="lab-card-body"><span class="lab-meta">'+esc(item.track||item.series||'FoamLab')+'</span><h3>'+(item.pinned?'<span class="pill community-pinned">置顶</span> ':'')+esc(item.title)+'</h3>'+(['article','log'].includes(item.kind)?'<div class="community-byline card-byline" data-author-content="'+esc(item.id)+'">'+lab.authorMeta(item)+'</div>':'')+'<p>'+esc(item.summary)+'</p><span class="lab-card-link">阅读全文 <span>↗</span></span></div></a>'+(files.length?'<div class="lab-card-download"><a href="'+esc(files[0].url)+'" '+(new URL(files[0].url).origin===location.origin?'download':'target="_blank" rel="noopener noreferrer"')+'>↓ 配套案例</a>'+(files.length>1?'<a href="'+url+'#lesson-downloads">全部 '+files.length+' 个包 →</a>':'<small>'+esc(lab.fileSize(files[0].size_bytes))+'</small>')+'</div>':'')+(item.kind==='article'?'<div class="community-post-actions">'+lab.likeButton('article',item.id)+'</div>':'')+'</article>';};
 lab.courseDirectory=item=>{const D=window.FoamDirectory,node=D?.primary?.(item)||(item.section_ids||[]).map(id=>D?.get(id)).find(Boolean);return node?D.url(node):(item.track==='OpenFOAM 编程'?'/programming/':'/courses/');};
 lab.lessonNavigation=async(host,item,options={})=>{if(item.kind!=='lesson'||!item.series)return;const chapterURL=chapter=>options.chapterURL?options.chapterURL(chapter):'/read/?slug='+encodeURIComponent(chapter.slug);const unit=(item.metadata?.fvm_book||item.metadata?.turbulence_book||item.metadata?.heat_transfer_book||item.metadata?.kolev_book)?'节':'章';const nav=document.createElement('nav');nav.className='lesson-navigation';nav.setAttribute('aria-label','课程章节翻页');nav.innerHTML='<p class="muted">正在读取章节顺序…</p>';const actions=$('.lesson-actions',host);if(actions)actions.after(nav);else host.append(nav);try{await lab.directoryReady;const chapters=[];for(let offset=0;;offset+=500){const page=lab.check(await lab.client.from('foamlab_content').select('id,slug,title,sort_order').eq('kind','lesson').eq('status','published').eq('series',item.series).order('sort_order').order('slug').range(offset,offset+499));chapters.push(...page);if(page.length<500)break;}const index=chapters.findIndex(chapter=>chapter.id===item.id);if(index<0){nav.innerHTML='<p class="muted">课程顺序已更新，请返回课程目录重新选择。</p>';return;}const outline=$('#reader-chapters'),chapterList=$('#chapter-list');if(outline&&chapterList){outline.hidden=false;outline.open=false;outline.querySelector('summary').textContent='课程目录 · '+chapters.length+' '+unit;outline.querySelector('.chapter-series').textContent=item.series;chapterList.innerHTML=chapters.map(chapter=>'<a href="'+esc(chapterURL(chapter))+'"'+(chapter.id===item.id?' aria-current="page"':'')+'>'+esc(chapter.title)+'</a>').join('');outline.ontoggle=()=>{if(outline.open)requestAnimationFrame(()=>{const active=chapterList.querySelector('[aria-current]');if(active)chapterList.scrollTop+=active.getBoundingClientRect().top-chapterList.getBoundingClientRect().top-(chapterList.clientHeight-active.offsetHeight)/2;});};}const first=chapters[0],last=chapters.at(-1),previous=chapters[index-1],next=chapters[index+1];const control=(name,label,target,enabled)=>enabled?'<a class="chapter-control" data-chapter="'+name+'" href="'+esc(chapterURL(target))+'" title="'+esc(target.title)+'">'+label+'</a>':'<button class="chapter-control" data-chapter="'+name+'" type="button" disabled aria-disabled="true">'+label+'</button>';nav.innerHTML='<div class="chapter-heading"><div><span>'+esc(item.series)+'</span><strong>第 '+(index+1)+' / '+chapters.length+' '+unit+'</strong></div><a href="'+esc(options.directoryURL||lab.courseDirectory(item))+'">课程目录 ↗</a></div><div class="chapter-controls">'+control('first','首'+unit,first,index>0)+control('previous','← 上一'+unit,previous,!!previous)+control('next','下一'+unit+' →',next,!!next)+control('last','末'+unit,last,index<chapters.length-1)+'</div><div class="chapter-neighbors"><p><span>上一'+unit+'</span><strong>'+esc(previous?.title||'当前已是首'+unit)+'</strong></p><p><span>下一'+unit+'</span><strong>'+esc(next?.title||'当前已是末'+unit)+'</strong></p></div>';}catch{nav.innerHTML='<p class="muted">章节导航暂时无法读取。</p><a href="'+esc(options.directoryURL||'/courses/')+'">返回课程目录 →</a>';}};
 const listing=$('[data-lab-catalog]:not([data-catalog-custom])');
 if(listing)(async()=>{try{await lab.contentReady;await lab.directoryReady;const mode=listing.dataset.labCatalog,D=window.FoamDirectory;let rows=[];
 if(D?.available){
  const node=D.current()||D.nodes.find(n=>n.key===mode);if(!node)throw Error('这个目录已删除，请从左侧导航选择其他目录。');
  rows=await D.content(node);const wrap=listing.closest('.page-wrap');wrap.querySelector('h1').textContent=node.name;document.title=node.name+' · FoamLab';if(node.description)wrap.querySelector('.page-heading p').textContent=node.description;void window.FoamSectionPage?.apply(node);
  const children=D.children(node.id).filter(D.isVisible);if(children.length){const links=document.createElement('nav');links.className='directory-children';links.setAttribute('aria-label','子目录');links.innerHTML=children.map(n=>'<a href="'+esc(D.url(n))+'">'+esc(n.name)+' →</a>').join('');wrap.querySelector('.catalog-search').before(links);}
  const parent=D.get(node.parent_id);if(parent)setParentLinks({url:D.url(parent),label:D.path(parent.id)});
 }else{const groups={courses:['lesson','course'],programming:['lesson'],cpp:['lesson'],linux:['lesson'],algorithms:['lesson'],tools:['tool'],resources:['resource','recommendation'],recommendations:['recommendation'],sharing:['article'],authors:['article'],announcements:['announcement'],assignments:['assignment']};let q=lab.client.from('foamlab_content').select('id,slug,kind,title,summary,track,series,cover_url,metadata,author_id,author_name,sort_order,pinned,published_at,created_at,updated_at').eq('status','published').in('kind',groups[mode]||['article']).order('sort_order').order('created_at',{ascending:false}).limit(1000);if(mode==='programming')q=q.eq('track','OpenFOAM 编程');if(mode==='cpp')q=q.eq('track','C++ 入门');if(mode==='linux')q=q.eq('track','Linux 入门');if(mode==='algorithms')q=q.ilike('track','%数值%');rows=lab.check(await q).filter(r=>mode!=='courses'||!['Linux 入门','C++ 入门','OpenFOAM 编程','数值方法与理论'].includes(r.track));}
 // Tool collections show the course once; its chapters belong on its own page.
 if(mode==='tools'){
  const series=new Set(rows.filter(r=>r.kind!=='lesson'&&r.metadata?.curriculum_series).map(r=>r.metadata.curriculum_series));
  rows=rows.filter(r=>r.kind!=='lesson'||!series.has(r.series));
 }
 lab.catalog=rows;const catalogAuthors=lab.names(rows.filter(r=>['article','log'].includes(r.kind)).map(r=>r.author_id)).catch(()=>{});
 const search=$('#catalog-query'),filters=$('#catalog-filters'),kindFilters=$('#catalog-kind-filters');
 const kinds=[['','全部资料'],['resource','算例与源码'],['recommendation','资源推荐']];let track='全部',kind='';
 if(kindFilters)kindFilters.hidden=!!D?.available;
 if(kindFilters)kindFilters.innerHTML=kinds.map(([value,label])=>'<button type="button" data-catalog-kind="'+value+'" aria-pressed="false">'+label+'</button>').join('');
 function restoreFilters(){
  const params=new URLSearchParams(location.search);if(search)search.value=params.get('q')||'';
  kind=!D?.available&&mode==='resources'&&kinds.some(([value])=>value===params.get('kind'))?params.get('kind'):'';
  const tracks=['全部',...new Set(rows.filter(r=>!kind||r.kind===kind).map(r=>r.track).filter(Boolean))];
  track=!D?.available&&tracks.includes(params.get('track'))?params.get('track'):'全部';
  if(filters){filters.hidden=D?.available||tracks.length<=2;filters.innerHTML=tracks.map(x=>'<button type="button" data-track="'+esc(x)+'" class="'+(x===track?'selected':'')+'" aria-pressed="'+(x===track)+'">'+esc(x)+'</button>').join('');}
  kindFilters?.querySelectorAll('button').forEach(b=>{const selected=b.dataset.catalogKind===kind;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
 }
 if(mode==='sharing'||mode==='authors'){rows=rows.filter(r=>r.kind==='article').sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||new Date(b.published_at||b.created_at)-new Date(a.published_at||a.created_at));}
 restoreFilters();window.foamListState?.remember(listing);
 if(filters)filters.onclick=e=>{const b=e.target.closest('[data-track]');if(!b)return;window.foamListState?.write({q:search?.value||'',track:b.dataset.track,...(kindFilters?{kind}:{})},true);restoreFilters();render();};
 if(kindFilters)kindFilters.onclick=e=>{const b=e.target.closest('[data-catalog-kind]');if(!b)return;window.foamListState?.write({q:search?.value||'',track:'全部',kind:b.dataset.catalogKind},true);restoreFilters();render();};
 function render(){const words=(search?.value||'').toLowerCase().split(/\s+/).filter(Boolean);const shown=rows.filter(r=>(!kind||r.kind===kind)&&(track==='全部'||r.track===track)&&words.every(w=>[r.title,r.summary,r.track,r.series].join(' ').toLowerCase().includes(w)));if(window.FoamResourcesHub?.render({listing,rows:shown,words,filtered:shown.length!==rows.length,mode,D}))return;listing.innerHTML=window.FoamPagination.slice(listing,shown,render,12).map(lab.card).join('')||'<div class="lab-empty">目前没有符合条件的内容。</div>';if($('#catalog-count'))$('#catalog-count').textContent=shown.length+' 项内容';}
 search?.addEventListener('input',()=>{window.foamListState?.write({q:search.value,track,...(kindFilters?{kind}:{})});render();});window.addEventListener('popstate',()=>{restoreFilters();render();});render();void catalogAuthors.then(()=>{if(!listing.isConnected)return;const byId=new Map(rows.map(row=>[row.id,row]));for(const byline of listing.querySelectorAll('[data-author-content]')){const row=byId.get(byline.dataset.authorContent);if(row)byline.innerHTML=lab.authorMeta(row);}});
 }catch(e){lab.error(listing,e);}finally{lab.reveal(listing);}})();
 // The server resolves article and module reading permissions; generated pages
 // contain an empty reader shell instead of a publicly readable fallback.
 let articleEpoch=0;
 lab.lockArticle=(host,access='member')=>{
  const title={member:'登录后阅读文章',supporter:'充电会员专享',admin:'仅管理员可阅读'}[access]||'登录后阅读文章';
  const description={member:'登录后即可查看完整正文、配置示例与文章讨论。',supporter:'本篇文章向充电会员和管理员开放。',admin:'本篇文章仅供管理员查看。'}[access]||'';
  delete host.dataset.cmsSuspended;host.dataset.cmsState='locked';host.dataset.readAccess=access;
  host.innerHTML='<div class="article-login"><div class="eyebrow">FOAMLAB · 学习资料</div><h1>'+title+'</h1><p>'+description+'</p>'+(!window.foamAuth.user||window.foamAuth.user.is_anonymous?'<button class="button" type="button" data-lab-login>使用 GitHub 登录</button>':'<a class="button secondary" href="/account/">个人中心</a>')+'<a class="text-link" href="/courses/">浏览学习目录 →</a></div>';
  host.closest('.article-shell')?.querySelectorAll('.article-toc').forEach(e=>e.replaceChildren());window.foamCurrentContent=null;document.dispatchEvent(new Event('foamlab:article-locked'));
 };
 lab.suspendArticle=host=>{host.dataset.cmsSuspended='true';host.dataset.cmsState='loading';host.innerHTML='<div class="article-cms-loading" role="status"><span>正在打开文章…</span><i></i><i></i><i></i></div>';host.closest('.article-shell')?.querySelectorAll('.article-toc').forEach(e=>e.replaceChildren());window.foamCurrentContent=null;document.dispatchEvent(new Event('foamlab:article-locked'));};
 lab.readArticle=async(host,slug)=>{
  const epoch=articleEpoch;await lab.contentReady;if(epoch!==articleEpoch)return {locked:true};
  const user=window.foamAuth.user,userId=user?.id||null;
  const stale=()=>{if(epoch!==articleEpoch)return true;if((window.foamAuth.user?.id||null)!==userId){if(window.foamAuth.user&&!window.foamAuth.user.is_anonymous)lab.suspendArticle(host);else lab.lockArticle(host);return true;}return false;};
  if(user&&!user.is_anonymous){
   const result=await lab.client.from('foamlab_content').select('*').eq('slug',slug).eq('status','published').maybeSingle();
   if(stale())return {locked:true};if(result.error){host.dataset.cmsState='error';throw Error('正文暂时无法读取，请刷新重试。');}
   if(result.data){await window.FoamMathRenderer.ready();if(stale())return {locked:true};return {item:result.data};}
  }
  const result=await lab.client.rpc('foamlab_read_article',{p_slug:slug});
  if(stale())return {locked:true};if(result.error||!result.data){host.dataset.cmsState='error';throw Error('正文暂时无法读取，请刷新重试。');}
  const response=result.data;
  if(!response.allowed){lab.lockArticle(host,response.access);return {locked:true};}
  if(response.item){await window.FoamMathRenderer.ready();if(stale())return {locked:true};}
  return {item:response.item};
 };
 const articleHosts=()=>document.querySelectorAll('.article[data-cms-slug]:not([data-cms-slug=""]),#live-article');
 // Clear cached article bodies without treating a page transition as sign-out.
 window.addEventListener('pagehide',()=>{articleEpoch++;articleHosts().forEach(lab.suspendArticle);});
 window.addEventListener('pageshow',e=>{if(e.persisted&&articleHosts().length)location.reload();});
 lab.restoreHash=()=>{if(!location.hash)return;let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const move=()=>{const target=document.getElementById(id);if(!target)return false;requestAnimationFrame(()=>requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'})));return true;};if(move())return;const observer=new MutationObserver(()=>{if(move())observer.disconnect();});observer.observe(document.querySelector('#main'),{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),5000);};
 const cachedArticle=$('[data-cms-slug]:not([data-cms-slug=""])');
 if(cachedArticle)(async()=>{const host=cachedArticle.matches('.article')?cachedArticle:(cachedArticle.querySelector('.article')||cachedArticle);const prose=$('.prose',host),heading=$('h1',host);if(!prose||!heading)return;try{await lab.contentReady;const slug=cachedArticle.dataset.cmsSlug;if(!slug)return;const read=await lab.readArticle(host,slug);if(read.locked)return;const item=read.item;const toc=$('#toc')||$('#live-toc');if(!item||item.metadata?.admin_only){heading.textContent='内容已归档或尚未发布';prose.innerHTML='<div class="lab-empty"><p>这一条目的公开内容已移入归档、回收站或草稿。</p><a class="button secondary" href="/reference/">返回参考资料</a></div>';if(toc)toc.replaceChildren();document.title='内容已归档 · FoamLab';return;}lab.updateBreadcrumb(item);heading.textContent=lab.headingTitle(item);document.title=item.title+' · FoamLab';prose.innerHTML=lab.markdown(item.body);cachedArticle.dataset.cmsState='ready';lab.restoreHash();const description=$('meta[name="description"]');if(description&&item.summary)description.content=item.summary;const state=document.createElement('p');state.className='lab-cms-state article-meta';state.textContent='更新于 '+lab.date(item.updated_at);prose.before(state);if(toc)toc.innerHTML=[...prose.querySelectorAll('h2,h3')].map(h=>'<a href="#'+h.id+'" class="toc-'+h.tagName.toLowerCase()+'">'+esc(h.textContent)+'</a>').join('');const comments=document.createElement('section');comments.className='lab-comments';comments.id='cms-reference-comments';comments.innerHTML='<h2>评论与补充</h2>';host.append(comments);if(item.comments_enabled){try{await lab.messages(comments,{content_id:item.id});}catch(e){lab.error(comments,e);}}else comments.insertAdjacentHTML('beforeend','<p class="muted">这篇内容的评论已关闭。</p>');}catch(e){lab.error(host,e);}finally{if(cachedArticle.dataset.cmsState!=='locked'&&!cachedArticle.dataset.cmsSuspended)cachedArticle.dataset.cmsState='ready';}})();
 const article=$('#live-article');if(article&&matchMedia('(max-width:1100px)').matches){const outline=$('.reader-sections');if(outline)outline.open=false;}
 lab.resolveArticleAlias=async slug=>{
  const aliases=window.foamArticleAliases;if(!aliases||!Object.hasOwn(aliases,slug))return slug;const target=aliases[slug];
  // Activate a redirect only after the merged manuscript is actually published.
  // A new frontend may reach readers before the content transaction completes.
  const result=await lab.client.from('foamlab_content').select('slug,metadata').eq('slug',target.slug).eq('status','published').maybeSingle();
  let active=!!result.data?.metadata?.merged_lessons?.includes(slug);
  if(!result.error&&!result.data){
   const access=await lab.client.rpc('foamlab_read_article',{p_slug:target.slug});
   active=!access.error&&access.data?.allowed===false;
  }
  if(!active)return slug;
  const url=new URL(location.href);let fragment='';try{fragment=decodeURIComponent(url.hash.slice(1));}catch{}
  url.searchParams.set('slug',target.slug);url.hash=target.fragments?.[fragment]||target.hash||'';
  history.replaceState(history.state,'',url);return target.slug;
 };
 if(article){const url=new URL(location.href),target={'fvm-book-04-03':'fvm-book-04-01','fvm-book-20-02':'fvm-book-20-01'}[url.searchParams.get('slug')];if(target){url.searchParams.set('slug',target);history.replaceState(history.state,'',url);}}
 if(article)(async()=>{try{await lab.contentReady;const slug=await lab.resolveArticleAlias(new URLSearchParams(location.search).get('slug'));if(!slug)throw Error('未指定文章。请从课程或资源目录进入。');const read=await lab.readArticle(article,slug);if(read.locked)return;const item=read.item;if(!item||item.metadata?.admin_only){article.innerHTML='<div class="lab-empty"><h1>内容尚未发布或已移入归档</h1><a class="button" href="/courses/">返回学习路径</a></div>';return;}lab.updateBreadcrumb(item);const authorReady=lab.names([item.author_id]).catch(()=>{});document.title=item.title+' · FoamLab';document.querySelector('.lab-reader')?.classList.toggle('has-chapters',item.kind==='lesson'&&!!item.series);article.innerHTML='<div class="eyebrow">'+esc(item.track||item.kind)+'</div><h1>'+esc(lab.headingTitle(item))+'</h1><div class="article-meta community-byline">'+lab.authorMeta(item)+'</div>'+((item.metadata?.turbulence_book||item.metadata?.heat_transfer_book||item.metadata?.kolev_book)?'':'<p class="lab-lead">'+esc(item.summary)+'</p>')+lab.topicLinks(item)+'<div class="prose">'+lab.markdown(item.body)+'</div>'+(item.kind==='article'?'<div class="community-post-actions">'+lab.likeButton('article',item.id)+'</div>':'')+lab.downloadPanel(item)+'<div class="lesson-actions">'+(['lesson','course'].includes(item.kind)?'<button class="button" id="lab-complete">标记为已学</button>':'')+'<a class="button secondary" href="/community/?about='+encodeURIComponent(item.title)+'&amp;from='+encodeURIComponent(item.slug)+'">参与讨论</a></div><section id="lab-comments" class="lab-comments"><h2>评论与补充</h2></section>';
 void authorReady.then(()=>{const byline=article.querySelector(':scope>.article-meta');if(byline)byline.innerHTML=lab.authorMeta(item);});
 lab.restoreHash();
 const toc=$('#live-toc');if(toc)toc.innerHTML=[...article.querySelectorAll('.prose h2,.prose h3')].map(h=>'<a href="#'+h.id+'" class="toc-'+h.tagName.toLowerCase()+'">'+esc(h.textContent)+'</a>').join('');
 void lab.lessonNavigation(article,item);const complete=$('#lab-complete');if(complete){let done=false;if(lab.user){const r=await lab.client.from('foamlab_learning_progress').select('completed').eq('user_id',lab.user.id).eq('content_id',item.id).maybeSingle();done=!!r.data?.completed;}complete.textContent=done?'已学完 · 点击撤销':'标记为已学';complete.onclick=async()=>{if(!lab.user){lab.login();return;}complete.disabled=true;try{await lab.recordCompletion(item.id,!done);done=!done;complete.textContent=done?'已学完 · 点击撤销':'标记为已学';}catch(e){window.foamNotify?.(e.message);}finally{complete.disabled=false;}};}
 if(item.comments_enabled){try{await lab.messages($('#lab-comments'),{content_id:item.id});}catch(e){lab.error($('#lab-comments'),e);}}else $('#lab-comments').insertAdjacentHTML('beforeend','<p class="muted">作者已关闭这篇内容的评论。</p>');
 }catch(e){lab.error(article,e);}})();
 lab.messages=async(host,parent,canReply=true)=>{await lab.ready;return window.FoamReplies.mount(host,parent,canReply);};
 const forum=$('#lab-forum');if(forum)(async()=>{try{await lab.ready;await lab.settingsReady;const forumParams=new URLSearchParams(location.search),id=forumParams.get('topic');if(id){const thread=lab.check(await lab.client.from('foamlab_threads').select('*').eq('id',id).neq('status','hidden').maybeSingle());if(!thread)throw Error('讨论不存在或已隐藏。');const pageHeading=forum.parentElement.querySelector('.page-heading');if(pageHeading)pageHeading.remove();document.title=thread.title+' · 讨论中心 · FoamLab';const names=await lab.names([thread.author_id]);forum.innerHTML='<a class="text-link" href="/community/">← 全部讨论</a><article class="lab-topic"><span class="pill">'+esc(thread.category)+' · '+esc(thread.version)+'</span><h1>'+(thread.pinned?'<span class="pill community-pinned">置顶</span> ':'')+esc(thread.title)+'</h1><div class="article-meta community-byline">'+lab.authorMeta(thread)+'<span>'+esc(({open:'待解决',resolved:'已解决',closed:'已关闭'})[thread.status])+'</span></div><div class="prose">'+lab.markdown(thread.body)+'</div><div class="community-post-actions">'+lab.likeButton('question',thread.id)+(lab.user?.id===thread.author_id?'<a class="text-link" href="/studio/?tab=discussion">管理我的问题 →</a>':'')+'</div>'+(lab.user?.id===thread.author_id&&thread.status!=='closed'?'<button class="button secondary" id="resolve-thread">'+(thread.status==='resolved'?'重新打开问题':'标记问题已解决')+'</button>':'')+'</article><section class="lab-comments" id="thread-replies"><h2>回答与讨论</h2></section>';await lab.messages($('#thread-replies'),{thread_id:id},thread.status!=='closed');$('#resolve-thread')?.addEventListener('click',async e=>{const button=e.currentTarget;button.disabled=true;try{if(thread.accepted_message_id&&thread.status==='resolved')lab.check(await lab.client.rpc('foamlab_accept_answer',{thread_id:id,message_id:null}));else lab.check(await lab.client.from('foamlab_threads').update({status:thread.status==='resolved'?'open':'resolved'}).eq('id',id));location.reload();}catch(err){window.foamNotify?.(err.message);button.disabled=false;}});return;}
 let category='全部',forumStatus=['open','resolved'].includes(forumParams.get('status'))?forumParams.get('status'):'';
 const pageSize=200,statusPages=new Map(),cacheLifetime=30000;
 let statusLoading=false,loadError='',requestVersion=0,statusRequest=null;
 const threadQuery=status=>{let request=lab.client.from('foamlab_threads').select('id,title,category,version,status,pinned,created_at,updated_at,author_id').neq('status','hidden');if(status)request=request.eq('status',status);return request.order('pinned',{ascending:false}).order('created_at',{ascending:false}).order('id');};
 const initialRows=lab.check(await threadQuery(forumStatus).range(0,pageSize-1));
 statusPages.set(forumStatus,{rows:initialRows,offset:initialRows.length,more:initialRows.length===pageSize,at:Date.now()});
 function cachedPage(status){
  const all=statusPages.get(''),saved=statusPages.get(status);
  // A complete all-status page can answer both filters without another request.
  // Partial pages must keep independent server-side pagination for each status.
  if(status&&all&&!all.more&&(!saved||all.at>saved.at)){
   const rows=all.rows.filter(row=>row.status===status),page={rows,offset:rows.length,more:false,at:all.at};statusPages.set(status,page);return page;
  }
  return saved;
 }
 const currentRows=()=>cachedPage(forumStatus)?.rows||[];
 forum.innerHTML='<div class="forum-toolbar"><label class="search-field"><input id="forum-query" type="search" aria-label="搜索讨论" placeholder="搜索问题标题、软件版本与分类"></label><button class="button" id="new-topic">提出问题 +</button></div><div class="filter-tabs" id="forum-status-filters" aria-label="解决状态">'+[['','全部'],['open','待解决'],['resolved','已解决']].map(([value,label])=>'<button type="button" data-forum-status="'+value+'" class="'+(value===forumStatus?'selected':'')+'" aria-pressed="'+String(value===forumStatus)+'">'+label+'</button>').join('')+'</div><div class="filter-tabs" id="forum-filters" aria-label="问题分类">'+['全部','使用问题','网格与几何','数值方法','编程开发','结果与后处理','其他问题'].map((c,i)=>'<button class="'+(!i?'selected':'')+'" aria-pressed="'+String(!i)+'" data-category="'+c+'">'+c+'</button>').join('')+'</div><p class="muted" id="forum-loaded-note"></p><div id="forum-topic-list"></div><button class="button secondary" id="forum-more" type="button">加载更多讨论</button><section id="topic-compose" class="lab-compose" hidden><h2>提出问题</h2><form id="topic-form"><label class="form-field"><span>问题标题</span><input name="title" minlength="5" maxlength="180" required></label><div class="form-grid"><label class="form-field"><span>分类</span><select name="category">'+['使用问题','网格与几何','数值方法','编程开发','结果与后处理','其他问题'].map(c=>'<option>'+c+'</option>').join('')+'</select></label><label class="form-field"><span>软件版本</span><input name="version" value="v2512" maxlength="50" required></label></div><label class="form-field"><span>问题详情 · Markdown / TeX</span><textarea name="body" rows="14" minlength="10" maxlength="40000" required>## 要解决的问题\n\n## 环境与运行命令\n\n```bash\necho "$WM_PROJECT_VERSION"\n```\n\n## 最小配置与报错日志\n\n## 已尝试的方法\n</textarea></label><div class="admin-actions"><button class="button" type="submit">发布到讨论中心</button><button type="button" class="button secondary" id="topic-preview">预览</button></div><div class="prose lab-preview" id="topic-preview-body" hidden></div><p class="form-status" role="status"></p></form></section>';
 function render(){const q=$('#forum-query').value.trim().toLowerCase(),rows=currentRows();const found=rows.filter(t=>(category==='全部'||t.category===category)&&[t.title,t.category,t.version].join(' ').toLowerCase().includes(q));$('#forum-topic-list').innerHTML=found.map(t=>'<article class="community-topic-card"><a class="lab-topic-row" href="/community/?topic='+t.id+'"><span class="topic-symbol">'+(t.status==='resolved'?'✓':t.pinned?'↑':'?')+'</span><div><h3>'+(t.pinned?'<span class="pill community-pinned">置顶</span> ':'')+esc(t.title)+'</h3><p>'+esc(t.category)+' · '+esc(t.version)+'</p><div class="community-byline topic-byline" data-forum-author="'+esc(t.id)+'">'+lab.authorMeta(t)+'</div></div><span class="pill">'+esc(({open:'待解决',resolved:'已解决',closed:'已关闭'})[t.status])+'</span></a>'+lab.likeButton('question',t.id)+'</article>').join('')||(statusLoading?'<div class="lab-empty">正在加载讨论…</div>':loadError?'<div class="lab-empty"><p>讨论暂时无法加载。</p><button type="button" class="button secondary" id="retry-forum">重新加载</button></div>':q.trim()||category!=='全部'||forumStatus?'<div class="lab-empty"><h2>没有匹配的问题</h2><p>可以换一个关键词，或清除筛选查看已加载的讨论。</p><button class="button secondary" type="button" id="clear-forum-filters">清除筛选</button></div>':'<div class="lab-empty"><h2>还没有讨论</h2><p>登录 GitHub 账号后，可以提出第一个问题。</p></div>');const retry=$('#retry-forum');if(retry)retry.onclick=()=>void selectStatus(forumStatus);const clear=$('#clear-forum-filters');if(clear)clear.onclick=()=>{$('#forum-query').value='';category='全部';$('#forum-filters').querySelectorAll('button').forEach(b=>{const selected=b.dataset.category===category;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});if(forumStatus)void selectStatus('');else render();$('#forum-query').focus();};}
 function updateLoaded(){
  const page=cachedPage(forumStatus),note=$('#forum-loaded-note'),more=$('#forum-more');
  note.setAttribute('role','status');note.setAttribute('aria-live','polite');
  note.textContent=statusLoading?(page?'正在更新讨论…':'正在加载讨论…'):loadError?(page?'更新未完成，当前显示已加载的讨论。':'讨论暂时无法加载，请重试。'):'已加载 '+(page?.rows.length||0)+' 个讨论；关键词与分类筛选应用于当前已加载内容。';
  $('#forum-topic-list').setAttribute('aria-busy',String(statusLoading));
  more.hidden=!page?.more;more.disabled=statusLoading;
 }
 function refreshAuthors(rows){
  void lab.names(rows.map(row=>row.author_id)).then(()=>{
   if(!forum.isConnected)return;const byId=new Map(currentRows().map(row=>[row.id,row]));
   for(const node of forum.querySelectorAll('[data-forum-author]')){const row=byId.get(node.dataset.forumAuthor);if(row)node.innerHTML=lab.authorMeta(row);}
  }).catch(()=>{});
 }
 async function loadStatus(append=false){
  statusRequest?.abort();const request=statusRequest=new AbortController(),version=++requestVersion,status=forumStatus,previous=cachedPage(status),offset=append?previous.offset:0;
  statusLoading=true;loadError='';if(!previous)render();updateLoaded();
  const timeout=setTimeout(()=>request.abort(),10000);
  try{
   const batch=lab.check(await threadQuery(status).range(offset,offset+pageSize-1).abortSignal(request.signal));
   if(version!==requestVersion||status!==forumStatus)return;
   const rows=append?[...previous.rows]:[],known=new Set(rows.map(row=>row.id));
   rows.push(...batch.filter(row=>!known.has(row.id)));
   statusPages.set(status,{rows,offset:offset+batch.length,more:batch.length===pageSize,at:append?previous.at:Date.now()});
   // A refreshed all-status list supersedes older status snapshots.
   if(!status&&!append){statusPages.delete('open');statusPages.delete('resolved');}
   statusLoading=false;render();refreshAuthors(rows);
  }catch(error){
   if(version!==requestVersion||status!==forumStatus)return;
   statusLoading=false;loadError=error.message||'讨论暂时无法加载';render();window.foamNotify?.('讨论更新失败，请重试。');
  }finally{clearTimeout(timeout);if(version===requestVersion){statusRequest=null;updateLoaded();}}
 }
 async function selectStatus(next){
  const cached=cachedPage(next),fresh=cached&&Date.now()-cached.at<cacheLifetime;
  if(next===forumStatus&&(statusLoading||fresh&&!loadError))return;
  statusRequest?.abort();statusRequest=null;++requestVersion;statusLoading=false;loadError='';forumStatus=next;
  $('#forum-status-filters').querySelectorAll('button').forEach(button=>{const selected=button.dataset.forumStatus===next;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
  const url=new URL(location.href);if(next)url.searchParams.set('status',next);else url.searchParams.delete('status');history.replaceState(history.state,'',url);
  if(!cached)statusLoading=true;render();updateLoaded();
  if(cached)refreshAuthors(cached.rows);
  if(!fresh)await loadStatus();
 }
 $('#forum-more').onclick=()=>{if(!statusLoading&&cachedPage(forumStatus)?.more)void loadStatus(true);};
 $('#forum-status-filters').onclick=e=>{const button=e.target.closest('[data-forum-status]');if(button)void selectStatus(button.dataset.forumStatus);};
 $('#forum-query').oninput=render;
 $('#forum-filters').onclick=e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;$('#forum-filters').querySelectorAll('button').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});render();};
 window.addEventListener('pagehide',()=>{++requestVersion;statusRequest?.abort();statusRequest=null;statusLoading=false;});
 window.addEventListener('pageshow',event=>{if(event.persisted){statusPages.clear();void loadStatus();}});
 render();updateLoaded();refreshAuthors(initialRows);
 const canCreate=lab.role!=='blocked'&&(lab.settings?.discussion_open!==false||lab.role==='admin');if(!canCreate){$('#new-topic').disabled=true;$('#new-topic').textContent=lab.role==='blocked'?'此账号暂不能发言':'暂时停止新建讨论';$('#forum-topic-list').insertAdjacentHTML('beforebegin','<p class="lab-evidence">'+(lab.role==='blocked'?'此账号的发言权限已停用，仍可阅读公开讨论。':'管理员暂时关闭新建讨论，已有公开问题与回答仍可阅读。')+'</p>');}const source={title:(forumParams.get('about')||'').trim().slice(0,180),slug:'',kind:''};const from=forumParams.get('from')||'';if(/^[a-z0-9][a-z0-9_/-]{0,179}$/.test(from)){try{const result=lab.check(await lab.client.from('foamlab_content').select('slug,title,kind,metadata').eq('slug',from).eq('status','published').maybeSingle());if(result&&!result.metadata?.admin_only){source.title=result.title;source.slug=result.slug;source.kind=result.kind;}}catch{}}
 const compose=$('#topic-compose'),topicForm=$('#topic-form'),newTopic=$('#new-topic');if(source.title){const context=document.createElement('section');context.className='forum-source lab-evidence';context.setAttribute('aria-label','提问来源');const label=document.createElement('strong');label.textContent=source.kind==='lesson'?'来源课程':'来源内容';const description=document.createElement('p');if(source.slug){const link=document.createElement('a');link.href='/read/?slug='+encodeURIComponent(source.slug);link.textContent=source.title+' →';description.append(link);}else description.textContent=source.title;context.append(label,description);forum.prepend(context);context.after(compose);topicForm.elements.title.value='关于「'+source.title.slice(0,160)+'」的问题';if(canCreate)newTopic.textContent=lab.user?(source.kind==='lesson'?'针对本课提问':'针对这篇内容提问'):'登录后提问';}
 function openCompose(scroll=true){compose.hidden=false;if(scroll){compose.scrollIntoView({behavior:'smooth',block:'start'});topicForm.elements.title.focus({preventScroll:true});}}
 newTopic.onclick=async()=>{if(!canCreate)return;if(!lab.user){const u=new URL(location.href);u.searchParams.set('compose','1');history.replaceState(history.state,'',u.pathname+u.search+u.hash);newTopic.disabled=true;try{await lab.login();}catch{window.foamNotify?.('登录暂时无法发起，请稍后重试。');}finally{newTopic.disabled=false;}return;}openCompose();};if(lab.user&&canCreate&&(source.title||forumParams.get('compose')==='1'))openCompose(!source.title);
 $('#topic-preview').onclick=()=>{const p=$('#topic-preview-body');p.innerHTML=lab.markdown($('#topic-form').elements.body.value);p.hidden=!p.hidden;};$('#topic-form').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,b=f.querySelector('[type=submit]');b.disabled=true;try{if(!canCreate)throw Error('当前无法新建讨论。');const title=f.elements.title.value.trim(),body=f.elements.body.value.trim();if(title.length<5||body.length<10)throw Error('标题至少需要 5 个有效字符，问题详情至少需要 10 个有效字符。');await lab.ensureProfile();const r=lab.check(await lab.client.from('foamlab_threads').insert({title,body,category:f.elements.category.value,version:f.elements.version.value,author_id:lab.user.id}).select('id').single());location.href='/community/?topic='+r.id;}catch(err){f.querySelector('.form-status').textContent=err.message;b.disabled=false;}};
 }catch(e){lab.error(forum,e);}})();
})();

