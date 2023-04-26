//****** GAME LOOP ********//
    
var time = new Date();
var deltaTime = 0;

if(document.readyState === "complete" || document.readyState === "interactive"){
    setTimeout(Init, 1);
}else{
    document.addEventListener("DOMContentLoaded", Init); 
}

function Init() {
    time = new Date();
    Start();
    Loop();
}

function Loop() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    Update();
    requestAnimationFrame(Loop);
}

//****** GAME LOGIC ********//

var sueloY = 22;
var velY = 0;
var impulso = 900;
var gravedad = 2500;

var caballeroPosX = 42;
var caballeroPosY = sueloY; 

var sueloX = 0;
var velEscenario = 1280/3;
var gameVel = 1;
var score = 0;

var parado = false;
var saltando = false;

var tiempoHastaObstaculo = 2;
var tiempoObstaculoMin = 0.7;
var tiempoObstaculoMax = 1.8;
var obstaculoPosY = 16;
var obstaculos = [];

var tiempoHastapastel = 0.5;
var tiempopastelMin = 0.7;
var tiempopastelMax = 2.7;
var maxpastelY = 270;
var minpastelY = 100;
var pastels = [];
var velpastel = 0.5;

var contenedor;
var caballero;
var textoScore;
var suelo;
var gameOver;

function Start() {
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    caballero = document.querySelector(".caballero");
    document.addEventListener("keydown", HandleKeyDown);
}

function Update() {
    if(parado) return;
    
    Movercaballerosaurio();
    MoverSuelo();
    DecidirCrearObstaculos();
    DecidirCrearpastels();
    MoverObstaculos();
    Moverpastels();
    DetectarColision();

    velY -= gravedad * deltaTime;
}

function HandleKeyDown(ev){
    if(ev.keyCode == 32){
        Saltar();
    }
}

function Saltar(){
    if(caballeroPosY === sueloY){
        saltando = true;
        velY = impulso;
        caballero.classList.remove("caballero-corriendo");
    }
}

function Movercaballerosaurio() {
    caballeroPosY += velY * deltaTime;
    if(caballeroPosY < sueloY){
        
        TocarSuelo();
    }
    caballero.style.bottom = caballeroPosY+"px";
}

function TocarSuelo() {
    caballeroPosY = sueloY;
    velY = 0;
    if(saltando){
        caballero.classList.add("caballero-corriendo");
    }
    saltando = false;
}

function MoverSuelo() {
    sueloX += CalcularDesplazamiento();
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

function CalcularDesplazamiento() {
    return velEscenario * deltaTime * gameVel;
}

function Estrellarse() {
    caballero.classList.remove("caballero-corriendo");
    caballero.classList.add("caballero-estrellado");
    parado = true;
}

function DecidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if(tiempoHastaObstaculo <= 0) {
        CrearObstaculo();
    }
}

function DecidirCrearpastels() {
    tiempoHastapastel -= deltaTime;
    if(tiempoHastapastel <= 0) {
        Crearpastel();
    }
}

function CrearObstaculo() {
    var obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("chineseplace");
    if(Math.random() > 0.5) obstaculo.classList.add("chineseplace2");
    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth+"px";

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax-tiempoObstaculoMin) / gameVel;
}

function Crearpastel() {
    var pastel = document.createElement("div");
    contenedor.appendChild(pastel);
    pastel.classList.add("pastel");
    pastel.posX = contenedor.clientWidth;
    pastel.style.left = contenedor.clientWidth+"px";
    pastel.style.bottom = minpastelY + Math.random() * (maxpastelY-minpastelY)+"px";
    
    pastels.push(pastel);
    tiempoHastapastel = tiempopastelMin + Math.random() * (tiempopastelMax-tiempopastelMin) / gameVel;
}

function MoverObstaculos() {
    for (var i = obstaculos.length - 1; i >= 0; i--) {
        if(obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            GanarPuntos();
        }else{
            obstaculos[i].posX -= CalcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX+"px";
        }
    }
}

function Moverpastels() {
    for (var i = pastels.length - 1; i >= 0; i--) {
        if(pastels[i].posX < -pastels[i].clientWidth) {
            pastels[i].parentNode.removeChild(pastels[i]);
            pastels.splice(i, 1);
        }else{
            pastels[i].posX -= CalcularDesplazamiento() * velpastel;
            pastels[i].style.left = pastels[i].posX+"px";
        }
    }
}

function GanarPuntos() {
    score++;
    textoScore.innerText = score;
    if(score == 5){
        gameVel = 1.5;
        contenedor.classList.add("mediodia");
    }else if(score == 10) {
        gameVel = 2;
        contenedor.classList.add("tarde");
    } else if(score == 20) {
        gameVel = 3;
        contenedor.classList.add("noche");
    }
    suelo.style.animationDuration = (3/gameVel)+"s";
}

function GameOver() {
    Estrellarse();
    gameOver.style.display = "block";
}

function DetectarColision() {
    for (var i = 0; i < obstaculos.length; i++) {
        if(obstaculos[i].posX > caballeroPosX + caballero.clientWidth) {
            //EVADE
            break; //al estar en orden, no puede chocar con más
        }else{
            if(IsCollision(caballero, obstaculos[i], 10, 30, 15, 20)) {
                GameOver();
            }
        }
    }
}

function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}

