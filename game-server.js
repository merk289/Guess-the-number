const zmq = require("zeromq");

async function main() {
  const sock = new zmq.Pair();
  sock.bind("tcp://*:5555");
  console.log("Готов к игре... (tcp://*:5555)");

  try {
    const [rangeBuf] = await sock.receive();
    const { range } = JSON.parse(rangeBuf.toString());
    console.log("Получен диапазон:", range);

    let [lo, hi] = range.split("-").map((n) => parseInt(n, 10));

    while (true) {
      const guess = Math.floor((lo + hi) / 2);
      console.log("Отправляю ответ:", guess);
      await sock.send(JSON.stringify({ answer: guess }));

      const [hintBuf] = await sock.receive();
      const { hint } = JSON.parse(hintBuf.toString());
      console.log("Получена подсказка:", hint);

      if (hint === "correct") {
        console.log("Число угадано! Игра завершена.");
        break;
      } else if (hint === "more") {
        lo = guess + 1;
      } else if (hint === "less") {
        hi = guess - 1;
      } else {
        console.error("Неизвестная подсказка:", hint);
        break;
      }
    }
  } catch (err) {
    console.error("Ошибка:", err);
  } finally {
    sock.close();
  }
}

main();
