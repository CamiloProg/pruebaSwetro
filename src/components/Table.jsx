import React, { useState } from "react";
import { read, utils } from "xlsx";
import _ from "lodash";
import "./Table.css";
const Table = () => {
  const [loading, setLoading] = useState(false);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [jsonData, setJsonData] = useState(null);
  const [suspectUsers, setSuspectUsers] = useState([]);

  const handleFile = (e) => {
    setLoading(true);
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const data = e.target.result;
        const workbook = read(data, { type: "binary" });
        const parsedData = utils.sheet_to_json(
          workbook.Sheets[workbook.SheetNames[0]],
          { header: 1 }
        );
        setJsonData(parsedData);
        setLoading(false);
        setFileLoaded(true);
      };

      reader.readAsBinaryString(file);
    } else {
      console.error("Selecciona un archivo Excel válido.");
    }
  };

  const displayData = () => {
    if (jsonData) {
      console.log(jsonData);
      whoIsCheater(jsonData);
    }
  };

  // Función para detectar tramposos
  function whoIsCheater(datos) {
    const maxSpeed = 10; // m/s
    const maxElevation = 30000; // metros
    const maxHeartRate = 200; // bpm

    const data = datos[0];

    const indexUserId = data.indexOf("UserId");
    const indexDuration = data.indexOf("DurationInSeconds");
    const indexDistance = data.indexOf("DistanceInMeters");
    const indexSpeed = data.indexOf("AverageSpeedInMetersPerSecond");
    const indexPace = data.indexOf("AveragePaceInMinutesPerKilometer");
    const indexElevation = data.indexOf("TotalElevationGainInMeters");
    const indexSteps = data.indexOf("Steps");
    const indexHeartRate = data.indexOf("AverageHeartRateInBeatsPerMinute");

    const userDatas = _.groupBy(datos.slice(1), (row) => row[indexUserId]);

    // Almacena información sobre los sospechosos
    const Suspects = [];

    // Verifica cada usuario
    for (const userId in userDatas) {
      const userData = userDatas[userId];

      for (const raceID of userData) {
        // Almacena estadísticas del sospechoso
        const suspectStatistics = [];

        const distance = parseFloat(raceID[indexDistance]);
        const steps = parseFloat(raceID[indexSteps]);

        const metersPerStep = 10;
        if (distance > metersPerStep * steps || raceID[indexSpeed] > maxSpeed) {
          suspectStatistics.push(
            raceID[indexDistance] + " m",
            raceID[indexDuration] + " s",
            raceID[indexElevation] + " m",
            raceID[indexHeartRate] + " bpm",
            raceID[indexPace] + " m/km",
            raceID[indexSpeed] + " m/s",
            raceID[indexSteps] + " steps"
          );

          if (
            distance > metersPerStep * steps &&
            raceID[indexSpeed] > maxSpeed
          ) {
            suspectStatistics.push(
              `Velocidad alta y Relación anormal entre pasos y distancia`
            );
          } else if (distance > metersPerStep * steps) {
            suspectStatistics.push(
              `Relación anormal entre la distancia y los pasos`
            );
          } else if (raceID[indexSpeed] > maxSpeed) {
            suspectStatistics.push(`Velocidad demasiado alta`);
          }
        }

        if (raceID[indexHeartRate] > maxHeartRate) {
          suspectStatistics.push(
            raceID[indexDistance] + " m",
            raceID[indexDuration] + " s",
            raceID[indexElevation] + " m",
            raceID[indexHeartRate] + " bpm",
            raceID[indexPace] + " m/km",
            raceID[indexSpeed] + " m/s",
            raceID[indexSteps] + " steps",
            `Frecuencia cardíaca anormalmente alta o baja: ${raceID[indexHeartRate]} bpm`
          );
        }

        if (raceID[indexElevation] > maxElevation) {
          suspectStatistics.push(
            raceID[indexDistance] + " m",
            raceID[indexDuration] + " s",
            raceID[indexElevation] + " m",
            raceID[indexHeartRate] + " bpm",
            raceID[indexPace] + " m/km",
            raceID[indexSpeed] + " m/s",
            raceID[indexSteps] + " steps",
            `Elevación ganada anormalmente alta: ${raceID[indexElevation]} metros`
          );
        }

        // Almacena información del sospechoso en el arreglo
        if (suspectStatistics.length > 0) {
          Suspects.push({
            userId,
            raceID: raceID[0],
            statistics: suspectStatistics,
          });
        }
      }
    }

    // Actualiza el estado con la información de los sospechosos
    setSuspectUsers(Suspects);
  }

  return (
    <div className='container'>
      {suspectUsers.length > 0 && (
        <div>
          <h2>Usuarios Suspects y Estadísticas</h2>

          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Carrera</th>
                <th>Distancia</th>
                <th>Duración</th>
                <th>Elevación</th>
                <th>Frec. Cardíaca</th>
                <th>Pace</th>
                <th>Velocidad</th>
                <th>Pasos</th>
                <th>Razon de sospecha</th>
              </tr>
            </thead>
            <tbody>
              {suspectUsers.map((Suspects, index) => (
                <tr key={index}>
                  <td>{Suspects.userId}</td>
                  <td>{Suspects.raceID}</td>
                  {Suspects.statistics.map((estadistica, i) => (
                    <td
                      key={i}
                      className={
                        i === 5 && parseFloat(estadistica) > 10
                          ? "suspect-speed"
                          : i === 3 && parseFloat(estadistica) > 200
                          ? "suspect-speed"
                          : i === 2 && parseFloat(estadistica) > 30000
                          ? "suspect-speed"
                          : i === 6 &&
                            Suspects.statistics[7].includes(
                              "Velocidad alta y Relación anormal entre pasos y distancia"
                            )
                          ? "suspect-speed"
                          : i === 6 &&
                            Suspects.statistics[7].includes(
                              "Relación anormal entre la distancia y los pasos"
                            )
                          ? "suspect-speed"
                          : ""
                      }
                    >
                      {estadistica}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className='file-upload'>
        <h3>Click para subir tu excel con los datos</h3>

        <input type='file' onChange={handleFile} />
      </div>
      {loading && <p>Cargando...</p>}
      {fileLoaded && (
        <button onClick={displayData}>
          Mostrar Todos los usuarios sospechosos
        </button>
      )}
    </div>
  );
};
export default Table;
