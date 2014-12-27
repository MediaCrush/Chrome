function getNotificationOptions(message) {
    return {
        type: "basic",
        message: message,
        title: "MediaCrush",
        iconUrl: "icon48.png"
    };
}

function rehostImage(info, tab) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://mediacru.sh/api/upload/url');
    var notificationId = -1;
    chrome.notifications.create("", getNotificationOptions("Processing, please wait..."), function(id) {
        notificationId = id;
    });
    xhr.onload = function() {
        var result = JSON.parse(this.responseText);
        if (this.status == 409) {
            chrome.notifications.clear(notificationId, function (ok) {});
            window.open('https://mediacru.sh/' + result.hash, '_blank');
        } else if (this.status == 200) {
            setTimeout(function() {
                checkStatus(result.hash, notificationId);
            }, 1000);
        } else {
            chrome.notifications.clear(notificationId, function (ok) {});
            alert('An error occured re-hosting this image.');
        }
    };
    var formData = new FormData();
    formData.append('url', info.srcUrl);
    xhr.send(formData);
}

function checkStatus(hash, notificationId) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://mediacru.sh/api/' + hash + '/status');
    xhr.onload = function() {
        var result = JSON.parse(this.responseText);
        if (result.status == "error") {
            chrome.notifications.clear(notificationId, function (ok) {});
            chrome.notifications.create("", getNotificationOptions('There was an error while processing this file.'), function(id) {});
        } else if (result.status == "timeout") {
            chrome.notifications.clear(notificationId, function (ok) {});
            chrome.notifications.create("", getNotificationOptions('This file took too long to process.'), function(id) {});
        } else if (result.status == "done") {
            chrome.notifications.clear(notificationId, function (ok) {});
            window.open('https://mediacru.sh/' + result.hash + '#fromExtension', '_blank');
        } else {
            setTimeout(function() { checkStatus(hash, notificationId); }, 1000);
        }
    };
    xhr.send();
}

chrome.contextMenus.create({ title: 'Rehost on MediaCrush', contexts: [ 'image' ], onclick: rehostImage });
