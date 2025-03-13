# Laravel 12 React

Bu proje, ürün ve ürün kategorilerini yönetmek için geliştirilmiş bir web uygulamasıdır. Laravel ve React kullanılarak oluşturulmuştur.

## Gereksinimler

- PHP 8.0+
- Composer
- Node.js ve npm
- MySQL veya başka bir veritabanı

## Kurulum

### Backend
Farklı yöntemler ile react kullanıldı. Güncelleme için farklı sayfada ve aynı sayfa içinde (dialog) güncelleme işlemi yapıldı. ayrıca klasör yapılarında farklılıklar yapıldı. 
Columns ve datatable'yi farklı sayfalarda yapılma şekli de var sadece bir sayfa içerisinde bütün her şeyin tanımlanması da var.

1. Depoyu klonlayın:

    ```bash
    git clone https://github.com/aydinyagizz/proje-adi.git
    cd proje-adi
    ```

2. Gerekli bağımlılıkları yükleyin:

    ```bash
    composer install
    ```

3. `.env` dosyasını oluşturun ve veritabanı bilgilerinizi girin:

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

4. Veritabanını oluşturun ve migrasyonları çalıştırın:

    ```bash
    php artisan migrate
    php artisan db:seed
    ```

5. Sunucuyu başlatın:

    ```bash
    php artisan serve
    ```

### Frontend

1. `resources/js` dizinine gidin:

    ```bash
    cd resources/js
    ```

2. Gerekli bağımlılıkları yükleyin:

    ```bash
    npm install
    ```

3. Uygulamayı başlatın:

    ```bash
    npm run dev
    ```

## Kullanım

### Kullanıcılar

- Kullanıcıları listeleyin, ekleyin, güncelleyin ve silin.

### Ürün Kategorileri

- Ürün kategorilerini listeleyin, ekleyin, güncelleyin ve silin.
- Bir kategori bir üründe kullanılıyorsa, kategori silinemez.

### Ürünler

- Ürünleri listeleyin, ekleyin, güncelleyin ve silin.
- Ürünler belirli kategorilere atanabilir.

## API Endpoints

### Kullanıcılar
- `GET /user/getAll` - Tüm kullanıcıları getirir.
- `POST /user/create` - Yeni kullanıcı oluşturur.
- `GET /user/edit/{id}` - Belirli bir kullanıcıyı güncelleme sayfasını getirir.
- `PUT /user/updateUser/{id}` - Belirli bir kullanıcıyı günceller.
- `DELETE /user/delete/{id}` - Belirli bir kullanıcıyı siler.

### Ürün Kategorileri

- `GET /productCategory/getAll` - Tüm kategorileri getirir.
- `GET /productCategory/getById/{id}` - Belirli bir kategoriyi getirir.
- `POST /productCategory/create` - Yeni bir kategori oluşturur.
- `PUT /productCategory/update/{id}` - Belirli bir kategoriyi günceller.
- `DELETE /productCategory/delete/{id}` - Belirli bir kategoriyi siler.
- `POST /productCategory/bulkDelete` - Birden fazla kategoriyi toplu olarak siler.

### Ürünler

- `GET /product/getAll` - Tüm ürünleri getirir.
- `GET /product/getById/{id}` - Belirli bir ürünü getirir.
- `POST /product/create` - Yeni bir ürün oluşturur.
- `PUT /product/update/{id}` - Belirli bir ürünü günceller.
- `DELETE /product/delete/{id}` - Belirli bir ürünü siler.
- `POST /product/bulkDelete` - Birden fazla ürünü toplu olarak siler.
