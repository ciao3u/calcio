// VARIABILI GLOBALI
let currentSlide = 0;
let soundEnabled = true;

// EFFETTI SONORI (Usando Web Audio API)
function createAudioContext() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return audioContext;
    } catch (e) {
        console.log('Web Audio API non supportato');
        return null;
    }
}

const audioContext = createAudioContext();

// SUONI STADIO
function playStadiumSound() {
    if (!audioContext || !soundEnabled) return;
    
    const now = audioContext.currentTime;
    const duration = 1;
    
    // Creiamo un suono di folla (white noise filtrato)
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    
    // Filtro passa-basso per render il suono più "naturale"
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    
    // Envelope per il volume
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    
    whiteNoise.start(now);
    whiteNoise.stop(now + duration);
    
    // Suono di applauso (serie di click)
    for (let i = 0; i < 10; i++) {
        const clickBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const clickData = clickBuffer.getChannelData(0);
        
        for (let j = 0; j < clickData.length; j++) {
            clickData[j] = Math.random() * 0.5 - 0.25;
        }
        
        const click = audioContext.createBufferSource();
        click.buffer = clickBuffer;
        
        const clickGain = audioContext.createGain();
        clickGain.gain.setValueAtTime(0.2, now + i * 0.1);
        clickGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.1);
        
        click.connect(clickGain);
        clickGain.connect(audioContext.destination);
        
        click.start(now + i * 0.1);
        click.stop(now + i * 0.1 + 0.1);
    }
}

// BLEEP AL CLICK
function playClickSound(frequency = 800, duration = 0.1) {
    if (!audioContext || !soundEnabled) return;
    
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
}

// TOGGLE SUONI
function toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
        playStadiumSound();
    }
}

// SLIDER CAMPIONATI
function nextSlide() {
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    
    if (slides.length === 0) return;
    
    currentSlide = (currentSlide + 1) % slides.length;
    const scrollAmount = slides[currentSlide].offsetLeft - 100;
    
    slider.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
    });
    
    playClickSound(900);
}

function prevSlide() {
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    
    if (slides.length === 0) return;
    
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    const scrollAmount = slides[currentSlide].offsetLeft - 100;
    
    slider.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
    });
    
    playClickSound(700);
}

// GESTIONE CAMPIONATI
function handleCampionatoClick(campionato) {
    playClickSound(1000, 0.15);
    console.log('Cliccato: ' + campionato);
    
    // Mostrare una notifica (opzionale)
    showNotification(campionato + ' selezionato!');
}

// NOTIFICA
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 2000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// ANIMAZIONE SLIDE IN/OUT
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// VIDEO
function playVideo(title) {
    playClickSound(1200, 0.2);
    
    const modal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');
    const videoTitle = document.getElementById('videoTitle');
    
    // Generiamo un URL fake (nella realtà useremmo video veri)
    const videoId = 'dQw4w9WgXcQ'; // Esempio: YouTube ID
    const youtubeUrl = `https://www.youtube.com/embed/${videoId}`;
    
    videoFrame.src = youtubeUrl;
    videoTitle.textContent = title;
    modal.style.display = 'block';
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');
    
    modal.style.display = 'none';
    videoFrame.src = '';
}

// Chiudere il modal facendo click fuori
window.onclick = function(event) {
    const modal = document.getElementById('videoModal');
    if (event.target === modal) {
        closeVideoModal();
    }
}

// TABS RISULTATI
function switchTab(tabName) {
    playClickSound(850, 0.12);
    
    // Nascondi tutti i tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Rimuovi la classe active da tutti i bottoni
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostra il tab selezionato
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Aggiungi la classe active al bottone cliccato
    event.target.classList.add('active');
}

// ANIMAZIONI AL CARICAMENTO
function initAnimations() {
    // Osserva gli elementi quando entrano nella viewport
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Osserva le card
    document.querySelectorAll('.player-card, .video-card, .match-card').forEach(card => {
        observer.observe(card);
    });
}

// EFFETTO PARALLAX LEGGERO
window.addEventListener('scroll', () => {
    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) {
        const scrollY = window.scrollY;
        welcomeSection.style.backgroundPosition = `0 ${scrollY * 0.5}px`;
    }
});

// ANIMAZIONE CONTATORES RISULTATI
function animateScores() {
    const scores = document.querySelectorAll('.score');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = parseInt(target.textContent);
                let currentValue = 0;
                
                const increment = Math.ceil(finalValue / 30);
                const interval = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= finalValue) {
                        currentValue = finalValue;
                        clearInterval(interval);
                    }
                    target.textContent = currentValue;
                }, 30);
                
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    scores.forEach(score => observer.observe(score));
}

// EFFETTO GLOW AL PASSAGGIO
document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    document.documentElement.style.setProperty('--mouse-x', x);
    document.documentElement.style.setProperty('--mouse-y', y);
});

// EASTER EGG: SCUOTI IL PALLONE
document.addEventListener('keydown', (e) => {
    if (e.key === 'b' || e.key === 'B') {
        const ball = document.querySelector('.ball-bounce');
        if (ball) {
            ball.style.animation = 'spin 0.5s ease-in-out';
            playStadiumSound();
            
            setTimeout(() => {
                ball.style.animation = 'bounce 2s infinite, spin 3s infinite linear';
            }, 500);
        }
    }
});

// DOPPIO CLICK PER CELEBRARE
let clickCount = 0;
let lastClickTime = 0;

document.addEventListener('click', (e) => {
    const now = Date.now();
    
    if (now - lastClickTime < 300) {
        clickCount++;
    } else {
        clickCount = 1;
    }
    
    lastClickTime = now;
    
    if (clickCount === 2) {
        // Celebrazione con suono
        playStadiumSound();
        
        // Crea coriandoli
        createConfetti(e.clientX, e.clientY);
        
        clickCount = 0;
    }
});

// CORIANDOLI
function createConfetti(x, y) {
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 10px;
            height: 10px;
            background: ${['#ff6b6b', '#4ecdc4', '#ffd700', '#ff4757', '#2e86de'][Math.floor(Math.random() * 5)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: fall ${1 + Math.random() * 1}s ease-in forwards;
        `;
        
        const angle = (Math.PI * 2 * i) / 20;
        const velocity = 5 + Math.random() * 5;
        const tx = Math.cos(angle) * velocity * 20;
        const ty = Math.sin(angle) * velocity * 20;
        
        confetti.style.setProperty('--tx', tx + 'px');
        confetti.style.setProperty('--ty', ty + 'px');
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 2000);
    }
}

// Aggiungi la keyframe per il fall
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes fall {
        to {
            transform: translate(var(--tx), var(--ty)) rotateZ(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// INIZIALIZZAZIONE
document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    animateScores();
    
    // Attiva i suoni al caricamento
    playStadiumSound();
    
    // Log di benvenuto
    console.log('⚽ Benvenuto su CalcioPassione!');
    console.log('Suggerimento: Premi "B" per scuotere il pallone');
    console.log('Doppio click per celebrare!');
});

// GEOLOCALIZZAZIONE E NOTIFICHE (opzionale)
if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('CalcioPassione', {
        body: 'Benvenuto! Non perderti gli aggiornamenti!',
        icon: '⚽'
    });
}
