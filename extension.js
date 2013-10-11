function rehostImage(info, tab) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://mediacru.sh/api/upload/url');
    xhr.onload = function() {
        var result = JSON.parse(this.responseText);
        if (this.status == 409) {
            window.open('https://mediacru.sh/' + result.hash, '_blank');
        } else if (this.status == 200) {
            var notification = webkitNotifications.createNotification('icon48.png', 'MediaCrush', 'Processing, please wait...');
            notification.show();
            setTimeout(function() {
                checkStatus(result.hash, notification);
            }, 1000);
        } else {
            alert('An error occured re-hosting this image.');
        }
    };
    var formData = new FormData();
    formData.append('url', info.srcUrl);
    xhr.send(formData);
}

function checkStatus(hash, notification) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://mediacru.sh/api/' + hash + '/status');
    xhr.onload = function() {
        var result = JSON.parse(this.responseText);
        if (result.status == "error") {
            notification.cancel();
            notification = webkitNotifications.createNotification('icon48.png', 'MediaCrush', 'There was an error while processing this file.');
        } else if (result.status == "timeout") {
            notification.cancel();
            notification = webkitNotifications.createNotification('icon48.png', 'MediaCrush', 'This file took too long to process.');
        } else if (result.status == "done") {
            notification.cancel();
            window.open('https://mediacru.sh/' + result.hash + '#fromExtension', '_blank');
        } else {
            setTimeout(function() { checkStatus(hash, notification); }, 1000);
        }
    };
    xhr.send();
}

chrome.contextMenus.create({ title: 'Rehost on MediaCrush', contexts: [ 'image' ], onclick: rehostImage });
