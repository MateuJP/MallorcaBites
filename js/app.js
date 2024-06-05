document.addEventListener('DOMContentLoaded', function (e) {
    iniciarApp();
})
function iniciarApp() {
    dateFooter();
    //navHeader();
    navMobile();
    navLinks();
    navLinksMobile();
}


function dateFooter() {
    document.getElementById('year').textContent = new Date().getFullYear();
}

function navHeader() {
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', function () {
            if (this.window.scrollY > 200) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });

    }

}
function navMobile() {
    const iconMobile = document.querySelector('.mobile-nav-toggle');
    iconMobile.addEventListener('click', function () {
        const nav = document.getElementById('navbar');
        nav.classList.toggle('navbar-mobile');
        if (nav.classList.contains('navbar-mobile')) {
            iconMobile.classList.remove('bi-list');
            iconMobile.classList.add('bi-x');
        } else {
            iconMobile.classList.remove('bi-x');
            iconMobile.classList.add('bi-list')
        }
    })
}
function navLinks() {
    const navBarLinks = document.querySelectorAll('#navbar .scrollto');
    window.addEventListener('scroll', function () {
        let position = window.scrollY + window.innerHeight / 2;

        let sectionDetected = false;

        navBarLinks.forEach(navBarLink => {
            if (!navBarLink.hash) return;
            let section = document.querySelector(navBarLink.hash);
            if (!section) return;

            if (section.offsetTop < position && (section.offsetTop + section.offsetHeight) > position) {
                sectionDetected = true;
                navBarLinks.forEach(link => link.classList.remove('active'));
                navBarLink.classList.add('active');
            }
        });

        if (!sectionDetected && (window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            navBarLinks.forEach(link => link.classList.remove('active'));
            navBarLinks[navBarLinks.length - 1].classList.add('active');
        }
    });
}

function navLinksMobile() {
    const navBarLinks = document.querySelectorAll('#navbar .scrollto');
    const nav = document.getElementById('navbar'); // Obtén la barra de navegación
    const iconMobile = document.querySelector('.mobile-nav-toggle'); // Obtén el ícono del menú móvil

    navBarLinks.forEach(navBarLink => {
        navBarLink.addEventListener('click', function () {
            // Verifica si el menú móvil está activo
            if (nav.classList.contains('navbar-mobile')) {
                // Oculta el menú móvil
                nav.classList.remove('navbar-mobile');
                // Cambia el ícono a la lista (o el ícono inicial)
                iconMobile.classList.remove('bi-x');
                iconMobile.classList.add('bi-list');
            }
        });
    });
}