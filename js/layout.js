(() => {
  'use strict';

  /**
   * Class constructor for Layout MDL component.
   *
   * @constructor
   * @param {HTMLElement} element The element that will be upgraded.
   */
  const MaterialLayout = function MaterialLayout(element) {
    this.element_ = element;

    // Initialize instance.
    this.init();
  };
  window['MaterialLayout'] = MaterialLayout;

  /**
   * Keycodes, for code readability.
   *
   * @enum {number}
   * @private
   */
  MaterialLayout.prototype.Keycodes_ = {
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32
  };

  /**
   * Store strings for class names defined by this component that are used in
   * JavaScript. This allows us to simply change it in one place should we
   * decide to modify at a later date.
   *
   * @enum {string}
   * @private
   */
  MaterialLayout.prototype.CssClasses_ = {
    DRAWER_BTN: 'mdl-layout__drawer-button',

    IS_COMPACT: 'is-compact',
    IS_SMALL_SCREEN: 'is-small-screen',
    IS_DRAWER_OPEN: 'is-visible',
    IS_ACTIVE: 'is-active'
  };

  /**
   * Handles a keyboard event on the drawer.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
  MaterialLayout.prototype.keyboardEventHandler_ = function(evt) {
    // Only react when the drawer is open.
    if (evt.keyCode === this.Keycodes_.ESCAPE &&
        this.drawer_.classList.contains(this.CssClasses_.IS_DRAWER_OPEN)) {
      this.toggleDrawer();
    }
  };

  /**
   * Handles changes in screen size.
   *
   * @private
   */
  MaterialLayout.prototype.screenSizeHandler_ = function() {
    if (this.screenSizeMediaQuery_.matches) {
      this.element_.classList.add(this.CssClasses_.IS_SMALL_SCREEN);
    } else {
      this.element_.classList.remove(this.CssClasses_.IS_SMALL_SCREEN);
      // Collapse drawer (if any) when moving to a large screen size.
      if (this.drawer_) {
        this.drawer_.classList.remove(this.CssClasses_.IS_DRAWER_OPEN);
        this.obfuscator_.classList.remove(this.CssClasses_.IS_DRAWER_OPEN);
      }
    }
  };

  /**
   * Handles events of drawer button.
   *
   * @param {Event} evt The event that fired.
   * @private
   */
  MaterialLayout.prototype.drawerToggleHandler_ = function(evt) {
    if (evt && (evt.type === 'keydown')) {
      if (evt.keyCode === this.Keycodes_.SPACE ||
        evt.keyCode === this.Keycodes_.ENTER) {
        // prevent scrolling in drawer nav
        evt.preventDefault();
      } else {
        // prevent other keys
        return;
      }
    }

    this.toggleDrawer();
  };

  /**
  * Toggle drawer state
  *
  * @public
  */
  MaterialLayout.prototype.toggleDrawer = function() {
    const drawerButton = this.element_
      .querySelector(`.${this.CssClasses_.DRAWER_BTN}`);
    this.drawer_.classList.toggle(this.CssClasses_.IS_DRAWER_OPEN);
    this.obfuscator_.classList.toggle(this.CssClasses_.IS_DRAWER_OPEN);

    // Set accessibility properties.
    if (this.drawer_.classList.contains(this.CssClasses_.IS_DRAWER_OPEN)) {
      this.drawer_.setAttribute('aria-hidden', 'false');
      drawerButton.setAttribute('aria-expanded', 'true');
    } else {
      this.drawer_.setAttribute('aria-hidden', 'true');
      drawerButton.setAttribute('aria-expanded', 'false');
    }
  };

  /**
   * Initialize element.
   */
  MaterialLayout.prototype.init = function() {
    if (this.element_) {
      const focusedElement = this.element_.querySelector(':focus');

      if (focusedElement) {
        focusedElement.focus();
      }

      const directChildren = this.element_.childNodes;
      const numChildren = directChildren.length;
      for (let c = 0; c < numChildren; c++) {
        const child = directChildren[c];
        if (child.classList &&
            child.classList.contains('mdl-layout__header')) {
          this.header_ = child;
        }

        if (child.classList &&
            child.classList.contains('mdl-layout__drawer')) {
          this.drawer_ = child;
        }

        if (child.classList &&
            child.classList.contains('mdl-layout__content')) {
          this.content_ = child;
        }
      }

      window.addEventListener('pageshow', function(e) {
        if (e.persisted) { // when page is loaded from back/forward cache
          // trigger repaint to let layout scroll in safari
          this.element_.style.overflowY = 'hidden';
          requestAnimationFrame(function() {
            this.element_.style.overflowY = '';
          }.bind(this));
        }
      }.bind(this), false);

      if (this.drawer_) {
        let drawerButton = this.element_
          .querySelector(`.${this.CssClasses_.DRAWER_BTN}`);

        drawerButton.addEventListener('click',
            this.drawerToggleHandler_.bind(this));

        drawerButton.addEventListener('keydown',
            this.drawerToggleHandler_.bind(this));

        this.element_.classList.add('has-drawer');

        this.obfuscator_ = document.querySelector('.mdl-layout__obfuscator');
        this.obfuscator_.addEventListener('click',
            this.drawerToggleHandler_.bind(this));

        this.drawer_
          .addEventListener('keydown', this.keyboardEventHandler_.bind(this));
        this.drawer_.setAttribute('aria-hidden', 'true');
      }

      // Keep an eye on screen size, and add/remove auxiliary class for styling
      // of small screens.
      this.screenSizeMediaQuery_ = window.matchMedia('(max-width: 1024px)');
      this.screenSizeMediaQuery_
        .addListener(this.screenSizeHandler_.bind(this));
      this.screenSizeHandler_();

      this.element_.classList.add('is-upgraded');
    }
  };

  // The component registers itself. It can assume componentHandler is available
  // in the global scope.
  componentHandler.register({
    constructor: MaterialLayout,
    classAsString: 'MaterialLayout',
    cssClass: 'mdl-js-layout'
  });
})();
