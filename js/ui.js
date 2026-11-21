import { TAUXILIO_CONFIG } from './config.js';

export function showView(viewId) {
    document.querySelectorAll('.view-panel').forEach((el) => el.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.target === viewId);
    });
}

export function setEmergencyOnlyMode(enabled) {
    const header = document.getElementById('top-header');
    const selectorWrap = document.getElementById('preview-selector-wrap');
    if (header) header.style.display = enabled ? 'none' : '';
    if (selectorWrap) selectorWrap.style.display = enabled ? 'none' : '';
}

export function setStatusMessage(id, text, isError = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? '#b91c1c' : '#475569';
}

export function fillProfileSelects(profiles, activeId) {
    const selects = [
        document.getElementById('select-qr-profile'),
        document.getElementById('select-preview-profile')
    ];

    selects.forEach((sel) => {
        if (!sel) return;
        sel.innerHTML = '';
        profiles.forEach((p) => {
            const opt = document.createElement('option');
            opt.value = p.id;
            const kind = p.tipo === 'mascota' ? 'Mascota' : 'Persona';
            opt.textContent = `${p.nombre} ${p.apellido || ''} (${kind})`;
            sel.appendChild(opt);
        });
        if (activeId) sel.value = activeId;
    });
}

export function resetForms() {
    const pForm = document.getElementById('form-persona');
    const mForm = document.getElementById('form-mascota');
    if (pForm) pForm.reset();
    if (mForm) mForm.reset();

    document.getElementById('p-id').value = '';
    document.getElementById('p-foto-url').value = '';
    document.getElementById('p-foto-preview').src = TAUXILIO_CONFIG.defaultAvatars.portador;

    document.getElementById('m-id').value = '';
    document.getElementById('m-foto-url').value = '';
    document.getElementById('m-foto-preview').src = TAUXILIO_CONFIG.defaultAvatars.portador;

    setStatusMessage('p-status', '');
    setStatusMessage('m-status', '');
}

export function renderEmergencyCard(profile) {
    const container = document.getElementById('emergency-card-container');
    if (!container) return;

    if (!profile) {
        container.innerHTML = '<div style="padding:1.5rem;text-align:center;">No hay un perfil seleccionado.</div>';
        return;
    }

    const isPet = profile.tipo === 'mascota';
    const bannerTitle = isPet ? '¡ESTOY PERDIDO!' : '¡NECESITO AYUDA!';
    const bannerTag = isPet ? 'Auxilio Mascota' : 'Perfil de Auxilio ID';
    const conditionLabel = isPet ? 'Cuidados / Observaciones' : 'Condición / Diagnóstico';
    const mainContactRole = isPet ? 'Dueño / Responsable' : 'Mamá / Tutor 1';
    const addressLabel = isPet ? 'Domicilio del Responsable' : 'Dirección de Residencia';

    const papaHtml = !isPet && profile.papaNombre
        ? `
        <div class="contact-item papa">
            <div class="contact-role">Papá / Tutor 2</div>
            <div class="contact-name">${profile.papaNombre}</div>
            <div class="contact-phone">${profile.papaTel}</div>
            <a href="tel:${profile.papaTel}" class="call-btn call-papa">📞 Llamar a Papá</a>
        </div>`
        : '';

    const auxHtml = !isPet && profile.auxNombre
        ? `
        <div class="contact-item aux">
            <div class="contact-role">Contacto Secundario</div>
            <div class="contact-name">${profile.auxNombre}</div>
            <div class="contact-phone">${profile.auxTel}</div>
            <a href="tel:${profile.auxTel}" class="call-btn call-aux">📲 Llamar a Contacto de Auxilio</a>
        </div>`
        : '';

    container.innerHTML = `
        <div class="emergency-banner">
            <span class="emergency-tag">${bannerTag}</span>
            <h2>${bannerTitle}</h2>
        </div>

        <div class="emergency-body">
            <div class="carrier-box">
                <img
                    src="${profile.fotoPortador || TAUXILIO_CONFIG.defaultAvatars.portador}"
                    alt="${profile.nombre}"
                    class="carrier-photo"
                    onerror="this.src='${TAUXILIO_CONFIG.defaultAvatars.portador}'"
                >
                <div class="carrier-name">${profile.nombre} ${profile.apellido || ''}</div>
                <div class="carrier-meta">${profile.edad || ''}</div>
            </div>

            <div class="alert-box">
                <div class="alert-label">⚠️ ${conditionLabel}</div>
                <div class="alert-value">${profile.discapacidad || 'Sin observaciones'}</div>
            </div>

            <div class="contact-list">
                <div class="contact-item mama">
                    <div class="contact-role">${mainContactRole}</div>
                    <div class="contact-name">${profile.mamaNombre}</div>
                    <div class="contact-phone">${profile.mamaTel}</div>
                    <a href="tel:${profile.mamaTel}" class="call-btn call-mama">📞 Llamar a ${isPet ? 'Responsable' : 'Mamá'}</a>
                </div>
                ${papaHtml}
                ${auxHtml}
            </div>

            <div class="address-card">
                <div class="contact-role">🏠 ${addressLabel}</div>
                <div class="contact-name" style="font-size:0.92rem;">${profile.direccion}</div>
            </div>

            <div class="public-services">
                <div class="public-services-title">Emergencias Públicas</div>
                <div class="public-grid">
                    <a href="tel:911" class="call-btn" style="background-color:#0284c7;">🚓 Policía (911)</a>
                    <a href="tel:107" class="call-btn" style="background-color:#16a34a;">🚑 Ambulancia (107)</a>
                </div>
            </div>
        </div>
    `;
}