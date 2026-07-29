# **Plan de Implementación: App de Diagnóstico Flash VSM (DORA AI 2025\)**

**Evento:** Congreso PMI Latam 2026

**Sesión:** "Orquestación agéntica estable"

**Audiencia:** \~100 personas

## **1\. Resumen Ejecutivo y Objetivo**

El objetivo de este proyecto es desplegar una solución interactiva en tiempo real que permita a los asistentes de una conferencia presencial responder un cuestionario diagnóstico de 7 preguntas (basado en el reporte DORA AI 2025\) a través de sus teléfonos móviles.

Los datos recolectados se procesarán al instante para categorizar al equipo de cada asistente dentro de uno de los 7 arquetipos DORA y proyectar la **Silueta de Madurez Consolidada** en la pantalla del escenario mediante un gráfico de radar en tiempo real.

## **2\. Arquitectura Técnica y Stack Tecnológico**

| Capa | Tecnología | Justificación / Rol |
| :---- | :---- | :---- |
| **Frontend Framework** | **React 18** (con **Vite**) | Interfaz reactiva, rápida y ligera de renderizar. |
| **Estilos CSS** | **Tailwind CSS** | Diseño responsivo (móvil y escritorio) con tema oscuro nativo. |
| **Gráficos e Iconos** | **Recharts** \+ **Lucide React** | Renderización del gráfico Radar (7 ejes) y barras en tiempo real. |
| **Backend & Database** | **Firebase Firestore** | Base de datos Serverless NoSQL con listeners WebSocket en tiempo real. |
| **Hosting & CDN** | **Vercel** | Despliegue continuo con HTTPS automático para escaneo QR seguro. |

## **3\. Módulos y Funcionalidades de la App**

### **3.1. Vista del Asistente (Smartphone)**

* **Captura de Leads:** Registro obligatorio de Nombre Completo y Correo Electrónico.  
* **Cuestionario Express:** 7 preguntas de opción múltiple (escala de 1 a 5\) con barra de progreso.  
* **Resultado Individual Inmediato:**  
  * Cálculo del puntaje promedio personal.  
  * Identificación del arquetipo y estado del equipo.  
  * Gráfico de Radar personalizado con la silueta de capacidades del participante.

### **3.2. Vista del Speaker (Pantalla en Vivo del Escenario)**

* **Sincronización Cloud:** Actualización automática cada vez que un asistente envía su formulario (sin recargar la pantalla).  
* **Métricas Globales:** Contador de participantes en tiempo real y promedio consolidado de la sala.  
* **Gráfico Radar Consolidado:** Muestra la silueta promedio de la sala comparada contra la línea de base de Alto Rendimiento (4.5).  
* **Análisis de Arquetipo y Notas Estratégicas:** Muestra el cluster predominante y despliega alertas/mensajes clave específicos para el discurso del Speaker (Slide 9).  
* **Desglose por Capacidad:** Gráfico de barras horizontal ordenado por rendimiento por cada una de las 7 capacidades.

## **4\. Cuestionario y Reglas del Diagnóstico (DORA AI 2025\)**

### **Las 7 Capacidades Evaluadas (1 a 5 puntos cada una)**

1. **Postura Org. IA:** Claridad de políticas y seguridad en el uso de IA.  
2. **Salud de Datos:** Calidad, integración y accesibilidad de los datos internos.  
3. **Contexto IA:** Frecuencia e integración de datos corporativos en los prompts/agentes.  
4. **Lotes Pequeños:** Frecuencia y tamaño de entregas asistidas por IA.  
5. **Enfoque Usuario:** Métricas de valor y experiencia del usuario final.  
6. **Plataforma Interna:** Grado de autoservicio y abstracción de complejidad técnica.  
7. **Resiliencia:** Capacidad y rapidez de reversión (*rollbacks*) ante código inestable.

### **Lógica de Clasificación de Arquetipos**

![][image1]

| Rango Promedio | Tipo Silueta | Arquetipo DORA (Cluster) | Estado | Nota Estratégica Speaker |
| :---- | :---- | :---- | :---- | :---- |
| **1.0 — 1.8** | Contraída | Cluster 1: Foundational Challenges | Supervivencia | **Alerta:** La IA duplicará el caos. Requerida Fase de Estabilización (3-6 meses). |
| **1.9 — 2.5** | Contraída | Cluster 2: Legacy Bottleneck | Reactividad | Deuda técnica alta. Sanear datos y estandarizar control de versiones. |
| **2.6 — 3.2** | Irregular | Cluster 3: Constrained by Process | Fricción | Desbloquear burocracia rígida y aumentar autonomía de plataforma. |
| **3.3 — 3.9** | Irregular | Cluster 4 & 5: High Impact / Methodical | Transición | Promover contexto enriquecido y resiliencia en automatización. |
| **4.0 — 4.5** | Expandida | Cluster 6: Pragmatic Performers | Alto Rendimiento | Listo para orquestación agéntica avanzada y escalado de pilotos. |
| **4.6 — 5.0** | Expandida | Cluster 7: Harmonious High-Achievers | Excelencia | Madurez máxima. Benchmark de resiliencia y orquestación. |

## **5\. Protocolo de Ejecución el Día del Evento**

\[Minuto 00-05\] Proyectar Código QR en Pantalla Gigante  
       │  
       ▼  
\[Minuto 05-08\] Audiencia escanea e ingresa respuestas (\~100 personas)  
       │  
       ▼  
\[Minuto 08-10\] Transición a "Vista Speaker": El Radar se actualiza en vivo  
       │  
       ▼  
\[Minuto 10-15\] Análisis del Arquetipo predominante y recomendación estratégica

1. **Apertura:** Proyectar el código QR de acceso en la pantalla del auditorio.  
2. **Instrucción a la Sala:** Pedir a los 100 asistentes que escaneen el código y completen el cuestionario (tarda aprox. 2 minutos).  
3. **Cambio de Vista:** Alternar a la pestaña **"Vista Speaker (Pantalla Vivo)"**.  
4. **Análisis en Vivo:** Comentar la silueta resultante, destacando las brechas identificadas por la gráfica de radar y vinculando el mensaje con la **Slide 9** de la presentación.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABQCAYAAACksinaAAAMKElEQVR4Xu3deYxkVRXH8WZRwQ2IjgN0V93q6pGBwX0SUZAYNG6ogKIgElRWRVFARGWTkBjXoCigsgQU0IhARAkhESMuYEIgKMaNP3BYBwOyGJiwDM74O/Xu7Tl16nV39XTNdM3M95PcvHvPvW+p1zDv5K0jIwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbOBSSsfEGAAAAIaIErbVvrTb7Z3iGAAAAMwjJWnvd/UHfB8AAAAGoNVq7atEa/9ms3mA6geqfEjloOlKXIbRMq6PMQAAAAyAEq1ldikzxuto3O350ufkWbVCCd9RMQYAAIAByUnY4zFeR+N2UFkZYuNK2LbzsbnQ8h7J22TlGZX/5Km1z4zj50ur1XqNtmdZjM9E81ypssL9xsdVHittLXfnOA8AAEBJ2lbFeB0lFGcoQVtS2prvFt8/CIsWLVpg2xTjJamJ8blam2U2Go1XpDnct6d5/xbXOzEx8TKLLV68+EU+PozitgMAgHVMSdhf8gF489g3E813Q4zN1TQJ21118blaF8ucSU7Ynq2Jr1b5TYwPm/nYZwAAbPJ0AL7CDsJKll4c+9a3aRI2S2Y68R133PGlqp/cbDYvLv1KPI9X7FzXPlD939b0aJVtVT9d/e8q/aYsU2VvK6HvHM1zj8oXfNxeX6K+T2mZP/Jxo9gv1HeLplvFPi9VCVvX5eUct8uiR1td00/Y9uf4YaofG8Z+TuW3in/Qx2UzxS9U/Et53J22Pi1vZ8U+rfplFl+yZMlzVT9C8fO0z5+Xxx6s9hmNRmPP3D5T5bQ1ix7ZQu0/2Xammn2m5X9eseUqP/dxAAAwIPkg3JMorW8zJGzLrK7EoK36035cyg9GlLYSjy/mec7X+Le6ZXSSOk33Urkxxz5rxS1rmcpPcv1WG1P6LJmxRNHH8rj/abJZrq8eGxtb5Pu9VJOwaXt/5pepdfwgb9ujS5cufY7vs7r6D8n1J60/z7OkjNP0ja5uieCbNb22xLR9W1tCaG0lwM/P407LYz+u6R9y7MGSFNo6U7WvVuep32er3Pp2UXm69AEAgAHRAfaGfCC+LfatTyVhU3k4VQ8hdBIzlZP9OCUPR5UEoahr+5jq/w3tc+M8OX6VyomuXTdmymQxtqOU72FL1W98NNcftzOHYZwlZgfkeues1cTEREP1FWVM3l8PlfEqT5Q+a7fb7W1Ku8RiuyRsuX2ZH6P6a/36cqzntyn2QHKXeW3M+Pj42/0YAAAwADrInlN3MF6fpjrDFuWzPT3JR2yr3OHallTMmLCZ/BCAPdVpy+gZE5bTGROLH++lmocO6tSNSWsS2J515bqd6Stjey5zx2VaOyRsF9ll0tJW0rW4bh7f9tR3ncqTNkbLOT72AwCAOdJBdoU/eM+HfhM2JQMHxXF1bZW/uva9fkyaIkFVMvgZxVeWJzbrxoTl2Hr+7Punk+aWsFkidFaMG8W3z/Nsli9r1s4f2yFhu0DlnNJuNBoTdfP4tnGXibe0dt7OroRNsUd9GwAAzFJyZ2b6pYP0kToobxvjdTT2ajuIq3wj9nmzSNj28+NU3z3Ol9fnE7b7/BhLfEp7fHz81UpO9smXHHuW46c1dXufWtc8WvbvfdtLc0jYtB/flsLfSu278vR+H68Tl2lt/yoRLf+HySVsdi9e3Tw21dhjyxk8i6nd9mNUTlDsnhIDAABzoOTi0BhbF3Tw/l2aIWFL1Q3rdtP+1rHPsycbfSKRwv1pOWZJw72u3XlJbWnrd+/mko+fjrizQ2WMO3Nk8a57tEp9pHp60i4/dp621LaPpmk+2ZX6fEVJHrNFXVzb/jXXPiVPf2x9KjepXNeqLm12HoRwY/3vPy6PP9z1X6P45a5dmwjn6WSCmLfpJKuXv43K2dp/N1vMkuEyFgCwEbDLM60+z9qshS10ADldy/+61S1QnrAr7HUHGrOrj81gcx2YdonB2fBnJtY3bfs/7T6lGK+jsbeP5P2WqtdF9PXC3aKfhG229LfcV8tdanUte387QxbHzMSWURN7p8o7XKiTzBUxiTGtynpJfo1+9yELFy58QWnnJMme3LQkzZLI8Rzrereb5tujmV+AbIlUqc+CvTqk5zNlrerVIW8q7fLftcbepnJmM7+mBAA2ean6lI/9A23l2VQ9hda5AVj/WF4dxw+blD9D5J8us+1W7Ck/bm2k6t4c2y/n2+UvTa/Kl78mkw4dcE7KY3oOxnXSms8K3Rj7+tQ5M9Pv+tYF7d8jY2wKdpDubGdOcGzbnymdip1Vih2YU/UOr2+OuEQnJ2wW2yDpt+1W6vP5N5tK3Ta1au71mw/DsA0AMHTq/nFMNZeMhpG28RafsOmA88u0FvdXefa7Ve6riR8W94nWd16MTadV3Uu1tgmbbYN9o7Pv9Q3K2NjYK9MMN8rnMV/O+8/KXqUvVZcuH/PjZ5ITtqH5Juhs2T6ws0aanqi/+3Gxf75pu+5Qubu0tY0t2+Z2u9304+aDNuVX9uRtjAPAJq0uAWhWNxP3xIeNtvPmQb6/Sb/5ddP97tiXpnhycCra3vemOSRs+a39fa9vUGydsy1h/vtTdX/TYdbWAfk7dWUknGHb0C+L6fde2wxfPxgm+SW7l6pcr+38SuyfL83qpb6TD4AAAEZ6kxCTLy32xIfNOkjYnprud6vvX75tScZ04yNt73s0/qYY75fm32426xsWeZv7/v6ofudSzXO37avpvgKAjZP+n359jAHAJq8uAbCYJS9Wz0+xPZFj30r53jc/1tXvXrBgwQut3qo+92MJkH3up/O4vurX5+WstBugFf+Anz+PecQSk1y/opk/q5Pbf1f5pNUV/74tpyRszept9l3vzsrfQPTbZ/fonV3aUd62zmeG+hETNm3DHmF9do/dq1y/JWy2TzrfaGxV9ww9XPrV/mjK93pperDNPzo6Oubm3yATNgAAMEc5SbEHDqysyO0L/ZhmdSmvkygoqXhDc82Hppep7ODH+oRC9SNigmFtS6R829V7LjGWtqan1vQ94M+wqZ7C8laq/KO0Zcu4DM/6VL4b41OJCZvVFTvQ9R8d+t+dwv1xeZ2d/Z2qT/s8GPomXw8xU8JmyWGqLnHFckmzusx9ka1L5YI4LwAAGGKWACix2D7GvVQlGj2JwlQxlb2triThI8l97qf0T9XO8/YU37dmzk5suU/YRkdHXxKXFy+ZWqycBYzyOp4MsVP8tvjl1yVspV4XS9V+nLzRu/SH+ezVH3Ym057c7eqbKWEDAAAbKUsA1iZhS1M8sZiTjFNz3S7rdd08HOfx7ZigeLkvvrV9ecu9/yomNHmerndAWazp3v/kNasnE2vXX9c3oIRtVRlTzhDapdXc10naytj4+wAAwCbCEgC7Ty3GvXzvVU+ikGNdb1f345TQfCzNLmGzt6539WvdX819D8U+tZenfDbP1J1hU7mmtEvMt6M8z+RlSRe/Nc7brO6j61pfM7+YNfd37bdUn7DZ+jqXSePyc5+Vu6ythG5hHAMAADZySqi2sgSg5V7yWUdjDq9LFJTovTy5m+ZV/57KMa59QnKf+7EvE8Tl5PZk0pe3p+XaJXmafBmraTQae1pbSdHFJaaEZnEYs49vq/7HFC55RvaEms2j8j4fz7GubddmXh6W/+vkXq6b57nStS1hW9Vut7fJIbv8GRPM3a2ef4vdg2exp3N/51NMZTwAAEDf8ktTO4nGINilPyVDhzZrPsOk2K7lW4Na54dt3f6TO3UsCdPy9ovx6eSzWZeoXJZC8jaTZvXR7ckXx9bRmEPsvWoxnhPGg0vbklzfj+GXqtsF3hLjAAAAGBKt6pU2dma0p8SxAAAAmAdKzB5qVR+E39le/GtnihVb1m63d4pjAQAAMA/imbT88MmlPgYAAIAhkvJDIwAAABhCStauiDEAAAAMkXh5FAAAAENEydp9JGwAAABDjFd5AAAADLmcsP07xgEAADAkcsJ2Z4wDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICB+z9xoi4LS6vzOQAAAABJRU5ErkJggg==>