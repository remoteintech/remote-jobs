class CustomMasonry extends HTMLElement {
  constructor() {
    super();
    this.layoutMasonry = this.layoutMasonry.bind(this);
  }

  connectedCallback() {
    // Defer initial layout to ensure styles are applied
    requestAnimationFrame(() => {
      this.layoutMasonry();
      window.addEventListener('resize', this.debounceLayout.bind(this, 100));
    });
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.debounceLayout);
  }

  debounceLayout(delay) {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(this.layoutMasonry, delay);
  }

  layoutMasonry() {
    const columnCount = getComputedStyle(this).gridTemplateColumns.split(' ').length;
    const items = Array.from(this.children);
    items.forEach((item, index) => {
      item.style.marginTop = '0px'; // Reset before calculation
      if (index >= columnCount) {
        const previousItem = items[index - columnCount];
        const previousItemBottom =
          previousItem.offsetTop + previousItem.offsetHeight + parseFloat(getComputedStyle(this).rowGap);
        const currentItemTop = item.offsetTop;
        const marginTop = previousItemBottom - currentItemTop;
        item.style.marginTop = `${marginTop}px`;
      }
    });
  }
}

customElements.define('custom-masonry', CustomMasonry);
