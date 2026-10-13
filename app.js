/*
Student Assistant — Dizayn galereyasi (Telegram Mini App)

Ishlash tartibi:
  1) designs.json dan dizaynlar yuklanadi
  2) Kategoriya chips'lar (Barchasi + turlar) render qilinadi
  3) Kartalar grid'i render qilinadi (rangli slide preview bilan)
  4) Kartaga bosish — tanlash, yana bosish — bekor qilish
  5) Tanlangan dizayn pastki panelda alohida ko'rinadi
  6) "Tanlash" bosilganda — Telegram.WebApp.sendData() orqali
     tanlov botga yuboriladi
*/

(function () {
  "use strict";

  var tg = (window.Telegram && window.Telegram.WebApp) || null;

  var state = {
    designs: [],
    categories: [],
    activeCategory: "all",
    search: "",
    selectedId: null,
  };

  // --- DOM ---
  var gridEl = document.getElementById("grid");
  var categoriesEl = document.getElementById("categories");
  var searchEl = document.getElementById("search");
  var emptyEl = document.getElementById("empty");
  var bottomBarEl = document.getElementById("bottom-bar");
  var bottomPreviewEl = document.getElementById("bottom-preview");
  var bottomNameEl = document.getElementById("bottom-name");
  var bottomDescEl = document.getElementById("bottom-desc");
  var selectBtnEl = document.getElementById("select-btn");

  // --- Yordamchilar ---

  function textColorFor(hex) {
    // Rang yorug'ligiga qarab matn rangi (oq yoki qora)
    var c = hex.replace("#", "");
    var r = parseInt(c.substr(0, 2), 16);
    var g = parseInt(c.substr(2, 2), 16);
    var b = parseInt(c.substr(4, 2), 16);
    var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#0f172a" : "#f8fafc";
  }

  function escapeHtml(str) {
    return String(str).replace(
      /[&<>"']/g,
      function (ch) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[ch];
      }
    );
  }

  function findDesign(id) {
    for (var i = 0; i < state.designs.length; i++) {
      if (state.designs[i].id === id) {
        return state.designs[i];
      }
    }
    return null;
  }

  // --- Render ---

  function renderCategories() {
    var counts = {};
    state.designs.forEach(function (d) {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });

    var html = "";
    state.categories.forEach(function (cat) {
      var count =
        cat.key === "all" ? state.designs.length : counts[cat.key] || 0;
      var active = cat.key === state.activeCategory ? " chip--active" : "";
      html +=
        '<button type="button" class="chip' +
        active +
        '" data-category="' +
        escapeHtml(cat.key) +
        '">' +
        escapeHtml(cat.label) +
        '<span class="chip__count">' +
        count +
        "</span></button>";
    });
    categoriesEl.innerHTML = html;
  }

  function cardHtml(design) {
    var selected = design.id === state.selectedId ? " card--selected" : "";
    var textColor = textColorFor(design.primary);
    var preview =
      '<div class="card__preview" style="background: linear-gradient(135deg, ' +
      design.primary +
      ", " +
      design.secondary +
      "); color: " +
      textColor +
      '">' +
      '<div class="card__preview-title" style="border-color: ' +
      design.accent +
      '">Sarlavha</div>' +
      '<div class="card__preview-bullet" style="background: ' +
      design.accent +
      '"></div>' +
      '<div class="card__preview-bullet card__preview-bullet--medium" style="background: ' +
      design.accent +
      '"></div>' +
      '<div class="card__preview-bullet card__preview-bullet--short" style="background: ' +
      design.accent +
      '"></div>' +
      '<div class="card__check">✓</div>' +
      "</div>";

    return (
      '<div class="card' +
      selected +
      '" data-id="' +
      escapeHtml(design.id) +
      '" role="button" tabindex="0">' +
      preview +
      '<div class="card__body">' +
      '<div class="card__name">' +
      escapeHtml(design.name) +
      "</div>" +
      '<div class="card__desc">' +
      escapeHtml(design.description) +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function renderGrid() {
    var query = state.search.trim().toLowerCase();
    var visible = state.designs.filter(function (d) {
      var inCategory =
        state.activeCategory === "all" || d.category === state.activeCategory;
      var inSearch =
        !query ||
        d.name.toLowerCase().indexOf(query) !== -1 ||
        d.description.toLowerCase().indexOf(query) !== -1;
      return inCategory && inSearch;
    });

    if (!visible.length) {
      gridEl.innerHTML = "";
      emptyEl.classList.remove("hidden");
      return;
    }
    emptyEl.classList.add("hidden");
    gridEl.innerHTML = visible.map(cardHtml).join("");
  }

  function updateBottomBar() {
    var design = findDesign(state.selectedId);
    if (!design) {
      bottomBarEl.classList.add("hidden");
      return;
    }
    bottomBarEl.classList.remove("hidden");
    bottomPreviewEl.style.background =
      "linear-gradient(135deg, " + design.primary + ", " + design.secondary + ")";
    bottomNameEl.textContent = design.name;
    bottomDescEl.textContent = design.description;
  }

  // --- Tanlash / bekor qilish ---

  function toggleSelect(id) {
    state.selectedId = state.selectedId === id ? null : id;
    renderGrid();
    updateBottomBar();
    updateMainButton();
  }

  function updateMainButton() {
    // Telegram Main Button (katta tugma)
    if (!tg || !tg.MainButton) {
      return;
    }
    var design = findDesign(state.selectedId);
    if (design) {
      tg.MainButton.setText("Tanlash: " + design.name);
      tg.MainButton.show();
    } else {
      tg.MainButton.hide();
    }
  }

  var isSent = false;

  function sendSelection() {
    // Telegram sendData'ni bir marta qabul qiladi — qayta yuborishga
    // urinib ko'rmaslik uchun himoya qo'yamiz.
    if (isSent) {
      return;
    }
    var design = findDesign(state.selectedId);
    if (!design) {
      return;
    }
    if (tg && typeof tg.sendData === "function") {
      isSent = true;
      try {
        if (tg.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred("success");
        }
      } catch (e) {
        /* haptic — ixtiyoriy */
      }
      try {
        // sendData() o'zi Web App'ni yopadi, qo'lda tg.close() kerak emas.
        tg.sendData(JSON.stringify({ design: design.name, id: design.id }));
      } catch (e) {
        isSent = false;
      }
    } else {
      // Telegram tashqarisida — nusxalab olish
      var text = "Tanlangan dizayn: " + design.name;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          selectBtnEl.textContent = "Nusxalandi ✓";
          setTimeout(function () {
            selectBtnEl.textContent = "Tanlash";
          }, 1500);
        });
      } else {
        window.alert(text);
      }
    }
  }

  // --- Eventlar ---

  categoriesEl.addEventListener("click", function (event) {
    var chip = event.target.closest(".chip");
    if (!chip) {
      return;
    }
    state.activeCategory = chip.getAttribute("data-category");
    renderCategories();
    renderGrid();
  });

  gridEl.addEventListener("click", function (event) {
    var card = event.target.closest(".card");
    if (!card) {
      return;
    }
    toggleSelect(card.getAttribute("data-id"));
  });

  gridEl.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    var card = event.target.closest(".card");
    if (!card) {
      return;
    }
    event.preventDefault();
    toggleSelect(card.getAttribute("data-id"));
  });

  searchEl.addEventListener("input", function () {
    state.search = searchEl.value;
    renderGrid();
  });

  selectBtnEl.addEventListener("click", sendSelection);

  // --- Init ---

  function init(data) {
    state.categories = data.categories;
    state.designs = data.designs;
    renderCategories();
    renderGrid();
    if (tg) {
      tg.ready();
      tg.expand();
      // Telegram'ning pastki ko'k tugmasi ("Tanlash: <nom>") — uni
      // bosilishida tanlov botga yuborilishi uchun handler ulanadi.
      if (tg.MainButton) {
        tg.MainButton.onClick(sendSelection);
      }
    }
  }

  fetch("designs.json")
    .then(function (resp) {
      if (!resp.ok) {
        throw new Error("designs.json yuklanmadi");
      }
      return resp.json();
    })
    .then(init)
    .catch(function () {
      gridEl.innerHTML =
        '<p class="empty">designs.json yuklanmadi — fayl bilan bir joyda joylashtiring.</p>';
    });
})();
