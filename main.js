document.documentElement.classList.add("js");

// A shared counter records sessions, not identifiable people. No private API keys.
async function updateVisitCounter() {
  const node = document.getElementById("visit-count");
  if (!node || !node.dataset.counterUrl) return;
  const spanish = document.documentElement.lang === "es";
  const endpoint = node.dataset.counterUrl;
  if (!/^https:\/\/api\.counterapi\.dev\/v2\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(endpoint)) return;
  // Preview builds and local QA must not inflate production statistics.
  if (!["www.machinnurseryfarms.com", "machinnurseryfarms.com"].includes(window.location.hostname)) {
    node.textContent = spanish ? "Vista previa (sin contar)" : "Preview (not counted)";
    return;
  }
  const key = "mnf:visit:" + endpoint;
  let counted = false;
  try { counted = sessionStorage.getItem(key) === "counted"; } catch (_) { /* Storage may be blocked. */ }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(endpoint + (counted ? "" : "/up"), {
      credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", signal: controller.signal,
    });
    if (!response.ok) throw new Error("Counter unavailable");
    // Mark a successful increment even if parsing fails; avoid incrementing twice.
    if (!counted) {
      try { sessionStorage.setItem(key, "counted"); } catch (_) { /* Count per page when storage is blocked. */ }
    }
    const payload = await response.json();
    const data = payload.data || payload;
    const value = data.value ?? (Number.isSafeInteger(data.up_count) && Number.isSafeInteger(data.down_count) ? data.up_count - data.down_count : undefined);
    if (!Number.isSafeInteger(value) || value < 0) throw new Error("Invalid counter response");
    node.textContent = new Intl.NumberFormat(spanish ? "es-US" : "en-US").format(value);
  } catch (_) {
    node.textContent = spanish ? "No disponible" : "Unavailable";
  } finally {
    clearTimeout(timeout);
  }
}
updateVisitCounter();

document.querySelectorAll("img[data-fallback-src]").forEach((image) => {
  image.addEventListener("error", () => {
    if (image.dataset.fallbackUsed) return;
    image.dataset.fallbackUsed = "true";
    image.src = image.dataset.fallbackSrc;
    image.classList.add("image-fallback");
  });
  if (image.complete && !image.naturalWidth) image.dispatchEvent(new Event("error"));
});

const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const menuToggle = document.getElementById("menu-toggle");
const siteNav = document.getElementById("site-nav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.focus();
    }
  });
  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const inquiryForm = document.querySelector("#inquiry-form");
if (inquiryForm) {
  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!inquiryForm.reportValidity()) return;
    const data = new FormData(inquiryForm);
    const spanish = document.documentElement.lang === "es";
    const message = [
      spanish ? "Consulta desde Machin Nursery Farms" : "Machin Nursery Farms website inquiry",
      `${spanish ? "Nombre" : "Name"}: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `${spanish ? "Teléfono" : "Phone"}: ${data.get("phone") || "—"}`,
      `${spanish ? "Tipo" : "Type"}: ${data.get("type")}`,
      String(data.get("message")),
    ].join("\n");
    const channel = data.get("channel");
    const destination = channel === "whatsapp"
      ? `https://wa.me/${inquiryForm.dataset.whatsapp}?text=${encodeURIComponent(message)}`
      : `mailto:${inquiryForm.dataset.email}?subject=${encodeURIComponent(spanish ? "Consulta de plantas" : "Plant inquiry")}&body=${encodeURIComponent(message)}`;
    // The visitor completes sending in the chosen application; never claim delivery.
    document.querySelector("#inquiry-status").textContent = spanish
      ? "Completa el envío en la aplicación que se abrirá. La web no ha enviado ni guardado tu consulta."
      : "Complete sending in the application that opens. The website has not sent or saved your inquiry.";
    if (channel === "whatsapp") {
      const opened = window.open(destination, "_blank", "noopener,noreferrer");
      void opened;
    } else {
      window.location.href = destination;
    }
    const fallback = document.querySelector("#inquiry-open");
    fallback.href = destination;
    fallback.hidden = false;
  });
}
