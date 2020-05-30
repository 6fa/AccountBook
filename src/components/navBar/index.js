import template from './index.html'
import './index.css'
import Config from '../../assets/config'
(function () {
  const navBar = {
    init: function () {
      const footer = document.querySelector('#footer-bar')
      footer.innerHTML = template

      this.navBar = document.querySelector('.nav-bar')
      this.navItems = this.navBar.querySelectorAll('div') // 所有选项卡元素
      let firstPath
      if (Config.mode === 'hash') {
        const state = window.location.hash
        firstPath = state ? state.slice(1) : '/'
        if (firstPath.includes('?') !== -1) {
          firstPath = firstPath.split('?')[0]
        }
      } else if (Config.mode === 'history') {
        firstPath = window.location.pathname
      }
      this.chageIcon(firstPath, this.navItems)
      this.addEvent()
    },
    addEvent: function () {
      // 点击选项卡时
      this.navBar.addEventListener('click', function (e) {
        const clickItem = e.target.parentNode // 被点击的选项卡元素
        if (!clickItem.dataset.path) return
        // 跳转
        window.$router.push(clickItem.dataset.path)
      })
      if (Config.mode === 'hash') {
        window.addEventListener('hashchange', () => {
          let state = window.location.hash
          state = state ? state.slice(1) : '/'
          if (state.includes('?') !== -1) {
            state = state.split('?')[0]
          }
          this.chageIcon(state, this.navItems)
        })
      } else if (Config.mode === 'history') {
        window.$myEvent.on('historyChange', () => {
          const state = window.location.pathname
          this.chageIcon(state, this.navItems)
        })
      }
    },
    chageIcon: function (path, items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].dataset.path === path) {
          items[i].classList.add('active')
        } else {
          items[i].classList.remove('active')
        }
      }
    }
  }
  navBar.init()
})()
