const DATA_URL = "assets/data/llm-synthesis-index.json?v=ecfs-llm-synthesis";
const PAGE_SIZE = 100;

const colors = {
  blue: "#01458e",
  purple: "#60b0e0",
  cyan: "#00a0e0",
  green: "#13896f",
  amber: "#005090",
  red: "#ff8621",
  pink: "#ffb15f",
  indigo: "#0090d0",
  teal: "#9fe8e6",
  orange: "#68717c",
  lime: "#3c3c3c",
  rose: "#d9d9d9",
};

const palette = Object.values(colors);
const confidenceOrder = ["high", "medium", "low"];

const app = {
  payload: null,
  records: [],
  recordById: new Map(),
  charts: [],
  selectedRecords: [],
  rendered: 0,
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function numberFormat(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function titleCase(value) {
  return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function validatePayload(payload) {
  const requiredTopLevel = ["metadata", "records", "themes", "clinical_domains", "strategic_signals", "emerging_modalities", "findings"];
  const missing = requiredTopLevel.filter((key) => !(key in payload));
  if (missing.length) throw new Error(`Synthesis artifact is missing: ${missing.join(", ")}`);
  const requiredRecordFields = ["uid", "title", "primary_theme", "clinical_domain", "population", "study_type", "why_it_matters", "confidence", "confidence_reason", "presentation_url"];
  const badRecord = payload.records.find((record) => requiredRecordFields.some((field) => !(field in record)));
  if (badRecord) throw new Error(`Record ${badRecord.uid || "unknown"} is missing required synthesis fields.`);
  return payload;
}

function recordsFromIds(ids) {
  return (ids || []).map((id) => app.recordById.get(id)).filter(Boolean);
}

function confidenceCounts(records) {
  const counts = Object.fromEntries(confidenceOrder.map((key) => [key, 0]));
  records.forEach((record) => {
    counts[record.confidence] = (counts[record.confidence] || 0) + 1;
  });
  return counts;
}

function confidenceText(records) {
  const counts = confidenceCounts(records);
  return confidenceOrder.map((key) => `${titleCase(key)} ${numberFormat(counts[key])}`).join(" / ");
}

function sourceLabel(record) {
  return [
    record.display_code,
    record.presenter,
    record.family,
    record.session_type,
    record.track,
    record.session_date,
  ]
    .filter(Boolean)
    .join(" / ");
}

function textFor(record) {
  if (!record._searchText) {
    record._searchText = [
      record.display_code,
      record.title,
      record.summary,
      record.presenter,
      record.family,
      record.session_type,
      record.track,
      record.session_title,
      record.primary_theme,
      record.secondary_themes?.join(" "),
      record.strategic_signals?.join(" "),
      record.clinical_domain,
      record.population,
      record.study_type,
      record.why_it_matters,
      record.confidence_reason,
    ]
      .join(" ")
      .toLowerCase();
  }
  return record._searchText;
}

function filteredSelectedRecords() {
  const query = document.querySelector("#dialog-search").value.trim().toLowerCase();
  const confidence = document.querySelector("#dialog-confidence").value;
  const terms = query.split(/\s+/).filter(Boolean);
  return app.selectedRecords.filter((record) => {
    if (confidence && record.confidence !== confidence) return false;
    if (!terms.length) return true;
    const haystack = textFor(record);
    return terms.every((term) => haystack.includes(term));
  });
}

function openRecords(kind, label, records, description = "") {
  app.selectedRecords = [...records].sort((a, b) =>
    String(a.display_code || a.presentation_id).localeCompare(String(b.display_code || b.presentation_id), undefined, { numeric: true }),
  );
  app.rendered = 0;
  document.querySelector("#dialog-kind").textContent = kind;
  document.querySelector("#dialog-title").textContent = label;
  document.querySelector("#dialog-search").value = "";
  document.querySelector("#dialog-confidence").value = "";
  document.querySelector("#dialog-summary").textContent = `${numberFormat(app.selectedRecords.length)} matching records. ${confidenceText(app.selectedRecords)}.${description ? ` ${description}` : ""}`;
  renderRecords(true);
  document.querySelector("#records-dialog").showModal();
}

function renderRecords(reset = false) {
  if (reset) app.rendered = 0;
  const list = document.querySelector("#records-list");
  const records = filteredSelectedRecords();
  app.rendered = Math.min(records.length, app.rendered + PAGE_SIZE);
  if (!records.length) {
    list.innerHTML = `<li><p class="record-summary">No matching records for this filter.</p></li>`;
  } else {
    list.innerHTML = records
      .slice(0, app.rendered)
      .map(
        (record) => `
          <li>
            <a class="record-title" href="${escapeHtml(record.presentation_url)}" target="_blank" rel="noopener">${escapeHtml(record.title || "Untitled record")}</a>
            <div class="record-meta">${escapeHtml(sourceLabel(record))}</div>
            <div class="confidence-row">
              <span class="confidence-badge confidence-${escapeHtml(record.confidence)}">${escapeHtml(titleCase(record.confidence))} confidence</span>
              <span>${escapeHtml(record.primary_theme)}</span>
              <span>${escapeHtml(record.clinical_domain)}</span>
              <span>${escapeHtml(record.study_type)}</span>
            </div>
            <p class="record-summary">${escapeHtml(record.why_it_matters)}</p>
            <p class="record-summary"><strong>Confidence reason:</strong> ${escapeHtml(record.confidence_reason)}</p>
            <a class="record-url" href="${escapeHtml(record.presentation_url)}" target="_blank" rel="noopener">${escapeHtml(record.presentation_url)}</a>
          </li>
        `,
      )
      .join("");
  }
  const loadMore = document.querySelector("#load-more-records");
  loadMore.hidden = app.rendered >= records.length;
  loadMore.textContent = `Load more (${numberFormat(Math.max(0, records.length - app.rendered))} remaining)`;
}

function kpiButton(label, records, className, description = "") {
  const button = document.createElement("button");
  button.className = `kpi kpi-${className}`;
  button.type = "button";
  button.innerHTML = `<div class="num">${numberFormat(records.length)}</div><div class="label">${escapeHtml(label)}</div>`;
  button.addEventListener("click", () => openRecords("Metric", label, records, description));
  return button;
}

function renderKpis() {
  const themes = app.payload.themes;
  const dominant = themes[0];
  const emerging = recordsFromIds(app.payload.strategic_signals.find((signal) => signal.name === "emerging_modality")?.record_ids);
  const practice = recordsFromIds(app.payload.strategic_signals.find((signal) => signal.name === "practice_implication")?.record_ids);
  const high = app.records.filter((record) => record.confidence === "high");
  const lowOrMetadata = app.records.filter((record) => record.confidence === "low" || !record.abstract_available);
  const grid = document.querySelector("#kpi-grid");
  grid.innerHTML = "";
  grid.append(
    kpiButton("Total inferred records", app.records, "blue"),
    kpiButton("High-confidence records", high, "green"),
    kpiButton(`Dominant theme: ${dominant?.name || "None"}`, recordsFromIds(dominant?.record_ids), "cyan"),
    kpiButton("Emerging modality records", emerging, "purple"),
    kpiButton("Practice implication records", practice, "amber"),
    kpiButton("Low-confidence / metadata-only", lowOrMetadata, "red"),
  );
}

function renderFindings() {
  const list = document.querySelector("#finding-list");
  list.innerHTML = app.payload.findings
    .map((finding, index) => {
      const records = recordsFromIds(finding.record_ids);
      return `
        <li>
          <button type="button" data-finding="${index}">
            <strong>${escapeHtml(finding.title)}</strong>
            <span class="finding-count">${numberFormat(records.length)} matching records</span>
            <span class="finding-rationale">${escapeHtml(finding.rationale)}</span>
          </button>
        </li>
      `;
    })
    .join("");
  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-finding]");
    if (!button) return;
    const finding = app.payload.findings[Number(button.dataset.finding)];
    openRecords("Strategic finding", finding.title, recordsFromIds(finding.record_ids), finding.rationale);
  });
}

function pointRecords(point) {
  return recordsFromIds(point.record_ids);
}

function renderBarList(id, points, kind, limit = 12) {
  const max = Math.max(...points.map((point) => point.count), 1);
  const container = document.querySelector(`#${id}`);
  container.innerHTML = "";
  points.slice(0, limit).forEach((point, index) => {
    const button = document.createElement("button");
    button.className = "bar-item";
    button.type = "button";
    button.setAttribute("aria-label", `${point.name}: ${numberFormat(point.count)} inferred records`);
    button.innerHTML = `
      <span class="name" data-full-label="${escapeHtml(point.name)}">${escapeHtml(titleCase(point.name))}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${Math.max(2, (point.count / max) * 100).toFixed(1)}%; background:${palette[index % palette.length]}"></span></span>
      <span class="val">${numberFormat(point.count)}</span>
    `;
    button.addEventListener("click", () => openRecords(kind, titleCase(point.name), pointRecords(point)));
    container.append(button);
  });
}

function renderThemeConfidence() {
  const container = document.querySelector("#themeConfidence");
  container.innerHTML = "";
  app.payload.themes.forEach((point) => {
    const records = pointRecords(point);
    const counts = confidenceCounts(records);
    const total = Math.max(records.length, 1);
    const button = document.createElement("button");
    button.className = "theme-confidence-row";
    button.type = "button";
    button.innerHTML = `
      <span class="theme-confidence-name">${escapeHtml(point.name)}</span>
      <span class="confidence-stack" aria-label="${escapeHtml(confidenceText(records))}">
        <i class="confidence-high" style="width:${((counts.high / total) * 100).toFixed(1)}%"></i>
        <i class="confidence-medium" style="width:${((counts.medium / total) * 100).toFixed(1)}%"></i>
        <i class="confidence-low" style="width:${((counts.low / total) * 100).toFixed(1)}%"></i>
      </span>
      <span class="theme-confidence-value">${escapeHtml(confidenceText(records))}</span>
    `;
    button.addEventListener("click", () => openRecords("Strategic theme confidence", point.name, records));
    container.append(button);
  });
}

function chartClickHandler(points, kind) {
  return (_event, elements) => {
    if (!elements.length) return;
    const point = points[elements[0].index];
    openRecords(kind, titleCase(point.name), pointRecords(point));
  };
}

function renderChart(canvasId, type, points, kind, extra = {}) {
  const chart = new Chart(document.getElementById(canvasId), {
    type,
    data: {
      labels: points.map((point) => titleCase(point.name)),
      datasets: [
        {
          label: "Inferred records",
          data: points.map((point) => point.count),
          backgroundColor: points.map((_, index) => palette[index % palette.length]),
          borderColor: type === "doughnut" ? "#d9d9d9" : "transparent",
          borderWidth: type === "doughnut" ? 1 : 0,
          borderRadius: type === "bar" ? 6 : 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: extra.indexAxis || "x",
      interaction: { mode: "nearest", intersect: false },
      onClick: chartClickHandler(points, kind),
      plugins: {
        legend: { display: type !== "bar", position: "bottom", labels: { color: "#68717c", boxWidth: 10, font: { size: 10 } } },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${numberFormat(context.parsed.y ?? context.parsed.x ?? context.parsed)} inferred records`,
          },
        },
      },
      scales: type === "doughnut" ? undefined : {
        x: { grid: { color: extra.indexAxis === "y" ? "#ebeceb" : "transparent" }, ticks: { color: "#68717c", font: { size: 10 } } },
        y: { grid: { color: extra.indexAxis === "y" ? "transparent" : "#ebeceb" }, ticks: { color: "#68717c", font: { size: 10 } } },
      },
    },
  });
  app.charts.push(chart);
}

function renderSignalCards() {
  const wanted = ["practice_implication", "care_burden", "access_equity", "diagnostic_shift", "real_world_evidence", "infection_risk"];
  const container = document.querySelector("#signal-cards");
  container.innerHTML = "";
  wanted.forEach((name) => {
    const point = app.payload.strategic_signals.find((signal) => signal.name === name);
    if (!point) return;
    const button = document.createElement("button");
    button.className = "theme-card";
    button.type = "button";
    button.innerHTML = `<h3>${escapeHtml(titleCase(name))}</h3><div class="big">${numberFormat(point.count)}</div><p>${escapeHtml(confidenceText(pointRecords(point)))}</p>`;
    button.addEventListener("click", () => openRecords("Strategic signal", titleCase(name), pointRecords(point)));
    container.append(button);
  });
}

function renderConfidenceQa() {
  const points = confidenceOrder.map((name) => {
    const records = app.records.filter((record) => record.confidence === name);
    return { name, count: records.length, record_ids: records.map((record) => record.uid) };
  });
  renderChart("confidenceChart", "doughnut", points, "Confidence");
  const low = app.records
    .filter((record) => record.confidence === "low" || !record.abstract_available)
    .slice(0, 10)
    .map((record) => ({ name: record.title, count: record.abstract_available ? 1 : 2, record_ids: [record.uid] }));
  renderBarList("lowConfidenceList", low, "Low-confidence record", 10);
}

function renderAll() {
  renderKpis();
  renderFindings();
  renderChart("themeChart", "bar", app.payload.themes, "Strategic theme", { indexAxis: "y" });
  renderThemeConfidence();
  renderChart("domainChart", "doughnut", app.payload.clinical_domains, "Clinical domain");
  renderBarList("populationBars", app.payload.populations, "Population");
  renderBarList("emergingBars", app.payload.emerging_modalities, "Emerging modality", app.payload.emerging_modalities.length);
  renderChart("studyChart", "doughnut", app.payload.study_types, "Study type");
  renderSignalCards();
  renderConfidenceQa();
}

function wireDialog() {
  document.querySelector(".dialog-close").addEventListener("click", () => document.querySelector("#records-dialog").close());
  document.querySelector("#records-dialog").addEventListener("click", (event) => {
    if (event.target.id === "records-dialog") event.target.close();
  });
  document.querySelector("#dialog-search").addEventListener("input", () => renderRecords(true));
  document.querySelector("#dialog-confidence").addEventListener("change", () => renderRecords(true));
  document.querySelector("#load-more-records").addEventListener("click", () => renderRecords());
  document.querySelector("#copy-urls").addEventListener("click", async () => {
    const urls = filteredSelectedRecords().map((record) => record.presentation_url).filter(Boolean).join("\n");
    await navigator.clipboard.writeText(urls);
    document.querySelector("#copy-urls").textContent = "Copied";
    setTimeout(() => {
      document.querySelector("#copy-urls").textContent = "Copy URLs";
    }, 1200);
  });
}

function markLoaded() {
  document.querySelector("#dashboard-loading")?.setAttribute("hidden", "");
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-loaded");
}

async function start() {
  wireDialog();
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`Failed to load ${DATA_URL}`);
  app.payload = validatePayload(await response.json());
  app.records = app.payload.records;
  app.recordById = new Map(app.records.map((record) => [record.uid, record]));
  renderAll();
  requestAnimationFrame(markLoaded);
}

start().catch((error) => {
  document.body.classList.remove("is-loading");
  document.body.classList.add("has-load-error");
  document.querySelector("#dashboard-loading")?.setAttribute("hidden", "");
  document.querySelector(".dashboard-shell").insertAdjacentHTML(
    "afterbegin",
    `<section class="insight-box"><h2>Unable to load synthesis data</h2><p>${escapeHtml(error.message)}</p></section>`,
  );
});
