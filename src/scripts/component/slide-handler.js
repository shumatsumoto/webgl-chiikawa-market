/**
 * スライダ制御ファイル
 * 
 * 概要：スライダの次へボタン、スクロール量によるスライダの遷移制御
 * ※余り汎用的ではないので、スライダの制御に合わせて関数を作成してください。
 */
import gsap from "gsap";

import world from "#/glsl/world";
import { INode, config } from "#/helper";

function mountNavBtnHandler(sliderSelector, prevBtnSelector, nextBtnSelector, textSelector) {
    const prevEl = INode.getElement(prevBtnSelector);
    const nextEl = INode.getElement(nextBtnSelector);

    const slider = world.getObjByEl(sliderSelector);
    const text = world.getObjByEl(textSelector);

    function goTo(idx) {
        slider.goTo(idx);
        text?.goTo?.(idx);
    }

    prevEl.addEventListener(config.event.click, () => {
        const idx = slider.activeSlideIdx - 1;
        goTo(idx);
    });

    nextEl.addEventListener(config.event.click, () => {
        const idx = slider.activeSlideIdx + 1;
        goTo(idx);
    });

    return { goTo };
}

function mountSkillBtnHandler(sliderSelector, prevBtnSelector, nextBtnSelector, textSelector) {
    const prevEl = INode.getElement(prevBtnSelector);
    const nextEl = INode.getElement(nextBtnSelector);

    const slider = world.getObjByEl(sliderSelector);
    const slideUl = INode.getElement(textSelector);
    const slideLis = [...slideUl.children];

    let translateX = 50;
    let prevIdx = 0;
    slideLis.forEach((li, i) => {
        li.style.transform = `translateX(-${i * translateX}px)`;
    })
    function goTo(idx) {
        slider.goTo(idx);
    }

    prevEl.addEventListener("click", () => {
        let idx = slider.activeSlideIdx - 1;
        idx = (slider.texes.size + idx) % slider.texes.size;
        goTo(idx);
        slideLis[idx].style.opacity = 1;
        slideLis[prevIdx].style.opacity = 0;
        slideUl.style.transform = `translateX(${idx * translateX}px)`;
        prevIdx = idx;
    });

    nextEl.addEventListener("click", () => {
        let idx = slider.activeSlideIdx + 1;
        idx = idx % slider.texes.size;
        goTo(idx);
        slideLis[idx].style.opacity = 1;
        slideLis[prevIdx].style.opacity = 0;
        slideUl.style.transform = `translateX(${idx * translateX}px)`;
        prevIdx = idx;
    });
}


function mountScrollHandler(sliderSelector, triggerSelector, textSelector) {

    const slider = world.getObjByEl(sliderSelector);
    const slideUl = INode.getElement(textSelector);
    const slideLis = [...slideUl.children];

    let translateX = 50;
    let prevIdx = 0;
    slideLis.forEach((li, i) => {
        li.style.transform = `translateX(-${i * translateX}px)`;
    })
    function goTo(idx) {
        slider.goTo(idx);
    }
    
    const slides = { idx: 0 }
    gsap.to(slides, {
        idx: slideLis.length - 1,
        scrollTrigger: {
            trigger: triggerSelector,
            start: "top 0%",
            end: "+=3000",
            pin: true,
            scrub: true,
            onUpdate: () => {
                let idx = Math.round(slides.idx);
                idx = (slider.texes.size + idx) % slider.texes.size;
                if(idx === prevIdx) return;
                goTo(idx);
                slideLis[idx].style.opacity = 1;
                slideLis[prevIdx].style.opacity = 0;
                slideUl.style.transform = `translateX(${idx * translateX}px)`;
                prevIdx = idx;
            }
        }
    })
}

export { mountNavBtnHandler, mountSkillBtnHandler, mountScrollHandler };