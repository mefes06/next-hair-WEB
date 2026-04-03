// --- STATE MANAGEMENT (Veri Yönetimi) ---
let userData = {
    gender: '',
    age: '',
    experiment: '',
    feelings: '',
    texture: '',
    length: '',
    thickness: '',
    conditions: [], // ÇOKLU SEÇİM İÇİN YENİ EKLENDİ (Dizi/Array olarak)
    thinning: '',
    faceShape: '',
    goal: '',
    avoid: '',
    styles: '',
    targetLength: '',
    elements: '',
    frequency: '',
    stylingTime: ''
};

let stepHistory = ['step-gender'];

// --- GEÇİŞ MANTIĞI (Navigation) ---
function changeScreen(currentStepId, nextStepId) {
    const current = document.getElementById(currentStepId);
    const next = document.getElementById(nextStepId);

    if (current && next) {
        current.style.display = 'none';
        next.style.display = 'block';
        stepHistory.push(nextStepId);

        // Geri butonunu ilk ekran hariç göster
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.style.display = 'flex';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goBack() {
    if (stepHistory.length > 1) {
        const currentStep = stepHistory.pop();
        document.getElementById(currentStep).style.display = 'none';

        const previousStep = stepHistory[stepHistory.length - 1];
        document.getElementById(previousStep).style.display = 'block';

        if (stepHistory.length === 1) {
            document.getElementById('backBtn').style.display = 'none';
        }
    }
}

// --- SORU FONKSİYONLARI ---
function selectGender(selectedGender) {
    userData.gender = selectedGender;

    const titleEl = document.getElementById('dynamicTestimonialTitle');
    const nameEl = document.getElementById('testimonialName');
    const avatarEl = document.getElementById('testimonialAvatar');
    const textEl = document.getElementById('testimonialText');

    if (selectedGender === 'male') {
        titleEl.innerHTML = 'Over <span class="gold-text">15,000 men</span> have<br>discovered their <span class="gold-text">perfect hairstyle<br>match</span>';
        nameEl.innerText = 'James, 34';
        avatarEl.innerText = 'J';
        avatarEl.style.background = '#e0f2fe';
        avatarEl.style.color = '#0284c7';
        textEl.innerHTML = '"This app showed me I could pull off a fade before I actually committed."';
    } else {
        titleEl.innerHTML = 'Over <span class="gold-text">15,000 women</span> have<br>discovered their <span class="gold-text">perfect hairstyle<br>match</span>';
        nameEl.innerText = 'Sarah, 43';
        avatarEl.innerText = 'S';
        avatarEl.style.background = '#f1edff';
        avatarEl.style.color = '#8b5cf6';
        textEl.innerHTML = '"Helps you rule out all those styles you\'ve often thought about. It\'s great."';
    }

    changeScreen('step-gender', 'step-testimonial');
}

function goToNextQuestion() {
    if (userData.gender === 'male') {
        // Erkek ise direkt Saç Dokusu ekranına
        changeScreen('step-testimonial', 'step-texture');
    } else {
        // Kadın ise Yaş Aralığı ekranına
        changeScreen('step-testimonial', 'step-age-female');
    }
}

/*KADIN SEÇİM EKRANI*/
function selectAge(ageValue) {
    userData.age = ageValue;
    console.log("Yaş kaydedildi:", ageValue);

    // Yaş seçildikten sonra kadınları Saç Dokusu ekranına yönlendiriyoruz
    changeScreen('step-age-female', 'step-experiment-female');
}

function selectExperiment(expValue) {
    userData.experiment = expValue;
    console.log("Deneyim durumu kaydedildi:", userData);

    changeScreen('step-experiment-female', 'step-feelings-female');
}
function selectFeelings(feelingValue) {
    userData.feelings = feelingValue;
    console.log("Saç duygusu kaydedildi:", userData);

    // Yorum satırını kaldırıp geçiş kodunu aktif et
    changeScreen('step-feelings-female', 'step-texture-female');
}

function selectTextureFemale(textureValue) {
    // Veriyi objemize kaydediyoruz
    userData.texture = textureValue;
    console.log("Saç dokusu kaydedildi:", userData);

    changeScreen('step-texture-female', 'step-length-female');
}

function selectLengthFemale(lengthValue) {
    // Veriyi objemize kaydediyoruz
    userData.length = lengthValue;
    console.log("Saç uzunluğu kaydedildi:", userData);

    changeScreen('step-length-female', 'step-thickness-female');
}

function selectThicknessFemale(thicknessValue) {
    // Veriyi objemize kaydediyoruz
    userData.thickness = thicknessValue;
    console.log("Saç kalınlığı kaydedildi:", userData);

    changeScreen('step-thickness-female', 'step-condition-female');
}

// Çoklu seçim kutularını işaretleme/kaldırma fonksiyonu
// Çoklu seçim kutularını işaretleme/kaldırma ve BUTONU KONTROL ETME fonksiyonu
function toggleCondition(element, conditionValue) {
    const icon = element.querySelector('.condition-check');
    const index = userData.conditions.indexOf(conditionValue);
    const nextBtn = document.getElementById('conditionNextBtn'); // Butonu seç

    if (index === -1) {
        // Eğer listede yoksa EKLE (İşaretle)
        userData.conditions.push(conditionValue);
        element.style.background = '#f9f5ff';
        element.style.borderColor = '#8b5cf6';
        icon.classList.remove('bi-square');
        icon.classList.add('bi-check-square-fill');
    } else {
        // Eğer listede varsa ÇIKAR (İşareti kaldır)
        userData.conditions.splice(index, 1);
        element.style.background = '#fff';
        element.style.borderColor = '#eee';
        icon.classList.remove('bi-check-square-fill');
        icon.classList.add('bi-square');
    }

    // Seçim sayısına göre butonu AKTİF veya PASİF yap
    if (userData.conditions.length > 0) {
        nextBtn.disabled = false; // 1 veya daha fazla seçim varsa butonu aç
    } else {
        nextBtn.disabled = true; // Hiç seçim yoksa butonu kapat
    }
}

// "NEXT STEP" butonuna basıldığında çalışacak fonksiyon
function goToNextFromCondition() {
    // Kullanıcı hiçbir şey seçmediyse uyar (İstersen bu zorunluluğu kaldırabilirsin)
    if (userData.conditions.length === 0) {
        alert("Lütfen en az bir saç durumu seçin.");
        return;
    }

    console.log("Seçilen tüm saç durumları:", userData.conditions);

    // Çoklu seçim ekranının sabit barı olduğu için geçişte onu da gizlemeliyiz
    document.getElementById('step-condition-female').querySelector('.sticky-action-bar').style.display = 'none';
    changeScreen('step-condition-female', 'step-refine-female');
}
// Adım 9'dan (Refine) sonrasına geçiş
function goToNextFromRefine() {
    console.log("İnce ayar ekranı geçildi.");

    // Burası 10. Adım (Belki nihai sonuç) hazır olduğunda aktif edilecek
    alert("Yapay zeka ince ayarı tamamlandı. Nihai sonuç hazırlanıyor (Sırada 10. Adım var)!");

    // changeScreen('step-refine-female', 'step-sonraki-adim');
}

function selectTexture(textureValue) {
    userData.texture = textureValue;
    alert("Seçilen Doku: " + textureValue + "\nCinsiyet: " + userData.gender + (userData.age ? "\nYaş: " + userData.age : ""));
}