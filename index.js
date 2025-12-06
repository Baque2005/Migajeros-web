const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const upload = multer();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Supabase
const supabaseUrl = 'https://zvbvlsxxyihaxecmdtss.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2YnZsc3h4eWloYXhlY21kdHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4OTU5NzUsImV4cCI6MjA4MDQ3MTk3NX0.wqKmDQ3B4GfRsyhjiEu9vOyqdkAJglAa30biEhV-lgg';
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
      const { data, error } = await supabase.storage.from('pruebas-infidelidad').upload(nombreArchivo, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });
      if (error) {
        console.error('Error al subir imagen a Supabase Storage:', error.message);
        continue;
      }
      // Obtener URL pública
      const url = `${supabaseUrl}/storage/v1/object/public/pruebas-infidelidad/${nombreArchivo}`;
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

// Endpoint para guardar una publicación
app.post('/api/publicaciones', async (req, res) => {
  const {
    titulo,
    nombre,
    apellido,
    edad,
    lugar,
    pais,
    ciudad,
    historia,
    impacto,
    imagenes // <-- nuevo campo
  } = req.body;

  // Forzar que impacto sea número y nunca undefined
  const impactoFinal = impacto !== undefined && impacto !== null ? Number(impacto) : 0;
  console.log('impacto recibido:', impacto, 'impactoFinal:', impactoFinal);

  const { data, error } = await supabase
    .from('publicaciones')
    .insert([{ titulo, nombre, apellido, edad, lugar, pais, ciudad, historia, impacto: impactoFinal, imagenes }]);

  if (error) {
    console.error('Error al guardar en Supabase:', error);
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json({ mensaje: 'Publicación guardada', data });
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