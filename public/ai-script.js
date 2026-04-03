// --- STATE MANAGEMENT (Veri Yönetimi) ---
let userData = {
    gender: '',
    age: '',
    experiment: '',
    texture: '',
    length: '',
    thickness: '',
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
    
    // Burası 4. Adım hazır olduğunda aktif edilecek
    alert("Saç deneyimi seçildi: " + expValue + ". Sırada 4. Adım var!");
    
    // changeScreen('step-experiment-female', 'step-sonraki-adim'); 
}

function selectTexture(textureValue) {
    userData.texture = textureValue;
    alert("Seçilen Doku: " + textureValue + "\nCinsiyet: " + userData.gender + (userData.age ? "\nYaş: " + userData.age : ""));
}