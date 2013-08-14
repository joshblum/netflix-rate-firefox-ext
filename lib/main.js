var data = require("self").data;
var CACHE = require("sdk/simple-storage");
var pageMod = require("sdk/page-mod");

function setPageMod(){
    pageMod.PageMod({
        include: "*.netflix.com",
        contentScriptFile:[
            data.url("libs/jquery-2.0.3.min.js"),
            data.url("js/ratings.js"),
        ],
        contentStyleFile: data.url("css/ratings.css"),
        attachTo: ["top", "existing"],
        onAttach: function(worker, args) {
            worker.port.emit("pageMod", {
                "CACHE" : CACHE,
            });
            
            worker.port.on("updateCache", updateCache);
        },
    });
}

function updateCache(msg){
    CACHE[msg.title] = msg.rating
}

setPageMod();