function isLockMode() {
    const isLocked = store.get('islocked');
    if (isLocked) {
        $('.should-lock').css('display', 'none');
        $('#exit').css('display', 'none');
        $('#settings').css('display', 'none');
        $('#predefined-tasks-edit').css('display', 'none');
        $('#predefined-tasks-divider').css('display', 'none');
    }
}//lock mode settings
isLockMode()

if (styleCache.get("is-shadowless")) {
    $('html').css('border', '#33333333 1px solid')
}

history.pushState(null, null, document.URL);
window.addEventListener('popstate', function () {
    history.pushState(null, null, document.URL)
})//prevent back

let titleAlternative = {
    x: 10,
    y: 20,
    tipElements: "a, i, span, img, div, input",
    noTitle: false,
    init: function () {
        let b = this.noTitle, isTitle;
        $(this.tipElements).each(function () {
            $(this).mouseover(function (e) {
                if (b) {
                    isTitle = true
                } else {
                    isTitle = $.trim(this.title) !== ''
                }
                if (isTitle) {
                    this.myTitle = this.title;
                    this.title = "";
                    let a = "<div class='tipsy'><div class='tipsy-arrow tipsy-arrow-n'></div><div class='tipsy-inner'>" + this.myTitle + "</div></div>";
                    $('body').append(a);
                    $('.tipsy').css({
                        "top": (e.pageY + 24) + "px",
                        "left": (e.pageX - 24) + "px"
                    }).show('fast');
                }
            }).mouseout(function () {
                if (this.myTitle != null) {
                    this.title = this.myTitle;
                    $('.tipsy').remove()
                }
            }).mousemove(function (e) {
                $('.tipsy').css({
                    "top": (e.pageY + 24) + "px",
                    "left": (e.pageX - 24) + "px"
                }).show('fast');
            })
        })
    }
}
$(function () {
    try {
        if (!isMiniMode)
            titleAlternative.init();
    } catch (e) {
        titleAlternative.init();
    }
})//title attr alternative

let ratioList = [0.75, 0.9, 1, 1.1, 1.25];//zoom ratio
function zoomRatioChange() {
    if (store.has("zoom-ratio")) {//zoom page
        const { webFrame } = require('electron');
        webFrame.setZoomFactor(ratioList[store.get("zoom-ratio")]);
    }
}

$(function () {
    zoomRatioChange()
})

ipc.on('zoom-ratio-feedback', () => zoomRatioChange());

ipc.on('alert', (event, message) => {
    alert(message);
})