//paquetes necesarios para el proyecto
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const controlador = require('./controladores/controlador');

const app = express();


app.use(cors());


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


app.get('/generos', controlador.cargarGeneros);
app.get('/directores', controlador.cargarDirectores);
app.get('/actores', controlador.cargarActores);

app.get('/competencias', controlador.competencias);
app.get('/competencias/:id', controlador.infoCompetencia);
app.get('/competencias/:id/peliculas', controlador.obtenerDosPeliculas);
app.get('/competencias/:id/resultados', controlador.obtenerResultados);


app.put('/competencias/:id', controlador.editarCompetencia);


app.post('/competencias', controlador.crearCompetencia);
app.post('/competencias/:id/voto', controlador.guardarVotos);

app.delete('/competencias/:id', controlador.eliminarCompetencia);
app.delete('/competencias/:id/votos', controlador.eliminarVotos);





// seteamos el puerto en el cual va a escuchar los pedidos la aplicación
var puerto = '8080';

app.listen(puerto, function() {
    console.log("Escuchando pedidos en el puerto " + puerto);
});