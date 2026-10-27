"use strict";

(() => {
  const config = window.LION_SITE_CONFIG || {};
  const menuToggle = document.getElementById("menu-toggle");
  const navigation = document.getElementById("site-nav");
  const setMenu = (isOpen) => {
    navigation.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "關閉導覽選單" : "開啟導覽選單");
  };
  menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuToggle.focus();
    }
  });
  window.matchMedia("(min-width: 621px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });

  const email = typeof config.email === "string" ? config.email.trim() : "";
  if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
    const href = `mailto:${encodeURIComponent(email).replace(/%40/g, "@")}`;
    const contact = document.getElementById("contact-email");
    contact.href = href;
    contact.hidden = false;
    document.getElementById("contact-pending").hidden = true;
    document.getElementById("company-note").hidden = true;
    const field = document.getElementById("company-email");
    const link = document.createElement("a");
    link.href = href;
    link.textContent = email;
    field.replaceChildren(link);
    field.classList.remove("pending-value");
  }
  for (const [key, fieldName] of [["phone", "phone"], ["address", "address"], ["taxId", "tax"]]) {
    const value = typeof config[key] === "string" ? config[key].trim() : "";
    if (value) {
      document.getElementById(`company-${fieldName}`).textContent = value;
      document.getElementById(`company-${fieldName}-row`).hidden = false;
    }
  }
  document.getElementById("preview-note").hidden = config.preview === false;
  if (email) document.querySelector(".preview-note-detail").textContent = "公司形象網站";
  document.getElementById("year").textContent = String(new Date().getFullYear());

  if ("IntersectionObserver" in window) {
    const links = [...navigation.querySelectorAll("a")];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          if (link.getAttribute("href") === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-15% 0px -65% 0px", threshold: 0 });
    document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
  }
})();
