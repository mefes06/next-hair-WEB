// ==========================================
// 1. GLOBAL DEĞİŞKENLER
// ==========================================
let currentPage = 1;
let currentSort = 'latest'; // Varsayılan sıralama
let slaytlar = [];          // Galeri slaytlarını tutar
let aktifIndex = 0;         // Şu anki aktif slayt numarası

// ==========================================
// 2. SAYFA YÜKLENDİĞİNDE ÇALIŞACAKLAR
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

    // (HER SAYFADA ÇALIŞIR)
    navbarAktifLinkAyari();
    kategorileriGetir(); // Sidebar ve Navbar kategorileri
    aramaMotorunuBaslat();
    temaAyarlariniUygula();

    // KATALOG ŞERİDİNİ GETİR (Eski koddan geri geldi)
    populerleriGetir();

    // ANA SAYFA MI DETAY MI?
    const blogFeed = document.getElementById("blogFeed");
    if (blogFeed) {
        urlFiltresiniKontrolEt();
        verileriYukle(1);
    }

    const dTitle = document.getElementById("dTitle");
    if (dTitle) {
        detaySayfasiniYukle();
    }
});

// ==========================================
// 3. DETAY SAYFASI VE SLIDER (GELİŞMİŞ VERSİYON)
// ==========================================
async function detaySayfasiniYukle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { window.location.href = "/"; return; }

    try {
        const res = await fetch(`/api/hairstyles/${id}`);
        if (!res.ok) throw new Error("Veri çekilemedi");
        const data = await res.json();

        // 1. TEMEL BİLGİLER
        const setSafeText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        setSafeText("dTitle", data.title);
        document.title = `${data.title} - Hair Colors`;
        setSafeText("dBreadcrumbTitle", data.title);
        setSafeText("dViews", data.views);
        setSafeText("dShares", data.shares || 0);

        // --- TARİH AYARLARI (GÜNCELLENDİ) ---
        // A. Yükleme Tarihi
        const dateEl = document.getElementById("dDate");
        let createdDateStr = "";
        if (dateEl) {
            const date = new Date(data.created_at);
            createdDateStr = date.toLocaleDateString("tr-TR");
            dateEl.textContent = createdDateStr;
        }

        // B. Güncelleme Tarihi (Varsa ve Yükleme tarihinden farklıysa göster)
        const updateWrapper = document.getElementById("dUpdateWrapper");
        const updateDateEl = document.getElementById("dUpdateDate");

        if (updateWrapper && updateDateEl && data.updated_at) {
            const updatedDate = new Date(data.updated_at);
            const updatedDateStr = updatedDate.toLocaleDateString("tr-TR");

            // Eğer güncelleme tarihi varsa ve oluşturulma tarihinden farklıysa göster
            // (Not: Bazen sistemler aynı tarihi atar, o yüzden string kontrolü yapıyoruz)
            if (updatedDateStr !== createdDateStr) {
                updateDateEl.textContent = updatedDateStr;
                updateWrapper.style.display = "inline"; // Gizli olanı aç
            } else {
                updateWrapper.style.display = "none";
            }
        }
        // -------------------------------------

        // 2. KATEGORİ
        const rawCategory = data.category || "General";
        const firstCategory = rawCategory.split(',')[0].trim();
        const dCatNameElem = document.getElementById("dCatName");
        if (dCatNameElem) dCatNameElem.textContent = firstCategory;

        const catLink = document.getElementById("dCategoryLink");
        if (catLink) {
            catLink.textContent = firstCategory;
            catLink.href = `/?category=${firstCategory}`;
        }

        // Kategori Etiketleri
        const tagsContainer = document.getElementById("dCategoryLinks");
        if (tagsContainer && data.category) {
            tagsContainer.innerHTML = "";
            data.category.split(",").forEach(cat => {
                const cleanCat = cat.trim();
                if (cleanCat) {
                    const link = document.createElement("a");
                    link.className = "cat-tag";
                    link.textContent = cleanCat;
                    link.href = `/?category=${cleanCat}`;
                    tagsContainer.appendChild(link);
                }
            });
        }

        // 3. SLIDER AYRIŞTIRMA (KLONLAMA YÖNTEMİ)
        slaytlar = [];
        const content = data.description || "";
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        const childNodes = Array.from(tempDiv.childNodes);
        let currentSlide = null;

        childNodes.forEach((node) => {
            let clone = node.cloneNode ? node.cloneNode(true) : null;

            const isImgTag = node.nodeName === 'IMG';
            const innerImg = clone && clone.querySelector ? clone.querySelector('img') : null;

            if (isImgTag || innerImg) {
                if (currentSlide) slaytlar.push(currentSlide);

                const imgSrc = isImgTag ? node.src : innerImg.src;
                currentSlide = { url: imgSrc, text: "", source: "" };

                if (isImgTag) clone = null;
                else if (innerImg) innerImg.remove();
            }

            if (currentSlide && clone && clone.querySelector) {
                const sourceEl = clone.querySelector('.image-source');
                if (sourceEl) {
                    currentSlide.source = sourceEl.innerHTML;
                    sourceEl.remove();
                } else if (clone.classList && clone.classList.contains('image-source')) {
                    currentSlide.source = clone.innerHTML;
                    clone = null;
                }
            }

            if (currentSlide && clone) {
                if (node.nodeType === 3 && node.textContent.trim().length > 0) {
                    currentSlide.text += node.textContent;
                } else if (node.nodeType === 1) {
                    const remainingHTML = clone.innerHTML.trim();
                    if (remainingHTML.length > 0 && remainingHTML !== "<br>") {
                        currentSlide.text += clone.outerHTML;
                    }
                }
            }
        });

        if (currentSlide) slaytlar.push(currentSlide);

        // 4. EKRANA BASMA
        if (slaytlar.length > 0) {
            const totalNumElem = document.getElementById("totalNum");
            if (totalNumElem) totalNumElem.textContent = slaytlar.length;
            renderSlide(0);
        } else {
            const slideDesc = document.getElementById("slideDesc");
            if (slideDesc) slideDesc.innerHTML = content;
            const nav = document.querySelector(".slider-nav");
            if (nav) nav.style.display = "none";
        }
        benzerleriGetir(data.id, data.category);

        document.getElementById("loading").classList.add("hidden");
        document.getElementById("detailContent").classList.remove("hidden");

    } catch (err) {
        console.error("Hata:", err);
    }
}

// Slider Render (Sayfa Kaydırmaz)
function renderSlide(index) {
    if (slaytlar.length === 0) return;
    aktifIndex = index;
    const item = slaytlar[aktifIndex];

    const slideImg = document.getElementById("slideImg");
    const slideDesc = document.getElementById("slideDesc");
    const currentNum = document.getElementById("currentNum");
    const slideSource = document.getElementById("slideSource");

    if (slideImg) slideImg.src = item.url;
    if (slideDesc) slideDesc.innerHTML = item.text;
    if (currentNum) currentNum.textContent = aktifIndex + 1;

    if (slideSource) {
        if (item.source) {
            slideSource.innerHTML = item.source;
            slideSource.style.display = "block";
        } else {
            slideSource.innerHTML = "";
            slideSource.style.display = "none";
        }
    }
    // window.scrollTo YOK -> Sayfa sabit kalır.
}

function degistirSlide(n) {
    let yeni = aktifIndex + n;
    if (yeni >= 0 && yeni < slaytlar.length) {
        renderSlide(yeni);
    } else if (yeni < 0) {
        renderSlide(slaytlar.length - 1);
    } else {
        renderSlide(0);
    }
}

function pinterestPaylas() {
    const aktifSlayt = slaytlar[aktifIndex];
    if (!aktifSlayt) return;
    const pageUrl = encodeURIComponent(window.location.href);
    const imageUrl = encodeURIComponent(aktifSlayt.url);
    const description = encodeURIComponent(document.title);
    const pinUrl = `https://www.pinterest.com/pin/create/button/?url=${pageUrl}&media=${imageUrl}&description=${description}`;
    window.open(pinUrl, '_blank', 'width=750,height=600,toolbar=0,status=0');
}

// ==========================================
// 4. ESKİ KODDAN GELEN ÖZELLİKLER (Katalog, Ana Sayfa)
// ==========================================

// ÜST KATALOG ŞERİDİ (POPULERLERI GETIR)
async function populerleriGetir() {
    try {
        const topStrip = document.getElementById("topStrip");
        if (!topStrip) return;

        const res = await fetch("/api/hairstyles?sort=popular&limit=11");
        const json = await res.json();
        const data = json.data;

        topStrip.innerHTML = "";
        const loopData = [...data, ...data]; // Sonsuz döngü efekti için çiftle

        loopData.forEach(item => {
            const stripItem = document.createElement("div");
            stripItem.className = "strip-item";
            stripItem.onclick = () => window.location.href = `/detail?id=${item.id}`;
            stripItem.innerHTML = `
                <img src="${item.image_url}" alt="${item.title}">
                <div class="strip-title">${item.title}</div>
            `;
            topStrip.appendChild(stripItem);
        });
    } catch (err) { console.error("Popüler strip hatası:", err); }
}

// ANA SAYFA LİSTESİ
async function verileriYukle(page = 1) {
    try {
        currentPage = page;
        const params = new URLSearchParams(window.location.search);
        const category = params.get("category");
        const search = params.get("search");

        let apiUrl = `/api/hairstyles?page=${page}&limit=12&sort=${currentSort}`;
        const titleElem = document.querySelector(".section-title");

        if (category) {
            apiUrl += `&category=${category}`;
            if (titleElem) titleElem.textContent = `${category.toUpperCase()} HAIRSTYLES`;
        } else if (search) {
            apiUrl += `&search=${search}`;
            if (titleElem) titleElem.textContent = `SEARCH RESULTS: "${search.toUpperCase()}"`;
        } else {
            if (titleElem) {
                if (currentSort === 'popular') titleElem.textContent = "POPULAR POSTS";
                else if (currentSort === 'hot') titleElem.textContent = "HOT POSTS";
                else if (currentSort === 'trending') titleElem.textContent = "TRENDING POSTS";
                else titleElem.textContent = "LATEST STORIES";
            }
        }

        const res = await fetch(apiUrl);
        const responseJson = await res.json();
        const data = responseJson.data;
        const pagination = responseJson.pagination;
        const blogFeed = document.getElementById("blogFeed");

        if (blogFeed) blogFeed.innerHTML = "";

        data.forEach((item) => {
            const blogCard = document.createElement("div");
            blogCard.className = "blog-card";
            blogCard.onclick = () => window.location.href = `/detail?id=${item.id}`;
            const views = item.views || 0;
            const shares = item.shares || 0;

            blogCard.innerHTML = `
                <div class="blog-img-wrapper">
                    <img src="${item.image_url}">
                </div>
                <div class="card-content-padding" style="padding: 0 10px;">
                    <div class="blog-meta">
                        <i class="bi bi-share"></i> ${shares} Shares &nbsp;&nbsp; 
                        <i class="bi bi-eye"></i> ${views} Views
                    </div>
                    <h3 class="blog-title">${item.title}</h3>
                    <div class="card-bottom-row">
                        <p class="blog-desc">${item.summary || "Detaylar..."}</p>
                        <button class="read-more">MORE</button>
                    </div>
                </div>
            `;
            if (blogFeed) blogFeed.appendChild(blogCard);
        });
        updatePaginationControls(pagination);
    } catch (err) { console.error("Veri yükleme hatası:", err); }
}

// YARDIMCI BUTONLAR (Paylaş, Sırala, Sayfalama)
function paylas(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    let shareUrl = "";

    if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    else if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
    else if (platform === 'whatsapp') shareUrl = `https://api.whatsapp.com/send?text=${title} ${url}`;

    window.open(shareUrl, '_blank', 'width=600,height=400');
    // Paylaşım sayısını artır (isteğe bağlı)
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) { fetch(`/api/hairstyles/${id}/share`, { method: "POST" }).catch(e => console.error(e)); }
}

function sirala(tip, element) {
    currentSort = tip;
    document.querySelectorAll('.icon-item').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    verileriYukle(1);
}

function updatePaginationControls(pagination) {
    const container = document.getElementById("paginationControls");
    const numContainer = document.getElementById("pageNumbers");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (!container || !numContainer) return;
    if (pagination.totalPages <= 1) { container.style.display = "none"; return; }

    container.style.display = "flex";
    numContainer.innerHTML = "";
    const current = pagination.currentPage;
    const total = pagination.totalPages;
    let pagesToShow = [];

    if (total <= 7) { for (let i = 1; i <= total; i++) pagesToShow.push(i); }
    else {
        if (current <= 4) pagesToShow = [1, 2, 3, 4, 5, "...", total];
        else if (current >= total - 3) pagesToShow = [1, "...", total - 4, total - 3, total - 2, total - 1, total];
        else pagesToShow = [1, "...", current - 1, current, current + 1, "...", total];
    }

    pagesToShow.forEach(page => {
        const btn = document.createElement("button");
        btn.className = "page-btn";
        if (page === "...") { btn.textContent = "..."; btn.disabled = true; }
        else {
            btn.textContent = page;
            if (page === current) btn.classList.add("active");
            btn.onclick = () => { verileriYukle(page); window.scrollTo({ top: 400, behavior: 'smooth' }); };
        }
        numContainer.appendChild(btn);
    });
    if (prevBtn) prevBtn.disabled = (current === 1);
    if (nextBtn) nextBtn.disabled = (current === total);
}

// NAVBAR & TEMA & ARAMA
function navbarAktifLinkAyari() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href');
        if (linkPath === '/' && (currentPath === '/' || currentPath === '/index.html')) link.classList.add('active');
        else if (linkPath === currentPath) link.classList.add('active');
    });
}

function urlFiltresiniKontrolEt() {
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get("filter");
    if (filterParam) {
        currentSort = filterParam;
        const activeLink = document.querySelector(`.icon-item[href*="filter=${filterParam}"]`);
        if (activeLink) activeLink.classList.add("active");
    } else {
        const defaultLink = document.querySelector('.icon-item[href*="filter=latest"]');
        if (defaultLink) defaultLink.classList.add("active");
    }
}

async function kategorileriGetir() {
    sidebarKategorileriGetir();
    navbarKategorileriGetir();
}

async function sidebarKategorileriGetir() {
    try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        const list = document.getElementById("publicCategoryList");
        if (!list) return;
        list.innerHTML = "";
        data.forEach(cat => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="/?category=${cat.name}">${cat.name}</a>`;
            list.appendChild(li);
        });
    } catch (err) { console.error(err); }
}

async function navbarKategorileriGetir() {
    try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        const cutsMenu = document.getElementById("navHaircuts");
        const colorsMenu = document.getElementById("navColors");
        if (!cutsMenu || !colorsMenu) return;
        cutsMenu.innerHTML = ""; colorsMenu.innerHTML = "";
        data.forEach(cat => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="/?category=${cat.name}">${cat.name}</a>`;
            if (cat.parent_group === 'Haircuts') cutsMenu.appendChild(li);
            else colorsMenu.appendChild(li);
        });
    } catch (err) { console.error(err); }
}

function temaAyarlariniUygula() {
    const savedTheme = localStorage.getItem("theme");
    const themeBtn = document.getElementById("themeBtn");
    if (savedTheme === "dark") {
        document.body.setAttribute("data-theme", "dark");
        if (themeBtn) {
            themeBtn.classList.remove("bi-moon-fill"); themeBtn.classList.add("bi-sun-fill");
            themeBtn.style.color = "#f1c40f";
        }
    }
}

function temayiDegistir() {
    const body = document.body; const themeBtn = document.getElementById("themeBtn");
    const isDark = body.getAttribute("data-theme") === "dark";
    if (isDark) {
        body.setAttribute("data-theme", "light"); localStorage.setItem("theme", "light");
        themeBtn.classList.remove("bi-sun-fill"); themeBtn.classList.add("bi-moon-fill"); themeBtn.style.color = "";
    } else {
        body.setAttribute("data-theme", "dark"); localStorage.setItem("theme", "dark");
        themeBtn.classList.remove("bi-moon-fill"); themeBtn.classList.add("bi-sun-fill"); themeBtn.style.color = "#f1c40f";
    }
}

function aramaMotorunuBaslat() {
    const navInput = document.getElementById("navSearchInput");
    if (navInput) { navInput.addEventListener("keypress", e => { if (e.key === "Enter" && e.target.value.length > 0) window.location.href = `/?search=${e.target.value}`; }); }
    const searchInput = document.getElementById("searchInput");
    if (searchInput) { searchInput.addEventListener("keypress", e => { if (e.key === "Enter" && e.target.value.length > 0) window.location.href = `/?search=${e.target.value}`; }); }
    document.addEventListener("click", event => {
        const box = document.getElementById("navSearchBox"); const icon = document.getElementById("navSearchIcon");
        if (box && !box.contains(event.target) && !icon.contains(event.target)) box.classList.remove("active");
    });
}

function aramaKutusunuAc() {
    const box = document.getElementById("navSearchBox"); const input = document.getElementById("navSearchInput");
    box.classList.toggle("active"); if (box.classList.contains("active")) input.focus();
}
// --- BENZER İÇERİKLERİ GETİR ---
async function benzerleriGetir(currentId, fullCategoryString) {
    try {
        // Kategorilerin ilkini al (örn: "Long Hair, Blonde" -> "Long Hair")
        const mainCategory = fullCategoryString ? fullCategoryString.split(',')[0].trim() : "";

        const res = await fetch(`/api/hairstyles/${currentId}/related?category=${mainCategory}`);
        const data = await res.json();

        const container = document.getElementById("relatedContainer");
        const section = document.getElementById("relatedSection");

        if (data.length === 0) {
            section.style.display = "none"; // Benzer yoksa gizle
            return;
        }

        section.style.display = "block"; // Varsa göster
        container.innerHTML = "";

        data.forEach(item => {
            // Link oluştur (Slug varsa slug, yoksa ID)
            // Not: getDetailLink fonksiyonun varsa onu kullan, yoksa manuel yazıyoruz:
            const linkUrl = item.slug ? `/detail?slug=${item.slug}` : `/detail?id=${item.id}`;
            // Eğer clean URL kullanıyorsan: item.slug ? `/${item.slug}` : `/detail?id=${item.id}`;

            const card = document.createElement("div");
            card.style.cursor = "pointer";
            card.onclick = () => window.location.href = linkUrl;

            card.innerHTML = `
                <div style="overflow: hidden; border-radius: 8px; margin-bottom: 10px;">
                    <img src="${item.image_url}" loading="eager" style="width: 100%; height: 180px; object-fit: cover; transition: transform 0.3s;" 
                    onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                </div>
                <h4 style="font-size: 16px; font-weight: bold; color: #333; line-height: 1.4; font-family: 'Lato', sans-serif;">
                    ${item.title}
                </h4>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.error("Benzer içerik hatası:", err);
    }
}