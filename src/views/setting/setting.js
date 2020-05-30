import template from './setting.html'
import './setting.css'
import store from '../../utils/store'
import config from '../../assets/config'

export default function () {
  const setting = {
    init: function () {
      this.page = document.querySelector('#page-view')
      this.expIconList = store.getItem('expIconList') ? store.getItem('expIconList') : config.expTypeIcon
      this.inIconList = store.getItem('inIconList') ? store.getItem('inIconList') : config.inTypeIcon
      // 新增类型的icon
      this.newTypeIcon = ''
      // 新增类型的text
      this.newTypeText = ''

      let type
      if (config.mode === 'hash') {
        type = window.location.hash.split('?')[1]
      } else if (config.mode === 'history') {
        type = window.location.search.split('?')[1]
      }
      // type为‘exp’：支出，type为‘in’：收入
      this.type = type.split('=')[1]

      // 处理模板
      this.setTemplate()
      // 监听增加类别
      this.addType()
      // 监听提交类别
      this.subimitType()
      // 监听删除类别
      this.deleteType()
      // 监听返回
      this.back()
    },
    setTemplate: function () {
      let title
      let tpl = ''
      let iconList
      if (this.type === 'exp') {
        iconList = this.expIconList
        title = '支出类型'
      } else if (this.type === 'in') {
        iconList = this.inIconList
        title = '收入类型'
      }
      for (let i = 0; i < iconList.length; i++) {
        tpl += `<div class="set-del-item" data-index=${i}>
          <div class="set-del-item-icon">
            <i class="iconfont">${iconList[i].code}</i>
          </div>
          <div class="set-del-item-text">${iconList[i].desc}</div>
          <div class="set-del-item-ctrl">
            <span>删除</span>
          </div>
        </div>`
      }
      const myTemplate = template.replace('{{delTemplate}}', tpl).replace('{{title}}', title)
      this.page.innerHTML = myTemplate
    },
    addType: function () {
      const add = document.querySelector('.set-add')
      this.mask = document.querySelector('.set-addbox-mask')
      const iconContainer = this.mask.querySelector('.set-addbox-iconlist')
      add.addEventListener('click', () => {
        this.mask.classList.remove('hidden')
      })
      // 当没有点击图标时，默认图标为&#xe66f;
      this.newTypeIcon = '&#xe66f;'
      document.querySelector('.set-addbox-icon').classList.add('active')
      iconContainer.addEventListener('click', (e) => {
        const currentIcon = e.target
        this.removeIconActive()
        if (currentIcon.tagName === 'I') {
          this.newTypeIcon = currentIcon.innerHTML
          currentIcon.parentNode.classList.add('active')
        }
      })
    },
    removeIconActive: function () {
      const iconArr = document.querySelectorAll('.set-addbox-icon')
      for (let i = 0; i < iconArr.length; i++) {
        if (iconArr[i].classList.contains('active')) {
          iconArr[i].classList.remove('active')
        }
      }
    },
    subimitType: function () {
      const cancel = this.mask.querySelector('.set-addbox-cancel')
      const submit = this.mask.querySelector('.set-addbox-done')
      const inputEl = this.mask.querySelector('.set-addbox-input input')

      cancel.addEventListener('click', () => {
        this.close()
      })
      submit.addEventListener('click', () => {
        if (inputEl.value === '') {
          inputEl.classList.add('warn')
          return
        } else {
          inputEl.classList.remove('warn')
        }
        this.newTypeText = inputEl.value
        const newType = {
          code: this.newTypeIcon,
          desc: this.newTypeText
        }
        if (this.type === 'exp') {
          for (let i = 0; i < this.expIconList.length; i++) {
            if (newType.desc === this.expIconList[i].desc) {
              inputEl.classList.add('warn')
              inputEl.value = '类型已存在'
              return
            } else {
              inputEl.classList.remove('warn')
            }
          }
          this.expIconList.unshift(newType)
          store.setItem('expIconList', this.expIconList)
        } else if (this.type === 'in') {
          this.inIconList.unshift(newType)
          store.setItem('inIconList', this.inIconList)
        }

        // window.$router.go(0)
        this.init()
      })
    },
    close: function () {
      const inputEl = this.mask.querySelector('.set-addbox-input input')
      this.removeIconActive()
      inputEl.value = ''
      inputEl.classList.remove('warn')
      this.mask.classList.add('hidden')
    },
    deleteType: function () {
      const delContainer = document.querySelector('.set-del')
      delContainer.addEventListener('click', (e) => {
        const target = e.target
        const parent = target.parentNode.parentNode
        if (target.tagName === 'SPAN') {
          const index = parent.dataset.index
          if (this.type === 'exp') {
            this.expIconList = this.deleteItem(this.expIconList, index)
            store.setItem('expIconList', this.expIconList)
          } else if (this.type === 'in') {
            this.inIconList = this.deleteItem(this.inIconList, index)
            store.setItem('inIconList', this.inIconList)
          }
          // window.$router.go(0)
          this.init()
        }
      })
    },
    deleteItem: function (arr, index) {
      let tempArr = []
      tempArr = arr.filter((item, ind) => {
        return ind !== Number(index)
      })
      return tempArr
    },
    back: function () {
      const backEl = document.querySelector('.set-back')
      backEl.addEventListener('click', () => {
        window.$router.go(-1)
      })
    }
  }
  setting.init()
}
