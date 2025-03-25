class MainSearch extends SearchForm {
  constructor() {
    super();
    this.allSearchInputs = document.querySelectorAll('input[type="search"]');
    this.searchForContainer = document.querySelector('.predictive-search__search-for');
    this.searchForLink = this.searchForContainer?.querySelector('a');
    this.setupEventListeners();
  }

  setupEventListeners() {
    let allSearchForms = [];
    this.allSearchInputs.forEach((input) => allSearchForms.push(input.form));
    this.input.addEventListener('focus', this.onInputFocus.bind(this));
    if (allSearchForms.length < 2) return;
    allSearchForms.forEach((form) => form.addEventListener('reset', this.onFormReset.bind(this)));
    this.allSearchInputs.forEach((input) => input.addEventListener('input', this.onInput.bind(this)));
  }

  onFormReset(event) {
    super.onFormReset(event);
    if (super.shouldResetForm()) {
      this.keepInSync('', this.input);
    }
  }

  onInput(event) {
    const target = event.target;
    this.keepInSync(target.value, target);

    // Show "Search for…" link
    if (!this.searchForContainer || !this.searchForLink) return;
    const term = target.value.trim();
    if (term.length > 0) {
      this.searchForContainer.style.display = 'block';
      this.searchForLink.textContent = `Search for “${term}”`;
      this.searchForLink.href = `/search?q=${encodeURIComponent(term)}`;
    } else {
      this.searchForContainer.style.display = 'none';
    }
  }

  onInputFocus() {
    const isSmallScreen = window.innerWidth < 750;
    if (isSmallScreen) {
      this.scrollIntoView({ behavior: 'smooth' });
    }
  }

  keepInSync(value, target) {
    this.allSearchInputs.forEach((input) => {
      if (input !== target) {
        input.value = value;
      }
    });
  }
}

customElements.define('main-search', MainSearch);