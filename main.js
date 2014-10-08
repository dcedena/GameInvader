
// Objetos de canvas
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

// Crear el objeto de la nave
var nave = {
    x: 100,
    y: canvas.height - 75,
    width: 50,
    height: 50,
    contador: 0
}
var juego = {
    estado: 'iniciando'
};
var textoRespuesta = {
    contador: -1,
    titulo: '',
    subtitulo: ''
}

var teclado = {}
// Array para los disparos
var disparos = [];
// Array disparos enemigos
var disparosEnemigos = [];
// Array que contiene a los enemigos
var enemigos = [];
// Variables de las imágenes
var fondo;

//Definición de funciones
function loadMedia() {
    fondo = new Image();
    fondo.src = "space.jpg";
    fondo.onload = function () {
        var intervalo = window.setInterval(frameLoop, 1000/55);
    }
    fondo.onkeypress = function () {
        
    }
}
function dibujarFondo() {
    ctx.drawImage(fondo, 0, 0);
}

function dibujarNave() {
    ctx.save();
    if(nave.estado != 'hit') {
        ctx.fillStyle = "white";
        ctx.fillRect(nave.x, nave.y, nave.width, nave.height);
    }
    else
        delete nave;

    ctx.restore();
}

function dibujarEnemigos() {
    for(var i in enemigos) {
        var enemigo = enemigos[i];
        ctx.save();
        if(enemigo.estado == 'vivo') ctx.fillStyle = "red";
        if(enemigo.estado == 'muerto') ctx.fillStyle = "black";
        ctx.fillRect(enemigo.x, enemigo.y, enemigo.width, enemigo.height);
        ctx.restore();
    }

}

function agregarEventosTeclado() {
    agregarEvento(document, "keydown", function (e) {
        // Ponemos a true la tecla presionada.
        teclado[e.keyCode] = true;
    });

    agregarEvento(document, "keyup", function (e) {
        // Ponemos a false la tecla que ya no es presionada.
        teclado[e.keyCode] = false;
    });

    function agregarEvento(elemento, nombreEvento, funcion) {
        if (elemento.addEventListener) {
            // Navegadores de verdad: Chrome, Firefox, Opera
            elemento.addEventListener(nombreEvento, funcion, false);
        }
        else if(elemento.attachEvent)
        {
            // Internet Explorer :(
            elemento.attachEvent(nombreEvent, funcion);
        }
    }
}

function moverNave() {
    if (teclado[37]) {
        // Key: Cursor izquierda
        nave.x -= 5;
        if (nave.x < 0) nave.x = 0;
    }
    else if (teclado[39])
    {
        // Key: Cursor derecha
        var limite = canvas.width - nave.width;
        nave.x += 5;
        if (nave.x > limite) nave.x = limite;
    }
    
    if(teclado[32]) {
        // Key: Barra de Espacio
        if(!teclado.fire) {
            fire();
            teclado.fire = true;
        }
    }
    else
        teclado.fire = false; 

    if(nave.estado == 'hit') {
        nave.contador++; 
        if(nave.contador >= 20) {
            nave.contador = 0;
            nave.estado = 'muerto';
            juego.estado = 'gameover';
            textoRespuesta.titulo = 'GAME OVER';
            textoRespuesta.subtitulo = 'Presiona la tecla R para reiniciar.';
            textoRespuesta.contador = 0;
        }  
    }
}

function dibujarDisparosEnemigos() {
    for(var i in disparosEnemigos) {
        var disparo = disparosEnemigos[i];
        ctx.save();
        ctx.fillStyle = 'yellow';
        ctx.fillRect(disparo.x, disparo.y, disparo.width, disparo.height);
        ctx.restore();
    }
}

function moverDisparosEnemigos() {
    for(var i in disparosEnemigos) {
        var disparo = disparosEnemigos[i];
        disparo.y += 3;
    }
    disparosEnemigos = disparosEnemigos.filter(function(disparo) {
        return disparo.y < canvas.height;
    });

}

function actualizarEnemigos() {
    function agregarDisparosEnemigos(enemigo) {
        return {
            x: enemigo.x,
            y: enemigo.y,
            width: 10,
            height: 30,
            contador: 0
        }
    }

    if(juego.estado == 'iniciando') {
        for(var i = 0; i < 10; i++) {
            enemigos.push({
                x: 10 + (i * 50),
                y: 10,
                width: 40,
                height: 40,
                estado: 'vivo',
                contador: 0
            });
        }
        juego.estado = 'jugando';
    }        
    for(var i in enemigos) {
        var enemigo = enemigos[i];
        if(!enemigo) continue;
        if(enemigo && enemigo.estado == 'vivo') {
            enemigo.contador++;
            enemigo.x += Math.sin(enemigo.contador * Math.PI / 90) * 5;

            if(aleatorio(0, enemigos.length * 10) == 4) {
                disparosEnemigos.push(agregarDisparosEnemigos(enemigo));
            }
        }
        if(enemigo && enemigo.estado == 'hit') {
            enemigo.contador++;
            if(enemigo.contador >= 20) {
                enemigo.estado = 'muerto';
                enemigo.contador = 0;
            }
        }

        enemigos = enemigos.filter(function(enemigo) {
            if(enemigo && enemigo.estado != 'muerto')
                return true;
            else
                return false;
        });

    }
}

function moverDisparos() {
    for(var i in disparos) {
        var disparo = disparos[i];
        disparo.y -= 2;
    }
    disparos = disparos.filter(function(disparo) {
        return (disparo.y > 0);
    } );
}

function fire() {
    disparos.push( { 
        x: nave.x + 20,
        y: nave.y - 10,
        width: 10,
        height: 30
     } );
}

function dibujarDisparos() {
    ctx.save();
    ctx.fillStyle = "white";
    for(var i in disparos) {
        var disparo = disparos[i];
        ctx.fillRect(disparo.x, disparo.y, disparo.width, disparo.height);
    }
    ctx.restore();
}

function dibujarTexto() {
    if(textoRespuesta.contador == -1) return;
    var alpha = textoRespuesta.contador / 50.0;
    if(alpha > 1) { 
        for(var i in enemigos) {
            delete enemigos[i];
        }
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    if(juego.estado == 'gameover') {
        ctx.fillStyle = 'white';
        ctx.font = 'Bold 40pt Arial';
        ctx.fillText(textoRespuesta.titulo, 140, 200);
        ctx.font = '14pt Arial';
        ctx.fillText(textoRespuesta.subtitulo, 190, 250);
    }
    if(juego.estado == 'victoria') {
        ctx.fillStyle = 'white';
        ctx.font = 'Bold 40pt Arial';
        ctx.fillText(textoRespuesta.titulo, 140, 200);
        ctx.font = '14pt Arial';
        ctx.fillText(textoRespuesta.subtitulo, 190, 250);
    }
    ctx.restore();
}

function actualizarEstadoJuego() {
    if(juego.estado == 'jugando' && enemigos.length == 0) {
        juego.estado = 'victoria';
        textoRespuesta.titulo = 'Derrotaste a los enemigos';
        textoRespuesta.subtitulo = 'Presiona la tecla R para reiniciar.';
        textoRespuesta.contador = 0;
    }
    if(textoRespuesta.contador >= 0) {
        textoRespuesta.contador++;
    }
    if((juego.estado == 'gameover' || juego.estado == 'victoria') && teclado[82]) {
        juego.estado = 'iniciando';
        nave.estado = 'vivo';
        textoRespuesta.contador = -1;
    }
}

// Comprobar colisión
function hit(a, b) {
    var hit = false;
    if(b.w + b.width >= a.x && b.x < a.x + a.width) {
        if(b.y + b.height >= a.y && b.y < a.y + a.height) {
            hit = true;
        }
    }
    if(b.x <= a.x && b.x + b.width >= a.x + a.width) {
        if(b.y <= a.y && b.y + b.height >= a.y + a.height) {
            hit = true;
        }
    }
    if(a.x <= b.x && a.x + a.width >= b.x + b.width) {
        if(a.y <= b.y && a.y + a.height >= b.y + b.height) {
            hit = true;
        }
    }
    return hit;
}

function verificarColision() {
    for(var i in disparos) {
        var disparo = disparos[i];
        for(j in enemigos) {
            var enemigo = enemigos[j];
            if(hit(disparo, enemigo)) {
                enemigo.estado = 'hit';
                enemigo.contador = 0;
                //console.log('COLISION');               
            }
        }
    }
    if(nave.estado == 'hit' || nave.estado == 'muerto') return;
    for(var i in disparosEnemigos) {
        var disparo = disparosEnemigos[i];
        if(hit(disparo, nave)) {
            nave.estado = 'hit';
           // console.log("COLISION");
        }
    }
}

function aleatorio(inferior, superior) {
   // console.log("dentro aleatorio Inf: " + inferior + "Sup: " + superior);
    var posibilidades = superior - inferior;
    var a = Math.random() * posibilidades;
    a = Math.floor(a);
    return parseInt(inferior) + a;
}

function frameLoop() {
    actualizarEstadoJuego();
    moverNave();
    moverDisparos();
    moverDisparosEnemigos();
    dibujarFondo();
    verificarColision();
    actualizarEnemigos();
    dibujarEnemigos();
    dibujarDisparosEnemigos();
    dibujarDisparos();
    dibujarTexto();
    dibujarNave();
}


// Ejecución de funciones
loadMedia();
agregarEventosTeclado();
