# Todo Uygulaması

Bu proje, React Native ve Expo kullanılarak geliştirilmiş bir mobil görev takip uygulamasıdır.

## Özellikler

- ✅ Görev ekleme, silme ve düzenleme
- 📋 Alt görevler oluşturma ve yönetme
- 🎯 Öncelik seviyeleri (Düşük, Orta, Yüksek, Acil)
- 📁 Kategori sistemi (İş, Kişisel, Alışveriş, Eğitim, Sağlık)
- 📅 Tarih ve hatırlatıcılar
- 🔔 Bildirim sistemi
- 🎨 Modern ve kullanıcı dostu arayüz
- 🎉 Görev tamamlama animasyonları

## Kullanılan Teknolojiler

- React Native
- Expo
- React Native Vector Icons
- Moment.js
- Lottie Animations

## Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/ernerk/ToDoApp.git
```

2. Proje dizinine gidin:
```bash
cd TodoApp
```

3. Gerekli paketleri yükleyin:
```bash
npm install
```

4. Uygulamayı başlatın:
```bash
npx expo start
```

## Kullanım

1. Yeni görev eklemek için:
   - Kategori seçin
   - Öncelik belirleyin
   - İsterseniz tarih seçin
   - Görev metnini yazın ve "Ekle" butonuna tıklayın

2. Alt görev eklemek için:
   - Görevin altındaki "Alt Görev Ekle" butonuna tıklayın
   - Alt görev metnini yazın ve ekleyin

3. Görev tamamlama:
   - Görevin yanındaki daireye tıklayarak tamamlandı olarak işaretleyin
   - Tamamlanan görevler için konfeti animasyonu görünecektir

4. Görev silme:
   - Her görevin sağında bulunan "Sil" butonunu kullanın

## Özelleştirme

Uygulama içindeki renkler, kategoriler ve öncelik seviyeleri `App.js` dosyasında bulunan `CATEGORIES` ve `PRIORITIES` sabitlerinden özelleştirilebilir.

## Katkıda Bulunma

1. Bu repository'yi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik: Açıklama'`)
4. Branch'inizi push edin (`git push origin feature/yeniOzellik`)
5. Bir Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın. 