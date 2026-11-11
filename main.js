document.documentElement.classList.add("js");

// First-party counter: only our server receives an anonymous session ID.
async function updateVisitCounter() {
  const node = document.getElementById("visit-count");
  if (!node) return;
  const spanish = document.documentElement.lang === "es";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    let session;
    try { session = sessionStorage.getItem("mnf:session"); } catch (_) { /* Storage may be blocked. */ }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(session || "")) {
      session = crypto.randomUUID();
      try { sessionStorage.setItem("mnf:session", session); } catch (_) { /* Count per page if storage is blocked. */ }
    }
    // The server deduplicates this ID atomically, including retries after timeouts.
    const response = await fetch("/api/visits", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session }),
      credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", signal: controller.signal,
    });
    if (!response.ok) throw new Error("Counter unavailable");
    const payload = await response.json();
    const value = payload.count;
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
