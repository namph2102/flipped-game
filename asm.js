var _a;
/*
1.	Đăng nhập : Nhập tên truy cập để vào chơi  , tên người chơi hiện phía trên các hình
2.	Khi mới vào chơi các hình ẩn hết
3.	Khi nhắp hình 1 rồi hình 2: check nếu 2 hình giống nhau thì cộng 3 điểm , nếu khác thì trừ 1 điểm.  Điểm ban đầu là 0. Nếu đến -10 thì thông báo người chơi thua, rồi chuyển sang trang  đăng nhập
4.	Nhấn nút Thôi thì không chơi nữa, quay về trang đăng nhập.
*/
var SETTINGS;
(function (SETTINGS) {
    SETTINGS[SETTINGS["TOTAL_CART"] = 24] = "TOTAL_CART";
    SETTINGS[SETTINGS["CART_ONE_LEVEL"] = 4] = "CART_ONE_LEVEL";
    SETTINGS[SETTINGS["TIME_LEVEL"] = 120] = "TIME_LEVEL";
    SETTINGS[SETTINGS["TIME_PLAY_GAIN"] = 5000] = "TIME_PLAY_GAIN";
    SETTINGS["MUSIC_WIN"] = "/image/games/win.mp3";
    SETTINGS["MUSIC_LOST"] = "/image/games/lose.mp3";
    SETTINGS[SETTINGS["LOSE_MIN_SCORE"] = -10] = "LOSE_MIN_SCORE";
    SETTINGS[SETTINGS["WIN__CHOSE"] = 3] = "WIN__CHOSE";
    SETTINGS[SETTINGS["LOSE_CHOSE"] = 1] = "LOSE_CHOSE";
})(SETTINGS || (SETTINGS = {}));
// khai báo
var listCart = [];
var audioElement = document.querySelector("audio");
// Ui
var levelContainer = document.querySelector(".levelup");
var timeoutContainer = document.querySelector(".timeout");
var scoreContainer = document.querySelector(".score");
var modal_toast = document.querySelector(".modal_toast");
var toast__message = document.querySelector(".toast__message");
// Game
var gameheader = document.querySelector(".gameheader");
var settings = document.querySelector(".settings");
// history
var btnHistory = document.getElementById("viewhistory");
var historyContainer = document.getElementById("historyContainer");
var btnClsoeHistory = document.getElementById("btn_history_close");
var historyList = document.querySelector(".cotainer__history--list");
// Tạo mảng để chứa thẻ game
for (var i = 1; i <= SETTINGS.TOTAL_CART; i++) {
    listCart.push({ id: i, link: "/image/games/".concat(i, ".jpg") });
}
listCart.sort(function () { return 0.5 - Math.random(); });
var accounts = [
    {
        username: "hoainam1",
        password: "123",
        level: 1,
        score: 0
    },
    {
        username: "hoainam2",
        password: "123",
        level: 2,
        score: 10
    },
    {
        username: "hoainam3",
        password: "123",
        level: 3,
        score: 40
    },
];
var levelGame = Number(localStorage.getItem("level")) || 1;
var account = {
    username: "testrt",
    password: "********************************",
    level: levelGame,
    score: 0
};
var getTimeFull = function () {
    var date = new Date(Date.now());
    var hours = date.getHours().toString().padStart(2, "0");
    var minutes = date.getMinutes().toString().padStart(2, "0");
    var seconds = date.getSeconds().toString().padStart(2, "0");
    var day = date.getDate().toString().padStart(2, "0");
    var month = date.getMonth().toString().padStart(2, "0");
    var year = date.getFullYear();
    return "".concat(hours, ":").concat(minutes, ":").concat(seconds, " - ").concat(day, "/").concat(month, "/").concat(year);
};
document.forms[0].username.focus();
// Đăng nhập
document.forms[0].addEventListener("submit", function (e) {
    e.preventDefault();
    var username = this.username.value;
    var password = this.password.value;
    if (!username || !password) {
        return;
    }
    if (username) {
        var user = accounts.find(function (user) { return user.username == username && user.password == password; });
        if (!user) {
            account.username = username;
            account.password = password;
        }
        else {
            account = user;
        }
        gameMessage("Đăng nhập thành công !");
        // ẩn login
        var app = new App();
        app.start();
        this.classList.add("hidden");
        gameheader.classList.remove("hidden");
        settings.classList.remove("hidden");
    }
});
var gameContainer = document.getElementById("level__container");
var arrlistHandle;
var saveLocalHistory = function (history) {
    levelGame = Number(localStorage.getItem("level"));
    localHistory.push(history);
    localStorage.setItem("history", JSON.stringify(localHistory));
    history.level > levelGame && localStorage.setItem("level", JSON.stringify(history.level));
};
function displayHisroty(history, isSave) {
    if (isSave === void 0) { isSave = true; }
    if (isSave) {
        saveLocalHistory(history);
    }
    var html = "\n  <ul class=\"cotainer__history--body\">\n  <li>".concat(history.id, "</li>\n  <li>\n    <img loading=\"lazy\" src=\"/image/level-up.png\" alt=\"\" />\n    <span class=\"ms-2 fs-bold fs-4 text-warning\">").concat(history.level, "</span>\n  </li>\n  <li>").concat(history.timeFinish, "</li>\n  <li>").concat(history.stars, "</li>\n  <li><img src=\"/image/games/").concat(history.result ? "win" : "lose", ".png\" alt=\"\" /></li>\n  <li>").concat(history.timefull, "</li>\n</ul>\n  ");
    historyList.insertAdjacentHTML("afterbegin", html);
}
// local
var localHistory = (_a = JSON.parse(localStorage.getItem("history"))) !== null && _a !== void 0 ? _a : [];
if (localHistory.length >= 8) {
    var newLocalHistory = localHistory.slice(localHistory.length - 8);
    renderInitHistory(newLocalHistory);
    localStorage.setItem("history", JSON.stringify(newLocalHistory));
}
else {
    renderInitHistory(localHistory);
}
function renderInitHistory(localHistory) {
    localHistory.map(function (history) { return displayHisroty(history, false); });
}
var idTimeCount;
var App = /** @class */ (function () {
    function App() {
        var _this = this;
        // xử lý Khi lật thẻ quá nhanh
        this.timeEnd = SETTINGS.TIME_LEVEL;
        this.isEndGame = false;
        this.isWin = false;
        this.totalFippled = 0;
        this.isHandle = false;
        this.renderCart = function (level) {
            // reset game
            _this.isWin = false;
            _this.totalFippled = 0;
            _this.isHandle = false;
            _this.isEndGame = false;
            arrlistHandle = {};
            _this.renderUI(account.level);
            var HTML_BOX = "";
            // Xử lý ramdom thẻ
            var newCarts = listCart.slice(0, level * SETTINGS.CART_ONE_LEVEL);
            newCarts.push.apply(newCarts, newCarts);
            newCarts.sort(function () { return 0.5 - Math.random(); });
            HTML_BOX = newCarts
                .map(function (cart, index) { return " <div class=\"scene scene--card\" style=\"animation-delay: ".concat(index * 0.2, "s\" data-id=").concat(cart.id, ">\n    <div class=\"card\">\n      <div class=\"card__face card__face--front\">\n        <img src=\"/image/games/0.png\" alt=\"\" />\n      </div>\n      <div class=\"card__face card__face--back\">\n        <img src=\"").concat(cart.link, "\" alt=\"\" />\n      </div>\n    </div>\n  </div>"); })
                .join("");
            gameContainer.innerHTML = HTML_BOX;
        };
    }
    App.prototype.renderUI = function (level) {
        var _this = this;
        // box level;
        levelContainer.value = level;
        scoreContainer.value = account.score;
        var totalTime = this.timeEnd * level;
        // box time out;
        idTimeCount = setInterval(function () {
            if (_this.isEndGame) {
                clearInterval(idTimeCount);
                _this.isEndGame = false;
                return;
            }
            timeoutContainer.value = _this.handleTime(totalTime);
            totalTime--;
            if (totalTime < 0) {
                _this.isEndGame = true;
                gameMessage("Hết giờ !", 2000);
                _this.LostGame();
                clearInterval(idTimeCount);
            }
        }, 1000);
    };
    App.prototype.handleEvent = function () {
        var _this = this;
        gameContainer.addEventListener("click", function (e) {
            if (_this.isHandle || _this.isEndGame)
                return;
            var anyElement = e.target;
            if (anyElement.closest(".scene--card")) {
                var sceneEl = anyElement.closest(".scene--card");
                var cartEl = sceneEl.firstElementChild;
                var id = sceneEl.dataset.id;
                _this.handleResult(sceneEl, cartEl, id);
            }
        });
    };
    App.prototype.handleResult = function (parent, card, id) {
        var _this = this;
        account.score > SETTINGS.LOSE_MIN_SCORE && (card === null || card === void 0 ? void 0 : card.classList.add("is-flipped"));
        if ((arrlistHandle === null || arrlistHandle === void 0 ? void 0 : arrlistHandle.id) && parent != arrlistHandle.parent) {
            // ngăn chặn spam click
            this.isHandle = true;
            if (arrlistHandle.id == id) {
                // win
                playAudio(SETTINGS.MUSIC_WIN);
                var idTimeout_1 = setTimeout(function () {
                    var _a;
                    (_a = arrlistHandle.parent) === null || _a === void 0 ? void 0 : _a.classList.add("scene-hidden");
                    parent.classList.add("scene-hidden");
                    scoreContainer.value = account.score += SETTINGS.WIN__CHOSE;
                    _this.isHandle = false;
                    arrlistHandle = {};
                    clearTimeout(idTimeout_1);
                    // cộng số thẻ lật;
                    _this.totalFippled += 1;
                    // dừng lại khi lật hết thẻ
                    if (_this.totalFippled >= account.level * SETTINGS.CART_ONE_LEVEL) {
                        _this.isEndGame = true;
                        _this.isWin = true;
                        clearInterval(idTimeCount);
                        if (account.level > Math.floor(SETTINGS.TOTAL_CART / SETTINGS.CART_ONE_LEVEL)) {
                            account.level = 1;
                            gameMessage("Quay l\u1EA1i Level ".concat(account.level, " nha!"), 2000);
                        }
                        else {
                            _this.handleGameFishised();
                            account.level += 1;
                            gameMessage("Chinh Ph\u1EE5c Level ".concat(account.level, " nha!"), 2000);
                        }
                        _this.renderCart(account.level);
                    }
                }, 1000);
            }
            else {
                // lost
                var idTimeout_2 = setTimeout(function () {
                    var _a;
                    (_a = arrlistHandle.card) === null || _a === void 0 ? void 0 : _a.classList.remove("is-flipped");
                    card.classList.remove("is-flipped");
                    scoreContainer.value = account.score -= SETTINGS.LOSE_CHOSE;
                    if (account.score <= SETTINGS.LOSE_MIN_SCORE || _this.isEndGame) {
                        account.score = SETTINGS.LOSE_MIN_SCORE;
                        _this.LostGame();
                    }
                    clearTimeout(idTimeout_2);
                    arrlistHandle = {};
                    _this.isHandle = false;
                    // Dừng lại game khi hết điểm;
                }, 1000);
            }
        }
        else {
            arrlistHandle = { parent: parent, card: card, id: id };
        }
    };
    App.prototype.handleTime = function (totalTime) {
        return "".concat((Math.floor(totalTime / 60) + "").padStart(2, "0"), ":").concat(((totalTime % 60) +
            "").padStart(2, "0"));
    };
    App.prototype.handleGameFishised = function () {
        var _a = timeoutContainer.value.split(":"), minutes = _a[0], second = _a[1];
        var timeUse = Number(minutes) * 60 + Number(second);
        var totaltime = Number(this.timeEnd * account.level);
        var historyGame = {
            id: localHistory.length,
            level: account.level,
            timeFinish: this.handleTime(totaltime - timeUse),
            stars: account.score,
            result: this.isWin,
            timefull: getTimeFull()
        };
        displayHisroty(historyGame);
    };
    App.prototype.LostGame = function () {
        var _this = this;
        this.isWin = false;
        this.isEndGame = true;
        this.handleGameFishised();
        clearInterval(idTimeCount);
        playAudio(SETTINGS.MUSIC_LOST);
        gameMessage("B\u1EA1n \u0111\u00E3 thua cu\u1ED9c - B\u1EA1n s\u1EBD ch\u01A1i l\u1EA1i sau ".concat(SETTINGS.TIME_PLAY_GAIN, "s"), 2000);
        var idRenderMap = setTimeout(function () {
            gameMessage("Ch\u01A1i l\u1EA1i Map Level ".concat(account.level), Math.round(SETTINGS.TIME_PLAY_GAIN));
            if (scoreContainer.value <= SETTINGS.LOSE_MIN_SCORE) {
                account.score = 0;
            }
            _this.renderCart(account.level);
            clearTimeout(idRenderMap);
        }, SETTINGS.TIME_PLAY_GAIN);
        return;
    };
    App.prototype.start = function () {
        this.renderCart(account.level);
        this.handleEvent();
    };
    return App;
}());
var history_ganme = [];
// music
function playAudio(src) {
    audioElement === null || audioElement === void 0 ? void 0 : audioElement.setAttribute("src", src);
    audioElement === null || audioElement === void 0 ? void 0 : audioElement.addEventListener("loadeddata", function () {
        audioElement === null || audioElement === void 0 ? void 0 : audioElement.play();
    });
}
// Thông báo
function gameMessage(message, timeout) {
    if (timeout === void 0) { timeout = 1000; }
    toast__message.innerHTML = message;
    modal_toast.classList.add("show");
    var idTimeout = setTimeout(function () {
        modal_toast.classList.remove("show");
        clearTimeout(idTimeout);
    }, timeout);
}
btnHistory.addEventListener("click", function (e) {
    e.preventDefault();
    historyContainer.classList.toggle("hidden");
});
historyContainer.addEventListener("click", function (e) {
    e.stopPropagation();
});
btnClsoeHistory.onclick = function () {
    historyContainer.classList.add("hidden");
};
