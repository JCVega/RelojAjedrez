//Nos indica cual de los dos relojes es el activo
var relojActivo;
//contexto del canvas, este objeto es quien se encarga de realmente dibujar
var ctx;
//radio total del reloj
var radius;
//medida de los relojes (alto y ancho)
var medida=400;
//objeto que guarda el intervalo del reloj, nos ayuda a poder detener la cuenta;
var interReloj;
//variable booleana que nos ayuda a saber si las blancas estan o no activas
var BlancasActivas;
//fecha y hora de la ultima vez que cambio el reloj, esto para saber a cuanto tiempo hay que restarle al jugador actual;
var UltimoCambio;
//Guarda el tiempo que tienen las blancas
var tiempoBlancas;
//Guarda el tiempo que tienen las negras
var tiempoNegras;
//Audio de alarma cuando termina
var termino=document.getElementById("termino");
//audio de alarma cuando cambia de jugador;
var cambio=document.getElementById("cambio");

//Guardamos los tamaños de los relojes que tenemos, siempre de menor a mayor, y guardamos tambien el tamaño de los pasos que daremos para dibujar los numeros
var opcionesRelojes=[
	{tiempoMaximo:5,paso:1},
	{tiempoMaximo:12,paso:1},
	{tiempoMaximo:30,paso:3},
	{tiempoMaximo:60,paso:5},
	{tiempoMaximo:90,paso:10}
];
var opcionRelojes;
//al empezar nos aseguramos que ningunn sonido se este ejecutando;
window.onload=function(){
	termino.pause();
	cambio.pause();
}

//esta funcion se activa cuando se da click en el boton comenzar
function botonComenzar(){
	//obtenemos el valor de las cajas de texto
	minutosBlancas= $("#tiempoBlancas").val();
	minutosNegras=$("#tiempoNegras").val();
	//revisamos si se indico que las blancas estan jugando del lado derecho
	blancasDerecha=$("#blancasDerecha").is(':checked');
	//Si los minutos de las blancas son mayores que 90 o menores que 0 o iguales que 0 entonces no se puede comenzar, lo mismo pasa con las negras
	if(minutosBlancas>90 || minutosBlancas<=0 || minutosNegras>90 || minutosNegras<=0)
	{
		alert('el intervalo de tiempo debe ser entre 1 y 90 minutos');
		return;
	}
	//Si las blancas juegan a la derecha le ponemos la clase derecha al reloj
	if(blancasDerecha)
	{
		$(".reloj[data-piezas=blancas]").addClass("derecha");
	}
	//si no se le quitamos la clase (por si se queda en memoria la clase)
	else{
		$(".reloj[data-piezas=blancas]").removeClass("derecha");
	}
	//usamos el operador ternario para saber cual de los dos tiempos es el mas grande
	var maximoMinutos = minutosBlancas>minutosNegras?minutosBlancas:minutosNegras;
	var i=-1;
	do{
		i++;
		
	}while(maximoMinutos>opcionesRelojes[i].tiempoMaximo);
	opcionRelojes=opcionesRelojes[i];
	
	//cambiamos el section Activo, ahora es el section relojes
	$(".tiempoRelojes").removeClass("activo");
	$(".relojes").addClass("activo");
	//creamos el intervalo de tiempo para cada jugador, con los valores agregados en las cajas
	tiempoBlancas=new Date(0,0,0,0,minutosBlancas,0,0);
    tiempoNegras=new Date(0,0,0,0,minutosNegras,0,0);
	//damos comienzo al juego;
	comenzar();
}
function comenzar(){
	//buscamos todos los canvas marcados como reloj;
	relojes = $("canvas.reloj");
	for(var i=0; i< relojes.length;i++){
		var reloj=relojes[i];
		//por cada reloj obtenemos el contexto
		ctx = reloj.getContext("2d");
		//le damos la altura y anchura previamente especificada;
		reloj.height=medida;
		reloj.width=medida;
		//el radio es la mitad de la medida de alto que habiamos marcado
		radius = medida / 2;
		//dentro del canvas transladamos el punto de inicio justo a la mitad
		ctx.translate(radius, radius);
	}
	//reducimos el radio a un 90% para que las manecillas no  se dibujen hasta la orilla
	radius = radius * 0.90;
	//activamos el reloj de las blancas
	ActivarReloj("blancas");
	//dibujamos el tiempo restante, que en este momento es el tiempo que se le dio de inicio
	dibujarReloj(tiempoBlancas);
	
	//hacemos lo mismo para las negras
	ActivarReloj("negras");
	dibujarReloj(tiempoNegras);
	
	//activamos el reloj de las blancas
	ActivarReloj("blancas");
	//comenzamos a contar el tiempo de juego a partir de ahora;
	UltimoCambio=new Date();
}

//creamos sobre el documento un evento para saber cuando se pulsa una tecla
document.addEventListener("keypress", function(e){
	//si la tecla que se pulso es la barra espaciadora
  if(e.key===" ")
  {
	  //ejecutamos el sonido de cambio, y detenemos el reloj en lo que hacemos los calculos;
	cambio.play();
	clearInterval(interReloj);
	//si estan jugando las blancas
	if(BlancasActivas)
	{
		//le restamos a las blancas el tiempo transcurrido desde el ultimo cambio Ejemplo: si ahora son las 14:15:40 si a blancas le quedan 2 minutos 0 segundos y  el
		//ultimo cambio fue a las 14:15:10 entonces al tiempo de las blancas hay que restarle 30 segundos, y le quedaran 1 minuto 30 segundos
		//tiempoBlancas =(tiempoBlancas-(ahora-UltimoCambio));
		tiempoBlancas=restarFechas(tiempoBlancas,transcurridoUltimoCambio());
		//registramos que el ultimo cambio es en este momento
		UltimoCambio=new Date();
		//y activamos el reloj para las negras
		ActivarReloj("negras");
	}
	//si no estan activas las negras hacemos algo parecido pero para las otras piezas
	else{
		tiempoNegras=restarFechas(tiempoNegras,transcurridoUltimoCambio());
		UltimoCambio=new Date();
		ActivarReloj("blancas")
	}
  }
});

//en JavaScript se complica un poco la resta de fechas, por eso usamos la siguiente funcion
function restarFechas(date1,date2){
	//obtenemos dos fechas, y con getTime obtenemos los milisegundos totales de cada fecha. con los milisegundos de diferencia creamos un nuevo objeto de tipo fecha
	var diffDays = new Date( date1.getTime() - date2.getTime()); 
	//javascript despues de la resta mantiene el tiempo de desface con la zona horarioa UTC 0, entonces hay que calcular cual es ese desface, 
	//lo sabemos restando la misma fecha y obteniendo cuntas horas de diferencia obtuvp
	desfaceHoras=(new Date(date1.getTime()-date1.getTime())).getHours();
	//para eliminar esa diferencia por la hora UTC restamamos las horas de desface y listo
	diffDays.setHours(diffDays.getHours()-desfaceHoras);
	//devolvemos las differencia de horas
	return diffDays;
}

function transcurridoUltimoCambio()
{
	//para saber cuanto tiempo ha transcurrido desde el ultimo cambio solo hay que calcular cuanto paso desde el ultimo cambio;
	var transcurrido= restarFechas( new Date() , UltimoCambio);
	return transcurrido;
}
//Activar reloj cambia el contexto entre los relojes, para saber sobre cual de los dos vamos a cambiar el horario.
function ActivarReloj(color){
	if(color=="blancas")
		BlancasActivas=true;
	else 
		BlancasActivas=false;
	relojActivo=document.querySelector(".reloj[data-piezas="+color+"]");
	ctx = relojActivo.getContext("2d");
	clearInterval(interReloj);
	interReloj=setInterval(dibujarReloj, 1000);
}

//Autocomentado
function dibujarReloj(tiempo) {
  dibujarCara(ctx, radius);
  dibujarNumeros(ctx, radius);
  dibujarTiempo(ctx, radius,tiempo);
}

function dibujarCara(ctx, radius) {
  var grad;
  //comenzamos una linea
  ctx.beginPath();
  //con las siguientes lineas dibujamos un circulo blanco, recordar que un circulo tiene 2PI de longitud de arco
  ctx.arc(0, 0, radius, 0, 2*Math.PI);
  ctx.fillStyle = 'white';
  //dibujamos el circulo con relleno
  ctx.fill();
  //Creamos un degradado para el contorno del reloj, este va comenzar desde el 95% del radio hasta el 105% del radio
  grad = ctx.createRadialGradient(0,0,radius*0.95, 0,0,radius*1.05);
  //agregamos el color azul al degradado
  grad.addColorStop(0, '#061886');
  //luego blanco
  grad.addColorStop(0.25, 'white');
  grad.addColorStop(0.75, 'white');
  // y por ultimo el azul nuevamente
  grad.addColorStop(1, '#061886');
  //como color agregamos el gradiente que agregamos
  ctx.strokeStyle = grad;
  //el ancho de la linea sera de un 10% del radio;
  ctx.lineWidth = radius*0.1;
  //dibujamos pero solo el contorno, sin relleno
  ctx.stroke();
   //comenzamos una linea
  ctx.beginPath();
  //ahora dibujamos un circulo azul de un 10% del tamaño del radio, este es el centro de nuestro reloj
  ctx.arc(0, 0, radius*0.1, 0, 2*Math.PI);
  ctx.fillStyle = '#061886';
  ctx.fill();
}
//dibuja los numeros del reloj
function dibujarNumeros(ctx, radius) {
  var ang;
  var num;
  // las letras tendran un tamaño del 15% del radio, y estaran al centro del punto que se le indique
  ctx.font = radius*0.15 + "px arial";
  ctx.textBaseline="middle";
  ctx.textAlign="center";
  //dibujaremos del 10 al 90, en intervalos de 10 (quiza deberiamos dibujar dependiendo el numero maximo de minutos que se seleccionaron)
  for(num = opcionRelojes.paso; num <= opcionRelojes.tiempoMaximo; num+=opcionRelojes.paso){
	// el angulo en donde se pondra se cualculara con el numero actual, recordar que el circulo tiene 2PI de largo de arco, y que dibujaremos hasta 90
    ang = num *(2* Math.PI) / opcionRelojes.tiempoMaximo;
	//hacemos un rotate para cambiar la direccion en la que se va a dibujar
    ctx.rotate(ang);
	//nos transladamos del centro hasta el 85% del radio
    ctx.translate(0, -radius*0.85);
	//rotamos el angulo de regreso, para que se dibujen en plano los numeros, si no se regresa se quedarian de lado los numeros
    ctx.rotate(-ang);
	//escribimos el numero actual
    ctx.fillText(num.toString(), 0, 0);
	//regresamos el angulo y nos regresamos al inicio del reloj
    ctx.rotate(ang);
    ctx.translate(0, radius*0.85);
    ctx.rotate(-ang);
  }
  
  //aplicamos practicamente lo mismo que en la parte de arriba, pero ahora con 60 intervalos por vuelta y con numeros cada 15, este es el segundero
  ctx.font = radius*0.08 + "px arial";
  for(num = 15; num < 61; num+=15){
    ang = num *(2* Math.PI) / 60;
    ctx.rotate(ang);
    ctx.translate(0, -radius*0.45);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius*0.45);
    ctx.rotate(-ang);
  }
}

//Dibujamos el tiempo. Si se indica un tiempo se pone ese tiempo, si no se calcula el tiempo dependiendo del reloj activo
function dibujarTiempo(ctx, radius,tiempo){
	var restante;
	//si tenemos un tiempo le asignamos este al restante, restante es el que se va a dibujar
	if(tiempo){
		restante=tiempo;
	}
	else{
		// si no se indica el tiempo calculamos el restante dependiendo el tiempo transcurrido y el tiempo que le quedaba
		if(BlancasActivas)
		{
			restante=restarFechas(tiempoBlancas , transcurridoUltimoCambio());
		}
		else
		{
			restante=restarFechas(tiempoNegras , transcurridoUltimoCambio());
		}
	}	
	//Obtenemos los minutos y segundos que se van a dibujar
    var minute = (restante.getHours()*60) + restante.getMinutes();
    var second = restante.getSeconds();
	var seAcaBoElTiempo=minute==0&&second==0;
    //minute
	//calculamos el angulo de los minutos recordar que la vuelta completa es de 2PI, y calculamos un total de 90 minutos por vuelta, mas la fraccion de vuelta por los segundos
    minute=(minute* (2* Math.PI)/opcionRelojes.tiempoMaximo)+(second*(2*Math.PI)/(opcionRelojes.tiempoMaximo*60));
	//dibjamos la manecilla en un 70% del radio del reloj
    dibujarManecilla(ctx, minute, radius*0.8, radius*0.07);
    // second
	//calculamos el angulo de los segundos recordar que la vuelta completa es de 2PI, y calculamos un total de 60 segundos por vuelta
    second=(second*(2*Math.PI)/60);
	//dibujamos el radio en un 20% del tamaño del reloj
    dibujarManecilla(ctx, second, radius*0.4, radius*0.02);
	//si el minuto y el segundo llegan a cero quiere decir que se le acabo el tiempo al jugador actual
	if(seAcaBoElTiempo)
	{
		clearInterval(interReloj);
		termino.play();
		if(BlancasActivas)
			alert("Jugador de piezas blancas se quedo sin tiempo")
		else
			alert("Jugador de piezas negras se quedo sin tiempo")
	}
}

function dibujarManecilla(ctx, pos, length, width) {
	//comenzamos una linea
    ctx.beginPath();
	//el tamaño de la linea sera el tamaño que nos indicaron
    ctx.lineWidth = width;
	// las lineas tendran una terminacion redondeada, se puede cambiar por "square" para redondas o "butt" para ovalado
    ctx.lineCap = "round";
	//nos movemos al punto 0,0 recordar que es el centro del reloj
    ctx.moveTo(0,0);
	//rotamos la direccion hacia el angulo que nos pasaron
    ctx.rotate(pos);
	//dibujamos la linea desde el centro hacia atras con la magnitud indicada
    ctx.lineTo(0, -length);
	//dibujamos
    ctx.stroke();
	//rotamos la posicion a su lugar de origen
    ctx.rotate(-pos);
}