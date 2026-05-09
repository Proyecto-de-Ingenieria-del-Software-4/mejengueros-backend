# Prisma workflow del proyecto

Esta guía explica **qué comando usar**, **cuándo usarlo** y **qué esperar** en este repo.

El objetivo es evitar dos errores comunes:

- confundir **migraciones** con **cliente Prisma generado**
- correr comandos destructivos sin entender qué limpian y qué regeneran

---

## Resumen rápido

### Si cambiaste `schema.prisma`

Usá:

```bash
npx prisma migrate dev --name <nombre-del-cambio>
```

Esto crea una migración nueva, la aplica y actualiza el cliente.

---

### Si querés reconstruir la base desde cero

Usá:

```bash
npx prisma migrate reset --force
npx prisma db seed
```

Esto borra la base, reaplica las migraciones y vuelve a sembrar los datos baseline.

---

### Si solo querés regenerar el cliente Prisma

Usá:

```bash
npx prisma generate
```

Esto **no toca la base de datos**.

---

## Regla mental correcta

| Necesidad | Comando |
|---|---|
| Cambié el schema y quiero una migración nueva | `npx prisma migrate dev --name <nombre>` |
| Quiero resetear la base y reaplicar todo | `npx prisma migrate reset --force` |
| Quiero correr el seed oficial | `npx prisma db seed` |
| Quiero regenerar el Prisma Client | `npx prisma generate` |
| Quiero ver si las migraciones están alineadas | `npx prisma migrate status` |

---

## Qué hace cada comando

## 1) `npx prisma migrate dev --name <nombre>`

### Cuándo usarlo

Cuando **modificaste `prisma/schema.prisma`** y querés convertir ese cambio en una migración nueva.

Ejemplo:

```bash
npx prisma migrate dev --name add-auth-provider-table
```

### Qué hace

- compara el schema actual contra el estado esperado
- crea una nueva migración SQL en `prisma/migrations`
- aplica esa migración a tu base de desarrollo
- actualiza el historial de migraciones
- normalmente también regenera el Prisma Client

### Qué NO hace

- no es para producción
- no es para “forzar” una base rota o con drift
- no reemplaza el seed

### Cuándo NO usarlo

No lo uses si Prisma te dice que hay **drift** entre la base y el historial.

En ese caso primero tenés que:

- alinear la base
- o resetearla

---

## 2) `npx prisma migrate reset --force`

### Cuándo usarlo

Cuando querés **destruir la base de desarrollo** y reconstruirla desde las migraciones actuales.

Ejemplo típico:

```bash
npx prisma migrate reset --force
```

### Qué hace

- elimina los datos de la base
- recrea el esquema desde las migraciones existentes
- deja la base vacía pero estructuralmente alineada

### Qué NO hace

- no crea migraciones nuevas
- no corrige por sí mismo un schema mal diseñado
- no reemplaza `migrate dev`

### Importante

En este repo conviene seguirlo con:

```bash
npx prisma db seed
```

para reinsertar:

- roles baseline
- auth providers baseline
- password policy baseline
- cualquier dato de arranque definido en `prisma/seed.ts`

---

## 3) `npx prisma db seed`

### Cuándo usarlo

Cuando ya tenés la base creada y querés insertar los datos iniciales del proyecto.

Ejemplo:

```bash
npx prisma db seed
```

### Qué hace

En este repo corre el seed oficial configurado en `prisma.config.ts`:

```ts
migrations: {
  path: 'prisma/migrations',
  seed: 'tsx prisma/seed.ts',
}
```

Eso significa que Prisma ejecuta:

```bash
tsx prisma/seed.ts
```

### Qué carga hoy

El seed está pensado para dejar baseline de auth, incluyendo como mínimo:

- roles
- auth providers
- password policy

### Qué NO hace

- no crea tablas
- no genera migraciones
- no regenera el cliente

---

## 4) `npx prisma generate`

### Cuándo usarlo

Cuando querés **regenerar el Prisma Client**.

Ejemplo:

```bash
npx prisma generate
```

### Qué hace

Genera el cliente Prisma que usa tu código TypeScript.

En este repo se genera en:

```text
src/generated/prisma
```

### Qué NO hace

- no toca la base
- no aplica migraciones
- no inserta datos

### Cuándo sirve de verdad

- si cambiaste el schema y querés actualizar el cliente
- si acabás de clonar el repo y querés asegurarte de que el client existe
- si el client quedó desalineado con el schema

---

## 5) `npx prisma migrate status`

### Cuándo usarlo

Cuando querés saber si la base está alineada con el historial de migraciones.

Ejemplo:

```bash
npx prisma migrate status
```

### Qué hace

- muestra si la base está al día
- indica si hay migraciones pendientes
- ayuda a detectar estados raros del entorno local

### Cuándo conviene usarlo

- antes de tocar migraciones si dudás del estado actual
- después de un reset
- después de una baseline nueva

---

## Flujos recomendados

## Flujo A: cambié `schema.prisma`

Usá este flujo cuando agregás o modificás modelos, relaciones, índices, tablas o enums.

```bash
npx prisma migrate dev --name <nombre-del-cambio>
npx prisma db seed
```

### Ejemplo

```bash
npx prisma migrate dev --name replace-role-enum-with-table
npx prisma db seed
```

### Cuándo agregar `generate`

Si querés ser explícito o notás desalineación:

```bash
npx prisma generate
```

Aunque normalmente `migrate dev` ya te deja eso al día.

---

## Flujo B: quiero reconstruir la base desde cero

Usá este flujo cuando querés tirar todo abajo localmente y levantarlo limpio.

```bash
npx prisma migrate reset --force
npx prisma db seed
```

### Cuándo usarlo

- drift local
- datos sucios
- querés probar el baseline real
- querés verificar que las migraciones levantan una base vacía

---

## Flujo C: acabo de clonar el repo

Si el repo ya tiene migraciones creadas:

```bash
npx prisma generate
npx prisma migrate reset --force
npx prisma db seed
```

Eso te deja:

- cliente generado
- base alineada
- datos baseline cargados

---

## Flujo D: quiero crear una baseline nueva desde cero

Este flujo es **destructivo** y solo se usa cuando decidís reiniciar el historial de migraciones.

### Paso 1: borrar migraciones existentes

PowerShell:

```powershell
Remove-Item -Recurse -Force "prisma/migrations"
```

### Paso 2: crear la nueva primera migración

```bash
npx prisma migrate dev --name init
```

### Paso 3: correr seed

```bash
npx prisma db seed
```

### Si Prisma detecta drift

Entonces primero hacé:

```bash
npx prisma migrate reset --force
```

y después repetí:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

---

## Qué significa “drift”

Prisma detecta **drift** cuando:

- la base real no coincide con lo que dicen las migraciones
- hubo cambios manuales en DB
- se borró o alteró historial
- la base quedó en un estado intermedio raro

### Señal típica

Cuando corrés:

```bash
npx prisma migrate dev --name init
```

y Prisma responde algo como:

> Your database schema is not in sync with your migration history.

### Qué hacer

En desarrollo, lo normal es resetear:

```bash
npx prisma migrate reset --force
npx prisma db seed
```

Si además estás recreando la baseline de migraciones, recién después hacés:

```bash
npx prisma migrate dev --name init
```

---

## Flujo oficial recomendado para este repo

## Caso más común: volver a levantar todo local

```bash
npx prisma migrate reset --force
npx prisma db seed
```

## Caso más común: hice un cambio en schema

```bash
npx prisma migrate dev --name <nombre-del-cambio>
npx prisma db seed
```

## Caso más común: quiero asegurarme de que el client existe

```bash
npx prisma generate
```

---

## Verificación recomendada después de tocar Prisma

Después de cambios relevantes en schema/seed, conviene correr:

```bash
npm run lint
yarn test
yarn test:e2e
npx tsc --noEmit
```

Esto valida que:

- el código compile
- los tests sigan verdes
- los cambios de Prisma no rompieron imports o contratos

---

## Errores comunes

## Error 1: pensar que `generate` crea tablas

Incorrecto.

```bash
npx prisma generate
```

solo regenera el cliente.

---

## Error 2: pensar que `reset` crea migraciones nuevas

Incorrecto.

```bash
npx prisma migrate reset --force
```

solo reaplica las migraciones que ya existen.

---

## Error 3: correr `migrate dev` arriba de una base con drift

Eso normalmente termina en el mensaje de drift y Prisma te frena.

Primero alineá o reseteá la base.

---

## Error 4: asumir que el seed corre solo siempre

En este repo el flujo oficial ya está configurado, pero como práctica operativa conviene ser explícito:

```bash
npx prisma migrate reset --force
npx prisma db seed
```

---

## Checklist operativa

### Quiero cambiar el schema

- [ ] Edité `prisma/schema.prisma`
- [ ] Corrí `npx prisma migrate dev --name <nombre>`
- [ ] Corrí `npx prisma db seed`
- [ ] Validé con lint/tests/tsc

### Quiero resetear todo

- [ ] Sé que voy a perder datos
- [ ] Corrí `npx prisma migrate reset --force`
- [ ] Corrí `npx prisma db seed`
- [ ] Validé el proyecto

### Quiero baseline nueva desde cero

- [ ] Borré `prisma/migrations`
- [ ] Corrí `npx prisma migrate dev --name init`
- [ ] Corrí `npx prisma db seed`
- [ ] Verifiqué `npx prisma migrate status`

---

## Comandos copy/paste

### Reset local completo

```bash
npx prisma migrate reset --force
npx prisma db seed
```

### Cambio de schema con migración nueva

```bash
npx prisma migrate dev --name my-change
npx prisma db seed
```

### Solo regenerar Prisma Client

```bash
npx prisma generate
```

### Ver estado de migraciones

```bash
npx prisma migrate status
```

### Rehacer baseline desde cero en PowerShell

```powershell
Remove-Item -Recurse -Force "prisma/migrations"
npx prisma migrate dev --name init
npx prisma db seed
```
