(function() {
    'use strict';
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    var body = document.body;
    var isMobile = window.innerWidth <= 768;

    window.addEventListener('resize', function() {
        isMobile = window.innerWidth <= 768;
        if (!isMobile) {
            closeSidebar();
        }
    });

    function toggleSidebar() {
        if (!isMobile) return;
        if (sidebar.classList.contains('show')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    function openSidebar() {
        sidebar.classList.add('show');
        overlay.classList.add('show');
        body.classList.add('menu-open');
    }

    function closeSidebar() {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        body.classList.remove('menu-open');
    }

    window.toggleSidebar = toggleSidebar;

    if (overlay) {
        overlay.addEventListener('click', function(e) {
            e.preventDefault();
            closeSidebar();
        });
        
        overlay.addEventListener('touchend', function(e) {
            e.preventDefault();
            closeSidebar();
        });
    }

    document.querySelectorAll('.sidebar .nav-link').forEach(function(link) {
        link.addEventListener('click', function() {
            if (isMobile) {
                closeSidebar();
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('show')) {
            closeSidebar();
        }
    });
})();
