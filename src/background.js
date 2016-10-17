chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.hasTable) {
            chrome.pageAction.show(sender.tab.id);
            sendResponse({});
        }
        else {
            sendResponse({});
        }
    });

var log1=function(){console.log('FileSaver.min.js ok');};
var log2=function(){console.log('xlsx.core.min.js ok');};
var log3=function(){console.log('tablehelper.js ok');};

var runContextMenus = function(info,tab){
    //注入脚本，下载表格
    chrome.tabs.executeScript(null,{file:'FileSaver.min.js'},log1);
    chrome.tabs.executeScript(null,{file:'xlsx.core.min.js'},log2);
    chrome.tabs.executeScript(null,{file:'tablehelper.js'},log3);
};


var createProperties={
    'title':chrome.i18n.getMessage("contextMenus_title"),
    'onclick':runContextMenus
};

chrome.contextMenus.create(createProperties);

chrome.pageAction.onClicked.addListener(function(tab) {
    runContextMenus();
});