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
    color: '', // YENİ EKLENDİ
    changeColor: '',
    shades: [],
    thinning: '',
    faceShape: '',
    features: [],
    balanceFeatures: [],
    lifestyle: [],
    primaryGoal: '',
    appealingStyles: [],
    targetLength: '',
    styleElements: [],
    stylingTime: '',
    washFrequency: '', // YENİ EKLENDİ
    typicalLifestyle: [],
    climate: '',
    stylingTools: [],
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
// Adım 8'den (Condition) Adım 9'a (Refine) geçiş
function goToNextFromCondition() {
    // Kullanıcı hiçbir şey seçmediyse uyar
    if (userData.conditions.length === 0) {
        alert("Lütfen en az bir saç durumu seçin.");
        return;
    }

    console.log("Seçilen tüm saç durumları:", userData.conditions);

    // Geçiş yapıldığında "step-condition-female" div'i gizleneceği için, 
    // içindeki sabit buton da otomatik gizlenecek. Ekstra koda gerek yok!
    changeScreen('step-condition-female', 'step-refine-female');
}
// Adım 9'dan (Refine) sonrasına geçiş
function goToNextFromRefine() {
    console.log("İnce ayar ekranı geçildi.");

    // Alerti silip geçişi ekledik
    changeScreen('step-refine-female', 'step-color-female');
}
// Adım 10: Saç rengi seçildiğinde çalışacak
function selectColorFemale(colorValue) {
    userData.color = colorValue;
    console.log("Saç rengi kaydedildi:", userData);

    // Alerti silip geçişi ekledik
    changeScreen('step-color-female', 'step-change-color-female');
}
// Adım 11: Renk değiştirme isteği seçildiğinde çalışacak
// Adım 11'den Adım 12'ye geçiş (Akıllı Dallanma)
function selectChangeColorFemale(changeValue) {
    userData.changeColor = changeValue;
    console.log("Renk değişim isteği kaydedildi:", userData);

    if (changeValue === 'no_just_cut') {
        // EĞER SADECE KESİM İSTİYORSA RENK SORULARINI ATLA
        changeScreen('step-change-color-female', 'step-faceshape-female');
    } else {
        // RENK İSTİYORSA 12. ADIMA (SHADES) GEÇ
        changeScreen('step-change-color-female', 'step-shades-female');
    }
}
// Adım 12: Çoklu seçim (Renk Tonları) işaretleme fonksiyonu
function toggleShade(element, shadeValue) {
    const icon = element.querySelector('.shade-check');
    const index = userData.shades.indexOf(shadeValue);
    const nextBtn = document.getElementById('shadesNextBtn');

    if (index === -1) {
        userData.shades.push(shadeValue);
        element.style.background = '#f9f5ff';
        element.style.borderColor = '#8b5cf6';
        icon.classList.remove('bi-square');
        icon.classList.add('bi-check-square-fill');
    } else {
        userData.shades.splice(index, 1);
        element.style.background = '#fff';
        element.style.borderColor = '#eee';
        icon.classList.remove('bi-check-square-fill');
        icon.classList.add('bi-square');
    }

    // Seçim varsa butonu aktif et
    if (userData.shades.length > 0) {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
    }
}

// Adım 12'den Face Shape (Yüz Şekli) kategorisine geçiş
function goToNextFromShades() {
    if (userData.shades.length === 0) {
        alert("Lütfen en az bir ton seçin.");
        return;
    }
    console.log("Seçilen tonlar:", userData.shades);

    // Alerti silip geçiş kodunu aktif ettik
    changeScreen('step-shades-female', 'step-faceshape-female');
}

// Adım 13: Yüz Şekli seçildiğinde çalışacak
function selectFaceShape(shapeValue) {
    userData.faceShape = shapeValue;
    console.log("Yüz şekli kaydedildi:", userData);

    // Alerti sildik, geçişi açtık
    changeScreen('step-faceshape-female', 'step-features-female');
}

// Adım 14: Çoklu seçim (Yüz Hatları) işaretleme fonksiyonu
function toggleFeature(element, featureValue) {
    const icon = element.querySelector('.feature-check');
    const index = userData.features.indexOf(featureValue);
    const nextBtn = document.getElementById('featuresNextBtn');

    if (index === -1) {
        // Eğer "None specifically" (Hiçbiri) seçilirse diğerlerini temizleme mantığı eklenebilir
        // Şimdilik standart çoklu seçim yapıyoruz:
        userData.features.push(featureValue);
        element.style.background = '#f9f5ff';
        element.style.borderColor = '#8b5cf6';
        icon.classList.remove('bi-square');
        icon.classList.add('bi-check-square-fill');
    } else {
        userData.features.splice(index, 1);
        element.style.background = '#fff';
        element.style.borderColor = '#eee';
        icon.classList.remove('bi-check-square-fill');
        icon.classList.add('bi-square');
    }

    // Seçim varsa butonu aktif et
    if (userData.features.length > 0) {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
    }
}

// Adım 14'ten sonraki adıma geçiş
function goToNextFromFeatures() {
    if (userData.features.length === 0) {
        alert("Lütfen en az bir seçenek işaretleyin.");
        return;
    }

    console.log("Seçilen vurgulanacak hatlar:", userData.features);

    // Geçişi aktif ettik
    changeScreen('step-features-female', 'step-balance-female');
}

// Adım 15: Çoklu seçim (Dengelenecek Hatlar) işaretleme fonksiyonu
function toggleBalance(element, balanceValue) {
    const icon = element.querySelector('.balance-check');
    const index = userData.balanceFeatures.indexOf(balanceValue);
    const nextBtn = document.getElementById('balanceNextBtn');

    if (index === -1) {
        userData.balanceFeatures.push(balanceValue);
        element.style.background = '#f9f5ff';
        element.style.borderColor = '#8b5cf6';
        icon.classList.remove('bi-square');
        icon.classList.add('bi-check-square-fill');
    } else {
        userData.balanceFeatures.splice(index, 1);
        element.style.background = '#fff';
        element.style.borderColor = '#eee';
        icon.classList.remove('bi-check-square-fill');
        icon.classList.add('bi-square');
    }

    // Seçim varsa butonu aktif et
    if (userData.balanceFeatures.length > 0) {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
    }
}

// Adım 15'ten sonraki adıma geçiş
function goToNextFromBalance() {
    if (userData.balanceFeatures.length === 0) {
        alert("Lütfen en az bir seçenek işaretleyin.");
        return;
    }
    console.log("Seçilen dengelenecek hatlar:", userData.balanceFeatures);

    changeScreen('step-balance-female', 'step-lifestyle-female');
}

// Adım 16: Çoklu seçim (Yaşam Tarzı) işaretleme fonksiyonu
function toggleLifestyle(element, lifestyleValue) {
    const icon = element.querySelector('.lifestyle-check');
    const index = userData.lifestyle.indexOf(lifestyleValue);
    const nextBtn = document.getElementById('lifestyleNextBtn');

    if (index === -1) {
        userData.lifestyle.push(lifestyleValue);
        element.style.background = '#f9f5ff';
        element.style.borderColor = '#8b5cf6';
        icon.classList.remove('bi-square');
        icon.classList.add('bi-check-square-fill');
    } else {
        userData.lifestyle.splice(index, 1);
        element.style.background = '#fff';
        element.style.borderColor = '#eee';
        icon.classList.remove('bi-check-square-fill');
        icon.classList.add('bi-square');
    }

    // Seçim varsa butonu aktif et
    if (userData.lifestyle.length > 0) {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
    }
}

// Adım 16'dan sonraki adıma geçiş
function goToNextFromLifestyle() {
    if (userData.lifestyle.length === 0) {
        alert("Lütfen en az bir seçenek işaretleyin.");
        return;
    }

    console.log("Seçilen yaşam tarzı özellikleri:", userData.lifestyle);

    // Geçişi aktif ettik (16. Adım gizlendiği an içindeki sabit bar da otomatik gizlenecek)
    changeScreen('step-lifestyle-female', 'step-goal-female');
}

// Adım 17: Hedef seçildiğinde çalışacak (Tekli Seçim)
function selectGoalFemale(goalValue) {
    userData.primaryGoal = goalValue;
    console.log("Birincil hedef kaydedildi:", userData);

    // Ara sayfa olmadan doğrudan yeni soruya uçuyoruz!
    changeScreen('step-goal-female', 'step-styles-female');
}
// Adım 18: Çoklu seçim (Hitap Eden Stiller) işaretleme fonksiyonu
function toggleStyle(element, styleValue) {
    const icon = element.querySelector('.style-check');
    const index = userData.appealingStyles.indexOf(styleValue);
    const nextBtn = document.getElementById('stylesNextBtn');

    if (index === -1) {
        userData.appealingStyles.push(styleValue);
        element.style.background = '#f9f5ff';
        element.style.borderColor = '#8b5cf6';
        icon.classList.remove('bi-square');
        icon.classList.add('bi-check-square-fill');
    } else {
        userData.appealingStyles.splice(index, 1);
        element.style.background = '#fff';
        element.style.borderColor = '#eee';
        icon.classList.remove('bi-check-square-fill');
        icon.classList.add('bi-square');
    }

    // Seçim varsa butonu aktif et
    if (userData.appealingStyles.length > 0) {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
    }
}

// Adım 18'den (Stiller) Adım 19'a geçiş
function goToNextFromStyles() {
    if (userData.appealingStyles.length === 0) {
        alert("Lütfen en az bir stil işaretleyin.");
        return;
    }

    console.log("Seçilen stiller:", userData.appealingStyles);

    // Geçişi aktif ettik (18. Adım çoklu seçim olduğu için butonla geçiliyor)
    changeScreen('step-styles-female', 'step-target-length-female');
}

// Adım 19'dan Adım 20'ye geçiş
function selectTargetLengthFemale(lengthValue) {
    userData.targetLength = lengthValue;
    console.log("Hedeflenen uzunluk kaydedildi:", userData);

    // Geçişi aktif ettik
    changeScreen('step-target-length-female', 'step-style-elements-female');
}

// Adım 20: Çoklu seçim (Stil Elementleri) işaretleme fonksiyonu
function toggleStyleElement(element, elementValue) {
    const icon = element.querySelector('.element-check');
    const index = userData.styleElements.indexOf(elementValue);
    const nextBtn = document.getElementById('styleElementsNextBtn');

    if (index === -1) {
        // Seçildiyse
        userData.styleElements.push(elementValue);
        element.style.background = '#f9f5ff';
        element.style.borderColor = '#8b5cf6';
        icon.classList.remove('bi-square');
        icon.classList.add('bi-check-square-fill');
    } else {
        // Seçim kaldırıldıysa
        userData.styleElements.splice(index, 1);
        element.style.background = '#fff';
        element.style.borderColor = '#eee';
        icon.classList.remove('bi-check-square-fill');
        icon.classList.add('bi-square');
    }

    // Seçim varsa butonu aktif et
    if (userData.styleElements.length > 0) {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
    }
}

// Adım 20'den Adım 21'e geçiş
function goToNextFromStyleElements() {
    if (userData.styleElements.length === 0) {
        alert("Lütfen en az bir stil detayı işaretleyin.");
        return;
    }

    console.log("Seçilen stil detayları:", userData.styleElements);

    // Geçişi aktif ettik
    changeScreen('step-style-elements-female', 'step-styling-time-female');
}
// Adım 21'den Adım 22'ye geçiş
function selectStylingTimeFemale(timeValue) {
    userData.stylingTime = timeValue;
    console.log("Şekillendirme süresi kaydedildi:", userData);

    // Geçişi aktif ettik
    changeScreen('step-styling-time-female', 'step-wash-frequency-female');
}
// Adım 22'den Adım 23'e geçiş
function selectWashFrequencyFemale(frequencyValue) {
    userData.washFrequency = frequencyValue;
    console.log("Yıkama sıklığı kaydedildi:", userData);

    // Geçişi aktif ettik
    changeScreen('step-wash-frequency-female', 'step-typical-lifestyle-female');
}
// Adım 23: Çoklu seçim (Tipik Yaşam Tarzı) işaretleme fonksiyonu
function toggleTypicalLifestyle(element, lifestyleValue) {
    const icon = element.querySelector('.typical-check');
    const index = userData.typicalLifestyle.indexOf(lifestyleValue);
    const nextBtn = document.getElementById('typicalLifestyleNextBtn');

    if (index === -1) {
        // Seçildiyse
        userData.typicalLifestyle.push(lifestyleValue);
        element.style.background = '#f9f5ff';
        element.style.borderColor = '#8b5cf6';
        icon.classList.remove('bi-square');
        icon.classList.add('bi-check-square-fill');
    } else {
        // Seçim kaldırıldıysa
        userData.typicalLifestyle.splice(index, 1);
        element.style.background = '#fff';
        element.style.borderColor = '#eee';
        icon.classList.remove('bi-check-square-fill');
        icon.classList.add('bi-square');
    }

    // Seçim varsa butonu aktif et
    if (userData.typicalLifestyle.length > 0) {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
    }
}

// Adım 23'ten Adım 24'e geçiş
function goToNextFromTypicalLifestyle() {
    if (userData.typicalLifestyle.length === 0) {
        alert("Lütfen en az bir yaşam tarzı işaretleyin.");
        return;
    }

    console.log("Seçilen tipik yaşam tarzları:", userData.typicalLifestyle);

    // Geçişi aktif ettik (Sabit bar sayfa değişince otomatik gizlenecek)
    changeScreen('step-typical-lifestyle-female', 'step-climate-female');
}
// Adım 24'ten Adım 25'e geçiş
function selectClimateFemale(climateValue) {
    userData.climate = climateValue;
    console.log("İklim kaydedildi:", userData);

    // Geçişi aktif ettik
    changeScreen('step-climate-female', 'step-styling-tools-female');
}

// Adım 25: Çoklu seçim (Şekillendirme Araçları) işaretleme fonksiyonu
function toggleStylingTools(element, toolValue) {
    const icon = element.querySelector('.tools-check');
    const index = userData.stylingTools.indexOf(toolValue);
    const nextBtn = document.getElementById('stylingToolsNextBtn');

    if (index === -1) {
        // Seçildiyse
        userData.stylingTools.push(toolValue);
        element.style.background = '#f9f5ff';
        element.style.borderColor = '#8b5cf6';
        icon.classList.remove('bi-square');
        icon.classList.add('bi-check-square-fill');
    } else {
        // Seçim kaldırıldıysa
        userData.stylingTools.splice(index, 1);
        element.style.background = '#fff';
        element.style.borderColor = '#eee';
        icon.classList.remove('bi-check-square-fill');
        icon.classList.add('bi-square');
    }

    // Seçim varsa butonu aktif et
    if (userData.stylingTools.length > 0) {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
    }
}


// Adım 25'ten Adım 26'ya (Matches Found) geçiş
function goToNextFromStylingTools() {
    if (userData.stylingTools.length === 0) {
        alert("Lütfen en az bir araç işaretleyin.");
        return;
    }

    console.log("Seçilen şekillendirme araçları:", userData.stylingTools);

    // Matches ekranını dinamik verilerle doldur
    populateMatchesScreen();

    // Matches Found ekranına geç
    changeScreen('step-styling-tools-female', 'step-matches-found');
}

// Adım 26: Matches ekranını userData'ya göre dinamik doldur
function populateMatchesScreen() {

    // ---- FACE STRATEGY (Yüz Şekline Göre) ----
    const faceStrategyMap = {
        'oval': 'Highlighting your natural balance for your oval face',
        'round': 'Lengthening & slimming styles for your round face',
        'square': 'Softening the angles of your strong square jaw',
        'heart': 'Balancing your forehead for your heart-shaped face',
        'oblong': 'Adding width & volume for your long face shape',
        'diamond': 'Playing up your cheekbones for your diamond face',
        'triangle': 'Framing & lifting the top for your triangle face'
    };

    // ---- TEXTURE MATCH (Saç Dokusuna Göre) ----
    const textureMap = {
        'straight': 'Volume & movement for your sleek straight hair',
        'wavy': 'Debulking & flow for your thick waves',
        'curly': 'Shape & definition for your beautiful curls',
        'coily': 'Moisture-rich styles for your coily texture'
    };

    // ---- DAILY ROUTINE (Şekillendirme Süresine Göre) ----
    const routineMap = {
        '5min': 'Quick wash-and-go styles for your busy mornings',
        '15min': 'Effortless styles for your 15-minute routine',
        '30min': 'Rewarding styles for your moderate styling time',
        '60min': 'Polished looks for your dedicated styling sessions',
        'varies': 'Flexible styles that adapt to your changing schedule'
    };

    // ---- PRIMARY GOAL (Hedef Saç Stiline Göre) ----
    const goalMap = {
        'fresh_update': 'Modern & fresh updates to your current style',
        'transform': 'Bold transformation for a whole new look',
        'maintain': 'Refined tweaks to perfect your signature style',
        'trend': 'On-trend picks tailored to your features',
        'confidence': 'Confidence-boosting styles made for you',
        'low_maintenance': 'Low-maintenance looks that still turn heads'
    };

    // DOM'a yaz (fallback ile)
    document.getElementById('match-face-strategy').textContent =
        faceStrategyMap[userData.faceShape] || 'Personalized strategy for your unique face shape';

    document.getElementById('match-texture').textContent =
        textureMap[userData.texture] || 'Custom match for your hair texture';

    document.getElementById('match-routine').textContent =
        routineMap[userData.stylingTime] || 'Styles perfectly suited to your daily routine';

    document.getElementById('match-goal').textContent =
        goalMap[userData.primaryGoal] || 'Styles fully aligned with your hair goals';
}

// Adım 26'dan Adım 27'ye (Style Directions) geçiş
function goToStyleDirections() {
    changeScreen('step-matches-found', 'step-style-directions');
}

// Adım 27'den Adım 28'e (Photo Intro) geçiş
function goToPhotoIntro() {
    changeScreen('step-style-directions', 'step-photo-intro');
}

// Adım 28'den sonraki adıma geçiş (Sonuçlar / Results)
function goToResults() {
    console.log("Sonuçlara geçiliyor. Tüm kullanıcı verisi:", userData);
    // Sonuç sayfasına yönlendir (hazır olduğunda aktif et):
    // changeScreen('step-photo-intro', 'step-results');
    // Şimdilik: alert ile test
    alert("🎉 Tebrikler! Profiliniz hazır.\n\nBir sonraki adımda AI try-on sonuçlarınız görüntülenecek.");
}

function selectTexture(textureValue) {
    userData.texture = textureValue;
    alert("Seçilen Doku: " + textureValue + "\nCinsiyet: " + userData.gender + (userData.age ? "\nYaş: " + userData.age : ""));
}