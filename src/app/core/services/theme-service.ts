import { Injectable, signal, effect, Service } from '@angular/core';

@Service()
export class ThemeService {
    // Signal to keep track of dark mode state
    darkModeSignal = signal<boolean>(localStorage.getItem('theme') === 'dark');

    constructor() {
        // Automatically runs whenever darkModeSignal changes
        effect(() => {
            const isDark = this.darkModeSignal();

            if (isDark) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    toggleTheme() {
        this.darkModeSignal.update((value) => !value);
    }
}
