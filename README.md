# Prueba Swetro || Sospechosos de trampas

Pagina web donde puedes subir tu documento excel teniendo en cuanta que cuentas con los siguientes columnas: 
-Id	
-UserId	
-StartTimeInSeconds 
-DurationInSeconds	
-DistanceInMeters	
-Steps	
-AverageSpeedInMetersPerSecond	
-AveragePaceInMinutesPerKilometer	
-TotalElevationGainInMeters	
-AverageHeartRateInBeatsPerMinute

Y podras ver si hay algun sospechoso de trampas de acuerdo a estadisticas como:
-Si tiene una velocidad promedio muy alta (Mayor a 10 m/s)
-Si la distancia en metros y los pasos totales no concuerdan (La distancia de cada es mayor a 10 metros)
-La frecuencia cardiaca (Si sobrepasa mas de 200 bpm)
-Si la elevacion es muy exagerada (Mas de 30km en elevacion)

## Comenzando 🚀
_Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas._

### Instalación 🔧

_Clona este repositorio en tu maquina local_

```
En tu terminal escribe:
git clone https://github.com/CamiloProg/pruebaSwetro.git
```
_Instala las dependencias necesarias_

```
cd pruebaSwetro
npm i
npm run dev
```
## Ejecutando las pruebas ⚙️

Dale click al recuadro y sube tu excel con los datos antes mencionados, espera el anuncio de Cargando y luego dale click al boton de "Mostrar todos los usuarios sospechosos"

## Construido con 🛠️
