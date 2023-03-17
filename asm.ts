/*
1.	Đăng nhập : Nhập tên truy cập để vào chơi  , tên người chơi hiện phía trên các hình
2.	Khi mới vào chơi các hình ẩn hết
3.	Khi nhắp hình 1 rồi hình 2: check nếu 2 hình giống nhau thì cộng 3 điểm , nếu khác thì trừ 1 điểm.  Điểm ban đầu là 0. Nếu đến -10 thì thông báo người chơi thua, rồi chuyển sang trang  đăng nhập
4.	Nhấn nút Thôi thì không chơi nữa, quay về trang đăng nhập.
*/
enum SETTINGS {
  TOTAL_CART = 24,
  CART_ONE_LEVEL = 4,
  TIME_LEVEL = 120,
  TIME_PLAY_GAIN = 5000,
  MUSIC_WIN = "/image/games/win.mp3",
  MUSIC_LOST = "/image/games/lose.mp3",
  LOSE_MIN_SCORE = -10,
  WIN__CHOSE = 3,
  LOSE_CHOSE = 1,
}

type TCart = { id: number; link: string };
// khai báo
const listCart: TCart[] = [];
const audioElement = document.querySelector("audio");
// Ui
const levelContainer: any = document.querySelector(".levelup");
const timeoutContainer: any = document.querySelector(".timeout");
const scoreContainer: any = document.querySelector(".score");
const modal_toast: any = document.querySelector(".modal_toast");
const toast__message: any = document.querySelector(".toast__message");
// Game
const gameheader: any = document.querySelector(".gameheader");
const settings: any = document.querySelector(".settings");
// history
const btnHistory = document.getElementById("viewhistory") as HTMLElement;
const historyContainer = document.getElementById("historyContainer") as HTMLElement;
const btnClsoeHistory = document.getElementById("btn_history_close") as HTMLElement;
const historyList = document.querySelector(".cotainer__history--list") as HTMLElement;
// Tạo mảng để chứa thẻ game
for (let i = 1; i <= SETTINGS.TOTAL_CART; i++) {
  listCart.push({ id: i, link: `/image/games/${i}.jpg` });
}
listCart.sort(() => 0.5 - Math.random());
// ->>>>>>>>>>>>>>>>>>>>>>>>>>>

interface User {
  username: string;
  password: string;
  level: number;
  score: number;
}
const accounts: User[] = [
  {
    username: "hoainam1",
    password: "123",
    level: 1,
    score: 0,
  },
  {
    username: "hoainam2",
    password: "123",
    level: 2,
    score: 10,
  },
  {
    username: "hoainam3",
    password: "123",
    level: 3,
    score: 40,
  },
];
let levelGame: number = Number(localStorage.getItem("level")) || 1;
let account: User = {
  username: "testrt",
  password: "********************************",
  level: levelGame,
  score: 0,
};
const getTimeFull = (): string => {
  const date = new Date(Date.now());
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.getMonth().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
};
document.forms[0].username.focus();
// Đăng nhập
document.forms[0].addEventListener("submit", function (e) {
  e.preventDefault();
  const username = this.username.value;
  const password = this.password.value;
  if (!username || !password) {
    return;
  }
  if (username) {
    const user = accounts.find((user) => user.username == username && user.password == password);
    if (!user) {
      account.username = username;
      account.password = password;
    } else {
      account = user;
    }
    gameMessage("Đăng nhập thành công !");

    // ẩn login

    const app = new App();
    app.start();
    this.classList.add("hidden");
    gameheader.classList.remove("hidden");
    settings.classList.remove("hidden");
  }
});

const gameContainer = document.getElementById("level__container") as HTMLElement;
type TCheckList = {
  id?: number | string;
  card?: HTMLElement;
  parent?: HTMLElement;
};
let arrlistHandle: TCheckList;

type NumString = number | string;
// history
type HistoryType = {
  id: NumString;
  level: NumString;
  timeFinish: string;
  stars: NumString;
  result: boolean;
  timefull: string;
};

const saveLocalHistory = (history: HistoryType) => {
  levelGame = Number(localStorage.getItem("level"));
  localHistory.push(history);
  localStorage.setItem("history", JSON.stringify(localHistory));
  history.level > levelGame && localStorage.setItem("level", JSON.stringify(history.level));
};

function displayHisroty(history: HistoryType, isSave: boolean = true) {
  if (isSave) {
    saveLocalHistory(history);
  }
  const html = `
  <ul class="cotainer__history--body">
  <li>${history.id}</li>
  <li>
    <img loading="lazy" src="/image/level-up.png" alt="" />
    <span class="ms-2 fs-bold fs-4 text-warning">${history.level}</span>
  </li>
  <li>${history.timeFinish}</li>
  <li>${history.stars}</li>
  <li><img src="/image/games/${history.result ? "win" : "lose"}.png" alt="" /></li>
  <li>${history.timefull}</li>
</ul>
  `;
  historyList.insertAdjacentHTML("afterbegin", html);
}

// local
let localHistory = JSON.parse(<any>localStorage.getItem("history")) ?? [];
if (localHistory.length >= 8) {
  const newLocalHistory = localHistory.slice(localHistory.length - 8);
  renderInitHistory(newLocalHistory);
  localStorage.setItem("history", JSON.stringify(newLocalHistory));
} else {
  renderInitHistory(localHistory);
}
function renderInitHistory(localHistory: HistoryType[]) {
  localHistory.map((history: HistoryType) => displayHisroty(history, false));
}

class App {
  // xử lý Khi lật thẻ quá nhanh
  private timeEnd: number = SETTINGS.TIME_LEVEL;
  private isEndGame: boolean = false;
  private isWin: boolean = false;
  private totalFippled: number = 0;
  private isHandle: boolean = false;
  protected renderCart = (level: number) => {
    // reset game
    this.isWin = false;
    this.totalFippled = 0;
    this.isHandle = false;
    this.isEndGame = false;
    arrlistHandle = {};
    this.renderUI(account.level);
    let HTML_BOX: string = "";
    // Xử lý ramdom thẻ
    const newCarts: TCart[] = listCart.slice(0, level * SETTINGS.CART_ONE_LEVEL);
    newCarts.push(...newCarts);
    newCarts.sort(() => 0.5 - Math.random());
    HTML_BOX = newCarts
      .map(
        (cart, index) => ` <div class="scene scene--card" style="animation-delay: ${
          index * 0.2
        }s" data-id=${cart.id}>
    <div class="card">
      <div class="card__face card__face--front">
        <img src="/image/games/0.png" alt="" />
      </div>
      <div class="card__face card__face--back">
        <img src="${cart.link}" alt="" />
      </div>
    </div>
  </div>`
      )
      .join("");

    gameContainer.innerHTML = HTML_BOX;
  };
  protected renderUI(level: number) {
    // box level;
    levelContainer.value = level;
    scoreContainer.value = account.score;
    let totalTime = this.timeEnd * level;
    // box time out;
    const idTimeCount = setInterval(() => {
      if (this.isEndGame) {
        clearInterval(idTimeCount);
        this.isEndGame = false;
        return;
      }

      timeoutContainer.value = this.handleTime(totalTime);
      totalTime--;
      if (totalTime < 0) {
        this.isEndGame = true;
        gameMessage("Hết giờ !", 2000);
        this.LostGame();
        clearInterval(idTimeCount);
      }
    }, 1000);
  }
  protected handleEvent() {
    gameContainer.addEventListener("click", (e) => {
      if (this.isHandle || this.isEndGame) return;

      const anyElement: any = e.target;
      if (anyElement.closest(".scene--card")) {
        const sceneEl: HTMLElement = anyElement.closest(".scene--card");
        const cartEl = sceneEl.firstElementChild;
        const id = sceneEl.dataset.id;

        this.handleResult(sceneEl, cartEl, id);
      }
    });
  }
  protected handleResult(parent: HTMLElement, card: any, id: any) {
    account.score > SETTINGS.LOSE_MIN_SCORE && card?.classList.add("is-flipped");
    if (arrlistHandle?.id && parent != arrlistHandle.parent) {
      // ngăn chặn spam click
      this.isHandle = true;
      if (arrlistHandle.id == id) {
        // win

        playAudio(SETTINGS.MUSIC_WIN);
        const idTimeout = setTimeout(() => {
          arrlistHandle.parent?.classList.add("scene-hidden");
          parent.classList.add("scene-hidden");
          scoreContainer.value = account.score += SETTINGS.WIN__CHOSE;
          this.isHandle = false;
          arrlistHandle = {};
          clearTimeout(idTimeout);

          // cộng số thẻ lật;
          this.totalFippled += 1;
          // dừng lại khi lật hết thẻ
          if (this.totalFippled >= account.level * SETTINGS.CART_ONE_LEVEL) {
            this.isEndGame = true;
            this.isWin = true;

            if (account.level > Math.floor(SETTINGS.TOTAL_CART / SETTINGS.CART_ONE_LEVEL)) {
              account.level = 1;
              gameMessage(`Quay lại Level ${account.level} nha!`, 2000);
            } else {
              this.handleGameFishised();
              account.level += 1;
              gameMessage(`Chinh Phục Level ${account.level} nha!`, 2000);
            }
            this.renderCart(account.level);
          }
        }, 1000);
      } else {
        // lost

        const idTimeout = setTimeout(() => {
          arrlistHandle.card?.classList.remove("is-flipped");
          card.classList.remove("is-flipped");
          scoreContainer.value = account.score -= SETTINGS.LOSE_CHOSE;
          if (account.score <= SETTINGS.LOSE_MIN_SCORE || this.isEndGame) {
            account.score = SETTINGS.LOSE_MIN_SCORE;
            this.LostGame();
          }
          clearTimeout(idTimeout);
          arrlistHandle = {};
          this.isHandle = false;

          // Dừng lại game khi hết điểm;
        }, 1000);
      }
    } else {
      arrlistHandle = { parent, card, id };
    }
  }
  protected handleTime(totalTime: number): string {
    return `${(Math.floor(totalTime / 60) + "").padStart(2, "0")}:${(
      (totalTime % 60) +
      ""
    ).padStart(2, "0")}`;
  }
  protected handleGameFishised(): void {
    const [minutes, second] = timeoutContainer.value.split(":");
    const timeUse = Number(minutes) * 60 + Number(second);
    const totaltime = Number(this.timeEnd * account.level);
    const historyGame: HistoryType = {
      id: localHistory.length,
      level: account.level,
      timeFinish: this.handleTime(totaltime - timeUse),
      stars: account.score,
      result: this.isWin,
      timefull: getTimeFull(),
    };
    displayHisroty(historyGame);
  }
  protected LostGame() {
    this.isWin = false;
    this.isEndGame = true;
    this.handleGameFishised();
    playAudio(SETTINGS.MUSIC_LOST);
    gameMessage(`Bạn đã thua cuộc - Bạn sẽ chơi lại sau ${SETTINGS.TIME_PLAY_GAIN}s`, 2000);
    const idRenderMap = setTimeout(() => {
      gameMessage(`Chơi lại Map Level ${account.level}`, Math.round(SETTINGS.TIME_PLAY_GAIN));

      if (scoreContainer.value <= SETTINGS.LOSE_MIN_SCORE) {
        account.score = 0;
      }
      this.renderCart(account.level);
      clearTimeout(idRenderMap);
    }, SETTINGS.TIME_PLAY_GAIN);
    return;
  }
  public start() {
    this.renderCart(account.level);
    this.handleEvent();
  }
}
const history_ganme: any[] = [];
// music
function playAudio(src: string) {
  audioElement?.setAttribute("src", src);
  audioElement?.addEventListener("loadeddata", () => {
    audioElement?.play();
  });
}

// Thông báo
function gameMessage(message: string, timeout: number = 1000) {
  toast__message.innerHTML = message;
  modal_toast.classList.add("show");
  const idTimeout = setTimeout(() => {
    modal_toast.classList.remove("show");
    clearTimeout(idTimeout);
  }, timeout);
}

btnHistory.addEventListener("click", function (e) {
  e.preventDefault();
  historyContainer.classList.toggle("hidden");
});

historyContainer.addEventListener("click", (e) => {
  e.stopPropagation();
});
btnClsoeHistory.onclick = () => {
  historyContainer.classList.add("hidden");
};
