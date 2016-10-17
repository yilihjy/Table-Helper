if (document.getElementsByTagName('table').length > 0) {

    chrome.extension.sendRequest({ 'hasTable': true }, function (response) {
        //do nothing
    });


}



