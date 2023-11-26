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
      detectarTramposos(jsonData);
    }
  };

  // Función para detectar tramposos
  function detectarTramposos(datos) {
    const umbralVelocidad = 10; // m/s
    const umbralElevacion = 30000; // metros
    const umbralFrecuenciaCardiaca = 200; // bpm

    const encabezados = datos[0];

    const indexUserId = encabezados.indexOf("UserId");
    const indexDuration = encabezados.indexOf("DurationInSeconds");
    const indexDistance = encabezados.indexOf("DistanceInMeters");
    const indexSpeed = encabezados.indexOf("AverageSpeedInMetersPerSecond");
    const indexPace = encabezados.indexOf("AveragePaceInMinutesPerKilometer");
    const indexElevation = encabezados.indexOf("TotalElevationGainInMeters");
    const indexSteps = encabezados.indexOf("Steps");
    const indexHeartRate = encabezados.indexOf(
      "AverageHeartRateInBeatsPerMinute"
    );

    const datosUsuarios = _.groupBy(datos.slice(1), (row) => row[indexUserId]);

    // Almacena información sobre los sospechosos
    const sospechosos = [];

    // Verifica cada usuario
    for (const userId in datosUsuarios) {
      const datosUsuario = datosUsuarios[userId];

      for (const carrera of datosUsuario) {
        // Almacena estadísticas del sospechoso
        const estadisticasSospechoso = [];

        const distancia = parseFloat(carrera[indexDistance]);
        const pasos = parseFloat(carrera[indexSteps]);

        const metrosPorPaso = 3;
        if (
          distancia > metrosPorPaso * pasos ||
          carrera[indexSpeed] > umbralVelocidad
        ) {
          estadisticasSospechoso.push(
            carrera[indexDistance] + " m",
            carrera[indexDuration] + " s",
            carrera[indexElevation] + " m",
            carrera[indexHeartRate] + " bpm",
            carrera[indexPace] + " km/m",
            carrera[indexSpeed] + " m/s",
            carrera[indexSteps] + " steps"
          );

          if (
            distancia > metrosPorPaso * pasos &&
            carrera[indexSpeed] > umbralVelocidad
          ) {
            estadisticasSospechoso.push(
              `Velocidad alta y Relación anormal entre pasos y distancia`
            );
          } else if (distancia > metrosPorPaso * pasos) {
            estadisticasSospechoso.push(
              `Relación anormal entre la distancia y los pasos`
            );
          } else if (carrera[indexSpeed] > umbralVelocidad) {
            estadisticasSospechoso.push(`Velocidad demasiado alta`);
          }
        }

        if (carrera[indexElevation] > umbralElevacion) {
          estadisticasSospechoso.push(
            carrera[indexDistance] + " m",
            carrera[indexDuration] + " s",
            carrera[indexElevation] + " m",
            carrera[indexHeartRate] + " bpm",
            carrera[indexPace] + " km/m",
            carrera[indexSpeed] + " m/s",
            carrera[indexSteps] + " steps",
            `Elevación ganada anormalmente alta: ${carrera[indexElevation]} metros`
          );
        }

        if (carrera[indexHeartRate] > umbralFrecuenciaCardiaca) {
          estadisticasSospechoso.push(
            carrera[indexDistance] + " m",
            carrera[indexDuration] + " s",
            carrera[indexElevation] + " m",
            carrera[indexHeartRate] + " bpm",
            carrera[indexPace] + " km/m",
            carrera[indexSpeed] + " m/s",
            carrera[indexSteps] + " steps",
            `Frecuencia cardíaca anormalmente alta: ${carrera[indexHeartRate]} bpm`
          );
        }

        // Almacena información del sospechoso en el arreglo
        if (estadisticasSospechoso.length > 0) {
          sospechosos.push({
            userId,
            carreraId: carrera[0],
            estadisticas: estadisticasSospechoso,
          });
        }
      }
    }

    // Actualiza el estado con la información de los sospechosos
    setSuspectUsers(sospechosos);
  }

  return (
    <div className='container'>
      {suspectUsers.length > 0 && (
        <div>
          <h2>Usuarios Sospechosos y Estadísticas</h2>

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
              {suspectUsers.map((sospechoso, index) => (
                <tr key={index}>
                  <td>{sospechoso.userId}</td>
                  <td>{sospechoso.carreraId}</td>
                  {sospechoso.estadisticas.map((estadistica, i) => (
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
                            sospechoso.estadisticas[7].includes(
                              "Velocidad alta y Relación anormal entre pasos y distancia"
                            )
                          ? "suspect-speed"
                          : i === 6 &&
                            sospechoso.estadisticas[7].includes(
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
