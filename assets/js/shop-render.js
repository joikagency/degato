/**
 * shop-render.js
 * Lee data/products.json y renderiza las product cards en shop.html.
 * Incluye filtros por categoría y búsqueda simple.
 */
(function () {
  "use strict";

  // --- DOM ---
  var grid = document.getElementById("products-grid");
  if (!grid) return;

  var emptyMsg = document.getElementById("products-empty");
  var countEl = document.getElementById("products-count");
  var categoryBtns = document.querySelectorAll(".category-filter-tags a");

  // --- Category labels ---
  var categoryLabels = {
    alimentacion: "Alimentación",
    juguetes: "Juguetes",
    rascadores: "Rascadores",
    camas: "Camas y Descanso",
    salud: "Salud e Higiene",
    accesorios: "Accesorios"
  };

  // --- State ---
  var allProducts = [];
  var activeCategory = "";

  // --- Read category from URL ---
  function getCategoryFromURL() {
    var params = new URLSearchParams(window.location.search);
    return params.get("cat") || "";
  }

  // --- Fetch products.json ---
  function loadProducts() {
    fetch("data/products.json")
      .then(function (res) {
        if (!res.ok) throw new Error("No se pudo cargar products.json");
        return res.json();
      })
      .then(function (data) {
        allProducts = data.filter(function (p) { return p.show_in_shop; });
        activeCategory = getCategoryFromURL();
        highlightCategory(activeCategory);
        renderProducts();
      })
      .catch(function (err) {
        console.error("[shop-render]", err);
        grid.innerHTML =
          '<div class="col-12 text-center py-5">' +
          '<p class="text-muted">No se pudieron cargar los productos. Intentá recargar la página.</p>' +
          "</div>";
      });
  }

  // --- Render ---
  function renderProducts() {
    var filtered = allProducts;

    if (activeCategory) {
      filtered = filtered.filter(function (p) {
        return p.category === activeCategory;
      });
    }

    // Update count
    if (countEl) {
      countEl.textContent = filtered.length + " producto" + (filtered.length !== 1 ? "s" : "");
    }

    // Empty state
    if (filtered.length === 0) {
      grid.innerHTML = "";
      if (emptyMsg) emptyMsg.style.display = "block";
      return;
    }
    if (emptyMsg) emptyMsg.style.display = "none";

    var html = "";
    filtered.forEach(function (p) {
      var ratingPercent = p.rating ? (p.rating / 5) * 100 : 80;
      var ratingVal = p.rating ? p.rating.toFixed(2) : "4.00";
      var tagHtml = p.tag
        ? '<span class="product-tag">' + esc(p.tag) + "</span>"
        : "";
      var catLabel = categoryLabels[p.category] || p.category || "";
      var aff = escAttr(p.affiliate_url);
      var relAttr = 'target="_blank" rel="nofollow noopener noreferrer"';

      html +=
        '<div class="col-xl-3 col-lg-4 col-md-6" data-cue="slideInUp">' +
        '  <div class="th-product product-grid">' +
        '    <div class="product-img">' +
        '      <a href="' + aff + '" ' + relAttr + '>' +
        '        <img src="' + escAttr(p.image_url) + '" alt="' + escAttr(p.title) + '">' +
        "      </a>" +
        tagHtml +
        "    </div>" +
        '    <div class="product-content">' +
        '      <span class="product-category">' + esc(catLabel) + "</span>" +
        '      <h3 class="product-title"><a href="' + aff + '" ' + relAttr + '>' + esc(p.title) + "</a></h3>" +
        '      <div class="star-rating" role="img" aria-label="' + ratingVal + ' de 5 estrellas">' +
        '        <span style="width: ' + ratingPercent + '%;">Rated <strong class="rating">' + ratingVal + "</strong> out of 5</span>" +
        "      </div>" +
        '      <a href="' + aff + '" class="th-btn style-border2 th-btn-sm" ' + relAttr + '>' +
        '        <i class="fab fa-amazon me-2"></i>Ver en Amazon' +
        "      </a>" +
        "    </div>" +
        "  </div>" +
        "</div>";
    });

    grid.innerHTML = html;

    // Re-init scrollCue if available (for animations)
    if (typeof scrollCue !== "undefined" && scrollCue.init) {
      scrollCue.init();
    }
  }

  // --- Highlight active category ---
  function highlightCategory(cat) {
    categoryBtns.forEach(function (btn) {
      btn.classList.remove("active");
      var href = btn.getAttribute("href") || "";
      if (cat && href.indexOf("cat=" + cat) > -1) {
        btn.classList.add("active");
      } else if (!cat && (href === "shop.html" || href.indexOf("?") === -1)) {
        btn.classList.add("active");
      }
    });
  }

  // --- Category click (SPA-style, no page reload) ---
  categoryBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var href = this.getAttribute("href") || "";
      var catMatch = href.match(/cat=([^&]+)/);
      activeCategory = catMatch ? catMatch[1] : "";

      // Update URL without reload
      var qs = activeCategory ? "?cat=" + activeCategory : "";
      history.replaceState(null, "", "shop.html" + qs);

      highlightCategory(activeCategory);
      renderProducts();
    });
  });

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

  // --- Start ---
  loadProducts();
})();
