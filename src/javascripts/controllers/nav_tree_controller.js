import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ['item'];
  static classes = ['active'];

  connect() {
    this.itemTargets.forEach(item => {
      if (item.href === window.location.pathname) {
        item.classList.add(this.activeClass);
      }
    });

    this.itemTargets.forEach(item => {
      item.addEventListener('click', () => {
        this.itemTargets.forEach(item => {
          item.classList.remove(this.activeClass);
        });
        item.classList.add(this.activeClass);
      });
    });

    document.addEventListener("turbo:load", () => this.#updateActiveItem())
  }

  disconnect() {
    if (this.setTimeout) {
      clearTimeout(this.setTimeout);
    }
  }

  // 更新激活状态的菜单项
  #updateActiveItem() {
    console.log('change', window.location.pathname)
    this.itemTargets.forEach(item => {
      let link;
      if(item.tagName == 'SUMMARY') {
        link = item.querySelector('a')
      }else{
        link = item
      }
      if (link.getAttribute('href') === window.location.pathname) {
        item.classList.add(this.activeClass);
        // 展开父级菜单
        let parent = item.closest('details');
        if (parent) {
          parent.setAttribute('open', '')
        }
        // item.scrollIntoView({ behavior: "smooth", block: "center" }); // 滚动到视图中
        // window.scrollBy(0, 0);
      }else{
        item.classList.remove(this.activeClass);
      }
    });
  }
}