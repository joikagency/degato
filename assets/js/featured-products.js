/**
 * featured-products.js
 * Carga 4 productos variados desde products.json y los renderiza
 * en la sección de Productos Destacados del index.html.
 */
(function () {
  "use strict";

  var grid = document.getElementById("featured-products-grid");
  if (!grid) return;

  var categoryLabels = {
    alimentacion: "Alimentación",
    juguetes: "Juguetes",
    rascadores: "Rascadores",
    camas: "Camas y Descanso",
    salud: "Salud e Higiene",
    accesorios: "Accesorios"
  };

  function esc(str) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(str || ""));
    return d.innerHTML;
  }

  function escAttr(str) {
    return esc(str).replace(/"/g, "&quot;");
  }

  /**
   * Selecciona hasta 4 productos intentando variedad de categorías.
   */
  function pickFeatured(products) {
    var visible = products.filter(function (p) { return p.show_in_shop; });
    if (visible.length <= 4) return visible;

    var picked = [];
    var usedCats = {};

    // Primero uno por categoría distinta
    for (var i = 0; i < visible.length && picked.length < 4; i++) {
      if (!usedCats[visible[i].category]) {
        usedCats[visible[i].category] = true;
        picked.push(visible[i]);
      }
    }

    // Si faltan, completar con los que no se eligieron
    if (picked.length < 4) {
      for (var j = 0; j < visible.length && picked.length < 4; j++) {
        if (picked.indexOf(visible[j]) === -1) {
          picked.push(visible[j]);
        }
      }
    }

    return picked;
  }

  fetch("data/products.json")
    .then(function (res) {
      if (!res.ok) throw new Error("No se pudo cargar products.json");
      return res.json();
    })
    .then(function (data) {
      var featured = pickFeatured(data);
      var html = "";

      featured.forEach(function (p) {
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

      // Re-init scrollCue for animations
      if (typeof scrollCue !== "undefined" && scrollCue.init) {
        scrollCue.init();
      }
    })
    .catch(function (err) {
      console.error("[featured-products]", err);
    });
})();
