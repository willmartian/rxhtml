import type { Serializable } from "./types";

export type RenderTask = {
  selector: string,
  name: string,
  action: 'ATTRIBUTE' | 'PROPERTY' | 'EVENT',
  value: any
}

export interface SerializableRenderTask extends RenderTask {
  action: 'ATTRIBUTE' | 'PROPERTY',
  value: Serializable
}

export interface RendererOptions {
  rootNode?: HTMLElement | string;
}

export class Renderer {

  private renderQueue: Map<string, RenderTask>;
  private eventCache: Map<any, any>;
  private selectors: Map<string, Node>;
  private rootNode: HTMLElement;
  private walker: TreeWalker;

  constructor(options?: RendererOptions) {
      this.renderQueue = new Map();
      this.eventCache = new Map();
      this.selectors = new Map();

      if (options.rootNode) {
          this.rootNode = typeof options.rootNode === 'string' ? document.querySelector(options.rootNode) : options.rootNode;
      } else {
          this.rootNode = document.body;
      }

      this.selectors.set('', this.rootNode);
      // Need different filter for shadow dom
      this.walker = document.createTreeWalker(this.rootNode, NodeFilter.SHOW_ELEMENT);
  }

  push({selector, name, action, value}: RenderTask) {
      this.renderQueue.set(`${selector}.${name}`, { selector, name, action, value });
      if (selector) {
          this.selectors.set(selector, null);
      }
      if (this.renderQueue.size === 1) {
          queueMicrotask(this.render.bind(this));
      }
  }

  private render() {
      // TODO: make this search only happen if node has not already been stored
      let currentNode = this.walker.currentNode;
      while(currentNode) {
          this.selectors.forEach((v, k) => {
              if (v !== null) {
                  return;
              } else if ((currentNode as HTMLElement)?.matches(`${k}`)) {
                  this.selectors.set(k, currentNode);
              }
          })
          currentNode = this.walker.nextNode();
      }

      this.renderQueue.forEach((v, _k) => {
          this.processAction(v.selector, v.name, v.action, v.value);
      });
      this.renderQueue.clear();
  }

  private processAction(selector, name, type, value) {
      const target0 = this.selectors.get(selector) as HTMLElement;
      // TODO: this is temp, find child nodes in shadow dom
      const target = !!target0 ? target0 : this.rootNode.querySelector(selector);

      switch (type) {
          case 'EVENT':
              const prevListener = this.eventCache.get({ selector, name });
              if (prevListener) {
                  target.removeEventListener(name, prevListener);
              }
              target.addEventListener(name, value);
              this.eventCache.set({ selector, name }, value);
              break;
          case 'PROPERTY':
              target[name] = value;
              break;
          case 'ATTRIBUTE':
              target.setAttribute(name, value);
              break;
      }
  }
}
