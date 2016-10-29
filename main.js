'use strict';

(function () {

    var addMinutes = function (date, min) {
        return new Date(date.getTime() + min * 60000);
    };

    var ITEMS = ['consumer-key', 'consumer-secret',
                    'token-key', 'token-secret'];

    var pastError = false;

    var container = document.querySelector('.js-container'),
        link      = document.querySelector('.js-tweet'),
        form      = document.querySelector('.js-form'),
        save      = document.querySelector('.js-save');

    var readStorage = function () {
        return {
            CONSUMER_KEY:    localStorage.getItem('consumer-key'),
            CONSUMER_SECRET: localStorage.getItem('consumer-secret'),
            TOKEN_KEY:       localStorage.getItem('token-key'),
            TOKEN_SECRET:    localStorage.getItem('token-secret')
        };
    };

    var askAuth = function () {
        var auth = readStorage();
        ITEMS.forEach(function (item) {
            document.querySelector('.js-' + item).value =
                localStorage.getItem(item);
        });

        form.classList.remove('hidden');
        container.classList.add('hidden');
        link.classList.add('hidden');
    };

    var update = function () {

        var cb   = new Codebird,
            auth = readStorage();

        cb.setConsumerKey(auth.CONSUMER_KEY, auth.CONSUMER_SECRET);
        cb.setToken(auth.TOKEN_KEY, auth.TOKEN_SECRET);

        container.classList.remove('hidden');
        link.classList.remove('hidden');
        form.classList.add('hidden');

        cb.__call(
            'statuses/userTimeline', {
                screen_name: 'archillect',
                count:       10,
            }, function (replies, rate, err) {
                if (err || replies.errors) {
                    console.error(err);
                    console.error(rate);
                    console.error(replies);
                    askAuth();
                    if (pastError && replies.errors) {
                        alert(replies.errors[0].message);
                    }
                    pastError = true;
                    return;
                }

                var reply     = replies[0],
                    media     = reply.extended_entities.media[0],
                    videoInfo = media.video_info;

                var child;

                if (videoInfo) {
                    console.log(videoInfo.variants[0].url);
                    child = document.createElement('video');

                    child.src = videoInfo.variants[0].url;
                    child.autoplay = true;
                    child.loop = true;
                } else {
                    console.log(media.media_url);

                    var child = new Image()
                    child.src = media.media_url;
                }

                child.classList.add('content');
                container.innerHTML = '';
                container.appendChild(child);

                link.href = reply.text;

                var creationDate = new Date(replies[0].created_at);
                setTimeout(update, (new Date()) - creationDate);
            }
        );
    };

    update();

    save.addEventListener(
        'click',
        function () {
            ITEMS.forEach(function (item) {
                localStorage.setItem(
                    item,
                    document.querySelector('.js-' + item).value
                );
            });

            update();
        },
        false
    );

})();
