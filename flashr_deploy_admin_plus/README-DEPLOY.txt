
# Flashr – جاهز للنشر

## ما تم تنفيذه
- صفحات ثابتة بدون بناء (بدون npm) تعتمد على Firebase CDN (v9).
- تسجيل الدخول + إنشاء حساب + Google.
- تحديد الأدمن: **yassenhassouna39@gmail.com**.
- عرض الكورسات مع زر **تحميل** مباشر.
- صفحة أدمن لرفع الملفات إلى **Firebase Storage** وإنشاء مستند في **Firestore**.
- ملفات قواعد الحماية المقترحة Firestore/Storage.
- `firebase.json` جاهز للنشر على Firebase Hosting.

## طريقة النشر
> من داخل هذا المجلد (deploy)

1) سجّل الدخول على Firebase CLI:
```bash
firebase login
```

2) اربط المشروع:
```bash
firebase use --add
# اختر مشروع: flash-card-yan
```

3) (اختياري) طبّق القواعد:
```bash
firebase deploy --only firestore:rules,storage:rules
```

4) انشر الاستضافة (Hosting):
```bash
firebase deploy --only hosting
```

## ملاحظات
- إذا أردت دمج الصفحات في صفحة واحدة (SPA) أضف rewrite إلى index.html.
- تأكد من تمكين Authentication مزوّد البريد و Google من لوحة Firebase.
- ستجد بيانات الاتصال في `firebase-config.js` (نُسخت من ملفك).

