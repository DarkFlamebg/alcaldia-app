import { useEffect, useState } from 'react';
import { obtener } from './api';

/**
 * Carga datos de la API pública y los vuelve a pedir cuando el usuario regresa
 * a la pestaña. Así, si el administrador publica o despublica algo, el portal
 * se actualiza sin tener que recargar a mano.
 *
 * Devuelve { datos, error, cargando }. Mientras se refresca, se siguen
 * mostrando los datos anteriores de la misma ruta.
 */
export function useDatos(ruta) {
  const [version, setVersion] = useState(0);
  const [estado, setEstado] = useState({ clave: null, ruta: null, datos: null, error: null });

  useEffect(() => {
    const alVolver = () => {
      if (document.visibilityState === 'visible') setVersion((v) => v + 1);
    };
    document.addEventListener('visibilitychange', alVolver);
    return () => document.removeEventListener('visibilitychange', alVolver);
  }, []);

  useEffect(() => {
    let vigente = true;
    const clave = `${ruta}#${version}`;
    obtener(ruta)
      .then((datos) => vigente && setEstado({ clave, ruta, datos, error: null }))
      .catch((error) => vigente && setEstado({ clave, ruta, datos: null, error }));
    return () => { vigente = false; };
  }, [ruta, version]);

  const mismaRuta = estado.ruta === ruta;
  return {
    datos: mismaRuta ? estado.datos : null,
    error: mismaRuta ? estado.error : null,
    cargando: estado.clave !== `${ruta}#${version}`,
  };
}
