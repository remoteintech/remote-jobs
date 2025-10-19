class customEasteregg extends HTMLElement {
  constructor() {
    super();
    // Initialize with default keywords
    this.keywords = ['eleventy', 'excellent'];
    // Add any custom keyword passed as an attribute
    const customKeyword = this.getAttribute('keyword');
    if (customKeyword) {
      this.keywords.push(customKeyword);
    }

    this.shape = this.getAttribute('shape') || '⭐️';
    this.particleCount = parseInt(this.getAttribute('particle-count'), 10) || 30;
    this.codes = this.keywords.map(keyword => keyword.split(''));
    this.indexes = new Array(this.keywords.length).fill(0);
  }

  connectedCallback() {
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  handleKeydown(event) {
    const key = event.key.toLowerCase();
    this.codes.forEach((code, idx) => {
      if (code[this.indexes[idx]] === key) {
        this.indexes[idx]++;
        if (this.indexes[idx] === code.length) {
          this.triggerEffect(this.keywords[idx]);
          this.indexes[idx] = 0; // Reset index after triggering
        }
      } else {
        this.indexes[idx] = 0; // Reset index if sequence breaks
      }
    });
  }

  triggerEffect(keyword) {
    console.log(`Hooray ${keyword}!`);
    import('https://esm.run/canvas-confetti').then(({default: confetti}) => {
      const scalar = 4;
      const customShape = confetti.shapeFromText({text: this.shape, scalar});

      confetti({
        shapes: [customShape],
        scalar,
        particleCount: this.particleCount
      });
    });
  }
}

customElements.define('custom-easteregg', customEasteregg);
