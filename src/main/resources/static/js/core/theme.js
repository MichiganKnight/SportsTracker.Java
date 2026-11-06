const themeToggle = document.getElementById('themeToggle');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    localStorage.setItem('theme', theme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        setTheme(savedTheme);
        
        return;
    }
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setTheme(prefersDark ? 'dark' : 'light');
}

themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');

    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

loadTheme();