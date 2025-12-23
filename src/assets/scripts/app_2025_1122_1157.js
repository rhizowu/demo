import Obj_1 from './module/2025_1122_1157.js';
import Stage from './module/stage';

const stage = new Stage();
stage.init();


const obj_1 = new Obj_1(stage);
obj_1.init();

window.addEventListener("resize", () => {
    obj_1.onResize();
    stage.onResize();
});

const _raf = () => {
    window.requestAnimationFrame(() => {
        _raf();
        obj_1.onRaf();
        stage.onRaf();
    });
};
_raf();
