import debounce from 'lodash/debounce';

const header = document.querySelector('.header')
const desktopNav = document.getElementById('desktop-nav');

desktopNav.querySelectorAll('a').forEach(function(el){
    el.addEventListener('click', function(event) {
        event.preventDefault();
        handleJump(el);
    })
})

function handleJump(el) {
    const getAnchor = el.getAttribute('href');
    const getElement = document.querySelector(getAnchor)
    const targetOffset = getElement.offsetTop;
    document.documentElement.scrollTop = targetOffset - getHeaderHeight(header);
}

function getHeaderHeight(el) {
    return el.clientHeight;
}

function mobNav(toggler, menu) {
    const mobTog = document.getElementById(toggler);
    const mobNav = document.getElementById(menu);

    let mobileMenuActive = false;

    function toggleTog() {
        mobileMenuActive = !mobileMenuActive
    }

    function toggleNav() {
        if (mobileMenuActive) {
            mobNav.classList.remove('is-active')
        } else {
            mobNav.classList.add('is-active')
        }
        toggleTog()
    }

    mobTog.addEventListener('click', function () {
        toggleNav()
    })

    mobNav.querySelectorAll('a').forEach(function(el){
        el.addEventListener('click', function(event) {
            event.preventDefault();
            handleJump(el);
            toggleNav()
        })
    })
    return {
        hide: function () {
            toggleNav()
        },
        isvisible: function () {
            return mobileMenuActive;
        }
    }
}

const menu = mobNav('toggle-mob-nav', 'mob-nav')

function hideMobNav() {
    if (menu.isvisible() && window.innerWidth > 991) {
        menu.hide()
    }
}

window.addEventListener('resize', debounce(hideMobNav, 200))