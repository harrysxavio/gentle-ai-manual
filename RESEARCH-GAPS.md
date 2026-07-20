# Research Gaps — Gentle AI Mega Manual

> **Última actualización**: 2026-07-20

---

## Investigación completada 🟢

- ✅ gentle-ai v2.1.10 — commit `b0a88fa`, código, tests, docs, contratos
- ✅ engram v1.19.0/1.20.0 — commit `763a6ba`, código, schema, MCP tools, cloud
- ✅ GGA v2.10.1 — commit `fbf1091`, código Bash, 266 tests, proveedores
- ✅ Gentleman-Skills — commit `c8036a37`, 24 skills, frontmatter, triggers
- ✅ OpenCode model catalog — `opencode models` ejecutado
- ✅ Versiones locales — gentle-ai 2.1.10, engram 1.19.0, opencode 1.17.20, codex 0.144.0

## Investigación pendiente 🔴

- [ ] **YouTube channel** — Revisar videos clave para comandos, flujos, versiones
- [ ] **Libro oficial** — Leer y mapear capítulos al código
- [ ] **OpenCode docs oficiales** — Verificar configuraciones, modelos, features
- [ ] **Codex docs oficiales** — Verificar config, profiles, multiagent
- [ ] **MCP spec oficial** — Verificar protocolo, transporte, herramientas
- [ ] **OpenCode Zen catalog** — Verificar modelos disponibles
- [ ] **Models.dev / OpenCode model sources** — Verificar origen de datos de modelos
- [ ] **NVIDIA catalog** — Verificar modelos NVIDIA disponibles via OpenCode
- [ ] **Precios de modelos** — Obtener precios actualizados por proveedor
- [ ] **Benchmarks públicos** — Recopilar datos de rendimiento de modelos
- [ ] **GitHub Actions de los repos** — Workflows, CI, releases
- [ ] **Issues abiertos** — Problemas conocidos, bugs, features request
- [ ] **Pull requests recientes** — Cambios en curso, direcciones del proyecto

## Dudas e incertidumbres 🟡

1. **Modelos GPT-5.6 Sol Pro vs Sol**: ¿Son el mismo modelo con distintas rutas? `openai/gpt-5.6-sol` vs `openrouter/openai/gpt-5.6-sol-pro`
2. **Gemini 3.1 Pro estable vs preview**: ¿Existe versión estable? Solo encontramos `preview`
3. **Engram cloud**: ¿Qué tan estable es el modo cloud? Marcado como opt-in
4. **Codex multiagente**: Estado actual en v0.144.0 — ¿funcional o experimental?
5. **GGA en Windows**: ¿Funciona correctamente con Git Bash? Tests indican soporte
6. **Skills embebidas de gentle-ai**: ¿Cuáles son exactamente las 22 skills? Investigación de catálogo incompleta
7. **Contratos vacíos**: `contracts/` en gentle-ai está vacío. ¿Son necesarios o heredados?
8. **Comandos review heredados**: `review-start`, `review-step`, `review-resume` existen como legacy. ¿Deprecados?

## Áreas que requieren verificación adicional

- **Tool calling por modelo**: No todos los modelos de OpenRouter soportan tool calling correctamente
- **Reasoning effort por proveedor**: Diferente nomenclatura y disponibilidad entre OpenAI, Google, Anthropic
- **Context window real**: Las ventanas de contexto varían por plan y proveedor
- **Fallback behavior**: Cómo se comporta cada agente cuando un modelo falla
- **Engram conflict resolution**: El sistema de conflictos vía `mem_judge` es nuevo, verificar comportamiento real
- **SDD strict TDD**: ¿Cómo se integra realmente la verificación RED/GREEN en el flujo?
