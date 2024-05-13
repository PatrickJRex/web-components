
const thumbnailTemplate  = document.createElement('template');
thumbnailTemplate.innerHTML = `
<style>
.video-modal__play-button {
    position: absolute;
    cursor: pointer;
    width: 100%;
    height: 100%;
    background-color: transparent;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 68px 48px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24 27 14v20" fill="white"/></svg>');
}
.vm-sr-only {
    border: 0 !important;
	clip: rect(1px, 1px, 1px, 1px) !important; /* 1 */
	-webkit-clip-path: inset(50%) !important;
		clip-path: inset(50%) !important;  /* 2 */
	height: 1px !important;
	margin: -1px !important;
	overflow: hidden !important;
	padding: 0 !important;
	position: absolute !important;
	width: 1px !important;
	white-space: nowrap !important;  
}
</style>
 <div class="video-modal__trigger">
   <a href="#" class="video-modal__play-button">
    <span class="vm-sr-only video-modal__play-button-text"></span>
   </a>
 </div>
`;

// Creates a dialog 
const modalTemplate = document.createElement('dialog');
modalTemplate.classList.add('video-modal-dialog');
const modalClose = document.createElement('button');
modalClose.classList.add('video-modal__close');
const modalCloseText = document.createElement('span');
modalCloseText.classList.add('vm-sr-only');
modalCloseText.textContent = "Close";
modalClose.appendChild(modalCloseText);
modalTemplate.append(modalClose);

class VideoModal extends HTMLElement {
 constructor() {
    super();
 }

 destroy() {
    if(modalTemplate.querySelector('iframe')) {
    modalTemplate.querySelector('iframe').remove();
    }
    modalTemplate.close();
 }


 warmup () {
    if(!this.video || VideoModal.warmedUp) return;
    VideoModal.addPrefetchUrl('preconnect', 'https://www.youtube-nocookie.com');
    VideoModal.addPrefetchUrl('preconnect', 'https://www.google.com');
    VideoModal.warmedUp = true;
 }

 static addPrefetchUrl(kind,url, as) {
    const link  = document.createElement('link');
    link.setAttribute('href', url);
    link.setAttribute('rel', kind);
    if(as) {
        link.as = as;
    }
    document.head.append(link);
 }

 get button() {
    return this.hasAttribute('button');
 }

 get video() {
    return this.getAttribute('video');
 }

 get title() {
    return this.getAttribute('title');
 }

 getParams() {
    const params = new URLSearchParams([]);
    params.append('autoplay', 1);
    params.append('playsinline', 1);
    params.append('rel', 0);
    return params;
 }


 createBasicIframe() {
    const iframe = document.createElement('iframe');
    iframe.width = 560;
    iframe.height = 315;
    iframe.title = this.playBtnLabel;
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(this.video)}?${this.getParams().toString()}`
    return iframe; 
 }

 activate() {
   let iframe =  this.createBasicIframe();
   modalTemplate.showModal();
   if(!modalTemplate.querySelector('iframe')) {
    modalTemplate.appendChild(iframe);
   }
   modalTemplate.querySelector('iframe').focus();
    if(this.needsYTApi) {
        // do something else
    }
  } 

  addEventListeners() {
    window.addEventListener('keyup', (e)=> {
        if(e.code.toUpperCase() === 'ESCAPE') {
            this.destroy();
        }
    });
    const dialog = document.querySelectorAll('.video-modal-dialog');
    console.log(dialog)
  }

  setUp() {
    if(!this.video) return;
    if(!this.style.backgroundImage && !this.button) {
     this.style.backgroundImage = `url('http://img.youtube.com/vi/${this.video}/hqdefault.jpg')`;
    }
    if(this.button) {
        this.classList.add('video-modal--as-button');
    }



    this.needsYTApi = navigator.vendor.includes('Apple') || navigator.vendor.includes('Mobi');
    // add connection to modal and add it to the body
    modalClose.addEventListener('click', this.destroy);
    modalTemplate.addEventListener('click', this.destroy);
    document.body.append(modalTemplate);
    this.addEventListener('click', this.activate);
 }


 connectedCallback() {
    // Setting screen reader friendly title
    if(!this.title) {
        this.playBtnLabel = "Play this video";
    }
    // If its not a custom button, let's render a thumbnail in the shadow DOM
    if(!this.button) {
    const shadowRoot = this.attachShadow({ 'mode': 'open' });
    shadowRoot.appendChild(thumbnailTemplate.content.cloneNode(true));
    shadowRoot.querySelector('.video-modal__play-button > span').textContent = this.title || this.playBtnLabel;
    }
    // Warming things up
    this.addEventListener('pointerover', this.warmup, {once: true});
    VideoModal.addPrefetchUrl('preload', `http://img.youtube.com/vi/${this.video}/hqdefault.jpg`, 'image');
    this.setUp();
    this.addEventListeners();

 }

}

customElements.define('video-modal', VideoModal);