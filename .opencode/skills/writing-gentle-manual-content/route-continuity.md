# Route Continuity

## User goal

After selecting a profile route, the reader should always know:

- which route is active;
- current lesson;
- progress;
- previous lesson;
- next lesson;
- remaining lessons;
- how to switch or leave the route.

The reader must not return repeatedly to the route index.

## Route context model

The canonical route is selected through:

```text
?ruta=<profile-slug>
```

A valid route may be retained locally for continuity. No telemetry or remote account is required.

Preferred storage:

- `sessionStorage` for current tab context;
- optional `localStorage` only for “continue where I left off”, clearly documented and entirely local.

## Lesson UI

### Route context header

```text
Ruta: Principiante total
Paso 4 de 12 · 33%
[Ver recorrido]
```

### Previous and next

Desktop:

```text
← Lección anterior                    Siguiente lección →
```

Mobile:

- compact sticky bottom bar;
- two actions maximum;
- does not cover content;
- respects safe areas;
- the full route opens in a native `<details>` or accessible drawer.

### Route map

A collapsible ordered list:

- current step highlighted;
- completed steps optionally marked only from local state;
- every lesson is a direct link with the active route query;
- no JavaScript fallback links to the route index and standard Starlight pagination.

### Continue route

The homepage or route index may offer:

```text
Continuar “Principiante total” desde “La terminal”
```

Only when a valid locally stored lesson still exists in the route.

## State validation

Ignore and clear:

- unknown route slug;
- lesson no longer in route;
- malformed stored data;
- old base path.

## Tests

- active route survives next/previous navigation;
- direct links retain query;
- route map opens by keyboard;
- `aria-current` marks the lesson;
- mobile bar has no overflow;
- no-JS fallback exists;
- invalid stored state is cleared;
- no remote request records progress.
