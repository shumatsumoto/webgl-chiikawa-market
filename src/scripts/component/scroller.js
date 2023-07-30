/**
 * スクロール制御ファイル
 * 
 * 概要：サイト全体のスクロール制御
 */
import gsap from "gsap";
import Scrollbar, { ScrollbarPlugin } from "smooth-scrollbar";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { INode, config } from "#/helper";

const scroller = {
  scrolling: false,
  init,
  disable,
  enable
};

function init() {
  gsap.registerPlugin(ScrollTrigger);
  Scrollbar.use(DisablePlugin);

  const pageContainer = INode.getElement(`${config.$.pageContainer}`);

  const scrollBar = Scrollbar.init(pageContainer, { delegateTo: document });

  scroller.scrollBar = scrollBar;

  ScrollTrigger.scrollerProxy(pageContainer, {
    scrollTop(value) {
      if (arguments.length) {
        scrollBar.scrollTop = value; // setter
      }
      return scrollBar.scrollTop; // getter
    },
    // getBoundingClientRect() {
    //   return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
    // }
  });

  scrollBar.addListener(_onScroll);

  ScrollTrigger.defaults({
    scroller: pageContainer,
  });

}

function _onScroll() {
  ScrollTrigger.update();
  _disableHover(50);
}

const marker = 'disable-hover';
const bodyClassList = document.body.classList;
let timeoutId = null;
function _disableHover(time) {
  if(!bodyClassList.contains(marker)) {
    bodyClassList.add(marker);
    scroller.scrolling = true;
  }

  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    bodyClassList.remove(marker);
    scroller.scrolling = false;
  }, time);
}

class DisablePlugin extends ScrollbarPlugin {
  static pluginName = 'disable';

  static defaultOptions = {
    disable: false,
  }

  transformDelta(delta) {
    return this.options.disable ? { x: 0, y: 0 } : delta;
  }
}

function disable() {
  scroller.scrollBar.updatePluginOptions('disable', {
    disable: true
  });
}

function enable() {
  scroller.scrollBar.updatePluginOptions('disable', {
    disable: false
  });
}

export default scroller;
