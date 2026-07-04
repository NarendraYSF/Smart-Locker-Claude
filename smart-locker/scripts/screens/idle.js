// Idle screen: ambient welcome, two giant CTAs.

import { h, icon } from "../utils/dom.js";
import { navigate } from "../app.js";

export function mount(stage) {
  const root = h(
    "section.idle.stagger",
    {},
    h(
      "div.idle__hero",
      {},
      h(
        "div",
        {},
        h(
          "p.idle__eyebrow",
          {},
          h("span.idle__eyebrow-line", {}),
          "Loker Pintar \u00B7 FST UIN Jakarta"
        ),
        h(
          "h1.idle__headline",
          {},
          "Ruang ",
          h("em", {}, "aman"),
          " untuk dokumen, surat, dan paket Anda."
        ),
        h(
          "p.idle__sub",
          {},
          "Akses cepat bagi Dosen dan Tenaga Kependidikan. Penitipan surat dan paket dari kurir tanpa menunggu penerima."
        )
      ),
      h(
        "div.idle__aside",
        {},
        h(
          "div.idle__aside-row",
          {},
          h("span.idle__aside-label", {}, "Lokasi"),
          h("span", {}, "Gedung Dekanat FST \u00B7 Lt. 1, dekat Sekretariat")
        ),
        h(
          "div.idle__aside-row",
          {},
          h("span.idle__aside-label", {}, "Jam Layanan"),
          h("span", {}, "Senin\u2013Jumat, 07.30\u201319.00 WIB")
        ),
        h(
          "div.idle__aside-row",
          {},
          h("span.idle__aside-label", {}, "Total Loker"),
          h("span.mono", {}, "48 unit \u00B7 3 ukuran")
        )
      )
    ),

    h(
      "div.idle__cta-row",
      {},
      h(
        "button.idle__cta.idle__cta--primary",
        { type: "button", onclick: () => navigate("tap-card") },
        h("span.idle__cta-number", {}, "01 \u00B7 Untuk Staf"),
        h(
          "h2.idle__cta-title",
          {},
          "Staf ",
          h("em", {}, "Akademik")
        ),
        h(
          "p.idle__cta-sub",
          {},
          "Dekatkan kartu identitas UIN untuk membuka loker atau mengambil kiriman Anda."
        ),
        h(
          "div.idle__cta-foot",
          {},
          h("span", {}, "Tap Kartu RFID"),
          iconArrow()
        )
      ),
      h(
        "button.idle__cta.idle__cta--gold",
        { type: "button", onclick: () => navigate("courier-search") },
        h("span.idle__cta-number", {}, "02 \u00B7 Untuk Tamu & Kurir"),
        h(
          "h2.idle__cta-title",
          {},
          "Kirim ",
          h("em", {}, "Surat"),
          " atau Paket"
        ),
        h(
          "p.idle__cta-sub",
          {},
          "Titipkan kiriman untuk Dosen atau Tendik. Sistem akan memilih loker yang sesuai secara otomatis."
        ),
        h(
          "div.idle__cta-foot",
          {},
          h("span", {}, "Pilih Penerima"),
          iconArrow()
        )
      )
    )
  );

  stage.appendChild(root);
}

function iconArrow() {
  return icon("arrowRight", { className: "idle__cta-arrow" });
}
