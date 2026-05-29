const DATA_URL = "assets/data/presentations-index.json?v=ecfs";
const INITIAL_LIMIT = 80;
const LIMIT_STEP = 80;

const state = {
  data: null,
  query: "",
  family: "",
  sessionType: "",
  track: "",
  structure: "",
  sort: "relevance",
  visibleLimit: INITIAL_LIMIT,
};

const elements = {};

function text(value) {
  return value == null ? "" : String(value);
}

function escapeHtml(value) {
  return text(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function numberFormat(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function optionLabel(item) {
  return `${item.name} (${numberFormat(item.count)})`;
}

function breakableLabel(value) {
  return escapeHtml(value).replaceAll("/", "/<wbr>").replaceAll("-", "-<wbr>");
}

function initElements() {
  elements.search = document.querySelector("#search");
  elements.familyFilter = document.querySelector("#family-filter");
  elements.sessionFilter = document.querySelector("#session-filter");
  elements.trackFilter = document.querySelector("#track-filter");
  elements.structureFilter = document.querySelector("#structure-filter");
  elements.sortFilter = document.querySelector("#sort-filter");
  elements.clearFilters = document.querySelector("#clear-filters");
  elements.resultCount = document.querySelector("#result-count");
  elements.results = document.querySelector("#results");
  elements.loadMore = document.querySelector("#load-more");
  elements.trackList = document.querySelector("#track-list");
  elements.sessionList = document.querySelector("#session-list");
  elements.dialog = document.querySelector("#abstract-dialog");
  elements.dialogContent = document.querySelector("#dialog-content");
}

function populateSelect(select, items) {
  const options = items
    .map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(optionLabel(item))}</option>`)
    .join("");
  select.insertAdjacentHTML("beforeend", options);
}

function populateStats(data) {
  const structuredCount = data.presentations.filter((record) => record.has_structured_sections).length;
  const sourceUrlCount = data.presentations.filter((record) => record.presentation_url && record.session_url).length;
  document.querySelector('[data-stat="records"]').textContent = numberFormat(data.record_count);
  document.querySelector('[data-stat="abstracts"]').textContent = numberFormat(data.unique_abstract_count);
  document.querySelector('[data-stat="structured"]').textContent = numberFormat(structuredCount);
  document.querySelector('[data-stat="source-urls"]').textContent = numberFormat(sourceUrlCount);
}

function renderAnalytics(list, items, maxItems = 12) {
  list.innerHTML = items
    .slice(0, maxItems)
    .map(
      (item) => `
        <li>
          <button class="topic-card-link analytics-button" type="button" data-filter-value="${escapeHtml(item.name)}">
            <span class="topic-card-title">${breakableLabel(item.name)}</span>
            <span class="topic-card-meta">${numberFormat(item.count)} records</span>
          </button>
        </li>
      `,
    )
    .join("");
}

function recordMatches(record) {
  if (state.family && record.family !== state.family) return false;
  if (state.sessionType && record.session_type !== state.sessionType) return false;
  if (state.track && record.track !== state.track) return false;
  if (state.structure && record.structure !== state.structure) return false;
  if (!state.query) return true;
  const terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!record._searchText) {
    record._searchText = [
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
  }
  return terms.every((term) => record._searchText.includes(term));
}

function compareRecords(a, b) {
  const collator = new Intl.Collator("en-US", { numeric: true, sensitivity: "base" });
  if (state.sort === "title") return collator.compare(a.title, b.title);
  if (state.sort === "code") return collator.compare(a.display_code, b.display_code);
  if (state.sort === "session") return collator.compare(a.session_type, b.session_type) || collator.compare(a.title, b.title);
  if (state.sort === "track") return collator.compare(a.track, b.track) || collator.compare(a.title, b.title);
  if (state.sort === "date") {
    return (
      collator.compare(a.session_date, b.session_date) ||
      collator.compare(a.session_time, b.session_time) ||
      collator.compare(a.display_code, b.display_code)
    );
  }
  return 0;
}

function metadata(record) {
  return [
    record.display_code,
    record.presenter,
    record.presenter_role,
    record.family,
    record.session_type,
    record.track,
    record.session_date,
    record.session_time,
    record.room,
    record.structure,
  ].filter(Boolean);
}

function renderRecord(record) {
  const parts = metadata(record);
  return `
    <li>
      <article class="document-row-link abstract-row">
        <div class="document-row-chip">${escapeHtml(record.family)}</div>
        <div class="document-row-body">
          <h3 class="document-row-title">${escapeHtml(record.title || "Untitled record")}</h3>
          <p class="document-row-meta">
            ${parts.map((part) => `<span>${escapeHtml(part)}</span>`).join("")}
          </p>
          <p class="abstract-summary">${escapeHtml(record.summary || "No abstract text was extracted for this programme record.")}</p>
          <div class="abstract-actions">
            <button class="button button-primary" type="button" data-uid="${escapeHtml(record.uid)}">View details</button>
            ${record.presentation_url ? `<a class="button button-secondary" href="${escapeHtml(record.presentation_url)}" target="_blank" rel="noopener">View ECFS source</a>` : ""}
          </div>
        </div>
      </article>
    </li>
  `;
}

function filteredRecords() {
  return state.data.presentations.filter(recordMatches).sort(compareRecords);
}

function renderResults() {
  const records = filteredRecords();
  const visible = records.slice(0, state.visibleLimit);
  elements.resultCount.textContent = `${numberFormat(records.length)} matching record${records.length === 1 ? "" : "s"}`;
  elements.results.innerHTML = visible.map(renderRecord).join("");
  elements.loadMore.hidden = records.length <= state.visibleLimit;
  elements.loadMore.textContent = `Load ${numberFormat(Math.min(LIMIT_STEP, records.length - state.visibleLimit))} more`;
}

function syncStateFromControls() {
  state.query = elements.search.value.trim();
  state.family = elements.familyFilter.value;
  state.sessionType = elements.sessionFilter.value;
  state.track = elements.trackFilter.value;
  state.structure = elements.structureFilter.value;
  state.sort = elements.sortFilter.value;
  state.visibleLimit = INITIAL_LIMIT;
  renderResults();
}

function clearFilters() {
  elements.search.value = "";
  elements.familyFilter.value = "";
  elements.sessionFilter.value = "";
  elements.trackFilter.value = "";
  elements.structureFilter.value = "";
  elements.sortFilter.value = "relevance";
  syncStateFromControls();
}

function sectionMarkup(record) {
  const entries = Object.entries(record.sections || {});
  if (!entries.length) {
    return '<p class="lead">No structured abstract sections were extracted for this programme record.</p>';
  }
  return entries
    .map(
      ([label, value]) => `
        <section class="abstract-section">
          <h3>${escapeHtml(label)}</h3>
          <p>${escapeHtml(value)}</p>
        </section>
      `,
    )
    .join("");
}

function missingSectionNote(record) {
  const missing = record.missing_sections || [];
  if (!missing.length) return "";
  return `
    <p class="table-note">
      Parser status: ${escapeHtml(record.parse_status || "unknown")}. Missing structured section labels: ${missing.map(escapeHtml).join(", ")}.
    </p>
  `;
}

function sourceList(record) {
  return `
    <section class="source-list" aria-labelledby="sources-heading">
      <h2 id="sources-heading">Source links</h2>
      <ul>
        ${record.presentation_url ? `<li><a href="${escapeHtml(record.presentation_url)}" target="_blank" rel="noopener">Presentation detail page</a></li>` : ""}
        ${record.session_url ? `<li><a href="${escapeHtml(record.session_url)}" target="_blank" rel="noopener">Session detail page</a></li>` : ""}
      </ul>
    </section>
  `;
}

function openDetail(uid) {
  const record = state.data.presentations.find((item) => item.uid === uid);
  if (!record) return;
  const parts = metadata(record);
  elements.dialogContent.innerHTML = `
    <header class="document-header dialog-header">
      <p class="eyebrow">${escapeHtml(record.session_title || "ECFS 2026")}</p>
      <h1 id="dialog-title">${escapeHtml(record.title || "Untitled record")}</h1>
      <dl class="metadata">
        ${parts
          .map(
            (part) => `
              <div>
                <dt>Record</dt>
                <dd>${escapeHtml(part)}</dd>
              </div>
            `,
          )
          .join("")}
        ${record.abstract_id ? `<div><dt>Abstract ID</dt><dd>${escapeHtml(record.abstract_id)}</dd></div>` : ""}
        <div><dt>Presentation ID</dt><dd>${escapeHtml(record.presentation_id)}</dd></div>
      </dl>
      <div class="document-actions">
        ${record.presentation_url ? `<a class="button button-primary" href="${escapeHtml(record.presentation_url)}" target="_blank" rel="noopener">View ECFS source</a>` : ""}
        <a class="button button-secondary download-link" href="ecfs_2026_conference_presentations.json" download>
          <svg class="download-icon" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 2.5v9m0 0 3.5-3.5M10 11.5 6.5 8M4 14.5v2h12v-2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Download JSON
        </a>
        <a class="button button-secondary download-link" href="assets/data/ecfs_2026_conference_presentations.md" download>
          <svg class="download-icon" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 2.5v9m0 0 3.5-3.5M10 11.5 6.5 8M4 14.5v2h12v-2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Download Markdown
        </a>
      </div>
    </header>
    <div class="content abstract-detail-content">
      ${record.authors_text ? `<p class="author-line">${escapeHtml(record.authors_text)}</p>` : ""}
      ${record.affiliations_text ? `<p class="affiliation-line">${escapeHtml(record.affiliations_text)}</p>` : ""}
      ${sectionMarkup(record)}
      ${missingSectionNote(record)}
      ${sourceList(record)}
    </div>
  `;
  elements.dialog.showModal();
}

function bindEvents() {
  elements.search.addEventListener("input", syncStateFromControls);
  elements.familyFilter.addEventListener("change", syncStateFromControls);
  elements.sessionFilter.addEventListener("change", syncStateFromControls);
  elements.trackFilter.addEventListener("change", syncStateFromControls);
  elements.structureFilter.addEventListener("change", syncStateFromControls);
  elements.sortFilter.addEventListener("change", syncStateFromControls);
  elements.clearFilters.addEventListener("click", clearFilters);
  elements.loadMore.addEventListener("click", () => {
    state.visibleLimit += LIMIT_STEP;
    renderResults();
  });
  elements.results.addEventListener("click", (event) => {
    const button = event.target.closest("[data-uid]");
    if (button) openDetail(button.dataset.uid);
  });
  elements.dialog.addEventListener("click", (event) => {
    if (event.target === elements.dialog || event.target.closest(".dialog-close")) {
      elements.dialog.close();
    }
  });
  elements.trackList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter-value]");
    if (!button) return;
    elements.trackFilter.value = button.dataset.filterValue;
    syncStateFromControls();
    document.querySelector("#browse").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  elements.sessionList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter-value]");
    if (!button) return;
    elements.sessionFilter.value = button.dataset.filterValue;
    syncStateFromControls();
    document.querySelector("#browse").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

async function start() {
  initElements();
  bindEvents();
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Failed to load ${DATA_URL}`);
    state.data = await response.json();
    populateSelect(elements.familyFilter, state.data.families);
    populateSelect(elements.sessionFilter, state.data.session_types);
    populateSelect(elements.trackFilter, state.data.tracks);
    populateSelect(elements.structureFilter, state.data.structures);
    populateStats(state.data);
    renderAnalytics(elements.trackList, state.data.tracks);
    renderAnalytics(elements.sessionList, state.data.session_types, state.data.session_types.length);
    renderResults();
  } catch (error) {
    elements.resultCount.textContent = "Unable to load ECFS records.";
    elements.results.innerHTML = `<li><p>${escapeHtml(error.message)}</p></li>`;
  }
}

start();
