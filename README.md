# InWork — حوكمة العمالة الفنية (Proof of Concept / MVP)

**Live interactive preview / المعاينة الحية:** https://zopair.github.io/inwork-poc/

نموذج إثبات مفهوم تفاعلي لمنصة «إن وورك» لحوكمة العمالة الفنية، موجه للعرض على الشركات والمستثمرين والجهات الحكومية (B2G/B2B)، مع تطبيق عملي على منطقة التجمع الخامس بالقاهرة الجديدة.

> **تنبيه الشفافية:** كل ما في هذا النموذج محاكاة تفاعلية: العروض، بيانات الفنيين، شارة التحقق (B2G)، التتبع الحي، المدفوعات، والأرباح. لا يوجد أي اعتماد حكومي رسمي، ولا معاملات مالية فعلية، ولا إرسال رسائل حقيقي.

## المزايا

- خريطة تخطيطية جغرافية مبسطة مدمجة (SVG) تعمل بعد أول تحميل دون اتصال (عبر Service Worker يخزن الأصول الثابتة)، مبنية على بيانات OpenStreetMap (رخصة ODbL): هندسة الطرق الحقيقية المبسطة ومراكز أحياء مستنتجة من معالم OSM المسماة، مع طبقة بلاطات OpenStreetMap اختيارية (خدمة خارجية بأفضل جهد).
- مساران للعميل: التفاوض وعروض الأسعار (نمط إندرايف) والتسعير الفوري بالباقات (نمط أوبر/كريم)، مع مؤشر سعر عادل استرشادي.
- وضع فني: حالة توفر، عداد أرباح تجريبي بالجنيه المصري، قبول أو عرض مقابل.
- واجهة عربية RTL كاملة، Mobile-first، بخط IBM Plex Sans Arabic مستضاف محلياً.

## المصادر المفتوحة والتراخيص

- [Leaflet](https://github.com/Leaflet/Leaflet) 1.9.4 — ترخيص BSD-2-Clause.
- [IBM Plex Sans Arabic](https://github.com/IBM/plex) — رخصة الخطوط المفتوحة SIL OFL 1.1 (انظر `FONT-LICENSE.txt`)، مستضاف محلياً بدلاً من Google Fonts لضمان عمل العرض دون اتصال.
- بيانات الخريطة الاختيارية: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL). مواقع المعالم مثبتة عبر خدمات تحديد مواقع عامة (23 نوفمبر 2026)؛ مسارات الطرق في الرسم التخطيطي مبسطة وتقريبية لغرض العرض.

## الملكية

Proof of Concept / MVP — المؤسس والمطور: Aly Hussein Zopair (علي حسين زبير ALY HUSSEIN ZOPAIR).


## Testing & Verification

This repository is a static HTML/CSS/JavaScript prototype. No automated test suite or repository-defined CI workflow is present in the current tree. The latest observed GitHub Pages deployment on 23 November 2026 succeeded: [run #45087794910](https://github.com/zopair/inwork-poc/actions/runs/45087794910).

Before any demonstration, manually verify the Arabic RTL layout, client/technician mode switching, both pricing paths, the schematic map offline, optional OpenStreetMap tile loading online, the simulated request/offer flow, and service-worker behavior after the first successful load. The current UI intentionally simulates technician verification, tracking, messages, wallet balance, payments, earnings, and order status; it does not send messages, move money, or track a real worker.

## Proof of Concept & Enterprise Customization Readiness

**Status: Interactive static PoC/MVP for a proposed technical-services governance workflow.** The client/technician UI, local map visualization, sample technician data, pricing simulations, and local offline asset cache are implemented. No government verification, live service dispatch, real tracking, payment settlement, user accounts, or backend persistence is connected.

| Area | Current state |
|---|---|
| Interactive client / technician modes | Implemented as local simulation |
| Negotiated offers and fixed packages | Simulated UI flows |
| Technician verification badge | Demo only; no official verification |
| Map and neighborhood data | Simplified embedded SVG based on OSM-derived data; optional external OSM tile layer |
| Live tracking / messaging | Not implemented; simulated only |
| Wallet / payments / earnings | Demo values only; no payment integration |
| Persistence | Static client-side app shell; no backend/account database |
| Automated tests / CI | No repository-defined test suite or workflow found |
| Deployment | GitHub Pages deployment observed successful on 23 November 2026 |
| Project license | No root `LICENSE` file present; font license is included, while the bundled Leaflet BSD-2-Clause notice should be verified and retained |

### Enterprise readiness gates

1. Define the verified technician onboarding, identity-check, dispute, and safety process.
2. Replace mock workers, prices, requests, and wallet data with consented, verified sources and a secure backend.
3. Implement server-authoritative order state, messaging, payments, refunds, and audit trails before describing them as real services.
4. Validate map-data provenance, OpenStreetMap attribution, tile usage terms, and geocoding accuracy.
5. Add browser tests, accessibility checks, and offline/online regression tests.
6. Add the missing project license and preserve the full Leaflet and IBM Plex Sans Arabic license notices.

## Intellectual Property & Authorship

Project authorship and attribution: **Aly Hussein Zopair (علي حسين زبير ALY HUSSEIN ZOPAIR)**.

This attribution does not relicense Leaflet, IBM Plex Sans Arabic, OpenStreetMap data, or any other third-party asset. Their original licenses and attribution obligations continue to apply.
