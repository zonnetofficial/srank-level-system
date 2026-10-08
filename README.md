# S-RANK LEVEL SYSTEM

**Nombre provisional:** Daily Quest System

---

# 🧠 1. CONCEPTO GENERAL

App RPG de desarrollo personal donde el usuario:

* completa misiones diarias (Daily Quest)

* sube stats

* gana XP

* sube de nivel

* desbloquea títulos de clase

* mejora habilidades con tareas extra

El usuario solo ve:

* Daily Quest

* Stats

* Nivel

* Título actual

* Barras de progreso

Las reglas internas (fórmulas, contadores, cooldowns) no son visibles.

---

# 📊 2. STATS PRINCIPALES

Cinco habilidades:

* 🧠 Inteligencia (INT)

* 💪 Fuerza (STR)

* ⚡ Agilidad (AGI)

* ❤️ Vitalidad (VIT)

* 🛡️ Resistencia (END)

---

# 🏠 3. PANTALLA PRINCIPAL (HOME)

Muestra:

```text

LEVEL: X

XP: barra de progreso

INT: X

STR: X

AGI: X

VIT: X

END: X

Título de Clase actual

(barra pequeña del siguiente título disponible)

[ Daily Quest ]

[ Skills ]

[ Títulos ]

[ Historial / Récords ]

```

Solo se muestran:

* títulos obtenidos

* barra del siguiente título disponible

  No se muestran títulos bloqueados.

---

# ⏰ 4. SISTEMA DE TIEMPO Y CALENDARIO (BASE DEL SISTEMA)

La app depende de:

* Fecha del sistema (YYYY-MM-DD)

* Hora del sistema (HH:MM)

* Zona horaria del dispositivo

Principios:

* Solo existe **1 Daily Quest por día**

* Se genera automáticamente al iniciar un nuevo día (00:00 o hora configurada)

* La Daily Quest pertenece a una fecha específica

* No se puede completar una Daily Quest de otro día

* Si no se completa → se marca como fallida

Registro:

```text

2026-03-01 → Completed

2026-03-02 → Failed

2026-03-03 → Rest Day

```

---

## 🔒 Anti-trampa (básico)

Si el usuario cambia la hora manualmente:

```text

if system_time < last_saved_time:

   lock_progress()

```

Se muestra aviso:

> ⚠️ Time manipulation detected

---

# ⚔️ 5. DAILY QUEST (MISIÓN DIARIA)

### Características:

* son diarias

* algunas son descanso

* mínimo 1–2 días de descanso por semana

* el usuario solo marca:

  ✅ Completado

Días de descanso:

* no cuentan para INT ni STR

* pueden contar para END o XP base

* se muestran como:

> 💤 Rest Day – Recovery Mission

---

## 🏃 Progresión de carrera

Inicio:

* Día 1: 10 minutos

* Cada Daily Quest: +1 minuto

* Hasta llegar a 60 minutos

Luego cambia a modo:

* correr 5 km

* registrar tiempo

* intentar romper récord

El tiempo se mide con el reloj del dispositivo:

```text

start_time

end_time

duration

```

---

## 💪 Progresión de ejercicios físicos

Inicio:

* 10 reps (abdominales, sentadillas, lagartijas)

Cada Daily Quest:

* +1 rep

Cuando llegan a 100:

* se agrega nuevo ejercicio con 25 reps

* este sube +5 reps por Daily Quest

* hasta 100

* se agrega otro ejercicio nuevo

* progresión infinita

---

# 📈 6. SUBIDA DE STATS POR DAILY QUEST

Reglas internas (el usuario no las ve):

---

## 🧠 Inteligencia (INT)

+1 INT por cada **5 Daily Quest seguidas completas**

(No cuentan días de descanso)

Si falla una:

```text

contador = 0

```

---

## 💪 Fuerza (STR)

+1 STR por cada **7 Daily Quest**

con máximo 2 fallos

(No cuentan días de descanso)

---

## ❤️ Vitalidad (VIT)

+1 VIT por cada **7 Daily Quest**

con máximo 2 fallos

---

## 🛡️ Resistencia (END)

+1 END por cada **3 Daily Quest completas**

---

## ⚡ Agilidad (AGI)

+1 AGI por cada **4 Daily Quest completas**

---

# ⭐ 7. NIVEL GENERAL DEL JUGADOR

* Cada Daily Quest da XP

* El nivel sube solo con XP

* El nivel desbloquea:

  * títulos de clase

  * misiones especiales

  * contenido avanzado

---

# 🧠 8. SECCIÓN SKILLS (TAREAS EXTRA – NO ACUMULABLES)

Opcionales.

No se guardan si no se hacen ese día.

Dependen del:

* nivel de la habilidad

* título actual de la habilidad

---

## 🧠 Inteligencia (Tests)

Cada día inicia con:

* 1 test disponible

Resultados:

### ❌ Si reprueba el primer test:

* +0 puntos

* siguiente test en 2 días

### ✅ Si pasa normal (no perfecto):

* gana puntos según dificultad (máx +10)

* no hay más tests ese día

### 🌟 Si pasa perfecto:

* desbloquea otro test el mismo día

* máximo 5 tests si todos son perfectos

Si logra 5 perfectos:

* desbloquea test del siguiente título no conseguido

* recompensa: +10 INT directos

Dificultad basada en:

* puntos de INT

* título actual de INT

---

## 💪 Fuerza (pruebas físicas)

Ejemplo:

* reto por tiempo o repeticiones máximas

Resultado:

* éxito → +4 STR

* fallo → +1 STR

Disponible cada 4 días

Dificultad según STR y título STR

---

## 🛡️ Resistencia

Prueba continua por tiempo:

Resultado:

* éxito → +4 END

* fallo → +1 END

Disponible cada 4 días

Dificultad según END y título END

---

## ❤️ Vitalidad

Tareas:

* meditación

* respiración

* reflexión

* hábitos espirituales

Resultado:

* +1 VIT

Disponible 4 veces por semana

Dificultad según VIT y título VIT

---

## ⚡ Agilidad

Tareas:

* estiramientos

* saltos

* coordinación

Resultado:

* +1 AGI

Disponible 3 veces por semana

Dificultad según AGI y título AGI

---

# 🏷️ 9. SISTEMA DE TÍTULOS

## 🧙‍♂️ Títulos de Clase (Jugador)

Se desbloquean por:

* nivel mínimo requerido

* misión especial temática (rutina pesada)

Ejemplos:

* Guerrero

* Nigromante

* Asesino

* Monje

* Explorador

Solo se muestran los obtenidos.

Se muestra barra del siguiente disponible.

---

## 📊 Títulos de Skills

Cada habilidad tiene títulos por puntos acumulados:

INT, STR, AGI, VIT, END

Ejemplo STR:

* 10 → Aprendiz

* 25 → Guerrero

* 50 → Titán

Sin misiones.

---

# 🗂️ 10. SECCIÓN TÍTULOS (INTERFAZ)

Contiene:

1️⃣ Títulos de Clase

2️⃣ Títulos por Skill

No se muestran títulos bloqueados, solo progreso al siguiente.

---

# 🔔 11. NOTIFICACIONES

* Daily Quest disponible

* Recordatorio si no se completa

* Nuevo título desbloqueado

* Récord superado

* Nivel subido

* Test disponible

---

# 🧭 12. PRINCIPIOS DE DISEÑO

* simple para el usuario

* complejo internamente

* progresión real

* descanso obligatorio

* no acumulable

* dificultad adaptativa

* RPG personal

* metas cortas, medias y largas

* identidad por títulos

* control por tiempo real

---

# 🧱 13. MENÚ FINAL

```text

HOME

 ├─ Daily Quest

 ├─ Skills

 ├─ Títulos

 ├─ Stats

 └─ Historial / Récords

```

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://srank-level-system.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d5f3da96-3364-4b04-b277-99f827c26288).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
