var con = require("../lib/conexionbd");

module.exports = {
  competencias(req, res) {
    let query = "SELECT * FROM competencia";

    con.query(query, function(error, resultado) {
      if (error) {
        return resultado.status(404).send("Hubo un error en la consulta");
      }

      // console.log(resultado);
      res.send(JSON.stringify(resultado));
    });
  },

  crearCompetencia: (req, res) => {
    let nombreCompetencia = req.body.nombre;
    if (!nombreCompetencia) {
      
      return res.status(422).send("Debe completar el nombre de la competencia");
    }
    let generoCompetencia = req.body.genero;
    let directorCompetencia = req.body.director;
    let actorCompetencia = req.body.actor;
    let nombreRepetido = false;
    let sql = `INSERT INTO competencia (nombre) VALUES ('${nombreCompetencia}');`;
    let sqlCompetencia = `SELECT * FROM competencia WHERE nombre = "${nombreCompetencia}"`;

    con.query(sqlCompetencia, (error, resultado) => {
      if (error) {
        aqw;
        return res.status(500).send("Hubo un error en el servidor");
      }

      if (resultado.length === 1) {
        nombreRepetido = true;

        
        return res.status(422).send("Ya hay una competencia con este nombre");
      }

      if (!nombreRepetido) {
        con.query(sql, (error, resultado) => {
          if (error) {
            
            return res.status(500).send("Hubo un error en el servidor");
          }
          if (generoCompetencia > 0) {
            let sqlGenero = `UPDATE competencia SET genero_id = ${generoCompetencia} WHERE nombre = '${nombreCompetencia}';`;
            
            con.query(sqlGenero, (errorGenero, resultadoGenero) => {
              if (errorGenero) {
                
                return res.status(500).send("Hubo un error en el servidor");
              }
            });
          }
          if (directorCompetencia > 0) {
            let sqlDirector = `UPDATE competencia SET director_id = ${directorCompetencia} WHERE nombre = '${nombreCompetencia}';`;
            con.query(sqlDirector, (errorDirector, resultadoDirector) => {
              if (errorDirector) {
                
                return res.status(500).send("Hubo un error en el servidor");
              }
            });
          }
          if (actorCompetencia > 0) {
            let sqlActor = `UPDATE competencia SET actor_id = ${actorCompetencia} WHERE nombre = '${nombreCompetencia}';`;
            con.query(sqlActor, (errorActor, resultadoActor) => {
              if (errorActor) {
                
                return res.status(500).send("Hubo un error en el servidor");
              }
            });
          }
          if (
            generoCompetencia > 0 &&
            directorCompetencia > 0 &&
            actorCompetencia > 0
          ) {
            let minimoPeliculas = true;
            if (minimoPeliculas) {
              
              return res
                .status(422)
                .send(
                  "No hay suficientes peliculas para crear esta competencia"
                );
            }
          }
          res.sendStatus(200);
        });
      }
    });
  },

  obtenerDosPeliculas: (req, res) => {
    let idCompetencia = req.params.id;
    let query = `SELECT nombre, genero_id, director_id, actor_id FROM competencia WHERE id=${idCompetencia};`;
    let tablas = '';
    let condiciones = '';
    let nombreCompetencia, filtros, sqlRandom;

    con.query(query, (error, resultado) => {
        if (error) {
            return res.status(404).send("No se encontró la competencia");
        }
        filtros = resultado[0];
        nombreCompetencia = resultado[0].nombre;

        sqlRandom = `SELECT * FROM pelicula ORDER BY RAND() limit 2;`;

        if (filtros.genero_id != undefined) {
            tablas = `JOIN genero g ON p.genero_id = g.id`;
            condiciones = `WHERE g.id = ${filtros.genero_id}`
            if (filtros.director_id != undefined) {
                tablas += ` JOIN director d ON p.director = d.nombre`;
                condiciones += ` AND d.id = ${filtros.director_id}`;
            }
            if (filtros.actor_id != undefined) {
                tablas += ` JOIN actor_pelicula ap ON p.id = ap.pelicula_id`;
                condiciones += ` AND ap.actor_id = ${filtros.actor_id}`;
            }
        }
        if (filtros.director_id != undefined && filtros.genero_id == undefined) {
            tablas = `JOIN director d ON p.director = d.nombre`;
            condiciones = `WHERE d.id = ${filtros.director_id}`;
            if (filtros.actor_id != undefined) {
                tablas += ` JOIN actor_pelicula ap ON p.id = ap.pelicula_id`;
                condiciones += ` AND ap.actor_id = ${filtros.actor_id}`;
            }
        }
        if (filtros.actor_id != undefined && filtros.genero_id == undefined && filtros.director_id == undefined) {
            tablas = `JOIN actor_pelicula ap ON p.id = ap.pelicula_id`;
            condiciones = `WHERE ap.actor_id = ${filtros.actor_id}`;
        }
        sqlRandom = `SELECT p.* FROM pelicula p ${tablas} ${condiciones} ORDER BY RAND() limit 2;`;
        con.query(sqlRandom, (error, resultado) => {
            if (error) {
                return res.status(404).send("No se encontró la competencia");
            }
            if (resultado == undefined || resultado.length < 2) {
                return res.status(422).send("No hay resultados suficientes para realizar la competencia.");
            } else {
                let responseConFiltros = {
                    'competencia': nombreCompetencia,
                    'peliculas': resultado
                };
                res.send(JSON.stringify(responseConFiltros));
            }
        });
    });
},

  guardarVotos: (req, res) => {
    let idCompetencia = req.params.id;
    let idPelicula = req.body.idPelicula;
    let sql =
      "INSERT INTO voto (competencia_id, pelicula_id) values (" +
      idCompetencia +
      ", " +
      idPelicula +
      ")";

    con.query(sql, function(error, resultado) {
      if (error) {
        return res.status(500).send("Hubo un error en la consulta");
      }
      var response = {
        voto: resultado.insertId
      };
      res.status(200).send(response);
    });
  },

  obtenerResultados: (req, res) => {
    let idCompetencia = req.params.id;
    let query = "SELECT * FROM competencia WHERE id = " + idCompetencia;

    con.query(query, function(error, resultado) {
      if (error) {
        return res.status(500).send("Hubo un error en la consulta");
      }

      if (resultado.length === 0) {
        return res
          .status(404)
          .send("No se encontro ninguna competencia con este id");
      }

      let competencia = resultado[0];

      let query =
        "SELECT voto.pelicula_id, pelicula.poster, pelicula.titulo, COUNT(pelicula_id) As votos FROM voto INNER JOIN pelicula ON voto.pelicula_id = pelicula.id WHERE voto.competencia_id = " +
        idCompetencia +
        " GROUP BY voto.pelicula_id ORDER BY COUNT(pelicula_id) DESC LIMIT 3";

      con.query(query, function(error, resultado, fields) {
        if (error) {
          return res.status(500).send("Hubo un error en la consulta");
        }

        let response = {
          competencia: competencia.nombre,
          resultados: resultado
        };

        res.send(JSON.stringify(response));
      });
    });
  },

  cargarGeneros: (req, res) => {
    let query = "SELECT * FROM genero";
    con.query(query, function(error, resultado, fields) {
      if (error) {
        return res.status(500).send(error);
      }
      res.send(JSON.stringify(resultado));
    });
  },

  cargarDirectores: (req, res) => {
    let query = "SELECT * FROM director";
    con.query(query, function(error, resultado, fields) {
      if (error) {
        return res.status(500).send(error);
      }
      res.send(JSON.stringify(resultado));
    });
  },

  cargarActores: (req, res) => {
    let query = "SELECT * FROM actor";
    con.query(query, function(error, resultado, fields) {
      if (error) {
        return res.status(500).send(error);
      }
      res.send(JSON.stringify(resultado));
    });
  },

  eliminarCompetencia: (req, res) => {
    let idCompetencia = req.params.id;
    let sql = `DELETE FROM voto WHERE competencia_id = ${idCompetencia};`;
    let sqlCompetencia = `DELETE FROM competencia WHERE id = ${idCompetencia};`;

    con.query(sql, (error, resultado) => {
      if (error) {
        return res.status(500).send("Hubo un error en la consulta");
      }
      con.query(sqlCompetencia, (error, resultado) => {
        if (error) {
          return res.status(404).send("Hubo un error en la consulta");
        }
      });

      res.status(200).send(`La competencia se eliminó correctamente.`);
    });
  },

  eliminarVotos: (req, res) => {
    let query = `DELETE FROM voto WHERE competencia_id = ${req.params.id};`;
    let queryCompetencia = `SELECT * FROM competencia WHERE id = ${req.params.id};`;

    con.query(queryCompetencia, (error, resultado) => {
      if (resultado == 0) {
        return res.status(404).send("No existe la competencia seleccionada.");
      } else {
        con.query(query, (error, resultado) => {
          if (error) {
            return res.status(500).send("Hubo un error en el servidor");
          }
          res.status(200).send(`La competencia se reinició correctamente.`);
        });
      }
    });
  },

  infoCompetencia: (req, res) => {
    let query =
      "SELECT competencia.id, competencia.nombre, genero.nombre genero, director.nombre director, actor.nombre actor FROM competencia LEFT JOIN genero ON genero_id = genero.id LEFT JOIN director ON director_id= director.id LEFT JOIN actor ON actor_id= actor.id WHERE competencia.id = " +
      req.params.id;
    con.query(query, function(error, resultado) {
      if (error) {
        return res.status(500).send("Hubo un error en la consulta");
      }

      var response = {
        id: resultado,
        nombre: resultado[0].nombre,
        genero_nombre: resultado[0].genero,
        actor_nombre: resultado[0].actor,
        director_nombre: resultado[0].director
      };
      res.send(JSON.stringify(response));
    });
  },

  editarCompetencia: (req, res) => {
    let query =
      "UPDATE competencia SET nombre = '" +
      req.body.nombre +
      "' WHERE id = " +
      req.params.id +
      ";";

    con.query(query, function(error, resultado, fields) {
      if (error) {
        return res.status(500).send("Error al modificar la competencia");
      }
      if (resultado.length == 0) {
        return res
          .status(404)
          .send("No se encontro ninguna pelicula con ese id");
      } else {
        var response = {
          id: resultado
        };
      }
      res.send(JSON.stringify(response));
    });
  }
};
