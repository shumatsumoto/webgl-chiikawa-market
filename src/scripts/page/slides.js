import {
  mountNavBtnHandler,
} from "#/component/slide-handler";

export default async function ({
  world,
  mouse,
  menu,
  loader,
  viewport,
  scroller,
}) {
  
  const { goTo } = mountNavBtnHandler(
    ".fv__slider",
    ".fv__btn.prev",
    ".fv__btn.next",
    ".fv__text-shader"
  );
  const fresnel = world.getObjByEl(".fresnel");
  if (fresnel) {
    fresnel.mesh.position.z = -1000;
  }
}
