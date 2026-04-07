/**
 * latest-posts.js
 * Carga los últimos 3 artículos desde data/blog-posts.json
 * y los renderiza en la sección "Últimos Artículos y Reseñas" del index.html.
 */
(function () {
  "use strict";

  var grid = document.getElementById("latest-posts-grid");
  if (!grid) return;

  function esc(str) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(str || ""));
    return d.innerHTML;
  }

  function escAttr(str) {
    return esc(str).replace(/"/g, "&quot;");
  }

  fetch("data/blog-posts.json")
    .then(function (res) {
      if (!res.ok) throw new Error("No se pudo cargar blog-posts.json");
      return res.json();
    })
    .then(function (posts) {
      // Ordenar por fecha descendente y tomar los últimos 3
      posts.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
      var latest = posts.slice(0, 3);

      if (latest.length === 0) return;

      var html = "";
      latest.forEach(function (p) {
        html +=
          '<div class="col-xl-4 col-lg-6" data-cue="slideInUp">' +
          '  <div class="blog-card style-2">' +
          '    <div class="blog-img">' +
          '      <a href="' + escAttr(p.url) + '">' +
          '        <img src="' + escAttr(p.image) + '" alt="' + escAttr(p.title) + '">' +
          "      </a>" +
          "    </div>" +
          '    <div class="blog-content">' +
          '      <div class="blog-meta">' +
          '        <a href="blog.html"><i class="fas fa-calendar"></i>' + esc(p.date_display) + "</a>" +
          '        <a href="blog.html"><i class="fas fa-tag"></i>' + esc(p.category) + "</a>" +
          "      </div>" +
          '      <h3 class="box-title"><a href="' + escAttr(p.url) + '">' + esc(p.title) + "</a></h3>" +
          '      <div class="btn-wrap">' +
          '        <a href="' + escAttr(p.url) + '" class="link-btn th-btn-icon">Leer Más</a>' +
          "      </div>" +
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
      console.error("[latest-posts]", err);
    });
})();
