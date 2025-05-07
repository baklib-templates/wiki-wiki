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
  }
}