import { atom } from 'recoil';

export const uploadPercent = atom({
    key: 'uploadPercent',
    default: 0,
});

export const videoSelection = atom({
    key: 'videoSelection',
    default: ['', {}],
});

export const currentAudio = atom({
    key: 'currentAudio',
    default: ['', 'stopped'],
});

export const switchFocus = atom({
    key: 'switchFocus',
    default: true,
});

export const isFullscreen = atom({
    key: 'isFullscreen',
    default: false,
});

export const primaryData = atom({
    key: 'primaryData',
    default: {},
});

export const secondaryData = atom({
    key: 'secondaryData',
    default: {},
});

export const ContentType = atom({
    key: 'ContentType',
    default: 'a',
});

export const titles = atom({
    key: "titles",
    default: [],
});

export const allPodcasts = atom({
    key: "allPodcasts",
    default: [],
});

export const input = atom({
    key: "input",
    default: ""
});