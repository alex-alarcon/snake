var canvas;
var ctx;
var keystate;

var DIMENSIONX = 20;
var DIMENSIONY = 20;
var TAMANO = 20;

var IZQUIERDA = 37;
var ARRIBA = 38;
var DERECHA = 39;
var ABAJO = 40;
var SPACE = 32;
var PAUSE = 80;
var estaPausado = false;

var step = 0;
var puntaje = 0;
var engorda = 0;
var empieza = false;
var choque = false;
var comida = {};

var snake = {
  cabeza: {},
  cola: [],
  vx: 1,
  vy: 0,

  handleKeys: function() {
    if (keystate[IZQUIERDA]) {
      this.vx = -1;
      this.vy = 0;
    } else if (keystate[ARRIBA]) {
      this.vy = -1;
      this.vx = 0;
    } else if (keystate[DERECHA]) {
      this.vx = 1;
      this.vy = 0;
    } else if (keystate[ABAJO]) {
      this.vy = 1;
      this.vx = 0;
    }
  },
  
  update: function() {
    this.handleKeys();

    this.cola.unshift(new Punto(this.cabeza.x, this.cabeza.y));

    this.cabeza = new Punto(this.cabeza.x + this.vx, this.cabeza.y + this.vy)

    if(engorda > 0) {
      engorda--;
    } else if (
      this.cabeza.x == comida.x && 
      this.cabeza.y == comida.y
    ) {
      comida = al_azar(this.cabeza, this.cola);
    }else {
      this.cola.pop();
    }

    if (collision(this.cabeza, this.cola)) {
      choque = true;
    }
  },

  pintarCola: function() {
    for (var i = 0; i < this.cola.length; i++) {
      cuadrado(this.cola[i]);
    }
  },

  pintarCabeza: function() {
    if (!choque) {
      cuadrado(this.cabeza, 'red');
    }
  }
}

function snakeCollision(cabeza, cola) {
  for (var i = 0; i < cola.length; i++) {
    if (cabeza.x === cola[i].x && cabeza.y === cola[i].y) {
      return true;
    }
  }
  return false;
}

function edgeCollision(cabeza, cola) {
  if (cabeza.x === DIMENSIONX || cabeza.y === DIMENSIONY) {
    return true;
  }
  if (cabeza.x - 1 < -1 || cabeza.y - 1 < -1) {
    return true;
  }
}

function collision(cabeza, cola){
  return snakeCollision(cabeza, cola) || edgeCollision(cabeza, cola)
}

function Punto(x, y) {
  this.x = x;
  this.y = y;
}

function cuadrado(punto, color = 'green') {
  ctx.fillStyle = color;
  ctx.fillRect(punto.x * TAMANO, punto.y * TAMANO, TAMANO - 1, TAMANO - 1);
}

function pintarTablero() {
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, DIMENSIONX * TAMANO, DIMENSIONY * TAMANO);
  ctx.restore();
}

function pintarPuntaje() {
  ctx.save();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;

  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Puntos: ' + snake.cola.length, 
    (DIMENSIONX * TAMANO) / 2, 
    DIMENSIONY * TAMANO + (TAMANO / 2)
  );
  ctx.restore(); 
}

function pintarMensaje(x, y, mensaje) {
  ctx.save();
  ctx.textAlign="center"; 
  ctx.fillStyle = "white";
  ctx.font="20px Georgia"
  ctx.fillText(mensaje, x, y);
  ctx.restore(); 
}

function pintar() {
  pintarTablero();
  pintarPuntaje();
  snake.pintarCabeza();
  snake.pintarCola();
  cuadrado(comida, 'yellow');
}

function reiniciar() {
  choque = false;
  estaPausado = false;
  puntaje = 0;
  step = 0;
  snake.cabeza = new Punto(0, 0);
  snake.cola = []
  snake.vx = 0;
  snake.vy = 0;
  comida = al_azar(snake.cabeza, snake.cola);
}

function loop() {
  if (step == 10) {
    if (!estaPausado && !choque) {
      update();
      pintar();
    } else if (estaPausado && !choque){
      pintarMensaje((DIMENSIONX * TAMANO) / 2, (DIMENSIONY * TAMANO) / 2, "PAUSE");
    } else if (!estaPausado && choque) {
      pintarMensaje((DIMENSIONX * TAMANO) / 2, (DIMENSIONY * TAMANO) / 2, "GAME OVER");
      pintarMensaje((DIMENSIONX * TAMANO) / 2, ((DIMENSIONY * TAMANO) / 2) + 25, "Presione 'R' para reiniciar"); 
    }
    step = 0;
  }
  step++;
  window.requestAnimationFrame(loop);
}

function al_azar(cabeza, cola){
  var invalido = true, _x, _y;

  while( invalido ){
    _x = Math.floor( Math.random() * (DIMENSIONX - 1) );
    _y = Math.floor( Math.random() * (DIMENSIONY - 1) );

    if( _x != cabeza.x && _y != cabeza.y ){
      invalido = false;
    } else {
      for (var i = 0; i < cola.length; i++) {
        if( _x != cola[i].x && _y != cola[i].y ){
          invalido = false;
        }
      }
    }
  }

  return new Punto(_x, _y);
}

function init() {
  snake.cabeza = new Punto(0, 0);
  snake.vx = 0;
  snake.vy = 0;
  comida = al_azar(snake.cabeza, snake.cola);
  step = 0;
  pintar();

  loop();  
}

function update() {
  if (!choque) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pintarPuntaje();
    snake.update();
  }
}

function main() {
  canvas = document.createElement('canvas');
  canvas.width = DIMENSIONX * TAMANO;
  canvas.height = DIMENSIONY * TAMANO + 20;
  ctx = canvas.getContext('2d');
  document.body.appendChild(canvas);

  keystate = {};
  document.addEventListener('keydown', function(evt) {
    keystate[evt.keyCode] = true;
    if (evt.keyCode == PAUSE) {
      estaPausado = !estaPausado;
    }
    if (evt.keyCode == 82) {
      reiniciar();
    }
  });

  document.addEventListener('keyup', function(evt) {
    setTimeout(function() { 
      delete keystate[evt.keyCode] 
    }, 100);
  });

  init()
}

main();