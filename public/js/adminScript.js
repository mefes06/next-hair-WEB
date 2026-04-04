//SAYFA YÜKLENDİĞİNDE ÇALIŞACAKLAR
document.addEventListener("DOMContentLoaded", () => {
    kategorileriSelecteDoldur(); // Formdaki select için seçenekleri getir
    postlariGetir(); // Sağ tarafı doldur

    // Summernote Editörünü Başlat
    $('#description').summernote({
        placeholder: 'Yazınızı buraya yazın, resimleri sürükleyip bırakın...',
        tabsize: 2,
        height: 600,
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'underline', 'clear']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']]
        ]
    });
});


//SEKME GEÇİŞ MANTIĞI
function showSection(sectionId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}


//POSTLARI LİSTELEME
async function postlariGetir() {
    const container = document.getElementById("postsContainer");
    container.innerHTML = "<p>Yükleniyor...</p>";

    try {
        const res = await fetch("/api/hairstyles?limit=1000"); // Tümünü getir

        if (!res.ok) throw new Error(`Sunucu Hatası: ${res.statusText}`);

        const responseJson = await res.json();
        const postListesi = responseJson.data || responseJson;

        if (!postListesi || postListesi.length === 0) {
            container.innerHTML = "<p>Henüz hiç post eklenmemiş.</p>";
            return;
        }

        container.innerHTML = "";

        postListesi.forEach(post => {
            const div = document.createElement("div");
            div.className = "post-list-item";
            div.innerHTML = `
                <div class="post-info">
                    <img src="${post.image_url}" style="width:50px; height:50px; object-fit:cover; border-radius:4px; margin-right:10px; vertical-align:middle;">
                    <div style="display:inline-block; vertical-align:middle;">
                        <h4 style="margin:0;">${post.title}</h4>
                        <span style="font-size:12px; background:#eee; padding:2px 5px; border-radius:3px;">${post.category || 'Genel'}</span>
                        <span style="font-size:12px; color:#777; margin-left:10px;">👁️ ${post.views || 0}</span>
                    </div>
                </div>
                <div class="action-btns">
                    <button class="btn-edit" onclick="postDuzenle(${post.id})"><i class="bi bi-pencil"></i> Düzenle</button>
                    <button class="btn-delete" onclick="postSil(${post.id})"><i class="bi bi-trash"></i> Sil</button>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color:red; font-weight:bold;">HATA OLUŞTU: ${err.message}</p>`;
    }
}

//POST SİLME
async function postSil(id) {
    if (!confirm("Bu içeriği silmek istediğine emin misin?")) return;

    try {
        const res = await fetch(`/api/hairstyles/${id}`, { method: "DELETE" });
        if (res.ok) {
            postlariGetir();
        } else {
            alert("Hata oluştu.");
        }
    } catch (err) { console.error(err); }
}


//POST DÜZENLEME

async function postDuzenle(id) {
    // Veriyi çek
    const res = await fetch(`/api/hairstyles/${id}`);
    const post = await res.json();

    // Temel alanları doldur
    document.getElementById("editId").value = post.id;
    document.getElementById("title").value = post.title;
    document.getElementById("summary").value = post.summary || "";
    $('#description').summernote('code', post.description || "");

    //ÇOKLU SEÇİMİ AYAR
    const categorySelect = document.getElementById("categorySelect");

    // Önce hepsini temizle
    for (let i = 0; i < categorySelect.options.length; i++) {
        categorySelect.options[i].selected = false;
    }

    if (post.category) {
        const categories = post.category.split(","); // Virgülle ayır

        for (let i = 0; i < categorySelect.options.length; i++) {
            if (categories.includes(categorySelect.options[i].value)) {
                categorySelect.options[i].selected = true; // Eşleşeni seçili yap
            }
        }
    }

    // Görsel ayarlar
    document.getElementById("formTitle").innerText = "İçeriği Düzenle";
    document.getElementById("submitBtn").innerText = "GÜNCELLE";
    document.getElementById("currentImgText").style.display = "block";

    showSection('postFormSection');
}

//FORM SIFIRLAMA
function showAddPostForm() {
    document.getElementById("postForm").reset();
    document.getElementById("editId").value = "";

    // Select seçimlerini de temizle
    const categorySelect = document.getElementById("categorySelect");
    for (let i = 0; i < categorySelect.options.length; i++) {
        categorySelect.options[i].selected = false;
    }

    document.getElementById("formTitle").innerText = "Yeni İçerik Ekle";
    document.getElementById("submitBtn").innerText = "YAYINLA";
    document.getElementById("currentImgText").style.display = "none";

    $('#description').summernote('code', '');
    showSection('postFormSection');
}

//FORM GÖNDERME (Hem Ekleme Hem Güncelleme)
document.getElementById("postForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editId").value;
    const isUpdate = id !== "";

    //ÇOKLU SEÇİM DEĞERLERİNİ AL
    const categorySelect = document.getElementById("categorySelect");
    const selectedValues = Array.from(categorySelect.selectedOptions).map(option => option.value);

    if (selectedValues.length === 0) {
        alert("Lütfen en az bir kategori seçiniz!");
        return;
    }

    const categoryString = selectedValues.join(","); // "Kategori1,Kategori2" yap

    const formData = new FormData();
    formData.append("category", categoryString); // Virgüllü stringi gönder
    formData.append("title", document.getElementById("title").value);
    formData.append("summary", document.getElementById("summary").value);

    const descriptionHTML = $('#description').summernote('code');
    formData.append("description", descriptionHTML);

    const fileInput = document.getElementById("imageFile");
    if (fileInput.files[0]) {
        formData.append("imageFile", fileInput.files[0]);
    }

    const url = isUpdate ? `/api/hairstyles/${id}` : "/api/hairstyles";
    const method = isUpdate ? "PUT" : "POST";

    try {
        const res = await fetch(url, { method: method, body: formData });
        if (res.ok) {
            alert(isUpdate ? "Güncellendi!" : "Eklendi!");
            showSection('postListSection');
            postlariGetir();
        } else {
            alert("İşlem başarısız.");
        }
    } catch (err) { console.error(err); }
});

// KATEGORİ İŞLEMLERİ
async function kategorileriSelecteDoldur() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    const select = document.getElementById("categorySelect");

    // Multiple olduğu için boş Seçiniz option'ına gerek yok ama durabilir
    select.innerHTML = ''; // Temizle

    data.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.name;
        opt.textContent = cat.name;
        select.appendChild(opt);
    });
}

// adminScript.js içindeki ilgili kısım:
async function kategorileriYonet() {
    const container = document.getElementById("catsContainer");
    const res = await fetch("/api/categories");
    const data = await res.json();

    container.innerHTML = "";
    data.forEach(cat => {
        const div = document.createElement("div");
        div.className = "post-list-item";
        div.style.padding = "10px 20px"; // Kategoriler için daha dar alan
        div.innerHTML = `
            <strong style="color: #444;">${cat.name} <small style="color:#999; font-weight:normal;">(${cat.parent_group})</small></strong>
            <button class="btn-delete" onclick="kategoriSil(${cat.id})">
                <i class="bi bi-trash3"></i> DELETE
            </button>
        `;
        container.appendChild(div);
    });
}

async function kategoriEkle() {
    const name = document.getElementById("newCatName").value;
    const parent_group = document.getElementById("parentGroupSelect").value;

    if (!name || !parent_group) {
        alert("Lütfen hem grup hem de isim girin.");
        return;
    }

    await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parent_group })
    });

    document.getElementById("newCatName").value = "";
    kategorileriYonet();
    kategorileriSelecteDoldur();
}

async function kategoriSil(id) {
    if (confirm("Kategori silinsin mi?")) {
        await fetch(`/api/categories/${id}`, { method: "DELETE" });
        kategorileriYonet();
        kategorileriSelecteDoldur();
    }
}
// Summernote editörüne kaynak şablonu yapıştıran fonksiyon
function kaynakSablonuEkle() {
    // Şablon HTML
    var sablon = '<div class="image-source" style="text-align:center; font-size:12px; color:#777; margin-bottom:15px;">' +
        'By <a href="LINK_BURAYA" target="_blank" style="color:#777; font-weight:bold;">KAYNAK_ISMI</a>' +
        '</div><p><br></p>'; // Altına boşluk bırakır

    // Editörün imleç olduğu yere yapıştır
    $('#description').summernote('pasteHTML', sablon);
}