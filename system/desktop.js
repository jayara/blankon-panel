var desktop = (function() {
    var desktopData = null;

    var hideLauncher = function() {
        $("#launcher").css("display", "none");
    }

    var addEvent = function () {
        if (document.addEventListener) {
            return function (el, type, fn) {
                if (el && el.nodeName || el === window) {
                    el.addEventListener(type, fn, false);
                } else if (el && el.length) {
                    for (var i = 0; i < el.length; i++) {
                        addEvent(el[i], type, fn);
                    }
                }
            };
        } else {
            return function (el, type, fn) {
                if (el && el.nodeName || el === window) {
                    el.attachEvent('on' + type, function () { return fn.call(el, window.event); });
                } else if (el && el.length) {
                    for (var i = 0; i < el.length; i++) {
                        addEvent(el[i], type, fn);
                    }
                }
            };
        }
    }

    var dragStart = function(e) {
        $("#bin").css("opacity", "0.5");
        this.style.opacity = "0.4";
        e.dataTransfer.dropEffect = "move";
        e.dataTransfer.setData("text/plain", $(this).attr("data-desktop"));
        var icon = $(e.target).find("img");
        if (icon.length > 0) {
            e.dataTransfer.setDragImage(icon.get(0), 0, 0);
        }
    }
    
    var dragEnter = function(e) {
        $("#bin").css("opacity", "1.0");
        e.preventDefault();
        this.classList.add("enter"); 
        $(this).children("img").addClass("ui-bin-img-enter");
        console.log("enter");
    }

    var dragLeave = function(e) {
        this.classList.remove("enter"); 
        $(this).children("img").removeClass("ui-bin-img-enter");
        console.log("leave");
    }


    var dragEnd = function(e) {
        $("#bin").css("opacity", "0");
        this.style.opacity = "1.0";

    }

    var dragOver = function(e) {
        e.preventDefault();
        
        console.log("over");
    }

    var dragDrop = function(e) {
        e.preventDefault();
        var data = e.dataTransfer.getData('text/plain');
        desktopData.removeFromDesktop(data);
    }


    var populateLauncher = function(data) {
        var l = $("#launcher");
        l.empty ();
        var bin = $("<div>").
                    attr("id", "bin").
                    attr("class", "ui-bin");
        var trash = $("<img>").
                    attr("class", "ui-bin-img").
                    attr("src", Utils.getIconPath("user-trash", 48));
        bin.append(trash);
        l.append(bin);
        setupTrashDnD();
        for (var i = 0; i < data.length; i ++) {
            var entry = $("<div>").
                            attr("class", "ui-launcher-entry").
                            attr("draggable", "true").
                            attr("data-desktop", data[i].desktop);
            entry.get(0).addEventListener("dragstart", dragStart);
            entry.get(0).addEventListener("dragend", dragEnd);
            entry.click(function() {
                Utils.run_desktop($(this).attr("data-desktop"), true);
            });

            var img = $("<img>").
                            attr("draggable", "true").
                            attr("src", data[i].icon);
            var text = $("<span>").
                            attr("translate", "no").
                            attr("title", data[i].name).
                            text(data[i].name);

            entry.append(img);
            entry.append(text);
            l.append(entry);
        }
    }

    var setupLauncher = function() {
        var data = desktopData.update ();         
        populateLauncher (data);
    }

    var init = function() {
        desktopData = new DesktopData(); // Defined in the backend
        desktopData.updateCallback("desktop.refresh()");
        setupLauncher();
    }

    var setupTrashDnD = function() {
        var dropZone = $("#bin").get(0);
        dropZone.addEventListener("dragenter", dragEnter);
        dropZone.addEventListener("dragleave", dragLeave);
        dropZone.addEventListener("dragover", dragOver);
        dropZone.addEventListener("drop", dragDrop);
    }

    var refresh = function() {
        setupLauncher();
    }

    return {
        init: init,
        refresh: refresh
    }
})();

$(document).ready(function() {
    desktop.init();
});