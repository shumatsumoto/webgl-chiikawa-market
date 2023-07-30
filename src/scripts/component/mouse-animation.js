/**
 * マウスカーソルのアニメーション制御ファイル
 * 
 * 概要：data-mouse属性によって実行される処理
 */
import { INode, config } from "#/helper";

const highlight = {
  enter: (mouse, { currentTarget }) => {
    const scale = INode.getDS(currentTarget, `${config.prefix.mouse}Scale`) || 1;

    mouse.$.innerCircle.style.visibility = "hidden";

    mouse.setTarget({
      scale: scale,
      fillOpacity: 1,
    });
  },
  leave: (mouse, { currentTarget }) => {
    mouse.$.innerCircle.style.visibility = "visible";

    mouse.setTarget({
      scale: mouse.initial.scale,
      fillOpacity: mouse.initial.fillOpacity,
    });
  },
};

const stuck = {
  enter: (mouse, { currentTarget }) => {
    mouse.stopTrackMousePos();
    const scale = INode.getDS(currentTarget, "mouseScale") || 1;
    const rect = INode.getRect(currentTarget);

    mouse.$.innerCircle.style.visibility = "hidden";

    mouse.setTarget({
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
      scale: (rect.width / 2 / mouse.initial.r) * scale,
      fillOpacity: 1,
    });
  },
  leave: (mouse, { currentTarget }) => {
    mouse.$.innerCircle.style.visibility = "visible";

    mouse.setTarget({
      scale: mouse.initial.scale,
      fillOpacity: mouse.initial.fillOpacity,
    });
    mouse.startTrackMousePos();
  },
};

const hide = {
  enter(mouse) {
    mouse.$.innerCircle.style.visibility = "hidden";

    mouse.setTarget({
      scale: 0,
    });
  },
  leave(mouse) {
    mouse.$.innerCircle.style.visibility = "visible";

    mouse.setTarget({
      scale: mouse.initial.scale,
    });
  },
};

const handlers = {
  highlight,
  stuck,
  hide
};

export { handlers };
