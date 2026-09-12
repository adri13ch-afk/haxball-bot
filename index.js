import haxball from "haxball.js";

async function startRoom() {
  // Manejamos la carga tanto si se exporta como función directa o por propiedad .default
  const HBInit = typeof haxball === "function" ? await haxball() : await haxball.default();

  const room = HBInit({
    roomName: "x4 y la csmr 2.0 ⚡ POWERSHOT",
    maxPlayers: 20,
    public: true,
    noPlayer: true
  });

  room.setDefaultStadium("Big");
  room.setScoreLimit(3);
  room.setTimeLimit(3);

  // Lógica de PowerShot
  var power = {};
  var POWER_DISTANCE = 32;
  var POWER_CHARGE_TIME = 2000;
  var POWER_MULTIPLIER = 1.5;
  var POWER_MAX_SPEED = 15;

  function resetPower(id) {
    power[id] = { charging: false, charged: false, startTime: 0 };
  }

  function distance(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  setInterval(function() {
    var players = room.getPlayerList();
    var ball = room.getBallPosition();
    if (!ball) return;

    for (var i = 0; i < players.length; i++) {
      var player = players[i];
      if (player.team === 0 || !player.position) continue;
      if (!power[player.id]) resetPower(player.id);

      var state = power[player.id];
      if (state.charged) continue;

      if (distance(player.position, ball) <= POWER_DISTANCE) {
        if (!state.charging) {
          state.charging = true;
          state.startTime = Date.now();
        }
        if (Date.now() - state.startTime >= POWER_CHARGE_TIME) {
          state.charging = false;
          state.charged = true;
          room.sendAnnouncement("⚡ POWERSHOT CARGADO", player.id, 0xFF8800, "bold", 1);
        }
      } else {
        state.charging = false;
        state.startTime = 0;
      }
    }
  }, 50);

  room.onPlayerBallKick = function(player) {
    if (!power[player.id] || !power[player.id].charged) return;

    var ball = room.getDiscProperties(0);
    if (!ball) return;

    var speed = Math.sqrt(ball.xspeed * ball.xspeed + ball.yspeed * ball.yspeed) || 0.01;
    var newSpeed = Math.min(speed * POWER_MULTIPLIER, POWER_MAX_SPEED);
    var mult = newSpeed / speed;

    room.setDiscProperties(0, {
      xspeed: ball.xspeed * mult,
      yspeed: ball.yspeed * mult
    });

    room.sendAnnouncement("💥 " + player.name + " ¡POWERSHOT!", null, 0xFF3300, "bold", 1);
    resetPower(player.id);
  };
}

startRoom().catch((err) => {
  console.error("Error al iniciar la sala:", err);
});
