# Generador de Pruebas

## Objetivo del Proyecto

Aplicación web diseñada para centralizar y agilizar la documentación y gestión de evidencias de pruebas de software. Permite a los equipos de QA y desarrollo organizar pruebas por proyectos, configurar datos específicos por entorno (DEV, QA, UAT), y generar reportes estandarizados en PDF automáticamente.

## Instalación

Este es un proyecto [Next.js](https://nextjs.org).

1. **Prerrequisitos**: Node.js instalado.
2. **Instalar dependencias**:
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```
3. **Ejecutar servidor de desarrollo**:
   ```bash
   npm run dev
   ```
4. **Acceder**: Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Cómo usar

### Crear una prueba

El flujo de trabajo recomendado es el siguiente:

1. **Configuración del Proyecto**:

   - Entra en un proyecto.
   - Ve a la pestaña **"Entornos"** y define los entornos de ejecución (ej: `Local`, `Dev`, `Preproducción`).
   - Ve a la pestaña **"Configuración de datos"**. Aquí defines las variables constantes para cada entorno (ej: `ID_Usuario_Test`, `URL_Base`).

2. **Crear la Prueba**:

   - En la pestaña **"Lista de pruebas"**, pulsa en **"+ Nueva prueba"**.
   - **Nombre**: Título descriptivo de la prueba.
   - **Entorno**: Al seleccionarlo, se cargarán automáticamente los datos configurados en el paso anterior.
   - **Datos**: Selecciona mediante checks qué datos del entorno quieres incluir en el reporte de esta prueba. También puedes añadir **Campos personalizados** "al vuelo" para datos únicos de esa ejecución.
   - **Detalles**: Rellena fecha, capa (Front/Back), usuario funcional y tipo de tarea.
   - **Descripción y Evidencias**: Usa el editor de texto para describir los pasos. Puedes pegar imágenes directamente desde el portapapeles como evidencia.

3. **Generar Reporte**:
   - Guarda la prueba.
   - En la lista de pruebas, puedes entrar a editarla o usar el botón **"Descargar en bloque"** en el detalle del proyecto para bajar un ZIP con los PDFs de todas las pruebas.

### Importar / Exportar Datos

La aplicación guarda los datos en el navegador (IndexedDB). Para compartir datos entre compañeros o hacer copias de seguridad:

- **Exportar**:

  - Haz clic en **"Exportar DB"** en la cabecera.
  - Se descargará un archivo `.json` con todos los proyectos, pruebas y tu logo personalizado.

- **Importar**:
  - Haz clic en **"Importar DB"** y selecciona un archivo `.json`.
  - Si hay datos existentes, aparecerá un modal de conflicto con dos opciones:
    1. **Sobreescribir**: Borra tu base de datos local y la reemplaza totalmente con el archivo importado.
    2. **Fusionar (Merge)**: Añade los proyectos del archivo a tu lista. Si hay configuraciones globales (como el logo), prioriza mantener tu configuración local actual.

## Siguientes Pasos

- [ ] fix: al generar PDF se genera overflow-x en el código (por ejemplo con un CURL).
- [ ] fix: cambiar nombre documento generado por "tarea-nombreprueba-fecha" en vez de "nombreprueba-tarea".
