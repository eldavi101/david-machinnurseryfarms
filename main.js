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
