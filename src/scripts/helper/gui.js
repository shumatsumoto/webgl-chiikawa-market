/**
 * lil-gui管理用ファイル
 * 
 * 概要：左上に表示されるパラメータ変更用GUIの管理
 */
let lilGUI = null;

async function init() {
    const { default: GUI } = await import('lil-gui');
    lilGUI = new GUI();
}

function add(callback) {
    if(lilGUI) {
        callback(lilGUI);
    }
}

const gui = {
    init,
    add
}

export { gui };