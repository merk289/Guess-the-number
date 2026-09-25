const zmq = require("zeromq");

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Использование: node game-client <min> <max>");
    process.exit(1);
  }

  const min = parseInt(args[0], 10);
  const max = parseInt(args[1], 10);
  if (Number.isNaN(min) || Number.isNaN(max) || min > max) {
    console.error("Некорректный диапазон");
    process.exit(1);
  }

  const target = min + Math.floor(Math.random() * (max - min + 1));
  console.log(`Загадано число: ${target} (диапазон ${min}-${max})`);

  const sock = new zmq.Pair();
  sock.connect("tcp://localhost:5555");

  try {
    await sock.send(JSON.stringify({ range: `${min}-${max}` }));

    while (true) {
      const [ansBuf] = await sock.receive();
      const { answer } = JSON.parse(ansBuf.toString());
      console.log("Ответ сервера:", answer);

      if (answer === target) {
        console.log("Сервер угадал число! Игра окончена.");
        await sock.send(JSON.stringify({ hint: "correct" }));
        break;
      } else if (answer < target) {
        await sock.send(JSON.stringify({ hint: "more" }));
      } else {
        await sock.send(JSON.stringify({ hint: "less" }));
      }
    }
    await new Promise((r) => setTimeout(r, 100));
  } catch (err) {
    console.error("Ошибка:", err);
  } finally {
    sock.close();
  }
}

main();
