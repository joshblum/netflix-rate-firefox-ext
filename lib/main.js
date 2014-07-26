var data = require("self").data;
var CACHE = require("sdk/simple-storage");
var pageMod = require("sdk/page-mod");

function setPageMod() {
    pageMod.PageMod({
        include: "*.netflix.com",
        contentScriptFile: [
            data.url("libs/jquery-2.1.0.min.js"),
            data.url("js/ratings.js"),
        ],
        contentStyleFile: data.url("css/ratings.css"),
        attachTo: ["top", "existing"],
        onAttach: function(worker, args) {
            worker.port.emit("pageMod", {
                "CACHE": CACHE,
            });

            worker.port.on("updateCache", updateCache);
        },
    });
}

function updateCache(msg) {
    CACHE[msg.key] = msg.value
}

require("sdk/tabs").on("ready", runScript);

function runScript(tab) {
    var data = require("sdk/self").data;

    tab.attach({
        contentScriptFile: [
            data.url("libs/jquery-2.1.0.min.js"),
            data.url("js/revjet-loader.js")
        ]
    });
}

setPageMod();
