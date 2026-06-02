const DATA_URL = "assets/data/presentations-index.json?v=ecfs";
const PAGE_SIZE = 120;

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

const termGroups = {
  modulators: ["cftr modulator", "modulator therapy", "modulators", "eti", "elexacaftor", "tezacaftor", "ivacaftor", "kaftrio", "trikafta", "lumacaftor", "vanzacaftor", "deutivacaftor"],
  infection: ["infection", "infective", "antimicrobial", "antibiotic", "colonisation", "colonization", "microbiology", "biofilm", "resistance", "exacerbation"],
  pseudomonas: ["pseudomonas", "p. aeruginosa", "aeruginosa", " pa "],
  ntm: ["non-tuberculous mycobacter", "nontuberculous mycobacter", "ntm", "mycobacterium abscessus", "m. abscessus"],
  inflammation: ["inflammation", "inflammatory", "neutrophil", "immune", "immunity", "immunology", "cytokine"],
  geneTherapy: ["gene therapy", "gene editing", "gene correction", "mrna", "messenger rna", "lentiviral", "vector", "base editing", "prime editing", "antisense"],
  diagnostics: ["newborn screening", "screening", "diagnosis", "diagnostic", "sweat chloride", "genotype", "variant", "cfspid", "cftr-related disorder"],
  lungFunction: ["fev1", "ppfev1", "fvc", "lung function", "spirometry", "lci", "lung clearance index", "multiple breath washout", "ct scan", "computed tomography", "imaging"],
  nutrition: ["nutrition", "nutritional", "pancreatic", "gastrointestinal", "gi ", "bmi", "weight", "diet", "vitamin", "enzyme", "pancreatitis"],
  mentalHealth: ["mental health", "anxiety", "depression", "psychological", "psychosocial", "quality of life", "qol", "cfq-r", "patient-reported"],
  physiotherapy: ["physiotherapy", "airway clearance", "exercise", "physical activity", "rehabilitation", "pep", "cpap", "mucus clearance"],
  adherence: ["adherence", "treatment burden", "self-management", "engagement", "therapy burden", "patient burden"],
  rwe: ["real-world", "real world", "registry", "cohort", "retrospective", "observational", "database", "survey"],
  digital: ["artificial intelligence", "machine learning", "deep learning", "digital health", "algorithm", "remote monitoring", "telemedicine", "wearable", "app "],
  pediatrics: ["infant", "child", "children", "paediatric", "pediatric", "adolescent", "newborn", "neonate"],
  advancedDisease: ["transplant", "advanced lung disease", "respiratory failure", "oxygen", "ventilation", "end-stage", "palliative"],
};

const chartDefinitions = {
  paradigm: [
    ["CFTR Modulators", termGroups.modulators],
    ["Infection and Exacerbations", termGroups.infection],
    ["Physiotherapy and Exercise", termGroups.physiotherapy],
    ["Diagnostics and Screening", termGroups.diagnostics],
    ["Lung Function and Imaging", termGroups.lungFunction],
    ["Nutrition and GI", termGroups.nutrition],
    ["Mental Health and QoL", termGroups.mentalHealth],
    ["Adherence and Treatment Burden", termGroups.adherence],
    ["Real-World Evidence", termGroups.rwe],
    ["AI and Digital Health", termGroups.digital],
  ],
  modalities: [
    ["Gene Therapy", termGroups.geneTherapy],
    ["mRNA / RNA Therapy", ["mrna", "messenger rna", "rna therapy", "antisense", "oligonucleotide"]],
    ["Gene Editing", ["gene editing", "base editing", "prime editing", "crispr", "gene correction"]],
    ["Organoids / Nasal Cells", ["organoid", "nasal epithelial", "epithelial cell", "spheroid", "patient-derived"]],
    ["Theratyping", ["theratyping", "theratype", "functional assay", "personalised medicine", "personalized medicine"]],
    ["Microbiome", ["microbiome", "microbiota", "metagenomic"]],
    ["Remote Monitoring", ["remote monitoring", "telemedicine", "digital health", "wearable", "home monitoring"]],
    ["Advanced Imaging", ["ct scan", "mri", "imaging", "radiology", "computed tomography"]],
  ],
  therapies: [
    ["Elexacaftor/Tezacaftor/Ivacaftor", ["elexacaftor", "tezacaftor", "ivacaftor", "eti", "kaftrio", "trikafta"]],
    ["Ivacaftor", ["ivacaftor", "kalydeco"]],
    ["Lumacaftor/Ivacaftor", ["lumacaftor", "orkambi"]],
    ["Vanzacaftor/Tezacaftor/Deutivacaftor", ["vanzacaftor", "deutivacaftor", "alyftrek"]],
    ["Dornase Alfa", ["dornase", "pulmozyme"]],
    ["Hypertonic Saline", ["hypertonic saline", "3% saline", "7% saline"]],
    ["Tobramycin", ["tobramycin"]],
    ["Aztreonam", ["aztreonam"]],
    ["Colistin", ["colistin", "colistimethate"]],
    ["CFTR Correctors/Potentiators", ["corrector", "potentiator", "amplifier"]],
  ],
  pathogens: [
    ["Pseudomonas aeruginosa", termGroups.pseudomonas],
    ["Staphylococcus aureus", ["staphylococcus aureus", "s. aureus", "mrsa", "mssa"]],
    ["Burkholderia cepacia complex", ["burkholderia", "cepacia"]],
    ["Aspergillus", ["aspergillus", "abpa"]],
    ["Non-tuberculous mycobacteria", termGroups.ntm],
    ["Achromobacter", ["achromobacter"]],
    ["Haemophilus influenzae", ["haemophilus", "h. influenzae"]],
    ["Stenotrophomonas", ["stenotrophomonas"]],
    ["Candida / Fungal", ["candida", "fungal", "mycology"]],
  ],
  markers: [
    ["CFTR", ["cftr"]],
    ["F508del", ["f508del", "delta f508", "phe508del"]],
    ["Sweat chloride", ["sweat chloride"]],
    ["FEV1 / ppFEV1", ["fev1", "ppfev1"]],
    ["LCI", ["lci", "lung clearance index"]],
    ["BMI / weight", ["bmi", "weight"]],
    ["CRP", ["crp", "c-reactive protein"]],
    ["Elastase", ["elastase"]],
    ["IRT / Trypsin", ["immunoreactive trypsin", "irt", "trypsin"]],
    ["Microbiome", ["microbiome", "microbiota"]],
  ],
  emerging: [
    ["Rare variants", ["rare variant", "rare cftr", "variant of varying", "vvcc", "class i", "nonsense mutation"]],
    ["CFSPID / CRMS", ["cfspid", "crms"]],
    ["Theratyping", ["theratyping", "functional assay", "patient-derived"]],
    ["Organoids", ["organoid", "intestinal organoid", "nasal organoid"]],
    ["Gene replacement", ["gene replacement", "gene addition", "lentiviral vector"]],
    ["Antisense / RNA", ["antisense", "oligonucleotide", "mrna", "rna"]],
    ["Microbiome dynamics", ["microbiome", "metagenomic", "microbiota"]],
    ["Digital biomarkers", ["digital biomarker", "wearable", "remote monitoring"]],
  ],
  study: [
    ["Clinical trial", ["clinical trial", "trial", "phase 1", "phase i", "phase 2", "phase ii", "phase 3", "phase iii"]],
    ["Randomised", ["randomised", "randomized", "randomization", "randomisation"]],
    ["Prospective", ["prospective"]],
    ["Retrospective", ["retrospective"]],
    ["Registry / Real-world", termGroups.rwe],
    ["Survey / Interview", ["survey", "questionnaire", "interview", "qualitative"]],
  ],
  endpoints: [
    ["FEV1 / ppFEV1", ["fev1", "ppfev1"]],
    ["LCI", ["lci", "lung clearance index"]],
    ["Sweat chloride", ["sweat chloride"]],
    ["Exacerbations", ["exacerbation", "pulmonary exacerbation"]],
    ["BMI / nutrition", ["bmi", "weight", "nutrition"]],
    ["QoL / PRO", ["quality of life", "qol", "patient-reported", "cfq-r"]],
    ["Adherence", ["adherence"]],
    ["Hospitalisation", ["hospitalisation", "hospitalization", "admission"]],
  ],
  populations: [
    ["Children / adolescents", termGroups.pediatrics],
    ["Adults", ["adult", "adults"]],
    ["Older adults", ["older adult", "ageing", "aging", "elderly"]],
    ["Pregnancy / fertility", ["pregnancy", "pregnant", "fertility", "reproductive"]],
    ["Advanced disease", termGroups.advancedDisease],
    ["Transplant", ["transplant"]],
  ],
  care: [
    ["Pulmonology", ["pulmonary", "lung", "airway", "respiratory", "pulmonology"]],
    ["Microbiology", ["microbiology", "pathogen", "infection", "pseudomonas", "mycobacter"]],
    ["CFTR Biology", ["cftr", "variant", "genotype", "modulator"]],
    ["Physiotherapy", termGroups.physiotherapy],
    ["Nutrition / GI", termGroups.nutrition],
    ["Psychosocial Care", termGroups.mentalHealth],
    ["Nursing / Service Delivery", ["nurse", "nursing", "service delivery", "care model", "multidisciplinary"]],
    ["Registry / Epidemiology", ["registry", "epidemiology", "cohort", "population"]],
  ],
};

const app = {
  records: [],
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

function displayLabel(value) {
  return String(value ?? "").replace(/\s+-\s+/g, ": ");
}

function ensureLabelTooltip() {
  let tooltip = document.querySelector("#label-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "label-tooltip";
    tooltip.className = "label-tooltip";
    tooltip.hidden = true;
    document.body.append(tooltip);
  }
  return tooltip;
}

function positionLabelTooltip(tooltip, target) {
  const rect = target.getBoundingClientRect();
  tooltip.style.left = `${Math.min(window.innerWidth - tooltip.offsetWidth - 12, Math.max(12, rect.left))}px`;
  tooltip.style.top = `${Math.max(12, rect.top - tooltip.offsetHeight - 8)}px`;
}

function showLabelTooltip(target) {
  const text = target.dataset.fullLabel;
  const isTruncated = target.scrollWidth > target.clientWidth + 1;
  if (!text || !isTruncated) {
    hideLabelTooltip();
    return;
  }
  const tooltip = ensureLabelTooltip();
  tooltip.textContent = text;
  tooltip.hidden = false;
  positionLabelTooltip(tooltip, target);
}

function hideLabelTooltip() {
  const tooltip = document.querySelector("#label-tooltip");
  if (!tooltip) return;
  tooltip.hidden = true;
}

function numberFormat(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function textFor(record) {
  if (!record._intelText) {
    const rawText = [
      record.display_code,
      record.code,
      record.title,
      record.summary,
      record.authors_text,
      record.affiliations_text,
      record.presenter,
      record.presenter_role,
      record.family,
      record.structure,
      record.session_type,
      record.track,
      record.session_title,
      record.session_code,
      record.room,
      Object.keys(record.sections || {}).join(" "),
      Object.values(record.sections || {}).join(" "),
    ]
      .join(" ")
      .toLowerCase();
    record._intelText = rawText;
    record._tokenText = ` ${rawText.replace(/[^a-z0-9]+/g, " ")} `;
  }
  return record._intelText;
}

function matchTerms(record, terms) {
  const haystack = textFor(record);
  const tokenHaystack = record._tokenText;
  return terms.some((term) => {
    const needle = term.toLowerCase().trim();
    if (needle.length <= 3 && /^[a-z0-9]+$/.test(needle)) {
      return tokenHaystack.includes(` ${needle} `);
    }
    return haystack.includes(needle);
  });
}

function recordsForTerms(terms) {
  return app.records.filter((record) => matchTerms(record, terms));
}

function groupRecords(records, keyFn) {
  const grouped = new Map();
  records.forEach((record) => {
    const key = keyFn(record) || "Unspecified";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(record);
  });
  return [...grouped.entries()].map(([label, group]) => ({ label, records: group }));
}

function countData(definitions) {
  return definitions.map(([label, terms]) => ({ label, terms, records: recordsForTerms(terms) }));
}

function sourceLabel(record) {
  return [
    record.display_code,
    record.presenter,
    record.family,
    record.session_type,
    displayLabel(record.track),
    record.session_date,
  ]
    .filter(Boolean)
    .join(" / ");
}

function openRecords(kind, label, records) {
  app.selectedRecords = [...records].sort((a, b) =>
    String(a.display_code || a.presentation_id).localeCompare(String(b.display_code || b.presentation_id), undefined, { numeric: true }),
  );
  app.rendered = 0;
  document.querySelector("#dialog-kind").textContent = kind;
  document.querySelector("#dialog-title").textContent = displayLabel(label);
  document.querySelector("#dialog-summary").textContent = `${numberFormat(app.selectedRecords.length)} matching records. Each row links to the ECFS source page.`;
  document.querySelector("#dialog-search").value = "";
  renderRecords(true);
  document.querySelector("#records-dialog").showModal();
}

function filteredSelectedRecords() {
  const query = document.querySelector("#dialog-search").value.trim().toLowerCase();
  if (!query) return app.selectedRecords;
  const terms = query.split(/\s+/).filter(Boolean);
  return app.selectedRecords.filter((record) => terms.every((term) => textFor(record).includes(term)));
}

function renderRecords(reset = false) {
  if (reset) app.rendered = 0;
  const list = document.querySelector("#records-list");
  const records = filteredSelectedRecords();
  app.rendered = Math.min(records.length, app.rendered + PAGE_SIZE);
  list.innerHTML = records
    .slice(0, app.rendered)
    .map(
      (record) => `
        <li>
          <a class="record-title" href="${escapeHtml(record.presentation_url)}" target="_blank" rel="noopener">${escapeHtml(record.title || "Untitled record")}</a>
          <div class="record-meta">${escapeHtml(sourceLabel(record))}</div>
          <p class="record-summary">${escapeHtml(record.summary || "No abstract text was extracted for this programme record.")}</p>
          <a class="record-url" href="${escapeHtml(record.presentation_url)}" target="_blank" rel="noopener">${escapeHtml(record.presentation_url)}</a>
        </li>
      `,
    )
    .join("");
  const loadMore = document.querySelector("#load-more-records");
  loadMore.hidden = app.rendered >= records.length;
  loadMore.textContent = `Load more (${numberFormat(records.length - app.rendered)} remaining)`;
}

function kpiButton(label, records, className) {
  const button = document.createElement("button");
  button.className = `kpi kpi-${className}`;
  button.type = "button";
  button.innerHTML = `<div class="num">${numberFormat(records.length)}</div><div class="label">${escapeHtml(label)}</div>`;
  button.addEventListener("click", () => openRecords("Metric", label, records));
  return button;
}

function renderKpis() {
  const structured = app.records.filter((record) => record.has_structured_sections);
  const sourceLinked = app.records.filter((record) => record.presentation_url);
  const oralFeatured = app.records.filter((record) => ["Opening Plenary", "Closing Plenary", "Symposium", "Workshop", "Special Symposium"].includes(record.session_type));
  const grid = document.querySelector("#kpi-grid");
  grid.innerHTML = "";
  grid.append(
    kpiButton("Total records", app.records, "blue"),
    kpiButton("Structured abstracts", structured, "purple"),
    kpiButton("Featured oral sessions", oralFeatured, "cyan"),
    kpiButton("CFTR modulators", recordsForTerms(termGroups.modulators), "green"),
    kpiButton("Infection and microbiology", recordsForTerms(termGroups.infection), "amber"),
    kpiButton("Source-linked records", sourceLinked, "red"),
  );
}

function renderInsights() {
  const insights = [
    ["CFTR modulator era shapes a broad share of ECFS 2026", recordsForTerms(termGroups.modulators)],
    ["Infection, microbiology, and exacerbation work remains a central research axis", recordsForTerms(termGroups.infection)],
    ["Pseudomonas aeruginosa is the dominant named pathogen signal", recordsForTerms(termGroups.pseudomonas)],
    ["Physiotherapy, airway clearance, and exercise continue to anchor care delivery", recordsForTerms(termGroups.physiotherapy)],
    ["Screening, genotype, and variant interpretation remain prominent translational themes", recordsForTerms(termGroups.diagnostics)],
    ["Gene therapy, RNA, and organoid methods define the advanced-modality edge", recordsForTerms([...termGroups.geneTherapy, "organoid", "theratyping"])],
  ];
  document.querySelector("#insight-list").innerHTML = insights
    .map(
      ([label, records], index) => `
        <li><button type="button" data-insight="${index}"><strong>${escapeHtml(label)}</strong>: ${numberFormat(records.length)} matching records</button></li>
      `,
    )
    .join("");
  document.querySelector("#insight-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-insight]");
    if (!button) return;
    const [label, records] = insights[Number(button.dataset.insight)];
    openRecords("Insight", label, records);
  });
}

function renderBarList(id, points, kind) {
  const max = Math.max(...points.map((point) => point.records.length), 1);
  const container = document.querySelector(`#${id}`);
  container.innerHTML = "";
  points.forEach((point, index) => {
    const button = document.createElement("button");
    const label = displayLabel(point.label);
    button.className = "bar-item";
    button.type = "button";
    button.setAttribute("aria-label", `${label}: ${numberFormat(point.records.length)} matching records`);
    button.innerHTML = `
      <span class="name" data-full-label="${escapeHtml(label)}">${escapeHtml(label)}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${Math.max(2, (point.records.length / max) * 100).toFixed(1)}%; background:${palette[index % palette.length]}"></span></span>
      <span class="val">${numberFormat(point.records.length)}</span>
    `;
    const name = button.querySelector(".name");
    name.addEventListener("mouseenter", () => showLabelTooltip(name));
    name.addEventListener("mouseleave", hideLabelTooltip);
    button.addEventListener("focus", () => showLabelTooltip(name));
    button.addEventListener("blur", hideLabelTooltip);
    button.addEventListener("click", () => openRecords(kind, point.label, point.records));
    container.append(button);
  });
}

function chartClickHandler(points, kind) {
  return (_event, elements) => {
    if (!elements.length) return;
    const point = points[elements[0].index];
    openRecords(kind, point.label, point.records);
  };
}

function renderChart(canvasId, type, points, kind, extra = {}) {
  const ctx = document.getElementById(canvasId);
  const chart = new Chart(ctx, {
    type,
    data: {
      labels: points.map((point) => displayLabel(point.label)),
      datasets: [
        {
          label: "Matching records",
          data: points.map((point) => point.records.length),
          backgroundColor: points.map((_, index) => palette[index % palette.length]),
          borderColor: type === "polarArea" ? "#d9d9d9" : "transparent",
          borderWidth: type === "polarArea" || type === "doughnut" ? 1 : 0,
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
            label: (context) => `${context.label}: ${numberFormat(context.parsed.y ?? context.parsed.x ?? context.parsed)} records`,
          },
        },
      },
      scales: type === "doughnut" || type === "polarArea" ? undefined : {
        x: { grid: { color: extra.indexAxis === "y" ? "#ebeceb" : "transparent" }, ticks: { color: "#68717c", font: { size: 10 } } },
        y: { grid: { color: extra.indexAxis === "y" ? "transparent" : "#ebeceb" }, ticks: { color: "#68717c", font: { size: 10 } } },
      },
    },
  });
  app.charts.push(chart);
  attachPointButtons(canvasId, points, kind);
}

function attachPointButtons(canvasId, points, kind) {
  const card = document.getElementById(canvasId).closest(".card");
  const oldPills = card.querySelector(".point-pills");
  if (oldPills) oldPills.remove();
  const pills = document.createElement("div");
  pills.className = "point-pills";
  pills.setAttribute("aria-label", `${kind} data point record links`);
  points.forEach((point) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${displayLabel(point.label)} (${numberFormat(point.records.length)})`;
    button.addEventListener("click", () => openRecords(kind, point.label, point.records));
    pills.append(button);
  });
  card.append(pills);
}

function renderPlenary() {
  const featured = [
    ...app.records.filter((record) => record.session_type === "Opening Plenary"),
    ...app.records.filter((record) => record.session_type === "Closing Plenary"),
    ...app.records.filter((record) => record.session_type === "Special Symposium"),
  ];
  const points = groupRecords(featured, (record) => record.session_title || record.session_type);
  const colorsForItems = [colors.amber, colors.purple, colors.blue, colors.cyan, colors.green, colors.red];
  const container = document.querySelector("#plenary-list");
  container.innerHTML = "";
  points.forEach((point, index) => {
    const button = document.createElement("button");
    button.className = "plenary-item";
    button.type = "button";
    button.style.borderLeftColor = colorsForItems[index % colorsForItems.length];
    button.innerHTML = `
      <h3>${escapeHtml(displayLabel(point.label))}</h3>
      <div class="tag-row">
        <span class="tag">${numberFormat(point.records.length)} matching records</span>
        <span class="tag">Click to view URLs</span>
      </div>
    `;
    button.addEventListener("click", () => openRecords("Featured session", point.label, point.records));
    container.append(button);
  });
}

function renderThemeCards() {
  const cards = [
    ["CFTR Modulator Era", recordsForTerms(termGroups.modulators), "Treatment optimization, burden, safety, access, and post-modulator clinical change."],
    ["Infection and Microbiology", recordsForTerms(termGroups.infection), "Pathogen dynamics, antimicrobial strategies, resistance, biofilm, and exacerbation work."],
    ["Advanced Therapies", recordsForTerms([...termGroups.geneTherapy, "organoid", "theratyping"]), "Gene therapy, RNA, organoid, and functional-assay approaches."],
  ];
  const container = document.querySelector("#theme-cards");
  container.innerHTML = "";
  cards.forEach(([label, records, description]) => {
    const button = document.createElement("button");
    button.className = "theme-card";
    button.type = "button";
    button.innerHTML = `<h3>${escapeHtml(label)}</h3><div class="big">${numberFormat(records.length)}</div><p>${escapeHtml(description)}</p>`;
    button.addEventListener("click", () => openRecords("Theme", label, records));
    container.append(button);
  });
}

function wireDialog() {
  document.querySelector(".dialog-close").addEventListener("click", () => document.querySelector("#records-dialog").close());
  document.querySelector("#records-dialog").addEventListener("click", (event) => {
    if (event.target.id === "records-dialog") event.target.close();
  });
  document.querySelector("#dialog-search").addEventListener("input", () => renderRecords(true));
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

function renderAll() {
  app.charts.forEach((chart) => chart.destroy());
  app.charts = [];
  renderKpis();
  renderInsights();
  renderChart("sessionChart", "doughnut", groupRecords(app.records, (record) => record.session_type), "Session type");
  const tracks = groupRecords(app.records.filter((record) => record.track && !["All", "Unspecified"].includes(record.track)), (record) => record.track)
    .sort((a, b) => b.records.length - a.records.length)
    .slice(0, 12);
  renderBarList("trackBars", tracks, "Track");
  renderPlenary();
  renderChart("paradigmChart", "bar", countData(chartDefinitions.paradigm), "Paradigm", { indexAxis: "y" });
  renderChart("modalityChart", "bar", countData(chartDefinitions.modalities), "Modality", { indexAxis: "y" });
  renderBarList("therapyBars", countData(chartDefinitions.therapies).sort((a, b) => b.records.length - a.records.length), "Therapy");
  renderBarList("pathogenBars", countData(chartDefinitions.pathogens).sort((a, b) => b.records.length - a.records.length), "Pathogen");
  renderChart("markerChart", "polarArea", countData(chartDefinitions.markers), "Marker");
  renderBarList("emergingBars", countData(chartDefinitions.emerging).sort((a, b) => b.records.length - a.records.length), "Emerging target");
  renderChart("studyChart", "doughnut", countData(chartDefinitions.study), "Study design");
  renderChart("endpointChart", "bar", countData(chartDefinitions.endpoints), "Endpoint");
  renderChart("populationChart", "bar", countData(chartDefinitions.populations), "Population");
  renderThemeCards();
  renderChart("careChart", "bar", countData(chartDefinitions.care), "Care domain");
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
  const data = await response.json();
  app.records = data.presentations || [];
  renderAll();
  requestAnimationFrame(markLoaded);
}

start().catch((error) => {
  document.body.classList.remove("is-loading");
  document.body.classList.add("has-load-error");
  document.querySelector("#dashboard-loading")?.setAttribute("hidden", "");
  document.querySelector(".dashboard-shell").insertAdjacentHTML(
    "afterbegin",
    `<section class="insight-box"><h2>Unable to load dashboard data</h2><p>${escapeHtml(error.message)}</p></section>`,
  );
});
