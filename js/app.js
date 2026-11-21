import { TAUXILIO_CONFIG } from './config.js';
import { loadProfiles, saveProfile, uploadCarrierPhoto } from './storage.js';
import {
    showView,
    setEmergencyOnlyMode,
    setStatusMessage,
    fillProfileSelects,
    resetForms,
    renderEmergencyCard
} from './ui.js';
import { renderProfileQR } from './qr.js';

const SAMPLE_PROFILE = {
    id: 'sample-01',
    pin: '1234',
    tipo: 'persona',
    nombre: 'Mateo',
    apellido: 'González',
    edad: '7 años',
    discapacidad: 'Autismo (TEA - Sensibilidad auditiva)',
    direccion: 'Calle Principal 456, San Rafael',
    fotoPortador: TAUXILIO_CONFIG.defaultAvatars.portador,
    mamaNombre: 'Laura Pérez',
    mamaTel: '+5492604123456',
    papaNombre: 'Carlos González',
    papaTel: '+5492604654321',
    auxNombre: 'Roberto González (Abuelo)',
    auxTel: '+5492604555444'
};

let profiles = [];
let activeProfileId = null;

function setActiveProfile(id) {
    activeProfileId = id;
    const current = profiles.find((p) => p.id === id) || profiles[0] || null;
    fillProfileSelects(profiles, current ? current.id : null);
    renderEmergencyCard(current);
    renderProfileQR(current);
}

async function handlePhotoChange(event, previewId, hiddenId, statusId) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        setStatusMessage(statusId, 'La imagen debe pesar menos de 5 MB.', true);
        return;
    }

    const previewImg = document.getElementById(previewId);
    if (previewImg) {
        previewImg.src = URL.createObjectURL(file);
    }

    setStatusMessage(statusId, 'Subiendo foto...');
    const tempId = document.getElementById('p-id')?.value || document.getElementById('m-id')?.value || `temp_${Date.now()}`;
    const publicUrl = await uploadCarrierPhoto(file, tempId);

    if (publicUrl) {
        document.getElementById(hiddenId).value = publicUrl;
        setStatusMessage(statusId, 'Foto lista.');
    } else {
        setStatusMessage(statusId, 'No se pudo subir a la nube; se usará vista local.', true);
    }
}

async function handlePersonaSubmit(event) {
    event.preventDefault();
    const pin = document.getElementById('p-pin').value.trim();
    if (!/^\d{4}$/.test(pin)) {
        setStatusMessage('p-status', 'El PIN debe tener 4 números.', true);
        return;
    }

    const id = document.getElementById('p-id').value || `id_${Date.now()}`;
    const profile = {
        id,
        pin,
        tipo: 'persona',
        nombre: document.getElementById('p-nombre').value.trim(),
        apellido: document.getElementById('p-apellido').value.trim(),
        edad: document.getElementById('p-edad').value.trim(),
        discapacidad: document.getElementById('p-condicion').value.trim(),
        direccion: document.getElementById('p-direccion').value.trim(),
        fotoPortador: document.getElementById('p-foto-url').value || TAUXILIO_CONFIG.defaultAvatars.portador,
        mamaNombre: document.getElementById('p-mama-nombre').value.trim(),
        mamaTel: document.getElementById('p-mama-tel').value.trim(),
        papaNombre: document.getElementById('p-papa-nombre').value.trim(),
        papaTel: document.getElementById('p-papa-tel').value.trim(),
        auxNombre: document.getElementById('p-aux-nombre').value.trim(),
        auxTel: document.getElementById('p-aux-tel').value.trim()
    };

    const idx = profiles.findIndex((p) => p.id === id);
    if (idx >= 0) profiles[idx] = profile;
    else profiles.push(profile);

    await saveProfile(profile);
    setActiveProfile(id);
    showView('view-qr');
}

async function handleMascotaSubmit(event) {
    event.preventDefault();
    const pin = document.getElementById('m-pin').value.trim();
    if (!/^\d{4}$/.test(pin)) {
        setStatusMessage('m-status', 'El PIN debe tener 4 números.', true);
        return;
    }

    const id = document.getElementById('m-id').value || `id_${Date.now()}`;
    const raza = document.getElementById('m-raza').value.trim();
    const profile = {
        id,
        pin,
        tipo: 'mascota',
        nombre: document.getElementById('m-nombre').value.trim(),
        apellido: raza ? `(${raza})` : '',
        edad: document.getElementById('m-edad').value.trim(),
        discapacidad: document.getElementById('m-cuidados').value.trim(),
        direccion: document.getElementById('m-direccion').value.trim(),
        fotoPortador: document.getElementById('m-foto-url').value || TAUXILIO_CONFIG.defaultAvatars.portador,
        mamaNombre: document.getElementById('m-dueno').value.trim(),
        mamaTel: document.getElementById('m-tel').value.trim(),
        papaNombre: '',
        papaTel: '',
        auxNombre: '',
        auxTel: ''
    };

    const idx = profiles.findIndex((p) => p.id === id);
    if (idx >= 0) profiles[idx] = profile;
    else profiles.push(profile);

    await saveProfile(profile);
    setActiveProfile(id);
    showView('view-qr');
}

function bindEvents() {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            showView(target);
            if (target === 'view-qr' || target === 'view-preview') {
                setActiveProfile(activeProfileId);
            }
        });
    });

    document.getElementById('brand-home')?.addEventListener('click', () => showView('view-home'));
    document.getElementById('choose-persona')?.addEventListener('click', () => {
        resetForms();
        showView('view-form-persona');
    });
    document.getElementById('choose-mascota')?.addEventListener('click', () => {
        resetForms();
        showView('view-form-mascota');
    });

    document.querySelectorAll('.btn-back-home').forEach((btn) => {
        btn.addEventListener('click', () => showView('view-home'));
    });

    document.getElementById('p-foto-file')?.addEventListener('change', (e) => {
        handlePhotoChange(e, 'p-foto-preview', 'p-foto-url', 'p-status');
    });

    document.getElementById('m-foto-file')?.addEventListener('change', (e) => {
        handlePhotoChange(e, 'm-foto-preview', 'm-foto-url', 'm-status');
    });

    document.getElementById('form-persona')?.addEventListener('submit', handlePersonaSubmit);
    document.getElementById('form-mascota')?.addEventListener('submit', handleMascotaSubmit);

    document.getElementById('select-qr-profile')?.addEventListener('change', (e) => {
        setActiveProfile(e.target.value);
    });

    document.getElementById('select-preview-profile')?.addEventListener('change', (e) => {
        setActiveProfile(e.target.value);
    });

    document.getElementById('btn-print-qr')?.addEventListener('click', () => {
        window.print();
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    bindEvents();

    const loaded = await loadProfiles();
    profiles = loaded.profiles;

    if (profiles.length === 0) {
        profiles.push(SAMPLE_PROFILE);
        await saveProfile(SAMPLE_PROFILE);
    }

    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('id');

    if (sharedId) {
        const found = profiles.find((p) => p.id === sharedId);
        setActiveProfile(found ? found.id : profiles[0].id);
        setEmergencyOnlyMode(true);
        showView('view-preview');
    } else {
        setActiveProfile(profiles[0].id);
        setEmergencyOnlyMode(false);
        showView('view-home');
    }
});