/**
 * shop-details.js
 * Lee el parámetro ?slug= de la URL, busca el producto en data/products.json
 * y rellena dinámicamente la ficha de producto en shop-details.html.
 * También renderiza productos relacionados (misma categoría) en el slider.
 */
(function () {
  "use strict";

  // --- Category labels ---
  var categoryLabels = {
    alimentacion: "Alimentación",
    juguetes: "Juguetes",
    rascadores: "Rascadores",
    camas: "Camas y Descanso",
    salud: "Salud e Higiene",
    accesorios: "Accesorios"
  };

  // --- DOM refs ---
  var detailSection = document.getElementById("product-detail-section");
  if (!detailSection) return;

  var notFoundEl = document.getElementById("product-not-found");

  // --- Get slug from URL ---
  function getSlug() {
    var params = new URLSearchParams(window.location.search);
    return params.get("slug") || "";
  }

  // --- Escape helpers ---
  function esc(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str || ""));
    return div.innerHTML;
  }
  function escAttr(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // --- Fetch and render ---
  function init() {
    var slug = getSlug();
    if (!slug) {
      showNotFound();
      return;
    }

    fetch("data/products.json")
      .then(function (res) {
        if (!res.ok) throw new Error("No se pudo cargar products.json");
        return res.json();
      })
      .then(function (data) {
        var product = null;
        for (var i = 0; i < data.length; i++) {
          if (data[i].slug === slug) {
            product = data[i];
            break;
          }
        }
        if (!product) {
          showNotFound();
          return;
        }
        renderProduct(product);
        renderRelated(data, product);
      })
      .catch(function (err) {
        console.error("[shop-details]", err);
        showNotFound();
      });
  }

  // --- Show not found ---
  function showNotFound() {
    detailSection.style.display = "none";
    if (notFoundEl) notFoundEl.style.display = "block";
  }

  // --- Render product detail ---
  function renderProduct(p) {
    var catLabel = categoryLabels[p.category] || p.category || "";
    var ratingPercent = p.rating ? (p.rating / 5) * 100 : 80;
    var ratingVal = p.rating ? p.rating.toFixed(2) : "4.00";
    var catUrl = "shop.html?cat=" + encodeURIComponent(p.category);

    // Title (page + breadcrumb)
    document.title = p.title + " — De Gato | Reseña y Opinión";
    var breadcrumbDetail = document.getElementById("breadcrumb-detail");
    if (breadcrumbDetail) breadcrumbDetail.textContent = p.title;
    var breadcrumbTitle = document.getElementById("breadcrumb-title");
    if (breadcrumbTitle) breadcrumbTitle.textContent = p.title;

    // Image
    var imgEl = document.getElementById("detail-img");
    if (imgEl) {
      imgEl.src = p.image_url;
      imgEl.alt = p.title;
    }

    // Tag
    var tagEl = document.getElementById("detail-tag");
    if (tagEl) {
      if (p.tag) {
        tagEl.textContent = p.tag;
        tagEl.style.display = "inline-block";
      } else {
        tagEl.style.display = "none";
      }
    }

    // Category badge
    var catBadge = document.getElementById("detail-category");
    if (catBadge) {
      catBadge.textContent = catLabel;
    }

    // Title
    var titleEl = document.getElementById("detail-title");
    if (titleEl) titleEl.textContent = p.title;

    // Rating
    var ratingBar = document.getElementById("detail-rating-bar");
    if (ratingBar) ratingBar.style.width = ratingPercent + "%";
    var ratingNum = document.getElementById("detail-rating-num");
    if (ratingNum) ratingNum.textContent = ratingVal;

    // Description
    var descEl = document.getElementById("detail-description");
    if (descEl) descEl.textContent = p.description;

    // Amazon CTA (main)
    var ctaMain = document.getElementById("detail-cta-main");
    if (ctaMain) ctaMain.href = p.affiliate_url;

    // Amazon CTA (tab)
    var ctaTab = document.getElementById("detail-cta-tab");
    if (ctaTab) ctaTab.href = p.affiliate_url;

    // Category meta link
    var catMeta = document.getElementById("detail-cat-link");
    if (catMeta) {
      catMeta.textContent = catLabel;
      catMeta.href = catUrl;
    }

    // Tag meta
    var tagMeta = document.getElementById("detail-tag-meta");
    if (tagMeta) {
      if (p.tag) {
        tagMeta.textContent = p.tag;
        tagMeta.href = catUrl;
      } else {
        tagMeta.parentElement.style.display = "none";
      }
    }
  }

  // --- Render related products slider ---
  function renderRelated(allProducts, current) {
    var container = document.getElementById("related-slides");
    if (!container) return;

    var related = allProducts.filter(function (p) {
      return p.show_in_shop && p.slug !== current.slug && p.category === current.category;
    });

    // If less than 3, fill with other products
    if (related.length < 3) {
      var others = allProducts.filter(function (p) {
        return p.show_in_shop && p.slug !== current.slug && p.category !== current.category;
      });
      related = related.concat(others).slice(0, 6);
    }

    if (related.length === 0) {
      var relatedSection = document.getElementById("related-section");
      if (relatedSection) relatedSection.style.display = "none";
      return;
    }

    var html = "";
    related.forEach(function (p) {
      var catLabel = categoryLabels[p.category] || p.category || "";
      var ratingPercent = p.rating ? (p.rating / 5) * 100 : 80;
      var ratingVal = p.rating ? p.rating.toFixed(2) : "4.00";
      var tagHtml = p.tag
        ? '<span class="product-tag">' + esc(p.tag) + "</span>"
        : "";
      var detailUrl = "shop-details.html?slug=" + encodeURIComponent(p.slug);

      html +=
        '<div class="swiper-slide">' +
        '  <div class="th-product product-grid">' +
        '    <div class="product-img">' +
        '      <a href="' + escAttr(detailUrl) + '">' +
        '        <img src="' + escAttr(p.image_url) + '" alt="' + escAttr(p.title) + '">' +
        "      </a>" +
        tagHtml +
        "    </div>" +
        '    <div class="product-content">' +
        '      <span class="product-category">' + esc(catLabel) + "</span>" +
        '      <h3 class="product-title"><a href="' + escAttr(detailUrl) + '">' + esc(p.title) + "</a></h3>" +
        '      <div class="star-rating" role="img" aria-label="' + ratingVal + ' de 5 estrellas">' +
        '        <span style="width: ' + ratingPercent + '%;">Rated <strong class="rating">' + ratingVal + "</strong> out of 5</span>" +
        "      </div>" +
        '      <a href="' + escAttr(p.affiliate_url) + '" class="th-btn style-border2 th-btn-sm" target="_blank" rel="nofollow noopener">' +
        '        <i class="fab fa-amazon me-2"></i>Ver en Amazon' +
        "      </a>" +
        "    </div>" +
        "  </div>" +
        "</div>";
    });

    container.innerHTML = html;

    // Re-init Swiper for related products
    if (typeof Swiper !== "undefined") {
      new Swiper("#productSlider1", {
        slidesPerView: 1,
        spaceBetween: 24,
        breakpoints: {
          576: { slidesPerView: 2 },
          768: { slidesPerView: 2 },
          992: { slidesPerView: 3 },
          1200: { slidesPerView: 3 }
        },
        navigation: {
          nextEl: '[data-slider-next="#productSlider1"]',
          prevEl: '[data-slider-prev="#productSlider1"]'
        }
      });
    }
  }

  // --- Start ---
  init();
})();
