import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { puede, useAuth } from '../auth';
import { boton, claseInput, formatoFecha } from '../estilos';
import { Aviso, Campo } from '../ui';

const MAX_IMAGEN_MB = 5;
const ESTADOS = [
  ['borrador', 'Borrador (no visible)'],
  ['publicada', 'Publicada'],
  ['archivada', 'Archivada (no visible)'],
];
const VACIO = {
  titulo: '', subtitulo: '', categoria_id: '', contenido: '', autor: 'Prensa Alcaldía',
  etiquetas: '', destacada: false, estado: 'borrador',
};

function desdeNoticia(n) {
  return {
    titulo: n.titulo, subtitulo: n.subtitulo ?? '', categoria_id: String(n.categoria.id),
    contenido: n.contenido, autor: n.autor, etiquetas: n.etiquetas.join(', '),
    destacada: n.destacada, estado: n.estado,
  };
}

export default function NoticiaForm() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const puedePublicar = puede(usuario, 'noticias.publicar');

  const [categorias, setCategorias] = useState([]);
  const [sugeridas, setSugeridas] = useState([]);
  const [noticia, setNoticia] = useState(null);
  const [valores, setValores] = useState(VACIO);
  const [archivo, setArchivo] = useState(null);
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api('/admin/categorias').then((d) => setCategorias(d.data)).catch(() => {});
    api('/admin/etiquetas?limite=15').then((d) => setSugeridas(d.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editando) return;
    api(`/admin/noticias/${id}`)
      .then((d) => { setNoticia(d.data); setValores(desdeNoticia(d.data)); })
      .catch((err) => setAviso({ tipo: 'error', texto: err.message }));
  }, [id, editando]);

  const vistaPrevia = useMemo(() => (archivo ? URL.createObjectURL(archivo) : null), [archivo]);
  useEffect(() => () => { if (vistaPrevia) URL.revokeObjectURL(vistaPrevia); }, [vistaPrevia]);

  const cambiar = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValores((v) => ({ ...v, [campo]: valor }));
  };

  const elegirImagen = (e) => {
    const elegido = e.target.files[0] ?? null;
    if (elegido && elegido.size > MAX_IMAGEN_MB * 1024 * 1024) {
      setErrores((er) => ({ ...er, imagen: `La imagen supera el máximo de ${MAX_IMAGEN_MB} MB.` }));
      e.target.value = '';
      return;
    }
    setErrores((er) => ({ ...er, imagen: undefined }));
    setArchivo(elegido);
  };

  const agregarEtiqueta = (nombre) => {
    setValores((v) => {
      const actuales = v.etiquetas.split(',').map((t) => t.trim()).filter(Boolean);
      if (actuales.some((t) => t.toLowerCase() === nombre.toLowerCase())) return v;
      return { ...v, etiquetas: [...actuales, nombre].join(', ') };
    });
  };

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErrores({});
    setAviso(null);

    const form = new FormData();
    Object.entries(valores).forEach(([campo, valor]) => {
      if (campo === 'destacada') { if (valor) form.append('destacada', '1'); }
      else form.append(campo, valor);
    });
    if (archivo) form.append('imagen', archivo);

    try {
      await api(editando ? `/admin/noticias/${id}` : '/admin/noticias', { method: editando ? 'PUT' : 'POST', form });
      navigate('/admin/noticias', { state: { mensaje: editando ? 'Noticia actualizada.' : 'Noticia creada.' } });
    } catch (err) {
      setErrores(err.errores);
      setAviso({ tipo: 'error', texto: err.message });
      setEnviando(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (editando && !noticia) {
    return aviso ? <Aviso aviso={aviso} /> : <p className="text-gray-500">Cargando…</p>;
  }

  const imagenActual = vistaPrevia || noticia?.imagen_url;

  return (
    <div>
      <Link to="/admin/noticias" className="text-sm text-red-700 hover:underline">← Volver a noticias</Link>
      <h1 className="text-2xl font-bold text-gray-800 mt-1">{editando ? 'Editar noticia' : 'Nueva noticia'}</h1>
      {noticia && (
        <p className="text-sm text-gray-500 mb-4">
          Creada {formatoFecha(noticia.creado_en)} · Última edición {formatoFecha(noticia.actualizado_en)}
        </p>
      )}
      <div className="mt-4"><Aviso aviso={aviso} /></div>

      <form onSubmit={enviar} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
        <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
          <Campo etiqueta="Título *" error={errores.titulo}>
            <input type="text" required minLength={5} maxLength={200} value={valores.titulo}
              onChange={cambiar('titulo')} className={claseInput} />
          </Campo>
          <Campo etiqueta="Subtítulo o resumen" error={errores.subtitulo}>
            <textarea rows={2} maxLength={300} value={valores.subtitulo} onChange={cambiar('subtitulo')} className={claseInput} />
          </Campo>
          <Campo etiqueta="Contenido *" error={errores.contenido} ayuda="Deja una línea en blanco para separar párrafos.">
            <textarea rows={16} required minLength={20} value={valores.contenido} onChange={cambiar('contenido')} className={claseInput} />
          </Campo>
        </section>

        <aside className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
            <Campo etiqueta="Estado" error={errores.estado}>
              <select value={valores.estado} onChange={cambiar('estado')} disabled={!puedePublicar} className={claseInput}>
                {ESTADOS.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
              </select>
              {!puedePublicar && (
                <p className="text-xs text-gray-500 mt-1">Un editor revisará y publicará la noticia.</p>
              )}
            </Campo>
            <label className="flex gap-2 items-start cursor-pointer">
              <input type="checkbox" checked={valores.destacada} onChange={cambiar('destacada')} className="mt-1 accent-red-700" />
              <span className="text-sm">
                <span className="font-semibold text-gray-800">Destacada</span>
                <span className="block text-gray-500">Aparece en el ticker de titulares.</span>
              </span>
            </label>
            <div className="grid gap-2">
              <button type="submit" disabled={enviando} className={boton.primario}>
                {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear noticia'}
              </button>
              <Link to="/admin/noticias" className={boton.secundario}>Cancelar</Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4">
            <Campo etiqueta="Categoría *" error={errores.categoria_id}>
              <select required value={valores.categoria_id} onChange={cambiar('categoria_id')} className={claseInput}>
                <option value="">Selecciona…</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Autor" error={errores.autor}>
              <input type="text" maxLength={120} value={valores.autor} onChange={cambiar('autor')}
                placeholder="Prensa Alcaldía" className={claseInput} />
            </Campo>
            <Campo etiqueta="Etiquetas" error={errores.etiquetas} ayuda="Sepáralas con comas. Máximo 10.">
              <input type="text" value={valores.etiquetas} onChange={cambiar('etiquetas')}
                placeholder="Cultura, Eventos" className={claseInput} />
            </Campo>
            {sugeridas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 -mt-2">
                {sugeridas.map((e) => (
                  <button key={e.id} type="button" onClick={() => agregarEtiqueta(e.nombre)}
                    className="text-xs border border-gray-200 bg-gray-50 text-gray-600 hover:border-red-700 hover:text-red-700 px-2 py-0.5 rounded cursor-pointer">
                    + {e.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <Campo
              etiqueta={editando ? 'Imagen' : 'Imagen *'}
              error={errores.imagen}
              ayuda={`JPG, PNG o WEBP · máx. ${MAX_IMAGEN_MB} MB.${editando ? ' Déjalo vacío para conservar la actual.' : ''}`}
            >
              {imagenActual && (
                <img src={imagenActual} alt="" className="w-full aspect-[16/10] object-cover rounded-md border border-gray-200 mb-2" />
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" required={!editando} onChange={elegirImagen}
                className="block w-full text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-gray-100 file:font-semibold file:text-gray-700 hover:file:bg-gray-200" />
            </Campo>
          </div>
        </aside>
      </form>
    </div>
  );
}
