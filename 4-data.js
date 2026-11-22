/* InWork PoC — بيانات الخريطة والمحاكاة
 * مواقع المعالم أدناه مثبتة عبر خدمة تحديد مواقع جغرافية (Google Geocoding/Places)
 * بتاريخ 23 نوفمبر 2026. مسارات الطرق مرسومة كخطوط تخطيطية مبسطة للعرض فقط،
 * وليست هندسة طرق دقيقة. كافة بيانات الفنيين والأسعار والأرباح تجريبية (محاكاة).
 */

window.INWORK_DATA = {
  center: { lat: 30.0150, lng: 31.4250, zoom: 13 },
  // حدود الرسم التخطيطي
  svgBounds: { south: 29.985, west: 31.360, north: 30.110, east: 31.630 },

  // أحياء ومعالم (إحداثيات مثبتة)
  neighborhoods: [
    { id: 'nargis',       name: 'حي النرجس',              lat: 30.0098, lng: 31.4628 },
    { id: 'nargis-new',   name: 'النرجس الجديدة',          lat: 30.0085, lng: 31.4285 },
    { id: 'yasmine',      name: 'حي الياسمين',             lat: 30.0440, lng: 31.4513 },
    { id: 'banafseg',     name: 'حي البنفسج',              lat: 30.0480, lng: 31.4656 },
    { id: 'lotus',        name: 'حي اللوتس',               lat: 30.0258, lng: 31.5199 },
    { id: 'andalus',      name: 'حي الأندلس',              lat: 30.0726, lng: 31.4448 },
    { id: 'rehab',        name: 'مدينة الرحاب',            lat: 30.0646, lng: 31.4882 },
    { id: 'auc',          name: 'الجامعة الأمريكية AUC',   lat: 30.0190, lng: 31.5017 }
  ],

  // طرق رئيسية — خطوط تخطيطية مبسطة بين نقاط مثبتة/تقريبية
  roads: [
    { id: 's90',   name: 'شارع التسعين الجنوبي', kind: 'major',
      points: [[30.0045, 31.3920], [30.0122, 31.4430], [30.0165, 31.5100], [30.0180, 31.5450]] },
    { id: 'n90',   name: 'شارع التسعين الشمالي', kind: 'major',
      points: [[30.0175, 31.3950], [30.0217, 31.4214], [30.0280, 31.4700]] },
    { id: 'naguib', name: 'محور محمد نجيب', kind: 'axis',
      points: [[29.9950, 31.4715], [30.0286, 31.4748], [30.0620, 31.4775]] },
    { id: 'suez',  name: 'طريق السويس', kind: 'highway',
      points: [[30.0680, 31.3900], [30.0740, 31.4882], [30.0820, 31.5600]] },
    { id: 'ring',  name: 'الدائري الأوسطي', kind: 'highway',
      points: [[30.0080, 31.5990], [30.0450, 31.6067], [30.0820, 31.6140]] },
    { id: 'tantawy', name: 'محور المشير طنطاوي', kind: 'axis',
      points: [[30.0214, 31.3738], [30.0300, 31.3830], [30.0360, 31.3920]] }
  ],

  specialties: [
    { id: 'plumbing',  name: 'سباكة',         fairMin: 200, fairMax: 400 },
    { id: 'electric',  name: 'كهرباء',        fairMin: 180, fairMax: 350 },
    { id: 'ac',        name: 'تكييف',         fairMin: 250, fairMax: 500 },
    { id: 'carpentry', name: 'نجارة',         fairMin: 200, fairMax: 450 },
    { id: 'painting',  name: 'نقاشة',         fairMin: 150, fairMax: 300 },
    { id: 'appliance', name: 'أجهزة منزلية',  fairMin: 220, fairMax: 480 },
    { id: 'emergency', name: 'طوارئ',         fairMin: 350, fairMax: 800 }
  ],

  paymentMethods: ['كاش', 'محفظة إلكترونية', 'فوري'],

  packages: [
    { id: 'eco',  name: 'اقتصادي',          price: 250, note: 'فني مقيّم، أولوية عادية' },
    { id: 'b2g',  name: 'فني معتمد B2G',    price: 450, note: 'شارة تحقق (محاكاة)، أولوية متقدمة' },
    { id: 'fast', name: 'طوارئ سريع',       price: 700, note: 'استجابة فورية خلال دقائق (محاكاة)' }
  ],

  // فنيون تجريبيون — بيانات محاكاة بالكامل
  technicians: [
    { id: 't1', name: 'م. أحمد الشريف', rating: 4.8, trips: 312, b2g: true,  distKm: 1.2, lat: 30.0205, lng: 31.4410 },
    { id: 't2', name: 'م. محمود رضوان', rating: 4.6, trips: 208, b2g: true,  distKm: 2.4, lat: 30.0062, lng: 31.4530 },
    { id: 't3', name: 'م. سامي فؤاد',   rating: 4.9, trips: 540, b2g: false, distKm: 3.1, lat: 30.0280, lng: 31.4100 }
  ],

  // طلبات تجريبية تظهر في وضع الفني
  demoRequests: [
    { id: 'r1', title: 'تسريب خلاط مطبخ', spec: 'سباكة',  price: 220, lat: 30.0115, lng: 31.4380, area: 'النرجس الجديدة' },
    { id: 'r2', title: 'فصل متكرر في القاطع', spec: 'كهرباء', price: 300, lat: 30.0430, lng: 31.4495, area: 'حي الياسمين' },
    { id: 'r3', title: 'صيانة تكييف مركزي', spec: 'تكييف', price: 480, lat: 30.0262, lng: 31.5180, area: 'حي اللوتس' }
  ],

  demoPin: '4829' // رمز عرض تجريبي فقط، ليس سراً حقيقياً
};
