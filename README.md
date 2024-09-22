# Shopify Developer Test - Dynamic Upsell Section

Technical test for frontend developer position

Author: Jahiker Rojas -
<https://jahiker.github.io/jahiker/>

## Store preview

Theme: <https://jr-dev-shop.myshopify.com/?_ab=0&_bt=eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaEpJaDVxY2kxa1pYWXRjMmh2Y0M1dGVYTm9iM0JwWm5rdVkyOXRCam9HUlZRPSIsImV4cCI6IjIwMjQtMDktMjJUMjM6NTc6MTIuOTcyWiIsInB1ciI6InBlcm1hbmVudF9wYXNzd29yZF9ieXBhc3MifX0%3D--3ca60d465b8646a423b3b258fabf72fd0bbaea7a&_fd=0&_sc=1&key=87718d973041cc7838cc0f711b1b674103187fdaf2f40f571ac0250cf54e96ec&preview_theme_id=144956621014>

Password: devstore

## Github repo

<https://github.com/Jahiker/raincityagency-test>

## Upsell feature

I added a new block section on the PDP for the upsell section

```javascript
{
    "type": "upsell",
    "name": "t:sections.main-product.blocks.upsell.name",
    "settings": [
    {
        "type": "text",
        "id": "title",
        "label": "t:sections.main-product.blocks.upsell.settings.title",
        "default": "Upsell"
    }
    ]
}
```

and the case for the block on the main product section

```liquid
{%- when 'upsell' -%}
    {% render 'upsell', title: block.settings.title %}
```

<https://github.com/Jahiker/raincityagency-test/blob/main/sections/main-product.liquid>

For register every PDP that the customer visit, I added a web component that save thet product handle on a array and save it on the localstorage

```javascript
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
```

and then for rendering the upsell products list, I create another web component that get the visited products list and then loop into the array and using the rendering section api, get the product card snippet for every product on the list and appen into the section

```javascript
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
```

<https://github.com/Jahiker/raincityagency-test/blob/main/assets/upsell.js>

for getting the product card snippet, I created a new template with just a new snippet product-card-upsell.liquid and then using the parameter "?view=card" on the endpoint, it let get all the html for the product that i require.

```liquid
{% render 'card-product-upsell',
  card_product: product,
  media_aspect_ratio: 'adapt',
  show_secondary_image: true,
  show_vendor: true,
  show_rating: false,
  show_quick_add: false,
  quick_add: true,
  section_id: 'MainProduct-{{ product.id }}',
  color_family_mobile: true
%}
```
