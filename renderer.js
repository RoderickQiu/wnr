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
    bottomTooltipSelectors: ['#statistics-back', '#back-index', '#statistics-back i'],
    bottomTooltipMargin: 80,
    isBottomTooltipElement: function(element) {
        let $element = $(element);
        for (let i = 0; i < this.bottomTooltipSelectors.length; i++) {
            let selector = this.bottomTooltipSelectors[i];
            if ($element.is(selector)) {
                return true;
            }
            let $container = $(selector);
            if ($container.length > 0 && $container[0].contains && $container[0].contains(element)) {
                return true;
            }
            if ($element.closest(selector).length > 0) {
                return true;
            }
        }
        return false;
    },
    isNearBottomEdge: function(pageY) {
        if (!window || !window.innerHeight) return false;
        return pageY > (window.innerHeight - this.bottomTooltipMargin);
    },
    init: function () {
        let b = this.noTitle, isTitle;
        let self = this;
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
                    let isBottomTooltip = self.isBottomTooltipElement(this) || self.isNearBottomEdge(e.pageY);
                    let arrowClass = isBottomTooltip ? 'tipsy-arrow-s' : 'tipsy-arrow-n';
                    let a = "<div class='tipsy'><div class='tipsy-arrow " + arrowClass + "'></div><div class='tipsy-inner'>" + this.myTitle + "</div></div>";
                    $('body').append(a);
                    if (isBottomTooltip) {
                        $('.tipsy').css({
                            "top": (e.pageY - 40) + "px",
                            "left": (e.pageX - 24) + "px"
                        }).show('fast');
                    } else {
                        $('.tipsy').css({
                            "top": (e.pageY + 24) + "px",
                            "left": (e.pageX - 24) + "px"
                        }).show('fast');
                    }
                }
            }).mouseout(function () {
                if (this.myTitle != null) {
                    this.title = this.myTitle;
                    $('.tipsy').remove()
                }
            }).mousemove(function (e) {
                let isBottomTooltip = self.isBottomTooltipElement(this) || self.isNearBottomEdge(e.pageY);
                if (isBottomTooltip) {
                    $('.tipsy').css({
                        "top": (e.pageY - 40) + "px",
                        "left": (e.pageX - 24) + "px"
                    }).show('fast');
                } else {
                    $('.tipsy').css({
                        "top": (e.pageY + 24) + "px",
                        "left": (e.pageX - 24) + "px"
                    }).show('fast');
                }
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