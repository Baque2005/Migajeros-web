// Endpoint para guardar un comentario
app.post('/api/comentarios', async (req, res) => {
  const { historiaId, texto } = req.body;
  if (!historiaId || !texto || texto.trim().length < 2) {
    return res.status(400).json({ error: 'Datos insuficientes' });
  }
  const { data, error } = await supabase
    .from('comentarios')
    .insert([{ historiaId, texto, fecha: new Date().toISOString() }]);
  if (error) {
    console.error('Error al guardar comentario:', error);
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json({ mensaje: 'Comentario guardado', data });
});

// Endpoint para obtener comentarios de una historia
app.get('/api/comentarios/:historiaId', async (req, res) => {
  const { historiaId } = req.params;
  const { data, error } = await supabase
    .from('comentarios')
    .select('*')
    .eq('historiaId', historiaId)
    .order('fecha', { ascending: false });
  if (error) {
    console.error('Error al obtener comentarios:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const upload = multer();
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

// Redirigir cualquier ruta que no sea API al index.html del frontend
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Configuración de Supabase usando variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET;
const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint para subir imágenes a Supabase Storage
app.post('/api/upload-imagenes', upload.array('imagenes'), async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    console.log('No se recibieron archivos para subir');
    return res.json({ urls: [] });
  }
  const urls = [];
  for (const file of files) {
    const nombreArchivo = `${Date.now()}_${file.originalname}`;
    try {
      const { data, error } = await supabase.storage.from(supabaseBucket).upload(nombreArchivo, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });
      if (error) {
        console.error('Error al subir imagen a Supabase Storage:', error.message);
        continue;
      }
      // Obtener URL pública
      const url = `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${nombreArchivo}`;
      urls.push(url);
      console.log('Imagen subida correctamente:', url);
    } catch (err) {
      console.error('Excepción al subir imagen:', err);
    }
  }
  if (urls.length === 0) {
    return res.status(500).json({ error: 'No se pudo subir ninguna imagen', urls });
  }
  res.json({ urls });
});

// Endpoint para eliminar una publicación por id
app.delete('/api/publicaciones/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('publicaciones')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error al eliminar publicación:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json({ mensaje: 'Publicación eliminada', data });
});

// Endpoint para guardar un comentario
app.post('/api/comentarios', async (req, res) => {
  const { historiaId, texto } = req.body;
  if (!historiaId || !texto || texto.trim().length < 2) {
    return res.status(400).json({ error: 'Datos insuficientes' });
  }
  const { data, error } = await supabase
    .from('comentarios')
    .insert([{ historiaId, texto, fecha: new Date().toISOString() }]);
  if (error) {
    console.error('Error al guardar comentario:', error);
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json({ mensaje: 'Comentario guardado', data });
});

// Endpoint para obtener comentarios de una historia
app.get('/api/comentarios/:historiaId', async (req, res) => {
  const { historiaId } = req.params;
  const { data, error } = await supabase
    .from('comentarios')
    .select('*')
    .eq('historiaId', historiaId)
    .order('fecha', { ascending: false });
  if (error) {
    console.error('Error al obtener comentarios:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// Endpoint para obtener todas las publicaciones
app.get('/api/publicaciones', async (req, res) => {
  const { data, error } = await supabase
    .from('publicaciones')
    .select('*')
    .order('id', { ascending: false });
  //console.log('Respuesta de Supabase:', data, error);
  if (error) {
    console.error('Error al obtener publicaciones:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});