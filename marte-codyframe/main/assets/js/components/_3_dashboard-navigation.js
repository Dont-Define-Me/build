// File#: _3_dashboard-navigation
// Usage: codyhouse.co/license
(function() {
  var appUi = document.getElementsByClassName('js-app-ui');
  if(appUi.length > 0) {
    var appMenuBtn = appUi[0].getElementsByClassName('js-app-ui__menu-btn');
    if(appMenuBtn.length < 1) return;
    var appExpandedClass = 'app-ui--nav-expanded';
    var firstFocusableElement = false,
      // we'll use these to store the node that needs to receive focus when the mobile menu is closed 
      focusMenu = false;

    // toggle navigation on mobile
    appMenuBtn[0].addEventListener('click', function(event) {
      var openMenu = !Util.hasClass(appUi[0], appExpandedClass);
      Util.toggleClass(appUi[0], appExpandedClass, openMenu);
      appMenuBtn[0].setAttribute('aria-expanded', openMenu);
      if(openMenu) {
        firstFocusableElement = getMenuFirstFocusable();
        if(firstFocusableElement) firstFocusableElement.focus(); // move focus to first focusable element
      } else if(focusMenu) {
        focusMenu.focus();
        focusMenu = false;
      }
    });

    // listen for key events
    window.addEventListener('keyup', function(event){
      // listen for esc key
      if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
        // close navigation on mobile if open
        if(appMenuBtn[0].getAttribute('aria-expanded') == 'true' && isVisible(appMenuBtn[0])) {
          focusMenu = appMenuBtn[0]; // move focus to menu trigger when menu is close
          appMenuBtn[0].click();
        }
      }
      // listen for tab key
      if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
        // close navigation on mobile if open when nav loses focus
        if(appMenuBtn[0].getAttribute('aria-expanded') == 'true' && isVisible(appMenuBtn[0]) && !document.activeElement.closest('.js-app-ui__nav')) appMenuBtn[0].click();
      }
    });
    
    // listen for resize
    var resizingId = false;
    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 500);
    });

    function doneResizing() {
      if( !isVisible(appMenuBtn[0]) && Util.hasClass(appUi[0], appExpandedClass)) appMenuBtn[0].click();
    };

    function getMenuFirstFocusable() {
      var mobileNav = appUi[0].getElementsByClassName('js-app-ui__nav');
      if(mobileNav.length < 1) return false;
      var focusableEle = mobileNav[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [controls], summary'),
        firstFocusable = false;
      for(var i = 0; i < focusableEle.length; i++) {
        if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
          firstFocusable = focusableEle[i];
          break;
        }
      }
      
      return firstFocusable;
    };
    
    function isVisible(element) {
      return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    };
  }
}());