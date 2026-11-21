export function renderProfileQR(profile) {
    const qrTarget = document.getElementById('qr-code-render');
    const printQrTarget = document.getElementById('print-qr-render');
    if (!qrTarget || !profile) return;

    qrTarget.innerHTML = '';
    if (printQrTarget) printQrTarget.innerHTML = '';

    const baseUrl = window.location.origin + window.location.pathname;
    const qrUrl = `${baseUrl}?id=${encodeURIComponent(profile.id)}`;

    if (typeof window.QRCode === 'function') {
        new window.QRCode(qrTarget, {
            text: qrUrl,
            width: 184,
            height: 184,
            colorDark: '#0f172a',
            colorLight: '#ffffff',
            correctLevel: window.QRCode.CorrectLevel.H
        });

        if (printQrTarget) {
            new window.QRCode(printQrTarget, {
                text: qrUrl,
                width: 200,
                height: 200,
                colorDark: '#0f172a',
                colorLight: '#ffffff',
                correctLevel: window.QRCode.CorrectLevel.H
            });
        }
    }

    const titleEl = document.getElementById('qr-profile-caption');
    if (titleEl) {
        titleEl.textContent = `${profile.nombre} ${profile.apellido || ''}`.trim();
    }
}