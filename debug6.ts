import { _exe_ } from './src/structexe';

const rawData = {
    app: {
        nombre: "Mi App Básica",
        versiones: [1, 2]
    },
    ajustes: new Map([['idioma', 'es']]),
    etiquetas: new Set(['urgente'])
};

const store_typed = _exe_.newStruct_exe_(rawData);

_exe_.set(store_typed, 'usuarios|0|perfil|avatar', "http://imagen.png");

// Try to subscribe
_exe_.react(store_typed, "/|usuarios|0|perfil|avatar", (cambio: any) => {
    console.log("📢 El avatar ha cambiado a:", cambio.datoNuevo);
});

console.log("Setting value...");
(store_typed as any).usuarios[0].perfil.avatar = "http://nuevo-avatar.jpg";
console.log("Values assigned.");
