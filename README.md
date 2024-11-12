# Nilus-Challenge
--- 
A partir de las solicitudes firmadas luego de la final de Qatar 2022, el órgano rector del fútbol mundial está 
evaluando realizar algunos cambios en el sistema de puntuación de los partidos de la siguiente manera:

* Introducir el concepto de punto bonus: Finalizado un partido se puede otorgar uno o mas puntos a un equipo (o ambos) que hayan cumplido con ciertas
condiciones. Por ejemplo, asignar un punto bonus a los equipos que marquen 3 o mas goles
* Introducir el concepto de "evento especial" para cambiar el valor de un evento. Por ejemplo, los goles desde 25 o mas metros valen doble
* Cambiar la cantidad de puntos otorgados por partido ganado

Antes de hacerlo oficial, nos pidió crear un pequeño programa con el que pueda recalcular resultados de partidos y/o torneos pasados.

A modo de ejemplo
* ¿Cómo hubiesen sido los resultados de la fase final de 1950 si el partido ganado sumase 3 puntos en lugar de 2?
* ¿Cuál hubiese sido el ordenamiento final del Grupo C de Qatar 2022 (AR, MX, POL, KSA) si los goles desde fuera del 
area grande en el segundo tiempo valiesen doble?

## Modelo
Luego de un refinamiento inicial, identificamos las siguientes entidades

### Eventos
Eventos: Un evento representa cualquier hecho puntual dentro de un partido. Existen varios tipos de eventos de un partido. Podemos limitarnos a los siguientes

* Gol
* Amonestación, Expulsión directa
* Penal atajado

Todos los eventos tienen un atributo en común: el instante en el que ocurrió (por ejemplo, "minuto 22" o "tercer minuto de adición del primer tiempo"). 
Por otro lado, cada evento puede tener sus propias particularidades (ej. el jugador que realiza el gol, la distancia, etc)

### Reglas
Una regla indica cuántos puntos se asignan a un evento. Algunos ejemplos son

- 2 puntos por partido ganado (en lugar de 3)
- Goles de afuera del area valen doble en los últimos 15 minutos de partido
- Si un equipo marca mas de tres goles (de jugada, no de penal) recibe un punto adicional
- Si se marcan dos o mas goles en menos de 5 minutos se obtiene un gol adicional
- Si se atajan dos o mas penales durante el partido, se obtiene un gol adicional

### Eventos y reglas
Las reglas otorgan puntos según los eventos de un partido. Por lo que vimos hasta ahora los eventos (sobre los que se aplican reglas)
son de distinta naturaleza. Puede tratarse de eventos simples (un equipo marca un gol), eventos compuestos que tienen lugar
durante el desarrollo del partido (un equipo marca tres goles) o eventos "globales" (a falta de una mejor palabra), que representan
que el resultado del partido (por ejemplo, España le ganó a Uruguay)

Para que las reglas se puedan aplicar a un tipo de evento específico, vamos a diferenciarlas con un atributo

#### Tipos de reglas
Tal como se especificó arriba, una regla especifica la cantidad de puntos otorgados a un evento. Vamos a definir cuatro tipos de reglas

* `match`
Este tipo de regla se refiere al resultado del encuentro, una vez procesados todos los eventos que aportan al marcador de cada equipo.
Por ejemplo, "el equipo ganador recibe dos puntos"

* `side`
Este tipo de reglas actua sobre un conjunto o subconjunto de los eventos de un equipo.
Por ejemplo "marcó 3 goles", "atajo 2 penales", "recibió mas de 5 amonestaciones¨

* `single`
Se refiere a un evento en particular, realizado por un jugador
Por ejemplo "Atajó un penal en tiempo de descuento" o "marcó un gol desde afuera del área grande"

* `special`
Se refiere a eventos del tipo `single` que *no asignan un punto bonus* si no que modifican el valor de un evento particular (por ejemplo, un gol que vale doble). 

Como podemos ver, cada tipo tiene sus particularidades.

#### Formato

Las reglas se pueden especificar mediante un arreglo de objetos JSON, considerando que existen campos comunes y campos particulares

* Los siguientes campos son comunes a todas las reglas
`name`: Un nombre
`type`: Tipo de regla (`match`, `side`, `single`, `special`). Este campo especifica que tipo de condiciones deben cumplirse
`event`: Disparador del evento

* Cada tipo de evento tiene sus particularidades

- `match`
Las reglas del tipo `match` otorgan puntos, especificados mediante el campo `points`

- `side`, `single`
Las reglas de tipo `side` o `single` otorgan puntos bonus. Los puntos bonus deben sumarse al puntaje final.
Por ejemplo, si España le ganó a Uruguay sumará tres puntos (por partido ganado) y Uruguay ningún punto (por partido perdido)
Si ambos equipos marcaron al menos tres goles, entonces cada uno suma un punto adicional

- `particular`

Estas reglas alteran el valor de un evento, especificando el factor con el campo `value_factor` y no asignan punto bonus
Inicialmente siempre son atribuidos a eventos `score`. Ejemplos de este tipo son "gol de arquero", "gol de afuera del area", etc

Mediante el campo `condition` podemos especificar las condiciones necesarias para que la regla se pueda aplicar  (i.e otorga puntos). 
Este objeto tiene distintos campos, pudiendo especificar uno o mas 

* `distance`: Es un `string` que indica las condiciones referidas a la distancia necesaria para que un gol sea considerado especial. Por ejemplo 
  ** `"+25m"` indica "desde al menos 25 metros del arco"
  ** `"-3m"` indica "hasta tres metros del arco"

`m` es el único modificador aceptado

* `after_time`: Indica el o los momentos del partido donde aplica la regla.
Especifica una cantidad de minutos, con un campo especial para indicar si se trata de tiempo agregado. Por ejemplo

`"45 +0"` se refiere luego del minuto 45, pero aún en el primer tiempo
`"90 +0"` se refiere luego del minuto 90
`"0"` se refiere al primer minuto del primer tiempo
`"45"` se refiere el primer minuto del segundo tiempo

En caso de especificar una listao de valores, se entiende que se trata de alternativas y no de condiciones concurrentes
`["45 +0", "90 +0"]` indica "en el tiemp agregado del primer o segundo periodo"

* `at_least` indica la cantidad de veces que debe ocurrir un evento para que se otorguen puntos. Por ejemplo
`{at_least: 3}` indica que deben ocurrir al menos 3 eventos iguales

* `player` es un campo opcional que indica la posición del jugador que realizó el evento. Inicialmente solo se puede especificar el valor `goalkeeper`. En caso de no estar presente, se asume que se trata de cualquier jugador de campo.

## Reglas por default
Por default se presumen las reglas actuales
* No existe punto bonus
* El equipo ganador recibe tres puntos
* El equipo perdedor no recibe puntos
* En caso de empate cada equipo recibe 1 punto
  
## Conjunto inicial de reglas
Inicialmente, el órgano rector nos ha pedido establecer las siguientes condiciones (se pueden aplicar parcialmente o todas)
El siguiente arreglo de reglas indica las condiciones especiales que se aplicarían a un partido

* El ganador del partido obtiene dos puntos (el empate no se modifica)
* Un equipo consigue un punto bonus por cada uno de los siguientes eventos
  1. Marca un gol luego del minuto 90 (en el agregado del segundo tiempo, no en suplementario)
  2. El equipo anota 3 o mas goles
* Un gol vale doble si
  1. Lo anota el arquero

```json
[
{
	"name": "two_points_on_win",
	"type": "match",
	"event": "win",
	"points": 2	
}, 
{
	"name": "late_goals",
	"type": "single",
	"event": "score",
	"condition": {
		"after_time": "90 +0"
	},
	"bonus_points": 1
},
{
	"name": "keeper goal",
	"type": "particular",
	"event": "score",
	"condition": {
		"player": "goalkeeper"
	},
	"value_factor": "x2"
},
{
	"name": "scoring",
	"type": "side",
	"event": "score",
	"condition": {
		"at_least": 3
	},
	"bonus_points": 1
}
]
```


### Partido
Un partido entre dos equipos está descripto por la siguiente estructura

* `teams` indica los nombres de los equipos participantes (local y visitante)
* `home_events` lista los eventos correspondientes al equipo local
* `away_events` listao los eventos correspondientes al equipo visitante

```json
{
"teams": {"home": "Racing 1996", "away": "Racing 2001"},
"home_events": [
	{"event": "score", "time": "45 +1", "player" : "Claudio Lopez", "obs": "afuera del area"},
	{"event": "booking", "time": "32", "player" : "Pablo Michelini"},
	{"event": "booking", "time": "75", "player" : "Pablo Michelini"},
	{"event": "pk_save", "time": "90 +8"}
],

"away_events": [
	{"event": "score", "time": "45 +1", "player" : "Maxi Estevez", "obs": "pk"},
	{"event": "red_card", "time": "75", "player" : "Gerardo Bedoya"}
]
}
```

## Entregable

Se debe crear un programa que a partir de un conjunto de reglas retorne una tabla de posiciones para una serie de partidos.
La salida debe ser en formato JSON y debe contener (para cada equipo)
* Puntos (totales)
* Puntos bonus otorgados
* Partidos jugados
* Goles a favor (incluyendo los dobles)

Por ejemplo, ejecutando desde la consola de Linux podemos utilizar el argumento `--match` para especificar un partido (admite múltiples ocurrencias, pero al menos una entrada) y `--rules` para especificar las reglas (admite 0 o 1 ocurrencias)

```shell
# Evalua un triangular entre Uruguay, Argentina y España utilizando las reglas incluidas en rule-list.json
./fifa-review --rules rule-list.json \
--match uruguay_vs_spain.json \
--match argentina_vs_spain.json \
--match uruguay_vs_argentina.json > /dev/null


# Evalua una serie ida y vuelta entre Uruguay y Argentina utilizando las reglas actuales (2023)
./fifa-review \
--match argentina_vs_uruguay.json \
--match uruguay_vs_argentina.json > /dev/null
```

