/**
 * メニュー制御ファイル
 * 
 * 概要：メニューの開閉処理
 */
import gsap from "gsap";
import { INode, config } from "#/helper";

const menu = {
    init,
    toggle
}

let world = null, scroller = null, isOpen = false, clickTl = null;
const $ = {};

function init(_world, _scroller) {
    world = _world;
    scroller = _scroller;
    $.container = INode.getElement(config.$.globalContainer);
    $.btn = INode.getElement('.btn-menu');
    $.wraps = INode.qsAll('.btn-menu__wrap');
    $.bars = INode.qsAll('.btn-menu__bar');
    $.page = INode.getElement(config.$.pageContainer);

    clickTl = _createClickTL();
    _bindEvents();
}

function _bindEvents() {
    $.btn.addEventListener(config.event.click, () => toggle());
    $.btn.addEventListener(config.event.mouseenter, () => _enter());
}

function _toggleMeshVisibility(isOpen) {
    const fvText = world.getObjByEl(".fv__text-shader");
    const titleEls = INode.qsAll(`[data-${config.prefix.obj}="distortion-text"]`);
    titleEls.forEach(titleEl => {
        const titleObj = world.getObjByEl(titleEl);
        if(titleObj) {
            titleObj.mesh.visible = isOpen;
        }
    });
    if(fvText) {
        fvText.mesh.visible = isOpen;
    }
}

function _createClickTL() {
    const tl = gsap.timeline({
        paused: true,
        defaults: {
            duration: 0.3
        }
    });

    tl.to($.wraps[0], {
        y: 0,
        rotateZ: 225,
    }, "toggle").to($.wraps[1], {
        x: "-1em",
        opacity: 0
    }, "toggle").to($.wraps[2], {
        y: 0,
        rotateZ: -45,
    }, "toggle").to($.page, {
        opacity: 0,
        duration: 0.1
    });

    return tl;
}

function toggle() {
    $.container.classList.toggle('menu-open');

    if(isOpen) {
        setTimeout(() => {
            _toggleMeshVisibility(true);
            clickTl.reverse();
            scroller.enable();
        }, 1000);
    } else {
        setTimeout(() => {
            _toggleMeshVisibility(false);
            scroller.disable();
        }, 1000);
        clickTl.play();
    }
    isOpen = !isOpen;
}

function _enter() {
    const tl = gsap.timeline({
        defaults: {
            stagger: 0.1,
            duration: 0.3
        }
    });
    tl.set($.bars, {
        transformOrigin: 'right'
    }).to($.bars, {
        scaleX: 0
    }).set($.bars, {
        transformOrigin: 'left'
    }).to($.bars, {
        scaleX: 1
    })
}

export default menu;