setInterval(() => {
    document.querySelectorAll('[id*="chat"], [class*="widget"]').forEach(el => el.remove());
    console.clear();
    console.log("Acesso negado.");
}, 500);
