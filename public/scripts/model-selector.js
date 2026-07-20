/**
 * Model Selector — client-side filtering logic.
 * Loaded by selector-modelos.mdx
 */
(function () {
  var MODELS = [
    { id: "openai/gpt-5.6-sol", provider: "openai", class: "frontier", reasoning: "high", toolCall: true, contextWindow: "grande", status: "stable", notes: "Modelo más capaz OpenAI" },
    { id: "openai/gpt-5.6-terra", provider: "openai", class: "balanced", reasoning: "medium", toolCall: true, contextWindow: "grande", status: "stable", notes: "Balance capacidad/costo" },
    { id: "openai/gpt-5.6-luna", provider: "openai", class: "economic", reasoning: "low", toolCall: true, contextWindow: "medio", status: "stable", notes: "Tareas mecánicas" },
    { id: "openai/gpt-5.6-sol-fast", provider: "openai", class: "frontier", reasoning: "medium", toolCall: true, contextWindow: "grande", status: "stable", notes: "Variante rápida de Sol" },
    { id: "openai/gpt-5.6-terra-fast", provider: "openai", class: "balanced", reasoning: "low", toolCall: true, contextWindow: "grande", status: "stable", notes: "Variante rápida de Terra" },
    { id: "openai/gpt-5.6-luna-fast", provider: "openai", class: "economic", reasoning: "low", toolCall: true, contextWindow: "medio", status: "stable", notes: "Variante rápida de Luna" },
    { id: "openai/gpt-5.5", provider: "openai", class: "powerful", reasoning: "high", toolCall: true, contextWindow: "grande", status: "stable", notes: "" },
    { id: "openai/gpt-5.5-fast", provider: "openai", class: "powerful", reasoning: "medium", toolCall: true, contextWindow: "grande", status: "stable", notes: "" },
    { id: "openai/gpt-5.4", provider: "openai", class: "powerful", reasoning: "high", toolCall: true, contextWindow: "grande", status: "stable", notes: "" },
    { id: "openai/gpt-5.4-mini", provider: "openai", class: "economic", reasoning: "limited", toolCall: true, contextWindow: "medio", status: "stable", notes: "" },
    { id: "openai/gpt-5.3-codex-spark", provider: "openai", class: "code-specialized", reasoning: "limited", toolCall: true, contextWindow: "medio", status: "stable", notes: "Optimizado para Codex CLI" },
    { id: "openrouter/anthropic/claude-opus-4.8", provider: "anthropic", class: "frontier", reasoning: "xhigh", toolCall: true, contextWindow: "200K", status: "stable", notes: "Máxima capacidad Anthropic" },
    { id: "openrouter/anthropic/claude-opus-4.8-fast", provider: "anthropic", class: "frontier", reasoning: "high", toolCall: true, contextWindow: "200K", status: "stable", notes: "" },
    { id: "openrouter/anthropic/claude-sonnet-5", provider: "anthropic", class: "powerful", reasoning: "high", toolCall: true, contextWindow: "200K", status: "stable", notes: "Balance capacidad/velocidad" },
    { id: "openrouter/anthropic/claude-haiku-4.5", provider: "anthropic", class: "economic", reasoning: "limited", toolCall: true, contextWindow: "200K", status: "stable", notes: "Rápido y económico" },
    { id: "openrouter/anthropic/claude-fable-5", provider: "anthropic", class: "creative", reasoning: "high", toolCall: true, contextWindow: "200K", status: "stable", notes: "Escritura creativa" },
    { id: "openrouter/google/gemini-3.5-flash", provider: "google", class: "balanced", reasoning: "medium", toolCall: true, contextWindow: "grande", status: "stable", notes: "" },
    { id: "openrouter/google/gemini-3.1-pro-preview", provider: "google", class: "powerful", reasoning: "high", toolCall: true, contextWindow: "grande", status: "preview", notes: "Preview, puede cambiar" },
    { id: "openrouter/google/gemini-3.1-flash-lite", provider: "google", class: "economic", reasoning: "limited", toolCall: true, contextWindow: "medio", status: "stable", notes: "" },
    { id: "openrouter/google/gemini-3-flash-preview", provider: "google", class: "balanced", reasoning: "medium", toolCall: true, contextWindow: "grande", status: "preview", notes: "" },
    { id: "opencode-go/deepseek-v4-pro", provider: "opencode-go", class: "balanced", reasoning: "medium", toolCall: true, contextWindow: "128K", status: "stable", notes: "" },
    { id: "opencode-go/deepseek-v4-flash", provider: "opencode-go", class: "economic", reasoning: "low", toolCall: true, contextWindow: "128K", status: "stable", notes: "" },
    { id: "opencode-go/kimi-k3", provider: "opencode-go", class: "powerful", reasoning: "high", toolCall: true, contextWindow: "128K", status: "stable", notes: "Fuerte en código" },
    { id: "opencode-go/kimi-k2.7-code", provider: "opencode-go", class: "code-specialized", reasoning: "medium", toolCall: true, contextWindow: "128K", status: "stable", notes: "Optimizado para código" },
    { id: "opencode-go/glm-5.2", provider: "opencode-go", class: "powerful", reasoning: "high", toolCall: true, contextWindow: "128K", status: "stable", notes: "" },
    { id: "opencode-go/glm-5.1", provider: "opencode-go", class: "balanced", reasoning: "medium", toolCall: true, contextWindow: "128K", status: "stable", notes: "" },
    { id: "opencode-go/grok-4.5", provider: "opencode-go", class: "powerful", reasoning: "high", toolCall: true, contextWindow: "128K", status: "stable", notes: "" },
    { id: "opencode-go/qwen3.7-max", provider: "opencode-go", class: "powerful", reasoning: "high", toolCall: true, contextWindow: "128K", status: "stable", notes: "" },
    { id: "opencode-go/qwen3.7-plus", provider: "opencode-go", class: "balanced", reasoning: "medium", toolCall: true, contextWindow: "128K", status: "stable", notes: "" },
    { id: "opencode-go/qwen3.6-plus", provider: "opencode-go", class: "balanced", reasoning: "medium", toolCall: true, contextWindow: "128K", status: "stable", notes: "" },
    { id: "opencode-go/minimax-m3", provider: "opencode-go", class: "powerful", reasoning: "high", toolCall: true, contextWindow: "128K", status: "stable", notes: "" },
    { id: "opencode-go/minimax-m2.7", provider: "opencode-go", class: "balanced", reasoning: "medium", toolCall: true, contextWindow: "128K", status: "stable", notes: "" },
    { id: "opencode-go/mimo-v2.5-pro", provider: "opencode-go", class: "powerful", reasoning: "high", toolCall: true, contextWindow: "128K", status: "stable", notes: "" },
    { id: "opencode-go/mimo-v2.5", provider: "opencode-go", class: "balanced", reasoning: "medium", toolCall: true, contextWindow: "128K", status: "stable", notes: "" },
  ];

  var PROVIDER_LABELS = {
    openai: "OpenAI",
    google: "Google",
    anthropic: "Anthropic",
    "opencode-go": "OpenCode Go",
  };

  var CLASS_LABELS = {
    frontier: "Frontier",
    powerful: "Potente",
    balanced: "Equilibrado",
    economic: "Económico",
    "code-specialized": "Código",
    creative: "Creativo",
  };

  var CLASS_BADGE_COLORS = {
    frontier: "class-frontier",
    powerful: "class-powerful",
    balanced: "class-balanced",
    economic: "class-economic",
    "code-specialized": "class-code",
    creative: "class-creative",
  };

  var REASONING_CLASS = {
    xhigh: "reasoning-xhigh",
    high: "reasoning-high",
    medium: "reasoning-medium",
    low: "reasoning-low",
    limited: "reasoning-limited",
  };

  var activeFilters = { provider: "all", class: "all", reasoning: "all" };
  var searchTerm = "";

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderTable(models) {
    var tbody = document.getElementById("model-tbody");
    var noResults = document.getElementById("no-results");
    var visibleCount = document.getElementById("visible-count");
    var totalCount = document.getElementById("total-count");

    if (!tbody) return; // guard: not on the selector page

    totalCount.textContent = MODELS.length;
    visibleCount.textContent = models.length;

    if (models.length === 0) {
      tbody.innerHTML = "";
      noResults.style.display = "block";
      return;
    }

    noResults.style.display = "none";

    var rows = [];
    for (var i = 0; i < models.length; i++) {
      var m = models[i];
      var provider = PROVIDER_LABELS[m.provider] || m.provider;
      var className = CLASS_LABELS[m.class] || m.class;
      var classBadge = CLASS_BADGE_COLORS[m.class] || "";
      var reasoning = REASONING_CLASS[m.reasoning] || "";
      var statusBadge = m.status === "stable" ? "status-stable" : "status-preview";
      var statusLabel = m.status === "stable" ? "Estable" : "Preview";
      var escapedId = escapeHtml(m.id);
      var toolCallIcon = m.toolCall ? "✅" : "❌";
      var notesAttr = m.notes ? ' title="' + m.notes.replace(/"/g, "&quot;") + '"' : "";

      rows.push(
        '<tr class="model-row" data-provider="' + m.provider + '" data-class="' + m.class + '" data-reasoning="' + m.reasoning + '">' +
        '<td class="model-id"' + notesAttr + '>' + escapedId + '</td>' +
        "<td>" + provider + "</td>" +
        '<td><span class="class-badge ' + classBadge + '">' + className + "</span></td>" +
        '<td><span class="reasoning-badge ' + reasoning + '">' + m.reasoning + "</span></td>" +
        '<td class="toolcall-cell">' + toolCallIcon + "</td>" +
        "<td>" + m.contextWindow + "</td>" +
        '<td><span class="status-badge ' + statusBadge + '">' + statusLabel + "</span></td>" +
        "</tr>"
      );
    }

    tbody.innerHTML = rows.join("");
  }

  function filterModels() {
    var filtered = MODELS.slice();

    if (activeFilters.provider !== "all") {
      filtered = filtered.filter(function (m) { return m.provider === activeFilters.provider; });
    }
    if (activeFilters.class !== "all") {
      filtered = filtered.filter(function (m) { return m.class === activeFilters.class; });
    }
    if (activeFilters.reasoning !== "all") {
      filtered = filtered.filter(function (m) { return m.reasoning === activeFilters.reasoning; });
    }
    if (searchTerm) {
      var term = searchTerm.toLowerCase();
      filtered = filtered.filter(function (m) {
        return (
          m.id.toLowerCase().indexOf(term) !== -1 ||
          (m.notes && m.notes.toLowerCase().indexOf(term) !== -1) ||
          (PROVIDER_LABELS[m.provider] && PROVIDER_LABELS[m.provider].toLowerCase().indexOf(term) !== -1)
        );
      });
    }

    renderTable(filtered);
  }

  function setActiveChip(group, value) {
    var chips = document.querySelectorAll('.filter-chip[data-filter="' + group + '"]');
    for (var i = 0; i < chips.length; i++) {
      var chip = chips[i];
      if (chip.dataset.value === value) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    }
  }

  function setup() {
    // Filter chip clicks
    var chips = document.querySelectorAll(".filter-chip");
    for (var i = 0; i < chips.length; i++) {
      (function (chip) {
        chip.addEventListener("click", function () {
          var filter = chip.dataset.filter;
          var value = chip.dataset.value;
          activeFilters[filter] = value;
          setActiveChip(filter, value);
          filterModels();
        });
      })(chips[i]);
    }

    // Search input
    var searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        searchTerm = e.target.value;
        filterModels();
      });
    }

    // Clear filters
    var clearBtn = document.getElementById("clear-filters");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        activeFilters = { provider: "all", class: "all", reasoning: "all" };
        searchTerm = "";
        var si = document.getElementById("search-input");
        if (si) si.value = "";
        setActiveChip("provider", "all");
        setActiveChip("class", "all");
        setActiveChip("reasoning", "all");
        filterModels();
      });
    }

    // Initial render
    renderTable(MODELS.slice());
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();
