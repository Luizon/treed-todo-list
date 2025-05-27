# Proyecto: Simple TODO List

Este proyecto es una aplicación web sencilla para gestionar listas de tareas (checklists) directamente desde el navegador. Permite crear múltiples listas de tareas, donde cada tarea puede tener subtareas anidadas de manera infinita. Es ideal para organizar actividades, pendientes o cualquier tipo de trabajo que requiera seguimiento.

## Características principales

- **Agregar y quitar tareas:** Puedes añadir nuevas tareas o eliminarlas fácilmente.
- **Subtareas ilimitadas:** Cada tarea puede contener subtareas, y estas a su vez pueden tener sus propias subtareas, sin límite de profundidad.
- **Interfaz simple:** Todo se maneja desde una sola página HTML, sin necesidad de recargar ni navegar a otras páginas.
- **Sin backend:** La aplicación funciona completamente en el frontend. No realiza peticiones HTTP, no utiliza sockets ni requiere conexión a servidores externos.
- **Exportación de listas:** Puedes exportar tus listas en texto plano, que se insertan en el área de texto para que puedas copiarlas y pegarlas donde prefieras (por ejemplo, en un bloc de notas).

## Tecnologías utilizadas

- HTML
- CSS
- JavaScript (todo el código corre en el navegador)

## Uso

- Escribe o pega tu lista de tareas en el área de texto.
- Haz clic en "Generar Lista" para crear la checklist desde el texto.
- Puedes agregar nuevas tareas o subtareas, y eliminar las que ya no necesites.
- También puedes usar el botón "Agregar Tarea" para crear un nodo padre (tarea principal) que solo puede tener subtareas, sin necesidad de usar el botón "Generar Lista".
- Usa el botón "Exportar Lista" para generar la lista en texto plano y copiarla desde el área de texto.

## Ejemplo de Formato de Lista

La aplicación usa un formato de texto simple para representar tareas y subtareas. Este es el mismo formato que puedes usar tanto para ingresar como para exportar listas. Las tareas marcadas como completadas usan `[x]`, y las tareas pendientes usan `[ ]`. La indentación con espacios determina la jerarquía (tareas y subtareas).

```text
[x] Proyecto Genérico
    [x] Investigación
        [x] Buscar referencias relevantes
        [ ] Leer documentación técnica
    [ ] Desarrollo
        [ ] Crear estructura base
            [ ] Escribir HTML inicial
            [ ] Configurar archivos CSS y JS
        [ ] Implementar funcionalidades clave
    [ ] Pruebas
        [ ] Casos de prueba básicos
        [ ] Revisiones con usuarios
```

---

Este proyecto es un ejemplo clásico de un TODO list, pensado para ser simple, rápido y sin dependencias externas.