class UpsellProduct extends HTMLElement {
  constructor() {
    super();

    this.productList = [];

    this.init();
  }

  /**
   * Initializes the UpsellProduct by retrieving the last visited products from local storage
   * and setting the current product. It also adds an event listener to render the upsell list
   * when the DOM content is loaded.
   *
   * @return {void}
   */
  init() {
    this.productList = JSON.parse(window.localStorage.getItem('lastVisitedProducts_V1') || '[]');
    this.currentProduct = this.dataset.productHanlde;

    document.addEventListener('DOMContentLoaded', () => {
      this.renderUpsellList();
    });
  }

  /**
   * Renders the list of upsell products by fetching their card views and appending them to the DOM.
   *
   * @return {Promise} A promise that resolves when all product cards have been loaded and appended.
   */
  renderUpsellList() {
    if (this.productList.length > 0) {
      Promise.all(
        this.productList.map(async (product) => {
          if (product !== this.currentProduct) {
            await fetch(`/products/${product}?view=card`)
              .then((res) => res.text())
              .then((res) => {
                const text = res;
                const parser = new DOMParser();
                const htmlDocument = parser.parseFromString(text, 'text/html');
                const productCard = htmlDocument.documentElement.querySelector('.card-wrapper');
                if (productCard) {
                  this.append(productCard);
                }
              })
              .catch((err) => console.error(`[Shopify Wishlist] Failed to load content for handle: ${handle}`, err));
          }
        })
      ).then(() => {
        this.buildSlider('.splide.splide_upsell');
      });
    }
  }

  /**
   * Initializes and mounts a Splide slider instance.
   *
   * @param {string} selector - The CSS selector for the slider container.
   * @return {void}
   */
  buildSlider(selector) {
    new Splide(`${selector}`, {
      perPage: 1,
      gap: 10,
      padding: { left: 0, right: 50 },
    }).mount();
  }
}

customElements.define('upsell-product', UpsellProduct);

/**
 * Last Visited Products Counter
 */
class LastVisitedProducts extends HTMLElement {
  constructor() {
    super();

    this.visitedProductsList = [];
    this.currentProduct = null;

    this.init();
  }

  /**
   * Initializes the LastVisitedProducts by retrieving the last visited products from local storage
   * and setting the current product. It also updates the list of visited products.
   *
   * @return {void}
   */
  init() {
    this.visitedProductsList = JSON.parse(window.localStorage.getItem('lastVisitedProducts_V1') || '[]');
    this.currentProduct = this.dataset.productHandle;

    this.updateList();
  }

  /**
   * Updates the list of visited products by adding the current product if it's not already included.
   *
   * @return {void}
   */
  updateList() {
    if (this.currentProduct) {
      if (!this.visitedProductsList.includes(this.currentProduct)) {
        this.visitedProductsList.push(this.currentProduct);
        window.localStorage.setItem('lastVisitedProducts_V1', JSON.stringify(this.visitedProductsList));
      }
    }
  }
}

customElements.define('last-visited-products', LastVisitedProducts);
