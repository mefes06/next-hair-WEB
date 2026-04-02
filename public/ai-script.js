let currentStep = 1;
const totalSteps = 14;

// Kullanıcının verdiği cevapları backend'e göndermek üzere toplayacağımız obje
let userPreferences = {
    gender: null,
    texture: null,
    length: null,
    // ... diğer veriler buraya eklenecek
};

function selectOption(stepNumber, key, value) {
    // Veriyi objeye kaydet
    userPreferences[key] = value;

    // Tıklanan adımdaki tüm kartlardan 'selected' class'ını temizle
    const currentStepDiv = document.getElementById(`step${stepNumber}`);
    const cards = currentStepDiv.querySelectorAll('.option-card');
    cards.forEach(card => card.classList.remove('selected'));

    // Tıklanan karta 'selected' class'ı ekle
    event.currentTarget.classList.add('selected');

    // Seçim yapıldığı için "İleri" butonunu aktif et
    document.getElementById('nextBtn').disabled = false;
}

function changeStep(direction) {
    // Mevcut adımı gizle
    document.getElementById(`step${currentStep}`).classList.remove('active');

    currentStep += direction;

    // Yeni adımı göster
    document.getElementById(`step${currentStep}`).classList.add('active');

    // İlerleme çubuğunu güncelle
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;

    // Butonların görünürlüğünü ayarla
    document.getElementById('prevBtn').style.display = (currentStep === 1) ? 'none' : 'block';

    // Eğer son adımdaysak "İleri" butonunu "Üret (Generate)" yap
    const nextBtn = document.getElementById('nextBtn');
    if (currentStep === totalSteps) {
        nextBtn.innerHTML = '<i class="bi bi-magic"></i> Yapay Zeka ile Üret';
        nextBtn.onclick = generateAIImages; // Son adımda backend'e istek atacak fonksiyon
    } else {
        nextBtn.innerHTML = 'İleri';
        nextBtn.onclick = () => changeStep(1);

        // Yeni adıma geçerken henüz seçim yapılmadıysa ileri butonunu pasif yap
        // (Eğer daha önce seçip geri geldiyse aktif kalmalı)
        nextBtn.disabled = !isStepAnswered(currentStep);
    }
}

function isStepAnswered(stepNum) {
    const currentStepDiv = document.getElementById(`step${stepNum}`);
    if (!currentStepDiv) return false;
    return currentStepDiv.querySelectorAll('.selected').length > 0;
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('previewArea').style.display = 'block';
            document.getElementById('nextBtn').disabled = false; // Fotoğraf yüklenince butonu aktif et
        }
        reader.readAsDataURL(file);
    }
}

async function generateAIImages() {
    // Burada backend'e (Node.js/Express) fetch API ile elimizdeki userPreferences objesini ve fotoğrafı göndereceğiz.
    console.log("Backend'e gönderilecek veriler:", userPreferences);
    alert("Yapay zeka üretimi başlıyor... (Backend entegrasyonu aşamasında burası dolacak)");
}