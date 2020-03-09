var AV = require('leancloud-storage');
var { Query } = AV;
AV.init({
    appId: "p02Iwq6diOAtL0s7NNsYx8Uf-MdYXbMMI",
    appKey: "Qrqz9Td7Iz39xHAi1PIzXqmo",
});

var pushNotifications = new AV.Query('notifications');
pushNotifications.descending('createdAt');
pushNotifications.limit(3);

pushNotifications.find().then(function (notifications) {
    notifications.forEach(function (notification) {
        if (notification.get('targetVersion') == null || notification.get("targetVersion") == "" || notification.get("targetVersion") == require("./package.json").version.toString()) {
            var content = (store.get("i18n").indexOf("zh") != -1) ? notification.get('notificationContentChinese') : notification.get('notificationContentEnglish');
            var title = (store.get("i18n").indexOf("zh") != -1) ? notification.get('notificationTitleChinese') : notification.get('notificationTitleEnglish');
            var link = (store.get("i18n").indexOf("zh") != -1) ? notification.get('notificationLinkChinese') : notification.get('notificationLinkEnglish');
            var id = notification.get('objectId');
            ipc.send("push-notification", { content: content, title: title, link: link, id: id })
        }
    })
})