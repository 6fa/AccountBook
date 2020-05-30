
const routerList = [
  {
    path: '/',
    component: () => {
      import('../views/home/home').then(({ default: fn }) => {
        fn()
      })
    }
  },
  {
    path: '/record',
    component: () => {
      import('../views/record/record').then(({ default: fn }) => {
        fn()
      })
    }
  },
  {
    path: '/bill',
    component: () => {
      import('../views/bill/bill').then(({ default: fn }) => {
        fn()
      })
    }
  },
  {
    path: '/setting',
    component: () => {
      import('../views/setting/setting').then(({ default: fn }) => {
        fn()
      })
    }
  }
]

export default routerList
