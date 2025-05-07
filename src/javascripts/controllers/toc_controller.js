import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["links", "content", "menu"];
  static values = {
    headerSelector: String,
  };

  connect() {
    this.#generateDirectory();
  }

  disconnect() {
    window.removeEventListener("scroll", this.#hightLightActiveLink.bind(this));
  }

  #generateDirectory() {
    const directory = this.#buildDirectoryTree(this.headings);
    if (directory.children.length > 0) {
      this.#renderDirectory(directory, this.linksTarget);
      window.addEventListener("scroll", this.#hightLightActiveLink.bind(this));
      this.#hightLightActiveLink();
      this.element.classList.add("has-toc");
    } else {
      this.element.classList.remove("has-toc");
      this.menuTarget.remove();
    }
  }

  // 生成目录树
  // { level: 0, children: [ {level: 1, id: '', text: '', children: [], parent: []} ] }
  #buildDirectoryTree(headings) {
    const root = { level: 0, children: [] };

    let currentNode = root;

    headings.forEach((heading, index) => {
      if (heading.textContent.trim() === "") {
        return;
      }

      const level = parseInt(heading.tagName.substr(1), 10);
      const id = this.#generateUniqueId(heading, level, index);
      heading.id = id;

      const node = { level, id, text: heading.textContent, children: [] };

      if (level > currentNode.level) {
        // 该节点是currentNode的子节点
        currentNode.children.push(node);
      } else {
        while (level <= currentNode.level && currentNode !== root) {
          currentNode = currentNode.parent;
        }
        currentNode.children.push(node);
      }

      node.parent = currentNode;
      currentNode = node;
    });

    return root;
  }

  // 生成目录, 插入到页面
  #renderDirectory(directory, container, level = 0) {
    if (directory.children.length == 0) {
      return;
    }

    const ul = document.createElement("ul");

    // 创建dom元素
    directory.children.forEach((node) => {
      const li = document.createElement("li");
      const link = document.createElement("button");
      link.type = "button";
      link.textContent = node.text;
      link.dataset.action = "toc#navigateToAnchor";
      link.dataset.tocAnchorParam = node.id;

      li.appendChild(link);
      ul.appendChild(li);

      // // 给 Heading 添加锚点复制功能
      // const hea = document.getElementById(node.id)
      // hea.classList = "flex group"
      // hea.insertAdjacentHTML("beforeend",'<div data-controller="clipboard" data-clipboard-success-content-value=" Copied!"><input type="hidden" value="' + window.location.href.split('#')[0] + '#' + node.id + '" data-clipboard-target="source" /><button type="button" data-action="clipboard#copy" data-clipboard-target="button" class="flex ml-1 opacity-0 group-hover:opacity-100">\n      <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-5 text-gray-300 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">\n        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />\n      </svg>\n    </button></div>')
      // hea.insertAdjacentHTML("beforeend",'<a name="' + node.id + '"></a>')

      if (node.children.length > 0) {
        const subList = this.#renderDirectory(node, li, level + 1);
        li.appendChild(subList);
      }
    });

    container.appendChild(ul);
    return ul;
  }

  #generateUniqueId(node, level, index) {
    return node.id || `heading-menu-h${level}-${index}`;
  }

  // 为当前标签设置高亮显示
  #hightLightActiveLink(event) {
    if (this.hightLightTimer) {
      clearTimeout(this.hightLightTimer);
    }
    this.hightLightTimer = setTimeout(() => {
      const links = Array.from(this.linksTarget.querySelectorAll("[data-toc-anchor-param]"));
      let activeLink = null;

      // 循环判断是否是activeLink
      for (let i = 0; i < this.headings.length; i++) {
        const heading = this.headings[i];

        const link = links.find(
          (link) => link.dataset.tocAnchorParam === heading.id,
        );

        if (link && this.isHeadingInView(heading)) {
          activeLink = link;
          break;
        }
      }

      // 添加样式, 移除其他标签的active样式
      links.forEach((link) => link.classList.remove("text-primary", "font-bold"));

      if (activeLink) {
        activeLink.classList.add("text-primary", "font-bold");
        activeLink.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }, 50);
  }

  // 判断heading的边界是否在视图区域
  isHeadingInView(heading) {
    // 获取当前heading的位置信息
    const bounding = heading.getBoundingClientRect();

    // 判断heading的边界是否在视图区域
    return (
      bounding.top >= this.headerHeight &&
      bounding.left >= 0 &&
      bounding.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      bounding.right <=
        (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  navigateToAnchor(event) {
    const { anchor } = event.params;
    const targetElement = document.getElementById(anchor);

    if (targetElement) {
      const headerHeight = this.headerHeight;
      const targetPosition = targetElement.getBoundingClientRect().top;
      const scrollToPosition = targetPosition - headerHeight;
      console.log(headerHeight, targetPosition, scrollToPosition);

      const scrollOptions = {
        top: scrollToPosition,
        behavior: "smooth",
      };

      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollBy(0, -headerHeight);
      window.scrollBy(0, scrollToPosition);
    }
  }

  get headings() {
    return Array.from(this.contentTarget.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  }

  get headerHeight() {
    if(!this.hasHeaderSelectorValue || !this.headerSelectorValue) {
      return 0
    }

    // 动态获取header的高度，并且判断是否是固定
    const header = document.querySelector(this.headerSelectorValue);
    if(!header) {
      return 0;
    }

    const styles = window.getComputedStyle(header);

    let fixed = styles.getPropertyValue("position") === "fixed";
    if (fixed) {
      return header.offsetHeight;
    } else {
      return 0;
    }
  }
}
