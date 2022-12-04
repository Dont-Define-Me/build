// File#: _1_toast
// Usage: codyhouse.co/license
(function() {
    var Toasts = function() {
      this.toastsEl = document.getElementsByClassName('js-toast');
      this.toastsId = getRandomInt(0, 1000);
      this.index = 0;
      this.closingToast = false;
      initToasts(this);
    };
  
    // public method to initialize new toast elements
    Toasts.prototype.initToast = function(element) {
      initSingleToast(this, element);
    };
  
    function initToasts(obj) {
      // create a wrapper element for each toast variation
      createWrapper(obj, 'top-right');
      createWrapper(obj, 'top-left');
      createWrapper(obj, 'top-center');
      createWrapper(obj, 'bottom-right');
      createWrapper(obj, 'bottom-left');
      createWrapper(obj, 'bottom-center');
  
      // init single toast element
      for(var i = 0; i < obj.toastsEl.length; i++) {
        initSingleToast(obj, obj.toastsEl[i]);
      }
  
      // listen for dynamic toast creation
      window.addEventListener('newToast', function(event) {
        initSingleToast(obj, event.detail);
      });
    };
  
    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min) + min); 
    };
  
    function createWrapper(obj, position) {
      var classes = 'top-0 left-0 flex-column';
      if(position == 'top-right') classes = 'top-0 right-0 flex-column';
      if(position == 'top-center') classes = 'top-0 left-50% -translate-x-50% flex-column items-center';
      if(position == 'bottom-right') classes = 'bottom-0 right-0 flex-column-reverse';
      if(position == 'bottom-left') classes = 'bottom-0 left-0 flex-column-reverse';
      if(position == 'bottom-center') classes = 'bottom-0 left-50% -translate-x-50% flex-column-reverse items-center';
  
      var div = '<div class="toast-wrapper position-fixed flex '+classes+'" id="toast-wrapper-'+position+'"></div>';
      document.body.insertAdjacentHTML('beforeend', div);
      obj[position] = document.getElementById('toast-wrapper-'+position);
    };
  
    function initSingleToast(obj, toast) {
      var id = 'toast-'+obj.toastsId+'-'+obj.index;
      obj.index = obj.index + 1;
      // store toast info in the Toasts obj
      obj[id] = {};
      obj[id]['interval'] = toast.getAttribute('data-toast-interval') || 5000,
      obj[id]['intervalId'] = false;
      obj[id]['closing'] = false;
      // get position type
      var classes = toast.getAttribute('class');
      obj[id]['position'] = 'top-right';
      if(classes.indexOf('toast--top-left') > -1) obj[id]['position'] = 'top-left';
      if(classes.indexOf('toast--top-center') > -1) obj[id]['position'] = 'top-center';
      if(classes.indexOf('toast--bottom-right') > -1) obj[id]['position'] = 'bottom-right';
      if(classes.indexOf('toast--bottom-left') > -1) obj[id]['position'] = 'bottom-left'; 
      if(classes.indexOf('toast--bottom-center') > -1) obj[id]['position'] = 'bottom-center';
  
      // listen for custom open event
      toast.addEventListener('openToast', function() {
        if(!Util.hasClass(toast, 'toast--hidden') || obj[id]['closing']) return;
        openToast(obj, toast, id);
      });
  
      // close toast
      toast.addEventListener('click', function(event){
        if(event.target.closest('.js-toast__close-btn')) {
          obj.closingToast = true;
          closeToast(obj, toast, id);
        }
      });
    };
  
    function openToast(obj, toast, id) {
      if(obj[id]['intervalId']) {
        clearInterval(obj[id]['intervalId']);
        obj[id]['intervalId'] = false;
      }
      // place toast - insert in the proper container
      var fragment = document.createDocumentFragment();
      fragment.appendChild(toast);
      obj[obj[id]['position']].appendChild(fragment);
  
      // change position
      toast.style.position = 'static';
  
      // show toast
      setTimeout(function() {
        Util.removeClass(toast, 'toast--hidden');
      });
      
      // automatically close after a time interval
      if(obj[id]['interval'] && parseInt(obj[id]['interval']) > 0) {
        setToastInterval(obj, toast, id, obj[id]['interval']);
      }
    };
  
    function setToastInterval(obj, toast, id, interval) {
      obj[id]['intervalId'] = setTimeout(function(){
        if(obj.closingToast) return setToastInterval(obj, toast, id, 1000);
        closeToast(obj, toast, id);
      }, interval);
    };
  
    function closeToast(obj, toast, id) {
      obj[id]['closing'] = true;
      Util.addClass(toast, 'toast--hidden');
      // clear timeout
      if(obj[id]['intervalId']) clearTimeout(obj[id]['intervalId']);
      // remove toast and animate siblings
      closeToastAnimation(obj, toast, id);    
    };
  
    function closeToastAnimation(obj, toast, id) {
      // get all next elements 
      var siblings = getToastNextSiblings(toast);
      // get translate value (could be positive or negative based on position)
      var toastStyle = window.getComputedStyle(toast),
        margin = parseInt(toastStyle.getPropertyValue('margin-top')) || parseInt(toastStyle.getPropertyValue('margin-bottom'));
      // translate next elements if any
      var translate = toast.offsetHeight + margin;
      if(obj[id]['position'].indexOf('top') > -1) {
        translate = '-'+translate
      }
      for(var i = 0; i < siblings.length; i++) {
        siblings[i].style.transform = 'translateY('+translate+'px)';
      }
      // remove toast and reset translate
      toast.addEventListener('transitionend', function cb(event){
        if(event.propertyName != 'opacity') return;
        toast.removeEventListener('transitionend', cb);
        removeToast(toast, siblings, obj, id);
        obj.closingToast = false;
      });
    };
  
    function getToastNextSiblings(toast) {
      var array = [];
      var nextSibling = toast.nextElementSibling;
      if(nextSibling) {
        array.push(nextSibling);
        var nextSiblingsIterate = getToastNextSiblings(nextSibling);
        Array.prototype.push.apply(array, nextSiblingsIterate);
      }
      return array;
    };
  
    function removeToast(toast, siblings, obj, id) {
      // reset position
      toast.style.position = '';
  
      // move toast back to body
      var fragment = document.createDocumentFragment();
      fragment.appendChild(toast);
      document.body.appendChild(fragment); 
  
      // reset siblings translate
      for(var i = 0; i < siblings.length; i++) {
        (function(i){
          // set transition to none
          siblings[i].style.transition = 'none';
          siblings[i].style.transform = '';
          setTimeout(function() {siblings[i].style.transition = '';}, 10);
        })(i);
      }
  
      // reset closing status
      obj[id]['closing'] = false;
    };
  
    window.Toasts = Toasts;
  
    //initialize the Toasts objects
    var toasts = document.getElementsByClassName('js-toast');
    if( toasts.length > 0 ) {
      new Toasts();
    }
  }());