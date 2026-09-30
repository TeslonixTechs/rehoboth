(() => {
  const config = window.REHOBOTH || { business: {}, properties: [] };
  const properties = Array.isArray(config.properties) ? config.properties : [];
  const byId = (id) => document.getElementById(id);
  const cleanNumber = (value) => String(value || "").replace(/\D/g, "");
  const whatsapp = cleanNumber(config.business.whatsappNumber);
  const phone = cleanNumber(config.business.phoneNumber || config.business.whatsappNumber);
  const toast = byId("toast");
  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3800);
  };

  const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  const formatPrice = (property) => {
    if (property.priceText) return escapeHtml(property.priceText);
    if (typeof property.price !== "number") return "Price on request";
    const value = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(property.price);
    return `₦${value}${property.pricePeriod ? ` / ${escapeHtml(property.pricePeriod)}` : ""}`;
  };

  const setEnquiryLinks = () => {
    document.querySelectorAll(".js-whatsapp").forEach((link) => {
      if (whatsapp) {
        link.href = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello Rehoboth Homes, I would like to enquire about your properties.")}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      } else {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          showToast("WhatsApp contact details will be added by Rehoboth Homes.");
        });
      }
    });
    const social = byId("social-link");
    if (social && config.business.xAccountUrl) {
      social.href = config.business.xAccountUrl;
      social.hidden = false;
    }
  };

  const cardMarkup = (property, index) => {
    const image = Array.isArray(property.images) && property.images[0] ? property.images[0] : "";
    const imageMarkup = image
      ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(property.imageAlt || property.title)}" loading="lazy">`
      : "";
    const location = [property.location, property.area].filter(Boolean).map(escapeHtml).join(" · ");
    return `<article class="property-card" style="animation-delay:${Math.min(index, 6) * 45}ms">
      <a href="?property=${encodeURIComponent(property.id)}" aria-label="View ${escapeHtml(property.title)}">
        <div class="property-image">${imageMarkup}<span class="property-status">${escapeHtml(property.availability || property.status || "Ask for availability")}</span></div>
      </a>
      <div class="property-body"><p class="property-location">${location || "Osogbo, Osun State"}</p>
        <h3>${escapeHtml(property.title)}</h3><p class="property-type">${escapeHtml(property.type || "Property")}${property.size ? ` · ${escapeHtml(property.size)}` : ""}</p>
        <p class="property-description">${escapeHtml(property.summary || property.description || "Contact Rehoboth for property details and current availability.")}</p>
        <div class="property-card-bottom"><span class="property-price">${formatPrice(property)}</span><a class="property-link" href="?property=${encodeURIComponent(property.id)}">View property <span aria-hidden="true">↗</span></a></div>
      </div></article>`;
  };

  const renderListings = () => {
    const grid = byId("property-grid");
    if (!grid) return;
    const locationQuery = (byId("filter-location")?.value || "").trim().toLowerCase();
    const type = byId("filter-type")?.value || "";
    const status = byId("filter-status")?.value || "";
    const [minText, maxText] = (byId("filter-price")?.value || "-").split("-");
    const min = minText ? Number(minText) : 0;
    const max = maxText ? Number(maxText) : Infinity;
    const filtered = properties.filter((property) => {
      const searchableLocation = `${property.location || ""} ${property.area || ""}`.toLowerCase();
      const propertyStatus = property.status || property.availability || "";
      const numericPrice = typeof property.price === "number" ? property.price : null;
      return (!locationQuery || searchableLocation.includes(locationQuery))
        && (!type || property.type === type || (type === "Houses" && property.type === "House") || (type === "Rentals" && propertyStatus === "For Rent"))
        && (!status || propertyStatus === status)
        && (!byId("filter-price")?.value || (numericPrice !== null && numericPrice >= min && numericPrice <= max));
    });
    const selectedCategory = document.querySelector(".category-chip.is-active")?.dataset.category || "";
    const categoryResults = selectedCategory
      ? filtered.filter((property) => property.type === selectedCategory || (selectedCategory === "Houses" && property.type === "House") || (selectedCategory === "Rentals" && (property.status || property.availability) === "For Rent"))
      : filtered;
    grid.innerHTML = categoryResults.map(cardMarkup).join("");
    const hasAnyFilter = Boolean(locationQuery || type || status || byId("filter-price")?.value || selectedCategory);
    byId("catalogue-empty").hidden = properties.length > 0 || hasAnyFilter;
    byId("no-results").hidden = !(properties.length > 0 && categoryResults.length === 0);
    byId("results-count").textContent = properties.length ? `${categoryResults.length} ${categoryResults.length === 1 ? "property" : "properties"}${hasAnyFilter ? " found" : " listed"}` : "Property listings updated by Rehoboth Homes";
  };

  const detailMarkup = (property) => {
    const images = (property.images || []).filter(Boolean).slice(0, 3);
    const gallery = images.length
      ? `<div class="detail-gallery">${images.map((image, index) => `<img src="${escapeHtml(image)}" alt="${escapeHtml((property.imageAlt || property.title) + (index ? `, image ${index + 1}` : ""))}" ${index ? "loading=\"lazy\"" : "fetchpriority=\"high\""}>`).join("")}</div>`
      : "";
    const facts = [
      ["Property type", property.type],
      ["Property size", property.size],
      ["Availability", property.status || property.availability]
    ].filter(([, value]) => value);
    const features = (property.features || []).map((feature) => `<li>${escapeHtml(feature)}</li>`).join("");
    const landmarks = (property.landmarks || []).map((landmark) => `<li>${escapeHtml(landmark)}</li>`).join("");
    const address = [property.location, property.area].filter(Boolean).map(escapeHtml).join(" · ");
    return `<article class="detail-page">
      <a class="back-link" href="./#properties"><span aria-hidden="true">←</span> All properties</a>
      ${gallery}
      <div class="detail-layout"><div class="detail-main">
        <p class="eyebrow">${escapeHtml(property.type || "PROPERTY OPPORTUNITY")}</p>
        <div class="detail-title-row"><h1>${escapeHtml(property.title)}</h1><span class="detail-price">${formatPrice(property)}</span></div>
        <div class="detail-meta"><span>${address || "Osogbo, Osun State"}</span><span>${escapeHtml(property.status || property.availability || "Ask for availability")}</span></div>
        <p class="detail-description">${escapeHtml(property.description || property.summary || "Contact Rehoboth Homes & Estate Management for further property information.")}</p>
        ${facts.length ? `<dl class="detail-facts">${facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>` : ""}
        ${features ? `<section class="detail-copy-section"><h2>Key features</h2><ul>${features}</ul></section>` : ""}
        ${landmarks ? `<section class="detail-copy-section"><h2>Nearby landmarks</h2><ul>${landmarks}</ul></section>` : ""}
        <section class="detail-copy-section"><h2>Documentation</h2><p class="detail-unverified">${property.documentation ? escapeHtml(property.documentation) : "Documentation details have not been provided. Ask Rehoboth for the current documentation status and arrange an independent review before proceeding."}</p></section>
      </div><aside class="detail-sidebar"><h2>Arrange a conversation</h2><p>Ask about current availability, property details or an inspection.</p>
        <a class="button button-primary js-whatsapp" href="#contact">Enquire on WhatsApp <span aria-hidden="true">↗</span></a>
        <a class="button button-quiet" href="./?inspection=${encodeURIComponent(property.id)}#contact">Request an inspection <span aria-hidden="true">↗</span></a>
        ${phone ? `<a class="button button-quiet" href="tel:+${phone}">Call Rehoboth <span aria-hidden="true">↗</span></a>` : ""}
        <p class="detail-unverified">Inspection dates and details are confirmed directly with Rehoboth.</p>
        <button class="detail-share" id="share-property" type="button">Share this property ↗</button>
      </aside></div></article>`;
  };

  const renderDetail = (id) => {
    const property = properties.find((item) => String(item.id) === id);
    const content = byId("page-content");
    if (!content) return;
    if (!property) {
      content.innerHTML = `<section class="detail-page detail-not-found"><p class="eyebrow">PROPERTY NOT FOUND</p><h1>This listing is not available here.</h1><p>Check the property link or return to the catalogue for current listings.</p><a class="button button-primary" href="./#properties">Back to properties <span aria-hidden="true">↗</span></a></section>`;
      return;
    }
    content.innerHTML = detailMarkup(property);
    document.title = `${property.title} | Rehoboth Homes & Estate Management`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = `${property.title} in ${property.location || "Osogbo"}. Enquire about this property with Rehoboth Homes & Estate Management.`;
    setEnquiryLinks();
    byId("share-property")?.addEventListener("click", async () => {
      const shareData = { title: property.title, text: `View ${property.title} with Rehoboth Homes & Estate Management`, url: location.href };
      try {
        if (navigator.share) await navigator.share(shareData);
        else {
          await navigator.clipboard.writeText(location.href);
          showToast("Property link copied.");
        }
      } catch (error) {
        if (error.name !== "AbortError") showToast("Copy this page link to share the property.");
      }
    });
  };

  document.querySelector(".menu-toggle")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const nav = byId("site-nav");
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    button.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
    nav?.classList.toggle("is-open", !expanded);
  });
  document.querySelectorAll(".site-nav a").forEach((link) => link.addEventListener("click", () => {
    byId("site-nav")?.classList.remove("is-open");
    document.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
  }));

  document.querySelector("#property-search")?.addEventListener("submit", (event) => {
    event.preventDefault();
    renderListings();
  });
  ["filter-location", "filter-type", "filter-price", "filter-status"].forEach((id) => {
    byId(id)?.addEventListener("input", renderListings);
    byId(id)?.addEventListener("change", renderListings);
  });
  document.querySelectorAll(".category-chip").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll(".category-chip").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderListings();
  }));
  byId("clear-filters")?.addEventListener("click", () => {
    byId("property-search")?.reset();
    document.querySelectorAll(".category-chip").forEach((item) => item.classList.toggle("is-active", !item.dataset.category));
    renderListings();
  });
  byId("inspection-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (!whatsapp) {
      byId("form-feedback").textContent = "WhatsApp contact details are not configured yet. Please contact Rehoboth directly to submit this request.";
      return;
    }
    const values = new FormData(form);
    const message = [
      "Hello Rehoboth Homes & Estate Management, I would like to request a property inspection.",
      `Name: ${values.get("name")}`,
      `Phone / WhatsApp: ${values.get("phone")}`,
      `Property: ${values.get("property")}`,
      values.get("date") ? `Preferred date: ${values.get("date")}` : "",
      values.get("message") ? `Message: ${values.get("message")}` : ""
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    byId("form-feedback").textContent = "Your inspection request is ready in WhatsApp. Send it there to complete your enquiry.";
  });

  byId("year").textContent = new Date().getFullYear();
  setEnquiryLinks();
  const propertyId = new URLSearchParams(location.search).get("property");
  if (propertyId) renderDetail(propertyId);
  else {
    renderListings();
    const inspectionId = new URLSearchParams(location.search).get("inspection");
    const inspectionProperty = properties.find((item) => String(item.id) === inspectionId);
    if (inspectionProperty && byId("inspection-property")) byId("inspection-property").value = inspectionProperty.title;
  }
  if (location.hash === "#contact") byId("inspection-property")?.focus({ preventScroll: true });
})();