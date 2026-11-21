import { TAUXILIO_CONFIG } from './config.js';

const client = window.supabase
    ? window.supabase.createClient(TAUXILIO_CONFIG.supabaseUrl, TAUXILIO_CONFIG.supabaseKey)
    : null;

function mapDbToProfile(item) {
    return {
        id: item.id,
        pin: item.pin,
        tipo: item.tipo,
        nombre: item.nombre,
        apellido: item.apellido,
        edad: item.edad,
        discapacidad: item.discapacidad,
        direccion: item.direccion,
        fotoPortador: item.foto_portador || TAUXILIO_CONFIG.defaultAvatars.portador,
        mamaNombre: item.mama_nombre,
        mamaTel: item.mama_tel,
        papaNombre: item.papa_nombre || '',
        papaTel: item.papa_tel || '',
        auxNombre: item.aux_nombre || '',
        auxTel: item.aux_tel || ''
    };
}

function mapProfileToDb(profile) {
    return {
        id: profile.id,
        pin: profile.pin,
        tipo: profile.tipo,
        nombre: profile.nombre,
        apellido: profile.apellido,
        edad: profile.edad,
        discapacidad: profile.discapacidad,
        direccion: profile.direccion,
        foto_portador: profile.fotoPortador,
        mama_nombre: profile.mamaNombre,
        mama_tel: profile.mamaTel,
        papa_nombre: profile.papaNombre || '',
        papa_tel: profile.papaTel || '',
        aux_nombre: profile.auxNombre || '',
        aux_tel: profile.auxTel || ''
    };
}

function readLocal() {
    try {
        const raw = localStorage.getItem(TAUXILIO_CONFIG.localStorageKey);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeLocal(list) {
    try {
        localStorage.setItem(TAUXILIO_CONFIG.localStorageKey, JSON.stringify(list));
    } catch {
        // Ignorar errores de cuota de almacenamiento local
    }
}

export async function loadProfiles() {
    if (!client) {
        return { profiles: readLocal(), fromCloud: false };
    }

    try {
        const { data, error } = await client.from(TAUXILIO_CONFIG.tableName).select('*');
        if (error) throw error;
        const mapped = (data || []).map(mapDbToProfile);
        writeLocal(mapped);
        return { profiles: mapped, fromCloud: true };
    } catch {
        return { profiles: readLocal(), fromCloud: false };
    }
}

export async function saveProfile(profile) {
    const current = readLocal();
    const idx = current.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
        current[idx] = profile;
    } else {
        current.push(profile);
    }
    writeLocal(current);

    if (!client) {
        return { ok: true, savedCloud: false };
    }

    try {
        const { error } = await client
            .from(TAUXILIO_CONFIG.tableName)
            .upsert(mapProfileToDb(profile));
        if (error) throw error;
        return { ok: true, savedCloud: true };
    } catch {
        return { ok: true, savedCloud: false };
    }
}

export async function uploadCarrierPhoto(file, profileId) {
    if (!client) return null;

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${profileId}_${Date.now()}.${ext}`;

    const { error } = await client.storage
        .from(TAUXILIO_CONFIG.bucketName)
        .upload(path, file, { upsert: true });

    if (error) return null;

    const { data } = client.storage
        .from(TAUXILIO_CONFIG.bucketName)
        .getPublicUrl(path);

    return data?.publicUrl || null;
}