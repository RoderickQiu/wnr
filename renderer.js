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
                    let a = "<div class='tooltip'><div class='tipsy-arrow tipsy-arrow-n'></div><div class='tipsy-inner'>" + this.myTitle + "</div></div>";
                    $('body').append(a);
                    $('.tooltip').css({
                        "top": (e.pageY + 24) + "px",
                        "left": (e.pageX - 24) + "px"
                    }).show('fast');
                }
            }).mouseout(function () {
                if (this.myTitle != null) {
                    this.title = this.myTitle;
                    $('.tooltip').remove()
                }
            }).mousemove(function (e) {
                $('.tooltip').css({
                    "top": (e.pageY + 24) + "px",
                    "left": (e.pageX - 24) + "px"
                })
            })
        })
    }
}
$(function () {
    titleAlternative.init()
})//title attr alternative