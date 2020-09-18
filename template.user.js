// ==UserScript==
// @name        name
// @name:ja     name
// @name:zh-CN  name
// @namespace   knoa.jp
// @description description
// @description:ja description
// @description:zh-CN description
// @include     https://*
// @noframes
// @version     1
// @grant       none
// ==/UserScript==

(function(){
  const SCRIPTID = 'SCRIPTID';
  const SCRIPTNAME = 'Script Name';
  const DEBUG = true;/*
[update]

[bug]

[todo]

[possible]

[research]

[memo]
  */
  if(window === top && console.time) console.time(SCRIPTID);
  const MS = 1, SECOND = 1000*MS, MINUTE = 60*SECOND, HOUR = 60*MINUTE, DAY = 24*HOUR, WEEK = 7*DAY, MONTH = 30*DAY, YEAR = 365*DAY;
  const sites = {
    google: {
      url: /^http:\/\/www\.google\.com/,
      targets: {
        element: () => $('body'),
      },
    },
  };
/*
  const site = {
    targets: {
      element: () => $('body'),
    },
    get: {
      element: () => $('body'),
    },
    views: {
      top: {
        url: /^http:\/\/www\.google\.com/,
        targets: {
          element: () => $('body'),
        },
      },
    },
  };
*/
  class Configs{
    constructor(configs){
      Configs.PROPERTIES = {
        text:   {type: 'string', default:  ''},
        volume: {type: 'int',    default: 100},
      };
      this.data = this.read(configs || {});
      /* use Proxy for flexibility */
      return new Proxy(this, {
        get: function(configs, field){
          if(field in configs) return configs[field];
        }
      });
    }
    read(configs){
      let newConfigs = {};
      Object.keys(Configs.PROPERTIES).forEach(key => {
        if(configs[key] === undefined) return newConfigs[key] = Configs.PROPERTIES[key].default;
        switch(Configs.PROPERTIES[key].type){
          case('bool'):  return newConfigs[key] = (configs[key]) ? 1 : 0;
          case('int'):   return newConfigs[key] = parseInt(configs[key]);
          case('float'): return newConfigs[key] = parseFloat(configs[key]);
          default:       return newConfigs[key] = configs[key];
        }
      });
      return newConfigs;
    }
    toJSON(){
      let json = {};
      Object.keys(this.data).forEach(key => {
        json[key] = this.data[key];
      });
      return json;
    }
    set text(text){this.data.text = text;}
    set volume(volume){this.data.volume = volume;}
    get text(){return this.data.text;}
    get volume(){return this.data.volume / 100;}
  }
  let site, view;
  let elements = {}, flags = {}, timers = {}, sizes = {}, panels, configs;
  const core = {
    initialize: function(){
      elements.html = document.documentElement;
      elements.html.classList.add(SCRIPTID);
      site = core.getSite(sites);
      if(site){
        view = core.getView(site.views);
        text.setup(texts);
        core.ready();
        core.addStyle('style');
        core.addStyle('panelStyle');
      }
    },
    ready: function(){
      core.getTargets(site.targets).then(() => {
        log("I'm ready.");
        panels = new Panels(document.body.appendChild(createElement(html.panels())));
      }).catch(e => {
        console.error(`${SCRIPTID}:`, e);
      });
    },
    configs: {
      prepare: function(){
        configs = new Configs(Storage.read('configs') || {});
        core.configs.createButton();
        core.configs.createPanel();
      },
      createButton: function(){
        let config = elements.configButton = createElement(html.configButton());
        config.addEventListener('click', function(e){
          panels.toggle('configs');
        });
        document.body.append(config);
      },
      createPanel: function(){
        let panel = elements.configPanel = createElement(html.configPanel()), items = {};
        Array.from(panel.querySelectorAll('[name]')).forEach(e => items[e.name] = e);
        /* cancel */
        panel.querySelector('button.cancel').addEventListener('click', function(e){
          panels.hide('configs');
          core.configs.createPanel();/*clear*/
        });
        /* save */
        panel.querySelector('button.save').addEventListener('click', function(e){
          configs = new Configs({
            text:   items.text.value,
            volume: items.volume.value,
          });
          Storage.save('configs', configs.toJSON());
          panels.hide('configs');
          core.configs.createPanel();/*clear*/
        });
        panels.add('configs', panel);
      },
    },
    getSite: function(sites){
      Object.keys(sites).forEach(key => sites[key].key = key);
      let key = Object.keys(sites).find(key => sites[key].url.test(location.href));
      if(key === undefined) return log('Doesn\'t match any sites:', location.href);
      else return sites[key];
    },
    getView: function(views){
      Object.keys(views).forEach(key => views[key].key = key);
      let key = Object.keys(views).find(key => views[key].url.test(location.href));
      if(key === undefined) return log('Doesn\'t match any views:', location.href);
      else return views[key];
    },
    getTarget: function(selector, retry = 10, interval = 1*SECOND){
      const key = selector.name;
      const get = function(resolve, reject){
        let selected = selector();
        if(selected === null || selected.length === 0){
          if(--retry) return log(`Not found: ${key}, retrying... (${retry})`), setTimeout(get, interval, resolve, reject);
          else return reject(new Error(`Not found: ${selector.name}, I give up.`));
        }else{
          if(selected.nodeType === Node.ELEMENT_NODE) selected.dataset.selector = key;/* element */
          else selected.forEach((s) => s.dataset.selector = key);/* elements */
          elements[key] = selected;
          resolve(selected);
        }
      };
      return new Promise(function(resolve, reject){
        get(resolve, reject);
      });
    },
    getTargets: function(selectors, retry = 10, interval = 1*SECOND){
      return Promise.all(Object.values(selectors).map(selector => core.getTarget(selector, retry, interval)));
    },
    addStyle: function(name = 'style', d = document){
      if(html[name] === undefined) return;
      if(d.head){
        let style = createElement(html[name]()), id = SCRIPTID + '-' + name, old = d.getElementById(id);
        style.id = id;
        d.head.appendChild(style);
        if(old) old.remove();
      }
      else{
        let observer = observe(d.documentElement, function(){
          if(!d.head) return;
          observer.disconnect();
          core.addStyle(name);
        });
      }
    },
  };
  const texts = {
    '${SCRIPTNAME}': {
      en: () => `${SCRIPTNAME}`,
      ja: () => `${SCRIPTNAME}`,
      zh: () => `${SCRIPTNAME}`,
    },
    '${SCRIPTNAME} preferences': {
      en: () => `${SCRIPTNAME} preferences`,
      ja: () => `${SCRIPTNAME} 設定`,
      zh: () => `${SCRIPTNAME} 设定`,
    },
    'Cancel': {
      en: () => `Cancel`,
      ja: () => `キャンセル`,
      zh: () => `取消`,
    },
    'Save': {
      en: () => `Save`,
      ja: () => `保存`,
      zh: () => `保存`,
    },
  };
  const html = {
    configButton: () => `<button id="${SCRIPTID}-configButton"></button>`,
    panels: () => `<div class="panels" id="${SCRIPTID}-panels" data-panels="0"></div>`,
    configPanel: () => `
      <div class="panel" id="${SCRIPTID}-configPanel" data-order="1">
        <h1>${text('${SCRIPTNAME} preferences')}</h1>
        <fieldset>
          <legend>${text('legend')}</legend>
          <p><label for="config-enable">${text('Enable')}:</label><input type="checkbox" name="enable" id="config-enable" value="1" ${configs.data.enable ? 'checked' : ''}></p>
          <p><label for="config-text" >${text('Text')}: </label><input type="text" name="text" id="config-text" value="${configs.data.text}" placeholder="${text('placeholder')}"></p>
          <p><label for="config-volume">${text('Volume')}<small>(0-100%)</small>:</label><input type="number" name="volume" id="config-volume" value="${configs.data.volume}" min="0" max="100" step="5"></p>
          <p class="note">${text('note')}</p>
        </fieldset>
        <p class="buttons"><button class="cancel">${text('Cancel')}</button><button class="save primary">${text('Save')}</button></p>
      </div>
    `,
    style: () => `
      <style type="text/css">
        #id{
          color: red;
        }
      </style>
    `,
    panelStyle: () => `
      <style type="text/css">
        /* panels default */
        #${SCRIPTID}-panels *{
          font-size: 14px;
          line-height: 20px;
          padding: 0;
          margin: 0;
        }
        #${SCRIPTID}-panels{
          font-family: Arial, sans-serif;
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: hidden;
          pointer-events: none;
          cursor: default;
          z-index: 99999;
        }
        #${SCRIPTID}-panels div.panel{
          position: absolute;
          max-height: 100%;
          overflow: auto;
          left: 50%;
          bottom: 50%;
          transform: translate(-50%, 50%);
          background: rgba(0,0,0,.75);
          transition: 250ms ease-out;
          padding: 5px 0;
          pointer-events: auto;
        }
        #${SCRIPTID}-panels div.panel.hidden{
          transform: translate(-50%, calc(50vh + 100%)) !important;
          display: block !important;
        }
        #${SCRIPTID}-panels div.panel.hidden *{
          animation: none !important;
        }
        #${SCRIPTID}-panels h1,
        #${SCRIPTID}-panels h2,
        #${SCRIPTID}-panels h3,
        #${SCRIPTID}-panels h4,
        #${SCRIPTID}-panels legend,
        #${SCRIPTID}-panels ul,
        #${SCRIPTID}-panels ol,
        #${SCRIPTID}-panels dl,
        #${SCRIPTID}-panels p{
          color: white;
          padding: 2px 10px;
          vertical-align: baseline;
        }
        #${SCRIPTID}-panels legend ~ p,
        #${SCRIPTID}-panels legend ~ ul,
        #${SCRIPTID}-panels legend ~ ol,
        #${SCRIPTID}-panels legend ~ dl{
          padding-left: calc(10px + 14px);
        }
        #${SCRIPTID}-panels header{
          display: flex;
        }
        #${SCRIPTID}-panels header h1{
          flex: 1;
        }
        #${SCRIPTID}-panels fieldset{
          border: none;
        }
        #${SCRIPTID}-panels fieldset > p{
          display: flex;
          align-items: center;
        }
        #${SCRIPTID}-panels fieldset > p:not([class]):hover,
        #${SCRIPTID}-panels fieldset > p.sub:hover{
          background: rgba(255,255,255,.125);
        }
        #${SCRIPTID}-panels fieldset > p > label{
          flex: 1;
        }
        #${SCRIPTID}-panels fieldset > p > input,
        #${SCRIPTID}-panels fieldset > p > textarea,
        #${SCRIPTID}-panels fieldset > p > select{
          color: black;
          background: white;
          padding: 1px 2px;
        }
        #${SCRIPTID}-panels fieldset > p > input,
        #${SCRIPTID}-panels fieldset > p > button{
          box-sizing: border-box;
          height: 20px;
        }
        #${SCRIPTID}-panels fieldset small{
          font-size: 85%;
          margin: 0 0 0 .25em;
        }
        #${SCRIPTID}-panels fieldset sup,
        #${SCRIPTID}-panels fieldset p.note{
          font-size: 10px;
          line-height: 14px;
          color: rgb(192,192,192);
        }
        #${SCRIPTID}-panels a{
          color: inherit;
          font-size: inherit;
          line-height: inherit;
        }
        #${SCRIPTID}-panels a:hover{
          color: rgb(255,255,255);
        }
        #${SCRIPTID}-panels div.panel > p.buttons{
          text-align: right;
          padding: 5px 10px;
        }
        #${SCRIPTID}-panels div.panel > p.buttons button{
          line-height: 1.4;
          width: 120px;
          padding: 5px 10px;
          margin-left: 10px;
          border-radius: 5px;
          color: rgba(255,255,255,1);
          background: rgba(64,64,64,1);
          border: 1px solid rgba(255,255,255,1);
          cursor: pointer;
        }
        #${SCRIPTID}-panels div.panel > p.buttons button.primary{
          font-weight: bold;
          background: rgba(0,0,0,1);
        }
        #${SCRIPTID}-panels div.panel > p.buttons button:hover,
        #${SCRIPTID}-panels div.panel > p.buttons button:focus{
          background: rgba(128,128,128,1);
        }
        #${SCRIPTID}-panels .template{
          display: none !important;
        }
        /* config panel */
        #${SCRIPTID}-configPanel{
          width: 400px;
        }
        [name="text"]{
        }
      </style>
    `,
  };
  const setTimeout = window.setTimeout.bind(window), clearTimeout = window.clearTimeout.bind(window), setInterval = window.setInterval.bind(window), clearInterval = window.clearInterval.bind(window), requestAnimationFrame = window.requestAnimationFrame.bind(window), requestIdleCallback = window.requestIdleCallback.bind(window);
  const alert = window.alert.bind(window), confirm = window.confirm.bind(window), prompt = window.prompt.bind(window), getComputedStyle = window.getComputedStyle.bind(window), fetch = window.fetch.bind(window);
  if(!('isConnected' in Node.prototype)) Object.defineProperty(Node.prototype, 'isConnected', {get: function(){return document.contains(this)}});
  class Storage{
    static key(key){
      return (SCRIPTID) ? (SCRIPTID + '-' + key) : key;
    }
    static save(key, value, expire = null){
      key = Storage.key(key);
      localStorage[key] = JSON.stringify({
        value: value,
        saved: Date.now(),
        expire: expire,
      });
    }
    static read(key){
      key = Storage.key(key);
      if(localStorage[key] === undefined) return undefined;
      let data = JSON.parse(localStorage[key]);
      if(data.value === undefined) return undefined;
      if(data.expire === undefined) return data;
      if(data.expire === null) return data.value;
      if(data.expire < Date.now()) return localStorage.removeItem(key);/*undefined*/
      return data.value;
    }
    static remove(key){
      key = Storage.key(key);
      delete localStorage.removeItem(key);
    }
    static delete(key){
      Storage.remove(key);
    }
    static saved(key){
      key = Storage.key(key);
      if(localStorage[key] === undefined) return undefined;
      let data = JSON.parse(localStorage[key]);
      if(data.saved) return data.saved;
      else return undefined;
    }
  }
  class ShortcutKey{
    constructor(target = window){
      this.OS = this.getOS();
      this.MAP = this.getMAP();
      this.ALIASES = this.getALIASES();
      this.entries = [];/*registered shortcutkeys*/
      this.history = [];/*key stroke history*/
      this.historyLength = 0;/*key stroke history length*/
      this.target = target;
      this.target.addEventListener('keydown', this.listener, {capture: true});
      this.target.addEventListener('keyup',   this.listener, {capture: true});
    }
    getOS(){
      return ['Win', 'Mac'].find(os => navigator.platform.includes(os)) || 'Win';
    }
    getMAP(){
      /* {writtenKey: actualKey} */
      const preset = {ctrl: 'ctrlKey', alt: 'altKey', shift: 'shiftKey', meta: 'metaKey'};
      switch(this.OS){
        case('Win'): return {...preset, win: 'metaKey', windows: 'metaKey', option: 'altKey', cmd: 'ctrlKey', command: 'ctrlKey'};
        case('Mac'): return {...preset, win: 'metaKey', windows: 'metaKey', option: 'altKey', cmd: 'metaKey', command: 'metaKey'};
      }
    }
    getALIASES(){
      return {Space: ' ', Plus: '+', Minus: '-', Numbers: /^[0-9]$/, Digits: /^[0-9]$/};
    }
    add(strokes, f, options = {on: 'keydown'}){
      // Stroke should be either stringified expression or object array.
      // 'a', 'R', '3', '<', 'shift+Space', 'ctrl+p ctrl+Numbers'
      // [{key: 'a'}], [{key: 'r', shift: true}], [{key: 'p', ctrlKey: true}, {key: /[0-9]/, ctrlKey: true}]
      // Keep in mind on various localized keyboard layouts. Shifted keys are not always shifted.
      // https://en.wikipedia.org/wiki/Keyboard_layout
      // Use e.key values, but dedicated ALIASES for Space and Plus.
      // https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent/key/Key_Values
      // Note that alphabet with Alt(option) key brings special characters on Mac.
      if(!Array.isArray(strokes)) strokes = this.parseStroke(strokes);
      if(this.historyLength < strokes.length) this.historyLength = strokes.length;
      this.entries.push({strokes, f, option});
    }
    parseStroke(strokes){
      // 'ctrl+p ctrl+Numbers' => [{key: 'p', ctrlKey: true}, {key: /[0-9]/, ctrlKey: true}]
      strokes = strokes.split(' ').map(stroke => {
        let keys = stroke.split('+'), key = keys[keys.length - 1];
        let object = {key: this.ALIASES[key] || key};
        ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'].forEach(modifier => {
          if(keys.some(key => this.MAP[key] === modifier)) object[modifier] = true;
        });
      });
    }
    listener(e){
      if(e.isComposing) return;
      if(['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;
      this.history.unshift(e);/* newest is on [0] */
      this.history.length = this.historyLength;
      this.entries.forEach(entry => {
        /* check whether keydown or keyup */
        if(entry.option.on !== e.type) return;
        /* check the key matching */
        for(let i = entry.strokes.length - 1, j = 0, stroke; stroke = entry.strokes[i]; i--, j++){
          let {key, ctrlKey, altKey, shiftKey, metaKey} = stroke;
          event = this.history[j]
          /* support special conditions */
          switch(true){
            /* shift+a of the entry should match to A of the event */
            case(/^[a-z]$/.test(key) && !ctrlKey && !altKey &&  shiftKey && !metaKey):
              key = key.toUpperCase();
              break;
            /* A of the entry should match to shift+a of the event */
            case(/^[A-Z]$/.test(key) && !ctrlKey && !altKey && !shiftKey && !metaKey):
              shiftKey = true;
              break;
            /* 1 of the entry should match to physical 1 key even if it could be some shifted or alternated character */
            case(/^[0-9]$/.test(key) && /^(Digit|Numpad)[0-9]$/.test(event.code)):
              event.key = event.code[event.code.length - 1];
              break;
            /* Special characters of the entry should not take an alt or a shift key as condition */
            case(/^[^a-zA-Z0-9 ]$/.test(key)):
              altKey = undefined, shiftKey = undefined;
              break;
          }
          /* matching */
          if(key instanceof RegExp && key.test(event.key) === false) return;
          if(key !== event.key) return;
          if(ctrlKey  && !event.ctrlKey)  return;
          if(altKey   && !event.altKey)   return;
          if(shiftKey && !event.shiftKey) return;
          if(metaKey  && !event.metaKey)  return;
        }
        /* this entry should be fired */
        entry.f(e);
      });
    }
    clear(){
      this.entries = [];
      this.history = [];
      this.historyLength = 0;
    }
    static isOnEditable(target){
      return (['input', 'textarea'].includes(target.localName) || target.contentEditable);
    }
    debug(){
    }
  }
  class Panels{
    constructor(container){
      this.container = container;
      this.panels = {};
      this.listen();
    }
    listen(){
      const EXCLUDES = ['input', 'textarea'];
      window.addEventListener('keydown', (e) => {
        if(e.key !== 'Escape') return;
        if(EXCLUDES.includes(document.activeElement.localName)) return;
        Object.keys(this.panels).forEach(key => this.hide(key));
      }, true);
    }
    add(name, panel){
      this.panels[name] = panel;
    }
    toggle(name){
      if(this.panels[name] === undefined) return;
      let panel = this.panels[name];
      if(panel.isConnected === false || panel.classList.contains('hidden')) this.show(name);
      else this.hide(name);
    }
    show(name){
      if(this.panels[name] === undefined) return;
      let panel = this.panels[name];
      if(panel.isConnected) return;
      panel.classList.add('hidden');
      this.container.appendChild(panel);
      this.container.dataset.panels = parseInt(this.container.dataset.panels) + 1;
      animate(() => panel.classList.remove('hidden'));
    }
    shown(name){
      if(this.panels[name] === undefined) return;
      let panel = this.panels[name];
      return panel.isConnected;
    }
    hide(name){
      if(this.panels[name] === undefined) return;
      let panel = this.panels[name];
      if(panel.classList.contains('hidden')) return;
      panel.classList.add('hidden');
      panel.addEventListener('transitionend', (e) => {
        this.container.removeChild(panel);
        this.container.dataset.panels = parseInt(this.container.dataset.panels) - 1;
      }, {once: true});
    }
    hidden(name){
      if(this.panels[name] === undefined) return;
      return !this.shown(name);
    }
  }
  const text = function(key, ...args){
    if(text.texts[key] === undefined){
      log('Not found text key:', key);
      return key;
    }else return text.texts[key](args);
  };
  text.setup = function(texts, language = undefined){
    let languages = [...window.navigator.languages];
    if(language) languages.unshift(...String(language).split('-').map((p,i,a) => a.slice(0,1+i).join('-')).reverse());
    if(!languages.includes('en')) languages.push('en');
    languages = languages.map(l => l.toLowerCase());
    Object.keys(texts).forEach(key => {
      Object.keys(texts[key]).forEach(l => texts[key][l.toLowerCase()] = texts[key][l]);
      texts[key] = texts[key][languages.find(l => texts[key][l] !== undefined)] || (() => key);
    });
    text.texts = texts;
  };
  const $ = function(s, f = undefined){
    let target = document.querySelector(s);
    if(target === null) return null;
    return f ? f(target) : target;
  };
  const $$ = function(s, f = undefined){
    let targets = document.querySelectorAll(s);
    return f ? f(targets) : targets;
  };
  const animate = function(callback, ...params){requestAnimationFrame(() => requestAnimationFrame(() => callback(...params)))};
  const wait = function(ms){return new Promise((resolve) => setTimeout(resolve, ms))};
  const createElement = function(html = '<div></div>'){
    let outer = document.createElement('div');
    outer.insertAdjacentHTML('afterbegin', html);
    return outer.firstElementChild;
  };
  const createTableRow = function(html = '<tr></tr>'){
    let outer = document.createElement('tbody');
    outer.insertAdjacentHTML('afterbegin', html);
    return outer.firstElementChild;
  };
  const observe = function(element, callback, options = {childList: true, subtree: false, characterData: false, attributes: false, attributeFilter: undefined}){
    let observer = new MutationObserver(callback.bind(element));
    observer.observe(element, options);
    return observer;
  };
  const getScrollbarWidth = function(){
    let div = document.createElement('div');
    div.textContent = 'dummy';
    document.body.appendChild(div);
    div.style.overflowY = 'scroll';
    let clientWidth = div.clientWidth;
    div.style.overflowY = 'hidden';
    let offsetWidth = div.offsetWidth;
    document.body.removeChild(div);
    return offsetWidth - clientWidth;
  };
  const draggable = function(element, grabbable = undefined){
    let screenX, screenY, a, b, c, d, tx, ty;
    const DELAY = 1000;/* catching up mouse position between each mousemoves while fast dragging (ms) */
    const EXCLUDE = ['input', 'textarea', 'button'];
    const mousedown = function(e){
      if(e.button !== 0) return;
      if(EXCLUDE.includes(e.target.localName)) return;
      if(e.target.isContentEditable) return;
      if(e.target !== grabbable) return;
      element.classList.add('dragging');
      [screenX, screenY] = [e.screenX, e.screenY];
      [a,b,c,d,tx,ty] = (getComputedStyle(element).transform.match(/[-0-9.]+/g) || [1,0,0,1,0,0]).map((n) => parseFloat(n));
      window.addEventListener('mousemove', mousemove);
      window.addEventListener('mouseup', mouseup, {once: true});
      document.body.addEventListener('mouseleave', mouseup, {once: true});
      element.addEventListener('mouseleave', mouseleave, {once: true});
    };
    const mousemove = function(e){
      element.style.transform = `matrix(${a},${b},${c},${d},${tx + (e.screenX - screenX)},${ty + (e.screenY - screenY)})`;
    };
    const mouseup = function(e){
      element.classList.remove('dragging');
      window.removeEventListener('mousemove', mousemove);
    };
    const mouseleave = function(e){
      let timer = setTimeout(mouseup, DELAY);
      element.addEventListener('mouseenter', clearTimeout.bind(window, timer), {once: true});
    };
    element.classList.add('draggable');
    element.addEventListener('mousedown', mousedown);
  };
  const linkify = function(node){
    split(node);
    function split(n){
      if(['style', 'script', 'textarea', 'select', 'button', 'a'].includes(n.localName)) return;
      if(n.nodeType === Node.TEXT_NODE){
        let pos = n.data.search(linkify.RE);
        if(pos === -1) return;
        let target = n.splitText(pos);/*pos直前までのnとpos以降のtargetに分割*/
        let rest = target.splitText(RegExp.lastMatch.length);/*targetと続くrestに分割*/
        /* この時点でn(確認済み),target(リンクテキスト),rest(次に処理)の3つに分割されている */
        let a = document.createElement('a');
        let match = target.data.match(linkify.RE);
        switch(true){
          case(match[1] !== undefined): a.href = 'mailto:' + match[1]; break;
          case(match[2] !== undefined): a.href = match[2]; break;
          case(match[3] !== undefined): a.href = 'http://' + match[3]; break;
        }
        a.appendChild(target);/*textContent*/
        rest.before(a);
      }else{
        for(let i = 0; n.childNodes[i]; i++) split(n.childNodes[i]);/*回しながらchildNodesは増えていく*/
      }
    }
  };
  linkify.RE = new RegExp([
    '(\\w[-\\w_.]+@\\w[-\\w_.]+\\w)',/*メールアドレス*/
    '(https?://(?:[-\\w_/~*%$@:;!?&=+#.,]+[-\\w_/~*%$@:;!?&=+#]|\\([^)]*\\))+)',/*通常のURL*/
    '((?:[\\w-]+\\.)+[-\\w_/~*%$@:;!?&=+#.,()]+[-\\w_/~*%$@:;!?&=+#])',/*http://の省略形*/
  ].join('|'));
  const highlight = function(node, string){
    if(node.localName === 'span' && node.classList.contains('highlight')) return;
    if(node.nodeType === Node.TEXT_NODE){
      let pos = node.data.search(string);
      if(pos === -1) return;
      const target = node.splitText(pos);/*pos直前までのnodeとpos以降のtargetに分割*/
      const rest = target.splitText(string.length);/*targetと続くrestに分割*/
      const span = document.createElement('span');
      span.classList.add('highlight');
      span.textContent = string;
      target.replaceWith(span);
    }
    else{
      for(let i = 0; node.childNodes[i]; i++) highlight(node.childNodes[i], string);
    }
  };
  const match = function(string, regexp, f, g = undefined){
    let m = string.match(regexp);
    if(m !== null) return f(m);
    else return g ? g() : null;
  };
  const normalize = function(string){
    return string.replace(/[！-～]/g, function(s){
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    }).replace(normalize.RE, function(s){
      return normalize.KANA[s];
    }).replace(/　/g, ' ').replace(/～/g, '〜');
  };
  normalize.KANA = {
    ｶﾞ:'ガ', ｷﾞ:'ギ', ｸﾞ:'グ', ｹﾞ:'ゲ', ｺﾞ: 'ゴ',
    ｻﾞ:'ザ', ｼﾞ:'ジ', ｽﾞ:'ズ', ｾﾞ:'ゼ', ｿﾞ: 'ゾ',
    ﾀﾞ:'ダ', ﾁﾞ:'ヂ', ﾂﾞ:'ヅ', ﾃﾞ:'デ', ﾄﾞ: 'ド',
    ﾊﾞ:'バ', ﾋﾞ:'ビ', ﾌﾞ:'ブ', ﾍﾞ:'ベ', ﾎﾞ: 'ボ',
    ﾊﾟ:'パ', ﾋﾟ:'ピ', ﾌﾟ:'プ', ﾍﾟ:'ペ', ﾎﾟ: 'ポ',
    ﾜﾞ:'ヷ', ｦﾞ:'ヺ', ｳﾞ:'ヴ',
    ｱ:'ア', ｲ:'イ', ｳ:'ウ', ｴ:'エ', ｵ:'オ',
    ｶ:'カ', ｷ:'キ', ｸ:'ク', ｹ:'ケ', ｺ:'コ',
    ｻ:'サ', ｼ:'シ', ｽ:'ス', ｾ:'セ', ｿ:'ソ',
    ﾀ:'タ', ﾁ:'チ', ﾂ:'ツ', ﾃ:'テ', ﾄ:'ト',
    ﾅ:'ナ', ﾆ:'ニ', ﾇ:'ヌ', ﾈ:'ネ', ﾉ:'ノ',
    ﾊ:'ハ', ﾋ:'ヒ', ﾌ:'フ', ﾍ:'ヘ', ﾎ:'ホ',
    ﾏ:'マ', ﾐ:'ミ', ﾑ:'ム', ﾒ:'メ', ﾓ:'モ',
    ﾔ:'ヤ', ﾕ:'ユ', ﾖ:'ヨ',
    ﾗ:'ラ', ﾘ:'リ', ﾙ:'ル', ﾚ:'レ', ﾛ:'ロ',
    ﾜ:'ワ', ｦ:'ヲ', ﾝ:'ン',
    ｧ:'ァ', ｨ:'ィ', ｩ:'ゥ', ｪ:'ェ', ｫ:'ォ',
    ｯ:'ッ', ｬ:'ャ', ｭ:'ュ', ｮ:'ョ',
    "｡":'。', "､":'、', "ｰ":'ー', "｢":'「', "｣":'」', "･":'・',
  };
  normalize.RE = new RegExp('(' + Object.keys(normalize.KANA).join('|') + ')', 'g');
  const escapeRegExp = function(string){
    return string.replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&'); // $&はマッチした部分文字列全体を意味します
  };
  const escapeHTML = function(string){
    return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  };
  const msToTime = function(ms){
    let floor = Math.floor, zero = (s) => s.toString().padStart(2, '0');
    let d = floor(ms/DAY), h = floor(ms/HOUR)%24, m = floor(ms/MINUTE)%60, s = floor(ms/SECOND)%60;
    if(d) return d + '日と' +      h  + '時間' + zero(m) + '分' + zero(s) + '秒';
    if(h) return h + '時間' + zero(m) + '分'   + zero(s) + '秒';
    if(m) return m + '分'   + zero(s) + '秒';
    if(s) return s + '秒';
  };
  const timeToMs = function(time){
    let parts = time.split(':').map(p => parseFloat(p));
    switch(parts.length){
      case(1): return parts[0]*SECOND;
      case(2): return parts[0]*MINUTE + parts[1]*SECOND;
      case(3): return parts[0]*HOUR   + parts[1]*MINUTE + parts[2]*SECOND;
      default: return 0;
    }
  };
  const atLeast = function(min, b){
    return Math.max(min, b);
  };
  const atMost = function(a, max){
    return Math.min(a, max);
  };
  const between = function(min, b, max){
    return Math.min(Math.max(min, b), max);
  };
  const toMetric = function(number, decimal = 1){
    switch(true){
      case(number < 1e3 ): return (number);
      case(number < 1e6 ): return (number/1e3 ).toFixed(decimal) + 'K';
      case(number < 1e9 ): return (number/1e6 ).toFixed(decimal) + 'M';
      case(number < 1e12): return (number/1e9 ).toFixed(decimal) + 'G';
      default:             return (number/1e12).toFixed(decimal) + 'T';
    }
  };
  const log = function(){
    if(typeof DEBUG === 'undefined') return;
    let l = log.last = log.now || new Date(), n = log.now = new Date();
    let error = new Error(), line = log.format.getLine(error), callers = log.format.getCallers(error);
    //console.log(error.stack);
    console.log(
      SCRIPTID + ':',
      /* 00:00:00.000  */ n.toLocaleTimeString() + '.' + n.getTime().toString().slice(-3),
      /* +0.000s       */ '+' + ((n-l)/1000).toFixed(3) + 's',
      /* :00           */ ':' + line,
      /* caller.caller */ (callers[2] ? callers[2] + '() => ' : '') +
      /* caller        */ (callers[1] || '') + '()',
      ...arguments
    );
  };
  log.formats = [{
      name: 'Firefox Scratchpad',
      detector: /MARKER@Scratchpad/,
      getLine: (e) => e.stack.split('\n')[1].match(/([0-9]+):[0-9]+$/)[1],
      getCallers: (e) => e.stack.match(/^[^@]*(?=@)/gm),
    }, {
      name: 'Firefox Console',
      detector: /MARKER@debugger/,
      getLine: (e) => e.stack.split('\n')[1].match(/([0-9]+):[0-9]+$/)[1],
      getCallers: (e) => e.stack.match(/^[^@]*(?=@)/gm),
    }, {
      name: 'Firefox Greasemonkey 3',
      detector: /\/gm_scripts\//,
      getLine: (e) => e.stack.split('\n')[1].match(/([0-9]+):[0-9]+$/)[1],
      getCallers: (e) => e.stack.match(/^[^@]*(?=@)/gm),
    }, {
      name: 'Firefox Greasemonkey 4+',
      detector: /MARKER@user-script:/,
      getLine: (e) => e.stack.split('\n')[1].match(/([0-9]+):[0-9]+$/)[1] - 500,
      getCallers: (e) => e.stack.match(/^[^@]*(?=@)/gm),
    }, {
      name: 'Firefox Tampermonkey',
      detector: /MARKER@moz-extension:/,
      getLine: (e) => e.stack.split('\n')[1].match(/([0-9]+):[0-9]+$/)[1] - 2,
      getCallers: (e) => e.stack.match(/^[^@]*(?=@)/gm),
    }, {
      name: 'Chrome Console',
      detector: /at MARKER \(<anonymous>/,
      getLine: (e) => e.stack.split('\n')[2].match(/([0-9]+):[0-9]+\)?$/)[1],
      getCallers: (e) => e.stack.match(/[^ ]+(?= \(<anonymous>)/gm),
    }, {
      name: 'Chrome Tampermonkey',
      detector: /at MARKER \(chrome-extension:.*?\/userscript.html\?name=/,
      getLine: (e) => e.stack.split('\n')[2].match(/([0-9]+):[0-9]+\)?$/)[1] - 1,
      getCallers: (e) => e.stack.match(/[^ ]+(?= \(chrome-extension:)/gm),
    }, {
      name: 'Chrome Extension',
      detector: /at MARKER \(chrome-extension:/,
      getLine: (e) => e.stack.split('\n')[2].match(/([0-9]+):[0-9]+\)?$/)[1],
      getCallers: (e) => e.stack.match(/[^ ]+(?= \(chrome-extension:)/gm),
    }, {
      name: 'Edge Console',
      detector: /at MARKER \(eval/,
      getLine: (e) => e.stack.split('\n')[2].match(/([0-9]+):[0-9]+\)$/)[1],
      getCallers: (e) => e.stack.match(/[^ ]+(?= \(eval)/gm),
    }, {
      name: 'Edge Tampermonkey',
      detector: /at MARKER \(Function/,
      getLine: (e) => e.stack.split('\n')[2].match(/([0-9]+):[0-9]+\)$/)[1] - 4,
      getCallers: (e) => e.stack.match(/[^ ]+(?= \(Function)/gm),
    }, {
      name: 'Safari',
      detector: /^MARKER$/m,
      getLine: (e) => 0,/*e.lineが用意されているが最終呼び出し位置のみ*/
      getCallers: (e) => e.stack.split('\n'),
    }, {
      name: 'Default',
      detector: /./,
      getLine: (e) => 0,
      getCallers: (e) => [],
  }];
  log.format = log.formats.find(function MARKER(f){
    if(!f.detector.test(new Error().stack)) return false;
    //console.log('////', f.name, 'wants', 0/*line*/, '\n' + new Error().stack);
    return true;
  });
  const warn = function(){
    if(typeof DEBUG === 'undefined') return;
    let body = Array.from(arguments).join(' ');
    if(warn.notifications[body]) return;
    Notification.requestPermission();
    warn.notifications[body] = new Notification(SCRIPTNAME, {body: body});
    warn.notifications[body].addEventListener('click', function(e){
      Object.values(warn.notifications).forEach(n => n.close());
      warn.notifications = {};
    });
    log(body);
  };
  warn.notifications = {};
  const time = function(label){
    if(typeof DEBUG === 'undefined') return;
    const BAR = '|', TOTAL = 100;
    switch(true){
      case(label === undefined):/* time() to output total */
        let total = 0;
        Object.keys(time.records).forEach((label) => total += time.records[label].total);
        Object.keys(time.records).forEach((label) => {
          console.log(
            BAR.repeat((time.records[label].total / total) * TOTAL),
            label + ':',
            (time.records[label].total).toFixed(3) + 'ms',
            '(' + time.records[label].count + ')',
          );
        });
        time.records = {};
        break;
      case(!time.records[label]):/* time('label') to create and start the record */
        time.records[label] = {count: 0, from: performance.now(), total: 0};
        break;
      case(time.records[label].from === null):/* time('label') to re-start the lap */
        time.records[label].from = performance.now();
        break;
      case(0 < time.records[label].from):/* time('label') to add lap time to the record */
        time.records[label].total += performance.now() - time.records[label].from;
        time.records[label].from = null;
        time.records[label].count += 1;
        break;
    }
  };
  time.records = {};
  core.initialize();
  if(window === top && console.timeEnd) console.timeEnd(SCRIPTID);
})();
